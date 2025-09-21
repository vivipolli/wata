import o from"long";class s{constructor(s){this.seconds=s instanceof o?s:o.fromNumber(s),Object.freeze(this)}_toProtobuf(){return{seconds:this.seconds}}static _fromProtobuf(o){return new s(o.seconds)}}export{s as default};
//# sourceMappingURL=Duration.js.map
