import axios from "axios";
import { useState, useRef } from "react";

export default function VernamPage() {
  const [activeTab, setActiveTab] = useState("text");
  const [fileTab, setFileTab] = useState("encrypt"); // new: encrypt or decrypt

  const [plaintext, setPlaintext] = useState("");
  const [key, setKey] = useState("");
  const [realKey, setRealKey] = useState("");
  const [ciphertext, setCiphertext] = useState("");
  const [decryptedText, setDecryptedText] = useState("");
  const [file, setFile] = useState(null);
  const [keyFile, setKeyFile] = useState(null);
  const [useKeyFile, setUseKeyFile] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleFileUpload = (e) => setFile(e.target.files[0]);
  const handleKeyFileUpload = (e) => setKeyFile(e.target.files[0]);
  const resetKeyFile = () => setKeyFile(null);

  const fileInputRef = useRef(null);
  const keyFileInputRef = useRef(null);

  const clearFileState = () => {
    setFile(null);
    setKey("");
    setRealKey("");
    setKeyFile(null);
    setMessage("");
    setError("");
    setProgress(0);
    setDownloadProgress(0);

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (keyFileInputRef.current) keyFileInputRef.current.value = "";
  };

  const handleTextEncryption = () => {
    setError("");
    setMessage("");
  
    if (!plaintext || !realKey || plaintext.length !== realKey.length) {
      return setError("Key must be the same length as plaintext.");
    }
  
    const encrypted = Array.from(plaintext)
      .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ realKey.charCodeAt(i)))
      .join("");
  
    const base64 = btoa(encrypted);
    setCiphertext(base64);
    setMessage("✔ Text encrypted successfully.");
  };
  
  const handleTextDecryption = () => {
    setError("");
    setMessage("");
  
    if (!ciphertext || !realKey) {
      return setError("Please provide ciphertext and key.");
    }
  
    try {
      const decoded = atob(ciphertext);
      if (decoded.length !== realKey.length) {
        return setError("Key must be the same length as decoded ciphertext.");
      }
  
      const decrypted = Array.from(decoded)
        .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ realKey.charCodeAt(i)))
        .join("");
  
      setDecryptedText(decrypted);
      setMessage("✔ Text decrypted successfully.");
    } catch (err) {
      setError("Invalid Base64 ciphertext.");
    }
  };
  

  const generateKey = async (length) => {
    setError("");
    setMessage("");

    const downloadKeyAsTxt = (keyStr) => {
      let baseName = "vernam_key";
      if (file && file.name) {
        const nameParts = file.name.split(".");
        nameParts.pop();
        baseName = nameParts.join(".");
      }
      const fileName = `${baseName}-VernamKey.txt`;

      const blob = new Blob([keyStr], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    };

    if (length > 1048576) {
      try {
        setGenerating(true);
        setProgress(0);
        const interval = setInterval(() => {
          setProgress((prev) => (prev >= 95 ? prev : prev + 1));
        }, 30);

        const response = await axios.post(
          "http://localhost:5000/generate-vernam-key",
          { fileSize: length },
          { headers: { "Content-Type": "application/json" } }
        );

        clearInterval(interval);
        setProgress(100);
        await navigator.clipboard.writeText(response.data);
        setMessage("✔ Key copied to clipboard");

        setRealKey(response.data);
        setKey("Key generated successfully. Too large to display.");
        downloadKeyAsTxt(response.data);
      } catch (error) {
        console.error(error);
        setError("Failed to generate large random key.");
      } finally {
        setTimeout(() => setGenerating(false), 300);
      }
    } else {
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      setKey(result);
      setRealKey(result);
      await navigator.clipboard.writeText(result);
      setMessage("✔ Key copied to clipboard");

      if (
        window.confirm(
          "Would you like to download the generated key as a text file?"
        )
      ) {
        downloadKeyAsTxt(result);
      }
    }
  };

  const encryptOrDecryptFile = async (action) => {
    setError("");
    setMessage("");

    let usedKey = key.includes("Too large") ? realKey : key;

    if (action === "decrypt" && useKeyFile && keyFile) {
      try {
        const fileText = await keyFile.text();
        usedKey = fileText;
      } catch {
        return setError("Failed to read key file.");
      }
    }

    if (!file || !usedKey || usedKey.length !== file.size)
      return setError(
        `Key must match file size (file: ${file.size} bytes, key: ${usedKey.length} bytes)`
      );

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", usedKey);

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      const response = await axios.post(
        `http://localhost:5000/${action}-file/vernam`,
        formData,
        {
          responseType: "blob",
          headers: { "Content-Type": "multipart/form-data" },
          onDownloadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setDownloadProgress(percent);
          },
        }
      );

      const contentDisposition =
        response.headers["content-disposition"] ||
        response.headers["Content-Disposition"];
      let filename =
        action === "encrypt" ? "encrypted.vernam" : "decrypted_output";
      if (contentDisposition && contentDisposition.includes("filename=")) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/octet-stream",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);

      setIsDownloading(false);
      setDownloadProgress(0);
    } catch {
      setIsDownloading(false);
      setDownloadProgress(0);
      setError("File encryption/decryption failed.");
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="text-light text-center">Vernam Cipher</h1>
      <p className="text-secondary text-center">
        A symmetric cipher that uses XOR — the key must match the length of the
        message or file.
      </p>

      {/* Tabs: Text vs File */}
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

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* TEXT MODE */}
      {activeTab === "text" && (
        <div className="row mb-4">
          <div className="col-md-6 border-end">
            <h4 className="text-success">Encrypt</h4>
            <input
              className="form-control mb-2"
              placeholder="Plaintext"
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
            />
            <div className="input-group mb-3">
              <input
                className="form-control"
                placeholder="Key (same length)"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setRealKey(e.target.value);
                }}
              />
              <button
                className="btn btn-outline-secondary"
                onClick={() => generateKey(plaintext.length || 8)}
              >
                🔑 Generate
              </button>
            </div>
            <button
              className="btn btn-success"
              onClick={handleTextEncryption}
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
              placeholder="Base64 Ciphertext"
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
            />
            <input
              className="form-control mb-3"
              placeholder="Key (same length)"
              value={key}
              onChange={(e) => {
                setKey(e.target.value);
                setRealKey(e.target.value);
              }}
            />
            <button className="btn btn-warning" onClick={handleTextDecryption}>
                Decrypt
              </button>
            <p className="mt-3">
              <strong>Decrypted:</strong> <code>{decryptedText}</code>
            </p>
          </div>
        </div>
      )}

      {/* FILE MODE */}
      {activeTab === "file" && (
        <div className="text-white">
          {/* Sub-tabs for file encryption vs decryption */}
          <div className="d-flex justify-content-center mb-3">
            <div className="btn-group">
              <button
                className={`btn ${
                  fileTab === "encrypt" ? "btn-success" : "btn-outline-success"
                }`}
                onClick={() => setFileTab("encrypt")}
              >
                Encrypt File
              </button>
              <button
                className={`btn ${
                  fileTab === "decrypt" ? "btn-warning" : "btn-outline-warning"
                }`}
                onClick={() => setFileTab("decrypt")}
              >
                Decrypt File
              </button>
            </div>
          </div>

          <input
            type="file"
            className="form-control mb-3"
            onChange={handleFileUpload}
            ref={fileInputRef}
          />

          {fileTab === "encrypt" && (
            <>
              <div className="input-group mb-3">
                <input
                  className="form-control"
                  placeholder="Key (same byte length as file)"
                  value={key}
                  readOnly={key.includes("Too large")}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setRealKey(e.target.value);
                  }}
                />
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => generateKey(file?.size || 8)}
                >
                  🔑 Generate
                </button>
              </div>

              {generating && (
                <div className="progress mb-3 w-100">
                  <div
                    className="progress-bar progress-bar-striped progress-bar-animated bg-success"
                    style={{ width: `${progress}%` }}
                  >
                    {progress}%
                  </div>
                </div>
              )}

              <button
                className="btn btn-outline-success"
                onClick={() => encryptOrDecryptFile("encrypt")}
              >
                Encrypt File
              </button>
              <button
                className="btn btn-outline-danger ms-2"
                onClick={clearFileState}
              >
                Clear Fields
              </button>
            </>
          )}

          {fileTab === "decrypt" && (
            <>
              <div className="form-check form-switch mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={useKeyFile}
                  onChange={() => setUseKeyFile(!useKeyFile)}
                />
                <label className="form-check-label text-light">
                  Use uploaded key file (.txt)
                </label>
              </div>

              {useKeyFile ? (
                <div className="mb-3">
                  <label className="form-label text-light">
                    Upload Key File (.txt):
                  </label>
                  <div className="d-flex gap-2">
                    <input
                      type="file"
                      accept=".txt"
                      className="form-control"
                      onChange={handleKeyFileUpload}
                      ref={keyFileInputRef}
                    />

                    <button
                      className="btn btn-outline-danger"
                      onClick={resetKeyFile}
                    >
                      Reset
                    </button>
                  </div>
                  {keyFile && (
                    <small className="text-success">
                      Uploaded: {keyFile.name}
                    </small>
                  )}
                </div>
              ) : (
                <input
                  className="form-control mb-3"
                  placeholder="Paste decryption key"
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                    setRealKey(e.target.value);
                  }}
                />
              )}

              <button
                className="btn btn-outline-warning"
                onClick={() => encryptOrDecryptFile("decrypt")}
              >
                Decrypt File
              </button>
              <button
                className="btn btn-outline-danger ms-2"
                onClick={clearFileState}
              >
                Clear Fields
              </button>
            </>
          )}

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
        </div>
      )}
    </div>
  );
}
