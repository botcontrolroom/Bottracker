import React, { useState } from "react";

const Popup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleDownload = () => {
    const fileUrl = "/Book1.xlsx"; // Ensure the file is in the /public folder
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "Bot List.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Trigger Link */}
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className="text-blue-500 text-sm"
      >
        Get Template
      </a>

      {/* Overlay & Popup */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          ></div>

          {/* Responsive Popup */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-11/12 sm:w-[750px] bg-white p-6 rounded-lg shadow-lg z-50  max-h-[90vh] overflow-auto">
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-xl"
              onClick={() => setIsOpen(false)}
            >
              &times;
            </button>

            {/* Title & Description */}
            <h2 className="text-lg font-semibold">Instruction</h2>
            <p className="text-gray-700 my-3 text-sm sm:text-base">
              To import Bot data in bulk, you need an Excel file as per the
              structure below. You can download a sample template from the link
              below.
            </p>

            {/* Image Section */}

            <div className="mb-4 flex justify-center">
              <img
                src="/instruction.png" // Ensure this image is inside the public folder
                alt="instruction"
                className="w-full sm:w-70 h-32 sm:h-70 object-cover rounded-lg"
              />
            </div>

            <p className="text-gray-700 my-3 text-sm sm:text-base">
              Caution:
              <br></br>
              1. For the Timing section, always place a period "." after AM/PM,
              and ensure there is a space before and after the hyphen "-" .
              <br></br>
              2. For the Platform section, always use the exact spelling and
              proper spacing.
              <br></br>"Blue prism" <br></br> "Automation anywhere" <br></br>
              "Power Automate Desktop" <br></br> "UiPath" <br></br>"Power
              Automate Cloud" <br></br>
              3. For the Days section, selecting 5 days will include Monday to
              Friday, while selecting 7 days will include Monday to Sunday.
              Other numbers will not work.
            </p>

            {/* Download Button */}
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-md w-full sm:w-auto"
              onClick={handleDownload}
            >
              Download Sample
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Popup;
