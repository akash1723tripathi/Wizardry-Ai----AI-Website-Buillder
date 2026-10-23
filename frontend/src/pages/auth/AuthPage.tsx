import { useState, useEffect } from "react";
import { CheckIcon, HomeIcon, LockIcon, MailIcon, UserIcon, Loader2 } from "lucide-react";
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
            // Better Auth returns errors rather than throwing, so check the result
            const { error } = await authClient.signIn.social({
                provider,
                callbackURL: window.location.origin + "/projects",
            });
            if (error) {
                toast.error(
                    error.code === "PROVIDER_NOT_FOUND"
                        ? `Sign in with ${provider} isn't set up yet. Use your email and password instead.`
                        : error.message || `Couldn't sign in with ${provider}. Try again.`
                );
            }
        } catch (err: any) {
            toast.error(err?.message || `Couldn't sign in with ${provider}. Try again.`);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            toast.error("Please enter your email id to reset your password.");
            return;
        }
        try {
            const { error } = await authClient.requestPasswordReset({
                email,
                redirectTo: window.location.origin + "/auth/reset-password",
            });
            if (error) {
                toast.error(
                    error.code === "RESET_PASSWORD_ISNT_ENABLED"
                        ? "Password reset isn't available yet. Contact support to regain access."
                        : error.message || "Failed to send reset link."
                );
            } else {
                toast.success("Password reset instructions sent to your email!");
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to send reset link.");
        }
    };

    return (
        <div className="min-h-screen bg-black text-slate-100 font-inter antialiased flex">
            {/* Art panel: 42vw, pinned while the form column scrolls on short screens */}
            <aside className="relative hidden md:block md:w-[42vw] shrink-0 h-screen sticky top-0 overflow-hidden">
                <img
                    src="/assets/login-page.jpg"
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/40" />
                <Link
                    to="/"
                    aria-label="Back to home"
                    title="Back to home"
                    className="absolute left-6 top-6 grid h-14 w-14 place-items-center rounded-full border border-white/10 bg-black/70 text-white backdrop-blur-md transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5d8ff]"
                >
                    <HomeIcon className="h-6 w-6" />
                </Link>
            </aside>

            {/* Form column */}
            <main className="relative flex-1 flex flex-col items-center justify-center px-6 py-12">
                <Link
                    to="/"
                    aria-label="Back to home"
                    className="md:hidden absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/5 text-white"
                >
                    <HomeIcon className="h-5 w-5" />
                </Link>
                    <div className="md:w-96 w-full flex flex-col items-center justify-center">
                        <h2 className="text-4xl text-white font-medium tracking-tight">
                            {isSignUp ? "Sign up" : "Sign in"}
                        </h2>
                        <p className="text-sm text-slate-400 mt-3 text-center">
                            {isSignUp
                                ? "Create an account to start building websites"
                                : "Welcome back! Please sign in to continue"}
                        </p>

                        {/* Social Buttons */}
                        <div className="w-full mt-8 mb-2">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("google")}
                                className="w-full flex items-center justify-center gap-3 rounded-full py-2.5 px-4 hover:bg-white/10 focus:border-white/40 border border-white/15 bg-white/[0.03] transition text-sm font-medium text-slate-100"
                                title="Continue with Google"
                            >
                                <img
                                    src="/assets/google.svg"
                                    alt="Google"
                                    className="w-5 h-5 object-contain"
                                />
                                <span>{isSignUp ? "Sign up with Google" : "Continue with Google"}</span>
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 w-full my-5">
                            <div className="w-full h-px bg-white/10"></div>
                            <p className="w-full text-nowrap text-sm text-slate-400 text-center">
                                {isSignUp ? "or sign up with email" : "or sign in with email"}
                            </p>
                            <div className="w-full h-px bg-white/10"></div>
                        </div>

                        {/* Credentials Form */}
                        <form onSubmit={handleSubmit} className="w-full flex flex-col">
                            {isSignUp && (
                                <div className="flex items-center w-full bg-white/[0.03] border border-white/15 focus-within:border-[#a5d8ff]/60 h-12 rounded-full overflow-hidden pl-5 pr-4 gap-2 mb-4 transition">
                                    <UserIcon size={18} className="text-slate-400 shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-transparent placeholder-slate-500 outline-none text-sm w-full h-full text-slate-100"
                                        required
                                    />
                                </div>
                            )}

                            <div className="flex items-center w-full bg-white/[0.03] border border-white/15 focus-within:border-[#a5d8ff]/60 h-12 rounded-full overflow-hidden pl-5 pr-4 gap-2 transition">
                                <MailIcon size={18} className="text-slate-400 shrink-0" />
                                <input
                                    type="email"
                                    placeholder="Email id"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-transparent placeholder-slate-500 outline-none text-sm w-full h-full text-slate-100"
                                    required
                                />
                            </div>

                            <div className="flex items-center mt-6 w-full bg-white/[0.03] border border-white/15 focus-within:border-[#a5d8ff]/60 h-12 rounded-full overflow-hidden pl-5 pr-4 gap-2 transition">
                                <LockIcon size={18} className="text-slate-400 shrink-0" />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-transparent placeholder-slate-500 outline-none text-sm w-full h-full text-slate-100"
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
                                    <span className="w-4.5 h-4.5 border border-white/30 rounded relative flex items-center justify-center peer-checked:border-[#f6f8ff] peer-checked:bg-[#f6f8ff] transition">
                                        {rememberMe && <CheckIcon className="text-black w-3 h-3" />}
                                    </span>
                                    <span className="text-slate-400 select-none text-sm">Remember me</span>
                                </label>
                                {!isSignUp && (
                                    <button
                                        type="button"
                                        onClick={handleForgotPassword}
                                        className="text-slate-200 underline text-sm hover:text-white transition"
                                    >
                                        Forgot password?
                                    </button>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-8 w-full h-11 rounded-full text-black bg-[#f6f8ff] hover:bg-white transition flex items-center justify-center font-medium disabled:opacity-50"
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
                            <p className="text-slate-400 mt-4 text-sm text-center">
                                {isSignUp ? (
                                    <>
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => setIsSignUp(false)}
                                            className="text-slate-100 underline font-medium hover:text-white transition"
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
                                            className="text-slate-100 underline font-medium hover:text-white transition"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                )}
                            </p>
                        </form>
                    </div>
            </main>
        </div>
    );
}
