import React from "react";
import { Link } from "react-router-dom";

export const Pricing: React.FC = () => {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for small groups",
      features: [
        "Up to 10 participants",
        "Basic matching algorithm",
        "Email notifications",
        "1 active event",
      ],
    },
    {
      name: "Premium",
      price: "$5",
      description: "Great for larger groups",
      features: [
        "Up to 50 participants",
        "Advanced matching preferences",
        "Custom event themes",
        "5 active events",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$12",
      description: "For organizations",
      features: [
        "Unlimited participants",
        "Custom branding",
        "API access",
        "Unlimited events",
        "24/7 support",
        "Analytics dashboard",
      ],
    },
  ];

  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-[#B91C1C] tracking-wide uppercase">
            Pricing
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Plans for Every Occasion
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Choose the perfect plan for your Secret Santa event
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-sm border ${
                plan.popular ? "border-[#B91C1C]" : "border-gray-200"
              } p-8 relative transform transition duration-200 hover:-translate-y-1`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                  <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-[#B91C1C] text-white">
                    Popular
                  </span>
                </div>
              )}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </h3>
                <div className="mt-4 flex items-center justify-center">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.price !== "Free" && (
                    <span className="ml-1 text-xl font-medium text-gray-500">
                      /month
                    </span>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500">{plan.description}</p>
              </div>
              <ul className="mt-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <svg
                      className="w-5 h-5 text-[#B91C1C]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link
                  to="/register"
                  className={`block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                    plan.popular
                      ? "bg-[#B91C1C] text-white hover:bg-[#991B1B]"
                      : "bg-white text-[#B91C1C] border-[#B91C1C] hover:bg-gray-50"
                  }`}
                >
                  Get started
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};