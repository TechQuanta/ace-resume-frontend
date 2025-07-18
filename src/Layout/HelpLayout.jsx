import { NavLink, Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "../components/Shared/Loading";

const tabs = [
  { name: "Help Center", path: "" },
  { name: "Documentation", path: "/documentation" },
];

const HelpLayout = () => {
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for content
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const currentPathSegment = location.pathname.split('/').pop();
    const newIndex = tabs.findIndex((tab) => tab.path.split('/').pop() === currentPathSegment);

    if (newIndex !== -1 && newIndex !== activeIndex) {
      setDirection(newIndex > activeIndex ? 1 : -1);
      setActiveIndex(newIndex);
    } else if (newIndex === -1 && location.pathname === "/help") {
      // Handles the case where we navigate directly to /help (which maps to the default tab)
      if (activeIndex !== 0) {
        setDirection(0 > activeIndex ? 1 : -1);
        setActiveIndex(0);
      }
    }
  }, [location.pathname, activeIndex]);

  const variants = useMemo(() => ({
    initial: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      position: "absolute",
      width: "100%",
      top: 0,
      bottom: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      position: "relative",
      transition: {
        duration: 0.45,
        ease: [0.25, 1, 0.5, 1],
      },
    },
    exit: (direction) => ({
      x: direction > 0 ? -100 : 100,
      opacity: 0,
      position: "absolute",
      width: "100%",
      top: 0,
      bottom: 0,
      transition: {
        duration: 0.35,
        ease: [0.25, 1, 0.5, 1],
      },
    }),
  }), []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <Loading />
      </div>
    );
  }

  return (
    <div
      // Set 'font-open-sans' as the default for the entire HelpLayout.
      // Open Sans is a highly versatile and readable sans-serif, excellent for long-form content.
      className="flex flex-col bg-gray-100 dark:bg-gray-900 px-4 py-6 h-screen w-screen overflow-hidden font-open-sans"
    >
      <div className="relative mb-0 ml-3">
        <div className="flex space-x-3">
          {tabs.map((tab, index) => {
            // Correctly derive fullPath for NavLink
            const fullPath = tab.path === ""
              ? `${location.pathname.split('/help')[0]}/help`
              : `${location.pathname.split('/help')[0]}/help${tab.path}`;
            
            const isActive = index === activeIndex;

            return (
              <NavLink
                key={tab.path}
                to={fullPath}
                className={`relative px-5 py-2 text-sm font-medium rounded-t-xl ${
                  isActive
                    ? "bg-white dark:bg-gray-900 text-black dark:text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }
                // Apply 'font-prompt' to the tab names.
                // Prompt is a modern, geometric sans-serif that can provide a nice, clean contrast for navigation.
                font-prompt`}
                style={{
                  marginBottom: isActive ? "-1px" : "0px",
                  transition: "background-color 350ms cubic-bezier(0.25, 1, 0.5, 1)",
                }}
              >
                {tab.name}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div
        // The main content area where Outlet renders children.
        // Content within the Outlet will inherit 'font-open-sans' by default.
        className="relative overflow-hidden border border-t-0 border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900 p-6 flex-grow flex flex-col"
      >
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={location.pathname}
            custom={direction}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ flex: 1, overflowY: "auto", position: "relative" }}
          >
            <Outlet /> {/* This is where your actual help content (HelpCenter, Documentation) will render */}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HelpLayout;