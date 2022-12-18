exports.id = 570;
exports.ids = [570];
exports.modules = {

/***/ 9600:
/***/ ((module) => {

// Exports
module.exports = {
	"overlay": "loading_overlay__gMA8Z",
	"hidden": "loading_hidden__JwavE"
};


/***/ }),

/***/ 4666:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_spinners__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8176);
/* harmony import */ var react_spinners__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_spinners__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _loading_module_scss__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9600);
/* harmony import */ var _loading_module_scss__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_loading_module_scss__WEBPACK_IMPORTED_MODULE_2__);



const Loading = ({ loading  })=>{
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        className: `${(_loading_module_scss__WEBPACK_IMPORTED_MODULE_2___default().overlay)} ${!loading && (_loading_module_scss__WEBPACK_IMPORTED_MODULE_2___default().hidden)}`,
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(react_spinners__WEBPACK_IMPORTED_MODULE_1__.ScaleLoader, {
            color: "rgb(213, 211, 194)"
        })
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Loading);


/***/ }),

/***/ 6470:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "w2": () => (/* binding */ getAtaForMint)
/* harmony export */ });
/* unused harmony exports airdrop, mintNFT, getRawTokenAccount, log */
/* harmony import */ var _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1024);
/* harmony import */ var _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _solana_spl_token__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(1057);
/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(7831);
/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_solana_web3_js__WEBPACK_IMPORTED_MODULE_2__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_solana_spl_token__WEBPACK_IMPORTED_MODULE_1__]);
_solana_spl_token__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];



