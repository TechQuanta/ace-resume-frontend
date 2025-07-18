// src/components/Dashboard/UserDashboard/UserFiles/LocalFileUpload.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaPlusCircle, FaFileAlt, FaTimesCircle, FaCheckCircle, FaExclamationTriangle, FaCloudUploadAlt } from 'react-icons/fa';
import { useUserSession } from '../../../../../../hooks/useUserSession';
import { uploadFileToDrive } from '../../../../../../utils/apiconfig';

// --- FileDetailsModal Component (ideally in its own file) ---
const FileDetailsModal = ({
    isOpen,
    onClose,
    onConfirm,
    selectedFile,
    isUploading,
    uploadProgress,
    theme,
    uploadMessage,
    uploadError
}) => {
    if (!isOpen) return null;
    const isDark = theme === "dark";
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 50 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full max-w-md p-6 rounded-xl shadow-2xl flex flex-col items-center
                    ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-200'}
                    transition-colors duration-300 transform scale-95 animate-zoom-in
                    font-sans`}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 text-3xl transition-colors duration-200"
                    aria-label="Close"
                    disabled={isUploading}
                >
                    <FaTimesCircle />
                </button>
                <h2 className={`text-3xl font-extrabold mb-6 flex flex-col items-center
                    ${isDark ? 'text-indigo-400' : 'text-indigo-700'}
                    font-headline`}>
                    <FaFileAlt className="text-5xl mb-3 text-indigo-500 dark:text-indigo-300" />
                    Confirm File Upload
                </h2>
                {selectedFile && (
                    <p className={`mb-5 text-sm text-center font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}
                            font-body leading-relaxed`}>
                        Selected File: <strong className="break-all">{selectedFile.name}</strong> ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                )}
                {uploadMessage && (
                    <div className="bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-lg mb-4 w-full text-center font-semibold
                            font-body">
                        <FaCheckCircle className="inline mr-2" /> {uploadMessage}
                    </div>
                )}
                {uploadError && (
                    <div className="bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg mb-4 w-full text-center font-semibold
                            font-body">
                        <FaExclamationTriangle className="inline mr-2" /> {uploadError}
                    </div>
                )}
                <button
                    onClick={onConfirm}
                    className={`w-full py-4 px-6 rounded-full text-lg font-bold flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed
                        bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-xl
                        hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 active:scale-95 duration-300
                        ${isDark ? 'dark:from-green-700 dark:to-emerald-800 dark:hover:from-green-800 dark:hover:to-emerald-900' : ''}
                        font-button tracking-wide`}
                    disabled={isUploading}
                >
                    {isUploading ? (
                        <>
                            <FaCloudUploadAlt className="mr-3 text-3xl animate-pulse" />
                            Uploading {Math.round(uploadProgress)}%
                        </>
                    ) : (
                        <>
                            <FaCheckCircle className="mr-3 text-3xl" /> Confirm & Upload
                        </>
                    )}
                </button>
                {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const LocalFileUpload = () => {
    const { user, updateStorage } = useUserSession();
    const [localFile, setLocalFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [theme, setTheme] = useState("light");
    const [showModal, setShowModal] = useState(false);
    const [uploadMessage, setUploadMessage] = useState(null);
    const [uploadError, setUploadError] = useState(null);

    // --- FIX: Change 'id' to 'email' (or 'username' if that's your unique ID) ---
    const userId = user?.selected?.email; // Get the user ID (using email as ID)
    const folderId = user?.selected?.driveFolderId;
    const userEmail = user?.selected?.email;
    const currentStorageUsageMb = user?.selected?.currentStorageUsageMb;
    const maxStorageQuotaMb = user?.selected?.maxStorageQuotaMb;
    // --- END FIX ---

    // Removed the useEffect with console.logs

    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = (e) => setTheme(e.matches ? "dark" : "light");
        setTheme(prefersDark.matches ? "dark" : "light");
        prefersDark.addEventListener("change", handler);
        return () => prefersDark.removeEventListener("change", handler);
    }, []);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setLocalFile(file);
            setUploadMessage(null);
            setUploadError(null);
            setShowModal(true);
            event.target.value = null;
        }
    };

    const handleModalUpload = useCallback(async () => {
        if (!localFile) {
            setUploadError("No file selected for upload.");
            return;
        }

        if (!userEmail) {
            setUploadError("User email is missing. Please log in again.");
            return;
        }
        // This check now uses userId which is derived from user?.selected?.email
        if (!userId || !folderId) {
            setUploadError("User authentication data (ID or Drive folder) is missing. Please log in again.");
            return;
        }

        const QUOTA_THRESHOLD_PERCENTAGE = 98;

        if (maxStorageQuotaMb && currentStorageUsageMb !== undefined) {
            const maxQuotaBytes = maxStorageQuotaMb * 1024 * 1024;
            const currentUsageBytes = currentStorageUsageMb * 1024 * 1024;
            const uploadFileSize = localFile.size;
            const quotaThresholdBytes = maxQuotaBytes * (QUOTA_THRESHOLD_PERCENTAGE / 100.0);

            if ((currentUsageBytes + uploadFileSize) > quotaThresholdBytes) {
                const remainingSpaceBeforeThreshold = Math.max(0, quotaThresholdBytes - currentUsageBytes);
                let errorMessage = `Upload aborted: Adding "${localFile.name}" (${formatBytes(uploadFileSize)}) would exceed your ${QUOTA_THRESHOLD_PERCENTAGE}% storage threshold.`;
                if (remainingSpaceBeforeThreshold > 0) {
                    errorMessage += ` You can upload approximately ${formatBytes(remainingSpaceBeforeThreshold)} more before hitting this limit.`;
                } else {
                    errorMessage += ` You are already at or above your ${QUOTA_THRESHOLD_PERCENTAGE}% storage limit. Please delete some files or consider upgrading your plan.`;
                }
                setUploadError(errorMessage);
                setIsUploading(false);
                return;
            }
        } else {
            // Replaced console.warn with setting an error message for user feedback
            setUploadError("Storage quota information is not fully available. Upload might be blocked by backend.");
        }

        setIsUploading(true);
        setUploadProgress(0);
        setUploadMessage(null);
        setUploadError(null);

        try {
            const responseData = await uploadFileToDrive(
                localFile,
                userEmail,
                userId, // Now passing email as the userId
                folderId,
                localFile.size, // ⭐ ADDED THIS LINE: Passing the file size ⭐
                setUploadProgress
            );

            if (responseData.success) {
                setUploadMessage(`File uploaded: ${responseData.fileName}.`);
                updateStorage(responseData.currentStorageUsageMb, responseData.maxStorageQuotaMb);
                setLocalFile(null);
            } else {
                setUploadError(responseData.message || 'File upload failed with an unknown error.');
            }
        } catch (err) {
            // Replaced console.error with setting an error message for user feedback
            setUploadError(err.message || "An unexpected error occurred during upload.");
        } finally {
            setIsUploading(false);
            setTimeout(() => setShowModal(false), 3000);
        }
    }, [localFile, userId, folderId, userEmail, updateStorage, currentStorageUsageMb, maxStorageQuotaMb]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col justify-between h-full transition-shadow duration-300 ease-in-out hover:shadow-xl group cursor-pointer
            font-sans"
            onClick={() => document.getElementById('local-file-input').click()}
        >
            <div className="flex flex-col items-center justify-center flex-grow text-center">
                <FaPlusCircle className="text-purple-500 mb-4" size={60} />
                <h2 className="font-bold text-2xl text-gray-900 dark:text-gray-100 leading-tight
                    font-headline">
                    Add New Document
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2
                    font-body leading-snug">
                    Click to upload a file to your Google Drive.
                </p>
            </div>

            <input
                id="local-file-input"
                type="file"
                accept=".pdf, .doc, .docx, .txt, .jpg, .jpeg, .png, .gif, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain, image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
            />

            <FileDetailsModal
                isOpen={showModal}
                onClose={() => {
                    if (!isUploading) {
                        setShowModal(false);
                        setLocalFile(null);
                        setUploadMessage(null);
                        setUploadError(null);
                    }
                }}
                onConfirm={handleModalUpload}
                selectedFile={localFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                theme={theme}
                uploadMessage={uploadMessage}
                uploadError={uploadError}
            />
        </motion.div>
    );
};

export default LocalFileUpload;