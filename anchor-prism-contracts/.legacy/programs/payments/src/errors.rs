use anchor_lang::error_code;

#[error_code]
pub enum ProgramError {
    StateAlreadyActive,
    StateNotActive,
    IncorrectAccountAuthority,
}
