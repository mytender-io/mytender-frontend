import React, { useRef, useEffect, useState } from "react";
import { Spinner } from "@/components/ui/spinner";

const PDFViewer = ({ pdfUrl, isLoading, onClose }) => {
  const modalRef = useRef(null);
  const [iframeKey, setIframeKey] = useState(Date.now()); // Force iframe refresh if needed

  useEffect(() => {
    // Prevent body scrolling when modal is open
    document.body.style.overflow = "hidden";
   
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
   
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
   
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
   
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  // Reload iframe if PDF URL changes
  useEffect(() => {
    if (pdfUrl) {
      setIframeKey(Date.now());
    }
  }, [pdfUrl]);
  
  return (
    <>
      {/* Separate overlay div that covers the entire viewport */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen bg-black/50 backdrop-blur-sm z-[9999]"
        style={{ margin: 0, padding: 0 }}
        onClick={onClose}
      />
     
      {/* Modal content */}
      <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center z-[10000]">
        <div
          ref={modalRef}
          className="bg-white rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col shadow-2xl"
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-bold">Document Viewer</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl focus:outline-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div className="relative flex-1 w-full overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
                <Spinner />
              </div>
            )}
            {!pdfUrl && !isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50">
                <div className="text-2xl text-gray-600 mb-4">No PDF Found</div>
                <div className="text-gray-500">
                  Please try uploading the file again
                </div>
              </div>
            ) : (
              <iframe
                key={iframeKey}
                src={pdfUrl}
                className="w-full h-full border-0"
                title="PDF Viewer"
                // Removed restrictive sandbox settings
                allow="fullscreen"
                loading="eager"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PDFViewer;