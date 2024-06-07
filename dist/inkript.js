"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const zlib = __importStar(require("zlib"));
class InkriptGuard {
    constructor() {
        this.fs = null;
        this.key = crypto.randomBytes(32); // AES-256 requires a 32-byte key (256 bits)
        if (typeof window === "undefined") {
            Promise.resolve().then(() => __importStar(require("fs"))).then(fsModule => {
                this.fs = fsModule;
            }).catch(err => {
                console.error("Failed to load fs module:", err);
            });
        }
    }
    // Function to generate a random IV
    generateIV() {
        return crypto.randomBytes(16); // IV is 16 bytes for AES
    }
    // Preprocess data with compression and a unique transformation for non-binary data
    preprocessData(data) {
        if (this.fs && this.isFilePath(data)) {
            const fileBuffer = this.fs.readFileSync(data);
            return fileBuffer.toString("base64"); // Keep file content as base64
        }
        else {
            let stringData = typeof data === "object" ||
                typeof data === "number" ||
                typeof data === "boolean"
                ? JSON.stringify(data)
                : String(data);
            stringData = stringData.split("").reverse().join("");
            return zlib.deflateSync(stringData).toString("base64");
        }
    }
    // Reverse preprocessing considering the binary nature of certain data
    reversePreprocessData(compressedData, isBinary = false) {
        try {
            const bufferData = Buffer.from(compressedData, "base64");
            if (isBinary) {
                return bufferData; // Return as buffer for binary data
            }
            const decompressedData = zlib.inflateSync(bufferData).toString();
            return decompressedData.split("").reverse().join("");
        }
        catch (e) {
            console.error("Decompression failed:", e);
            return Buffer.from(compressedData, "base64");
        }
    }
    // Decrypt data with consideration for its type (binary vs. textual)
    decrypt(encryptedPackage) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (typeof encryptedPackage === "object" && encryptedPackage !== null) {
                    if ("encryptedData" in encryptedPackage) {
                        const { encryptedData, authTag, iv } = encryptedPackage;
                        const decipher = crypto.createDecipheriv("aes-256-gcm", this.key, Buffer.from(iv, "base64"));
                        decipher.setAuthTag(Buffer.from(authTag, "base64"));
                        let decrypted = decipher.update(encryptedData, "base64");
                        decrypted = Buffer.concat([decrypted, decipher.final()]);
                        // Check if it's binary using an explicit flag
                        const isBinary = encryptedPackage.isBinary || false;
                        return this.reversePreprocessData(decrypted.toString("utf8"), isBinary);
                    }
                    else {
                        const result = Array.isArray(encryptedPackage) ? [] : {};
                        for (const [key, value] of Object.entries(encryptedPackage)) {
                            result[key] = yield this.decrypt(value);
                        }
                        return result;
                    }
                }
                else {
                    return encryptedPackage;
                }
            }
            catch (error) {
                console.error("Decryption failed:", error);
                return null;
            }
        });
    }
    // Check if the input is a file path
    isFilePath(data) {
        return (typeof data === "string" &&
            this.fs !== null &&
            this.fs.existsSync(data) &&
            this.fs.lstatSync(data).isFile());
    }
    // Unified encryption method for all data types
    encrypt(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const iv = this.generateIV(); // Generate a new IV for each encryption
            try {
                if (this.fs && this.isFilePath(data)) {
                    const fileBuffer = this.fs.readFileSync(data);
                    const cipher = crypto.createCipheriv("aes-256-gcm", this.key, iv);
                    let encrypted = cipher.update(fileBuffer);
                    encrypted = Buffer.concat([encrypted, cipher.final()]);
                    return {
                        encryptedData: encrypted.toString("base64"),
                        authTag: cipher.getAuthTag().toString("base64"),
                        iv: iv.toString("base64"),
                        isBinary: true,
                    };
                }
                else if (Array.isArray(data)) {
                    return Promise.all(data.map((item) => this.encrypt(item)));
                }
                else if (typeof data === "object" && data !== null) {
                    const result = {};
                    for (const [key, value] of Object.entries(data)) {
                        result[key] = yield this.encrypt(value);
                    }
                    return result;
                }
                else {
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
            }
            catch (error) {
                console.error("Encryption failed:", error);
                return null;
            }
        });
    }
}
exports.default = InkriptGuard;
