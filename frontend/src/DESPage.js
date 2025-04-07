import { useState } from 'react';
import axios from 'axios';

export default function DESPage() {
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');

  const encrypt = async () => {
    try {
      const response = await axios.post('http://localhost:5000/encrypt/des', { plaintext });
      setCiphertext(response.data.ciphertext);
    } catch {
      setCiphertext('Encryption failed');
    }
  };

  const decrypt = async () => {
    try {
      const response = await axios.post('http://localhost:5000/decrypt/des', { ciphertext });
      setDecryptedText(response.data.plaintext);
    } catch {
      setDecryptedText('Decryption failed');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center text-light mb-4">DES - Data Encryption Standard</h1>
      <div className="row">
        <div className="col-md-6 border-end">
          <h3 className="text-success mb-3">Encrypt</h3>
          <input
            className="form-control mb-3"
            placeholder="Enter plaintext"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
          />
          <button className="btn btn-success mb-3" onClick={encrypt}>Encrypt</button>
          <div><strong>Ciphertext:</strong> <code>{ciphertext}</code></div>
        </div>

        <div className="col-md-6">
          <h3 className="text-warning mb-3">Decrypt</h3>
          <input
            className="form-control mb-3"
            placeholder="Enter ciphertext"
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
          />
          <button className="btn btn-warning mb-3" onClick={decrypt}>Decrypt</button>
          <div><strong>Decrypted Text:</strong> <code>{decryptedText}</code></div>
        </div>
      </div>
    </div>
  );
}
