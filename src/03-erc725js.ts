// // https://docs.lukso.tech/tools/erc725js/getting-started

// import { ERC725, ERC725JSONSchema } from "@erc725/erc725.js";
// import Web3 from "web3";
// import LSP3 from "@erc725/erc725.js/schemas/LSP3UniversalProfileMetadata.json";
// import { RPC_ENDPOINT_L14, RPC_ENDPOINT_L16, RPC_ENDPOINT_MUMBAI, RPC_ENDPOINT_GOERLI, RPC_GANACHE } from "./constants";

// const upAddress = "0x96A9280dA1b7A44B9702F684Ff8fE2bf112D8787"; //"0xc6D4e65AbaB748C41a772d2F28DD0D0ecEF47Aec";
// //const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT_L14);
// //const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT_L16);
// //const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT_MUMBAI);
// //const provider = new Web3.providers.HttpProvider(RPC_ENDPOINT_GOERLI);
// const provider = new Web3.providers.HttpProvider(RPC_GANACHE);
// const config = {
//   ipfsGateway: "https://ipfs.lukso.network/ipfs/",
// };

// const erc725 = new ERC725(
//   LSP3 as ERC725JSONSchema[],
//   upAddress,
//   provider,
//   config
// );

// const main = async () => {
//   console.log("Starting...");
//   const data = await erc725.getData();
//   console.log(data);
//   console.log("Done");
// };

// main();
