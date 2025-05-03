import { useState } from "react";
import axios from "axios";
import { Loader2, FileText, Download } from "lucide-react";

export default function TranspositionPage() {
  const [activeTab, setActiveTab] = useState("text");
  const [plaintext, setPlaintext] = useState("");
  const [key, setKey] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileResult, setFileResult] = useState("");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [visualization, setVisualization] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const validateInputs = () => {
    if (!plaintext.trim() && !file) {
      setError("Please enter text or upload a file");
      return false;
    }
    if (!key.trim()) {
      setError("Please enter a keyword");
      return false;
    }
    if (!/^[a-zA-Z]+$/.test(key)) {
      setError("Keyword must contain only letters");
      return false;
    }
    const uniqueChars = new Set(key.toUpperCase().split(""));
    if (uniqueChars.size < 2) {
      setError("Keyword must have at least 2 unique letters");
      return false;
    }
    setError("");
    return true;
  };

  const encryptText = async () => {
    if (!validateInputs()) return;

    try {
      setIsProcessing(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/encrypt/transposition",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            plaintext: plaintext.trim(),
            key: key.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to encrypt text");
      }

      if (!data.ciphertext) {
        throw new Error("No ciphertext received from server");
      }

      setCiphertext(data.ciphertext);
      setError("");

      // Create visualization
      const numRows = Math.ceil(plaintext.length / key.length);
      const matrix = Array(numRows)
        .fill()
        .map(() => Array(key.length).fill("_"));
      let index = 0;

      // Fill the matrix row by row
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < key.length; col++) {
          if (index < plaintext.length) {
            matrix[row][col] = plaintext[index++];
          }
        }
      }

      setVisualization({
        matrix,
        columnOrder: key.toUpperCase().split(""),
        originalLength: plaintext.length,
        paddedLength: numRows * key.length,
        key: key,
        isEncryption: true,
      });
    } catch (err) {
      console.error("Encryption error:", err);
      setError(
        err.message ||
          "Failed to encrypt text. Please check your input and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const decryptText = async () => {
    if (!validateInputs()) return;

    try {
      setIsProcessing(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/decrypt/transposition",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ciphertext: ciphertext.trim(),
            key: key.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to decrypt text");
      }

      if (!data.plaintext) {
        throw new Error("No plaintext received from server");
      }

      setDecryptedText(data.plaintext);
      setError("");

      // Create visualization for decryption
      const numRows = Math.ceil(ciphertext.length / key.length);
      const matrix = Array(numRows)
        .fill()
        .map(() => Array(key.length).fill("_"));
      let index = 0;

      // Fill the matrix column by column
      for (let col = 0; col < key.length; col++) {
        for (let row = 0; row < numRows; row++) {
          if (index < ciphertext.length) {
            matrix[row][col] = ciphertext[index++];
          }
        }
      }

      setVisualization({
        matrix,
        columnOrder: key.toUpperCase().split(""),
        originalLength: ciphertext.length,
        paddedLength: ciphertext.length,
        key: key,
        isDecryption: true,
      });
    } catch (err) {
      console.error("Decryption error:", err);
      setError(
        err.message ||
          "Failed to decrypt text. Please check your input and try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const generateKey = () => {
    // Generate a random keyword with at least 2 unique characters
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const length = Math.floor(Math.random() * 4) + 3; // Random length between 3 and 6
    let keyword = "";

    // Ensure at least 2 unique characters
    const firstChar = characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
    const secondChar = characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
    keyword = firstChar + secondChar;

    // Add remaining characters
    for (let i = 2; i < length; i++) {
      keyword += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    setKey(keyword);
    setError("");
  };

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const encryptFile = async () => {
    if (!file || !key) return setError("Select a file and enter a key.");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const res = await axios.post(
        "http://localhost:5000/encrypt-file/transposition",
        formData,
        {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setDownloadProgress(percent);
          },
        }
      );

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = URL.createObjectURL(blob);
      setFileResult({ url, filename: "encrypted_" + file.name });
      setError("");
    } catch (err) {
      setError("File encryption failed.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  const decryptFile = async () => {
    if (!file || !key) return setError("Select a file and enter a key.");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);
    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const res = await axios.post(
        "http://localhost:5000/decrypt-file/transposition",
        formData,
        {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setDownloadProgress(percent);
          },
        }
      );

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = URL.createObjectURL(blob);
      setFileResult({ url, filename: "decrypted_" + file.name });
      setError("");
    } catch (err) {
      setError("File decryption failed.");
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className="page-container">
      <h1>Transposition Cipher</h1>
      <p className="description">
        The Transposition Cipher rearranges the letters of the plaintext
        according to a keyword. The process consists of three parts:
      </p>
      <ol className="process-steps">
        <li>
          <strong>Preprocessing:</strong> Replace spaces with underscores and
          process the keyword
        </li>
        <li>
          <strong>Matrix Creation:</strong> Create a matrix based on the keyword
          length
        </li>
        <li>
          <strong>Text Transformation:</strong> Read the matrix in the order
          specified by the keyword
        </li>
      </ol>

      <div className="d-flex justify-content-center mb-4">
        <div className="btn-group">
          <button
            className={`btn ${
              activeTab === "text" ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setActiveTab("text")}
          >
            Text Encryption
          </button>
          <button
            className={`btn ${
              activeTab === "file" ? "btn-success" : "btn-outline-success"
            }`}
            onClick={() => setActiveTab("file")}
          >
            File Encryption
          </button>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger alert-dismissible fade show"
          role="alert"
        >
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError("")}
            aria-label="Close"
          ></button>
        </div>
      )}

      {activeTab === "text" && (
        <div className="row mb-4">
          <div className="col-md-6 border-end">
            <h4 className="text-success">Encrypt</h4>
            <div className="form-group mb-3">
              <label htmlFor="plaintext" className="form-label text-light">
                Plaintext
              </label>
              <textarea
                id="plaintext"
                className="form-control"
                placeholder="Enter text to encrypt"
                value={plaintext}
                onChange={(e) => setPlaintext(e.target.value)}
                rows="3"
              />
            </div>

            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Keyword"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <button className="btn btn-success" onClick={generateKey}>
                🔐 Generate
              </button>
            </div>

            <button
              className="btn btn-success"
              onClick={encryptText}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="me-2" size={20} />
                  Encrypting...
                </>
              ) : (
                "Encrypt"
              )}
            </button>
            <div className="mt-3">
              <label className="form-label text-light">Ciphertext:</label>
              <div className="p-2 bg-dark rounded">
                <code className="text-light">{ciphertext}</code>
              </div>
            </div>

            {visualization && (
              <div className="visualization-container">
                <h3>Transposition Cipher Process</h3>

                <div className="process-step">
                  <h4>1. Preprocessing</h4>
                  <div className="preprocessing-info">
                    <p>Original text: {plaintext || ""}</p>
                    <p>
                      Processed text: {(plaintext || "").replace(/\s+/g, "_")}
                    </p>
                    <p>Keyword: {visualization?.key || ""}</p>
                    <p>
                      Column order (original):{" "}
                      {(visualization?.columnOrder || []).join(" ")}
                    </p>
                    <p>
                      Column numbers:{" "}
                      {(visualization?.columnNumbers || []).join(" ")}
                    </p>
                  </div>
                </div>

                <div className="process-step">
                  <h4>2. Matrix Creation</h4>
                  <div className="matrix-visualization">
                    <div className="matrix-header">
                      {(visualization?.columnOrder || []).map((char, index) => (
                        <div key={index} className="matrix-cell header">
                          {char}
                          <div className="column-number">
                            {visualization?.columnNumbers?.[index] ?? ""}
                          </div>
                        </div>
                      ))}
                    </div>
                    {(visualization?.matrix || []).map((row, rowIndex) => (
                      <div key={rowIndex} className="matrix-row">
                        {(row || []).map((cell, colIndex) => (
                          <div key={colIndex} className="matrix-cell">
                            {cell === "_" ? " _" : cell}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="process-step">
                  <h4>3. Text Transformation</h4>
                  <div className="transformation-info">
                    <p>
                      Reading direction:{" "}
                      {visualization?.isDecryption
                        ? "Row-wise"
                        : "Column-wise in original order"}
                    </p>
                    <p>
                      Original length: {visualization?.originalLength || 0}{" "}
                      characters
                    </p>
                    <p>
                      Padded length: {visualization?.paddedLength || 0}{" "}
                      characters
                    </p>
                    <p>
                      Result:{" "}
                      {visualization?.isDecryption ? decryptedText : ciphertext}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="col-md-6">
            <h4 className="text-warning">Decrypt</h4>
            <div className="form-group mb-3">
              <label htmlFor="ciphertext" className="form-label text-light">
                Ciphertext
              </label>
              <textarea
                id="ciphertext"
                className="form-control"
                placeholder="Enter text to decrypt"
                value={ciphertext}
                onChange={(e) => setCiphertext(e.target.value)}
                rows="3"
              />
            </div>

            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                placeholder="Key (text)"
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
              <button className="btn btn-success" onClick={generateKey}>
                🔐 Generate
              </button>
            </div>

            <button
              className="btn btn-warning"
              onClick={decryptText}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="me-2" size={20} />
                  Decrypting...
                </>
              ) : (
                "Decrypt"
              )}
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

      {activeTab === "file" && (
        <div>
          <div className="input-group mb-3">
            <input
              type="file"
              className="form-control"
              onChange={handleFileUpload}
            />
          </div>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Key (text)"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <button className="btn btn-success" onClick={generateKey}>
              🔐 Generate
            </button>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-success" onClick={encryptFile}>
              <FileText className="me-2" size={20} />
              Encrypt File
            </button>
            <button className="btn btn-outline-warning" onClick={decryptFile}>
              <FileText className="me-2" size={20} />
              Decrypt File
            </button>
          </div>
          {isDownloading && (
            <div className="progress my-3 w-100">
              <div
                className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                style={{ width: `${downloadProgress}%` }}
              >
                {downloadProgress}%
              </div>
            </div>
          )}
          {fileResult && (
            <a
              href={fileResult.url}
              className="btn btn-primary mt-3"
              download={fileResult.filename}
            >
              <Download className="me-2" size={20} />
              Download Result
            </a>
          )}
        </div>
      )}
    </div>
  );
}
