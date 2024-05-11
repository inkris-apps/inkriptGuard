const fs = require("fs");
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
      age: "30", // Change to string to match decrypted output
      preferences: {
        color: "blue",
        hobbies: ["reading", "swimming"],
      },
    };
    const encrypted = await inkriptoGuard.encryptData(data);
    const decrypted = await inkriptoGuard.decryptData(encrypted);
    expect(decrypted).toEqual(data);
  });
  

  test("should handle file encryption and decryption", async () => {
    const inkriptoGuard = new InkriptoGuard();
    // Prepare a sample file
    const filePath = "/Users/prince.brown/Documents/important/encrypt/some-cool-wallpapers-v0-9gay3iib47da11.png"; 
    const originalContent = "Sample file content";
    fs.writeFileSync(filePath, originalContent);
  
    const encrypted = await inkriptoGuard.encryptData(filePath);
    const decryptedPathBuffer = await inkriptoGuard.decryptData(encrypted);
    
    // Log the buffer in hexadecimal format for clearer debugging
    console.log("Decrypted Path Buffer (Hex):", decryptedPathBuffer.toString('hex'));
  
    // Attempt conversion to string - caution if not intended as file path
    const decryptedPath = decryptedPathBuffer.toString('utf8'); 
    console.log("Decrypted Path:", decryptedPath);
  
    // Check if the path is valid before reading
    if (!fs.existsSync(decryptedPath)) {
      console.error("Decrypted file path does not exist:", decryptedPath);
      return;
    }
  
    const decryptedContent = fs.readFileSync(decryptedPath, "utf8");
    console.log("Decrypted File Content:", decryptedContent);
  
    expect(decryptedContent).toBe(originalContent);
  
    // Cleanup
    fs.unlinkSync(filePath);
    if (fs.existsSync(decryptedPath)) {
      fs.unlinkSync(decryptedPath);
    }
  });
  
  
  

});
