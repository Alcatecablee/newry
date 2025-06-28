export const PRICING_PLANS = {
  free: {
    name: "Free",
    price: 0,
    monthlyTransformations: 25,
    layers: [1, 2], // Config & Pattern/Entity fixes only
    features: [
      "25 transformations/month",
      "Configuration validation",
      "Pattern & entity fixes",
      "Basic code improvements",
      "Community support",
      "Public GitHub repos only",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  pro: {
    name: "Pro",
    price: 29,
    monthlyTransformations: -1, // Unlimited
    layers: [1, 2, 3, 4, 5, 6], // All 6 layers
    features: [
      "Unlimited transformations",
      "All 6 AI transformation layers",
      "Component best practices",
      "Hydration & SSR fixes",
      "Next.js optimizations",
      "Quality & performance boosts",
      "Private repository support",
      "Priority support",
      "CLI & API access",
    ],
    cta: "Start Pro Trial",
    popular: true,
  },
  enterprise: {
    name: "Enterprise",
    price: 199,
    monthlyTransformations: -1, // Unlimited
    layers: [1, 2, 3, 4, 5, 6], // All layers
    features: [
      "Everything in Pro",
      "Team collaboration & management",
      "Custom transformation rules",
      "On-premise deployment options",
      "Advanced security & compliance",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee (99.9% uptime)",
      "White-label options",
    ],
    cta: "Contact Sales",
    popular: false,
  },
} as const;

export type PlanType = keyof typeof PRICING_PLANS;

export const PAYPAL_CONFIG = {
  sandbox: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX || "",
    environment: "sandbox" as const,
  },
  production: {
    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID_PRODUCTION || "",
    environment: "live" as const,
  },
};
