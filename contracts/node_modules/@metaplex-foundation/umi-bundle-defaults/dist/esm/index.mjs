import { createUmi as createUmi$1 } from '@metaplex-foundation/umi';
import { defaultPlugins } from './plugin.mjs';
export { defaultPlugins } from './plugin.mjs';

function createUmi(endpointOrConnection, rpcOptions) {
  return createUmi$1().use(typeof endpointOrConnection === 'string' ? defaultPlugins(endpointOrConnection, rpcOptions) : defaultPlugins(endpointOrConnection, rpcOptions));
}

export { createUmi };
//# sourceMappingURL=index.mjs.map
