import { TopicId } from "@hashgraph/sdk";
import { HederaNetworkType, HCSMessage } from "../../../types";
/**
 * Method for fetching messages for a given topic between timestamps. Messages are paginated, with 100 messages per page.
 * @param topicId id of requested topic
 * @param networkType network on which requested topic is hosted
 * @param lowerTimestamp optional unix timestamp in format seconds.milliseconds.
 * @param upperTimestamp optional unix timestamp in format seconds.milliseconds.
 */
export declare const get_topic_messages: (topicId: TopicId, networkType: HederaNetworkType, lowerTimestamp?: number, upperTimestamp?: number) => Promise<Array<HCSMessage>>;
//# sourceMappingURL=get_topic_messages.d.ts.map