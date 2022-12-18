export type Payments = {
  version: "0.1.0";
  name: "payments";
  instructions: [
    {
      name: "cancelPurchase";
      accounts: [
        {
          name: "product";
          isMut: true;
          isSigner: false;
        },
        {
          name: "infrastructure";
          isMut: true;
          isSigner: false;
        },
        {
          name: "customer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "customerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payment";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "cancelSubscription";
      accounts: [
        {
          name: "customer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "customerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "merchant";
          isMut: true;
          isSigner: true;
        },
        {
          name: "merchantTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payment";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "createInfrastructure";
      accounts: [
        {
          name: "infrastructure";
          isMut: true;
          isSigner: false;
        },
        {
          name: "merchant";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "payload";
          type: {
            defined: "CreateInfrastructurePayload";
          };
        }
      ];
    },
    {
      name: "createProduct";
      accounts: [
        {
          name: "product";
          isMut: true;
          isSigner: false;
        },
        {
          name: "infrastructure";
          isMut: true;
          isSigner: false;
        },
        {
          name: "currency";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merchantTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merchant";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "payload";
          type: {
            defined: "CreateProductPayload";
          };
        }
      ];
    },
    {
      name: "createSubscription";
      accounts: [
        {
          name: "subscription";
          isMut: true;
          isSigner: false;
        },
        {
          name: "infrastructure";
          isMut: true;
          isSigner: false;
        },
        {
          name: "currency";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merchantTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merchant";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "payload";
          type: {
            defined: "CreateSubscriptionPayload";
          };
        }
      ];
    },
    {
      name: "deliverProduct";
      accounts: [
        {
          name: "infrastructure";
          isMut: false;
          isSigner: false;
        },
        {
          name: "product";
          isMut: false;
          isSigner: false;
        },
        {
          name: "customer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "customerTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merchant";
          isMut: false;
          isSigner: true;
        },
        {
          name: "merchantTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payment";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "fundSubscription";
      accounts: [
        {
          name: "customer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "merchant";
          isMut: true;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: false;
          isSigner: false;
        },
        {
          name: "customerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "merchantTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "subscriptionEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "payload";
          type: {
            defined: "FundSubscriptionPayload";
          };
        }
      ];
    },
    {
      name: "harvestSubscription";
      accounts: [
        {
          name: "infrastructure";
          isMut: false;
          isSigner: false;
        },
        {
          name: "subscription";
          isMut: false;
          isSigner: false;
        },
        {
          name: "customer";
          isMut: true;
          isSigner: false;
        },
        {
          name: "customerTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merchant";
          isMut: true;
          isSigner: true;
        },
        {
          name: "merchantTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "subscriptionEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "purchaseProduct";
      accounts: [
        {
          name: "infrastructure";
          isMut: false;
          isSigner: false;
        },
        {
          name: "product";
          isMut: false;
          isSigner: false;
        },
        {
          name: "customer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "merchant";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "customerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "merchantTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payment";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "purchaseSubscription";
      accounts: [
        {
          name: "infrastructure";
          isMut: false;
          isSigner: false;
        },
        {
          name: "subscription";
          isMut: false;
          isSigner: false;
        },
        {
          name: "customer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "merchant";
          isMut: false;
          isSigner: false;
        },
        {
          name: "mint";
          isMut: false;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "customerTokenAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "merchantTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "subscriptionEscrow";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "refundPurchase";
      accounts: [
        {
          name: "infrastructure";
          isMut: false;
          isSigner: false;
        },
        {
          name: "product";
          isMut: false;
          isSigner: false;
        },
        {
          name: "customer";
          isMut: false;
          isSigner: false;
        },
        {
          name: "customerTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "merchant";
          isMut: false;
          isSigner: true;
        },
        {
          name: "merchantTokenAccount";
          isMut: false;
          isSigner: false;
        },
        {
          name: "payment";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "tokenProgram";
          isMut: false;
          isSigner: false;
        },
        {
          name: "rent";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [];
    },
    {
      name: "updateInfrastructure";
      accounts: [
        {
          name: "infrastructure";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "payload";
          type: {
            defined: "UpdateInfrastructurePayload";
          };
        }
      ];
    },
    {
      name: "updateProduct";
      accounts: [
        {
          name: "infrastructure";
          isMut: true;
          isSigner: false;
        },
        {
          name: "product";
          isMut: true;
          isSigner: false;
        },
        {
          name: "merchant";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "payload";
          type: {
            defined: "UpdateProductPayload";
          };
        }
      ];
    },
    {
      name: "updateSubscription";
      accounts: [
        {
          name: "subscription";
          isMut: true;
          isSigner: false;
        },
        {
          name: "infrastructure";
          isMut: true;
          isSigner: false;
        },
        {
          name: "payer";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "payload";
          type: {
            defined: "UpdateSubscriptionPayload";
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "infrastructure";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "bytes";
          },
          {
            name: "description";
            type: "bytes";
          },
          {
            name: "active";
            type: "bool";
          },
          {
            name: "selfCustody";
            type: "bool";
          },
          {
            name: "authority";
            type: "publicKey";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "payment";
      type: {
        kind: "struct";
        fields: [
          {
            name: "customer";
            type: "publicKey";
          },
          {
            name: "customerTokenAccount";
            type: "publicKey";
          },
          {
            name: "merchant";
            type: "publicKey";
          },
          {
            name: "merchantTokenAccount";
            type: "publicKey";
          },
          {
            name: "amount";
            type: "u64";
          },
          {
            name: "delivered";
            type: "bool";
          },
          {
            name: "cancelled";
            type: "bool";
          },
          {
            name: "refunded";
            type: "bool";
          },
          {
            name: "cancelTime";
            type: "i64";
          },
          {
            name: "refundTime";
            type: "i64";
          },
          {
            name: "purchaseTime";
            type: "i64";
          },
          {
            name: "deliveredTime";
            type: "i64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "product";
      type: {
        kind: "struct";
        fields: [
          {
            name: "infrastructure";
            type: "publicKey";
          },
          {
            name: "name";
            type: "bytes";
          },
          {
            name: "description";
            type: "bytes";
          },
          {
            name: "active";
            type: "bool";
          },
          {
            name: "currency";
            type: "publicKey";
          },
          {
            name: "merchantTokenAccount";
            type: "publicKey";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "inventory";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "subscriptionEscrow";
      type: {
        kind: "struct";
        fields: [
          {
            name: "customer";
            type: "publicKey";
          },
          {
            name: "customerTokenAccount";
            type: "publicKey";
          },
          {
            name: "merchant";
            type: "publicKey";
          },
          {
            name: "merchantTokenAccount";
            type: "publicKey";
          },
          {
            name: "period";
            type: "i64";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "amountOwed";
            type: "u64";
          },
          {
            name: "cancelled";
            type: "bool";
          },
          {
            name: "refunded";
            type: "bool";
          },
          {
            name: "nextPaymentDue";
            type: "i64";
          },
          {
            name: "cancelTime";
            type: "i64";
          },
          {
            name: "refundTime";
            type: "i64";
          },
          {
            name: "subscribeTime";
            type: "i64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "subscription";
      type: {
        kind: "struct";
        fields: [
          {
            name: "infrastructure";
            type: "publicKey";
          },
          {
            name: "name";
            type: "bytes";
          },
          {
            name: "description";
            type: "bytes";
          },
          {
            name: "active";
            type: "bool";
          },
          {
            name: "currency";
            type: "publicKey";
          },
          {
            name: "merchantTokenAccount";
            type: "publicKey";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "period";
            type: "i64";
          },
          {
            name: "maxSupply";
            type: "u64";
          },
          {
            name: "activeSupply";
            type: "u64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    }
  ];
  types: [
    {
      name: "CreateInfrastructurePayload";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "selfCustody";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "CreateProductPayload";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "inventory";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "CreateSubscriptionPayload";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "period";
            type: "i64";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "maxSupply";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "FundSubscriptionPayload";
      type: {
        kind: "struct";
        fields: [
          {
            name: "amount";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "UpdateInfrastructurePayload";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "active";
            type: "bool";
          }
        ];
      };
    },
    {
      name: "UpdateProductPayload";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "active";
            type: "bool";
          },
          {
            name: "price";
            type: "u64";
          },
          {
            name: "inventory";
            type: "u64";
          }
        ];
      };
    },
    {
      name: "UpdateSubscriptionPayload";
      type: {
        kind: "struct";
        fields: [
          {
            name: "name";
            type: "string";
          },
          {
            name: "description";
            type: "string";
          },
          {
            name: "active";
            type: "bool";
          },
          {
            name: "maxSupply";
            type: "u64";
          }
        ];
      };
    }
  ];
  errors: [
    {
      code: 6000;
      name: "StateAlreadyActive";
    },
    {
      code: 6001;
      name: "StateNotActive";
    },
    {
      code: 6002;
      name: "IncorrectAccountAuthority";
    }
  ];
};

export const IDL: Payments = {
  version: "0.1.0",
  name: "payments",
  instructions: [
    {
      name: "cancelPurchase",
      accounts: [
        {
          name: "product",
          isMut: true,
          isSigner: false,
        },
        {
          name: "infrastructure",
          isMut: true,
          isSigner: false,
        },
        {
          name: "customer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "customerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "cancelSubscription",
      accounts: [
        {
          name: "customer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "customerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchantTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "createInfrastructure",
      accounts: [
        {
          name: "infrastructure",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "payload",
          type: {
            defined: "CreateInfrastructurePayload",
          },
        },
      ],
    },
    {
      name: "createProduct",
      accounts: [
        {
          name: "product",
          isMut: true,
          isSigner: false,
        },
        {
          name: "infrastructure",
          isMut: true,
          isSigner: false,
        },
        {
          name: "currency",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchantTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "payload",
          type: {
            defined: "CreateProductPayload",
          },
        },
      ],
    },
    {
      name: "createSubscription",
      accounts: [
        {
          name: "subscription",
          isMut: true,
          isSigner: false,
        },
        {
          name: "infrastructure",
          isMut: true,
          isSigner: false,
        },
        {
          name: "currency",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchantTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "payload",
          type: {
            defined: "CreateSubscriptionPayload",
          },
        },
      ],
    },
    {
      name: "deliverProduct",
      accounts: [
        {
          name: "infrastructure",
          isMut: false,
          isSigner: false,
        },
        {
          name: "product",
          isMut: false,
          isSigner: false,
        },
        {
          name: "customer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "customerTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: false,
          isSigner: true,
        },
        {
          name: "merchantTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "fundSubscription",
      accounts: [
        {
          name: "customer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: false,
          isSigner: false,
        },
        {
          name: "customerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merchantTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "subscriptionEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "payload",
          type: {
            defined: "FundSubscriptionPayload",
          },
        },
      ],
    },
    {
      name: "harvestSubscription",
      accounts: [
        {
          name: "infrastructure",
          isMut: false,
          isSigner: false,
        },
        {
          name: "subscription",
          isMut: false,
          isSigner: false,
        },
        {
          name: "customer",
          isMut: true,
          isSigner: false,
        },
        {
          name: "customerTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchantTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "subscriptionEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "purchaseProduct",
      accounts: [
        {
          name: "infrastructure",
          isMut: false,
          isSigner: false,
        },
        {
          name: "product",
          isMut: false,
          isSigner: false,
        },
        {
          name: "customer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchant",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "customerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merchantTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "purchaseSubscription",
      accounts: [
        {
          name: "infrastructure",
          isMut: false,
          isSigner: false,
        },
        {
          name: "subscription",
          isMut: false,
          isSigner: false,
        },
        {
          name: "customer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "merchant",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: false,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "customerTokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merchantTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "subscriptionEscrow",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "refundPurchase",
      accounts: [
        {
          name: "infrastructure",
          isMut: false,
          isSigner: false,
        },
        {
          name: "product",
          isMut: false,
          isSigner: false,
        },
        {
          name: "customer",
          isMut: false,
          isSigner: false,
        },
        {
          name: "customerTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: false,
          isSigner: true,
        },
        {
          name: "merchantTokenAccount",
          isMut: false,
          isSigner: false,
        },
        {
          name: "payment",
          isMut: true,
          isSigner: false,
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "updateInfrastructure",
      accounts: [
        {
          name: "infrastructure",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "payload",
          type: {
            defined: "UpdateInfrastructurePayload",
          },
        },
      ],
    },
    {
      name: "updateProduct",
      accounts: [
        {
          name: "infrastructure",
          isMut: true,
          isSigner: false,
        },
        {
          name: "product",
          isMut: true,
          isSigner: false,
        },
        {
          name: "merchant",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "payload",
          type: {
            defined: "UpdateProductPayload",
          },
        },
      ],
    },
    {
      name: "updateSubscription",
      accounts: [
        {
          name: "subscription",
          isMut: true,
          isSigner: false,
        },
        {
          name: "infrastructure",
          isMut: true,
          isSigner: false,
        },
        {
          name: "payer",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "payload",
          type: {
            defined: "UpdateSubscriptionPayload",
          },
        },
      ],
    },
  ],
  accounts: [
    {
      name: "infrastructure",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "bytes",
          },
          {
            name: "description",
            type: "bytes",
          },
          {
            name: "active",
            type: "bool",
          },
          {
            name: "selfCustody",
            type: "bool",
          },
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "payment",
      type: {
        kind: "struct",
        fields: [
          {
            name: "customer",
            type: "publicKey",
          },
          {
            name: "customerTokenAccount",
            type: "publicKey",
          },
          {
            name: "merchant",
            type: "publicKey",
          },
          {
            name: "merchantTokenAccount",
            type: "publicKey",
          },
          {
            name: "amount",
            type: "u64",
          },
          {
            name: "delivered",
            type: "bool",
          },
          {
            name: "cancelled",
            type: "bool",
          },
          {
            name: "refunded",
            type: "bool",
          },
          {
            name: "cancelTime",
            type: "i64",
          },
          {
            name: "refundTime",
            type: "i64",
          },
          {
            name: "purchaseTime",
            type: "i64",
          },
          {
            name: "deliveredTime",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "product",
      type: {
        kind: "struct",
        fields: [
          {
            name: "infrastructure",
            type: "publicKey",
          },
          {
            name: "name",
            type: "bytes",
          },
          {
            name: "description",
            type: "bytes",
          },
          {
            name: "active",
            type: "bool",
          },
          {
            name: "currency",
            type: "publicKey",
          },
          {
            name: "merchantTokenAccount",
            type: "publicKey",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "inventory",
            type: "u64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "subscriptionEscrow",
      type: {
        kind: "struct",
        fields: [
          {
            name: "customer",
            type: "publicKey",
          },
          {
            name: "customerTokenAccount",
            type: "publicKey",
          },
          {
            name: "merchant",
            type: "publicKey",
          },
          {
            name: "merchantTokenAccount",
            type: "publicKey",
          },
          {
            name: "period",
            type: "i64",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "amountOwed",
            type: "u64",
          },
          {
            name: "cancelled",
            type: "bool",
          },
          {
            name: "refunded",
            type: "bool",
          },
          {
            name: "nextPaymentDue",
            type: "i64",
          },
          {
            name: "cancelTime",
            type: "i64",
          },
          {
            name: "refundTime",
            type: "i64",
          },
          {
            name: "subscribeTime",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "subscription",
      type: {
        kind: "struct",
        fields: [
          {
            name: "infrastructure",
            type: "publicKey",
          },
          {
            name: "name",
            type: "bytes",
          },
          {
            name: "description",
            type: "bytes",
          },
          {
            name: "active",
            type: "bool",
          },
          {
            name: "currency",
            type: "publicKey",
          },
          {
            name: "merchantTokenAccount",
            type: "publicKey",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "period",
            type: "i64",
          },
          {
            name: "maxSupply",
            type: "u64",
          },
          {
            name: "activeSupply",
            type: "u64",
          },
          {
            name: "bump",
            type: "u8",
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "CreateInfrastructurePayload",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "selfCustody",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "CreateProductPayload",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "inventory",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "CreateSubscriptionPayload",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "period",
            type: "i64",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "maxSupply",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "FundSubscriptionPayload",
      type: {
        kind: "struct",
        fields: [
          {
            name: "amount",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UpdateInfrastructurePayload",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "active",
            type: "bool",
          },
        ],
      },
    },
    {
      name: "UpdateProductPayload",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "active",
            type: "bool",
          },
          {
            name: "price",
            type: "u64",
          },
          {
            name: "inventory",
            type: "u64",
          },
        ],
      },
    },
    {
      name: "UpdateSubscriptionPayload",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "description",
            type: "string",
          },
          {
            name: "active",
            type: "bool",
          },
          {
            name: "maxSupply",
            type: "u64",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "StateAlreadyActive",
    },
    {
      code: 6001,
      name: "StateNotActive",
    },
    {
      code: 6002,
      name: "IncorrectAccountAuthority",
    },
  ],
};
