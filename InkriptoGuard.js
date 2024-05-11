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

  // Function to preprocess data with compression and a unique transformation
  preprocessData(data) {
    let stringData = (typeof data === 'object' || typeof data === 'number' || typeof data === 'boolean')
      ? JSON.stringify(data)
      : String(data);

    // Apply a simple transformation (e.g., reverse the string)
    stringData = stringData.split('').reverse().join('');

    // Compress the data using zlib
    return zlib.deflateSync(stringData).toString('base64');
  }

// Function to reverse the preprocessing (decompression and reverse transformation)
reversePreprocessData(compressedData) {
  try {
    // Ensure the data is a Buffer
    const bufferData = Buffer.from(compressedData, 'base64');
    // Decompress the data
    const decompressedData = zlib.inflateSync(bufferData).toString();
    // Reverse the simple transformation (e.g., reverse the string)
    return decompressedData.split('').reverse().join('');
  } catch (e) {
    console.error('Decompression failed:', e);
    // If decompression fails, return the original binary data
    return Buffer.from(compressedData, 'base64');
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
          iv: iv.toString('base64')
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

  // Unified decryption method that handles all types of input data
  async decryptData(encryptedPackage) {
    try {
      if (typeof encryptedPackage === 'object' && encryptedPackage !== null) {
        if ('encryptedData' in encryptedPackage) {
          // Check if it's file data or regular data based on size and try direct decryption
          const { encryptedData, authTag, iv } = encryptedPackage;
          const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64'));
          decipher.setAuthTag(Buffer.from(authTag, 'base64'));
          let decrypted = decipher.update(encryptedData, 'base64');
          decrypted = Buffer.concat([decrypted, decipher.final()]);
          // If the decrypted data is small, treat it as compressed text; otherwise, return as buffer
          return decrypted.length < 1000 ? this.reversePreprocessData(decrypted.toString('utf8')) : decrypted;
        } else {
          // Recursively handle objects and arrays
          const result = Array.isArray(encryptedPackage) ? [] : {};
          for (const [key, value] of Object.entries(encryptedPackage)) {
            result[key] = await this.decryptData(value);
          }
          return result;
        }
      } else {
        // Base case: not an object, direct return
        return encryptedPackage;
      }
    } catch (error) {
      console.error('Decryption failed:', error);
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
