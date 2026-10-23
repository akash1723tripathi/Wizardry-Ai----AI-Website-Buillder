// Display copy for the credit packs. Prices and credits must match backend/config/plans.ts,
// which is what checkout actually charges.
export const CREDITS_PER_GENERATION = 5;

export interface Plan {
    id: "Pro" | "Plus";
    name: string;
    price: number;
    credits: number;
    description: string;
    highlighted?: boolean;
    features: string[];
}

export const PLANS: Plan[] = [
    {
        id: "Pro",
        name: "Pro",
        price: 5,
        credits: 50,
        description: "For trying ideas and building a few sites",
        features: [
            "50 credits",
            "10 new websites or edits",
            "Publish to the community",
            "Download the HTML of every site",
        ],
    },
    {
        id: "Plus",
        name: "Plus",
        price: 49,
        credits: 500,
        highlighted: true,
        description: "For building and refining sites regularly",
        features: [
            "500 credits",
            "100 new websites or edits",
            "Publish to the community",
            "Download the HTML of every site",
            "Lower price per credit",
        ],
    },
];
