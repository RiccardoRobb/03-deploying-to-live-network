import { Square } from './Square.js';
import { isReady, shutdown, Mina, PrivateKey } from 'snarkyjs';
import { loopUntilAccountExists } from './utils.js';
import fs from 'fs';

await isReady;
console.log('SnarkyJS loaded');

// ----------------------------------------------------

const Berkeley = Mina.Network(
    'https://proxy.berkeley.minaexplorer.com/graphql'
);
Mina.setActiveInstance(Berkeley);

// ----------------------------------------------------

const transactionFee = 100_000_000;
const deployAlias = process.argv[2];
const deployerKeysFileContents = fs.readFileSync(
    'keys/' + deployAlias + '.json',
    'utf8'
);
const deployerPrivateKeyBase58 = JSON.parse(
    deployerKeysFileContents
).privateKey;
const deployerPrivateKey = PrivateKey.fromBase58(deployerPrivateKeyBase58);
const deployerPublicKey = deployerPrivateKey.toPublicKey();

const zkAppPrivateKey = deployerPrivateKey;

const payerAlias = process.argv[3];
const payerKeysFileContents = fs.readFileSync(
    'keys/' + payerAlias + '.json',
    'utf8'
);
const payerPrivateKeyBase58 = JSON.parse(
    payerKeysFileContents
).privateKey;
const payerPrivateKey = PrivateKey.fromBase58(payerPrivateKeyBase58);
const payerPublicKey = payerPrivateKey.toPublicKey();

// ----------------------------------------------------

let account = await loopUntilAccountExists({
    account: deployerPublicKey,
    eachTimeNotExist: () => {
        console.log(
            'Deployer account does not exist. ' +
            'Request funds at faucet ' +
            'https://faucet.minaprotocol.com/?address=' +
            deployerPublicKey.toBase58()
        );
    },
    isZkAppAccount: false,
});
console.log(
    `Using fee payer account with nonce ${account.nonce}, balance ${account.balance} [deployer]`
);

let accountPayer = await loopUntilAccountExists({
    account: payerPublicKey,
    eachTimeNotExist: () => {
        console.log(
            'Payer account does not exist. ' +
            'Request funds at faucet ' +
            'https://faucet.minaprotocol.com/?address=' +
            payerPublicKey.toBase58()
        );
    },
    isZkAppAccount: false,
});
console.log(
    `Using fee payer account with nonce ${account.nonce}, balance ${account.balance} [payer]`
);

// ----------------------------------------------------

console.log('Compiling smart contract...');
let { verificationKey } = await Square.compile();
const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
let zkapp = new Square(zkAppPublicKey);
// Programmatic deploy:
//   Besides the CLI, you can also create accounts programmatically. This is useful if you need
//   more custom account creation - say deploying a zkApp to a different key than the deployer
//   key, programmatically parameterizing a zkApp before initializing it, or creating Smart
//   Contracts programmatically for users as part of an application.
// await deploy(deployerPrivateKey, zkAppPrivateKey, zkapp, verificationKey);
await loopUntilAccountExists({
    account: zkAppPublicKey,
    eachTimeNotExist: () =>
        console.log('waiting for zkApp account to be deployed...'),
    isZkAppAccount: true
});
let num = (await zkapp.num.fetch())!;
console.log(`current value of num is ${num}`);

// ----------------------------------------------------

let transaction = await Mina.transaction(
    { sender: payerPublicKey, fee: transactionFee },
    () => {
        zkapp.update(num.mul(num));
    }
);
// fill in the proof - this can take a while...
console.log('Creating an execution proof...');
let time0 = performance.now();
await transaction.prove();
let time1 = performance.now();
console.log(`creating proof took ${(time1 - time0) / 1e3} seconds`);
// sign transaction with the deployer account
transaction.sign([payerPrivateKey]);
console.log('Sending the transaction...');
let pendingTransaction = await transaction.send();

// ----------------------------------------------------

if (!pendingTransaction.isSuccess) {
    console.log('error sending transaction (see above)');
    process.exit(0);
}
console.log(
    `See transaction at https://berkeley.minaexplorer.com/transaction/${pendingTransaction.hash()}
  Waiting for transaction to be included...`
);
await pendingTransaction.wait();
console.log(`updated state! ${await zkapp.num.fetch()}`);

// ----------------------------------------------------

console.log('Shutting down');
await shutdown();
