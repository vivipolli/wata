export async function validateKey(key) {
    const KEY_REGEX = /^[a-zA-Z_]+[a-zA-Z0-9_]*$/;
    if (KEY_REGEX.test(key)) {
        return true;
    }
    return false;
}
//# sourceMappingURL=validate-key.js.map