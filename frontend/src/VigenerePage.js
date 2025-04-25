import { useState } from 'react';
import axios from 'axios';

export default function VigenerePage() {
  const [activeTab, setActiveTab] = useState('text');
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState('');
  const [error, setError] = useState('');

  const generateKey = (length) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setKey(result);
    navigator.clipboard.writeText(result);
  };

  const encryptText = async () => {
    if (!key) return setError('Please enter a key.');
    try {
      const response = await axios.post('http://localhost:5000/encrypt/vigenere', { plaintext, key });
      setCiphertext(response.data.ciphertext);
      setError('');
    } catch {
      setError('Text encryption failed.');
    }
  };

  const decryptText = async () => {
    if (!key) return setError('Please enter a key.');
    try {
      const response = await axios.post('http://localhost:5000/decrypt/vigenere', { ciphertext, key });
      setDecryptedText(response.data.plaintext);
      setError('');
    } catch {
      setError('Text decryption failed.');
    }
  };

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const encryptOrDecryptFile = async (action) => {
    if (!file || !key) return setError('Select a file and enter a key.');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('key', key);
    try {
      const response = await axios.post(`http://localhost:5000/${action}-file/vigenere`, formData, {
        responseType: 'blob',
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      // Get the original filename from the response headers
      const contentDisposition = response.headers['content-disposition'];
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : `${action}ed_${file.name}`;
      
      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = URL.createObjectURL(blob);
      setFileResult({ url, filename });
      setError('');
    } catch {
      setError('File encryption/decryption failed.');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-light text-center">Vigenère Cipher</h1>
      <p className="text-secondary text-center">
        A polyalphabetic cipher using key-based character shifts.
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
              <input className="form-control" placeholder="Key" value={key} onChange={e => setKey(e.target.value)} />
              <button className="btn btn-outline-secondary" onClick={() => generateKey(plaintext.length || 8)}>🔑 Generate</button>
            </div>
            <button className="btn btn-success" onClick={encryptText}>Encrypt</button>
            <p className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></p>
          </div>

          <div className="col-md-6">
            <h4 className="text-warning">Decrypt</h4>
            <input className="form-control mb-2" placeholder="Ciphertext" value={ciphertext} onChange={e => setCiphertext(e.target.value)} />
            <input className="form-control mb-3" placeholder="Key" value={key} onChange={e => setKey(e.target.value)} />
            <button className="btn btn-warning" onClick={decryptText}>Decrypt</button>
            <p className="mt-3"><strong>Decrypted:</strong> <code>{decryptedText}</code></p>
          </div>
        </div>
      )}

      {activeTab === 'file' && (
        <div className="text-white">
          <input type="file" className="form-control mb-3" onChange={handleFileUpload} />
          <div className="input-group mb-3">
            <input className="form-control" placeholder="Key" value={key} onChange={(e) => setKey(e.target.value)} />
            <button className="btn btn-outline-secondary" onClick={() => generateKey(file?.size || 8)}>🔑 Generate</button>
          </div>
          <div className="d-flex gap-3 mb-3">
            <button className="btn btn-outline-success" onClick={() => encryptOrDecryptFile('encrypt')}>Encrypt File</button>
            <button className="btn btn-outline-warning" onClick={() => encryptOrDecryptFile('decrypt')}>Decrypt File</button>
          </div>
          {fileResult && (
            <a 
              href={fileResult.url} 
              className="btn btn-primary" 
              download={fileResult.filename}
            >
              Download Result
            </a>
          )}
        </div>
      )}
    </div>
  );
}
