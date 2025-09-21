"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaCreateTopicTool = void 0;
const tools_1 = require("@langchain/core/tools");
class HederaCreateTopicTool extends tools_1.Tool {
    constructor(hederaKit) {
        super();
        this.hederaKit = hederaKit;
        this.name = 'hedera_create_topic';
        this.description = `Create a topic on Hedera
Inputs ( input is a JSON string ):
name: string, the name of the topic e.g. My Topic,
isSubmitKey: boolean, decides whether submit key should be set, false if not passed
Example usage:
1. Create a topic with memo "My Topic":
  '{
    "name": "My Topic",
    "isSubmitKey": false
  }'
2. Create a topic with memo "My Topic". Restrict posting with a key:
  '{
    "name": "My Topic",
    "isSubmitKey": true
  }'
3. Create a topic with memo "My Topic". Do not set a submit key:
  '{
    "name": "My Topic",
    "isSubmitKey": false
  }'
`;
    }
    async _call(input, _runManager, config) {
        try {
            const isCustodial = config?.configurable?.isCustodial === true;
            console.log(`hedera_create_topic tool has been called (${isCustodial ? 'custodial' : 'non-custodial'})`);
            const parsedInput = JSON.parse(input);
            return await this.hederaKit
                .createTopic(parsedInput.name, parsedInput.isSubmitKey, isCustodial)
                .then(response => response.getStringifiedResponse());
        }
        catch (error) {
            return JSON.stringify({
                status: "error",
                message: error.message,
                code: error.code || "UNKNOWN_ERROR",
            });
        }
    }
}
exports.HederaCreateTopicTool = HederaCreateTopicTool;
//# sourceMappingURL=create_topic_tool.js.map