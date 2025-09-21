async function t(t){return new Uint8Array(await window.crypto.subtle.digest("SHA-384",t))}export{t as digest};
//# sourceMappingURL=sha384.browser.js.map
