import { useState } from 'react';
import axios from 'axios';

export default function CustomPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);


  const encryptText = async () => {
    if (!plaintext || !key) return setError('Enter plaintext and key.');
    try {
      const res = await axios.post('http://localhost:5000/encrypt/custom', { plaintext, key });
      setCiphertext(res.data.ciphertext);
      setError('');
    } catch {
      setError('Text encryption failed.');
    }
  };

  const decryptText = async () => {
    if (!ciphertext || !key) return setError('Enter ciphertext and key.');
    try {
      const res = await axios.post('http://localhost:5000/decrypt/custom', { ciphertext, key });
      setDecrypted(res.data.plaintext);
      setError('');
    } catch {
      setError('Text decryption failed.');
    }
  };

  const encryptFile = async () => {
    if (!file || !key) return setError('Select a file and enter a key.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
  
      const res = await axios.post('http://localhost:5000/encrypt-file/custom', formData, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setDownloadProgress(percent);
        }
      });
  
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setFileResult({ url, filename: 'encrypted_' + file.name });
      setError('');
    } catch (err) {
      console.error("🔴 File encryption failed:", err);
      setError('File encryption failed.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };
  

  const decryptFile = async () => {
    if (!file || !key) return setError('Select a file and enter a key.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);
    try {
      setIsDownloading(true);
      setDownloadProgress(0);
  
      const res = await axios.post('http://localhost:5000/decrypt-file/custom', formData, {
        responseType: 'blob',
        onDownloadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setDownloadProgress(percent);
        }
      });
  
      const blob = new Blob([res.data], { type: res.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setFileResult({ url, filename: 'decrypted_' + file.name });
      setError('');
    } catch {
      setError('File decryption failed.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };
  
  return (
    <div className="container mt-4 text-white">
      <h1 className="text-center">Custom - Genetic Mutation Cipher</h1>
      <p className="text-secondary text-center">Applies substitution, noise insertion, and transposition.</p>

      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group">
          <button className={`btn ${activeTab === 'text' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setActiveTab('text')}>Text Encryption</button>
          <button className={`btn ${activeTab === 'file' ? 'btn-success' : 'btn-outline-success'}`} onClick={() => setActiveTab('file')}>File Encryption</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {activeTab === 'text' && (
        <div className="row mb-4">
          <div className="col-md-6 border-end">
            <h4 className="text-success">Encrypt</h4>
            <input className="form-control mb-2" placeholder="Plaintext" value={plaintext} onChange={e => setPlaintext(e.target.value)} />
            <input className="form-control mb-3" placeholder="Key" value={key} onChange={e => setKey(e.target.value)} />
            <button className="btn btn-success" onClick={encryptText}>Encrypt</button>
            <p className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></p>
          </div>

          <div className="col-md-6">
            <h4 className="text-warning">Decrypt</h4>
            <input className="form-control mb-2" placeholder="Ciphertext" value={ciphertext} onChange={e => setCiphertext(e.target.value)} />
            <input className="form-control mb-3" placeholder="Key" value={key} onChange={e => setKey(e.target.value)} />
            <button className="btn btn-warning" onClick={decryptText}>Decrypt</button>
            <p className="mt-3"><strong>Decrypted:</strong> <code>{decrypted}</code></p>
          </div>
        </div>
      )}

      {activeTab === 'file' && (
        <div>
          <input type="file" className="form-control mb-3" onChange={handleFileUpload} />
          <input className="form-control mb-3" placeholder="Key" value={key} onChange={e => setKey(e.target.value)} />
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success" onClick={encryptFile}>Encrypt File</button>
            <button className="btn btn-outline-warning" onClick={decryptFile}>Decrypt File</button>
          </div>
          {isDownloading && (
            <div className="progress my-3 w-100">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                style={{ width: `${downloadProgress}%` }}
              >
                {downloadProgress}%
              </div>
            </div>
          )}

          {fileResult && (
            <a href={fileResult.url} className="btn btn-primary mt-3" download={fileResult.filename}>Download Result</a>
          )}
        </div>
      )}
    </div>
  );
}
