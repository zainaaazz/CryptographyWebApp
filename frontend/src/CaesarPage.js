import { useState } from 'react';
import axios from 'axios';

export default function CaesarPage() {
  const [plaintext, setPlaintext] = useState('');
  const [shift, setShift] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [decryptedText, setDecryptedText] = useState('');
  const [error, setError] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [fileResult, setFileResult] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setFileContent(e.target.result);
    reader.readAsText(file);
  };

  const encryptFile = async () => {
    if (!fileContent || shift === '') {
      setError('Please upload a file and enter a shift value.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/encrypt-file/caesar', {
        content: fileContent,
        shift: parseInt(shift),
      });
      setFileResult(response.data.result);
      setError('');
    } catch {
      setError('File encryption failed.');
    }
  };

  const decryptFile = async () => {
    if (!fileContent || shift === '') {
      setError('Please upload a file and enter a shift value.');
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/decrypt-file/caesar', {
        content: fileContent,
        shift: parseInt(shift),
      });
      setFileResult(response.data.result);
      setError('');
    } catch {
      setError('File decryption failed.');
    }
  };

  const downloadResult = () => {
    const blob = new Blob([fileResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'output.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mt-4">
      <h1 className="text-light">Caesar Cipher</h1>
      <p className="text-secondary text-center">
        The Caesar cipher shifts each letter by a fixed number of positions in the alphabet. This basic cipher is great for learning.
      </p>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row mb-4">
        <div className="col-md-6 border-end">
          <h4 className="text-success">Encrypt</h4>
          <input className="form-control mb-2" placeholder="Plaintext" value={plaintext} onChange={e => setPlaintext(e.target.value)} />
          <input className="form-control mb-3" placeholder="Shift" type="number" value={shift} onChange={e => setShift(e.target.value)} />
          <button className="btn btn-success" onClick={async () => {
            const response = await axios.post('http://localhost:5000/encrypt/caesar', { plaintext, shift: parseInt(shift) });
            setCiphertext(response.data.ciphertext);
          }}>Encrypt</button>
          <p className="mt-3"><strong>Ciphertext:</strong> <code>{ciphertext}</code></p>
        </div>

        <div className="col-md-6">
          <h4 className="text-warning">Decrypt</h4>
          <input className="form-control mb-2" placeholder="Ciphertext" value={ciphertext} onChange={e => setCiphertext(e.target.value)} />
          <input className="form-control mb-3" placeholder="Shift" type="number" value={shift} onChange={e => setShift(e.target.value)} />
          <button className="btn btn-warning" onClick={async () => {
            const response = await axios.post('http://localhost:5000/decrypt/caesar', { ciphertext, shift: parseInt(shift) });
            setDecryptedText(response.data.plaintext);
          }}>Decrypt</button>
          <p className="mt-3"><strong>Decrypted:</strong> <code>{decryptedText}</code></p>
        </div>
      </div>

      <hr />
      <h4 className="text-info">🔐 File Encryption & Decryption</h4>
      <input type="file" className="form-control mb-3" accept=".txt" onChange={handleFileUpload} />
      <input className="form-control mb-3" placeholder="Enter shift value" type="number" value={shift} onChange={e => setShift(e.target.value)} />
      <div className="d-flex gap-3 mb-3">
        <button className="btn btn-outline-success" onClick={encryptFile}>Encrypt File</button>
        <button className="btn btn-outline-warning" onClick={decryptFile}>Decrypt File</button>
      </div>
      {fileResult && (
        <>
          <textarea className="form-control mb-3" rows="5" value={fileResult} readOnly />
          <button className="btn btn-primary" onClick={downloadResult}>Download Result</button>
        </>
      )}
    </div>
  );
}
