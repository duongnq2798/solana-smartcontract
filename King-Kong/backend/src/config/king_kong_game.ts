export type KingKongGame = {
    "version": "0.1.0",
    "name": "king_kong_game",
    "instructions": [
        {
            "name": "initialize",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "createGamePool",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "winnerPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gamePool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "winnerPdaBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "registerGamePoolData",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "gameEntryFee",
                    "type": "u64"
                },
                {
                    "name": "txFee",
                    "type": "u64"
                },
                {
                    "name": "rewardAmount",
                    "type": "u64"
                },
                {
                    "name": "bananaMint",
                    "type": "publicKey"
                },
                {
                    "name": "bananaPrice",
                    "type": "u64"
                },
                {
                    "name": "bananaDecimal",
                    "type": "u64"
                },
                {
                    "name": "bananaMaxNums",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "initUserPool",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "playGame",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gamePool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "winnerPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "treasuryWallet1",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "treasuryWallet2",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "userpoolBump",
                    "type": "u8"
                },
                {
                    "name": "round1Banana",
                    "type": "u64"
                },
                {
                    "name": "round2Banana",
                    "type": "u64"
                },
                {
                    "name": "round3Banana",
                    "type": "u64"
                },
                {
                    "name": "round4Banana",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "claimXpreward",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "userBump",
                    "type": "u8"
                },
                {
                    "name": "xp",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "claimReward",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "userBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "buyToken",
            "accounts": [
                {
                    "name": "buyer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "userBump",
                    "type": "u8"
                },
                {
                    "name": "tokenAmount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "withdrawEscrowVolume",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "solAmount",
                    "type": "u64"
                },
                {
                    "name": "tokenAmount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "withdrawEscrowNft",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "depositNftEscrow",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mintMetadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "claimBananaForNftHolders",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mintMetadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "nftBump",
                    "type": "u8"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "globalPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "superAdmin",
                        "type": "publicKey"
                    }
                ]
            }
        },
        {
            "name": "nftPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "lastClaimTime",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "gameConfigPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "entryFee",
                        "type": "u64"
                    },
                    {
                        "name": "txFee",
                        "type": "u64"
                    },
                    {
                        "name": "rewardAmount",
                        "type": "u64"
                    },
                    {
                        "name": "bananaMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "bananaPrice",
                        "type": "u64"
                    },
                    {
                        "name": "bananaMaxNums",
                        "type": "u64"
                    },
                    {
                        "name": "bananaDecimal",
                        "type": "u64"
                    },
                    {
                        "name": "escrowNftMints",
                        "type": {
                            "array": [
                                "publicKey",
                                32
                            ]
                        }
                    },
                    {
                        "name": "escrowNftNums",
                        "type": "u64"
                    },
                    {
                        "name": "winner",
                        "type": "publicKey"
                    },
                    {
                        "name": "totalPlays",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "gamePool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "members",
                        "type": "u64"
                    },
                    {
                        "name": "players",
                        "type": {
                            "array": [
                                "publicKey",
                                16
                            ]
                        }
                    },
                    {
                        "name": "bananaUsage",
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u64",
                                        4
                                    ]
                                },
                                16
                            ]
                        }
                    },
                    {
                        "name": "round1Result",
                        "type": {
                            "array": [
                                "u64",
                                8
                            ]
                        }
                    },
                    {
                        "name": "round2Result",
                        "type": {
                            "array": [
                                "u64",
                                4
                            ]
                        }
                    },
                    {
                        "name": "round3Result",
                        "type": {
                            "array": [
                                "u64",
                                2
                            ]
                        }
                    },
                    {
                        "name": "round4Result",
                        "type": {
                            "array": [
                                "u64",
                                1
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "userPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "address",
                        "type": "publicKey"
                    },
                    {
                        "name": "playedVolume",
                        "type": "u64"
                    },
                    {
                        "name": "playedNums",
                        "type": "u64"
                    },
                    {
                        "name": "playedBanana",
                        "type": "u64"
                    },
                    {
                        "name": "buyedBanana",
                        "type": "u64"
                    },
                    {
                        "name": "winnedVolume",
                        "type": "u64"
                    },
                    {
                        "name": "winnedNums",
                        "type": "u64"
                    },
                    {
                        "name": "winnedBanana",
                        "type": "u64"
                    },
                    {
                        "name": "winnedNft",
                        "type": "u64"
                    },
                    {
                        "name": "winnerLast",
                        "type": "u8"
                    },
                    {
                        "name": "xp",
                        "type": "u64"
                    },
                    {
                        "name": "xpreward1Claimed",
                        "type": "u8"
                    },
                    {
                        "name": "xpreward2Claimed",
                        "type": "u8"
                    },
                    {
                        "name": "xpreward3Claimed",
                        "type": "u8"
                    },
                    {
                        "name": "xpreward4Claimed",
                        "type": "u8"
                    },
                    {
                        "name": "xpreward5Claimed",
                        "type": "u8"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidSuperOwner",
            "msg": "Invalid Super Owner"
        },
        {
            "code": 6001,
            "name": "InvalidGlobalPool",
            "msg": "Invalid Global Pool Address"
        },
        {
            "code": 6002,
            "name": "InvalidFeePercent",
            "msg": "Marketplace Fee is Permyriad"
        },
        {
            "code": 6003,
            "name": "NoTeamTreasuryYet",
            "msg": "Treasury Wallet Not Configured"
        },
        {
            "code": 6004,
            "name": "TreasuryAddressNotFound",
            "msg": "Treasury Address Not Exist"
        },
        {
            "code": 6005,
            "name": "MaxTreasuryRateSumExceed",
            "msg": "Total Treasury Rate Sum Should Less Than 100%"
        },
        {
            "code": 6006,
            "name": "TeamTreasuryCountMismatch",
            "msg": "Team Treasury Wallet Count Mismatch"
        },
        {
            "code": 6007,
            "name": "TeamTreasuryAddressMismatch",
            "msg": "Team Treasury Wallet Address Mismatch"
        },
        {
            "code": 6008,
            "name": "Uninitialized",
            "msg": "Uninitialized Account"
        },
        {
            "code": 6009,
            "name": "InvalidParamInput",
            "msg": "Instruction Parameter is Invalid"
        },
        {
            "code": 6010,
            "name": "InsufficientUserBalance",
            "msg": "Insufficient User SOL Balance"
        },
        {
            "code": 6011,
            "name": "InvalidUserTokenBalance",
            "msg": "Invalid token amount in the wallet"
        },
        {
            "code": 6012,
            "name": "InsufficientEscrowVaultSolBalance",
            "msg": "Insufficient SOL Balance in the Escrow Vault"
        },
        {
            "code": 6013,
            "name": "InsufficientEscrowVaultTokenAmount",
            "msg": "Insufficient Token Balance in the Escrow Vault"
        },
        {
            "code": 6014,
            "name": "InsufficientSupplyForSellToken",
            "msg": "Insufficient Token Balance To Sell"
        },
        {
            "code": 6015,
            "name": "InvalidTokenAmount",
            "msg": "Invalid Token Amount"
        },
        {
            "code": 6016,
            "name": "InvalidNftTokenAccount",
            "msg": "Invalid NFT Token Account"
        },
        {
            "code": 6017,
            "name": "InvaliedMetadata",
            "msg": "Invalid Metadata Address"
        },
        {
            "code": 6018,
            "name": "UnkownOrNotAllowedNFTCollection",
            "msg": "Unknown Collection Or The Collection Is Not Allowed"
        },
        {
            "code": 6019,
            "name": "MetadataCreatorParseError",
            "msg": "Can't Parse The NFT's Creators"
        },
        {
            "code": 6020,
            "name": "InvalidNFTAddress",
            "msg": "Not Found Nft"
        },
        {
            "code": 6021,
            "name": "MaxGamePlayerCountExceed",
            "msg": "Max Team Count is 16"
        },
        {
            "code": 6022,
            "name": "GamePlayerAlreadyAdded",
            "msg": "Game Player Already Exist"
        },
        {
            "code": 6023,
            "name": "InvalidClaimTime",
            "msg": "Invalid Claim Time"
        },
        {
            "code": 6024,
            "name": "InvalidLowXp",
            "msg": "Too Low XP"
        },
        {
            "code": 6025,
            "name": "InvalidXPClaim",
            "msg": "Invalid XP Claim"
        },
        {
            "code": 6026,
            "name": "InvalidOwner",
            "msg": "Invalid Owner"
        }
    ]
};

