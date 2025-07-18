import React,{ useState } from "react";

const faqs = [
  {
    question: "How do I reset my password?",
    answer:
      "Use the “Forgot Password” link on the login page. An email will be sent to reset your password.",
  },
  {
    question: "Can I use OAuth?",
    answer:
      "Yes, Google and GitHub OAuth are supported for quick and secure authentication.",
  },
  {
    question: "Is the API rate-limited?",
    answer:
      "Yes, requests are limited to 60 per minute per user to ensure fair use.",
  },
  {
    question: "How to contact support?",
    answer:
      "You can contact support by emailing support@example.com or using the contact form on our website.",
  },
  {
    question: "Where can I find API documentation?",
    answer:
      "API documentation is available in the Documentation section or at docs.example.com.",
  },
];

const HelpCenter = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <section className="max-w-4xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 rounded-lg shadow-lg min-h-[400px]">
      <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center">
        Help Center
      </h2>

      {/* Question List View */}
      {selectedIndex === null && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {faqs.map(({ question }, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col justify-center items-start text-left focus:outline-none focus:ring-4 focus:ring-blue-600"
              aria-label={`View answer for: ${question}`}
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {question}
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm">
                Click to view answer
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Answer View */}
      {selectedIndex !== null && (
        <div
          className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl mx-auto"
          aria-live="polite"
          aria-atomic="true"
        >
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {faqs[selectedIndex].question}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
            {faqs[selectedIndex].answer}
          </p>
          <button
            onClick={() => setSelectedIndex(null)}
            className="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 transition"
            aria-label="Go back to question list"
          >
            ← Back to questions
          </button>
        </div>
      )}
    </section>
  );
};

export default HelpCenter;
