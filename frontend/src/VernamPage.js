import { useState } from 'react';
import axios from 'axios';

export default function VernamPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [realKey, setRealKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);

  const generateKey = async (length) => {
    setError('');
    setMessage('');
  
    const downloadKeyAsTxt = (keyStr) => {
      const blob = new Blob([keyStr], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'vernam_key.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };
  
    if (length > 1048576) { // > 1MB
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
  
        await navigator.clipboard.writeText(response.data);
        setMessage('✔ Key copied to clipboard');
  
        setRealKey(response.data);
        setKey('Key generated successfully. Too large to display.');
  
        // Always download large key
        downloadKeyAsTxt(response.data);
  
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
      setRealKey(result);
      await navigator.clipboard.writeText(result);
      setMessage('✔ Key copied to clipboard');
  
      // Ask user if they want to download the key
      if (window.confirm("Would you like to download the generated key as a text file?")) {
        downloadKeyAsTxt(result);
      }
    }
  };
  

  const encryptText = async () => {
    setError('');
    setMessage('');
    const usedKey = key.includes('Too large') ? realKey : key;
    if (!usedKey || plaintext.length !== usedKey.length)
      return setError('Key must match plaintext length.');
    try {
      const response = await axios.post('http://localhost:5000/encrypt/vernam', { plaintext, key: usedKey });
      setCiphertext(response.data.ciphertext);
    } catch {
      setError('Text encryption failed.');
    }
  };

  const decryptText = async () => {
    setError('');
    setMessage('');
    const decoded = atob(ciphertext);
    const usedKey = key.includes('Too large') ? realKey : key;
    if (!usedKey || decoded.length !== usedKey.length)
      return setError('Key must match ciphertext length.');
    try {
      const response = await axios.post('http://localhost:5000/decrypt/vernam', { ciphertext, key: usedKey });
      setDecryptedText(response.data.plaintext);
    } catch {
      setError('Text decryption failed.');
    }
  };

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const encryptOrDecryptFile = async (action) => {
    setError('');
    setMessage('');
    const usedKey = key.includes('Too large') ? realKey : key;
    if (!file || !usedKey || usedKey.length !== file.size)
      return setError(`Key must match file size (file: ${file.size} bytes, key: ${usedKey.length} bytes)`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', usedKey);

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
      {message && <div className="alert alert-success">{message}</div>}

      {activeTab === 'text' && (
        <div className="row mb-4">
          <div className="col-md-6 border-end">
            <h4 className="text-success">Encrypt</h4>
            <input className="form-control mb-2" placeholder="Plaintext" value={plaintext} onChange={e => setPlaintext(e.target.value)} />
            <div className="input-group mb-3">
              <input className="form-control" placeholder="Key (same length)" value={key} onChange={e => {
                setKey(e.target.value);
                setRealKey(e.target.value);
              }} />
              <button className="btn btn-outline-secondary" onClick={() => generateKey(plaintext.length || 8)}>🔑 Generate</button>
            </div>
            <button className="btn btn-success" onClick={encryptText}>Encrypt</button>
            <p className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></p>
          </div>

          <div className="col-md-6">
            <h4 className="text-warning">Decrypt</h4>
            <input className="form-control mb-2" placeholder="Base64 Ciphertext" value={ciphertext} onChange={e => setCiphertext(e.target.value)} />
            <input className="form-control mb-3" placeholder="Key (same length)" value={key} onChange={e => {
              setKey(e.target.value);
              setRealKey(e.target.value);
            }} />
            <button className="btn btn-warning" onClick={decryptText}>Decrypt</button>
            <p className="mt-3"><strong>Decrypted:</strong> <code>{decryptedText}</code></p>
          </div>
        </div>
      )}

      {activeTab === 'file' && (
        <div className="text-white">
          <input type="file" className="form-control mb-3" onChange={handleFileUpload} />
          <div className="input-group mb-3">
            <input className="form-control" placeholder="Key (same byte length as file)" value={key} readOnly={key.includes('Too large')} onChange={(e) => {
              setKey(e.target.value);
              setRealKey(e.target.value);
            }} />
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
