import { useEffect, useRef, useState } from "react";

type Step = {
    title: string;
    description: string;
};

const leftSteps: Step[] = [
    {
        title: "AI Generates Smart Layouts",
        description:
            "Our AI Layout Generator creates a complete website structure with proper sections, spacing, and layout flow, ensuring a clean, modern, and high-conversion design from the start.",
    },
    {
        title: "Website Is Optimized & Published",
        description:
            "Performance Optimization is applied automatically to improve speed, structure, and responsiveness, so your website is fast, stable, and ready to publish across all devices.",
    },
];

const rightSteps: Step[] = [
    {
        title: "Describe Your Website Idea",
        description:
            "Explain your business type, target audience, and style in a few words. Our system understands your intent and prepares everything needed to build a website that fits your vision.",
    },
    {
        title: "Content Is Written Automatically",
        description:
            "The AI Content Writer generates headlines, section text, and call-to-actions tailored to your website goals, keeping everything clear, engaging, and optimized for user interaction.",
    },
];

export default function BuildProcess() {
    const timelineRef = useRef<HTMLDivElement>(null);
    const [activeHeight, setActiveHeight] = useState(0);

    useEffect(() => {
        let rafId: number | null = null;

        const handleScroll = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                if (!timelineRef.current) return;

                const rect = timelineRef.current.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                // Focal line in the viewport where the line meets the active step
                const triggerY = windowHeight * 0.55;

                // Center of the top node in viewport coordinates
                const topNodeY = rect.top + 8;
                const totalTrackLength = 768; // 240px * 3 segments + 16px * 3 node centers

                const progressPx = triggerY - topNodeY;
                const clamped = Math.min(Math.max(progressPx, 0), totalTrackLength);

                setActiveHeight(clamped);
            });
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (rafId !== null) cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <section id="process" className="flex flex-col items-center mt-32">
            <p className="font-domine text-slate-400 text-sm">Simple 4-Step Process</p>

            <h3 className="text-3xl max-w-sm text-slate-100 font-medium text-center mt-4">
                Build Your Website in Just Four Simple Steps
            </h3>

            <div className="flex flex-col md:flex-row mt-20 md:mt-32">
                <div>
                    {leftSteps.map((step, index) => (
                        <div key={index} className="max-w-lg h-60 md:mt-60">
                            <h3 className="text-xl underline decoration-white/30 underline-offset-4 font-domine text-slate-100">{step.title}</h3>
                            <p className="mt-6 text-slate-400 text-sm leading-6">{step.description}</p>
                        </div>
                    ))}
                </div>

                {/* self-start stops the flex row stretching this column, which ran the track past the last node */}
                <div ref={timelineRef} className="hidden md:flex flex-col items-center self-start relative mx-10 select-none">
                    {/* Continuous background line track */}
                    <div className="absolute top-2 bottom-2 w-0.5 bg-white/15 left-1/2 -translate-x-1/2 pointer-events-none" />

                    {/* Continuous smooth active line that flows through nodes */}
                    <div
                        className="absolute top-2 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)] left-1/2 -translate-x-1/2 pointer-events-none will-change-[height]"
                        style={{ height: `${activeHeight}px` }}
                    />

                    {/* Node 0 - Always active at step 1 */}
                    <div className="w-4 h-4 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] relative z-10 shrink-0" />

                    {/* Segment 0 spacer (240px) */}
                    <div className="w-0.5 h-60 shrink-0" />

                    {/* Node 1 - Activates seamlessly as line arrives */}
                    <div
                        className={`w-4 h-4 relative z-10 shrink-0 transition-colors duration-300 ${
                            activeHeight >= 256 ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/15"
                        }`}
                    />

                    {/* Segment 1 spacer (240px) */}
                    <div className="w-0.5 h-60 shrink-0" />

                    {/* Node 2 - Activates seamlessly as line arrives */}
                    <div
                        className={`w-4 h-4 relative z-10 shrink-0 transition-colors duration-300 ${
                            activeHeight >= 512 ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/15"
                        }`}
                    />

                    {/* Segment 2 spacer (240px) */}
                    <div className="w-0.5 h-60 shrink-0" />

                    {/* Node 3 - Activates seamlessly as line arrives */}
                    <div
                        className={`w-4 h-4 relative z-10 shrink-0 transition-colors duration-300 ${
                            activeHeight >= 768 ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-white/15"
                        }`}
                    />
                </div>

                <div>
                    {rightSteps.map((step, index) => (
                        <div key={index} className={`max-w-lg h-60 ${index === 0 ? "" : "md:mt-60"}`}>
                            <h3 className="text-xl underline decoration-white/30 underline-offset-4 font-domine text-slate-100">{step.title}</h3>
                            <p className="mt-6 text-slate-400 text-sm leading-6">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