const airdrop = async (wallet, connection)=>{
    let tx = await connection.requestAirdrop(wallet, 2 * anchor.web3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(tx, "confirmed");
};
const getAtaForMint = async (tokenRecipient, mintKey, tokenProgramID = _solana_spl_token__WEBPACK_IMPORTED_MODULE_1__.TOKEN_PROGRAM_ID, associatedProgramID = _solana_spl_token__WEBPACK_IMPORTED_MODULE_1__.ASSOCIATED_TOKEN_PROGRAM_ID)=>{
    return await _solana_web3_js__WEBPACK_IMPORTED_MODULE_2__.PublicKey.findProgramAddress([
        tokenRecipient.toBuffer(),
        tokenProgramID.toBuffer(),
        mintKey.toBuffer()
    ], associatedProgramID);
};
// mint NFT for testing purpose
const mintNFT = async (provider, payer, mintAuthority, freezeAuthority, amount)=>{
    // random mint key for testing purpose
    const tokenMintKeypair = anchor.web3.Keypair.generate();
    const lamportsForMint = await provider.connection.getMinimumBalanceForRentExemption(MintLayout.span);
    const createMintAccountInstruction = anchor.web3.SystemProgram.createAccount({
        programId: TOKEN_PROGRAM_ID,
        space: MintLayout.span,
        fromPubkey: payer.publicKey,
        newAccountPubkey: tokenMintKeypair.publicKey,
        lamports: lamportsForMint
    });
    const mintInstruction = createInitializeMintInstruction(tokenMintKeypair.publicKey, 0, mintAuthority.publicKey, freezeAuthority.publicKey);
    const [payerAta, _] = await getAtaForMint(payer.publicKey, tokenMintKeypair.publicKey);
    const stakerAtaInstruction = createAssociatedTokenAccountInstruction(payer.publicKey, payerAta, payer.publicKey, tokenMintKeypair.publicKey);
    const mintToInstruction = createMintToInstruction(tokenMintKeypair.publicKey, payerAta, payer.publicKey, amount, []);
    const txWithSigners = [];
    const transaction1 = new Transaction();
    transaction1.add(createMintAccountInstruction);
    transaction1.add(mintInstruction);
    transaction1.add(stakerAtaInstruction);
    transaction1.add(mintToInstruction);
    txWithSigners.push({
        tx: transaction1,
        signers: [
            payer,
            tokenMintKeypair
        ]
    });
    await provider.sendAll(txWithSigners);
    return {
        payerAta: payerAta,
        tokenMint: tokenMintKeypair.publicKey
    };
};
const getRawTokenAccount = async (provider, address)=>{
    const account = await provider.connection.getAccountInfo(address);
    if (account == null) {
        return null;
    }
    return AccountLayout.decode(account.data);
};
const log = (message, color)=>{
    let colors = {
        red: "\x1b[31m",
        green: "\x1b[32m",
        blue: "\x1b[34m"
    };
    console.log(colors[color], message, "\x1b[0m");
};

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 691:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "CH": () => (/* binding */ closeRaffle),
/* harmony export */   "XY": () => (/* binding */ purchaseTicket),
/* harmony export */   "ni": () => (/* binding */ createRaffle)
/* harmony export */ });
/* harmony import */ var _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1024);
/* harmony import */ var _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7831);
/* harmony import */ var _solana_web3_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_solana_web3_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _project_serum_anchor_dist_cjs_utils_token__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(6234);
/* harmony import */ var _project_serum_anchor_dist_cjs_utils_token__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_project_serum_anchor_dist_cjs_utils_token__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _solana_spl_token__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1057);
/* harmony import */ var _accounts__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(6470);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_solana_spl_token__WEBPACK_IMPORTED_MODULE_3__, _accounts__WEBPACK_IMPORTED_MODULE_4__]);
([_solana_spl_token__WEBPACK_IMPORTED_MODULE_3__, _accounts__WEBPACK_IMPORTED_MODULE_4__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);





const createRaffle = async (program, fee, title, description, ends, authority, raffle, image, winners, mint)=>{
    const ticket_price = new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.BN(fee);
    const ends_at = new _project_serum_anchor__WEBPACK_IMPORTED_MODULE_0__.BN(ends);
    return await program.methods.createRaffle(ticket_price, ends_at, title, description, image, winners <= 0 ? 1 : winners, 0).accounts({
        raffle: raffle,
        authority: authority,
        systemProgram: _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.SystemProgram.programId,
        tokenProgram: _project_serum_anchor_dist_cjs_utils_token__WEBPACK_IMPORTED_MODULE_2__.TOKEN_PROGRAM_ID,
        associatedTokenProgram: _solana_spl_token__WEBPACK_IMPORTED_MODULE_3__.ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenMint: mint
    }).instruction();
};
const closeRaffle = async (program, authority, raffle)=>{
    return await program.methods.endRaffle().accounts({
        raffle: raffle,
        authority: authority
    }).instruction();
};
const purchaseTicket = async (program, authority, participant, raffle, ticket, mint)=>{
    const [participantAta, _1] = await (0,_accounts__WEBPACK_IMPORTED_MODULE_4__/* .getAtaForMint */ .w2)(participant, mint);
    const [authorityAta, _2] = await (0,_accounts__WEBPACK_IMPORTED_MODULE_4__/* .getAtaForMint */ .w2)(authority, mint);
    return await program.methods.purchaseTicket().accounts({
        authority: authority,
        participant: participant,
        raffle: raffle,
        ticket: ticket,
        systemProgram: _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.SystemProgram.programId,
        tokenMint: mint,
        tokenProgram: _project_serum_anchor_dist_cjs_utils_token__WEBPACK_IMPORTED_MODULE_2__.TOKEN_PROGRAM_ID,
        associatedTokenProgram: _solana_spl_token__WEBPACK_IMPORTED_MODULE_3__.ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: _solana_web3_js__WEBPACK_IMPORTED_MODULE_1__.SYSVAR_RENT_PUBKEY,
        participantAta: participantAta,
        authorityAta: authorityAta
    }).instruction();
};

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 2141:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "RE": () => (/* binding */ getPriceWithDecimal),
/* harmony export */   "uf": () => (/* binding */ getFeeWithDecimal),
/* harmony export */   "z3": () => (/* binding */ getTokenInfo)
/* harmony export */ });
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2167);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(axios__WEBPACK_IMPORTED_MODULE_0__);

const getTokenInfo = async (token)=>{
    const data = (await axios__WEBPACK_IMPORTED_MODULE_0___default().get("https://raw.githubusercontent.com/solana-labs/token-list/main/src/tokens/solana.tokenlist.json")).data.tokens;
    const tokenData1 = data.filter((tokenData)=>tokenData.address == token.toString()
    );
    return tokenData1[0];
};
const getPriceWithDecimal = (tokenData, price)=>{
    return price / Math.pow(10, tokenData.decimals);
};
const getFeeWithDecimal = (tokenData, price)=>{
    return price * Math.pow(10, tokenData.decimals);
};


/***/ })

};
;