import { Link } from "react-router-dom";

export const Hero: React.FC<{ isAuthenticated: boolean }> = ({
  isAuthenticated,
}) => {
  return (
    <section
      className="relative bg-white overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 px-5 lg:px-10 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
        <div className="pt-10 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-28">
          <div className="sm:text-center lg:text-left">
            <h1
              id="hero-heading"
              className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl"
            >
              <span className="block">Organize your</span>
              <span className="block text-[#B91C1C]">Secret Santa</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              Create and manage Secret Santa gift exchanges with ease. Invite
              participants, automatically assign gift recipients, and let
              everyone know who they're buying for - all in one place. Free for
              groups up to 25 participants!
            </p>
            <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
              {isAuthenticated ? (
                <div className="rounded-md shadow">
                  <Link
                    to="/dashboard"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#B91C1C] hover:bg-[#991B1B] md:py-4 md:text-lg md:px-10"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              ) : (
                <div className="space-x-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#B91C1C] hover:bg-[#991B1B] md:py-4 md:text-lg md:px-10"
                  >
                    Get Started Free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <div className="h-56 w-full sm:h-72 md:h-96 lg:w-full lg:h-full hero-placeholder">
          <picture>
            <source
              type="image/webp"
              srcSet="/images/hero-400.webp 400w, /images/hero-600.webp 600w"
              sizes="(max-width: 640px) 400px, 600px"
            />
            <source
              type="image/jpeg"
              srcSet="/images/hero-400.jpg 400w, /images/hero-600.jpg 600w"
              sizes="(max-width: 640px) 400px, 600px"
            />
            <img
              src="/images/hero-400.webp"
              alt="Christmas decorations with gifts and ornaments"
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
              width="400"
              height="267"
            />
          </picture>
        </div>
      </div>
    </section>
  );
};
