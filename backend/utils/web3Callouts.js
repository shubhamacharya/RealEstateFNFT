let Web3 = require('web3');
const web3 = new Web3(Web3.givenProvider || process.env.PROVIDER);
let RNFTContract, Escrow1155Contract;

const getABI = async (filePath) => {
    const data = await fsPromise.readFile(filePath, 'utf-8');
    return await JSON.parse(data)['abi'];
}

const deployContract = async (contractName) => {
    if (contractName === "RNFT") {
        const rnftABI = await getABI(process.env.RNFT_CONTRACT_ABI_PATH);
        RNFTContract = new web3.eth.Contract(rnftABI, process.env.RNFT_CONTRACT_ADDRESS);
        RNFTContract.options.handleRevert = true;
    }
    else {
        const escrow1155ABI = await getABI(process.env.ESCROW1155_CONTRACT_ABI_PATH);
        Escrow1155Contract = new web3.eth.Contract(escrow1155ABI, process.env.Escrow1155_CONTRACT_ADDRESS);
        Escrow1155Contract.options.handleRevert = true;
    }
}

const getContractObj = async (contractName) => {
    if (`${contractName}Contract` === undefined) {
        await deployContract(contractName);
    }
    return `${contractName}Contract`;
}

const mintNFT = async () => {
    
}