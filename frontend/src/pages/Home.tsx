import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "../components/layout/Layout";
import { Testimonials } from "../components/home/Testimonials";
import { HowItWorks } from "../components/home/HowItWorks";
import { FAQ } from "../components/home/FAQ";
import { Features } from "../components/home/Features";
import { FinalCTA } from "../components/home/FinalCTA";
import { Hero } from "../components/home/Hero";

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Layout>
      <Hero isAuthenticated={isAuthenticated} />
      <HowItWorks />
      <Features />
      <Testimonials />
      <FAQ />
      <FinalCTA />
    </Layout>
  );
};
