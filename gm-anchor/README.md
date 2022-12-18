# GM-ANCHOR
Introduction to Anchor workshop from Chainlink Hackathon Spring 2022

The workshop followed to complete this repo is [this one](https://www.youtube.com/watch?v=fPsH77ZoXt4&t=3016s).

## Commands
- `anchor build`
- `solana address -k ./target/deploy/gm_anchor-keypair.json`: copy result address on lib.rs -> declare_id!()
- `anchor build`
- `solana-test-validator`: create local enviroment
- `solana-keygen new -o id.json`: to generate keypair
- `solana airdrop 2 $(solana-keygen pubkey ./id.json)`: get SOL from faucet or `solana airdrop 2 address`
- `anchor deploy`
- `export ANCHOR_WALLET='../id.json'`
- `export ANCHOR_PROVIDER_URL='http://127.0.0.1:8899'`
- `cd app`
- `touch client.js`: write script
- `node client.js`: execute script