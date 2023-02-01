<center>

# Preparing project
**rm** src/Add.* \
**rm** src/interact.ts 

**zk file** src/Square *used in 01-hello-world* \
**touch** src/main.ts 

***import Square*** src/index.ts 

# Building (compile ts in js) and Running
**npm run build && node build/src/main.js**

# ZK config
**zk config** \
Will create config.json an keys folder containing public and private keys of our application \
&emsp;Name: "project-name" \
&emsp;URL: https://proxy.berkeley.minaexplorer.com/graphql \
&emsp;Fee: 01

# Account preparation
***using the key inside keys folder*** \
***redeem founds from*** https://faucet.minaprotocol.com/?address=<YOUR-ADDRESS> \
&nbsp;Using blockexplorer you can see if the transaction is completed

# Deploy Smart contract
***sudo can be needed*** **zk deploy** "project-name" \
<sub>
Because we didn't modify our smart contract's editState permissions when writing in Tutorial 1, a transaction must contain a valid ZK proof created by the private key associated with this zkApp account, in order to be accepted by the zkApp account. Typically, you'll only allow proof authorization. 
When a user interacts with this smart contract by providing a proof, the proof is generated locally on the user's device, and included in a transaction. When the transaction is submitted to the network, Mina will check the proof, to know it is correct and matches the on-chain verification key. After it is accepted, the proof and transaction will be recursively proved, and bundled into Mina's recursive ZKP.
When we change our code, the verification key associated with it will change, and the contract should be redeployed using the same steps as our initial deployment.
</sub>

# Interact with our deployed Smart Contract
**touch** src/utils.ts \
***implement*** loopUntilAccountExists() \
***implement*** deploy() 

***load Berkeley network*** lines[9-16] \
***deploy the Smart Contract*** lines[16-31] \
***wait for deployer account*** lines[31-49] \
***compile the Smart Contract and wait for its deployment*** lines[49-70] \
<sub>
Programmatic deploy is commented becose we use the "zk deploy" command
</sub> 

***after fetching the current value of our Smart Contract we can invoke the other methods*** lines[70-89] \
***check if the pending transaction is complete*** lines[89-102]

# Compile and Run
**npm run build && node build/src/main.js** "project-name"

# ERROR while sending transaction
```
got graphql errors [
  {
    "message": "Couldn't send zkApp command: [\"Fee_payer_not_permitted_to_send\"]",
    "locations": [
      {
        "line": 2,
        "column": 3
      }
    ],
    "path": [
      "sendZkapp"
    ]
  }
]
```

</center>
