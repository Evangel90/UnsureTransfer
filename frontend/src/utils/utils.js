import { ethers, JsonRpcProvider } from "ethers"
import { abi } from './UnsureTransfer.json'

const provider = new JsonRpcProvider("https://eth-holesky.g.alchemy.com/v2/jieawsXv4jXd1QLvQ6R500Nty_qryZVm")
const contractAddress = '0x812929caA68A232c41cEda96e74f27B3DA239881'


export function generateAccount(privateKey){
    let wallet
    if(privateKey === ""){
        console.log('reached if')
        wallet = ethers.Wallet.createRandom()
        console.log(wallet.mnemonic)
        console.log(wallet.address)
        
    }else{
        wallet = new ethers.Wallet(privateKey)
        console.log(wallet.address)
    }

    return wallet
}

export async function getAccountBalance(address){
    const balance = await provider.getBalance(address)
    console.log('balance', balance)
    return ethers.formatEther(balance)
}

export async function balanceUpdater(address) {
    provider.on('block', async (blockNumber) => {
        console.log("New block:", blockNumber);
        await getAccountBalance(address)
    })
    
}

export async function transferFunds(_privateKey, receiver, amount){
    const wallet = new ethers.Wallet(_privateKey, provider)
    const signer= wallet.connect(provider)
    console.log(signer)
    try{
        const tx = {
            to: receiver,
            value: ethers.parseEther(amount)
        }
        
        const transferFunds = await signer.sendTransaction(tx)
        console.log(transferFunds)

    }catch(err){
        console.log('Transfer err', err)
    }
}

export function getContract(_privateKey){
    const wallet = new ethers.Wallet(_privateKey, provider)
    const signer= wallet.connect(provider)
    const UnsureTransferContract = new ethers.Contract(contractAddress, abi, signer )
    return UnsureTransferContract
}

export async function unsureTransferInit(_privateKey, receiverAddress, amount){
    const UnsureTransferContract = getContract(_privateKey)

    const txInit = await UnsureTransferContract.initiateUnsureTransfer(
        receiverAddress, 
        {value: ethers.parseEther(amount)}
    )
    txInit.wait()

    console.log('Success', txInit)
}

export function unsureTransferInitListener(_privateKey) {
    // const wallet = new ethers.Wallet(_privateKey, provider)
    // const signer= wallet.connect(provider)
    // const UnsureTransferContract = new ethers.Contract(contractAddress, abi, signer)
    const UnsureTransferContract = getContract(_privateKey)

    console.log('Should be listening to UnsureTransferInitiated now!')
    
    UnsureTransferContract.on("UnsureTransferInitiated", (sender, receiver, value, event) => {
        let txEvent = {
            sender: sender,
            receiver: receiver,
            value: value,
            eventData: event
        }

        console.log("Done listening", txEvent)
        return txEvent
    })
    console.log('.....')
}

export async function cancelUnsureTransfer(_privateKey){
    const UnsureTransferContract = getContract(_privateKey)

    const cancelTx = await UnsureTransferContract.cancelTransaction()
    cancelTx.wait()

    console.log('Canceled', cancelTx)
}

export async function replyUnsureTransfer(_privateKey, confirmationString){
    const UnsureTransferContract = getContract(_privateKey)

    const stringProviderTx = await UnsureTransferContract.confirmationStringProvider(confirmationString)
    stringProviderTx.wait()

    console.log('Success', stringProviderTx)
}

export async function confirmUnsureTransfer(_privateKey) {
    const UnsureTransferContract = getContract(_privateKey)
    
    const confirmTx = await UnsureTransferContract.confirmTransfer()
    await confirmTx.wait()
    
    console.log('Transaction confirmed', confirmTx)
}