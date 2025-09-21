"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proto = exports.google = exports.com = exports.Writer = exports.Reader = void 0;
var $protobuf = _interopRequireWildcard(require("protobufjs/minimal.js"));
var _long = _interopRequireDefault(require("long"));
var $proto = _interopRequireWildcard(require("./proto.js"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function (e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != typeof e && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
(() => {
  var $util = $protobuf.util;
  if ($util.Long == null) {
    console.log(`Patching Protobuf Long.js instance...`);
    $util.Long = _long.default;
    if ($protobuf.Reader._configure != null) {
      $protobuf.Reader._configure($protobuf.BufferReader);
    }
  }
})();
const Reader = $protobuf.Reader;
exports.Reader = Reader;
const Writer = $protobuf.Writer;
exports.Writer = Writer;
const proto = $proto.proto;
exports.proto = proto;
const com = $proto.com;
exports.com = com;
const google = $proto.google;
exports.google = google;