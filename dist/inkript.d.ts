declare class InkriptGuard {
    private key;
    constructor();
    private generateIV;
    private preprocessData;
    private reversePreprocessData;
    decrypt(encryptedPackage: any): Promise<any>;
    private isFilePath;
    encrypt(data: any): Promise<any>;
}
export { InkriptGuard };
