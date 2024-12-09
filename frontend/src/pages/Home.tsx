import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout/Layout";
import { Link } from "react-router-dom";
import { Testimonials } from "../components/home/Testimonials";
import { HowItWorks } from "../components/home/HowItWorks";
import { Pricing } from "../components/home/Pricing";
import { FAQ } from "../components/home/FAQ";

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="relative bg-white overflow-hidden">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 px-5 lg:px-10 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <div className="pt-10 sm:pt-12 md:pt-16 lg:pt-20 xl:pt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Organize your</span>
                  <span className="block text-[#B91C1C]">Secret Santa</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Create and manage Secret Santa gift exchanges with ease.
                  Invite participants, automatically assign gift recipients, and
                  let everyone know who they're buying for - all in one place.
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
                        Get Started
                      </Link>
                      <Link
                        to="/login"
                        className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#B91C1C] bg-[#FEE2E2] hover:bg-[#FECACA] md:py-4 md:text-lg md:px-10"
                      >
                        Sign In
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
        </div>

        {/* How It Works */}
        <HowItWorks />

        {/* Features Section */}
        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-[#B91C1C] font-semibold tracking-wide uppercase">
                Features
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Everything you need for Secret Santa
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#B91C1C] text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Easy Participant Management
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Add participants easily and manage multiple Secret Santa
                    sessions at once.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#B91C1C] text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Automatic Assignments
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Let our system randomly assign gift recipients and notify
                    everyone automatically.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#B91C1C] text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Simple Sharing
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Share your Secret Santa session with a simple link - no
                    account required for participants.
                  </dd>
                </div>

                <div className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-[#B91C1C] text-white">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">
                      Private & Secure
                    </p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">
                    Keep your Secret Santa truly secret with our secure
                    assignment system.
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <Pricing />

        {/* Testimonials */}
        <Testimonials />

        {/* FAQ */}
        <FAQ />

        {/* Final CTA Section */}
        <div className="bg-[#B91C1C] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:flex lg:items-center lg:justify-between">
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">Ready to start your</span>
                <span className="block">Secret Santa event?</span>
              </h2>
              <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                <div className="inline-flex rounded-md shadow">
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-[#B91C1C] bg-white hover:bg-gray-50"
                  >
                    Get Started
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
