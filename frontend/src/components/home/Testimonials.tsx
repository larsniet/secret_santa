import React from "react";

export const Testimonials: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Office Manager",
      content:
        "This platform made organizing our office Secret Santa so much easier! Everyone loved how smooth the process was.",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=48&h=48&q=75",
      imageLarge:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=96&h=96&q=75",
    },
    {
      name: "Michael Chen",
      role: "Family Organizer",
      content:
        "Perfect for our large family gift exchange. The automatic matching saved us so much time, and everyone got their assignments instantly.",
      image:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=facearea&facepad=2&w=48&h=48&q=75",
      imageLarge:
        "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?auto=format&fit=facearea&facepad=2&w=96&h=96&q=75",
    },
    {
      name: "Emma Wilson",
      role: "Event Coordinator",
      content:
        "I've used this for multiple events, and it never disappoints. The interface is intuitive, and the support is excellent.",
      image:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=48&h=48&q=75",
      imageLarge:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=facearea&facepad=2&w=96&h=96&q=75",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2
          id="testimonials-heading"
          className="text-base font-semibold text-[#B91C1C] tracking-wide uppercase"
        >
          Testimonials
        </h2>
        <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Trusted by Holiday Enthusiasts
        </p>
        <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
          See what our users are saying about their Secret Santa experience
        </p>
      </div>
      <div
        className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        role="region"
        aria-label="Customer testimonials"
      >
        {testimonials.map((testimonial, index) => (
          <article
            key={index}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 transform transition duration-200 hover:-translate-y-1"
          >
            <header className="flex items-center mb-6">
              <picture>
                <source
                  srcSet={testimonial.imageLarge}
                  media="(min-width: 640px)"
                />
                <img
                  className="h-12 w-12 rounded-full"
                  src={testimonial.image}
                  alt={`${testimonial.name}, ${testimonial.role}`}
                  loading="lazy"
                  decoding="async"
                  width="48"
                  height="48"
                />
              </picture>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {testimonial.name}
                </h3>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </header>
            <blockquote>
              <p className="text-gray-600 italic">"{testimonial.content}"</p>
            </blockquote>
          </article>
        ))}
      </div>
    </div>
  );
};
