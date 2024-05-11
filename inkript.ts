import * as crypto from "crypto";
import * as zlib from "zlib";
import * as fs from "fs";

class InkriptGuard {
  private key: Buffer;

  constructor() {
    this.key = crypto.randomBytes(32); // AES-256 requires a 32-byte key
  }

  // Function to generate a random IV
  private generateIV(): Buffer {
    return crypto.randomBytes(16); // IV is 16 bytes for AES
  }

  // Preprocess data with compression and a unique transformation for non-binary data
  private preprocessData(data: any): string {
    if (this.isFilePath(data)) {
      const fileBuffer = fs.readFileSync(data);
      return fileBuffer.toString("base64"); // Keep file content as base64
    } else {
      let stringData =
        typeof data === "object" ||
        typeof data === "number" ||
        typeof data === "boolean"
          ? JSON.stringify(data)
          : String(data);

      stringData = stringData.split("").reverse().join("");
      return zlib.deflateSync(stringData).toString("base64");
    }
  }

  // Reverse preprocessing considering the binary nature of certain data
  private reversePreprocessData(compressedData: string, isBinary: boolean = false): string | Buffer {
    try {
      const bufferData = Buffer.from(compressedData, "base64");
      if (isBinary) {
        return bufferData; // Return as buffer for binary data
      }
      const decompressedData = zlib.inflateSync(bufferData).toString();
      return decompressedData.split("").reverse().join("");
    } catch (e) {
      console.error("Decompression failed:", e);
      return Buffer.from(compressedData, "base64");
    }
  }

  // Decrypt data with consideration for its type (binary vs. textual)
  public async decrypt(encryptedPackage: any): Promise<any> {
    try {
      if (typeof encryptedPackage === "object" && encryptedPackage !== null) {
        if ("encryptedData" in encryptedPackage) {
          const { encryptedData, authTag, iv } = encryptedPackage;
          const decipher = crypto.createDecipheriv(
            "aes-256-gcm",
            this.key,
            Buffer.from(iv, "base64")
          );
          decipher.setAuthTag(Buffer.from(authTag, "base64"));
          let decrypted = decipher.update(encryptedData, "base64");
          decrypted = Buffer.concat([decrypted, decipher.final()]);

          // Check if it's binary using an explicit flag
          const isBinary = encryptedPackage.isBinary || false;
          return this.reversePreprocessData(
            decrypted.toString("utf8"),
            isBinary
          );
        } else {
          const result: Record<string, any> = Array.isArray(encryptedPackage) ? [] : {};
          for (const [key, value] of Object.entries(encryptedPackage)) {
            result[key] = await this.decrypt(value);
          }
          return result;
        }
      } else {
        return encryptedPackage;
      }
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  }

  // Check if the input is a file path
  private isFilePath(data: string): boolean {
    return (
      typeof data === "string" &&
      fs.existsSync(data) &&
      fs.lstatSync(data).isFile()
    );
  }

  // Unified encryption method for all data types
  public async encrypt(data: any): Promise<any> {
    const iv = this.generateIV(); // Generate a new IV for each encryption
    try {
      if (this.isFilePath(data)) {
        const fileBuffer = fs.readFileSync(data);
        const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
        let encrypted = cipher.update(fileBuffer);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return {
          encryptedData: encrypted.toString("base64"),
          authTag: cipher.getAuthTag().toString("base64"),
          iv: iv.toString("base64"),
          isBinary: true,
        };
      } else if (Array.isArray(data)) {
        return Promise.all(data.map((item) => this.encrypt(item)));
      } else if (typeof data === "object" && data !== null) {
        const result: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          result[key] = await this.encrypt(value);
        }
        return result;
      } else {
        const preprocessedData = this.preprocessData(data);
        const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
        let encrypted = cipher.update(preprocessedData, "utf8", "base64");
        encrypted += cipher.final("base64");
        const tag = cipher.getAuthTag();
        return {
          encryptedData: encrypted,
          authTag: tag.toString("base64"),
          iv: iv.toString("base64"),
        };
      }
    } catch (error) {
      console.error("Encryption failed:", error);
      return null;
    }
  }
}

export { InkriptGuard };
