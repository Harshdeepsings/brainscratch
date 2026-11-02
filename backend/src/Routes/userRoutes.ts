import { Router } from "express";
import { Response } from "express";
import { UserSchema }  from "../userValidation";
import {UserModel, ContentModel, } from "../db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserMiddleware, AuthRequest, tokenBlacklist } from "../middleware";
import rateLimit from "express-rate-limit";

const userRoutes = Router();

// Rate limit: max 20 auth attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: "Too many attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false
});

// Apply rate limiting specifically to authentication endpoints
userRoutes.post("/signup", authLimiter, async function(req: AuthRequest, res: Response){
    
    const ParsedDataWithSuccess = UserSchema.safeParse(req.body);

        if(!ParsedDataWithSuccess.success){
            res.status(400).json({
                message: "incorrect format",
                error: ParsedDataWithSuccess.error
            })
            return
        }

        const { username, password, email } = ParsedDataWithSuccess.data;

        const hashedpassword = await bcrypt.hash(password, 10);
        try{
        await UserModel.create({
            username: username,
            password: hashedpassword,
            email: email
        })

        res.status(200).json({
            message: "You are signed up"
        })
    } catch(e: any){

        if (e.code === 11000) {
            return res.status(409).json({
                message: "Username or email already in use"
            });
        }

        res.status(500).json({
            message: "Something went wrong"
        })
    }

});


userRoutes.post("/signin", authLimiter, async function(req: AuthRequest, res: Response){
    const username = req.body.username;
    const password = req.body.password;

    // Strict type check to prevent injection via non-string values
    if (!username || typeof username !== "string" || !password || typeof password !== "string") {
        return res.status(400).json({ 
            message: "Username and password are required and must be strings" 
        });
    }

    try{
        const user = await UserModel.findOne({
            username: username
        });

        if(!user){
            res.status(401).json({
                message: "invalid credentials"
            })
            return
        }
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (user && passwordMatch){
            const token = jwt.sign({
                id: user._id.toString()
            }, process.env.JWT_SECRET as string, { expiresIn: "7d" });  // Token expires in 7 days

            res.json({
                token
            })

        }else{
            res.status(401).json({
                message: "incorrect credentials"
            })
        }
    }catch(e){
        res.status(500).json({
            message: "something went wrong"
        });
    }

});

userRoutes.get("/content", UserMiddleware, async (req: AuthRequest , res: Response)=>{

    if( !req.userId ){
        res.status(401).json({
            message: "Unauthorized"
        });
        return;
    }
    try{
        const userId = req?.userId;
        const content = await ContentModel.find({
            userId: userId,
        }).populate("userId", "username").populate("tags", "title")

        res.json({
            content
        })
    }catch(e){
        res.status(500).json({
            message: "Internal server error"
        })
    }
    
     
});


userRoutes.post("/logout", UserMiddleware, (req: AuthRequest, res: Response) => {
    const token = req.headers["authorization"] as string;

    tokenBlacklist.add(token);

    res.status(200).json({
        message: "Logged out successfully"
    });
});

export default userRoutes;