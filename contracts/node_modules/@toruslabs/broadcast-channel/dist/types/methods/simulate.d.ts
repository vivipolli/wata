export function create(channelName: any): {
    time: number;
    name: any;
    messagesCallback: any;
};
export function close(channelState: any): void;
export function postMessage(channelState: any, messageJson: any): Promise<any>;
export function onMessage(channelState: any, fn: any): void;
export function canBeUsed(): boolean;
export function averageResponseTime(): number;
export const microSeconds: typeof micro;
export const type: "simulate";
export const SIMULATE_DELAY_TIME: 5;
import { microSeconds as micro } from '../util';
