import React, { useState } from 'react';
import axios from 'axios';

export default function AESFileEncryptor() {
  const [key, setKey] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const encryptOrDecrypt = async (action) => {
    if (!file || key.length !== 16) {
      setError('Please select a file and ensure the key is 16 characters.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    try {
      const response = await axios.post(`http://localhost:5000/${action}-file/aes`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setError('');
    } catch (err) {
      setError('Failed to process file.');
    }
  };

  return (
    <div className="container mt-5 text-white">
      <h3>🔐 AES File Encryption (Binary-Safe)</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <input
        type="file"
        className="form-control mb-3"
        onChange={handleUpload}
      />

      <input
        type="text"
        className="form-control mb-3"
        placeholder="Enter 16-character AES key"
        value={key}
        onChange={(e) => setKey(e.target.value)}
      />

      <div className="d-flex gap-3 mb-3">
        <button className="btn btn-outline-success" onClick={() => encryptOrDecrypt('encrypt')}>
          Encrypt File
        </button>
        <button className="btn btn-outline-warning" onClick={() => encryptOrDecrypt('decrypt')}>
          Decrypt File
        </button>
      </div>

      {downloadUrl && (
        <a href={downloadUrl} download className="btn btn-primary">
          Download Result
        </a>
      )}
    </div>
  );
}
