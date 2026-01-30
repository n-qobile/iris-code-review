import React, { useRef } from "react";
import { uploadImage, analyzeImage } from "../services/api";

function UploadSection({ onUploadComplete }) {
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      console.log("Uploading:", file.name);
      const uploadedImage = await uploadImage(file);

      console.log("Analyzing image...");
      await analyzeImage(uploadedImage.id);

      alert("Image uploaded and analysed successfully!");
      if (onUploadComplete) onUploadComplete();
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div
      className="upload-section"
      onClick={() => fileInputRef.current?.click()}
    >
      <div className="upload-content">
        <div className="upload-icon">👁️</div>
        <h2 className="upload-title">Upload Your Images</h2>
        <p className="upload-subtitle">
          Drag and drop or click to browse your files
        </p>
        <button className="btn-primary" onClick={(e) => e.stopPropagation()}>
          Choose Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
}

export default UploadSection;
