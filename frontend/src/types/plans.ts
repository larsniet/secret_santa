export enum EventPlan {
  FREE = "FREE",
  GROUP = "GROUP",
  BUSINESS = "BUSINESS",
}

export const PLAN_LIMITS = {
  [EventPlan.FREE]: {
    maxParticipants: 5,
    price: 0,
    features: [
      "Basic matching algorithm",
      "Email notifications",
      "Gift preferences & wishlists",
      "Up to 5 participants",
      "1 event at a time",
    ],
  },
  [EventPlan.GROUP]: {
    maxParticipants: 25,
    price: 4,
    features: [
      "Smart matching algorithm",
      "Custom event themes",
      "Gift preferences & wishlists",
      "Up to 25 participants",
      "Budget setting",
    ],
  },
  [EventPlan.BUSINESS]: {
    maxParticipants: Infinity,
    price: 10,
    features: [
      "Advanced matching algorithm",
      "Custom branding",
      "Gift preferences & wishlists",
      "Unlimited participants",
      "Budget management",
      "Priority support",
    ],
  },
};
