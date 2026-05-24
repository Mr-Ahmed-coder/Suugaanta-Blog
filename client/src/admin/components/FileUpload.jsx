import React, { useState, useRef } from "react";
import { uploadMediaFile } from "../services/uploadService";

// Standard file size limits on frontend for immediate UX warnings
const LIMITS = {
  image: { size: 5 * 1024 * 1024, label: "5MB" },
  audio: { size: 20 * 1024 * 1024, label: "20MB" },
  document: { size: 10 * 1024 * 1024, label: "10MB" },
};

function FileUpload({ label, type, value, onChange, onUploadStart, onUploadEnd }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    setError("");
    setProgress(0);

    // Front-end size validation
    const config = LIMITS[type] || { size: 5 * 1024 * 1024, label: "5MB" };
    if (file.size > config.size) {
      setError(`File exceeds maximum allowed size of ${config.label}.`);
      return;
    }

    setUploading(true);
    if (onUploadStart) onUploadStart();

    try {
      const response = await uploadMediaFile(file, type, (percent) => {
        setProgress(percent);
      });
      
      if (response.success && response.url) {
        onChange(response.url);
      } else {
        setError("Upload failed.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Upload error occurred.");
    } finally {
      setUploading(false);
      if (onUploadEnd) onUploadEnd();
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileSelectChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const onTriggerClick = () => {
    fileInputRef.current.click();
  };

  const handleRemove = () => {
    onChange("");
    setProgress(0);
    setError("");
  };

  return (
    <div className="space-y-2 text-left">
      <label className="block text-xs font-semibold uppercase tracking-wider text-brand-green-900">
        {label}
      </label>

      {/* Preview and Upload Canvas */}
      {value ? (
        <div className="rounded-2xl border border-brand-gold/20 bg-brand-cream/10 p-4 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex flex-1 items-center gap-3 overflow-hidden">
            {type === "image" && (
              <img
                src={value}
                alt="Upload Preview"
                className="h-16 w-16 rounded-xl border border-brand-gold/15 object-cover object-center shadow-sm flex-shrink-0"
              />
            )}
            
            <div className="overflow-hidden text-left flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-gold-dark block">
                {type === "image" ? "📷 IMAGE UPLOADED" : type === "audio" ? "🎵 AUDIO UPLOADED" : "📄 PDF DOCUMENT"}
              </span>
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-brand-green-950 underline truncate block hover:text-brand-gold-dark transition"
              >
                {value}
              </a>

              {type === "audio" && (
                <audio src={value} controls className="h-8 mt-2 w-full max-w-sm rounded-lg" />
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-bold text-red-700 hover:bg-red-100 hover:text-red-900 transition flex-shrink-0"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={onTriggerClick}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
            dragActive
              ? "border-brand-green-900 bg-brand-green-50/10"
              : "border-brand-gold/30 bg-brand-cream/5 hover:border-brand-green-900 hover:bg-brand-cream/10"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileSelectChange}
            accept={type === "image" ? "image/*" : type === "audio" ? "audio/*" : ".pdf"}
            className="hidden"
          />

          <span className="text-3xl mb-2">
            {uploading ? "⏳" : type === "image" ? "📷" : type === "audio" ? "🎵" : "📄"}
          </span>

          {uploading ? (
            <div className="w-full max-w-xs space-y-2">
              <p className="text-xs font-semibold text-brand-green-950">Uploading... ({progress}%)</p>
              <div className="h-1.5 w-full rounded-full bg-brand-cream/35 overflow-hidden">
                <div
                  className="h-full bg-brand-green-900 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-xs font-bold text-brand-green-950">
                Drag and drop file here, or click to browse
              </p>
              <p className="text-[10px] text-brand-green-700/60 mt-1 uppercase tracking-wider">
                {type === "image" ? "Images (JPG, PNG, WEBP) Max 5MB" : type === "audio" ? "Audio (MP3, WAV, OGG) Max 20MB" : "Document (PDF) Max 10MB"}
              </p>
            </div>
          )}

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-semibold text-red-800">
              ⚠️ {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
