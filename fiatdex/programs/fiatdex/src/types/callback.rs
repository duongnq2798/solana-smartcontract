use agnostic_orderbook::state::orderbook::CallbackInfo;
use borsh::{BorshDeserialize, BorshSerialize};
use bytemuck::{try_cast_slice_mut, try_from_bytes_mut, Pod, Zeroable};
use num_derive::{FromPrimitive, ToPrimitive};

use anchor_lang::solana_program::{
    account_info::AccountInfo, msg, program_error::ProgramError, program_pack::Pack, pubkey::Pubkey,
};

#[derive(BorshDeserialize, BorshSerialize, Debug, Clone, Copy, Zeroable, Pod, PartialEq)]
#[repr(C)]
/// Information about a user involved in an orderbook matching event
pub struct BasicCallBack {
    #[allow(missing_docs)]
    pub user_account: Pubkey,
}

impl CallbackInfo for BasicCallBack {
    type CallbackId = Pubkey;

    fn as_callback_id(&self) -> &Self::CallbackId {
        &self.user_account
    }
}