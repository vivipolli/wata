import { exists, writeJsonFile, readJsonFile, move, } from "@nomicfoundation/hardhat-utils/fs";
export class FileManagerImpl {
    fileExists(absolutePath) {
        return exists(absolutePath);
    }
    async writeJsonFile(absolutePathToFile, keystoreFile) {
        // First write to a temporary file, then move it to minimize the risk of file corruption
        const tmpPath = `${absolutePathToFile}.tmp`;
        await writeJsonFile(tmpPath, keystoreFile);
        return move(tmpPath, absolutePathToFile);
    }
    readJsonFile(absolutePathToFile) {
        return readJsonFile(absolutePathToFile);
    }
}
//# sourceMappingURL=file-manager.js.map