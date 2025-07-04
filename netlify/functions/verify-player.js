// netlify/functions/verify-player.js

const ethers = require('ethers')

// CONFIG
const RPC_URL       = 'https://dream-rpc.somnia.network'
const CONTRACT_ADDR = '0x3DFF2d1bE115447Ba3ee61E16bE61B58c30fba56'
const MIN_SCORE     = 2000n

const ABI = [
  'function getScore(address _player) view returns (uint256)'
]

exports.handler = async (event) => {
  const parts      = event.path.split('/')
  const playerAddr = parts[parts.length - 1]

  // Validate Ethereum address
  if (!/^0x[a-fA-F0-9]{40}$/.test(playerAddr)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: `Invalid Ethereum address: ${playerAddr}` })
    }
  }

  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDR, ABI, provider)

    const scoreBig = await contract.getScore(playerAddr)
    const verified = scoreBig > MIN_SCORE
    const score    = Number(scoreBig)

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        verified,
        player:    playerAddr,
        score,
        threshold: Number(MIN_SCORE)
      })
    }

  } catch (err) {
    console.error('verify-player error', err)
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    }
  }
}
