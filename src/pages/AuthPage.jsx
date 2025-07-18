import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Import AnimatePresence for smooth modal transitions
import AnimatedBackground from "../components/Shared/AnimatedBackground";
import AuthForm from "../Auth/AuthForm";
import GoogleAuthButton from "../Auth/GoogleAuth";
import GitHubAuthButton from "../Auth/GitHubAuth";
import ErrorPopup from "../components/Shared/ErrorPopup";
import TermsAndConditions from "../termsconditions"; // Import the TermsAndConditions component

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [glowActive, setGlowActive] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [showTermsPopup, setShowTermsPopup] = useState(false); // New state for popup visibility

  useEffect(() => {
    const timer = setTimeout(() => setGlowActive(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    setAuthError(null);
  }, []);

  // Function to open the terms popup
  const openTermsPopup = useCallback((e) => {
    e.preventDefault(); // Prevent default link behavior
    setShowTermsPopup(true);
  }, []);

  // Function to close the terms popup
  const closeTermsPopup = useCallback(() => {
    setShowTermsPopup(false);
  }, []);

  const illustrationVariants = useMemo(
    () => ({
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      transition: { duration: 0.6, type: "spring", stiffness: 100 },
    }),
    []
  );

  const AuthSection = useMemo(
    () => (
      <div className="flex-1 w-full flex flex-col items-center justify-center p-4 md:p-6 order-2 md:order-1">
        <AuthForm isLogin={isLogin} onAuthError={setAuthError} />
        <p
          onClick={toggleMode}
          // Using 'font-lato' for a clean, readable text below the form.
          className="text-sm text-blue-500 cursor-pointer mt-2 hover:underline transition-colors duration-200 font-lato"
        >
          {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
        </p>
      </div>
    ),
    [isLogin, toggleMode, setAuthError]
  );

  const SocialSection = useMemo(
    () => (
      <div
        // Ensure this section also benefits from a suitable font, maybe 'font-montserrat' for boldness.
        // Or keep it 'font-poppins' as a good default for UI elements.
        // Let's go with 'font-montserrat' for a slightly different feel here.
        className="flex-1 w-full flex flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-b-3xl md:rounded-r-3xl md:rounded-bl-none order-1 md:order-2 font-montserrat"
      >
        <motion.div
          {...illustrationVariants}
          className="mb-6 w-full max-w-xs flex justify-center items-center"
        >
          <img
            src="/login.png"
            alt={isLogin ? "Login Illustration" : "Signup Illustration"}
            className="w-20 h-20 rounded-xl transform hover:scale-105 transition-transform duration-300"
          />
        </motion.div>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <GoogleAuthButton onAuthError={setAuthError} />
          <GitHubAuthButton onAuthError={setAuthError} />
          <a
            href="#" // Changed href to # since it will be handled by onClick
            onClick={openTermsPopup} // Call the function to open popup
            // Use 'font-poppins' for a clear and professional link
            className="mt-4 text-center text-white border-none px-4 rounded-lg hover:bg-transparent transition duration-300 ease-in-out font-poppins cursor-pointer"
          >
            Terms & Conditions
          </a>
        </div>
      </div>
    ),
    [isLogin, illustrationVariants, setAuthError, openTermsPopup]
  );

  return (
    <div
      // Set a sensible default font for the entire page, e.g., Poppins for general text.
      className="relative flex justify-center items-center min-h-screen w-screen p-3 overflow-hidden bg-transparent font-poppins"
    >
      <AnimatedBackground />

      <ErrorPopup error={authError} onClose={() => setAuthError(null)} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`relative flex flex-col md:flex-row items-stretch p-4 md:p-8 w-full max-w-5xl md:h-auto overflow-hidden
                     bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700
                     ${
                       glowActive
                         ? " dark:shadow-purple-700/50 transition-shadow duration-500"
                         : ""
                     }`}
      >
        {AuthSection}
        {SocialSection}
      </motion.div>

      {/* Terms and Conditions Popup (Modal) directly embedded */}
      <AnimatePresence>
        {showTermsPopup && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-zinc-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Our Terms and Conditions
                </h2>
                <button
                  onClick={closeTermsPopup}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
                  aria-label="Close terms popup"
                >
                  &times;
                </button>
              </div>
              <div className="p-6">
                <TermsAndConditions /> {/* Render the T&C component inside the popup */}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AuthPage;