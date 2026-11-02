import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/InputComponent"
import { Button } from "../components/ui/Button"
import axios from "axios";
import { BACKEND_URI } from "../config";

export const Signup = () => {

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const usernameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    async function signup() {
        setError(null);
        setLoading(true);

        try {
            const username = usernameRef.current?.value;
            const password = passwordRef.current?.value;
            const email = emailRef.current?.value;
            await axios.post(`${BACKEND_URI}/api/v1/user/signup`, {
                username,
                password,
                email

            })
            navigate("/signin")
            alert("You have Signed Up!!!!")

        } catch (e: any) {
            const errorMsg = e.response?.data?.message || "Signup failed. Please check your input"
            setError(errorMsg);
            console.error("Signup error", e);
        } finally {
            setLoading(false);
        }
    }


    return <div className="min-h-screen w-full bg-gray-200 dark:bg-slate-950 flex justify-center items-center p-4 transition-colors">
        <div className="bg-white dark:bg-slate-800 dark:border-slate-700 rounded border min-h-80 w-full max-w-xs sm:w-72 flex justify-center items-center p-4 transition-colors">
            <div className="w-full">
                <Input reference={usernameRef} placeholder="Username" type="text" />
                <Input reference={passwordRef} placeholder="Password" type="password" />
                <Input reference={emailRef} placeholder="Email" type="email" />

                {error && (
                    <div className="text-red-500 text-md text-center rounded px-2 pt-2">
                        {error}
                    </div>
                )}

                <div className="flex justify-center items-center rounded pt-4">
                    <Button onClick={signup} loading={loading} variant="primary" size="lg" text="Signup" />
                </div>

                <p className="text-center text-xs text-gray-500 dark:text-slate-400 pt-3">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>

    </div>
};