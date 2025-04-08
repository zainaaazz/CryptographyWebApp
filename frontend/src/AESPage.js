import { useState } from 'react';
import axios from 'axios';
import AESFileEncryptor from './components/AESFileEncryptor';

export default function AESPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');

  const encryptText = async () => {
    if (key.length !== 16) return setError('AES key must be 16 characters.');
    try {
      const response = await axios.post('http://localhost:5000/encrypt/aes', { plaintext, key });
      setCiphertext(response.data.ciphertext);
      setError('');
    } catch {
      setError('Text encryption failed.');
    }
  };

  const decryptText = async () => {
    if (key.length !== 16) return setError('AES key must be 16 characters.');
    try {
      const response = await axios.post('http://localhost:5000/decrypt/aes', { ciphertext, key });
      setDecryptedText(response.data.plaintext);
      setError('');
    } catch {
      setError('Text decryption failed.');
    }
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomKey = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setKey(randomKey);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-light text-center">AES - Advanced Encryption Standard</h1>
      <p className="text-secondary text-center">
        AES uses a symmetric 16-character key for secure data encryption (128-bit).
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
              <input className="form-control" placeholder="16-char key" value={key} onChange={e => setKey(e.target.value)} />
              <button className="btn btn-success" onClick={generateKey}>🔐 Generate</button>
            </div>

            <button className="btn btn-success" onClick={encryptText}>Encrypt</button>
            <p className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></p>
          </div>

          <div className="col-md-6">
            <h4 className="text-warning">Decrypt</h4>
            <input className="form-control mb-2" placeholder="Ciphertext" value={ciphertext} onChange={e => setCiphertext(e.target.value)} />

            <div className="input-group mb-3">
              <input className="form-control" placeholder="16-char key" value={key} onChange={e => setKey(e.target.value)} />
              <button className="btn btn-success" onClick={generateKey}>🔐 Generate</button>
            </div>

            <button className="btn btn-warning" onClick={decryptText}>Decrypt</button>
            <p className="mt-3"><strong>Decrypted:</strong> <code>{decryptedText}</code></p>
          </div>
        </div>
      )}

      {activeTab === 'file' && <AESFileEncryptor />}
    </div>
  );
}
