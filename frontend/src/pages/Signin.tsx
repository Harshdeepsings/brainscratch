import { Input } from "../components/InputComponent"
import { Button } from "../components/ui/Button"
import axios from "axios";
import { BACKEND_URI } from "../config";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const Signin = () => {
    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const navigate = useNavigate();    
    
        async function signin(){
            const username = usernameRef.current?.value;
            const password = passwordRef.current?.value;
            setLoading(true); 
            setError(null);

            try{
            
            const response = await axios.post(`${BACKEND_URI}/api/v1/user/signin`, {
                    username,
                    password,
                    
                
            })
            const jwt = response.data.token;
            localStorage.setItem("token", jwt);
            navigate("/dashboard")
        }catch(e: any){
            setError(e.response?.data?.message || "Incorrect credentials");
        } finally {
            setLoading(false);
        }
    }
        
    
    
    
    return <div className="min-h-screen w-full bg-gray-200 dark:bg-slate-950 flex justify-center items-center p-4 transition-colors">
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded border min-h-80 w-full max-w-xs sm:w-72 flex justify-center items-center p-4 transition-colors">
            <div className="w-full">
                <Input reference = {usernameRef} placeholder="Username" type="text"/>
                <Input reference = {passwordRef} placeholder="Password" type="password"/>

                {error && (<div className="text-red-500 text-sm text-center pt-2">
                    {error}
                </div>)}
                

                <div className="flex justify-center items-center rounded pt-4">
                    <Button onClick={signin} loading={loading} variant="primary" size="lg" text="Signin" />
                </div>

                <p className="text-center text-xs text-gray-500 dark:text-slate-400 pt-3">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
            
    </div>
};