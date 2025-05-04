# Cryptography Web Application

A comprehensive web application that implements various cryptographic algorithms including AES, DES, Caesar, Vigenere, Vernam, and Transposition ciphers. The application provides both text and file encryption/decryption capabilities through a user-friendly interface.

## Features

### Encryption Algorithms

- **AES (Advanced Encryption Standard)**: 128-bit encryption with ECB mode
- **DES (Data Encryption Standard)**: TripleDES implementation
- **Caesar Cipher**: Classic shift cipher with customizable shift value
- **Vigenere Cipher**: Poly-alphabetic substitution cipher
- **Vernam Cipher**: XOR-based encryption with key length matching file size
- **Transposition Cipher**: Columnar transposition with keyword-based encryption

### Core Functionality

- Text encryption/decryption
- File encryption/decryption
- Support for various file types
- Automatic key generation for Vernam cipher
- Swagger API documentation
- RESTful API backend
- Modern React-based frontend
- Responsive and intuitive user interface

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory with the following content:

```
PORT=5000
```

4. Start the backend server:

```bash
node server.js
```

The backend will be available at `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## API Documentation

Once the backend is running, you can access the Swagger API documentation at:
`http://localhost:5000/api-docs`

## Security Specifications

### Key Requirements

- **AES**: 16-character key
- **DES**: 24-character key
- **Caesar**: Numeric shift value
- **Vigenere**: Alphabetic key
- **Vernam**: Key length must match file size
- **Transposition**: Keyword with at least 2 unique characters

### File Handling

- Maximum file size: 100MB
- Supports various file types (text, binary, etc.)
- Secure file upload and download
- Input validation on both frontend and backend

## Testing

### Backend Testing

1. Navigate to the backend directory
2. Run tests:

```bash
npm test
```

### Frontend Testing

1. Navigate to the frontend directory
2. Run tests:

```bash
npm test
```

## Project Structure

```
CryptographyWebApp/
├── backend/
│   ├── server.js          # Main server file
│   ├── swagger.js         # API documentation
│   ├── tests/             # Test files
│   └── package.json       # Backend dependencies
├── frontend/
│   ├── src/              # React source code
│   ├── public/           # Static files
│   └── package.json      # Frontend dependencies
└── README.md             # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Node.js and Express for the backend
- React for the frontend
- CryptoJS for cryptographic operations
- Swagger for API documentation
