import { useState } from 'react';
import axios from 'axios';

export default function VernamPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);

  const generateKey = async (length) => {
    if (length > 65536) {
      try {
        setGenerating(true);
        setProgress(0);

        const interval = setInterval(() => {
          setProgress((prev) => (prev >= 95 ? prev : prev + 1));
        }, 30);

        const response = await axios.post(
          'http://localhost:5000/generate-vernam-key',
          { fileSize: length },
          { headers: { 'Content-Type': 'application/json' } }
        );

        clearInterval(interval);
        setProgress(100);
        setKey(response.data);
        navigator.clipboard.writeText(response.data);
      } catch (error) {
        console.error(error);
        setError('Failed to generate large random key.');
      } finally {
        setTimeout(() => setGenerating(false), 300);
      }
    } else {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      setKey(result);
      navigator.clipboard.writeText(result);
    }
  };

  const encryptText = async () => {
    if (!key || plaintext.length !== key.length)
      return setError('Key must match plaintext length.');
    try {
      const response = await axios.post('http://localhost:5000/encrypt/vernam', { plaintext, key });
      setCiphertext(response.data.ciphertext);
      setError('');
    } catch {
      setError('Text encryption failed.');
    }
  };

  const decryptText = async () => {
    const decoded = atob(ciphertext);
    if (!key || decoded.length !== key.length)
      return setError('Key must match ciphertext length.');
    try {
      const response = await axios.post('http://localhost:5000/decrypt/vernam', { ciphertext, key });
      setDecryptedText(response.data.plaintext);
      setError('');
    } catch {
      setError('Text decryption failed.');
    }
  };

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const encryptOrDecryptFile = async (action) => {
    if (!file || !key || key.length !== file.size)
      return setError(`Key must match file size (file: ${file.size} bytes, key: ${key.length} bytes)`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);

    try {
      const response = await axios.post(`http://localhost:5000/${action}-file/vernam`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      let filename = action === 'encrypt' ? 'encrypted.vernam' : 'decrypted_output';
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blob = new Blob([response.data], { type: response.headers['content-type'] || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);

      setError('');
    } catch {
      setError('File encryption/decryption failed.');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-light text-center">Vernam Cipher</h1>
      <p className="text-secondary text-center">
        A symmetric cipher that uses XOR — the key must match the length of the message or file.
      </p>

      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group">
          <button className={`btn ${activeTab === 'text' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setActiveTab('text')}>
            Text Encryption
          </button>
          <button className={`btn ${activeTab === 'file' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setActiveTab('file')}>
            File Encryption
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeTab === 'text' && (
        <div className="row mb-4">
          <div className="col-md-6 border-end">
            <h4 className="text-success">Encrypt</h4>
            <input className="form-control mb-2" placeholder="Plaintext" value={plaintext} onChange={e => setPlaintext(e.target.value)} />
            <div className="input-group mb-3">
              <input className="form-control" placeholder="Key (same length)" value={key} onChange={e => setKey(e.target.value)} />
              <button className="btn btn-outline-secondary" onClick={() => generateKey(plaintext.length || 8)}>🔑 Generate</button>
            </div>
            <button className="btn btn-success" onClick={encryptText}>Encrypt</button>
            <p className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></p>
          </div>

          <div className="col-md-6">
            <h4 className="text-warning">Decrypt</h4>
            <input className="form-control mb-2" placeholder="Base64 Ciphertext" value={ciphertext} onChange={e => setCiphertext(e.target.value)} />
            <input className="form-control mb-3" placeholder="Key (same length)" value={key} onChange={e => setKey(e.target.value)} />
            <button className="btn btn-warning" onClick={decryptText}>Decrypt</button>
            <p className="mt-3"><strong>Decrypted:</strong> <code>{decryptedText}</code></p>
          </div>
        </div>
      )}

      {activeTab === 'file' && (
        <div className="text-white">
          <input type="file" className="form-control mb-3" onChange={handleFileUpload} />
          <div className="input-group mb-3">
            <input className="form-control" placeholder="Key (same byte length as file)" value={key} onChange={(e) => setKey(e.target.value)} />
            <button className="btn btn-outline-secondary" onClick={() => generateKey(file?.size || 8)}>🔑 Generate</button>
          </div>

          {generating && (
            <div className="progress mb-3 w-100">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"

                role="progressbar"
                style={{ width: `${progress}%` }}
              >
                {progress}%
              </div>
            </div>
          )}

          <div className="d-flex gap-3 mb-3">
            <button className="btn btn-outline-success" onClick={() => encryptOrDecryptFile('encrypt')}>Encrypt File</button>
            <button className="btn btn-outline-warning" onClick={() => encryptOrDecryptFile('decrypt')}>Decrypt File</button>
          </div>
          {fileResult && <a href={fileResult} className="btn btn-primary" download>Download Result</a>}
        </div>
      )}
    </div>
  );
}
