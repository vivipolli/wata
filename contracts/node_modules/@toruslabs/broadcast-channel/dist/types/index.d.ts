export * from "./method-chooser";
import * as NativeMethod from './methods/native';
import * as IndexedDbMethod from './methods/indexed-db';
import * as LocalstorageMethod from './methods/localstorage';
import * as ServerMethod from './methods/server';
export { NativeMethod, IndexedDbMethod, LocalstorageMethod, ServerMethod };
export { BroadcastChannel, enforceOptions, OPEN_BROADCAST_CHANNELS } from "./broadcast-channel";
