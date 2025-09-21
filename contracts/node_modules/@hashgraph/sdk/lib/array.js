function e(e,t){if(e===t)return!0;if(e.byteLength!==t.byteLength)return!1;const n=new DataView(e.buffer,e.byteOffset,e.byteLength),f=new DataView(t.buffer,t.byteOffset,t.byteLength);let r=e.byteLength;for(;r--;)if(n.getUint8(r)!==f.getUint8(r))return!1;return!0}export{e as arrayEqual};
//# sourceMappingURL=array.js.map
