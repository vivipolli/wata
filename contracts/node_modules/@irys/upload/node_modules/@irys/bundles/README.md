# Irys bundles
**If you want to use the Irys Network, head over to [our SDK](https://github.com/Irys-xyz/js-sdk)**

A low level library for creating, editing, reading and verifying bundles.

## Installing the library

Using npm:

`npm install @irys/bundles`

Using yarn:

`yarn add @irys/bundles`

## Creating bundles

```ts
import { bundleAndSignData, createData, EthereumSigner } from "@irys/bundles";

const dataItems = [createData("some data"), createData("some other data")];

const signer = new EthereumSigner("privateKey")

const bundle = await bundleAndSignData(dataItems, signer);
```
