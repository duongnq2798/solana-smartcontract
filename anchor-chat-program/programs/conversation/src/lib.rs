use anchor_lang::prelude::*;

declare_id!("8xMGj9G2hYRAfgdkG45xqmWCMmh6pb4agu26REJC9LsX");

pub const MAX_MESSAGE_LENGTH: usize = 32;

#[program]
pub mod conversation {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.conversation_tracker.initializer = ctx.accounts.initializer.key();
        ctx.accounts.conversation_tracker.initialized_with = ctx.accounts.initialized_with.key();
        ctx.accounts.conversation_tracker.bump_seed =
            *ctx.bumps.get("conversation_tracker").unwrap();
        Ok(())
    }

    // TODO message must be of fixed size for borsh to work.
    pub fn send_message(ctx: Context<SendMessage>, message: [u8; 32]) -> Result<()> {
        ctx.accounts.message.message = message;
        ctx.accounts.message.bump_seed = *ctx.bumps.get("message").unwrap();
        ctx.accounts.conversation_tracker.conversation_nonce += 1;
        Ok(())
    }

    /// Empties out the message string, but the account record remains
    pub fn delete_message(ctx: Context<DeleteMessage>) -> Result<()> {
        ctx.accounts.message.message = [0; 32]; //empty out the message
        Ok(())
    }
}

#[error_code]
pub enum ConversationError {
    #[msg("Message length limit exeeded")]
    MessageLengthOverflow,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub initializer: Signer<'info>,
    /// CHECK: this not read or written to
    pub initialized_with: UncheckedAccount<'info>,
    #[account(
        init,
        payer = initializer,
        space = 8 + ConversationTracker::SIZE,
        seeds = [
            initializer.key().as_ref(),
            initialized_with.key().as_ref(),
            b"conversation_tracker"
            ],
            bump
        )]
    pub conversation_tracker: Account<'info, ConversationTracker>,
    pub system_program: Program<'info, System>,
}

#[derive(Default)]
#[account]
pub struct ConversationTracker {
    pub initializer: Pubkey,
    pub initialized_with: Pubkey,
    pub conversation_nonce: u8,
    pub bump_seed: u8,
}
impl ConversationTracker {
    pub const SIZE: usize = (2 * 32) + 1 + 1;
}

// FIXME error in giving message pda the conversation_tracker.conversation_nonce. (sig verification fails)
#[derive(Accounts)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: not read or written to
    pub receiver: UncheckedAccount<'info>,
    #[account(
            mut,
            seeds = [
                sender.key().as_ref(),
                receiver.key().as_ref(),
                b"conversation_tracker",
            ],
            bump
        )]
    pub conversation_tracker: Account<'info, ConversationTracker>,
    #[account(
        init,
        payer = sender,
        space = 8 + Message::SIZE,
        seeds =[
            sender.key().as_ref(),
            receiver.key().as_ref(),
            // &[conversation_tracker.conversation_nonce],
            b"conversation_message"
            ],
        bump,
        )]
    pub message: Account<'info, Message>,
    #[account()]
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteMessage<'info> {
    #[account(mut)]
    pub sender: Signer<'info>,
    /// CHECK: not read or written to
    pub receiver: UncheckedAccount<'info>,
    #[account(
        mut,
        seeds = [
        sender.key().as_ref(),
        receiver.key().as_ref(),
        b"conversation_tracker"
        ],
        bump = conversation_tracker.bump_seed
    )]
    pub conversation_tracker: Account<'info, ConversationTracker>,
    #[account(
        mut,
        seeds =[
        sender.key().as_ref(),
        receiver.key().as_ref(),
        // &[conversation_tracker.conversation_nonce],
        b"conversation_message"
        ],
        bump = message.bump_seed,
    )]
    pub message: Account<'info, Message>,
}

#[account]
pub struct Message {
    pub message: [u8; MAX_MESSAGE_LENGTH],
    pub bump_seed: u8,
}
impl Message {
    pub const SIZE: usize = MAX_MESSAGE_LENGTH + 1;
}
