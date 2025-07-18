import React, { useState, useEffect, useCallback, Suspense, lazy, useRef } from "react";
import axios from "axios";
import { useRecoilState } from "recoil"; // useRecoilValue not needed if using useRecoilState for userState
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, UploadCloud, RefreshCw } from "lucide-react";

import { userState } from "../../../services/authatom";
import { useUserSession } from "../../../hooks/useUserSession";
import { filesState, filesLoadingState, filesErrorState } from "../../../services/fileatom";
import Loading from "../../Shared/Loading";

import FileCard from "../components/Dashboard/FileCard";

// --- Lazy Loadable Components ---
const AlertDialog = lazy(() => import("../components/Dashboard/AlertDialog"));
const ConfirmDialog = lazy(() => import("../components/Dashboard/ConfirmDialog"));
const FileDetailsModal = lazy(() => import("../components/Dashboard/FileDetailsModal"));
const TemplateReplicateModal = lazy(() => import("../components/Dashboard/TemplateReplicateModal"));
const LocalFileUpload = lazy(() => import("../components/EditingComponents/components/Upload/LocalFileUpload"));

// --- Helper Functions (keep these separate and clean) ---
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
    return date.toLocaleDateString(undefined, options);
};

// --- Dashboard Component ---
export default function Dashboard() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [files, setFiles] = useRecoilState(filesState);
    const [loading, setLoading] = useRecoilState(filesLoadingState);
    const [error, setError] = useRecoilState(filesErrorState);

    const [userRecoilData, setUserRecoilData] = useRecoilState(userState);
    // Ensure user object is properly accessed, whether it's directly the user data or nested under 'selected'
    const user = userRecoilData?.selected || userRecoilData;

    // updateStorage is not directly used in this component's logic flow,
    // it's likely handled by useUserSession, so no direct removal needed here.
    // const { updateStorage } = useUserSession();

    const [showAlertDialog, setShowAlertDialog] = useState(false);
    const [alertDialogProps, setAlertDialogProps] = useState({ title: '', message: '', type: 'info' });

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmDialogProps, setConfirmDialogProps] = useState({ title: '', message: '', onConfirm: () => {} });

    const [showFileDetailsModal, setShowFileDetailsModal] = useState(false);
    const [selectedFileForDetails, setSelectedFileForDetails] = useState(null);
    const [initialActionForDetailsModal, setInitialActionForDetailsModal] = useState(null);

    const [showTemplateReplicateModal, setShowTemplateReplicateModal] = useState(false);
    const [templateToReplicate, setTemplateToReplicate] = useState(null);

    const [showLocalFileUploadModal, setShowLocalFileUploadModal] = useState(false);

    const currentPage = parseInt(searchParams.get("page")) || 0;

    const filteredAndSearchedFiles = files.filter(file => {
        const lowerCaseFileName = file.fileName ? file.fileName.toLowerCase() : "";
        const matchesSearch = searchTerm ? lowerCaseFileName.includes(searchTerm.toLowerCase()) : true;

        switch (currentPage) {
            case 0: return matchesSearch; // All documents
            case 1: return matchesSearch && lowerCaseFileName.includes('resume');
            case 2: return matchesSearch && lowerCaseFileName.includes('cover letter');
            default: return matchesSearch;
        }
    });

    const tabs = [
        { label: "All documents", query: 0, count: `(${files.length})` },
        { label: "Resumes", query: 1, count: `(${files.filter(f => (f.fileName || "").toLowerCase().includes('resume')).length})` },
        { label: "Cover letters", query: 2, count: `(${files.filter(f => (f.fileName || "").toLowerCase().includes('cover letter')).length})` },
    ];

    // --- Refs for controlling fetch behavior ---
    const isFetchingRef = useRef(false); // Prevents simultaneous API calls
    const hasFetchedInitialDataRef = useRef(false); // Ensures initial fetch runs only once successfully
    const lastFetchHadNoFilesRef = useRef(false); // Track if the last fetch resulted in no files

    // --- initiateFilesFetch: The ONLY core API calling function ---
    const initiateFilesFetch = useCallback(async (forceSpinner = false) => {
        const { email, driveFolderId, token, authProvider } = user || {};

        if (isFetchingRef.current) {
            // Already fetching, do nothing
            return;
        }

        // Essential user data check: If missing, set error and return.
        if (!email || !driveFolderId || !token) {
            // Only update error state if it's different to prevent unnecessary re-renders
            if (error !== "User information or authentication token unavailable for file fetch.") {
                setFiles([]); // Clear files if user data becomes invalid
                setLoading(false); // Ensure loading is off
                setError("User information or authentication token unavailable for file fetch.");
            }
            hasFetchedInitialDataRef.current = false; // Reset the flag if user data becomes incomplete
            lastFetchHadNoFilesRef.current = true; // Mark as no files found since we couldn't even fetch
            return;
        }

        isFetchingRef.current = true;
        // Set loading to true only if it's an initial fetch, a forced refresh, or there are no files currently
        if (!hasFetchedInitialDataRef.current || forceSpinner || files.length === 0) {
            setLoading(true);
        }
        setError(null); // Clear previous errors before attempting a new fetch
        lastFetchHadNoFilesRef.current = false; // Reset before new fetch

        try {
            const endpoint = authProvider === 'WEBSITE' ? "https://api.techquanta.tech/ace/local/files" : "https://api.techquanta.tech/ace/drive/files";

            const response = await axios.post(endpoint, {
                userEmail: email,
                folderId: driveFolderId,
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                timeout: 10000 // 10 seconds
            });

            if (response.data.success) {
                setFiles(response.data.files);
                hasFetchedInitialDataRef.current = true;
                if (response.data.files.length === 0) {
                    lastFetchHadNoFilesRef.current = true;
                }

                // --- Update user storage information in Recoil userState ---
                if (response.data.currentStorageUsageMb !== undefined && response.data.maxStorageQuotaMb !== undefined) {
                    setUserRecoilData(prevUserData => ({
                        ...prevUserData,
                        selected: {
                            ...prevUserData.selected,
                            currentStorageUsageMb: response.data.currentStorageUsageMb,
                            maxStorageQuotaMb: response.data.maxStorageQuotaMb
                        }
                    }));
                }

            } else {
                setError(response.data.message || "Failed to retrieve files.");
                setFiles([]); // Clear files on API error
                hasFetchedInitialDataRef.current = false; // Reset flag if fetch failed, allowing retry
                lastFetchHadNoFilesRef.current = true; // Mark as no files found
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.code === 'ECONNABORTED') {
                setError("File retrieval timed out. The server took too long to respond. Please refresh to try again.");
            } else {
                setError(err.response?.data?.message || "An unexpected network error occurred while fetching files.");
            }
            setFiles([]);
            hasFetchedInitialDataRef.current = false; // Reset flag if fetch failed, allowing retry
            lastFetchHadNoFilesRef.current = true; // Mark as no files found due to error
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [user, setFiles, setLoading, setError, setUserRecoilData, files.length, error]); // Add files.length and error to deps

    // --- useEffect for Initial Data Fetch on Component Mount / User Data Ready ---
    useEffect(() => {
        const { email, driveFolderId, token } = user || {};

        // Only fetch if user data is complete AND we haven't successfully fetched initial data yet
        if (email && driveFolderId && token && !hasFetchedInitialDataRef.current) {
            initiateFilesFetch(true); // Force spinner for initial load
        } else if ((!email || !driveFolderId || !token) && files.length > 0) { // If user data becomes invalid AFTER existing files are loaded
            // Clear files and error, but don't re-trigger fetch automatically unless user data is restored
            setFiles([]);
            setError("User information or authentication token unavailable. Please log in.");
            setLoading(false);
            hasFetchedInitialDataRef.current = false;
            lastFetchHadNoFilesRef.current = true;
        }
        // The dependency array only needs the user parts that *would* change and trigger a re-fetch.
        // `initiateFilesFetch` itself is already wrapped in useCallback and depends on `user`,
        // so we don't need to add `user` as a dependency here again, just the specific properties.
    }, [user?.email, user?.driveFolderId, user?.token, initiateFilesFetch, setFiles, setLoading, setError, files.length]);


    // --- handleFileNameClick: Opens the FileDetailsModal for a given file ---
    const handleFileNameClick = useCallback((file) => {
        setSelectedFileForDetails(file);
        setInitialActionForDetailsModal(null);
        setShowFileDetailsModal(true);
    }, []);

    // --- Handler for closing FileDetailsModal ---
    const handleCloseFileDetailsModal = useCallback(() => {
        setShowFileDetailsModal(false);
        setSelectedFileForDetails(null);
        setInitialActionForDetailsModal(null);
    }, []);

    // --- Handlers for actions that should re-fetch data ---
    const handleUploadSuccess = useCallback(() => {
        setShowLocalFileUploadModal(false);
        initiateFilesFetch(true); // Force spinner to show immediate feedback for new file
    }, [initiateFilesFetch]);

    const handleReplicateSuccess = useCallback(() => {
        setShowTemplateReplicateModal(false);
        initiateFilesFetch(true); // Force spinner to show immediate feedback for new file
    }, [initiateFilesFetch]);

    const handleAction = useCallback(async (action, driveFileId, webViewLink, fileName) => {
        const { email, driveFolderId, token, authProvider } = user || {};

        if (!email || !driveFolderId || !token) {
            setAlertDialogProps({ title: "Authentication Required", message: "Please log in to perform this action, or your token is missing.", type: "error" });
            setShowAlertDialog(true);
            return;
        }

        const fileToActOn = files.find(f => f.driveFileId === driveFileId);
        if (!fileToActOn) {
            setAlertDialogProps({ title: "Error", message: "File details not found for this action.", type: "error" });
            setShowAlertDialog(true);
            return;
        }

        setSelectedFileForDetails(fileToActOn);
        setLoading(true);

        try {
            const BASE_URL_FOR_ACTIONS = authProvider === 'WEBSITE' ? "https://api.techquanta.tech/ace/local" : "https://api.techquanta.tech/ace/drive";

            switch (action) {
                case "open":
                    if (authProvider === 'WEBSITE') {
                        setAlertDialogProps({ title: "Local File", message: "This file is stored locally and does not have a direct web view link.", type: "info" });
                        setShowAlertDialog(true);
                    } else if (webViewLink) {
                        window.open(webViewLink, '_blank');
                    } else {
                        setAlertDialogProps({ title: "No View Link", message: "This file does not have a direct web view link.", type: "info" });
                        setShowAlertDialog(true);
                    }
                    break;
                case "replicate":
                    setTemplateToReplicate(fileToActOn);
                    setShowTemplateReplicateModal(true);
                    break;
                case "permission":
                    if (authProvider === 'WEBSITE') {
                        setAlertDialogProps({ title: "Action Not Available", message: "Permission changes are not available for locally stored files.", type: "info" });
                        setShowAlertDialog(true);
                        return;
                    }
                    setInitialActionForDetailsModal("permission");
                    setShowFileDetailsModal(true);
                    break;
                case "export":
                    if (authProvider === 'WEBSITE') {
                        setAlertDialogProps({ title: "Action Not Available", message: "Export functionality is not available for locally stored files in this manner.", type: "info" });
                        setShowAlertDialog(true);
                        return;
                    }
                    setInitialActionForDetailsModal("export");
                    setShowFileDetailsModal(true);
                    break;
                case "download":
                    const downloadResponse = await fetch(`${BASE_URL_FOR_ACTIONS}/download/${driveFileId}?userEmail=${encodeURIComponent(email)}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!downloadResponse.ok) {
                        const errorText = await downloadResponse.text();
                        throw new Error(`Failed to download: ${downloadResponse.status} - ${errorText}`);
                    }

                    const blob = await downloadResponse.blob();
                    const link = document.createElement('a');
                    link.href = window.URL.createObjectURL(blob);

                    const contentDisposition = downloadResponse.headers.get('content-disposition');
                    let downloadedFileName = fileName;
                    if (contentDisposition) {
                        const filenameMatch = contentDisposition.match(/filename\*?=['"]?(?:UTF-\d['"]*)?([^;\n]*?)['"]?$/i);
                        if (filenameMatch && filenameMatch[1]) {
                            downloadedFileName = decodeURIComponent(filenameMatch[1].replace(/\+/g, ' '));
                        }
                    }
                    link.setAttribute('download', downloadedFileName);

                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(link.href);

                    setAlertDialogProps({ title: "Download Initiated", message: `"${downloadedFileName}" download started.`, type: "success" });
                    setShowAlertDialog(true);
                    break;
                case "delete":
                    setConfirmDialogProps({
                        title: "Confirm Deletion",
                        message: `Are you sure you want to delete "${fileName}"? This action cannot be undone.`,
                        onConfirm: async () => {
                            try {
                                const response = await axios.delete(`${BASE_URL_FOR_ACTIONS}/delete`, {
                                    data: {
                                        userEmail: email,
                                        fileId: driveFileId,
                                    },
                                    headers: {
                                        'Authorization': `Bearer ${token}`
                                    }
                                });
                                if (response.data.success) {
                                    setFiles(prevFiles => prevFiles.filter(file => file.driveFileId !== driveFileId));
                                    setAlertDialogProps({ title: "Success", message: `${fileName} deleted successfully!`, type: "success" });
                                    setShowAlertDialog(true);
                                    // Update user storage information after deletion
                                    if (response.data.currentStorageUsageMb !== undefined && response.data.maxStorageQuotaMb !== undefined) {
                                        setUserRecoilData(prevUserData => ({
                                            ...prevUserData,
                                            selected: {
                                                ...prevUserData.selected,
                                                currentStorageUsageMb: response.data.currentStorageUsageMb,
                                                maxStorageQuotaMb: response.data.maxStorageQuotaMb
                                            }
                                        }));
                                    }
                                } else {
                                    setAlertDialogProps({ title: "Deletion Failed", message: response.data.message || "Failed to delete file.", type: "error" });
                                    setShowAlertDialog(true);
                                }
                            } catch (err) {
                                setAlertDialogProps({ title: "Error", message: err.response?.data?.message || `An error occurred while trying to delete ${fileName}.`, type: "error" });
                                setShowAlertDialog(true);
                            } finally {
                                // No need to set loading here again, it's handled by the outer finally or the specific action
                            }
                        }
                    });
                    setShowConfirmDialog(true);
                    break;
                default:
                    setAlertDialogProps({ title: "Unknown Action", message: "This action is not recognized.", type: "error" });
                    setShowAlertDialog(true);
            }
        } catch (err) {
            setAlertDialogProps({ title: "Action Error", message: err.message || `An unexpected error occurred while trying to ${action} ${fileName}. Please try again.`, type: "error" });
            setShowAlertDialog(true);
        } finally {
            setLoading(false); // Ensure loading is turned off after any action attempt
        }
    }, [user, files, setFiles, setUserRecoilData, setAlertDialogProps, setShowAlertDialog, setConfirmDialogProps, setShowConfirmDialog, setSelectedFileForDetails, setShowFileDetailsModal, setInitialActionForDetailsModal, setTemplateToReplicate, setShowTemplateReplicateModal, setLoading]);


    const handleRenameSuccess = useCallback((fileId, newName, newWebViewLink) => {
        setFiles(prevFiles =>
            prevFiles.map(file =>
                file.driveFileId === fileId ? { ...file, fileName: newName, webViewLink: newWebViewLink } : file
            )
        );
        setSelectedFileForDetails(prevDetails =>
            prevDetails && prevDetails.driveFileId === fileId ? { ...prevDetails, fileName: newName, webViewLink: newWebViewLink } : prevDetails
        );
    }, [setFiles]);

    const handlePermissionUpdateSuccess = useCallback(() => {
        initiateFilesFetch(false); // Re-fetch, but don't force spinner unless necessary
    }, [initiateFilesFetch]);

    const handleExportSuccess = useCallback((fileId, exportMimeType, exportedFileName) => {
        // Only refetch if a Google Docs/Sheets/Slides file was created, as it would appear in the list.
        // Other exports are downloads, not new files in the user's drive/local storage.
        if (exportMimeType.includes('google-apps')) {
            initiateFilesFetch(false);
        }
    }, [initiateFilesFetch]);

    const handleAddNewDocumentClick = useCallback(() => {
        if (!user?.email || !user?.driveFolderId) {
            setAlertDialogProps({ title: "Authentication Required", message: "Please log in to upload documents.", type: "error" });
            setShowAlertDialog(true);
            return;
        }
        setShowLocalFileUploadModal(true);
    }, [user?.email, user?.driveFolderId, setAlertDialogProps, setShowAlertDialog]);

    const handleRefreshClick = useCallback(() => {
        initiateFilesFetch(true); // Always force spinner and re-fetch when refresh is clicked
    }, [initiateFilesFetch]);


    const renderSectionContent = () => {
        const baseGridClass = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6";

        // Display Loading spinner if an initial fetch is in progress or a forced refresh is happening
        // or if files are empty and loading is true (e.g., after an action that clears files and refetches)
        if (loading && (!hasFetchedInitialDataRef.current || isFetchingRef.current || files.length === 0)) {
            return (
                <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center min-h-[60vh] w-full"
                >
                    <Loading />
                </motion.div>
            );
        }

        // Display error message if there's an error AND we don't have existing files
        if (error && files.length === 0) {
            return (
                <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] w-full text-red-600 dark:text-red-400 text-center px-4"
                >
                    <p className="text-xl font-semibold mb-2">Oops! Something went wrong.</p>
                    <p>{error}</p>
                    <button
                        onClick={handleRefreshClick}
                        className="mt-4 inline-flex items-center px-6 py-2 bg-blue-600 text-white font-semibold rounded-md shadow hover:bg-blue-700 transition-colors duration-200 gap-2"
                    >
                        <RefreshCw size={18} /> Refresh
                    </button>
                </motion.div>
            );
        }

        // Display 'No documents' message if files are empty AND we've completed an initial fetch
        // AND the last fetch explicitly resulted in no files (to distinguish from error states)
        if (files.length === 0 && searchTerm === '' && currentPage === 0 && hasFetchedInitialDataRef.current && lastFetchHadNoFilesRef.current) {
            return (
                <motion.div
                    key="no-files-initial"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center py-16 px-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800"
                >
                    <UploadCloud className="w-20 h-20 mx-auto mb-6 text-purple-500 dark:text-purple-400 animate-pulse" />
                    <h2 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 mb-4">
                        Your Document Vault Awaits!
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
                        Looks like your digital vault is currently empty. This is the perfect spot for all your important career documents.
                    </p>
                    <button
                        className="inline-flex items-center px-8 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-lg hover:bg-purple-700 transform hover:scale-105 transition-all duration-300 ease-in-out gap-2"
                        onClick={handleAddNewDocumentClick}
                    >
                        <Plus size={20} />
                        Upload Your First Document
                    </button>
                    <button
                        onClick={handleRefreshClick}
                        className="mt-4 inline-flex items-center px-6 py-2 bg-gray-600 text-white font-semibold rounded-md shadow hover:bg-gray-700 transition-colors duration-200 gap-2"
                    >
                        <RefreshCw size={18} /> Check for Documents
                    </button>
                </motion.div>
            );
        }

        // Display 'No results found' for search/filter, regardless of initial fetch status
        if (filteredAndSearchedFiles.length === 0 && (searchTerm !== '' || currentPage !== 0) && hasFetchedInitialDataRef.current) {
            return (
                <motion.div
                    key="no-results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center min-h-[60vh] w-full text-center px-4"
                >
                    <div className="text-gray-600 dark:text-gray-400 mt-8">
                        <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-xl font-semibold mb-2">No documents found matching your criteria.</p>
                        <p>Try adjusting your search or selecting a different tab.</p>
                    </div>
                </motion.div>
            );
        }

        // Display file cards if there are files and we've completed the initial fetch
        if (hasFetchedInitialDataRef.current && filteredAndSearchedFiles.length > 0) {
            return (
                <motion.div
                    key="files-present"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4 }}
                    className={baseGridClass}
                >
                    <AnimatePresence>
                        {filteredAndSearchedFiles.map((file) => (
                            <FileCard
                                key={file.mongoFileId || file.driveFileId}
                                file={file}
                                handleAction={handleAction}
                                onFileNameClick={handleFileNameClick}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            );
        }
        return null;
    };

    return (
        <div className="h-full w-full pt-[70px] text-gray-800 dark:text-gray-100 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6 ">
                <h1 className="text-xl sm:text-2xl font-semibold text-center sm:text-left">
                    Welcome back,{" "}
                    <span className="text-purple-600 dark:text-purple-400 font-pacifico">
                        {user?.username || user?.email?.split('@')[0] || "Guest"}
                    </span>
                    !
                </h1>

                <div className="relative flex items-center w-full sm:w-80">
                    <Search className="absolute left-3 text-gray-500 dark:text-gray-400" size={18} />
                    <input
                        type="search"
                        placeholder="Search documents..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200 shadow-sm"
                    />
                </div>
            </div>

            <div className="flex justify-center mb-8">
                <nav className="flex flex-wrap justify-center
                                gap-x-6 gap-y-2 sm:gap-x-8 lg:gap-x-12
                                border-b border-gray-300 dark:border-gray-700 pb-2
                                font-inter
                                w-full sm:w-auto
                                overflow-x-auto whitespace-nowrap scrollbar-hide">
                    {tabs.map((tab, idx) => (
                        <button
                            key={idx}
                            className={`
                                whitespace-nowrap px-4 py-2 rounded-t-lg transition-all duration-200 relative
                                ${currentPage === tab.query
                                    ? "text-purple-700 dark:text-purple-400 font-semibold bg-gray-50 dark:bg-gray-800"
                                    : "text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-gray-100 dark:hover:bg-gray-800"}
                                ${currentPage === tab.query && "border-b-2 border-purple-600 dark:border-purple-500"}
                            `}
                            onClick={() => {
                                setSearchParams({ page: tab.query });
                                setSearchTerm(""); // Clear search when changing tabs
                            }}
                        >
                            {tab.label} {tab.count}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="py-4">
                <AnimatePresence mode="wait">
                    {renderSectionContent()}
                </AnimatePresence>
            </div>

            {/* Modals and Dialogs */}
            <Suspense fallback={null}>
                {showAlertDialog && (
                    <AlertDialog
                        title={alertDialogProps.title}
                        message={alertDialogProps.message}
                        type={alertDialogProps.type}
                        onClose={() => setShowAlertDialog(false)}
                    />
                )}
                {showConfirmDialog && (
                    <ConfirmDialog
                        title={confirmDialogProps.title}
                        message={confirmDialogProps.message}
                        onConfirm={confirmDialogProps.onConfirm}
                        onCancel={() => setShowConfirmDialog(false)}
                    />
                )}
                {showFileDetailsModal && selectedFileForDetails && (
                    <FileDetailsModal
                        file={selectedFileForDetails}
                        onClose={handleCloseFileDetailsModal}
                        onRenameSuccess={handleRenameSuccess}
                        onPermissionUpdateSuccess={handlePermissionUpdateSuccess}
                        onExportSuccess={handleExportSuccess}
                        initialAction={initialActionForDetailsModal}
                        userEmail={user?.email} // Pass user email for backend calls
                        userToken={user?.token} // Pass user token for backend calls
                        authProvider={user?.authProvider} // Pass authProvider for local vs drive
                        driveFolderId={user?.driveFolderId} // Pass driveFolderId for relevant actions
                    />
                )}
                {showTemplateReplicateModal && templateToReplicate && (
                    <TemplateReplicateModal
                        templateFile={templateToReplicate}
                        onClose={() => setShowTemplateReplicateModal(false)}
                        onReplicateSuccess={handleReplicateSuccess}
                        userEmail={user?.email}
                        userToken={user?.token}
                        driveFolderId={user?.driveFolderId}
                        authProvider={user?.authProvider}
                    />
                )}
                {showLocalFileUploadModal && (
                    <LocalFileUpload
                        onClose={() => setShowLocalFileUploadModal(false)}
                        onUploadSuccess={handleUploadSuccess}
                        userEmail={user?.email}
                        userToken={user?.token}
                        driveFolderId={user?.driveFolderId}
                        authProvider={user?.authProvider}
                    />
                )}
            </Suspense>
        </div>
    );
}