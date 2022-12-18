# king-kong game node backend on solana blockchain

Express backend for King-Kong game on Solana blockchain.

`yarn` \
`yarn start`

## Confirm Config Info Before Run
- `SOLANA_NETWORK` on the `/backend/src/config/config/` (default to `devnet`)
- `fake-wallet.json` on the `/backend/src/config/` public key must be matched to smart contract `DAILY_REWARD_DIST_WALLET` on `/src/constandts.rs`
- `PROGRAM_ID` must be matched to the deployed program address
- `GAME_POOL` must be matched to the created game pool address when initialize the smart contract.
You can check this with the smart contract cli
- `BANANA_MINT_PUBKEY` is the banana token mint address on solana
- `nft_hash_list.json` in the `/src/config/nft_hash_list.json`
This is the nft hash list file that has an array of king-kong nft mint addresses for auto-distributing daily game rewards

## Usage

- Fetch Users' Game Play Stats Info. \
`http://localhost:3001/api/user_stats`

- Fetch Total Game Stats Info. \
`http://localhost:3001/api/game_stats`

- Fetch Total Game Play History Info. \
`http://localhost:3001/api/game_play`

### Services For Game
There is one extra service for 2 functions in the backend. <br />
`gamePlayListener` function in the `process.ts` is the service function and it uses web socket for real time communication. <br />
- Airdrop benefits of the game play to nft holders
Around the time of 00:00 on UTC of each day, automatically transfers benefits of the daily game play (1% of the game entry fee) to king-kong nft holders.
- By using web socket, broadcasts the new data of history / stats / game play info to the clients when a new user enters the game automatically and updates the data on the server.

