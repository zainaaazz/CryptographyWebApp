import { useState } from 'react';
import axios from 'axios';
import AESFileEncryptor from './components/AESFileEncryptor';
import { Loader2 } from 'lucide-react';

export default function AESPage() {
  const [activeTab, setActiveTab] = useState('text');
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInputs = () => {
    if (!plaintext && !ciphertext) {
      setError('Please enter text to encrypt or decrypt');
      return false;
    }
    if (key.length !== 16) {
      setError('AES key must be exactly 16 characters long');
      return false;
    }
    return true;
  };

  const encryptText = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/encrypt/aes', { plaintext, key });
      setCiphertext(response.data.ciphertext);
    } catch (err) {
      setError(err.response?.data?.error || 'Text encryption failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const decryptText = async () => {
    if (!validateInputs()) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/decrypt/aes', { ciphertext, key });
      setDecryptedText(response.data.plaintext);
    } catch (err) {
      setError(err.response?.data?.error || 'Text decryption failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateKey = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const randomKey = Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setKey(randomKey);
    setError('');
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

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close"></button>
        </div>
      )}

      {activeTab === 'text' && (
        <div className="row mb-4">
          <div className="col-md-6 border-end">
            <h4 className="text-success">Encrypt</h4>
            <div className="form-group mb-3">
              <label htmlFor="plaintext" className="form-label text-light">Plaintext</label>
              <textarea 
                id="plaintext"
                className="form-control" 
                placeholder="Enter text to encrypt" 
                value={plaintext} 
                onChange={e => setPlaintext(e.target.value)}
                rows="3"
              />
            </div>

            <div className="input-group mb-3">
              <input 
                className="form-control" 
                placeholder="16-char key" 
                value={key} 
                onChange={e => setKey(e.target.value)}
                maxLength={16}
              />
              <button className="btn btn-success" onClick={generateKey}>🔐 Generate</button>
            </div>

            <button 
              className="btn btn-success" 
              onClick={encryptText}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="me-2" size={20} />
                  Encrypting...
                </>
              ) : 'Encrypt'}
            </button>
            <div className="mt-3">
              <label className="form-label text-light">Ciphertext:</label>
              <div className="p-2 bg-dark rounded">
                <code className="text-light">{ciphertext}</code>
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <h4 className="text-warning">Decrypt</h4>
            <div className="form-group mb-3">
              <label htmlFor="ciphertext" className="form-label text-light">Ciphertext</label>
              <textarea 
                id="ciphertext"
                className="form-control" 
                placeholder="Enter text to decrypt" 
                value={ciphertext} 
                onChange={e => setCiphertext(e.target.value)}
                rows="3"
              />
            </div>

            <div className="input-group mb-3">
              <input 
                className="form-control" 
                placeholder="16-char key" 
                value={key} 
                onChange={e => setKey(e.target.value)}
                maxLength={16}
              />
              <button className="btn btn-success" onClick={generateKey}>🔐 Generate</button>
            </div>

            <button 
              className="btn btn-warning" 
              onClick={decryptText}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="me-2" size={20} />
                  Decrypting...
                </>
              ) : 'Decrypt'}
            </button>
            <div className="mt-3">
              <label className="form-label text-light">Decrypted Text:</label>
              <div className="p-2 bg-dark rounded">
                <code className="text-light">{decryptedText}</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'file' && <AESFileEncryptor />}
    </div>
  );
}
