import React, { useState, useEffect, useRef, useCallback } from "react";
import { LuArrowUpDown } from "react-icons/lu";
import { FaRobot, FaEye, FaEyeSlash } from "react-icons/fa"; // Removed FaSun, FaMoon
import { BsTextParagraph, BsFillFileEarmarkTextFill } from "react-icons/bs";
import { RiFontSize, RiFileEditLine } from "react-icons/ri";
import { IoMdDownload } from "react-icons/io";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faEnvelopeOpenText, faFileAlt, faFileUpload, faFileWord } from '@fortawesome/free-solid-svg-icons';

import MiddlePanel from "./Middle";
// REMOVED: import { useTheme } from '../contexts/ThemeContext'; // <-- THIS LINE IS GONE

// --- Re-usable UI Components ---

const MenuItem = ({ icon, text, onClick, isMobile, isActive = false, onMouseEnter, onMouseLeave, disabled = false }) => (
    <button
        className={`flex items-center gap-3 p-3 w-full rounded-lg transition-colors duration-200
            ${isActive
                ? 'bg-blue-200 dark:bg-blue-700 text-blue-800 dark:text-white shadow-inner'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
            }
            ${isMobile ? 'justify-center' : 'justify-start'}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
            group
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''} `}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        disabled={disabled}
    >
        <span className="text-xl text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
            {icon}
        </span>
        {!isMobile && (
            <span className="text-gray-700 dark:text-gray-300 font-medium group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors duration-200">
                {text}
            </span>
        )}
    </button>
);

// --- LeftPanel Component ---

