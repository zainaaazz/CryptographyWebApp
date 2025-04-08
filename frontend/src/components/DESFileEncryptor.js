import React, { useState } from 'react';
import axios from 'axios';

export default function DESFileEncryptor() {
  const [key, setKey] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleEncryptOrDecrypt = async (action) => {
    if (!file || key.length !== 24) {
      setError('Please select a file and enter a valid 24-character DES key.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    try {
      const response = await axios.post(`http://localhost:5000/${action}-file/des`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setError('');
    } catch {
      setError('Failed to process file.');
    }
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

      {downloadUrl && (
        <a href={downloadUrl} className="btn btn-primary" download>
          Download Result
        </a>
      )}
    </div>
  );
}
