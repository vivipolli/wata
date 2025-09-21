"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HederaGetBalanceTool = void 0;
const tools_1 = require("@langchain/core/tools");
class HederaGetBalanceTool extends tools_1.Tool {
    constructor(hederaKit) {
        super();
        this.hederaKit = hederaKit;
        this.name = 'hedera_get_hbar_balance';
        this.description = `Retrieves the HBAR balance of a specified Hedera account.  
If an account ID is provided, it returns the balance of that account.  
If no input is given (empty JSON '{}'), it returns the balance of the connected account.  

### **Inputs** (optional, input is a JSON string):  
- **accountId** (*string*, optional): The Hedera account ID to check the balance for (e.g., "0.0.789012").  
  - If omitted, the tool will return the balance of the connected account.  

### **Example Usage:**  
1. **Get balance of a specific account:**  
   '{ "accountId": "0.0.123456" }'  
2. **Get balance of the connected account:**  
   '{}'
`;
    }
    async _call(input) {
        try {
            console.log('hedera_get_hbar_balance tool has been called');
            const parsedInput = JSON.parse(input);
            const balance = await this.hederaKit.getHbarBalance(parsedInput?.accountId);
            return JSON.stringify({
                status: "success",
                balance: balance,
                unit: "HBAR"
            });
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
exports.HederaGetBalanceTool = HederaGetBalanceTool;
//# sourceMappingURL=get_hbar_balance_tool.js.map