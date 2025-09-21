class t extends Error{constructor(t,e){super(t),this.nodeAccountId=e}toJSON(){return{message:this.message,nodeAccountId:this.nodeAccountId}}toString(){return JSON.stringify(this.toJSON())}valueOf(){return this.toJSON()}}export{t as default};
//# sourceMappingURL=MaxAttemptsOrTimeoutError.js.map
