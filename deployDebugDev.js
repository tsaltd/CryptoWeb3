/* eslint-disable no-console */
const fs = require('fs');
const solc = require('solc');
const Web3 = require('web3');

// eslint-disable-next-line no-use-before-define
const contract = compileContract();
// eslint-disable-next-line no-use-before-define
const web3 = createWeb3();
const sender = '0xe7fbecfe55d0ac37c4261db41a97d56f5a72a817';
// eslint-disable-next-line no-use-before-define
deployContract(web3, contract, sender)
    .then(() => {
        // eslint-disable-next-line no-console
        console.log('Deployment finished');
    })
    .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(`Failed to deploy contract: ${JSON.stringify(err)}`);
    });

function compileContract() {
    const compilerInput = {
        language: 'Solidity',
        sources: {
            'Voter.sol': {
                content: fs.readFileSync('Voter.sol', 'utf8'),
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
        },
    };

    // eslint-disable-next-line no-console
    console.log('Compiling the contract');
    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(compilerInput)));
    // Get compiled contract
    // eslint-disable-next-line no-shadow
    const contract = output.contracts['Voter.sol'].Voter;

    // Save contract's ABI
    const { abi } = contract.abi;
    fs.writeFileSync('abi.json', JSON.stringify(abi));

    return contract;
}

function createWeb3() {
    return new Web3('http://127.0.0.1:8545');
}
// function createWeb3() {
// let web3 = new Web3();
// web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'));

// return web3;
// }

async function deployContract(web3, contract, sender) {
    const Voter = new web3.eth.Contract(contract.abi);
    const bytecode = `0x${contract.evm.bytecode.object}`;
    const gasEstimate = await web3.eth.estimateGas({ data: bytecode });

    // eslint-disable-next-line no-console
    console.log('Deploying the contract');
    // eslint-disable-next-line no-console
    console.log(gasEstimate);
    const contractInstance = await Voter.deploy({
        data: bytecode,
    })
        .send({
            from: sender,
            gas: gasEstimate,
            // gas: 1890202
        })
        .on('transactionHash', (transactionHash) => {
            console.log(`Transaction hash: ${transactionHash}`);
        })
        //.on('confirmation', (confirmationNumber, receipt) 
        .on('confirmation', confirmationNumber => {
            console.log(`Confirmation number: ${confirmationNumber}`);
        })
        .on('error', error => {
          //  console.log('Transaction Error: ${error.message}');
            console.log(`Transaction Error: ${JSON.stringify(error)}`);
        });

    console.log(`Contract address: ${contractInstance.options.address}`);
}


