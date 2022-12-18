# KingKong-Game-Contract

A Battle Royal NFT based Smart Contract on Solana

## Program Deployment

- Prepare anchor developm♦ent environments
- Prepare around 9 SOL in the deploy wallet keypair
- Confirm Network cluster in `Anchor.toml` file : f.e. `[programs.devnet]`, `cluster = "devnet"`
- Confirm deploy authority wallet keypair location : f.e. `wallet = "/home/ubuntu/.config/solana/id.json"
- Configure solana cli with deploy authority keypair and deploying cluster : f.e. `solana config set -h`
- Confirm some of the constants for the game in the `/programs/king-kong-game/src/constants.rs` \
`BANANA_TOKEN_MINT_PUBKEY` : banana token mint address <br />
`COLLECTION_ADDRESS` : collection creator address to verify king-kong collection and is used for default game winner<br />
`DAILY_REWARD_DIST_WALLET` : treasury wallet address for distributing daily game reward to king-kong holders around every 00:00 on UTC. auto-distributing is performed on node backend.<br />
must be matched to wallet address on the backend. <br />
`GOLD_CHEST_WALLET` : gold chest wallet address.
- Build program with `anchor build`
- Copy and paste the result deploy scripts from Build terminal message : f.e. `solana program deploy /home/ubuntu/solana/king-kong-game/king-kong-game/target/deploy/king_kong_game.so`

### To Change Program Address

- Delete the program keypair in `/target/deploy/king_kong_game-keypair.json`
- Build project with `anchor build`. This will generate new keypair
- Get the address of new keypair with `solana address --keypair ./target/deploy/king_kong_game-keypair.json`
- Change program addresses in project code. `Anchor.toml`, `/programs/king-kong-game/src/lib.rs`
- Build program object again with `anchor build`
- Deploy newly built so file with `solana program deploy`

## Initialize and Operatie with Smart Contract
These functions are in the `./lib/scripts.ts` file<br />

### Install Dependencies

- Install `node` and `yarn`
- Install `ts-node` as global command
- Confirm the solana wallet preparation in `package.json`: `/home/ubuntu/.config/solana/id.json` in test case

### Init Program & Operations For Admin
Admin wallet must be registered to system path before running following functions with `export ANCHOR_WALLET=...`<br />
f.e. `export ANCHOR_WALLET=/home/ubuntu/.config/solana/id.json`<br/>
- Confirm program config info in the `./lib/types.ts` after deploying the smart contract is successed<br />

Config infos are as follows:<br />
`PROGRAM_ID` : smart contract address deployed <br />
`BANANA_TOKEN_MINT` : banana token ( for reward and playing in the game ) mint address <br />
`COLLECTION_ADDRESS` : king-kong nft collection creator address <br/>
`GAME_POOL_ADDRESS` : deploy wallet address to create game pool <br />

- Initialize program with `initProject` command
- Initialize Game accounts with `createGamePool` command
- Register game play config info with `initGamePool` command (update available) <br/>
    `initGamePool` command has the following params<br/>
```ts
/**
 * Register game play config info (update available)
 * @param gameEntryFee game entry fee for each user (f.e. 1000000000 => 1 SOL )
 * @param txFee transaction fee for each game play (f.e. 4 => 4 % )
 * @param rewardAmount winner reward amount after the game play (f.e. 16000000000 => 1.6 SOL / 1 game )
 * @param bananaMint token mint address using as Banana in the game play (f.e. "AsACVnuMa5jpmfp3BjArmb2qWg5A6HBkuXePwT37RrLY")
 * @param bananaPrice price of one banana token (f.e. 1666666666 => 5 Sol / 3 bananas)
 * @param bananaDecimal decimal of banana token (f.e. 1000000000 => decimal: 9 )
 * @param bananaMaxNums max limit numbers of banana token that can use in one game play(f.e. 1000000000 => 1 in game )
 */
