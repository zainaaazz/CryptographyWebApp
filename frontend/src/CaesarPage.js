import { useState } from 'react';
import axios from 'axios';

export default function CaesarPage() {
  const [plaintext, setPlaintext] = useState('');
  const [shift, setShift] = useState(3);
  const [ciphertext, setCiphertext] = useState('');

  const encrypt = async () => {
    try {
      const response = await axios.post('http://localhost:5000/encrypt/caesar', {
        plaintext,
        shift: parseInt(shift)
      });
      setCiphertext(response.data.ciphertext);
    } catch (err) {
      setCiphertext('Encryption failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Caesar Cipher</h2>
      <input className="form-control mb-3" placeholder="Enter plaintext" value={plaintext} onChange={e => setPlaintext(e.target.value)} />
      <input className="form-control mb-3" type="number" placeholder="Shift amount" value={shift} onChange={e => setShift(e.target.value)} />
      <button className="btn btn-success" onClick={encrypt}>Encrypt</button>
      <div className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></div>
    </div>
  );
}
