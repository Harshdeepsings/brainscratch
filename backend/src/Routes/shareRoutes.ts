import { Router } from "express";
import { Response } from "express";
import { UserMiddleware, AuthRequest } from "../middleware";
import {UserModel, ContentModel, LinkModel } from "../db";
import { random } from "../utils";

const shareRoutes = Router();

shareRoutes.post("/share", UserMiddleware, async (req: AuthRequest, res: Response) => {
    const share = req.body.share;

    if (!req.userId) {
        return res.status(401).json({
            message: "Unauthorized"
        });
    }

    try{

        if(share){
            const linkExists = await LinkModel.findOne({
                userId: req.userId
            });
            if (linkExists){
                res.json({
                    hash: linkExists.hash,
                    message: linkExists.hash
                })
                return;
            }
            
            const newhash = random(15);
            await LinkModel.create({
                userId: req.userId,
                hash: newhash
            })
        

            res.json({
                hash: newhash
            });
        }else{
            await LinkModel.deleteOne({ userId: req.userId });
                return res.json({
                    message: "Share link disabled"
                });
            };
    
    }catch(e){
        res.status(500).json({
            message: "Internal server error"
        });
    }
});

shareRoutes.get("/:sharelink", async (req: AuthRequest, res: Response) => {
    const hash = req.params.sharelink;

    try{
        if(typeof hash !== "string" || !hash.trim()){
            return res.status(400).json({
                message: "Invalid share link"
            });
        }

        const link = await LinkModel.findOne({
            hash: hash
        })

        if(!link){
            return res.status(404).json({
                message: "Share link not found"
            });
        }

        const content = await ContentModel.find({
            userId: link.userId
        }).populate("tags", "title");

        const user = await UserModel.findOne({
            _id: link.userId
        })

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        res.json({
            username: user.username,
            content: content
        })
    }catch(e){
        res.status(500).json({
            message: "Internal server error"
        })
    }

});


export default shareRoutes;