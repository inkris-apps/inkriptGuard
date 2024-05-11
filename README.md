Usage documentation for the `InkriptGuard` class:

---

# InkriptGuard Usage Documentation

The `InkriptGuard` class provides methods for encrypting and decrypting data using AES-256-GCM encryption. This class handles both text and binary data, managing file content and other data types seamlessly.

## Installation

Before using `InkriptGuard`, ensure you have Node.js installed. You will also need the `crypto`, `zlib`, and `fs` modules, which are part of Node.js standard library.

## Setup

First, ensure that the `InkriptGuard` class is properly imported into your project. If you have defined the class in a file named `InkriptGuard.ts`, you can import it as follows:

```typescript
import { InkriptGuard } from './InkriptGuard';
```

## Instantiating the Class

Create an instance of the `InkriptGuard` class to use its encryption and decryption functionalities:

```typescript
const inkriptGuard = new InkriptGuard();
```

## Encrypting Data

You can encrypt strings, numbers, objects, arrays, and file contents. Here’s how to use the `encryptData` method:

### Encrypting Text

```typescript
async function encryptText() {
  const encrypted = await inkriptGuard.encryptData("Hello, world!");
  console.log("Encrypted Text:", encrypted);
}
encryptText();
```

### Encrypting Objects

```typescript
async function encryptObject() {
  const data = {
    name: "Alice",
    age: 30
  };
  const encrypted = await inkriptGuard.encryptData(data);
  console.log("Encrypted Object:", encrypted);
}
encryptObject();
```

### Encrypting Files

For file encryption, pass the path of the file. Ensure the file exists at the specified path.

```typescript
async function encryptFile() {
  const filePath = '/path/to/your/file.txt';
  const encrypted = await inkriptGuard.encryptData(filePath);
  console.log("Encrypted File:", encrypted);
}
encryptFile();
```

## Decrypting Data

Use the `decryptData` method to decrypt data that was encrypted using `InkriptGuard`. Ensure the input to this method matches the structure returned by `encryptData`.

### Decrypting Text

```typescript
async function decryptText(encryptedData) {
  const decrypted = await inkriptGuard.decryptData(encryptedData);
  console.log("Decrypted Text:", decrypted);
}
```

### Decrypting Objects

```typescript
async function decryptObject(encryptedData) {
  const decrypted = await inkriptGuard.decryptData(encryptedData);
  console.log("Decrypted Object:", decrypted);
}
```

### Decrypting Files

When decrypting files, the output will be a buffer or a hexadecimal string if the file was marked as binary during encryption.

```typescript
async function decryptFile(encryptedData) {
  const decrypted = await inkriptGuard.decryptData(encryptedData);
  console.log("Decrypted File Content (Buffer):", decrypted);
  // If 'document' exists in the decrypted object and is a string,
  // convert it to a Buffer
    if (typeof decryptedObject.document === "string") {
      const documentBuffer = Buffer.from(decryptedObject.document, "hex");
      console.log("Document as Buffer:", documentBuffer);
    }
}
```

## Error Handling

In your encryption and decryption processes, ensure to handle errors gracefully:

```typescript
async function safeEncrypt(data) {
  try {
    const encrypted = await inkriptGuard.encryptData(data);
    console.log("Successfully Encrypted:", encrypted);
  } catch (error) {
    console.error("Encryption Error:", error);
  }
}

async function safeDecrypt(encryptedData) {
  try {
    const decrypted = await inkriptGuard.decryptData(encryptedData);
    console.log("Successfully Decrypted:", decrypted);
  } catch (error) {
    console.error("Decryption Error:", error);
  }
}
```

This documentation should guide you through the basic functionalities of the `InkriptGuard` class for your encryption and decryption needs.

--- 

This guide covers typical use cases you might encounter while integrating encryption into your application using the `InkriptGuard` class.
