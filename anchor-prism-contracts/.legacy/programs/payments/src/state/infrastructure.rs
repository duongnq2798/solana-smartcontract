// use crate::enums::core::*;
// use crate::errors::ProgramError;
use anchor_lang::prelude::*;

#[account]
pub struct Infrastructure {
    pub name: Vec<u8>,
    pub description: Vec<u8>,
    pub active: bool,
    pub self_custody: bool,
    pub authority: Pubkey,
    pub bump: u8,
}

impl Infrastructure {
    pub fn create(
        &mut self,
        name: Vec<u8>,
        description: Vec<u8>,
        self_custody: bool,
        authority: Pubkey,
        bump: u8,
    ) -> Result<()> {
        self.name = name;
        self.description = description;
        self.self_custody = self_custody;
        self.active = true;
        self.authority = authority;
        self.bump = bump;
        Ok(())
    }

    pub fn update(&mut self, name: Vec<u8>, description: Vec<u8>, active: bool) -> Result<()> {
        self.name = name;
        self.description = description;
        self.active = active;
        Ok(())
    }
}
