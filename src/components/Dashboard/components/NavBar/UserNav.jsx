import React, { useState, useEffect, useRef, lazy, Suspense, useCallback, useMemo } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useUserSession } from "../../../../hooks/useUserSession";
import Loading from '../../../Shared/Loading';
import { motion, AnimatePresence } from "framer-motion";

import {
    FiMenu,
    FiX,
    FiLogIn,
    FiClock, // History icon
    FiChevronDown, // Dropdown arrow
    FiHardDrive, // New icon for Storage
    FiUsers, // For Job Applicants
    FiEdit, // For Edit Documents
    FiRefreshCw, // For Compare Templates
    FiHelpCircle // For Help
} from "react-icons/fi";

// Lazy Load UserProfileModal
const LazyUserProfileModal = lazy(() => import("../AccManager/UserAcountHandler"));

// Lazy Load the actual History component (used in MiddlePanel)
const HistoryComponent = lazy(() => import("../EditingComponents/History")); // Adjust path as needed

// Constants for breakpoints
const BREAKPOINTS = {
    DESKTOP: 877,
    LARGE_DESKTOP: 1200,
};

// HistoryDropdown wrapper component (to render the actual HistoryComponent)
// This is used for DESKTOP
const HistoryDropdown = ({ onClose }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[400px] h-[500px] bg-white dark:bg-zinc-800 rounded-lg py-2 border border-gray-200 dark:border-zinc-700 overflow-hidden transform origin-top-right flex flex-col"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
            <div className="flex-grow overflow-y-auto z-20"> {/* Container for scrollable history content */}
                <Suspense fallback={<div className="flex justify-center items-center h-full"><Loading /></div>}>
                    {/* Render the actual HistoryComponent here */}
                    <HistoryComponent onClose={onClose} /> {/* Pass onClose so HistoryComponent can close the dropdown */}
                </Suspense>
            </div>
        </motion.div>
    );
};

