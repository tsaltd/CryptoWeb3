/* eslint-disable no-console */
const fs = require('fs');
//const solc = require('solc');
const Web3 = require('web3');

const web3 = new Web3();

web3.setProvider(new web3.providers.HttpProvider('http://127.0.0.1:8545'));

const contractAddress = "0x9F5424Ded7c6641Ed3385f2F8b5c925816241408";
const fromAddress = '0xe7fbecfe55d0ac37c4261db41a97d56f5a72a817';
const abiStr = fs.readFileSync('abi.json', 'utf8');
const abi = JSON.parse(abiStr);
let voter = new web3.eth.Contract(abi, contractAddress);
console.log(voter);
sendTransactions()
    .then(function () {
        console.log("done")
    })
    .catch(function (error) {
        console.log(error);
    })
async function sendTransactions() {
    console.log("Adding option 'coffee'");
    await voter.methods.addOption("coffee").send({ from: fromAddress })

    console.log("Adding option 'tea'");
    await voter.methods.addOption("tea").send({ from: fromAddress });

    await voter.methods.startVoting()
        .send({ from: fromAddress, gas: 600000 });


    console.log("Voting");
    await voter.methods['vote(uint256)'](0)
        .send({ from: fromAddress, gas: 600000 });

    console.log("getting votes");

    const votes = await voter.methods.getVotes().call({ from: fromAddress });

    console.log(`Votes: ${votes}`)
}