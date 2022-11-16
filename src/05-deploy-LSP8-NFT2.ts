// import "dotenv/config";
// import { LSPFactory } from "@lukso/lsp-factory.js";
// import { RPC_ENDPOINT_L14, RPC_ENDPOINT_L16, RPC_ENDPOINT_MUMBAI, RPC_ENDPOINT_GOERLI, RPC_GANACHE } from "./constants";
// import Web3 from "web3";

// const web3 = new Web3();

// console.log("process.env.PRIVATE_KEY: ", process.env.PRIVATE_KEY);

// const myEOA = web3.eth.accounts.wallet.add(process.env.PRIVATE_KEY || "");
// console.log(`Loaded address: ${myEOA.address} from process.env`);

// //const lspFactory = new LSPFactory(RPC_ENDPOINT_L14, {
// //const lspFactory = new LSPFactory(RPC_ENDPOINT_L16, {
// //const lspFactory = new LSPFactory(RPC_ENDPOINT_MUMBAI, {
// //const lspFactory = new LSPFactory(RPC_ENDPOINT_GOERLI, {
// const lspFactory = new LSPFactory(RPC_GANACHE, {
//   deployKey: process.env.PRIVATE_KEY, // Private key of the account which will deploy any smart contract,
//   //chainId: 22,
//   //chainId: 2828,
//   //chainId: 80001, 
//   chainId: 5777,
//   //chainId: 5, 
//   // 22 for L14
//   // 2828 for L16
//   // 80001 for Mumbai
//   // 5 for Goerli
//   // 5777 for Ganache
// });

// const deploymentEventsLSP8NFT2 = [];

// const main = async () => {
//   console.log("Deploying a LSP8 NFT 2.0 with lsp-factory.js");
//   const myLSP8NFT2 = await lspFactory.LSP8IdentifiableDigitalAsset.deploy({
//     controllerAddress: myEOA.address,
//     name: 'Kiki Token',
//     symbol: 'KIKI',
//   },
//   {
//     onDeployEvents: {
//       next: (deploymentEvent) => {
//         console.log(deploymentEvent);
//         deploymentEventsLSP8NFT2.push(deploymentEvent);
//       },
//       error: (error) => {
//         console.error(error);
//       },
//       complete: (nft) => {
//         console.log('LSP8 NFT 2.0 deployment completed');
//         console.log("NFT 2.0 Address", nft.LSP8IdentifiableDigitalAsset.address);
//         console.log("NFT 2.0 Receipt", nft.LSP8IdentifiableDigitalAsset.receipt);
//         console.log(nft);
//         console.log("---------------------- Done! ----------------------------");
//       },
//     }
//   });
// };

// main();