import React, { useState } from "react";

// LinkedIn Icon component remains the same
const LinkedInIcon = () => (
  <svg
    className="w-5 h-5 inline-block text-blue-600 dark:text-blue-400"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    aria-hidden="true"
    role="img"
  >
    <path d="M4.983 3.5C3.668 3.5 2.5 4.667 2.5 5.982a1.5 1.5 0 0 0 3 0c0-1.315-1.168-2.482-2.517-2.482zM2 8h6v12H2V8zm7 0h5.5v1.737h.078c.768-1.45 2.644-2.978 5.444-2.978 5.823 0 6.5 3.838 6.5 8.827V20H18v-7.5c0-1.7-.035-3.886-2.37-3.886-2.37 0-2.73 1.849-2.73 3.75V20H9V8z" />
  </svg>
);

const sections = [
  {
    id: "getting-started",
    title: "Getting Started",
    content: (
      <>
        <p>To run the project locally:</p>
        <pre className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-sm font-roboto-mono overflow-x-auto text-gray-900 dark:text-gray-100">
          {`git clone https://github.com/your-project.git
cd your-project
npm install
npm run dev`}
        </pre>
      </>
    ),
  },
  {
    id: "used-apis",
    title: "External APIs Used",
    content: (
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
        <li><strong>OpenWeatherMap API</strong> – for real-time weather data</li>
        <li><strong>Unsplash API</strong> – for background images</li>
        <li><strong>JWT.io</strong> – for authentication token structure</li>
      </ul>
    ),
  },
  {
    id: "provided-apis",
    title: "Provided APIs (Login/Signup)",
    content: (
      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
        <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-roboto-mono">POST /api/auth/signup</code> – Registers a new user</li>
        <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-roboto-mono">POST /api/auth/login</code> – Logs in existing user</li>
        <li><code className="bg-gray-200 dark:bg-gray-700 px-1 rounded font-roboto-mono">GET /api/user/profile</code> – Returns user profile data</li>
      </ul>
    ),
  },
  {
    id: "error-handling",
    title: "Error Handling",
    content: (
      <>
        <p>All API responses follow a standard error format:</p>
        <pre className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 text-sm font-roboto-mono overflow-x-auto text-gray-900 dark:text-gray-100">
          {`{
  "success": false,
  "message": "Invalid credentials",
  "code": 401
}`}
        </pre>
      </>
    ),
  },
  {
    id: "faq",
    title: "FAQs",
    content: (
      <dl className="space-y-4 text-gray-700 dark:text-gray-300">
        <div>
          <dt className="font-semibold">How do I reset my password?</dt>
          <dd className="ml-4">Use the “Forgot Password” link on the login page.</dd>
        </div>
        <div>
          <dt className="font-semibold">Can I use OAuth?</dt>
          <dd className="ml-4">Yes, Google and GitHub OAuth are supported.</dd>
        </div>
        <div>
          <dt className="font-semibold">Is the API rate-limited?</dt>
          <dd className="ml-4">Yes, requests are rate-limited to 60/min per user.</dd>
        </div>
      </dl>
    ),
  },
];

const developers = [
  {
    name: "Ashmeet Singh",
    role: "Data Science Engineer",
    image: "/ashmeet.png",
    linkedin: "https://www.linkedin.com/in/ashmeet-singh-192610225/",
  },
  {
    name: "Prerna Perwani",
    role: "Software Developer",
    image: "/prerna.png",
    linkedin: "https://linkedin.com/in/alicejohnson", // Placeholder, update as needed
  },
  {
    name: "Himanshu Sahu",
    role: "Data Science Engineer",
    image: "/himanshu.png",
    linkedin: "https://linkedin.com/in/alicejohnson", // Placeholder, update as needed
  },
];

const profilesSection = {
  id: "profiles",
  title: "Developer Profiles",
  content: (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      {developers.map((dev) => (
        <article
          key={dev.name}
          className="
            bg-white dark:bg-gradient-to-r dark:bg-transparent
            border-none dark:border-gray-700
            rounded-xl
            p-6
            flex flex-col items-center text-center
            transition-transform duration-300 ease-in-out
            hover:-translate-y-1 hover:shadow-2xl
          "
          aria-label={`${dev.name} - ${dev.role}`}
        >
          <img
            src={dev.image}
            alt={`Avatar of ${dev.name}`}
            className="w-28 h-28 rounded-full object-cover mb-5 border-4 border-gray-600 shadow-md"
            loading="lazy"
          />
          <a
            href={dev.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex space-x-3
              ml-16 mt-[-10%]
              bg-transparent dark:bg-transparent
              text-black dark:text-gray-100
              rounded-lg
              font-semibold
              hover:bg-none dark:hover:bg-blue-600
              transition-colors duration-200
            "
            aria-label={`LinkedIn profile of ${dev.name}`}
          >
            <LinkedInIcon />
          </a>
          {/* Developer Name - Using 'font-montserrat' for headings */}
          <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1 font-montserrat">{dev.name}</h4>
          {/* Developer Role - Using 'font-open-sans' for body text */}
          <p className="text-base text-gray-600 dark:text-gray-300 mb-5 font-open-sans">{dev.role}</p>
        </article>
      ))}
    </div>
  ),
};

const Documentation = () => {
  const [activeId, setActiveId] = useState(sections[0].id);

  const activeSection =
    activeId === profilesSection.id
      ? profilesSection
      : sections.find((sec) => sec.id === activeId);

  return (
    <section className="flex flex-col md:flex-row w-full min-h-[70vh] px-6 py-8 gap-8 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 font-open-sans"> {/* Default body font */}
      {/* Sidebar */}
      <nav
        className="md:w-1/4 w-full border-r border-gray-300 dark:border-gray-700"
        aria-label="Documentation Sections"
      >
        {/* Sidebar Title - Using 'font-montserrat' for headings */}
        <h2 className="text-2xl font-bold mb-8 border-b border-none dark:border-gray-700 pb-3 font-montserrat">
          Documentation
        </h2>
        <ul className="flex flex-col space-y-3">
          {[...sections, profilesSection].map(({ id, title }) => (
            <li key={id}>
              <button
                onClick={() => setActiveId(id)}
                className={`w-full text-left text-base font-semibold px-3 py-2 rounded-lg
                  transition-colors duration-200 font-montserrat
                  ${
                    activeId === id
                      ? "bg-blue-600 text-white dark:bg-blue-500"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }
                `}
                aria-current={activeId === id ? "true" : undefined}
                type="button"
              >
                {title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Content */}
      <main
        className="md:w-3/4 w-full p-8 rounded-md bg-gray-50 dark:bg-gray-900 shadow-none dark:shadow-lg transition-colors duration-300"
        key={activeId}
      >
        {/* Section Title - Using 'font-montserrat' for headings */}
        <h3 className="text-3xl font-extrabold mb-6 font-montserrat">{activeSection.title}</h3>
        {/* Article content - prose class often handles its own fonts, but we ensure monospace for code */}
        <article className="prose prose-gray dark:prose-invert max-w-none leading-relaxed font-open-sans"> {/* Ensures body text uses open-sans */}
          {activeSection.content}
        </article>
      </main>
    </section>
  );
};

export default Documentation;