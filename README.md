
Usage documentation for the `InkriptGuard`:

---

# InkriptGuard

InkriptGuard is an encryption library that utilizes AES-256-GCM for secure data encryption and decryption. It supports both binary and textual data, with preprocessing and reverse preprocessing for text data to add an extra layer of security.

## Installation

You can install the package via npm. Make sure you have the necessary dependencies.

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
import { InkriptGuard } from "@inkris-apps/inkripto";
```

### Encrypting Data

You can encrypt various types of data including strings, numbers, objects, arrays, and files. 

```typescript
const guard = new InkriptGuard();

(async () => {
  const data = "Hello, World!";
  const encryptedData = await guard.encrypt(data);
  console.log("Encrypted Data:", encryptedData);
})();
```

### Decrypting Data

You can decrypt the data that was previously encrypted.

```typescript
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

### Handling Files

To encrypt and decrypt files, provide the file path to the `encrypt` method. The library will handle reading the file, encrypting its contents, and returning the encrypted data.

```typescript
const filePath = "/path/to/your/file.txt";

(async () => {
  const encryptedFile = await guard.encrypt(filePath);
  console.log("Encrypted File:", encryptedFile);

  const decryptedFile = await guard.decrypt(encryptedFile);
  console.log("Decrypted File:", decryptedFile.toString());
})();
```

### Encrypting and Decrypting Objects

You can encrypt and decrypt complex objects. The library will recursively encrypt/decrypt each field in the object.

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

  const decryptedObject = await guard.decrypt(encryptedObject);
  console.log("Decrypted Object:", decryptedObject);
})();
```

## License

This project is licensed under the ISC License.

## Contributing

Feel free to contribute to the project by opening issues or submitting pull requests. For major changes, please open an issue first to discuss what you would like to change.

## Issues

If you encounter any issues, please create an issue on the [GitHub repository](https://github.com/inkris-apps/inkriptGuard/issues).

## Repository

You can find the source code at [GitHub Repository](https://github.com/inkris-apps/inkriptGuard).
