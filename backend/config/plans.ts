// Source of truth for what each plan costs and grants. The frontend only displays these;
// checkout always charges the price defined here.
export const PLANS = {
      Pro: { name: 'Pro', credits: 50, amount: 5 },
      Plus: { name: 'Plus', credits: 500, amount: 49 },
} as const;

export type PlanId = keyof typeof PLANS;

export const isPlanId = (value: unknown): value is PlanId =>
      typeof value === 'string' && Object.prototype.hasOwnProperty.call(PLANS, value);

// Every new website and every revision costs this many credits
export const CREDITS_PER_GENERATION = 5;
