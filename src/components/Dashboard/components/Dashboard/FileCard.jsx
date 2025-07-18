import React from "react";
import { motion } from "framer-motion";
import {
    FaFilePdf,
    FaFileImage,
    FaFileAlt,
    FaFileWord,
    FaFileExcel,
    FaFilePowerpoint,
    FaFileCode,
    // Existing Icons for Actions
    FaCog, // For "Change Permissions" (represents settings/configuration) - an alternative to FaShareAlt
} from "react-icons/fa";

// Assuming these utility functions exist in this path
import { formatBytes, formatDate } from "../../../../utils/FileUtil";

/**
 * Renders a card for a single file, displaying its details and available actions.
 * @param {object} props - Component props.
 * @param {object} props.file - The file object with details like fileName, mimeType, size, etc.
 * @param {function} props.handleAction - Callback function to handle various file actions (e.g., delete, download).
 * @param {function} props.onFileNameClick - Callback function when the file name is clicked, typically to open a details modal.
 * @returns {JSX.Element} The FileCard component.
 */
function FileCard({ file, handleAction, onFileNameClick }) {
    /**
     * Determines the appropriate icon based on the file's MIME type.
     * This is used as a fallback if no thumbnailLink is available.
     * @param {string} mimeType - The MIME type of the file.
     * @returns {JSX.Element} The React-icon component for the file type.
     */
    const getFileIcon = (mimeType) => {
        if (!mimeType) return <FaFileAlt className="text-gray-500" size={36} />;
        if (mimeType.includes("pdf"))
            return <FaFilePdf className="text-red-500" size={36} />;
        if (mimeType.includes("image"))
            return <FaFileImage className="text-blue-500" size={36} />;
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

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative p-3 rounded-xl shadow-lg  backdrop-blur-sm  bg-white dark:bg-gray-900 flex flex-col justify-between h-full transition-shadow duration-300 ease-in-out hover:shadow-xl group font-body" // Apply font-body to the card itself
        >
            <div className="flex items-start gap-4 mb-2">
                {/* CONDITIONAL RENDERING FOR THUMBNAIL OR ICON */}
                {file.thumbnailLink ? (
                    <img
                        src={file.thumbnailLink}
                        alt={`Thumbnail for ${file.fileName}`}
                        className="w-12 h-12 object-contain rounded-md flex-shrink-0"
                        onError={(e) => { e.target.onerror = null; e.target.src = ''; e.target.alt = 'Thumbnail failed to load. Showing icon instead.'; e.target.replaceWith(getFileIcon(file.fileMimeType)) }}
                    />
                ) : (
                    getFileIcon(file.fileMimeType)
                )}
                <h2
                    className="font-headline font-bold text-xl text-gray-900 dark:text-gray-100 flex-grow leading-tight cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 line-clamp-2" // Apply font-headline
                    onClick={() => onFileNameClick(file)}
                    title={file.fileName} // Add title for full filename on hover
                >
                    {file.fileName}
                </h2>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 flex flex-col gap-2 font-body leading-relaxed"> {/* Apply font-body and leading-relaxed */}
                <p>
                    <span className="font-semibold text-gray-800 dark:text-gray-200"> {/* font-semibold is good here */}
                        Uploaded:
                    </span>{" "}
                    {formatDate(file.uploadedAt)}
                </p>
                <p>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                        Size:
                    </span>{" "}
                    {formatBytes(file.fileSizeInBytes)}
                </p>
            </div>
        </motion.div>
    );
}

export default FileCard;