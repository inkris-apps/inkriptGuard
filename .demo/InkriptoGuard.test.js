const fs = require("fs");
const path = require("path");

const { InkriptoGuard } = require("./InkriptoGuard.js");

describe("InkriptoGuard", () => {
  test("should encrypt and decrypt a simple string", async () => {
    const inkriptoGuard = new InkriptoGuard();
    const data = "Hello, world!";
    
    const encrypted = await inkriptoGuard.encryptData(data);
    console.log("Encrypted Data:", encrypted);

    const decrypted = await inkriptoGuard.decryptData(encrypted);
    console.log("Decrypted Data:", decrypted);

    expect(decrypted).toBe(data);
  });

  test("should encrypt and decrypt an object with nested values", async () => {
    const inkriptoGuard = new InkriptoGuard();
    const data = {
      name: "Alice",
      age: 30,
      preferences: {
        color: "blue",
        hobbies: ["reading", "swimming"],
      },
    };
    const encrypted = await inkriptoGuard.encryptData(data);
    console.log("Encrypted Object:", encrypted);

    const decrypted = await inkriptoGuard.decryptData(encrypted);
    console.log("Decrypted Object:", decrypted);

    // Convert age back to integer if it is a string
    if (typeof decrypted.age === 'string') {
      decrypted.age = parseInt(decrypted.age, 10);
    }

    expect(decrypted).toEqual(data);
  });
const os = require('os');
const path = require('path');

 
// test("should handle file encryption and decryption", async () => {
//   const inkriptoGuard = new InkriptoGuard();
//   // Prepare a sample file
//   const filePath = "/Users/prince.brown/Documents/important/encrypt/logo-1.png"; 
//   const originalContent = fs.readFileSync(filePath);
  
//   const encrypted = await inkriptoGuard.encryptData(filePath);
//   console.log("Encrypted File Data:", encrypted);

//   const decryptedBuffer = await inkriptoGuard.decryptData(encrypted);
//   console.log("Decrypted File Content (Hex):", decryptedBuffer);

//   console.log("Original Content (Hex):", originalContent.toString('hex'));
//   console.log("Decrypted Content (Hex):", decryptedBuffer);

//   expect(decryptedBuffer).toBe(originalContent.toString('hex'));
  
//   // Cleanup
//   fs.unlinkSync(filePath);
// });

  
});
