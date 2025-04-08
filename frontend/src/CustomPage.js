import { useState } from 'react';

export default function CustomPage() {
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decrypted, setDecrypted] = useState('');

  const encrypt = () => {
    //  custom algorithm logic
    const result = btoa(plaintext + key); // example: base64 + key (toy)
    setCiphertext(result);
  };

  const decrypt = () => {
    //custom decryption logic
    const raw = atob(ciphertext);
    setDecrypted(raw.replace(key, '')); // simple reversal
  };

  return (
    <div className="container mt-4 text-white">
      <h1 className="text-center">Custom Encryption Algorithm</h1>

      <div className="mb-3">
        <label>Plaintext</label>
        <input className="form-control" value={plaintext} onChange={e => setPlaintext(e.target.value)} />
      </div>

      <div className="mb-3">
        <label>Key</label>
        <input className="form-control" value={key} onChange={e => setKey(e.target.value)} />
      </div>

      <button className="btn btn-success me-2" onClick={encrypt}>Encrypt</button>
      <button className="btn btn-warning" onClick={decrypt}>Decrypt</button>

      <div className="mt-4">
        <p><strong>Ciphertext:</strong> <code>{ciphertext}</code></p>
        <p><strong>Decrypted:</strong> <code>{decrypted}</code></p>
      </div>
    </div>
  );
}
