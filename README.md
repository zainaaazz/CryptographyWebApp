# Cryptography Web Application

A web application that implements various cryptographic algorithms including AES, DES, Caesar, Vigenere, and Vernam ciphers.

## Features

- Multiple encryption algorithms support
- File encryption/decryption
- User-friendly interface
- RESTful API backend
- Swagger API documentation

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

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

## Available Encryption Methods

- AES (Advanced Encryption Standard)
- DES (Data Encryption Standard)
- Caesar Cipher
- Vigenere Cipher
- Vernam Cipher

## Security Notes

- All encryption keys must be 16 characters long for AES encryption
- File uploads are limited to 10MB
- Input validation is implemented on both frontend and backend

## Testing

To run tests:
- Backend: `npm test` (in backend directory)
- Frontend: `npm test` (in frontend directory)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 