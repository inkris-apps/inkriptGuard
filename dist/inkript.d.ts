declare class InkriptGuard {
    private key;
    private fs;
    constructor();
    private generateIV;
    private preprocessData;
    private reversePreprocessData;
    decrypt(encryptedPackage: any): Promise<any>;
    private isFilePath;
    encrypt(data: any): Promise<any>;
}
export default InkriptGuard;