export const initGamePool = async (
    gameEntryFee: number,
    txFee: number,
    rewardAmount: number,
    bananaMint: string,
    bananaPrice: number,
    bananaDecimal: number,
    bananaMaxNums: number
)
```
- Deposit some banana tokens to the escrow vault account before playing the game <br />
This can be done by transfering sol and tokens simply. <br />
Escrow vault account address is obtained with `getGameState` command

- Deposit at least 1 reward NFT to the escrow vault address before playing the game with `depositNftEscrow` command<br/>
`depositNftEscrow` command has the following params<br/>
```ts
/**
 * Deposit one NFT of the king-kong collection to the game escrow vault account for rewarding
 * @param nft_mint : mint address of king-kong nft to be deposited to the escrow vault account
 */
export const depositNftEscrow = async (
   nft_mint: PublicKey
)
```

- Withdraw NFT from the escrow vault with `withdrawEscrowNft` command <br/>
`withdrawEscrowNft` has the following params <br/>
If not specified `nft_mint`, the first nft in the escrow vault is withdrawn by default<br />
Withdraw wallet address is specified by `export ANCHOR_WALLET=...`<br />
```ts
/**
 * Withdraw one NFT of the king-kong collection from the game escrow vault
 * @param nft_mint : mint address of king-kong nft to be withdrew from the escrow vault
 */
export const withdrawEscrowNft = async (
    nft_mint: string | null = null
)
```

- Withdraw Sol & Banana tokens from the escrow vault with `withdrawEscrowVolume` command
`withdrawEscrowNft` has the following params <br/>
If not specified the input params, `solAmount` and `tokenAmount` are set to 1 Sol and 1 token by default<br />

```ts
/**
 * Withdraw SOL and Banana Tokens from the game escrow vault
 * @param solAmount : lamports to withdraw sol from the escrow vault (f.e. 1000000000 => 1SOL)
 * @param tokenAmount : token amounts with its decimal to withdraw tokens from the escrow vault (f.e. 1000000000 => 1 token if token decimal is 9)
 */
export const withdrawEscrowVolume = async (
    solAmount: number = 1000000000, 
    tokenAmount: number = 1000000000
)
```

- Be able to check the escrow vault address and other extra addresses with the `getGameState` command


- When you get this error `Error: Provider local is not available on browser.`
You can run this command `export BROWSER=` once

### Init Status and Operations for User
User wallet must be registered to system path before running the following functions with `export ANCHOR_WALLET=...`<br />
f.e. `export ANCHOR_WALLET=/home/ubuntu/king_kong_game/player1.json`<br/>
- Buy banana token with `buyBnn` command
`buyBnn` command has the following params <br />
If token amount is not specified, it's set to 1000000000 by default
```ts
/**
 * Buy banana tokens with sol to play a game
 * @param tokenAmount : token amount with its decimal to buy
 */
export const buyBnn = async (
   tokenAmount: number = 1000000000
)
```

- Play game with `playGame` command
`playGame` command has the following params <br />
Amount 0 of banana tokens is used in each round by default<br/>
```ts
/**
 * Buy banana tokens with sol to play a game
 * @param round1Banan : banana token amount without token decimal will be used in the round 1
 * @param round2Banan : banana token amount without token decimal will be used in the round 1
 * @param round3Banan : banana token amount without token decimal will be used in the round 1
 * @param round4Banan : banana token amount without token decimal will be used in the round 1
 */
export const playGame = async (
    round1Banana: number = 0,
    round2Banana: number = 0,
    round3Banana: number = 0,
    round4Banana: number = 0,
)
```

- Claim reward with `claimReward` command for game winners
- Claim daily awarded banana tokens with `claimBananaForNftHolders` command for king-kong nft holders
`claimBananaForNftHolders` has the following params<br/>
```ts
/**
 * Claim daily awarded banana tokens
 * @param nft_mint : mint address for claim banana tokens
 */
export const claimBananaForNftHolders = async (
    nft_mint: PublicKey
)
```

### Utility functions
- Get User State with `getUserState` command
`getUserState` command has the following params <br />
```ts
/**
 * Get user pool state including game winning result
 * @param user : public key of user wallet address
 * @param program : anchor program used in the the game
 */
export const getUserState = async (
    user: PublicKey, 
    program: anchor.Program
)
```

## Notes for FE Integration

For the FE side web3 integration, the scripts in `lib` directory except `scripts.ts` file can be used without no change.
The only thing the FE dev should change is providing `web3 connection` & the `anchor program` object from idl.
Should configure properly in `BROWSER` environment.
