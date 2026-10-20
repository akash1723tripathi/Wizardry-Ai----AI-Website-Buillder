import { useState, useEffect } from "react";
import { CheckIcon, LockIcon, MailIcon, UserIcon, Loader2 } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function AuthPage() {
    const { pathname } = useParams<{ pathname?: string }>();
    const navigate = useNavigate();
    const { data: session } = authClient.useSession();

    const [isSignUp, setIsSignUp] = useState<boolean>(
        pathname === "sign-up" || pathname === "signup"
    );
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pathname === "sign-up" || pathname === "signup") {
            setIsSignUp(true);
        } else if (pathname === "sign-in" || pathname === "signin" || pathname === "login") {
            setIsSignUp(false);
        }
    }, [pathname]);

    useEffect(() => {
        if (session?.user) {
            navigate("/projects");
        }
    }, [session, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await authClient.signUp.email({
                    email,
                    password,
                    name: name || email.split("@")[0],
                });

                if (error) {
                    toast.error(error.message || "Failed to create account");
                } else {
                    toast.success("Account created successfully!");
                    navigate("/projects");
                }
            } else {
                const { error } = await authClient.signIn.email({
                    email,
                    password,
                    rememberMe,
                });

                if (error) {
                    toast.error(error.message || "Failed to sign in. Please check your credentials.");
                } else {
                    toast.success("Welcome back!");
                    navigate("/projects");
                }
            }
        } catch (err: any) {
            toast.error(err?.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (provider: "google" | "x" | "facebook") => {
        try {
            await (authClient.signIn as any).social({
                provider,
                callbackURL: window.location.origin + "/projects",
            });
        } catch (err: any) {
            toast.error(`Sign in with ${provider} is not configured on this server.`);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Please enter your email id to reset your password.");
            return;
        }
        try {
            if (typeof (authClient as any).forgetPassword === "function") {
                await (authClient as any).forgetPassword({
                    email,
                    redirectTo: window.location.origin + "/auth/reset-password",
                });
                toast.success("Password reset instructions sent to your email!");
            } else {
                toast.info("Password reset link will be sent to " + email);
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to send reset link.");
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900 font-inter antialiased flex items-center justify-center px-6 py-12">
            <div className="flex items-center justify-between w-full max-w-5xl gap-12 mx-auto">
                {/* Left side illustration matching Next.js template */}
                <div className="flex-1 hidden md:flex flex-col items-center justify-center">
                    <Link to="/" className="group block" title="Go back to home">
                        <img
                            className="max-h-[380px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                            src="/assets/login-page-image.png"
                            alt="Login illustration"
                        />
                    </Link>
                </div>

                {/* Right side login form */}
                <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="md:w-96 w-full flex flex-col items-center justify-center">
                        <h2 className="text-4xl text-gray-900 font-medium tracking-tight">
                            {isSignUp ? "Sign up" : "Sign in"}
                        </h2>
                        <p className="text-sm text-gray-500/90 mt-3 text-center">
                            {isSignUp
                                ? "Create an account to start building websites"
                                : "Welcome back! Please sign in to continue"}
                        </p>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-3 w-full gap-6 mt-10 mb-2">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("google")}
                                className="flex items-center justify-center rounded-full py-2.5 hover:bg-gray-50 focus:border-gray-300 border border-gray-200 transition"
                                title="Sign in with Google"
                            >
                                <img
                                    src="/assets/google.svg"
                                    alt="Google"
                                    className="w-5 h-5 object-contain"
                                />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("x")}
                                className="flex items-center justify-center rounded-full py-2.5 hover:bg-gray-50 focus:border-gray-300 border border-gray-200 transition"
                                title="Sign in with X"
                            >
                                <img
                                    src="/assets/x.svg"
                                    alt="X"
                                    className="w-5 h-5 object-contain"
                                />
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("facebook")}
                                className="flex items-center justify-center rounded-full py-2.5 hover:bg-gray-50 focus:border-gray-300 border border-gray-200 transition"
                                title="Sign in with Facebook"
                            >
                                <img
                                    src="/assets/facebook.svg"
                                    alt="Facebook"
                                    className="w-5 h-5 object-contain"
                                />
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 w-full my-5">
                            <div className="w-full h-px bg-gray-300/90"></div>
                            <p className="w-full text-nowrap text-sm text-gray-500/90 text-center">
                                {isSignUp ? "or sign up with email" : "or sign in with email"}
                            </p>
                            <div className="w-full h-px bg-gray-300/90"></div>
                        </div>

                        {/* Credentials Form */}
                        <form onSubmit={handleSubmit} className="w-full flex flex-col">
                            {isSignUp && (
                                <div className="flex items-center w-full bg-transparent border border-gray-200 focus-within:border-gray-400 h-12 rounded-full overflow-hidden pl-5 pr-4 gap-2 mb-4 transition">
                                    <UserIcon size={18} className="text-gray-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-transparent placeholder-gray-400 outline-none text-sm w-full h-full text-gray-900"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex items-center w-full bg-transparent border border-gray-200 focus-within:border-gray-400 h-12 rounded-full overflow-hidden pl-5 pr-4 gap-2 transition">
                                <MailIcon size={18} className="text-gray-400 shrink-0" />
                                <input
                                    type="email"
                                    placeholder="Email id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-transparent placeholder-gray-400 outline-none text-sm w-full h-full text-gray-900"
                                    required
                                />
                            </div>

                            <div className="flex items-center mt-6 w-full bg-transparent border border-gray-200 focus-within:border-gray-400 h-12 rounded-full overflow-hidden pl-5 pr-4 gap-2 transition">
                                <LockIcon size={18} className="text-gray-400 shrink-0" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-transparent placeholder-gray-400 outline-none text-sm w-full h-full text-gray-900"
                                    required
                                />
                            </div>

                            {/* Options */}
                            <div className="w-full flex items-center justify-between mt-8">
                                <label className="flex gap-2 items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="hidden peer"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="w-4.5 h-4.5 border border-slate-300 rounded relative flex items-center justify-center peer-checked:border-gray-800 peer-checked:bg-gray-800 transition">
                                        {rememberMe && <CheckIcon className="text-white w-3 h-3" />}
                                    </span>
                                    <span className="text-gray-500 select-none text-sm">Remember me</span>
                                </label>
                                {!isSignUp && (
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-gray-800 underline text-sm hover:text-black transition"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-8 w-full h-11 rounded-full text-white bg-gradient-to-b from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 transition flex items-center justify-center font-medium shadow-sm disabled:opacity-50"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isSignUp ? (
                                    "Sign Up"
                                ) : (
                                    "Login"
                                )}
                            </button>

                            {/* Toggle Sign in / Sign up */}
                            <p className="text-gray-500/90 mt-4 text-sm text-center">
                                {isSignUp ? (
                                    <>
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => setIsSignUp(false)}
                                            className="text-gray-800 underline font-medium hover:text-black transition"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Don’t have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => setIsSignUp(true)}
                                            className="text-gray-800 underline font-medium hover:text-black transition"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                )}
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}