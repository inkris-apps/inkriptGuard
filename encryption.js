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
    const decompressedData = zlib.inflateSync(Buffer.from(compressedData, 'base64')).toString();
    return decompressedData.split('').reverse().join('');
  }

  // Function to check if the input is a file path
  isFilePath(data) {
    return typeof data === 'string' && (fs.existsSync(data) && fs.lstatSync(data).isFile());
  }

  // Recursively encrypt data including files within objects
  async recursiveEncrypt(data, key) {
    if (this.isFilePath(data)) {
      // Handle file content encryption
      const fileContent = fs.readFileSync(data);
      return await this.encryptData(fileContent, key);
    } else if (Array.isArray(data)) {
      // Handle array
      return Promise.all(data.map(item => this.recursiveEncrypt(item, key)));
    } else if (typeof data === 'object' && data !== null) {
      // Handle object
      const result = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = await this.recursiveEncrypt(value, this.key);
      }
      return result;
    } else {
      // Handle general data
      return await this.encryptData(data, key);
    }
  }

  // Encrypt function that takes any data type with preprocessing
  async encryptData(data) {
    const iv = this.generateIV(); // Generate a new IV for each encryption
    try {
      if (this.isFilePath(data)) {
        // Handle file encryption
        const input = fs.createReadStream(data);
        const outputPath = data + '.enc';
        const output = fs.createWriteStream(outputPath);
        const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);

        return new Promise((resolve, reject) => {
          input.pipe(cipher).pipe(output);
          output.on('finish', () => resolve({
            encryptedFilePath: outputPath,
            authTag: cipher.getAuthTag().toString('base64'),
            iv: iv.toString('base64')
          }));
          output.on('error', reject);
        });
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

  // Recursive decryption handling embedded file content
  async recursiveDecrypt(data, key) {
    if (typeof data === 'object' && data !== null) {
      if (data.encryptedData && data.authTag && data.iv) {
        // This is an encrypted piece
        return await this.decryptData(data, key);
      } else {
        // Traverse object or array
        const result = Array.isArray(data) ? [] : {};
        for (const [key, value] of Object.entries(data)) {
          result[key] = await this.recursiveDecrypt(value, this.key);
        }
        return result;
      }
    } else {
      // Base case: not an object, direct return
      return data;
    }
  }

  // Decrypt function that takes an encrypted package
  async decryptData(encryptedPackage) {
    try {
      const { encryptedData, authTag, iv } = encryptedPackage;
      if ('encryptedFilePath' in encryptedPackage) {
        // Handle file decryption
        const input = fs.createReadStream(encryptedPackage.encryptedFilePath);
        const outputPath = encryptedPackage.encryptedFilePath.replace('.enc', '');
        const output = fs.createWriteStream(outputPath);
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64'));
        decipher.setAuthTag(Buffer.from(authTag, 'base64'));

        return new Promise((resolve, reject) => {
          input.pipe(decipher).pipe(output);
          output.on('finish', () => resolve(outputPath));
          output.on('error', reject);
        });
      } else {
        // Handle general data decryption
        const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, Buffer.from(iv, 'base64'));
        decipher.setAuthTag(Buffer.from(authTag, 'base64'));
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return this.reversePreprocessData(decrypted);
      }
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }
}

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
  //  document: '/Users/prince.brown/Documents/important/encrypt/some-cool-wallpapers-v0-9gay3iib47da1.png' // Example file in object
  };

  try {
    // Encrypt the entire object including the file content within
    const encryptedObject = await inkriptoGuard.recursiveEncrypt(data);
    console.log('Encrypted Object:', encryptedObject);
    const decryptedObject = await inkriptoGuard.recursiveDecrypt(encryptedObject);
    console.log('Decrypted Object:', decryptedObject);
  } catch (error) {
    console.error('Operation failed:', error);
  }
}

main();
