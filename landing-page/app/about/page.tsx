"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Zap,
  TrendingUp,
  PieChart,
  Users as UsersIcon,
  Lightbulb,
} from "lucide-react";

const SolutionCard: React.FC<{
  title: string;
  items: string[];
  icon: React.ReactNode;
}> = ({ title, items, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-gray-700">
    <div className="flex items-center mb-6">
      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full mr-4">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
        {title}
      </h3>
    </div>
    <ul className="space-y-3">
      {items.map((item, index) => (
        <li key={index} className="flex items-start">
          <span className="bg-green-500 rounded-full p-1 mr-3 mt-1">
            <svg
              className="w-3 h-3 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </span>
          <span className="text-gray-700 dark:text-gray-300">{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const ImpactPoint: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, description, icon, color }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-b-4 ${color}`}
      >
        <div className="flex items-center mb-4">
          <div
            className={`p-3 rounded-full mr-4 ${color
              .replace("border", "bg")
              .replace("hover:", "")}`}
          >
            {icon}
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {description}
        </p>
      </div>
      {isHovered && (
        <div
          className={`absolute z-10 p-4 bg-white dark:bg-gray-600 rounded-lg shadow-lg text-sm text-gray-700 dark:text-gray-200 w-full mt-2 border-2 ${color} transition-opacity duration-300`}
        >
          <p className="font-semibold mb-2">How we achieve this:</p>
          <ul className="list-disc list-inside">
            <li>Advanced data analytics</li>
            <li>AI-driven process optimization</li>
            <li>Real-time reporting and insights</li>
          </ul>
        </div>
      )}
    </div>
  );
};

const About: React.FC = () => {
  const impactPoints = [
    {
      title: "Reduce inefficiencies",
      description:
        "Cut down on time-consuming manual processes and minimize errors, leading to significant cost savings.",
      icon: <TrendingUp className="w-6 h-6 text-red-600" />,
      color: "border-red-500 hover:border-red-600",
    },
    {
      title: "Improve forecasting",
      description:
        "Make more accurate predictions with consolidated data and advanced analytics, enabling better strategic planning.",
      icon: <PieChart className="w-6 h-6 text-blue-600" />,
      color: "border-blue-500 hover:border-blue-600",
    },
    {
      title: "Enhance collaboration",
      description:
        "Break down silos between departments, fostering better communication and teamwork across the organization.",
      icon: <UsersIcon className="w-6 h-6 text-green-600" />,
      color: "border-green-500 hover:border-green-600",
    },
    {
      title: "Gain deeper insights",
      description:
        "Uncover hidden patterns and trends in your data, driving innovation and competitive advantage.",
      icon: <Lightbulb className="w-6 h-6 text-yellow-600" />,
      color: "border-yellow-500 hover:border-yellow-600",
    },
  ];

  const solutionOfferings = [
    {
      title: "What We Offer",
      items: [
        "Consolidation of diverse reporting methods",
        "Standardization of data processing techniques",
        "Advanced language models for natural querying",
        "Seamless knowledge sharing and documentation",
      ],
      icon: <LineChart className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Problems We Solve",
      items: [
        "Inconsistent reporting across teams",
        "Undocumented processes",
        "Inefficient manual data processing",
        "Lack of standardization in data control",
      ],
      icon: <Zap className="w-8 h-8 text-blue-600" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
              About <span className="text-blue-600">Neo-Space</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Revolutionizing operations reporting and analysis for businesses
              through innovative AI-powered solutions
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-10 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            {/* <div className="inline-block p-4 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Target className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div> */}
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission
            </h2>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 p-8 rounded-2xl shadow-lg">
            <p className="text-xl text-gray-700 dark:text-gray-300 text-center max-w-4xl mx-auto leading-relaxed">
              At Neo-Space, we&apos;re committed to bringing{" "}
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                clarity
              </span>
              ,
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {" "}
                efficiency
              </span>
              , and
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {" "}
                innovation
              </span>{" "}
              to business operations. Our goal is to empower companies to make
              better decisions and optimize their processes, preparing them for
              the challenges of today&apos;s fast-paced business environment.
            </p>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-10 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">
            Our Solution
          </h2>
          {/* <p className="text-xl text-gray-600 dark:text-gray-300 text-center mb-12 max-w-3xl mx-auto">
            Neo-Space provides cutting-edge solutions to transform your business
            operations
          </p> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {solutionOfferings.map((offering, index) => (
              <SolutionCard
                key={index}
                title={offering.title}
                items={offering.items}
                icon={offering.icon}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-10 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            {/* <div className="inline-block p-4 bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
              <Zap className="w-12 h-12 text-purple-600 dark:text-purple-400" />
            </div> */}
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Impact
            </h2>
            {/* <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Discover how Neo-Space transforms businesses through innovative
              solutions
            </p> */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {impactPoints.map((point, index) => (
              <ImpactPoint
                key={index}
                title={point.title}
                description={point.description}
                icon={point.icon}
                color={point.color}
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
            Join the businesses already benefiting from Neo-Space&apos;s
            innovative solutions
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

export default About;
