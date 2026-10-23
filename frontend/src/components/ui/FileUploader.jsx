import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import './FileUploader.css';

export const FileUploader = ({
  onFileSelect,
  acceptedFormats = ['.pdf', '.jpg', '.jpeg', '.png'],
  maxSizeMB = 10,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const validateAndHandle = (file) => {
    setError(null);
    if (!file) return;

    // Check size
    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > maxSizeMB) {
      setError(`File exceeds maximum allowed limit of ${maxSizeMB}MB.`);
      return;
    }

    // Check extension
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFormats.includes(ext)) {
      setError(`Invalid format. Allowed: ${acceptedFormats.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndHandle(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="curasync-uploader-container">
      <div
        className={`curasync-uploader ${isDragOver ? 'curasync-uploader--dragover' : ''} ${selectedFile ? 'curasync-uploader--has-file' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept={acceptedFormats.join(',')}
          onChange={(e) => e.target.files && validateAndHandle(e.target.files[0])}
          style={{ display: 'none' }}
        />

        {selectedFile ? (
          <div className="curasync-uploader__preview">
            <CheckCircle2 size={36} className="curasync-uploader__check" />
            <div className="curasync-uploader__info">
              <span className="curasync-uploader__filename">{selectedFile.name}</span>
              <span className="curasync-uploader__filesize">
                {(selectedFile.size / 1024).toFixed(1)} KB — Ready to Process
              </span>
            </div>
            <button
              type="button"
              className="curasync-uploader__change"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
            >
              Change
            </button>
          </div>
        ) : (
          <div className="curasync-uploader__prompt">
            <div className="curasync-uploader__icon-wrap">
              <UploadCloud size={32} className="curasync-uploader__cloud" />
            </div>
            <h3 className="curasync-uploader__title">DROP YOUR REPORT HERE</h3>
            <p className="curasync-uploader__sub">or click to browse from your device</p>
            <span className="curasync-uploader__formats">Supports PDF, JPG, PNG up to {maxSizeMB}MB</span>
          </div>
        )}
      </div>

      {error && (
        <div className="curasync-uploader__err-msg">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
