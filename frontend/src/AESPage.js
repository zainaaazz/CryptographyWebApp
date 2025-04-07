import { useState } from 'react';
import axios from 'axios';

export default function AESPage() {
  const [plaintext, setPlaintext] = useState('');
  const [ciphertext, setCiphertext] = useState('');

  const encrypt = async () => {
    try {
      const response = await axios.post('http://localhost:5000/encrypt/aes', { plaintext });
      setCiphertext(response.data.ciphertext);
    } catch (err) {
      setCiphertext('Encryption failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>AES Encryption</h2>
      <input className="form-control mb-3" placeholder="Enter plaintext" value={plaintext} onChange={e => setPlaintext(e.target.value)} />
      <button className="btn btn-success" onClick={encrypt}>Encrypt</button>
      <div className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></div>
    </div>
  );
}
