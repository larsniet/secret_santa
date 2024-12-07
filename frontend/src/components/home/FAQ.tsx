import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How does the matching process work?",
      answer:
        "Our smart algorithm ensures that each participant is randomly assigned to give a gift to another participant, while making sure no one is assigned to themselves. The matching is completely random and fair.",
    },
    {
      question: "Can participants set gift preferences?",
      answer:
        "Yes! Participants can set their gift preferences, including interests, sizes, and any specific wishes. This helps their Secret Santa choose the perfect gift.",
    },
    {
      question: "Is my information secure?",
      answer:
        "Absolutely. We use industry-standard encryption to protect all user data. Your personal information and gift assignments are kept completely confidential.",
    },
    {
      question: "How are participants notified?",
      answer:
        "Participants receive email notifications when they're added to an event and when their Secret Santa assignment is ready. They can also view their assignment anytime by logging into the platform.",
    },
    {
      question: "Can I organize multiple events?",
      answer:
        "Yes! Depending on your plan, you can organize multiple Secret Santa events simultaneously. Each event can have its own set of participants and settings.",
    },
    {
      question: "What if someone drops out?",
      answer:
        "No problem! As the organizer, you can remove participants and our system will automatically reassign Secret Santas if necessary, ensuring everyone still has a match.",
    },
  ];

  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-[#B91C1C] tracking-wide uppercase">
            FAQ
          </h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Everything you need to know about Secret Santa
          </p>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                className="py-6 w-full flex justify-between items-center text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-medium text-gray-900">
                  {faq.question}
                </span>
                <span className="ml-6 flex-shrink-0">
                  <svg
                    className={`w-6 h-6 text-gray-400 transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </button>
              {openIndex === index && (
                <div className="pb-6">
                  <p className="text-base text-gray-500">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
