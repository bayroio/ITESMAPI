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

// const deploymentEventsLSP7NFT2 = [];

// const main = async () => {
//   console.log("Deploying a LSP7 NFT 2.0 with lsp-factory.js");
//   const myLSP7NFT2 = await lspFactory.LSP7DigitalAsset.deploy({
//     isNFT: true,
//     controllerAddress: myEOA.address,
//     name: 'Kiki Token',
//     symbol: 'KIKI',
//   },
//   {
//     onDeployEvents: {
//       next: (deploymentEvent) => {
//         console.log(deploymentEvent);
//         deploymentEventsLSP7NFT2.push(deploymentEvent);
//       },
//       error: (error) => {
//         console.error(error);
//       },
//       complete: (nft) => {
//         console.log('LSP7 NFT 2.0 deployment completed');
//         console.log("NFT 2.0 Address", nft.LSP7DigitalAsset.address);
//         console.log("NFT 2.0 Receipt", nft.LSP7DigitalAsset.receipt);
//         console.log(nft);
//         console.log("---------------------- Done! ----------------------------");
//       },
//     }
//   });
// };

// main();