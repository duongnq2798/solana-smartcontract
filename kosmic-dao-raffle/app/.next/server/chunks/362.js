"use strict";
exports.id = 362;
exports.ids = [362];
exports.modules = {

/***/ 4362:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "F": () => (/* binding */ ContractContext),
/* harmony export */   "G": () => (/* binding */ ContractProvider)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1247);
/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7831);
/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_solana_web3_js__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _project_serum_anchor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(1024);
/* harmony import */ var _project_serum_anchor__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_project_serum_anchor__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _kosmic_dao_raffle_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(4299);
/* harmony import */ var _kosmic_dao_raffle__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1520);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_1__]);
_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];







const ContractContext = /*#__PURE__*/ (0,react__WEBPACK_IMPORTED_MODULE_3__.createContext)(null);
const preflightCommitment = "processed";
const commitment = "processed";
const programID = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_2__.PublicKey(_kosmic_dao_raffle_json__WEBPACK_IMPORTED_MODULE_5__/* .metadata.address */ .Pu.L);
const connection = new _solana_web3_js__WEBPACK_IMPORTED_MODULE_2__.Connection("https://ssc-dao.genesysgo.net/");
const ContractProvider = ({ children  })=>{
    const wallet = (0,_solana_wallet_adapter_react__WEBPACK_IMPORTED_MODULE_1__.useAnchorWallet)();
    const provider = (0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)(()=>{
        return new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_4__.AnchorProvider(connection, wallet, {
            preflightCommitment,
            commitment
        });
    }, [
        wallet
    ]);
    const program = (0,react__WEBPACK_IMPORTED_MODULE_3__.useMemo)(()=>{
        return new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_4__.Program(_kosmic_dao_raffle__WEBPACK_IMPORTED_MODULE_6__/* .IDL */ .x, programID, provider);
    }, [
        provider
    ]);
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(ContractContext.Provider, {
        value: {
            wallet,
            connection,
            provider,
            program
        },
        children: children
    });
};

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 1520:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "x": () => (/* binding */ IDL)
/* harmony export */ });
const IDL = {
    "version": "0.1.0",
    "name": "kosmic_dao_raffle",
    "instructions": [
        {
            "name": "createRaffle",
            "accounts": [
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "raffle",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
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
                    "name": "price",
                    "type": "u64"
                },
                {
                    "name": "ends",
                    "type": "i64"
                },
                {
                    "name": "title",
                    "type": "string"
                },
                {
                    "name": "description",
                    "type": "string"
                },
                {
                    "name": "image",
                    "type": "string"
                },
                {
                    "name": "winners",
                    "type": "u8"
                },
                {
                    "name": "requiresAuthor",
                    "type": "u8"
                }
            ]
        },
        {
            "name": "purchaseTicket",
            "accounts": [
                {
                    "name": "authority",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "needSigner",
                    "isMut": false,
                    "isSigner": true
                },
                {
                    "name": "participant",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "raffle",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "ticket",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "participantAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "authorityAta",
                    "isMut": true,
                    "isSigner": false
                },
                {
                    "name": "tokenMint",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "tokenProgram",
                    "isMut": false,
                    "isSigner": false
                },
                {
                    "name": "associatedTokenProgram",
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
            "args": []
        },
        {
            "name": "endRaffle",
            "accounts": [
                {
                    "name": "authority",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "raffle",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": []
        },
        {
            "name": "closeTicketAccount",
            "accounts": [
                {
                    "name": "participant",
                    "isMut": true,
                    "isSigner": true
                },
                {
                    "name": "ticket",
                    "isMut": true,
                    "isSigner": false
                }
            ],
            "args": []
        }
    ],
    "accounts": [
        {
            "name": "raffle",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "authority",
                        "type": "publicKey"
                    },
                    {
                        "name": "ends",
                        "type": "i64"
                    },
                    {
                        "name": "title",
                        "type": "string"
                    },
                    {
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "name": "image",
                        "type": "string"
                    },
                    {
                        "name": "winners",
                        "type": "u8"
                    },
                    {
                        "name": "requiresAuthor",
                        "type": "u8"
                    },
                    {
                        "name": "price",
                        "type": "u64"
                    },
                    {
                        "name": "token",
                        "type": "publicKey"
                    }
                ]
            }
        },
        {
            "name": "ticket",
            "type": {
                "kind": "struct",
                "fields": [
                    {
                        "name": "raffle",
                        "type": "publicKey"
                    },
                    {
                        "name": "participant",
                        "type": "publicKey"
                    }
                ]
            }
        }
    ],
    "errors": [
        {
            "code": 6000,
            "name": "RaffleEnded",
            "msg": "Raffle Has Ended"
        },
        {
            "code": 6001,
            "name": "InputError",
            "msg": "Input Error"
        },
        {
            "code": 6002,
            "name": "Unauthorized",
            "msg": "Unauthorized"
        }
    ]
};


/***/ }),

/***/ 4299:
/***/ ((module) => {

module.exports = JSON.parse('{"Pu":{"L":"6hQVmZSoUjWdBniVExRorWJxCDFmJwznXis2HSopBdu6"}}');

/***/ })

};
;