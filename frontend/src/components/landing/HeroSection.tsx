import { Loader2Icon, SparklesIcon, TrendingUpIcon, UploadCloudIcon } from "lucide-react";
import Marquee from "react-fast-marquee";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import api from "@/configs/axios";
import { useNavigate } from "react-router-dom";
import GradientASCII from "@/components/backgrounds/GradientASCII";

interface Prompt {
    label: string;
    prompt: string;
}

export default function HeroSection() {
    const [prompt, setPrompt] = useState("");
    const [selected, setSelected] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [textIndex, setTextIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [deleting, setDeleting] = useState(false);

    const { data: session } = authClient.useSession();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!session?.user) {
                setLoading(false);
                return toast.error("Please sign in to create a project");
            } else if (!prompt.trim()) {
                setLoading(false);
                return toast.error("Please provide a valid prompt");
            }
            const { data } = await api.post("api/user/project", { initial_prompt: prompt });
            setLoading(false);
            navigate(`/projects/${data.projectId}`);
        } catch (error: any) {
            setLoading(false);
            toast.error(error?.response?.data?.message || "Failed to create project");
            console.log(error);
        }
    };

    const placeholders = [
        "portfolio website...",
        "e-commerce store...",
        "business landing page...",
        "personal blog...",
        "startup website...",
    ];

    const prompts: Prompt[] = [
        {
            label: "Portfolio Website",
            prompt: "Create a modern portfolio website to showcase my skills, projects, experience, and personal brand professionally",
        },
        {
            label: "E-commerce Website",
            prompt: "Build a fast, secure e-commerce website with product listings, cart system, payments, and admin dashboard",
        },
        {
            label: "Blog",
            prompt: "Create a clean, SEO-optimized blog website for writing articles, managing content, and growing audience online",
        },
        {
            label: "Landing Page",
            prompt: "Design a high-conversion landing page with strong hero section, CTA buttons, and lead capture form",
        },
        {
            label: "Resume Website",
            prompt: "Generate a professional resume website with skills, experience, education, projects, and downloadable CV section",
        },
        {
            label: "Personal Website",
            prompt: "Create a personal branding website with about section, social links, blogs, and contact form",
        },
        {
            label: "Business Website",
            prompt: "Build a professional business website with services, testimonials, pricing section, and customer inquiry form",
        },
        {
            label: "Marketing Website",
            prompt: "Create a marketing-focused website optimized for conversions, analytics tracking, funnels, and campaign integrations",
        },
        {
            label: "Educational Website",
            prompt: "Build an educational website with courses, student dashboard, lesson pages, progress tracking, and quizzes",
        },
    ];

    useEffect(() => {
        if (prompt) return;

        const currentWord = placeholders[textIndex];

        if (!deleting && charIndex === currentWord.length) {
            const timeout = setTimeout(() => setDeleting(true), 2000);
            return () => clearTimeout(timeout);
        }

        if (deleting && charIndex === 0) {
            setDeleting(false);
            setTextIndex((prev) => (prev + 1) % placeholders.length);
            return;
        }

        const timeout = setTimeout(() => {
            setCharIndex((prev) => prev + (deleting ? -1 : 1));
        }, 50);

        return () => clearTimeout(timeout);
    }, [charIndex, deleting, textIndex, prompt]);

    const animatedPlaceholder = placeholders[textIndex].substring(0, charIndex);

    return (
        <section id="home" className="relative -mt-[72px] flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-4 pb-32 pt-[72px]">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                <GradientASCII
                    colors={["#1e3fd8", "#f6f8ff", "#a5d8ff", "#38bdf8"]}
                    shape="horizon"
                    characters=" =+xX0S8#@"
                    cellSize={18}
                    density={0.8}
                />
                {/* Black wash over the light so the navbar and hero copy stay readable */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/45 to-black/20" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(0,0,0,0.45),transparent_75%)]" />
                {/* Fades the light into the black page below */}
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-black" />
            </div>

            <div className="relative z-10 flex w-full flex-col items-center">
                <div className="flex items-center gap-2 text-slate-100 mt-12 text-shadow-hero">
                    <TrendingUpIcon className="w-4.5 h-4.5" />
                    <span>Trusted by 2,000+ founders</span>
                </div>

                <h1 className="text-center text-4xl sm:text-5xl md:text-[60px] lg:text-[64px] md:leading-[80px] leading-[54px] font-semibold max-w-4xl m-2 text-white md:whitespace-nowrap text-shadow-hero">
                    Build custom apps with AI
                </h1>

                <p className="text-center text-base text-slate-100 max-w-md mt-2 text-shadow-hero">
                    &ldquo;No code. No design skills. Just describe your idea and launch instantly.&rdquo;
                </p>

                <form onSubmit={handleSubmit} className="focus-within:ring-2 focus-within:ring-[#a5d8ff]/50 border border-white/15 bg-black/60 backdrop-blur-md shadow-[0_0_60px_-15px_rgba(56,189,248,0.35)] rounded-xl max-w-2xl w-full mt-8">
                    <textarea
                        className="w-full resize-none p-4 outline-none text-slate-100 placeholder:text-slate-500 bg-transparent rounded-xl"
                        placeholder={`Create a ${animatedPlaceholder}`}
                        aria-label="Describe the website you want to build"
                        rows={3}
                        minLength={10}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        required
                    />

                    <div className="flex items-center justify-between p-4 pt-0">
                        <label htmlFor="hero-file" aria-label="Upload a file" className="border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition p-1.5 rounded-md cursor-pointer">
                            <input type="file" id="hero-file" hidden />
                            <UploadCloudIcon className="w-4.5 h-4.5" />
                        </label>

                        <button
                            disabled={loading}
                            className={`flex items-center bg-[#f6f8ff] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a5d8ff] focus-visible:ring-offset-2 focus-visible:ring-offset-black transition px-4 h-9 text-black font-medium rounded-lg ${loading ? "cursor-not-allowed opacity-80" : ""}`}
                        >
                            {loading ? (
                                <Loader2Icon className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <SparklesIcon className="w-4 h-4" />
                                    <span className="ml-2">Create</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Mask instead of the marquee's colour gradient so the edges fade over the moving background */}
                <Marquee
                    speed={30}
                    pauseOnHover
                    className="max-w-2xl w-full mt-3 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]"
                >
                    {prompts.map((item) => {
                        const isSelected = selected === item.label;

                        return (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setPrompt(item.prompt);
                                    setSelected(item.label);
                                }}
                                className={`px-4 py-1.5 mx-2 border rounded-full backdrop-blur-sm transition
                                    ${isSelected
                                        ? "bg-white/20 text-white border-white/30 cursor-not-allowed"
                                        : "text-slate-300 bg-black/50 border-white/15 hover:bg-white/10 hover:text-white"
                                    }
                                `}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </Marquee>
            </div>
        </section>
    );
}
