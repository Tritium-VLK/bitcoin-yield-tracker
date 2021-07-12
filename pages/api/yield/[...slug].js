import { ethers } from "ethers";
import ibBTCabi from '/abis/ibBTCABI.json';

export default async function handler(req, res) {
    const { slug } = req.query
    switch(slug[0]) {
        case 'ibbtc':
            const dayOldBlock = 86400 // [Seconds in a day]
            const weekOldBlock = dayOldBlock * 7
            const apyFromLastWeek = await fetchIbbtcApyFromTimestamp(weekOldBlock)
            res.status(200).json({ apyFromLastWeek: apyFromLastWeek })
    }
    res.status(404).send()
}

async function fetchIbbtcApyFromTimestamp(timestamp) {
    const secondsPerYear = ethers.BigNumber.from(31536000)
    const provider = new ethers.providers.AlchemyProvider()
    const contractAddress = '0xc4e15973e6ff2a35cc804c2cf9d2a1b817a8b40f'
    const contract = new ethers.Contract(contractAddress, ibBTCabi, provider)
    const currentPPS = await contract.pricePerShare()
    const fixedCurrentPPS = ethers.FixedNumber.from(currentPPS);
    const currentBlock = await provider.getBlockNumber() - 50

    try {
        const targetBlock = currentBlock - Math.floor(timestamp / 15)
        const oldPPS = await contract.pricePerShare({ blockTag: targetBlock })
        const fixedOldPPS = ethers.FixedNumber.from(oldPPS);
        const ppsGrowth = fixedCurrentPPS.subUnsafe(fixedOldPPS).divUnsafe(fixedOldPPS)
        const growthPerSecond = ppsGrowth.mulUnsafe(ethers.FixedNumber.from(secondsPerYear.div(timestamp)))
        return growthPerSecond.round(6).toString()
    } catch (error) {
        console.error(`Error while getting ibBTC APY from block ${currentBlock - timestamp}: ${error}`)
        return null
    }
}