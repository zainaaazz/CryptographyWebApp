import { useState } from 'react';
import axios from 'axios';

export default function CaesarPage() {
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [shift, setShift] = useState(3);
  const [decryptedText, setDecryptedText] = useState('');

  const encrypt = async () => {
    try {
      const response = await axios.post('http://localhost:5000/encrypt/caesar', {
        plaintext,
        shift: parseInt(shift),
      });
      setCiphertext(response.data.ciphertext);
    } catch {
      setCiphertext('Encryption failed');
    }
  };

  const decrypt = async () => {
    try {
      const response = await axios.post('http://localhost:5000/decrypt/caesar', {
        ciphertext,
        shift: parseInt(shift),
      });
      setDecryptedText(response.data.plaintext);
    } catch {
      setDecryptedText('Decryption failed');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center text-light mb-4">Caesar Cipher</h1>
      <p className="text-center text-secondary mb-4">
  The Caesar cipher is a simple substitution cipher that shifts each letter in the plaintext by a fixed number of positions in the alphabet.
</p>

      <div className="row">
        <div className="col-md-6 border-end">
          <h3 className="text-success mb-3">Encrypt</h3>
          <input
            className="form-control mb-3"
            placeholder="Enter plaintext"
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
          />
          <input
            className="form-control mb-3"
            type="number"
            placeholder="Shift amount"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
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
          <input
            className="form-control mb-3"
            type="number"
            placeholder="Shift amount"
            value={shift}
            onChange={(e) => setShift(e.target.value)}
          />
          <button className="btn btn-warning mb-3" onClick={decrypt}>Decrypt</button>
          <div><strong>Decrypted Text:</strong> <code>{decryptedText}</code></div>
        </div>
      </div>
    </div>
  );
}
