import React from "react";

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      title: "Create a Session",
      description:
        "Start by creating a Secret Santa session and give it a name. This will be your gift exchange event.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      ),
    },
    {
      title: "Invite Participants",
      description:
        "Share the invitation link with your group. Participants can join without creating an account.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      ),
    },
    {
      title: "Set Preferences",
      description:
        "Each participant can add their gift preferences, interests, and wishlist to help their Secret Santa.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      ),
    },
    {
      title: "Generate Assignments",
      description:
        "When ready, generate the Secret Santa assignments. Everyone will be notified of their match via email.",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      ),
    },
  ];

  return (
    <div className="bg-gray-50 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-[#B91C1C] tracking-wide uppercase">
            How It Works
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple Steps to Secret Santa Success
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Follow these easy steps to organize your perfect gift exchange
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative bg-white p-8 rounded-lg shadow-sm border border-gray-200 transform transition duration-200 hover:-translate-y-1"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-[#B91C1C] text-white text-lg font-semibold">
                    {index + 1}
                  </span>
                </div>
                <div className="h-12 w-12 mx-auto rounded-md bg-[#FEE2E2] flex items-center justify-center">
                  <svg
                    className="h-6 w-6 text-[#B91C1C]"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {step.icon}
                  </svg>
                </div>
                <h3 className="mt-6 text-center text-xl font-medium text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-4 text-center text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
