import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const Modal = ({
    isOpen,
    onClose,
    title,
    className,
    disableClickOutside = false,
    fixedContentLeft,
    tabsConfig = [],
    activeTab,
    setActiveTab,
}) => {
    const modalContentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isOpen &&
                modalContentRef.current &&
                !modalContentRef.current.contains(event.target) &&
                !disableClickOutside
            ) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onClose, disableClickOutside]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 sm:p-6 z-50 overflow-y-auto font-body" // Changed to font-body for overall modal context
                >
                    <motion.div
                        ref={modalContentRef}
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 relative m-auto
                                  w-full max-w-[95vw] flex flex-col overflow-hidden
                                  sm:max-w-xl md:max-w-2xl lg:max-w-4xl lg:w-[800px] h-auto
                                  ${className || ''}
                                  font-body`}  
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? "modal-title" : undefined}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>

                        {/* General Modal Title (e.g., "File Operations") - now optional */}
                        {title && (
                            <h3
                                id="modal-title"
                                className="text-2xl font-headline font-bold mb-4 text-gray-900 dark:text-gray-100 border-b pb-3 border-gray-200 dark:border-gray-700 pr-10 leading-tight" // Applied font-headline and leading-tight for titles
                            >
                                {title}
                            </h3>
                        )}

                        {/* Main content area for fixed left and tabbed right. */}
                        <div className={`flex flex-1 flex-col gap-4 text-gray-700 dark:text-gray-300 h-full
                                         lg:flex-row lg:gap-8`}>

                            {/* Fixed Left Panel */}
                            {fixedContentLeft && (
                                <div className={`${tabsConfig.length > 0 ? 'w-full lg:w-1/3' : 'w-full'} overflow-y-auto font-body text-base leading-relaxed`}> {/* Applied font-body, text-base, leading-relaxed */}
                                    {fixedContentLeft}
                                </div>
                            )}

                            {/* Tabbed Right Panel (or full width if no fixedContentLeft) */}
                            {tabsConfig.length > 0 && (
                                <div className={`${fixedContentLeft ? 'w-full lg:flex-1' : 'w-full'} flex flex-col
                                                 ${fixedContentLeft ? 'lg:border-l lg:border-gray-200 lg:dark:border-gray-700 lg:pl-4' : ''}`}>
                                    {/* Tab Navigation */}
                                    <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4 -mx-4 px-4">
                                        {tabsConfig.map((tab) => (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`py-2 px-4 text-sm font-label font-medium ${ // Used font-label here
                                                    activeTab === tab.id
                                                        ? "text-purple-600 border-b-2 border-purple-600 dark:text-purple-400 dark:border-purple-400 font-semibold"
                                                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                                } focus:outline-none transition-colors duration-200`}
                                            >
                                                {tab.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Content Area - RENDER ALL, HIDE INACTIVE */}
                                    <div className="flex-1 overflow-y-auto relative font-body text-base leading-normal"> {/* Applied font-body, text-base, leading-normal to tab content */}
                                        {tabsConfig.map((tab) => (
                                            <div
                                                key={tab.id}
                                                className={`absolute inset-0 transition-opacity duration-200 ${
                                                    activeTab === tab.id
                                                        ? "opacity-100 pointer-events-auto"
                                                        : "opacity-0 pointer-events-none"
                                                }`}
                                            >
                                                {tab.content}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Modal;