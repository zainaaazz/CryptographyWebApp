import { useState } from 'react';
import axios from 'axios';

export default function CaesarPage() {
  const [plaintext, setPlaintext] = useState('');
  const [shift, setShift] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="container mt-4">
      <h1 className="text-light text-center">Caesar Cipher</h1>
      <p className="text-secondary text-center">
        The Caesar cipher shifts each letter by a fixed number of positions in the alphabet. This basic cipher is great for learning.
      </p>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-4">
        <div className="col-md-6 border-end">
          <h4 className="text-success">Encrypt</h4>
          <input
            className="form-control mb-2"
            placeholder="Plaintext"
            value={plaintext}
            onChange={e => setPlaintext(e.target.value)}
          />
          <input
            className="form-control mb-3"
            placeholder="Shift"
            type="number"
            value={shift}
            onChange={e => setShift(e.target.value)}
          />
          <button
            className="btn btn-success"
            onClick={async () => {
              if (plaintext === '' || shift === '') {
                setError('Please enter both plaintext and a shift value.');
                return;
              }
              try {
                const response = await axios.post('http://localhost:5000/encrypt/caesar', {
                  plaintext,
                  shift: parseInt(shift)
                });
                setCiphertext(response.data.ciphertext);
                setError('');
              } catch {
                setError('Encryption failed.');
              }
            }}
          >
            Encrypt
          </button>
          <p className="mt-3">
            <strong>Ciphertext:</strong> <code>{ciphertext}</code>
          </p>
        </div>

        <div className="col-md-6">
          <h4 className="text-warning">Decrypt</h4>
          <input
            className="form-control mb-2"
            placeholder="Ciphertext"
            value={ciphertext}
            onChange={e => setCiphertext(e.target.value)}
          />
          <input
            className="form-control mb-3"
            placeholder="Shift"
            type="number"
            value={shift}
            onChange={e => setShift(e.target.value)}
          />
          <button
            className="btn btn-warning"
            onClick={async () => {
              if (ciphertext === '' || shift === '') {
                setError('Please enter both ciphertext and a shift value.');
                return;
              }
              try {
                const response = await axios.post('http://localhost:5000/decrypt/caesar', {
                  ciphertext,
                  shift: parseInt(shift)
                });
                setDecryptedText(response.data.plaintext);
                setError('');
              } catch {
                setError('Decryption failed.');
              }
            }}
          >
            Decrypt
          </button>
          <p className="mt-3">
            <strong>Decrypted:</strong> <code>{decryptedText}</code>
          </p>
        </div>
      </div>
    </div>
  );
}
