class t extends Error{constructor(t,s,e,r,i){super(`Entity ID ${t.toString()}.${s.toString()}.${e.toString()}-${r} was incorrect.`),this.name="BadEntityIdException",this.shard=t,this.realm=s,this.num=e,this.presentChecksum=r,this.expectedChecksum=i}}export{t as default};
//# sourceMappingURL=BadEntityIdError.js.map
