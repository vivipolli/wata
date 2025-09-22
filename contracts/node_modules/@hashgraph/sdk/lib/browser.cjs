"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Client: true,
  LocalProvider: true,
  AddressBookQuery: true
};
Object.defineProperty(exports, "AddressBookQuery", {
  enumerable: true,
  get: function () {
    return _AddressBookQueryWeb.default;
  }
});
Object.defineProperty(exports, "Client", {
  enumerable: true,
  get: function () {
    return _WebClient.default;
  }
});
Object.defineProperty(exports, "LocalProvider", {
  enumerable: true,
  get: function () {
    return _LocalProviderWeb.default;
  }
});
var _exports = require("./exports.cjs");
Object.keys(_exports).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _exports[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _exports[key];
    }
  });
});
var _WebClient = _interopRequireDefault(require("./client/WebClient.cjs"));
var _LocalProviderWeb = _interopRequireDefault(require("./LocalProviderWeb.cjs"));
var _AddressBookQueryWeb = _interopRequireDefault(require("./network/AddressBookQueryWeb.cjs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }