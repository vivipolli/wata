import { BroadcastChannel } from './broadcast-channel';
import { encode, decode, toBase64, fromBase64, toBuffer } from 'base64url';
if (typeof window !== 'undefined') {
  window.broadcastChannelLib = {};
  window.broadcastChannelLib.BroadcastChannel = BroadcastChannel;
  window.base64urlLib = {};
  window.base64urlLib.encode = encode;
  window.base64urlLib.decode = decode;
  window.base64urlLib.toBase64 = toBase64;
  window.base64urlLib.fromBase64 = fromBase64;
  window.base64urlLib.toBuffer = toBuffer;
}