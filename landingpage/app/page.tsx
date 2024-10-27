"use client";
import React from "react";
import Link from "next/link";
import { LineChart, Users, Database } from "lucide-react";

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => (
  <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center mb-4">
      <div className="bg-blue-100 dark:bg-blue-800 p-3 rounded-full mr-4">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

const Home: React.FC = () => {
  const features = [
    {
      title: "Advanced Analytics",
      description:
        "Leverage AI-powered insights to make data-driven decisions and optimize your operations.",
      icon: <LineChart className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Seamless Integration",
      description:
        "Effortlessly connect with your existing systems for a unified operational view.",
      icon: <Database className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Collaborative Platform",
      description:
        "Foster teamwork and knowledge sharing across departments with our intuitive tools.",
      icon: <Users className="w-8 h-8 text-blue-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section with Video */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
              Welcome to <span className="text-blue-600">Neo-Space</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover a new dimension of possibilities with our innovative
              AI-powered operational analytics platform
            </p>
            <Link
              href="https://neospacecanvas.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300">
                Get Started
              </button>
            </Link>
          </div>
          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden shadow-2xl">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="video.mov" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Explore how Neo-Space can revolutionize your business operations
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Operations?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join innovative businesses leveraging Neo-Space to optimize their
            processes and drive growth
          </p>
          <Link
            href="https://neospacecanvas.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300">
              Get Started
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
