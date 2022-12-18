import * as anchor from "@project-serum/anchor";
import { base58_to_binary } from "base58-js";
import { assert, expect } from "chai";
import { initEsTokenMetadata } from "../es-token-metadata/utils/account";
import { addSOLToWallet, initCookieCutter } from "./utils/account";
import { bid } from "./utils/bid";
import {
  BidCookieCutterArgs,
  ExecuteSaleCookieCutterArgs,
  SellCookieCutterArgs,
} from "./utils/interfaces";
import { sell } from "./utils/sell";
import { showCookieCutter } from "./utils/show-cookie-cutter";
import * as mocha from "mocha";
import { executeSale } from "./utils/executeSale";

describe("auction-house", () => {
  // Configure the client to use the local cluster.
  const env = "devnet";

  let _walletKeyPair: anchor.web3.Keypair;
  let _cookieCutterKey: anchor.web3.PublicKey;
  let _esTokenMetaDataKey: anchor.web3.PublicKey;
  let _mintKeypair: anchor.web3.Keypair;
  let _buyerWalletKeypair: anchor.web3.Keypair;

  const buyPrice = 1;

  before((done) => {
    (async () => {
      try {
        const { walletKeyPair, cookieCutter } = await initCookieCutter();

        _walletKeyPair = walletKeyPair;
        _cookieCutterKey = cookieCutter;
      } catch (error) {
        console.error("error while initCookieCutter => ", error);
      }

      try {
        const { esTokenMetaDataKey, mintKeypair } = await initEsTokenMetadata(
          _walletKeyPair,
          env
        );
        _esTokenMetaDataKey = esTokenMetaDataKey;
        _mintKeypair = mintKeypair;
      } catch (error) {
        console.error("error while initEsTokenMetadata => ", error);
      }

      done();
    })();
  });

  it("Should successfully create Cookie Cutter", async () => {
    try {
      await showCookieCutter({
        walletKeyPair: _walletKeyPair,
        env: env,
        cookieCutterKey: _cookieCutterKey,
        treasuryMint: null,
      });
    } catch (error) {
      console.error("error while showing CookieCutter => ", error);
    }
  });

  it("Should execute `sell` function", async () => {
    try {
      const sellArgs: SellCookieCutterArgs = {
        buyPrice,
        env,
        cookieCutterKey: _cookieCutterKey,
        cookieCutterSigns: false,
        mintKey: _mintKeypair.publicKey,
        tokenSize: 1,
        walletKeypair: _walletKeyPair,
      };

      await sell(sellArgs);
    } catch (error) {
      console.error("error while selling => ", error);
    }
  });

  it("Should execute `bid` function", async () => {
    try {
      const buyerWalletKeyPair = anchor.web3.Keypair.generate();
      _buyerWalletKeypair = buyerWalletKeyPair;
      await addSOLToWallet(buyerWalletKeyPair);

      const bidArgs: BidCookieCutterArgs = {
        sellerWalletKeypair: _walletKeyPair,
        sellPrice: buyPrice,
        buyPrice: 1,
        tokenSize: 1,
        env,
        cookieCutterKey: _cookieCutterKey,
        mintKey: _mintKeypair.publicKey,
        walletKeypair: buyerWalletKeyPair,
        paymentAccountKeypair: buyerWalletKeyPair,
      };

      await bid(bidArgs);
    } catch (error) {
      console.error("error while bidding => ", error);
      assert.ok(false);
    }
  });

  it("Should execute `execute_sale` function", async () => {
    try {
      const executeSaleArgs: ExecuteSaleCookieCutterArgs = {
        sellerWalletKeypair: _walletKeyPair,
        sellPrice: buyPrice,
        buyPrice: 1,
        tokenSize: 1,
        env,
        cookieCutterKey: _cookieCutterKey,
        mintKey: _mintKeypair.publicKey,
        buyerWalletKeypair: _buyerWalletKeypair,
      };

      await executeSale(executeSaleArgs);
    } catch (error) {
      console.error("error while executing sale => ", error);
      assert.ok(false);
    }
  });
});
