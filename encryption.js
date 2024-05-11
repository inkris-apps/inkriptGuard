const crypto = require('crypto');
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

class InkriptoGuard {
  constructor() {
    this.key = crypto.randomBytes(32); // AES-256 requires a 32-byte key
  }

  // Function to generate a random IV
  generateIV() {
    return crypto.randomBytes(16); // IV is 16 bytes for AES
  }

  // Preprocess data with compression and a unique transformation
  preprocessData(data) {
    if (this.isFilePath(data)) {
      // Read file content as binary and encode in base64 without additional transformations
      const fileBuffer = fs.readFileSync(data);
      return fileBuffer.toString('base64');
    } else {
      let stringData = (typeof data === 'object' || typeof data === 'number' || typeof data === 'boolean')
        ? JSON.stringify(data)
        : String(data);

      stringData = stringData.split('').reverse().join('');
      return zlib.deflateSync(stringData).toString('base64');
    }
  }

  // Reverse preprocessing considering the binary nature of certain data
  reversePreprocessData(compressedData, isBinary = false) {
    try {
      const bufferData = Buffer.from(compressedData, 'base64');
      if (isBinary) {
        // Directly return the buffer for binary data
        return bufferData;
      }
      const decompressedData = zlib.inflateSync(bufferData).toString();
      return decompressedData.split('').reverse().join('');
    } catch (e) {
      console.error('Decompression failed:', e);
      // Return as is for problematic data or when it's binary but misflagged
      return Buffer.from(compressedData, 'base64');
    }
  }

  // Decrypt data with consideration for its type (binary vs. textual)
  async decryptData(encryptedPackage) {
    try {
      if (typeof encryptedPackage === 'object' && encryptedPackage !== null) {
        if ('encryptedData' in encryptedPackage) {
          const { encryptedData, authTag, iv } = encryptedPackage;
          const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64'));
          decipher.setAuthTag(Buffer.from(authTag, 'base64'));
          let decrypted = decipher.update(encryptedData, 'base64');
          decrypted = Buffer.concat([decrypted, decipher.final()]);
          // Adjust based on expected data type
          const isBinary = encryptedPackage.isBinary || decrypted.length > 1000; // Simplistic heuristic for binary detection
          return this.reversePreprocessData(decrypted.toString('utf8'), isBinary);
        } else {
          const result = Array.isArray(encryptedPackage) ? [] : {};
          for (const [key, value] of Object.entries(encryptedPackage)) {
            result[key] = await this.decryptData(value);
          }
          return result;
        }
      } else {
        return encryptedPackage;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  // Function to check if the input is a file path
  isFilePath(data) {
    return typeof data === 'string' && (fs.existsSync(data) && fs.lstatSync(data).isFile());
  }

  // Unified encryption method that handles all types of input data
  async encryptData(data) {
    const iv = this.generateIV(); // Generate a new IV for each encryption
    try {
      if (this.isFilePath(data)) {
        // Read file content into a buffer
        const fileBuffer = fs.readFileSync(data);
        // Encrypt the buffer directly without preprocessing
        const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
        let encrypted = cipher.update(fileBuffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const tag = cipher.getAuthTag(); // Get authentication tag for integrity verification
        return {
          encryptedData: encrypted.toString('base64'),
          authTag: tag.toString('base64'),
          iv: iv.toString('base64'),
          isBinary: true // Mark file content as binary
        };
      } else if (Array.isArray(data)) {
        // Recursively handle arrays
        return Promise.all(data.map(item => this.encryptData(item)));
      } else if (typeof data === 'object' && data !== null) {
        // Recursively handle objects
        const result = {};
        for (const [key, value] of Object.entries(data)) {
          result[key] = await this.encryptData(value);
        }
        return result;
      } else {
        // Handle general data encryption
        const preprocessedData = this.preprocessData(data);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
        let encrypted = cipher.update(preprocessedData, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        const tag = cipher.getAuthTag(); // Get authentication tag for integrity verification
        return {
          encryptedData: encrypted,
          authTag: tag.toString('base64'),
          iv: iv.toString('base64')
        };
      }
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }
}

module.exports = { InkriptoGuard };

// Example usage
async function main() {
  const inkriptoGuard = new InkriptoGuard();
  const data = {
    name: 'Alice',
    age: 30,
    car: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2015
    },
    hobbies: ['reading', 'swimming', 'coding'],
    document: '/Users/prince.brown/Documents/important/encrypt/some-cool-wallpapers-v0-9gay3iib47da11.png' // Example file in object
  };

  try {
    // Encrypt the entire object including the file content within
    const encryptedObject = await inkriptoGuard.encryptData(data);
    console.log('Encrypted Object:', encryptedObject);
    const decryptedObject = await inkriptoGuard.decryptData(encryptedObject);
    console.log('Decrypted Object:', decryptedObject);
  } catch (error) {
    console.error('Operation failed:', error);
  }
}

main();
