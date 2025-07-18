// FileDetailsModal.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Modal from "./Modal";
import AlertDialog from "./AlertDialog";
import {
    FaFilePdf, FaFileImage, FaFileAlt, FaFileWord, FaFileExcel, FaFilePowerpoint, FaFileCode,
} from "react-icons/fa";

import RenameTab from "../Dashboard/components/RenameTab";
import PermissionTab from "../Dashboard/components/PermissionTab";
import ExportTab from "../Dashboard/components/ExportTab";

import { formatBytes, formatDate } from "../../../../utils/FileUtil";
import { useUserSession } from '../../../../hooks/useUserSession';

// <--- ADD THIS IMPORT
import ErrorPopup from "../../../Shared/ErrorPopup"; // Adjust path as needed, assuming it's up two directories from FileDetailsModal

// Define comprehensive export options for Google Workspace file types
const GOOGLE_WORKSPACE_EXPORT_OPTIONS = {
    "application/vnd.google-apps.document": [
        { label: "PDF Document", mimeType: "application/pdf", extension: "pdf" },
        { label: "Microsoft Word", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: "docx" },
        { label: "OpenDocument Text", mimeType: "application/vnd.oasis.opendocument.text", extension: "odt" },
        { label: "Rich Text Format", mimeType: "application/rtf", extension: "rtf" },
        { label: "Plain Text", mimeType: "text/plain", extension: "txt" },
        { label: "Web Page", mimeType: "application/zip", extension: "zip" }, // HTML download comes as zip
        { label: "EPUB Publication", mimeType: "application/epub+zip", extension: "epub" },
    ],
    "application/vnd.google-apps.spreadsheet": [
        { label: "Microsoft Excel", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", extension: "xlsx" },
        { label: "OpenDocument Sheet", mimeType: "application/vnd.oasis.opendocument.spreadsheet", extension: "ods" },
        { label: "PDF Document", mimeType: "application/pdf", extension: "pdf" },
        { label: "Comma Separated Values", mimeType: "text/csv", extension: "csv" },
        { label: "Tab Separated Values", mimeType: "text/tab-separated-values", extension: "tsv" },
        { label: "Web Page", mimeType: "application/zip", extension: "zip" }, // HTML download comes as zip
    ],
    "application/vnd.google-apps.presentation": [
        { label: "Microsoft PowerPoint", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: "pptx" },
        { label: "OpenDocument Presentation", mimeType: "application/vnd.oasis.opendocument.presentation", extension: "odp" },
        { label: "PDF Document", mimeType: "application/pdf", extension: "pdf" },
        { label: "Plain Text", mimeType: "text/plain", extension: "txt" },
        { label: "JPEG image", mimeType: "image/jpeg", extension: "jpeg" },
        { label: "PNG image", mimeType: "image/png", extension: "png" },
        { label: "Scalable Vector Graphics", mimeType: "image/svg+xml", extension: "svg" },
    ],
};

const FileDetailsModal = ({
    isOpen,
    onClose,
    file,
    onRenameSuccess,
    onPermissionUpdateSuccess,
    onExportSuccess,
    userEmail,
    userDriveQuotaMb,
    userCurrentUsageMb,
    userAuthProvider,
}) => {
    const [newFileName, setNewFileName] = useState("");
    const [targetEmail, setTargetEmail] = useState("");
    const [selectedPermissionOption, setSelectedPermissionOption] = useState("reader");

    const [isLoading, setIsLoading] = useState(false);
    // Keep AlertDialog for success/info messages that require user dismissal
    const [alert, setAlert] = useState({ isOpen: false, title: "", message: "", type: "info" });
    // <--- ADD THIS STATE FOR ERROR POPUP
    const [currentError, setCurrentError] = useState(null); 

    const [currentActiveTab, setCurrentActiveTab] = useState("rename");

    const { user } = useUserSession();
    const authToken = user?.selected?.token || '';

    useEffect(() => {
        if (file) {
            setNewFileName(file.fileName || "");
            setTargetEmail("");
            setSelectedPermissionOption("reader");
            setIsLoading(false);
            setAlert({ isOpen: false, title: "", message: "", type: "info" });
            setCurrentError(null); // <--- RESET currentError ON FILE/MODAL OPEN
            setCurrentActiveTab("rename");
        }
    }, [file, isOpen]);

    const getFileIcon = (mimeType) => {
        if (!mimeType) return <FaFileAlt className="text-gray-500" size={36} />;
        if (mimeType.includes("pdf")) return <FaFilePdf className="text-red-500" size={36} />;
        if (mimeType.includes("image")) return <FaFileImage className="text-blue-500" size={36} />;
        if (
            mimeType.includes("wordprocessingml") ||
            mimeType.includes("doc") ||
            mimeType.includes("msword")
        )
            return <FaFileWord className="text-blue-600" size={36} />;
        if (mimeType.includes("spreadsheetml") || mimeType.includes("xls"))
            return <FaFileExcel className="text-green-600" size={36} />;
        if (mimeType.includes("presentationml") || mimeType.includes("ppt"))
            return <FaFilePowerpoint className="text-orange-600" size={36} />;
        if (mimeType.includes("text/plain") || mimeType.includes("text/html"))
            return <FaFileAlt className="text-gray-500" size={36} />;
        if (mimeType.includes("code") || mimeType.includes("json"))
            return <FaFileCode className="text-purple-500" size={36} />;
        return <FaFileAlt className="text-gray-500" size={36} />;
    };

    const handleRename = useCallback(async () => {
        setCurrentError(null); // <--- Clear previous error before new attempt
        if (!file || !userEmail || !newFileName.trim()) {
            setCurrentError("File or new file name is missing."); // <--- USE setCurrentError
            return;
        }
        if (newFileName.trim() === file.fileName) {
            setAlert({ isOpen: true, title: "No Change", message: "New file name is the same as the current file name.", type: "info" });
            return;
        }
        if (!authToken) {
            setCurrentError("Authentication token is missing. Please log in."); // <--- USE setCurrentError
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const endpoint = userAuthProvider === 'WEBSITE' ? "https://localhost:8081/ace/local/rename" : "https://localhost:8081/ace/drive/rename";

            const response = await axios.post(endpoint, {
                userEmail: userEmail,
                fileId: file.driveFileId,
                newFileName: newFileName,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (response.data.success) {
                setAlert({ isOpen: true, title: "Success!", message: `${file.fileName} successfully renamed to ${newFileName}.`, type: "success" });
                onRenameSuccess(file.driveFileId, newFileName, response.data.webViewLink);
            } else {
                setCurrentError(response.data.message || "Failed to rename file."); // <--- USE setCurrentError
            }
        } catch (error) {
            setCurrentError(error.response?.data?.message || "An unexpected error occurred during rename."); // <--- USE setCurrentError
        } finally {
            setIsLoading(false);
        }
    }, [file, userEmail, newFileName, onRenameSuccess, userAuthProvider, authToken]);

    const handlePermissionUpdate = useCallback(async () => {
        setCurrentError(null); // <--- Clear previous error before new attempt
        if (!file || !userEmail || !targetEmail.trim() || !selectedPermissionOption) {
            setCurrentError("All fields (email, permission type) are required."); // <--- USE setCurrentError
            return;
        }

        const action = selectedPermissionOption === "remove_all" ? "remove" : "add";
        const role = selectedPermissionOption;

        if (targetEmail.trim().toLowerCase() === userEmail.toLowerCase()) {
            setAlert({ isOpen: true, title: "Cannot Modify Self", message: "You cannot change your own permissions for this file.", type: "info" });
            return;
        }
        if (!authToken) {
            setCurrentError("Authentication token is missing. Please log in."); // <--- USE setCurrentError
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                userEmail: userEmail,
                fileId: file.driveFileId,
                targetEmail: targetEmail.trim(),
                action: action,
                role: role,
            };

            const response = await axios.post("https://api.techquanta.tech/ace/drive/update-permission", payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (response.data.success) {
                setAlert({ isOpen: true, title: "Success!", message: response.data.message, type: "success" });
                onPermissionUpdateSuccess(file.driveFileId, targetEmail, role, action);
                setTargetEmail("");
                setSelectedPermissionOption("reader");
            } else {
                setCurrentError(response.data.message || "Failed to update permissions."); // <--- USE setCurrentError
            }
        } catch (error) {
            setCurrentError(error.response?.data?.message || "An unexpected error occurred during permission update."); // <--- USE setCurrentError
        } finally {
            setIsLoading(false);
        }
    }, [file, userEmail, targetEmail, selectedPermissionOption, onPermissionUpdateSuccess, authToken]);

    const handleDirectDownload = useCallback((selectedFormat = null) => {
        setCurrentError(null); // <--- Clear previous error before new attempt
        if (!file || !file.driveFileId) {
            setCurrentError("File ID is missing for direct download."); // <--- USE setCurrentError
            return;
        }

        setIsLoading(true);

        let downloadUrl = `https://drive.google.com/uc?export=download&id=${file.driveFileId}`;
        let suggestedFileName = file.fileName;
        let alertMessage = `"${file.fileName}" download initiated.`;

        const isGoogleWorkspaceFile = !!GOOGLE_WORKSPACE_EXPORT_OPTIONS[file.fileMimeType];

        if (isGoogleWorkspaceFile && selectedFormat) {
            downloadUrl += `&mimeType=${selectedFormat.mimeType}`;
            const baseName = file.fileName.includes('.')
                ? file.fileName.substring(0, file.fileName.lastIndexOf('.'))
                : file.fileName;
            suggestedFileName = `${baseName}.${selectedFormat.extension}`;
            alertMessage = `"${suggestedFileName}" download initiated (exported as ${selectedFormat.extension.toUpperCase()}).`;
        } else {
            suggestedFileName = file.fileName;
            if (!suggestedFileName.includes('.') && file.fileMimeType) {
                if (file.fileMimeType.includes('image/jpeg')) suggestedFileName += '.jpeg';
                else if (file.fileMimeType.includes('image/png')) suggestedFileName += '.png';
                else if (file.fileMimeType.includes('application/pdf')) suggestedFileName += '.pdf';
            }
        }

        try {
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = suggestedFileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            setAlert({ isOpen: true, title: "Download Started", message: alertMessage, type: "success" });
            onExportSuccess(file.driveFileId, selectedFormat ? selectedFormat.mimeType : file.fileMimeType, suggestedFileName);
        } catch (error) {
            setCurrentError("Failed to initiate download. Please ensure you have access to the file and your browser allows downloads."); // <--- USE setCurrentError
        } finally {
            setTimeout(() => setIsLoading(false), 500);
        }
    }, [file, onExportSuccess]);

    if (!file) return null;

    const availableExportFormats = GOOGLE_WORKSPACE_EXPORT_OPTIONS[file.fileMimeType] || [];
    const isExportableGoogleWorkspaceFile = availableExportFormats.length > 0;

    const fileInfoPanel = (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-inner flex flex-col items-center justify-start gap-4 p-4 text-gray-700 dark:text-gray-300 h-full overflow-y-auto font-body">
            <div className="mb-4">
                {file.thumbnailLink ? (
                    <img
                        src={file.thumbnailLink}
                        alt={`Thumbnail for ${file.fileName}`}
                        className="w-24 h-24 object-contain rounded-md"
                        onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.alt = 'Thumbnail failed to load. Showing icon instead.'; e.target.replaceWith(getFileIcon(file.fileMimeType)) }}
                    />
                ) : (
                    getFileIcon(file.fileMimeType)
                )}
            </div>
            <h3 className="font-headline font-bold text-xl text-gray-900 dark:text-gray-100 text-center line-clamp-2 break-all leading-tight">
                {file.fileName}
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-400 w-full space-y-2 font-body leading-relaxed">
                <p className="flex justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Type:
                    </span>{" "}
                    <span>{file.fileMimeType || "N/A"}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Uploaded:
                    </span>{" "}
                    <span>{formatDate(file.uploadedAt)}</span>
                </p>
                <p className="flex justify-between">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Size:
                    </span>{" "}
                    <span>{formatBytes(file.fileSizeInBytes)}</span>
                </p>
                {file.webViewLink && userAuthProvider !== 'WEBSITE' && (
                    <p className="flex justify-between items-center break-all">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                            Link:
                        </span>{" "}
                        <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline text-sm ml-2 font-label"
                        >
                            Open in Drive
                        </a>
                    </p>
                )}
            </div>
            <div className="mt-6 w-full text-center text-sm text-gray-500 dark:text-gray-400 font-body leading-normal">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Storage Usage:</p>
                <p>
                    {formatBytes(userCurrentUsageMb * 1024 * 1024)} of{" "}
                    {formatBytes(userDriveQuotaMb * 1024 * 1024)}{" "}
                    ({((userCurrentUsageMb / userDriveQuotaMb) * 100).toFixed(2)}% used)
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2">
                    <div
                        className="bg-purple-600 h-2.5 rounded-full"
                        style={{ width: `${(userCurrentUsageMb / userDriveQuotaMb) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );

    const allTabs = [
        {
            id: "rename",
            label: "Rename File",
            content: (
                <RenameTab
                    newFileName={newFileName}
                    setNewFileName={setNewFileName}
                    handleRename={handleRename}
                    isLoading={isLoading}
                    file={file}
                />
            ),
        },
        {
            id: "permission",
            label: "Change Permission",
            content: (
                <PermissionTab
                    targetEmail={targetEmail}
                    setTargetEmail={setTargetEmail}
                    selectedPermissionOption={selectedPermissionOption}
                    setSelectedPermissionOption={setSelectedPermissionOption}
                    handlePermissionUpdate={handlePermissionUpdate}
                    isLoading={isLoading}
                    userEmail={userEmail}
                />
            ),
        },
        {
            id: "export",
            label: "Download File",
            content: (
                <ExportTab
                    handleDownloadClick={handleDirectDownload}
                    isLoading={isLoading}
                    availableExportFormats={availableExportFormats}
                    isGoogleWorkspaceFile={isExportableGoogleWorkspaceFile}
                />
            ),
        },
    ];

    const tabsConfiguration = allTabs.filter(tab => {
        if (userAuthProvider === 'WEBSITE') {
            return tab.id === 'rename';
        }
        return true;
    });


    return (
        <> {/* <--- ADDED FRAGMENT HERE */}
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title={"File Operations"}
                fixedContentLeft={fileInfoPanel}
                tabsConfig={tabsConfiguration}
                activeTab={currentActiveTab}
                setActiveTab={setCurrentActiveTab}
            >
                <AlertDialog
                    isOpen={alert.isOpen}
                    onClose={() => setAlert({ ...alert, isOpen: false })}
                    title={alert.title}
                    message={alert.message}
                    type={alert.type}
                />
            </Modal>
            {/* <--- ADD THIS COMPONENT FOR ERROR POPUP */}
            <ErrorPopup error={currentError} /> 
        </> // <--- ADDED FRAGMENT HERE
    );
};

export default FileDetailsModal;