export const IDL: KingKongGame = {
    "version": "0.1.0",
    "name": "king_kong_game",
    "instructions": [
        {
            "name": "initialize",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "createGamePool",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "winnerPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gamePool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "winnerPdaBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "registerGamePoolData",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "gameEntryFee",
                    "type": "u64"
                },
                {
                    "name": "txFee",
                    "type": "u64"
                },
                {
                    "name": "rewardAmount",
                    "type": "u64"
                },
                {
                    "name": "bananaMint",
                    "type": "publicKey"
                },
                {
                    "name": "bananaPrice",
                    "type": "u64"
                },
                {
                    "name": "bananaDecimal",
                    "type": "u64"
                },
                {
                    "name": "bananaMaxNums",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "initUserPool",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "bump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "playGame",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gamePool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "winnerPda",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "treasuryWallet1",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "treasuryWallet2",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "userpoolBump",
                    "type": "u8"
                },
                {
                    "name": "round1Banana",
                    "type": "u64"
                },
                {
                    "name": "round2Banana",
                    "type": "u64"
                },
                {
                    "name": "round3Banana",
                    "type": "u64"
                },
                {
                    "name": "round4Banana",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "claimXpreward",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "userBump",
                    "type": "u8"
                },
                {
                    "name": "xp",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "claimReward",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "userBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "buyToken",
            "accounts": [
                {
                    "name": "buyer",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "gameBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "userBump",
                    "type": "u8"
                },
                {
                    "name": "tokenAmount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "withdrawEscrowVolume",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "solAmount",
                    "type": "u64"
                },
                {
                    "name": "tokenAmount",
                    "type": "u64"
                }
            ]
        },
        {
            "name": "withdrawEscrowNft",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "userNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "depositNftEscrow",
            "accounts": [
                {
                    "name": "admin",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "globalAuthority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "destNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mintMetadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "globalBump",
                    "type": "u8"
                },
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "claimBananaForNftHolders",
            "accounts": [
                {
                    "name": "owner",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "escrowVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "gameConfigVault",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftPool",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "escrowTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "userNftTokenAccount",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "nftMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "mintMetadata",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenMetadataProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "systemProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "rent",
                    "isMut": false,
                    "isSigner": false
                }
            ],
            "args": [
                {
                    "name": "escrowBump",
                    "type": "u8"
                },
                {
                    "name": "gameConfigBump",
                    "type": "u8"
                },
                {
                    "name": "nftBump",
                    "type": "u8"
                }
            ]
        }
    ],
    "accounts": [
        {
            "name": "globalPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "superAdmin",
                        "type": "publicKey"
                    }
                ]
            }
        },
        {
            "name": "nftPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "lastClaimTime",
                        "type": "i64"
                    }
                ]
            }
        },
        {
            "name": "gameConfigPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "entryFee",
                        "type": "u64"
                    },
                    {
                        "name": "txFee",
                        "type": "u64"
                    },
                    {
                        "name": "rewardAmount",
                        "type": "u64"
                    },
                    {
                        "name": "bananaMint",
                        "type": "publicKey"
                    },
                    {
                        "name": "bananaPrice",
                        "type": "u64"
                    },
                    {
                        "name": "bananaMaxNums",
                        "type": "u64"
                    },
                    {
                        "name": "bananaDecimal",
                        "type": "u64"
                    },
                    {
                        "name": "escrowNftMints",
                        "type": {
                            "array": [
                                "publicKey",
                                32
                            ]
                        }
                    },
                    {
                        "name": "escrowNftNums",
                        "type": "u64"
                    },
                    {
                        "name": "winner",
                        "type": "publicKey"
                    },
                    {
                        "name": "totalPlays",
                        "type": "u64"
                    }
                ]
            }
        },
        {
            "name": "gamePool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "members",
                        "type": "u64"
                    },
                    {
                        "name": "players",
                        "type": {
                            "array": [
                                "publicKey",
                                16
                            ]
                        }
                    },
                    {
                        "name": "bananaUsage",
                        "type": {
                            "array": [
                                {
                                    "array": [
                                        "u64",
                                        4
                                    ]
                                },
                                16
                            ]
                        }
                    },
                    {
                        "name": "round1Result",
                        "type": {
                            "array": [
                                "u64",
                                8
                            ]
                        }
                    },
                    {
                        "name": "round2Result",
                        "type": {
                            "array": [
                                "u64",
                                4
                            ]
                        }
                    },
                    {
                        "name": "round3Result",
                        "type": {
                            "array": [
                                "u64",
                                2
                            ]
                        }
                    },
                    {
                        "name": "round4Result",
                        "type": {
                            "array": [
                                "u64",
                                1
                            ]
                        }
                    }
                ]
            }
        },
        {
            "name": "userPool",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "address",
                        "type": "publicKey"
                    },
                    {
                        "name": "playedVolume",
                        "type": "u64"
                    },
                    {
                        "name": "playedNums",
                        "type": "u64"
                    },
                    {
                        "name": "playedBanana",
                        "type": "u64"
                    },
                    {
                        "name": "buyedBanana",
                        "type": "u64"
                    },
                    {
                        "name": "winnedVolume",
                        "type": "u64"
                    },
                    {
                        "name": "winnedNums",
                        "type": "u64"
                    },
                    {
                        "name": "winnedBanana",
                        "type": "u64"
                    },
                    {
                        "name": "winnedNft",
                        "type": "u64"
                    },
                    {
                        "name": "winnerLast",
                        "type": "u8"
                    },
                    {
                        "name": "xp",
                        "type": "u64"
                    },
                    {
                        "name": "xpreward1Claimed",
                        "type": "u8"
                    },
                    {
                        "name": "xpreward2Claimed",
                        "type": "u8"
                    },
                    {
                        "name": "xpreward3Claimed",
                        "type": "u8"
                    },
                    {
                        "name": "xpreward4Claimed",
                        "type": "u8"
                    },
                    {
                        "name": "xpreward5Claimed",
                        "type": "u8"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "InvalidSuperOwner",
            "msg": "Invalid Super Owner"
        },
        {
            "code": 6001,
            "name": "InvalidGlobalPool",
            "msg": "Invalid Global Pool Address"
        },
        {
            "code": 6002,
            "name": "InvalidFeePercent",
            "msg": "Marketplace Fee is Permyriad"
        },
        {
            "code": 6003,
            "name": "NoTeamTreasuryYet",
            "msg": "Treasury Wallet Not Configured"
        },
        {
            "code": 6004,
            "name": "TreasuryAddressNotFound",
            "msg": "Treasury Address Not Exist"
        },
        {
            "code": 6005,
            "name": "MaxTreasuryRateSumExceed",
            "msg": "Total Treasury Rate Sum Should Less Than 100%"
        },
        {
            "code": 6006,
            "name": "TeamTreasuryCountMismatch",
            "msg": "Team Treasury Wallet Count Mismatch"
        },
        {
            "code": 6007,
            "name": "TeamTreasuryAddressMismatch",
            "msg": "Team Treasury Wallet Address Mismatch"
        },
        {
            "code": 6008,
            "name": "Uninitialized",
            "msg": "Uninitialized Account"
        },
        {
            "code": 6009,
            "name": "InvalidParamInput",
            "msg": "Instruction Parameter is Invalid"
        },
        {
            "code": 6010,
            "name": "InsufficientUserBalance",
            "msg": "Insufficient User SOL Balance"
        },
        {
            "code": 6011,
            "name": "InvalidUserTokenBalance",
            "msg": "Invalid token amount in the wallet"
        },
        {
            "code": 6012,
            "name": "InsufficientEscrowVaultSolBalance",
            "msg": "Insufficient SOL Balance in the Escrow Vault"
        },
        {
            "code": 6013,
            "name": "InsufficientEscrowVaultTokenAmount",
            "msg": "Insufficient Token Balance in the Escrow Vault"
        },
        {
            "code": 6014,
            "name": "InsufficientSupplyForSellToken",
            "msg": "Insufficient Token Balance To Sell"
        },
        {
            "code": 6015,
            "name": "InvalidTokenAmount",
            "msg": "Invalid Token Amount"
        },
        {
            "code": 6016,
            "name": "InvalidNftTokenAccount",
            "msg": "Invalid NFT Token Account"
        },
        {
            "code": 6017,
            "name": "InvaliedMetadata",
            "msg": "Invalid Metadata Address"
        },
        {
            "code": 6018,
            "name": "UnkownOrNotAllowedNFTCollection",
            "msg": "Unknown Collection Or The Collection Is Not Allowed"
        },
        {
            "code": 6019,
            "name": "MetadataCreatorParseError",
            "msg": "Can't Parse The NFT's Creators"
        },
        {
            "code": 6020,
            "name": "InvalidNFTAddress",
            "msg": "Not Found Nft"
        },
        {
            "code": 6021,
            "name": "MaxGamePlayerCountExceed",
            "msg": "Max Team Count is 16"
        },
        {
            "code": 6022,
            "name": "GamePlayerAlreadyAdded",
            "msg": "Game Player Already Exist"
        },
        {
            "code": 6023,
            "name": "InvalidClaimTime",
            "msg": "Invalid Claim Time"
        },
        {
            "code": 6024,
            "name": "InvalidLowXp",
            "msg": "Too Low XP"
        },
        {
            "code": 6025,
            "name": "InvalidXPClaim",
            "msg": "Invalid XP Claim"
        },
        {
            "code": 6026,
            "name": "InvalidOwner",
            "msg": "Invalid Owner"
        }
    ]
};
