
# CrowdSOL - Crowdfunding platform built on Solana blockchain

This is not a production ready app and was not audited and in the stage of development which is being build solely for educational purposes!

Idea behind the app is to create a fundraising platform which accepts SOLs(Solana's Crypto) in an easy, fast and secure fasion.

`development` branch is for CI/CD pipline and `main` for the finalized code

## Demo

Coming soon...


## Install && Test

Clone the project

```bash
  git clone git@github.com:itsbek/CrowdSOL.git
```

Install dependencies

```bash
  npm install
```
  or
```bash
  yarn
```

Build the Anchor program

```bash
  anchor build
```

and deploy the program by running:

```bash
  anchor deploy
```
please note that this instructions written assuming that you are running on UNIX like OS or WSL if you're on Windows and have sufficient SOLs in your wallet


To run the tests I had to start the local validator 
```bash
  solana-test-validator
```
and then run 
```bash
  anchor test --skip-local-validator
```

## Userflow 
To simplify the end gaol out of the platform, I quickly created a (very dirty) userflow to help visualize better

[![Miro](https://img.shields.io/badge/Miro-050038?style=for-the-badge&logo=Miro&logoColor=white)](https://miro.com/app/board/uXjVOyF3qBM=/)

![Alt text](./user-story.jpg?raw=true "Optional Title")

## Roadmap

- [x]  initiate a new fundraiser
- [x]  withdraw Funds to wallet
- [x]  make a donation
- [x]  initiator can end the fundraise
- [ ]  frontend
- [ ]  commission logic for the platform
- [ ]  reward logic for referrals 
- [ ]  reward logic for top 10 donators  
- [ ]  platform token (CHRT) transfer logic using SPL



