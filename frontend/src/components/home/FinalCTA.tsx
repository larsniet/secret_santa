import { Link } from "react-router-dom";

export const FinalCTA: React.FC = () => {
  return (
    <section className="bg-[#B91C1C] py-16 sm:py-24">
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
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
