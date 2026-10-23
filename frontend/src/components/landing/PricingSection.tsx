import { useState } from "react";
import { CheckIcon, Loader2Icon, ShieldCheckIcon, SparklesIcon, ZapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import api from "@/configs/axios";
import { CREDITS_PER_GENERATION, PLANS, type Plan } from "@/lib/plans";

export default function PricingSection() {
    const { data: session } = authClient.useSession();
    const navigate = useNavigate();
    // Guards against double clicks opening two checkouts
    const [pendingPlan, setPendingPlan] = useState<Plan["id"] | null>(null);

    const handlePurchase = async (plan: Plan) => {
        if (pendingPlan) return;
        if (!session?.user) {
            toast.error("Sign in to buy credits");
            navigate("/auth/sign-in");
            return;
        }
        setPendingPlan(plan.id);
        try {
            const { data } = await api.post("/api/user/purchase-credits", { planId: plan.id });
            if (!data.payment_link) throw new Error("Failed to get payment link");
            window.location.href = data.payment_link;
        } catch (error: any) {
            toast.error(error?.response?.data?.message || error.message || "Failed to start checkout. Please try again.");
            setPendingPlan(null);
        }
    };

    return (
        <section id="pricing" className="flex flex-col lg:flex-row gap-10 xl:gap-14 items-start justify-between max-w-7xl mx-auto mt-32 px-4 sm:px-6 scroll-mt-28">
            <div className="w-full lg:max-w-xs xl:max-w-sm shrink-0">
                <h3 className="font-domine text-3xl text-slate-100">OUR PRICING</h3>
                <p className="mt-4 text-sm leading-6 text-slate-400">
                    Buy credits once and use them whenever you like. Every new website or change costs {CREDITS_PER_GENERATION} credits, and new accounts start with 20 free.
                </p>
                <div className="mt-8 space-y-4">
                    <div className="flex items-center gap-3 text-slate-300">
                        <div className="p-2.5 border border-white/10 bg-white/[0.03] rounded-md">
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <p className="text-sm">Credits never expire</p>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                        <div className="p-2.5 border border-white/10 bg-white/[0.03] rounded-md">
                            <ZapIcon className="w-5 h-5" />
                        </div>
                        <p className="text-sm">Failed generations are refunded automatically</p>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300">
                        <div className="p-2.5 border border-white/10 bg-white/[0.03] rounded-md">
                            <ShieldCheckIcon className="w-5 h-5" />
                        </div>
                        <p className="text-sm">Secure checkout by Stripe</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-6 xl:gap-10 w-full lg:w-auto">
                {PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`w-full max-w-80 sm:w-80 rounded-xl p-6 pb-10 transition-all ${
                            plan.highlighted
                                ? "bg-white/[0.06] text-white ring-1 ring-[#a5d8ff]/30 shadow-[0_0_80px_-30px_rgba(56,189,248,0.45)]"
                                : "bg-white/[0.02] text-slate-100 border border-white/10"
                        }`}
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <h3 className="text-lg font-semibold">{plan.name}</h3>
                            <p className="text-sm mt-1 text-slate-400">{plan.description}</p>
                            <p className="mt-4 text-2xl font-semibold">
                                ${plan.price} <span className="text-sm font-normal text-slate-400">one-time</span>
                            </p>
                            <button
                                onClick={() => handlePurchase(plan)}
                                disabled={pendingPlan !== null}
                                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-70 ${
                                    plan.highlighted ? "bg-[#f6f8ff] text-black hover:bg-white" : "border border-white/15 text-slate-100 hover:bg-white/10"
                                }`}
                            >
                                {pendingPlan === plan.id && <Loader2Icon className="h-4 w-4 animate-spin" />}
                                Buy {plan.credits} credits
                            </button>
                        </div>
                        <div className="mt-3 flex flex-col">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-center gap-2.5 border-b border-white/10 py-3 text-sm">
                                    <div className={`rounded-full p-1 shrink-0 ${plan.highlighted ? "bg-[#a5d8ff]/20" : "bg-white/10"}`}>
                                        <CheckIcon className={`w-3 h-3 ${plan.highlighted ? "text-[#a5d8ff]" : "text-white"}`} strokeWidth={2.5} />
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
