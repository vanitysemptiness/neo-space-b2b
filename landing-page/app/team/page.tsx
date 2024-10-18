"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Briefcase, Mail, Linkedin } from "lucide-react";

const TeamMember: React.FC<{
  name: string;
  role: string;
  bio: string | React.ReactNode;
  imageSrc: string;
  linkedinUrl: string;
}> = ({ name, role, bio, imageSrc, linkedinUrl }) => (
  <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg overflow-hidden">
    <div className="md:flex">
      <div className="md:flex-shrink-0">
        <Image
          src={imageSrc}
          alt={name}
          width={192}
          height={192}
          className="h-48 w-full object-cover md:w-48"
        />
      </div>
      <div className="p-8">
        <h3 className="mt-1 text-2xl font-medium text-gray-900 dark:text-white">
          {name}
        </h3>
        <p className="mt-2 text-gray-600 dark:text-gray-300">{bio}</p>
        <div className="mt-4 flex items-center text-gray-600 dark:text-gray-400">
          <Briefcase className="h-5 w-5 mr-2" />
          <span>{role}</span>
        </div>
        <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
          <Mail className="h-5 w-5 mr-2" />
          <span>{name.toLowerCase().replace(" ", ".")}@neospace.com</span>
        </div>
        <div className="mt-2 flex items-center text-gray-600 dark:text-gray-400">
          <Linkedin className="h-5 w-5 mr-2" />
          <Link
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            LinkedIn Profile
          </Link>
        </div>
      </div>
    </div>
  </div>
);

const TheTeam: React.FC = () => {
  const teamMembers = [
    {
      name: "Jake Henderson",
      role: "Founder",
      bio: "Jake is a skilled Software Engineer with a strong background in Distributed Systems, Event Driven Systems, Multiprocessing, and Concurrency. Currently, he is pursuing an MS in Computer Science with a Machine Learning focus at the Georgia Institute of Technology. He graduated from North Carolina State University with a BS in Economics and a minor in Statistics, and his professional journey includes SWE roles at IBM, SAS, Railinc Corp., and 5Head Chess.",
      imageSrc: "/jake.jpeg",
      linkedinUrl: "https://www.linkedin.com/in/jake-h-19b577232/",
    },
    {
      name: "Colton Botta",
      role: "Founder",
      bio: (
        <>
          Colton is a computer scientist and researcher, currently pursuing a
          PhD in Computer Science at the University of Edinburgh, focusing on
          Generative AI in Education. He graduated as Valedictorian from NC
          State with a BS in Computer Science and was named a{" "}
          <Link
            href="https://www.marshallscholarship.org/scholars/scholar-profiles/colton-botta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            2021 Marshall Scholar
          </Link>
          . Colton&apos;s academic journey includes a Masters in Cognitive
          Science from the University of Edinburgh and an MPhil in Engineering
          from the University of Cambridge&apos;s Machine Learning Group. His
          professional experience spans multiple SWE roles at Pendo.io, IBM, and
          5Head Chess.
        </>
      ),
      imageSrc: "/colton.jpg",
      linkedinUrl: "https://www.linkedin.com/in/coltonbotta/",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="pt-20  px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-extrabold text-gray-900 dark:text-white mb-4">
              Meet <span className="text-blue-600">The Team</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              The innovative minds behind Neo-Space&apos;s AI-powered solutions
            </p>
          </div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMember
                key={index}
                name={member.name}
                role={member.role}
                bio={member.bio}
                imageSrc={member.imageSrc}
                linkedinUrl={member.linkedinUrl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">Join Us!</h2>
          <p className="text-xl text-blue-100 mb-8">
            We&apos;re always looking for talented individuals to help push the
            boundaries of what&apos;s possible in AI and analytics
          </p>
          <button
            disabled
            className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300"
          >
            Coming Soon
          </button>
        </div>
      </section>
    </div>
  );
};

export default TheTeam;