const LeftPanel = ({
    activeEditorType,
    setActiveEditorType,
    generatePdfFromHtml,
    showMessage,
    editorContent,
    pageMargin,
    GOOGLE_FONTS_IMPORT_URLS,
    FONT_WHITELIST,
    COMPANY_LOGO_URL,
    WATERMARK_TEXT,
    getDownloadPdfHtmlTemplate
}) => {
    // REMOVED: const { theme, toggleTheme } = useTheme(); // <-- THIS LINE IS GONE

    const [activePanel, setActivePanel] = useState(null);
    const [detailPanel, setDetailPanel] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [showEditorOptions, setShowEditorOptions] = useState(false);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);

    const swapEditorContainerRef = useRef(null);
    const downloadContainerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1170);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (swapEditorContainerRef.current && !swapEditorContainerRef.current.contains(event.target)) {
                setShowEditorOptions(false);
            }
            if (downloadContainerRef.current && !downloadContainerRef.current.contains(event.target)) {
                setShowDownloadOptions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleMenuClick = (panel) => {
        setActivePanel(panel);
        setDetailPanel(null);
        setShowEditorOptions(false);
        setShowDownloadOptions(false);
        if (isMobile && panel !== "swap-editor" && panel !== "download") {
            setIsSidebarOpen(false);
        }
    };

    const handleMiddlePanelClose = useCallback(() => {
        setActivePanel(null);
        setDetailPanel(null);
        if (isMobile) setIsSidebarOpen(true);
    }, [isMobile]);

    const handleEditorOptionClick = (editorType) => {
        setActiveEditorType(editorType);
        setShowEditorOptions(false);
        setActivePanel(null);
        setDetailPanel(null);
        if (isMobile) setIsSidebarOpen(false);
    };

    const handleDownload = useCallback(async (format) => {
        if (!editorContent || !getDownloadPdfHtmlTemplate) {
            showMessage("Document content or template function not found for download.", "error", 5000);
            return;
        }

        let fileName = "My_Document";
        let mimeType = "text/plain";
        let content = editorContent;

        switch (format) {
            case 'txt':
                fileName += ".txt";
                mimeType = "text/plain";
                const tempDivTxt = document.createElement("div");
                tempDivTxt.innerHTML = editorContent;
                content = tempDivTxt.innerText || tempDivTxt.docxContent;
                break;
            case 'pdf':
                fileName += ".pdf";
                mimeType = "application/pdf";
                if (!generatePdfFromHtml) {
                    showMessage("PDF generation service not available.", "error", 5000);
                    return;
                }

                showMessage("Generating PDF, please wait...", "info", 7000);
                setIsProcessingPdf(true);

                try {
                    const fullHtmlContent = getDownloadPdfHtmlTemplate(
                        editorContent,
                        pageMargin,
                        GOOGLE_FONTS_IMPORT_URLS,
                        FONT_WHITELIST,
                        COMPANY_LOGO_URL,
                        WATERMARK_TEXT
                    );

                    const pdfOptions = {
                        orientation: "portrait",
                        page_size: "A4",
                        margin_top: `${pageMargin}in`,
                        margin_bottom: `${pageMargin}in`,
                        margin_left: `${pageMargin}in`,
                        margin_right: `${pageMargin}in`
                    };

                    const downloadUrl = await generatePdfFromHtml(fullHtmlContent, pdfOptions);

                    if (downloadUrl) {
                        console.log("✅ PDF URL received. Opening in new tab:", downloadUrl);
                        window.open(downloadUrl, "_blank");
                        showMessage("PDF generation complete. Opening in a new tab.", "success", 5000);
                    } else {
                        throw new Error("Download URL not received from the backend.");
                    }
                } catch (error) {
                    console.error("❌ An error occurred during PDF generation:", error);
                    showMessage(`Oops! Failed to generate PDF: ${error.message}.`, "error", 7000);
                } finally {
                    setIsProcessingPdf(false);
                }
                setShowDownloadOptions(false);
                return;
            case 'docx':
                fileName += ".docx";
                mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                showMessage("Initiating DOCX download... Note: For complex documents, server-side conversion is recommended for full fidelity.", "info", 7000);

                const htmlContentForDocx = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Document</title></head><body>${editorContent}</body></html>`;
                content = htmlContentForDocx;
                break;
            default:
                fileName += ".docx";
                mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                const tempDivDefault = document.createElement("div");
                tempDivDefault.innerHTML = editorContent;
                content = tempDivDefault.innerText || tempDivDefault.textContent;
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setShowDownloadOptions(false);
    }, [
        generatePdfFromHtml, showMessage, editorContent, pageMargin,
        GOOGLE_FONTS_IMPORT_URLS, FONT_WHITELIST, COMPANY_LOGO_URL, WATERMARK_TEXT, getDownloadPdfHtmlTemplate
    ]);

    return (
        <div className="relative mt-[100px] h-[calc(100vh)] w-full grid grid-cols-[auto_1fr] items-start overflow-hidden">
            {isMobile && (
                <button
                    className="fixed top-3 right-4 z-[100] bg-white dark:bg-gray-800 p-3 rounded-full shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
                >
                    {isSidebarOpen ? <FaEyeSlash className="text-xl text-gray-700 dark:text-gray-300" /> : <FaEye className="text-xl text-gray-700 dark:text-gray-300" />}
                </button>
            )}

            <div
                className={`
                    ${isMobile ? "fixed top-[80px] left-0 h-[calc(100vh-80px)]" : "relative"}
                    z-50 transition-transform duration-300 ease-in-out
                    ${isMobile ? (isSidebarOpen ? "translate-x-0" : "-translate-x-full") : ""}
                `}
            >
                <aside
                    className={`h-full bg-white/90 dark:bg-gray-900/90 shadow-lg p-2 rounded-r-md backdrop-blur-md
                    ${isMobile ? "w-[4.5rem]" : "lg:w-[14rem]"}
                    font-roboto flex flex-col items-center justify-between py-4`}
                >
                    <nav className="flex flex-col gap-3 w-full px-1">
                        <MenuItem
                            icon={<BsTextParagraph />}
                            text="Templates"
                            onClick={() => handleMenuClick("templates")}
                            isMobile={isMobile}
                            isActive={activePanel === "templates"}
                        />
                        <MenuItem
                            icon={<RiFontSize />}
                            text="Design & Font"
                            onClick={() => handleMenuClick("design-and-font")}
                            isMobile={isMobile}
                            isActive={activePanel === "design-and-font"}
                        />
                        <MenuItem
                            icon={<FaRobot />}
                            text="AI Assistant"
                            onClick={() => handleMenuClick("ai")}
                            isMobile={isMobile}
                            isActive={activePanel === "ai"}
                        />

                        {/* Upload File - New Menu Item */}
                        <MenuItem
                            icon={<FontAwesomeIcon icon={faFileUpload} />}
                            text="Upload File"
                            onClick={() => handleMenuClick("upload-file")}
                            isMobile={isMobile}
                            isActive={activePanel === "upload-file"}
                        />

                        {/* Swap Editor with Hover/Click Dropdown */}
                        <div
                            className="relative w-full"
                            ref={swapEditorContainerRef}
                            onMouseEnter={() => !isMobile && setShowEditorOptions(true)}
                            onMouseLeave={() => !isMobile && setShowEditorOptions(false)}
                        >
                            <MenuItem
                                icon={<LuArrowUpDown />}
                                text="Swap Editor"
                                onClick={() => {
                                    if (isMobile) {
                                        setShowEditorOptions(!showEditorOptions);
                                        setActivePanel(null);
                                        setDetailPanel(null);
                                    }
                                }}
                                isMobile={isMobile}
                                isActive={showEditorOptions || !!activeEditorType}
                            />
                            {showEditorOptions && (
                                <div
                                    id="editor-options-dropdown"
                                    className={`absolute ${isMobile ? 'top-full left-0 mt-1' : 'left-full top-0 -ml-2'}
                                        w-full ${isMobile ? 'min-w-[150px]' : 'w-[10rem]'} bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50
                                        flex flex-col gap-1 transition-all duration-200 ease-out transform
                                        ${showEditorOptions ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`
                                    }
                                >
                                    <button
                                        className={`flex items-center gap-2 p-2 w-full rounded-md text-sm
                                            ${activeEditorType === 'cover-letter' ? 'bg-green-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`
                                        }
                                        onClick={() => handleEditorOptionClick('cover-letter')}
                                    >
                                        <FontAwesomeIcon icon={faEnvelopeOpenText} className="text-base" /> Cover Letter
                                    </button>
                                    <button
                                        className={`flex items-center gap-2 p-2 w-full rounded-md text-sm
                                            ${activeEditorType === 'resume-editor' ? 'bg-purple-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`
                                        }
                                        onClick={() => handleEditorOptionClick('resume-editor')}
                                    >
                                        <FontAwesomeIcon icon={faFileAlt} className="text-base" /> Resume Editor
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* End Swap Editor with Dropdown */}

                        <MenuItem
                            icon={<BsFillFileEarmarkTextFill />}
                            text="GitHub Reference"
                            onClick={() => handleMenuClick("github")}
                            isMobile={isMobile}
                            isActive={activePanel === "github"}
                        />
                        <MenuItem
                            icon={<RiFileEditLine />}
                            text="ATS Guidelines"
                            onClick={() => handleMenuClick("rearrange")}
                            isMobile={isMobile}
                            isActive={activePanel === "rearrange"}
                        />
                        <MenuItem
                            icon={<RiFileEditLine />}
                            text="Check Your Score"
                            onClick={() => handleMenuClick("atscore")}
                            isMobile={isMobile}
                            isActive={activePanel === "atscore"}
                        />

                        {/* Download with Hover/Click Dropdown */}
                        <div
                            className="relative w-full"
                            ref={downloadContainerRef}
                            onMouseEnter={() => !isMobile && setShowDownloadOptions(true)}
                            onMouseLeave={() => !isMobile && setShowDownloadOptions(false)}
                        >
                            <MenuItem
                                icon={<IoMdDownload />}
                                text={isProcessingPdf ? "Generating..." : "Download"}
                                onClick={() => {
                                    if (isMobile) {
                                        setShowDownloadOptions(!showDownloadOptions);
                                        setActivePanel(null);
                                        setDetailPanel(null);
                                    } else {
                                        handleDownload('pdf');
                                    }
                                }}
                                isMobile={isMobile}
                                isActive={showDownloadOptions || isProcessingPdf}
                                disabled={isProcessingPdf}
                            />
                            {showDownloadOptions && (
                                <div
                                    id="download-options-dropdown"
                                    className={`absolute ${isMobile ? 'top-full left-0 mt-1' : 'left-full top-0 -ml-2'}
                                        w-full ${isMobile ? 'min-w-[150px]' : 'w-[10rem]'} bg-white dark:bg-gray-800 rounded-lg shadow-xl py-2 z-50
                                        flex flex-col gap-1 transition-all duration-200 ease-out transform
                                        ${showDownloadOptions ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`
                                    }
                                >
                                    <button
                                        className="flex items-center gap-2 p-2 w-full rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        onClick={() => handleDownload('pdf')}
                                        disabled={isProcessingPdf}
                                    >
                                        <FontAwesomeIcon icon={faFilePdf} className="text-base" /> Export .pdf
                                    </button>
                                    <button
                                        className="flex items-center gap-2 p-2 w-full rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        onClick={() => handleDownload('txt')}
                                        disabled={isProcessingPdf}
                                    >
                                        <BsFillFileEarmarkTextFill className="text-base" /> Export .docx
                                    </button>
                                    <button
                                        className="flex items-center gap-2 p-2 w-full rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                                        onClick={() => handleDownload('docx')}
                                        disabled={isProcessingPdf}
                                    >
                                        <FontAwesomeIcon icon={faFileWord} className="text-base" /> Export .txt
                                    </button>
                                </div>
                            )}
                        </div>
                        {/* End Download with Dropdown */}

                    </nav>

                    {/* Removed the theme toggle button as it relies on `useTheme` */}
                    {/* If you still want a theme toggle, it needs to be placed where `useTheme` is accessible,
                        e.g., in a parent component or if you re-introduce useTheme here. */}

                </aside>
            </div>

            {activePanel && (
                <div className="relative w-full overflow-visible">
                    <MiddlePanel
                        activePanel={activePanel}
                        setActivePanel={setActivePanel}
                        detailPanel={detailPanel}
                        setDetailPanel={setDetailPanel}
                        onCloseWithSidebarOpen={handleMiddlePanelClose}
                    />
                </div>
            )}
        </div>
    );
};

export default LeftPanel;