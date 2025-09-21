/**
 * Represents a handle for managing subscriptions to topics in the Hedera network.
 *
 * The `SubscriptionHandle` class provides methods to manage the lifecycle of a subscription,
 * including setting a callback function to be executed when an event occurs and unsubscribing
 * from the topic notifications. It is primarily used for handling real-time updates from the
 * Hedera network like topic subscriptions.
 */
export default class SubscriptionHandle {
    /** @type {{(): void} | null} */
    _call: {
        (): void;
    } | null;
    /** @type {boolean} */
    _unsubscribed: boolean;
    /**
     * @param {() => void} call
     * @returns {void}
     */
    _setCall(call: () => void): void;
    unsubscribe(): void;
}
