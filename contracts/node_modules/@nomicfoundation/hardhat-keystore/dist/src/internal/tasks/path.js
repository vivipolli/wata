const taskPath = async (args, hre) => {
    await path(args, hre);
};
export const path = async ({ dev }, hre, consoleLog = console.log) => {
    const keystoreFilePath = dev
        ? hre.config.keystore.devFilePath
        : hre.config.keystore.filePath;
    consoleLog(keystoreFilePath);
};
export default taskPath;
//# sourceMappingURL=path.js.map