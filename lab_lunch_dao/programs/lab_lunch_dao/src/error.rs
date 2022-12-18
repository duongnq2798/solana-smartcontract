use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("only first member can change the group")]
    NotAllowedToUpdateGroup,
    #[msg("group is full")]
    FullGroup,
    #[msg("group members must not overlap")]
    GroupNotUnique,
    #[msg("quorum should be larger than 0 and lower than the total number of members")]
    InvalidQuorum,
    #[msg("list items needs to be unique")]
    NoDuplicateAllowed,
    #[msg("List is full")]
    FullList,
    #[msg("String is too long")]
    StringTooLong,
    #[msg("Sequence Number Mismatch")]
    SeqNoMismatch,
    #[msg("Voter Not Found in Member List")]
    VoterNotMember,
    #[msg("Option and Votes do not match")]
    OptionVotesMismatch,
    #[msg("Topic is closed")]
    TopicClosed,
    #[msg("Topic still has time left until closing")]
    TopicStillRunning,
    #[msg("Topic needs equal or more participants than the quorum")]
    TopicDidNotReachQuorum,
} 

