import { CheckIcon, ShieldCheckIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import api from "@/configs/axios";

interface PricingItem {
    title: string;
    description: string;
    mostPopular?: boolean;
    price: string;
    buttonText: string;
    planId: string;
    features: string[];
}

export default function PricingSection() {
    const { data: session } = authClient.useSession();

    const data: PricingItem[] = [
        {
            title: "Pro Plan",
            description: "Perfect for medium business and personal use",
            price: "$49",
            buttonText: "Get Started",
            planId: "Pro",
            features: [
                "Enjoy unlimited AI task usage",
                "Integrate API for smooth workflow",
                "Create text and image outputs",
                "Get priority chat and email help",
                "View detailed analytics and reports",
            ],
        },
        {
            title: "Custom Plan",
            mostPopular: true,
            description: "Perfect for organizations and personal use",
            price: "$149",
            buttonText: "Contact Sales",
            planId: "Enterprise",
            features: [
                "Build fully customized AI models",
                "Manage teams with shared access",
                "Get a dedicated account manager",
                "Integrate private APIs securely",
                "Guaranteed uptime with support",
                "Customize pricing and features",
            ],
        },
    ];

    const handleAction = async (item: PricingItem) => {
        if (item.buttonText === "Contact Sales") {
            window.location.href = "mailto:sales@wizardry.ai?subject=Inquiry%20about%20Custom%20Plan";
            return;
        }

        try {
            if (!session?.user) {
                toast.error("Please login to purchase a plan");
                window.location.href = "/auth/sign-in";
                return;
            }
            const { data } = await api.post("/api/user/purchase-credits", { planId: item.planId });
            if (data.payment_link) {
                window.location.href = data.payment_link;
            } else {
                toast.error("Failed to get payment link");
            }
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Failed to initiate purchase. Please try again.");
        }
    };

    return (
        <section id="pricing" className="flex flex-col lg:flex-row gap-10 xl:gap-14 items-start justify-between max-w-7xl mx-auto mt-32 px-4 sm:px-6">
            <div className="w-full lg:max-w-xs xl:max-w-sm shrink-0">
                <h3 className="font-domine text-3xl">OUR PRICING</h3>
                <p className="mt-4 text-sm leading-6 text-gray-500">
                    Choose a plan that fits your goals and scale. Every plan includes powerful AI features, fast performance, and all the tools you need without limits.
                </p>
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="p-2.5 border border-gray-200 rounded-md">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <p className="text-sm">Advanced AI features included</p>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="p-2.5 border border-gray-200 rounded-md">
                            <ZapIcon className="w-5 h-5" />
                        </div>
                        <p className="text-sm">Lightning fast load speed always</p>
                    </div>
                    <div className="flex items-center gap-3 text-gray-500">
                        <div className="p-2.5 border border-gray-200 rounded-md">
                            <ShieldCheckIcon className="w-5 h-5" />
                        </div>
                        <p className="text-sm">Clear honest usage with limits</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-6 xl:gap-10 w-full lg:w-auto">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className={`group w-full max-w-80 sm:w-80 rounded-xl p-6 pb-10 transition-all ${
                            item.mostPopular
                                ? "bg-gray-800 text-white shadow-xl ring-1 ring-gray-900/10"
                                : "bg-white border border-slate-200 shadow-sm"
                        }`}
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <h3 className="text-lg font-semibold">{item.title}</h3>
                            <p className={`text-sm mt-1 ${item.mostPopular ? "text-gray-400" : "text-gray-500"}`}>{item.description}</p>
                            <p className="mt-4 text-2xl font-semibold">
                                {item.price} <span className={`text-sm font-normal ${item.mostPopular ? "text-gray-400" : "text-gray-500"}`}>/month</span>
                            </p>
                            <button
                                onClick={() => handleAction(item)}
                                className={`mt-4 w-full rounded-lg bg-gray-100 py-2.5 text-sm font-medium text-gray-800 transition ${
                                    item.mostPopular ? "hover:opacity-90" : "hover:bg-gray-200/70"
                                }`}
                            >
                                {item.buttonText}
                            </button>
                        </div>
                        <div className="mt-3 flex flex-col">
                            {item.features.map((feature, fIndex) => (
                                <div
                                    key={fIndex}
                                    className={`flex items-center gap-2.5 border-b py-3 text-sm ${
                                        item.mostPopular ? "border-gray-700" : "border-gray-200"
                                    }`}
                                >
                                    <div className={`rounded-full p-1 shrink-0 ${item.mostPopular ? "bg-white/10" : "bg-gray-800"}`}>
                                        <CheckIcon className="w-3 h-3 text-white" strokeWidth={2.5} />
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
