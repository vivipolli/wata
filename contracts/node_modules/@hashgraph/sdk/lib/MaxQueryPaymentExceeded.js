class e extends Error{constructor(e,t){super(),this.message=`query cost of ${e.toString()} HBAR exceeds max set on client: ${t.toString()} HBAR`,this.name="MaxQueryPaymentExceededError",this.queryCost=e,this.maxQueryPayment=t}}export{e as default};
//# sourceMappingURL=MaxQueryPaymentExceeded.js.map
