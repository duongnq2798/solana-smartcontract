<br/> <p align="center"> <a> <img src="https://avatars.githubusercontent.com/u/103419525?v=4" width="100"/> 
</a> </p> <h1 align="center">  </h1> <br/> <br/> 

# 🦉 V1 anchor-prism-contracts

## Overview

Prism provides is a decentralized payments infrastructure. 

This repo contains Prism's V1 payments escrow contracts.


## Program IDL


```
{
  "version": "0.1.0",
  "name": "payments",
  "instructions": [
    {
      "name": "cancelPurchase",
      "accounts": [
        {
          "name": "customer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "customerDepositTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "createProduct",
      "accounts": [
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "currency",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "merchantTokenAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "merchant",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "price",
          "type": "u64"
        },
        {
          "name": "inventory",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deliverProduct",
      "accounts": [
        {
          "name": "merchant",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "merchantReceiveTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "customer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "purchaseProduct",
      "accounts": [
        {
          "name": "customer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "mint",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "customerDepositTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "product",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productEscrow",
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
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vaultAccountBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "refundPurchase",
      "accounts": [
        {
          "name": "customer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "vaultAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vaultAuthority",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "customerDepositTokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "productEscrow",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "ProductEscrow",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "product",
            "type": "publicKey"
          },
          {
            "name": "merchant",
            "type": "publicKey"
          },
          {
            "name": "merchantReceiveTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "customer",
            "type": "publicKey"
          },
          {
            "name": "customerDepositTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "currency",
            "type": "publicKey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "delivered",
            "type": "bool"
          },
          {
            "name": "cancelled",
            "type": "bool"
          },
          {
            "name": "refunded",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "Product",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "active",
            "type": "bool"
          },
          {
            "name": "currency",
            "type": "publicKey"
          },
          {
            "name": "merchant",
            "type": "publicKey"
          },
          {
            "name": "merchantTokenAccount",
            "type": "publicKey"
          },
          {
            "name": "price",
            "type": "u64"
          },
          {
            "name": "inventory",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "CreateProductEvent",
      "fields": [
        {
          "name": "index",
          "type": "string",
          "index": true
        },
        {
          "name": "productUuid",
          "type": "string",
          "index": false
        },
        {
          "name": "currency",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "merchant",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "merchantTokenAccount",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "price",
          "type": "u64",
          "index": false
        },
        {
          "name": "inventory",
          "type": "u64",
          "index": false
        },
        {
          "name": "bump",
          "type": "u8",
          "index": false
        }
      ]
    }
  ],
  "metadata": {
    "address": "Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS"
  }
}
```

## Testing

```
    yarn install
    yarn run test
```
