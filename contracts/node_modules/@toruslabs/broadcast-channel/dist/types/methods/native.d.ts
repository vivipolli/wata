export function create(channelName: any): {
    time: number;
    messagesCallback: any;
    bc: BroadcastChannel;
    subFns: any[];
};
export function close(channelState: any): void;
export function postMessage(channelState: any, messageJson: any): Promise<void>;
export function onMessage(channelState: any, fn: any): void;
export function canBeUsed(): boolean;
export function averageResponseTime(): number;
export const microSeconds: typeof micro;
export const type: "native";
import { microSeconds as micro } from '../util';