// Main Navbar Component
const Navbar = ({ setActivePanel }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [isHistoryDropdownOpen, setIsHistoryDropdownOpen] = useState(false); // State for desktop history dropdown
    const modalRef = useRef(null);
    const historyDropdownRef = useRef(null); // Ref for history dropdown

    const { user } = useUserSession();
    const navigate = useNavigate();

    const [isDesktop, setIsDesktop] = useState(window.innerWidth >= BREAKPOINTS.DESKTOP);
    const [isLargeDesktop, setIsLargeDesktop] = useState(window.innerWidth >= BREAKPOINTS.LARGE_DESKTOP); // Corrected variable name

    const [isDark, setIsDark] = useState(false);
    const [isLogoHovered, setIsLogoHovered] = useState(false);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const mobileNavRef = useRef(null);

    // --- Storage Meter Logic ---
    const currentStorage = parseFloat(user?.selected?.currentStorageUsageMb) || 0;
    const maxStorage = parseFloat(user?.selected?.maxStorageQuotaMb) || 10; // Default to 10MB to prevent division by zero

    let storagePercentage = (currentStorage / maxStorage) * 100;

    // IMPORTANT: Ensure minimum visibility for very small percentages
    if (currentStorage > 0 && storagePercentage < 1) {
        storagePercentage = 1; // Set to 1% if usage is greater than 0 but less than 1%
    } else if (storagePercentage > 100) {
        storagePercentage = 100; // Cap at 100%
    }

    const displayPercentage = Math.max(0, storagePercentage); // Ensure it's not negative

    // --- IMPORTANT: DEFINE getStorageBarGradient HERE, BEFORE IT'S USED ---
    const getStorageBarGradient = useCallback(() => {
        // Return full Tailwind class names directly
        if (displayPercentage >= 75 && displayPercentage < 90) {
            return "from-yellow-400 to-orange-500";
        } else if (displayPercentage >= 90) {
            return "from-red-500 to-rose-700";
        }
        return "from-cyan-400 to-blue-500";
    }, [displayPercentage]);

    // --- Handlers ---
    const toggleMobileNav = () => {
        setIsMobileNavOpen(!isMobileNavOpen);
        setIsHistoryDropdownOpen(false); // Close desktop history dropdown when mobile nav toggles
    };

    const toggleDesktopHistoryDropdown = (event) => {
        event.stopPropagation(); // Prevent immediate closing due to document click
        setIsHistoryDropdownOpen(prev => !prev);
        setProfileOpen(false); // Close profile modal if history dropdown is opened
    };

    const handleClickOutside = useCallback((event) => {
        // Close profile modal if click is outside
        if (profileOpen && modalRef.current && !modalRef.current.contains(event.target)) {
            setProfileOpen(false);
        }
        // Close desktop history dropdown if click is outside
        if (isHistoryDropdownOpen && historyDropdownRef.current && !historyDropdownRef.current.contains(event.target)) {
            setIsHistoryDropdownOpen(false);
        }
        // Close mobile nav if click is outside and not on the menu button
        if (
            isMobileNavOpen &&
            mobileNavRef.current &&
            !mobileNavRef.current.contains(event.target) &&
            !event.target.closest('.mobile-menu-button')
        ) {
            setIsMobileNavOpen(false);
        }
    }, [profileOpen, isHistoryDropdownOpen, isMobileNavOpen]);


    // --- Effects ---
    useEffect(() => {
        const handleResize = () => {
            setIsDesktop(window.innerWidth >= BREAKPOINTS.DESKTOP);
            setIsLargeDesktop(window.innerWidth >= BREAKPOINTS.LARGE_DESKTOP); // Corrected variable name
            if (window.innerWidth >= BREAKPOINTS.DESKTOP && isMobileNavOpen) {
                setIsMobileNavOpen(false);
            }
        };
        window.addEventListener("resize", handleResize);

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setIsDark(prefersDark);

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = (e) => setIsDark(e.matches);
        mediaQuery.addEventListener("change", handleChange);

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            window.removeEventListener("resize", handleResize);
            mediaQuery.removeEventListener("change", handleChange);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMobileNavOpen, handleClickOutside]); // Dependencies for this specific effect

    useEffect(() => {
        // Prevent body scroll when any modal/overlay is open
        document.body.style.overflow = (profileOpen || isMobileNavOpen || isHistoryDropdownOpen) ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [profileOpen, isMobileNavOpen, isHistoryDropdownOpen]);

    // --- Helper Functions ---
    const formatName = (name) => (name ? name.replace(/\s+/g, "") : "");

    const dashboardPath = user?.selected?.username
        ? `/${user.selected.username}/dashboard`
        : user?.selected?.name
            ? `/${formatName(user.selected.name)}/dashboard`
            : "/dashboard";

    const navLinks = useMemo(() => [
        { name: "Job Applicants", path: "opennings", icon: <FiUsers /> },
        { name: "Edit Documents", path: `edit-resume`, icon: <FiEdit /> },
        { name: "Compare Templates", path: `compare-templates`, icon: <FiRefreshCw /> },
        { name: "Help", path: "/help", icon: <FiHelpCircle /> },
    ], []); // Memoize navLinks as it doesn't change

    // Function to get the profile image URL or generate SVG
    const getUserProfileImage = useCallback(() => {
        if (user?.selected?.avatarUrl) {
            return user.selected.avatarUrl;
        }
        if (user?.selected?.imageUrl) {
            return user.selected.imageUrl;
        }
        const nameForAvatar = user?.selected?.name || user?.selected?.username || 'User';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(nameForAvatar)}&background=random&color=fff`;
    }, [user?.selected?.avatarUrl, user?.selected?.imageUrl, user?.selected?.name, user?.selected?.username]);

    // --- Animation Variants ---
    const logoAnimation = {
        rest: {
            rotateY: 0,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: "easeOut",
            },
        },
        hover: {
            rotateY: [0, 180, 360, 180, 0],
            scale: [1, 1.15, 1, 1.15, 1],
            y: [0, -8, 0, -8, 0],
            transition: {
                duration: 2.5,
                ease: "easeInOut",
                repeat: 0,
            },
        },
    };

    const desktopNavItemVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
        hover: { scale: 1.05, boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)" },
        tap: { scale: 0.95 },
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, y: -20, scaleY: 0, originY: 0, transition: { duration: 0.2, ease: "easeOut" } },
        visible: { opacity: 1, y: 0, scaleY: 1, originY: 0, transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.05 } },
        exit: { opacity: 0, y: -20, scaleY: 0, originY: 0, transition: { duration: 0.2, ease: "easeIn" } },
    };

    const mobileMenuItemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
    };

    const storageBarVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.5, type: "spring", damping: 10, stiffness: 100 } },
        hover: { scale: 1.02, boxShadow: "0 0 15px rgba(12, 29, 40, 0.49)", transition: { duration: 0.3 } }, // Light sky blue glow
    };

    return (
        <>
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-transparent dark:bg-transparent border-b border-gray-100 dark:border-zinc-800 ">
                <div className="container mx-auto flex items-center justify-between py-2">
                    {/* LEFT SECTION: Mobile Menu Button + Logo + Desktop Nav Links + Desktop Storage Bar */}
                    <div className="flex items-center">
                        {/* Mobile Menu Button (Only when not desktop, i.e., <= 876px) */}
                        {!isDesktop && (
                            <motion.button
                                onClick={toggleMobileNav}
                                className="mobile-menu-button p-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-zinc-800 transition-colors duration-200 ml-4 mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label={isMobileNavOpen ? "Close menu" : "Open menu"}
                                aria-expanded={isMobileNavOpen}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {isMobileNavOpen ? <FiX className="h-7 w-7" /> : <FiMenu className="h-7 w-7" />}
                            </motion.button>
                        )}

                        {/* Logo - Always positioned to the left. */}
                        <NavLink to={user?.selected ? dashboardPath : "/"}>
                            <motion.img
                                src={isDark ? "/darklogo.png" : "/lightlogo.png"}
                                alt="ApplicantAce Logo"
                                className={`h-10 cursor-pointer ${isDesktop ? 'ml-6' : ''} ${!isDesktop ? 'mr-4' : ''} font-inter`}
                                onMouseEnter={() => setIsLogoHovered(true)}
                                onMouseLeave={() => setIsLogoHovered(false)}
                                variants={logoAnimation}
                                initial="rest"
                                animate={isLogoHovered ? "hover" : "rest"}
                            />
                        </NavLink>

                        {/* Desktop Navigation Links (Left-aligned) */}
                        {isDesktop && (
                            <motion.div
                                className="flex items-center gap-6 ml-8 font-inter" // Applied font-inter here
                                initial="hidden"
                                animate="visible"
                                transition={{ staggerChildren: 0.1 }}
                            >
                                {navLinks.map((item, idx) => (
                                    <motion.div key={idx} variants={desktopNavItemVariants} whileHover="hover" whileTap="tap">
                                        <NavLink
                                            to={item.path}
                                            end={item.exact}
                                            className={({ isActive }) =>
                                                `text-base font-medium px-2 py-2 transition-all duration-300 ease-in-out relative
                                                ${
                                                    isActive
                                                        ? "text-black dark:text-white font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-white after:transition-transform after:duration-300 after:ease-out after:scale-x-100 after:origin-left"
                                                        : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400 after:transition-transform after:duration-300 after:ease-out after:scale-x-0 after:origin-left hover:after:scale-x-100"
                                                }`
                                            }
                                        >
                                            {item.name}
                                        </NavLink>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT SECTION: Desktop Storage Bar + History Icon + Profile/Login */}
                    <div className="flex items-center gap-6 mr-6">
                        {isDesktop && user?.selected && (
                            <motion.div
                                className="relative flex items-center bg-white dark:bg-gray-800 rounded-full pl-3 pr-4 py-2 transition-all duration-300 transform cursor-help group font-inter" // Applied font-inter here
                                initial="hidden"
                                animate="visible"
                                variants={storageBarVariants}
                                whileHover="hover"
                            >
                                <FiHardDrive className="text-blue-500 text-xl mr-2" />
                                <div className="w-28 h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${getStorageBarGradient()} transition-all duration-500 ease-out`}
                                        style={{ width: `${displayPercentage}%` }}
                                    ></div>
                                </div>
                                <span className="ml-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                    {/* Display integer percentage, rounded to nearest whole number */}
                                    {Math.round(displayPercentage)}%
                                </span>
                                {/* Tooltip for storage - Positioned at the bottom */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 text-xs bg-gray-800 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                                    {currentStorage.toFixed(2)}MB of {maxStorage.toFixed(2)}MB used
                                </div>
                            </motion.div>
                        )}

                        {/* History Icon (Desktop Only, before Profile) */}
                        {isDesktop && user?.selected && (
                            <motion.div className="relative" ref={historyDropdownRef}>
                                <motion.button
                                    onClick={toggleDesktopHistoryDropdown}
                                    className="p-2 rounded-full text-gray-700 dark:text-gray-300 transition-colors duration-200 focus:outline-none flex items-center gap-1 font-inter" // Applied font-inter here
                                    aria-label="Toggle history dropdown"
                                    aria-expanded={isHistoryDropdownOpen}
                                    aria-haspopup="true"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <FiClock className="h-6 w-6" />
                                    <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isHistoryDropdownOpen ? 'rotate-180' : 'rotate-0'}`} />
                                </motion.button>
                                <AnimatePresence>
                                    {isHistoryDropdownOpen && (
                                        <HistoryDropdown onClose={() => setIsHistoryDropdownOpen(false)} />
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {/* Profile or Login Button (Desktop Only) */}
                        {isDesktop && (
                            <div className="flex items-center">
                                {user?.selected ? (
                                    <motion.button
                                        onClick={() => { setProfileOpen(true); setIsHistoryDropdownOpen(false); }}
                                        className="relative focus:outline-none rounded-full overflow-hidden transition-all duration-300 font-inter" // Applied font-inter here
                                        aria-label="Open Profile"
                                        whileHover={{ scale: 1.08, rotate: 3 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <img
                                            src={getUserProfileImage()} 
                                            alt={user.selected.name || "User Profile"}
                                            className="h-10 w-10 rounded-full object-cover dark:ring-purple-500 shadow-md"
                                            loading="lazy"
                                        />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        onClick={() => navigate("/signup")}
                                        className="text-base font-semibold text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 transform font-inter" // Applied font-inter here
                                        whileHover={{ y: -2, boxShadow: "0px 6px 15px rgba(0, 0, 0, 0.2)" }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <FiLogIn className="inline-block mr-2 text-xl" /> Login
                                    </motion.button>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation Dropdown (navLinks, Storage, Profile/Login) */}
                <AnimatePresence>
                    {!isDesktop && isMobileNavOpen && (
                        <motion.div
                            ref={mobileNavRef}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={mobileMenuVariants}
                            className="absolute top-full left-0 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md shadow-xl py-4 border-t border-gray-100 dark:border-zinc-800 z-40 font-inter" // Applied font-inter here
                        >
                            <nav className="flex flex-col items-center gap-4 px-6">
                                {/* Mobile Storage Meter */}
                                {user?.selected && (
                                    <motion.div
                                        variants={mobileMenuItemVariants}
                                        className="relative flex items-center bg-gray-100 dark:bg-zinc-800 rounded-full pl-3 pr-4 py-2 shadow-inner transition-all duration-300 transform cursor-help group w-full justify-center"
                                    >
                                        <FiHardDrive className="text-blue-500 text-xl mr-2" />
                                        <div className="w-28 h-2.5 bg-gray-300 rounded-full dark:bg-gray-700 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full bg-gradient-to-r ${getStorageBarGradient()} transition-all duration-500 ease-out`}
                                                style={{ width: `${displayPercentage}%` }}
                                            ></div>
                                        </div>
                                        <span className="ml-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
                                            {/* Display integer percentage, rounded to nearest whole number */}
                                            {Math.round(displayPercentage)}%
                                        </span>
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-1 text-xs bg-gray-800 text-white rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                                            {currentStorage.toFixed(2)}MB of {maxStorage.toFixed(2)}MB used
                                        </div>
                                    </motion.div>
                                )}

                                {/* Main Mobile Nav Links */}
                                {navLinks.map((item, idx) => (
                                    <motion.div key={idx} variants={mobileMenuItemVariants} className="w-full">
                                        <NavLink
                                            to={item.path}
                                            end={item.exact}
                                            onClick={() => setIsMobileNavOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 w-full justify-center px-4 py-2 rounded-lg text-base font-semibold transition-all duration-300 relative
                                                ${
                                                    isActive
                                                        ? "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-zinc-800 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-600 dark:before:bg-blue-400 before:scale-y-100 before:origin-top before:transition-transform before:duration-300 before:ease-out pl-6"
                                                        : "text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-zinc-800 before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:bg-blue-600 dark:before:bg-blue-400 before:scale-y-0 before:origin-top before:transition-transform before:duration-300 before:ease-out"
                                                }`
                                            }
                                        >
                                            {item.icon && <span className="text-xl">{item.icon}</span>}
                                            {item.name}
                                        </NavLink>
                                    </motion.div>
                                ))}

                                {/* Mobile-specific Profile/Login */}
                                {user?.selected ? (
                                    <motion.button
                                        variants={mobileMenuItemVariants}
                                        onClick={() => {
                                            setProfileOpen(true);
                                            setIsMobileNavOpen(false); // Close mobile nav when opening profile modal
                                        }}
                                        className="flex items-center gap-3 w-full justify-center px-4 py-2 mt-4 rounded-lg text-base font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-zinc-700 transition-colors duration-300"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <img
                                            src={getUserProfileImage()} 
                                            alt={user.selected.name || "User Profile"}
                                            className="h-8 w-8 rounded-full object-cover ring-1 ring-blue-400"
                                        />
                                        View Profile
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        variants={mobileMenuItemVariants}
                                        onClick={() => {
                                            navigate("/signup");
                                            setIsMobileNavOpen(false); // Close mobile nav when navigating
                                        }}
                                        className="w-full text-base font-semibold text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 px-4 py-2 mt-4 rounded-full shadow-lg transition-all duration-300"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <FiLogIn className="inline-block mr-2 text-xl" /> Login
                                    </motion.button>
                                )}
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* Profile Modal Overlay */}
            <AnimatePresence>
                {profileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-lg overflow-y-auto z-[9999]"
                        onClick={handleClickOutside} // Use global handler
                        aria-modal="true"
                        role="dialog"
                    >
                        <motion.div
                            ref={modalRef}
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="relative w-full max-w-6xl max-h-[90vh] mx-4 sm:mx-auto overflow-visible rounded-2xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
                        >
                            <Suspense
                                fallback={
                                    <div className="flex items-center justify-center h-64 min-h-[300px] w-full bg-white dark:bg-zinc-800 rounded-2xl p-6">
                                        <Loading />
                                    </div>
                                }
                            >
                                <LazyUserProfileModal
                                    onClose={() => setProfileOpen(false)}
                                />
                            </Suspense>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;