// src/pages/MainPageWrapper.jsx
import React,{ useState } from "react";
import LeftPanel from "../components/Home/LeftPanel";
import RightContent from "../components/Home/RightContent"; // Uncommented and will be created

const MainPageWrapper = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);
  // State to control which editor is active in the RightContent area
  const [activeEditorType, setActiveEditorType] = useState('cover-letter'); // Default to resume editor

  const openPdfViewer = (doc) => {
    setSelectedPdf(doc);
    setShowPdfModal(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen bg-none ">
      {/* LeftPanel: 100% width on mobile, 2/4 (50%) on desktop.
          It receives the state and setter for activeEditorType. */}
      <div className="w-full md:w-2/4 h-full">
        <LeftPanel
          activeEditorType={activeEditorType}
          setActiveEditorType={setActiveEditorType}
        />
      </div>

      {/* RightContent: 100% width on mobile, 2/4 (50%) on desktop.
          It receives activeEditorType to render the correct editor. */}
      <div className="w-full md:w-2/4 h-screen">
        <RightContent
          activeEditorType={activeEditorType}
          // You can pass other props if needed, e.g., documents, modals
          // documents={documents}
          // setShowCreateModal={setShowCreateModal}
          // openPdfViewer={openPdfViewer}
        />
      </div>

    </div>
  );
};

export default MainPageWrapper;