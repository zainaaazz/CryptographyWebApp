import React, { useState } from 'react';
import axios from 'axios';

export default function DESFileEncryptor() {
  const [key, setKey] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadName, setDownloadName] = useState('');
  const [loading, setLoading] = useState(false); // NEW: Progress bar control

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  const handleEncryptOrDecrypt = async (action) => {
    if (!file || key.length !== 24) {
      setError('Please select a file and enter a valid 24-character DES key.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    try {
      setLoading(true); // Start progress bar
      const response = await axios.post(`http://localhost:5000/${action}-file/des`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);

      const fileNameParts = file.name.split('.');
      const baseName = fileNameParts.slice(0, -1).join('.') || file.name;
      const extension = fileNameParts.length > 1 ? '.' + fileNameParts.pop() : '';
      const label = action === 'encrypt' ? 'DESEncrypted' : 'DESDecrypted';
      setDownloadName(`${baseName} - ${label}${extension}`);

      setError('');
    } catch {
      setError('Failed to process file.');
    } finally {
      setLoading(false); // Stop progress bar
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = downloadName;
    a.click();
    URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null); // Hide button after download
  };

  return (
    <div className="container mt-4 text-white">
      <h4 className="mb-3">DES File Encryption (Binary-Safe)</h4>
      {error && <div className="alert alert-danger">{error}</div>}

      <input type="file" className="form-control mb-3" onChange={handleFileChange} />
      <input
        type="text"
        className="form-control mb-3"
        placeholder="Enter 24-character DES key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />

      <div className="d-flex gap-2 mb-3">
        <button className="btn btn-outline-success" onClick={() => handleEncryptOrDecrypt('encrypt')}>
          Encrypt File
        </button>
        <button className="btn btn-outline-warning" onClick={() => handleEncryptOrDecrypt('decrypt')}>
          Decrypt File
        </button>
      </div>

      {loading && (
        <div className="progress mb-3">
          <div
            className="progress-bar progress-bar-striped progress-bar-animated bg-success"
            style={{ width: '100%' }}
          >
            Processing...
          </div>
        </div>
      )}

      {downloadUrl && (
       <button className="btn btn-success" onClick={handleDownload}>
       Download Result
     </button>
     
      )}
    </div>
  );
}
