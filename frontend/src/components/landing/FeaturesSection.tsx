import { ChartSplineIcon, LayoutPanelTopIcon, NotebookPenIcon, type LucideIcon } from "lucide-react";

interface Feature {
    icon: LucideIcon;
    title: string;
    description: string;
}

export default function FeaturesSection() {
    const features: Feature[] = [
        {
            icon: LayoutPanelTopIcon,
            title: "AI Layout Generator",
            description: "Automatically creates a complete website layout from a single prompt.",
        },
        {
            icon: NotebookPenIcon,
            title: "AI Content Writer",
            description: "Generates high-quality headlines, text, and call-to-actions instantly.",
        },
        {
            icon: ChartSplineIcon,
            title: "Performance Optimization",
            description: "Ensures fast load speed, clean code, and high PageSpeed scores.",
        },
    ];

    return (
        <div id="features" className="grid border mt-32 sm:mt-42 rounded-lg max-w-6xl mx-auto border-white/10 grid-cols-1 divide-y divide-white/10 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
            {features.map((item, index) => (
                <div key={index} className="flex flex-col items-start gap-4 hover:bg-white/[0.03] transition duration-300 p-8 pb-14">
                    <div className="flex items-center gap-2 text-slate-100">
                        <item.icon className="w-5 h-5 text-[#a5d8ff]" />
                        <h2 className="font-medium text-base">{item.title}</h2>
                    </div>
                    <p className="text-slate-400 text-sm leading-6 max-w-72">{item.description}</p>
                </div>
            ))}
        </div>
    );
}
