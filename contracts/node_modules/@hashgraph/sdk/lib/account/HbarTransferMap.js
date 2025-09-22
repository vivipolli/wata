import o from"./AccountId.js";import t from"../Hbar.js";import r from"../ObjectMap.js";class n extends r{constructor(){super(t=>o.fromString(t))}static _fromProtobuf(r){const s=new n;for(const n of null!=r.accountAmounts?r.accountAmounts:[]){const r=o._fromProtobuf(n.accountID);s._set(r,t.fromTinybars(n.amount))}return s}}export{n as default};
//# sourceMappingURL=HbarTransferMap.js.map
