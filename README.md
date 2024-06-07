# InkriptGuard

InkriptGuard is an encryption library that utilizes AES-256-GCM for secure data encryption and decryption. It supports both binary and textual data, with preprocessing and reverse preprocessing for text data to add an extra layer of security. The library is designed for server-side use and requires no external dependencies, making it lightweight and easy to integrate.

> **Note:** This library is intended for server-side use due to its reliance on the `fs` module for file system operations.

## Use Cases

- **Secure Data Transmission**: Encrypt sensitive data before sending it over the network.
- **Data Storage**: Encrypt data before saving it to disk to prevent unauthorized access.
- **File Encryption**: Securely encrypt files for safe storage and transmission.
- **Object Encryption**: Encrypt complex objects, ensuring all fields are secure.

## Why InkriptGuard?

- **AES-256-GCM Encryption**: Provides robust security with authenticated encryption.
- **0 Dependencies**: Lightweight and fast with no external dependencies.
- **Flexible Data Handling**: Encrypts and decrypts strings, numbers, objects, arrays, and files.
- **Preprocessing for Extra Security**: Adds an additional layer of security by compressing and transforming text data.
- **Beginner Friendly**: Easy to use with clear documentation and examples.

## Installation

You can install the package via npm or yarn.

### Using npm

```sh
npm install @inkris-apps/inkripto
```

### Using yarn

```sh
yarn add @inkris-apps/inkripto
```

## Usage

### Importing the Library

```typescript
import InkriptGuard from "@inkris-apps/inkripto";
```

### Basic Usage Example

```typescript
async function secureDataOperation(data: any) {
  const inkriptGuard = new InkriptGuard();

  // Encrypt the data
  const encryptedData = await inkriptGuard.encrypt(data);
  console.log('Encrypted Data:', encryptedData);

  // Decrypt the data
  const decryptedData = await inkriptGuard.decrypt(encryptedData);
  console.log('Decrypted Data:', decryptedData);

  return decryptedData;
}

// Example usage
const sensitiveData = { accountNumber: '1234567890', balance: 1000 };

secureDataOperation(sensitiveData)
  .then((result) => {
    console.log('Operation Result:', result);
  })
  .catch((error) => {
    console.error('Error in secure data operation:', error);
  });
```

### Encryption Examples

#### Encrypting Strings

```typescript
const guard = new InkriptGuard();

(async () => {
  const data = "Hello, World!";
  const encryptedData = await guard.encrypt(data);
  console.log("Encrypted Data:", encryptedData);
})();
```

#### Encrypting Objects

```typescript
const data = {
  name: "Alice",
  age: 30,
  address: {
    street: "123 Main St",
    city: "Wonderland"
  }
};

(async () => {
  const encryptedObject = await guard.encrypt(data);
  console.log("Encrypted Object:", encryptedObject);
})();
```

#### Encrypting Files

```typescript
const filePath = "/path/to/your/file.txt";

(async () => {
  const encryptedFile = await guard.encrypt(filePath);
  console.log("Encrypted File:", encryptedFile);
})();
```

### Decryption Examples

#### Decrypting Strings

```typescript
const guard = new InkriptGuard();

(async () => {
  const encryptedData = {
    encryptedData: "BASE64_ENCRYPTED_DATA",
    authTag: "BASE64_AUTH_TAG",
    iv: "BASE64_IV"
  };

  const decryptedData = await guard.decrypt(encryptedData);
  console.log("Decrypted Data:", decryptedData);
})();
```

#### Decrypting Objects

```typescript
const encryptedObject = {
  name: {
    encryptedData: "BASE64_ENCRYPTED_DATA",
    authTag: "BASE64_AUTH_TAG",
    iv: "BASE64_IV"
  },
  age: {
    encryptedData: "BASE64_ENCRYPTED_DATA",
    authTag: "BASE64_AUTH_TAG",
    iv: "BASE64_IV"
  }
};

(async () => {
  const decryptedObject = await guard.decrypt(encryptedObject);
  console.log("Decrypted Object:", decryptedObject);
})();
```

#### Decrypting Files

```typescript
const encryptedFile = {
  encryptedData: "BASE64_ENCRYPTED_FILE_DATA",
  authTag: "BASE64_AUTH_TAG",
  iv: "BASE64_IV",
  isBinary: true
};

(async () => {
  const decryptedFile = await guard.decrypt(encryptedFile);
  console.log("Decrypted File:", decryptedFile.toString());
})();
```

## License

This project is licensed under the MIT License.

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests. For major changes, please open an issue first to discuss what you would like to change.

## Issues

If you encounter any issues, please create an issue on the [GitHub repository](https://github.com/inkris-apps/inkriptGuard/issues).

## Repository

You can find the source code at [GitHub Repository](https://github.com/inkris-apps/inkriptGuard).

## Author

Created by Prince Brown. [iWebDevelop](https://iwebdevelop.ca.ca).

For more information, visit our website: [Inkris](https://inkris.ca).