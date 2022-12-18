use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default, Debug)]
pub struct AobBumps {
    pub quote_vault: u8,
}