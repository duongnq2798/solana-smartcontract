 use anchor_lang::prelude::*;

#[account]
pub struct Group {
    pub name: String,
    pub members: Vec<Pubkey>,
    pub seq_no: u64,
    pub quorum: u8,
    pub bump: u8
}

impl Group {
    pub const MAX_GROUP_NAME_LENGTH:usize = 32;
    pub const MAX_GROUP_MEMBERS:usize = 64;
    pub const SIZE: usize = 8 + 
    4 + Group::MAX_GROUP_NAME_LENGTH * 4 + 
    4 + Group::MAX_GROUP_MEMBERS * 32 +
    8 + 
    1 +
    1;
}

pub trait PubkeyOptions{
    fn options(&self) -> Vec<Pubkey>;
}

// should this be a PDA?
// a group doesn't need more than one CaterList
#[account]
pub struct CaterList {
    pub caters: Vec<Pubkey>,
    pub authority: Pubkey,
    pub bump: u8
}

impl CaterList {
    pub const MAX_CATER_NUM: usize = Topic::MAX_OPTION_NUM;
    pub const SIZE: usize = 8 + 4 + CaterList::MAX_CATER_NUM * 32 + 32 + 1;

    pub fn push_cater(&mut self, cater_id: &Pubkey) -> Result<()> {
        // needs to be unique
        // TODO: how to detect different Pubkey but essentially the same?
        require!(!self.caters.iter().any(|key| key == cater_id), NoDuplicateAllowed);
        require!(self.caters.len() < CaterList::MAX_CATER_NUM, FullList);
        self.caters.push(cater_id.to_owned());
        Ok(())
    } 
}

impl PubkeyOptions for CaterList {
    fn options(&self) -> Vec<Pubkey> {
        self.caters.to_owned()
    }
}

#[account]
pub struct CaterItem {
    pub cater_list: Pubkey,
    pub name: String,
    pub url: String,
    pub menus: Vec<Pubkey>,
    pub bump: u8
}

impl CaterItem {
    pub const MAX_CATER_NAME_LENGTH: usize = 64;
    pub const MAX_CATER_URL_LENGTH: usize = 128;
    pub const MAX_CATER_MENU_NUM: usize = Topic::MAX_OPTION_NUM;
    pub const SIZE: usize = 8 +
    32 + // list
    4 + CaterItem::MAX_CATER_NAME_LENGTH * 4 + // utf-8 may use a maximum of 4 bytes
    4 + CaterItem::MAX_CATER_URL_LENGTH + // ascii
    4 + CaterItem::MAX_CATER_MENU_NUM * 32 +
    1;

    pub fn push_menu(&mut self, menu_item: &Pubkey) -> Result<()> {
        require!(!self.menus.iter().any(|k| k == menu_item), NoDuplicateAllowed);
        require!(self.menus.len() < CaterItem::MAX_CATER_MENU_NUM, FullList);
        self.menus.push(menu_item.to_owned());
        Ok(())
    }
}

impl PubkeyOptions for CaterItem {
    fn options(&self) -> Vec<Pubkey> {
        self.menus.to_owned()
    }
}

#[account]
pub struct MenuItem {
    pub cater: Pubkey,
    pub name: String,
    pub foot_print: f32,
    pub cost: f32,  //USD
    pub bump: u8
}

impl MenuItem {
    pub const MAX_MENU_ITEM_NAME_LENGTH: usize = 64;
    pub const SIZE: usize = 8 + 32 + 4 + MenuItem::MAX_MENU_ITEM_NAME_LENGTH * 4 + 4 + 4 + 1;
}

// the topic is agnositic to the the cater list
// yet is dependant to the group, since it needs to know
// the seq_no
#[account]
pub struct Topic {
    pub group: Pubkey,
    pub seq_no: u64,
    pub finalized: bool,
    pub name: String,
    pub description: String,
    pub vote_due: i64,
    pub quorum: u8,
    pub vote_num: u8,
    pub options: Vec<Pubkey>
}

impl Topic {
    pub const MAX_OPTION_NUM: usize = 64;
    const MAX_TOPIC_NAME_LENGTH: usize = 64;
    const MAX_TOPIC_DESC_LENGTH: usize = 128;
    pub const SIZE: usize = 8 + 
    32 + // group
    8 + // seqno
    1 + // finalized
    4 + Topic::MAX_TOPIC_NAME_LENGTH * 4 + // name
    4 + Topic::MAX_TOPIC_DESC_LENGTH * 4 + // description 
    8 + // due
    1 + // quorum
    1 + // vote_num
    4 + Topic::MAX_OPTION_NUM * 32; // options
}

#[account]
pub struct FinalizedTopic{
    pub votes: Vec<u8>,
    pub bump: u8
}

impl FinalizedTopic {
    pub const SIZE: usize = 8 + 4 + Topic::MAX_OPTION_NUM + 1;
}

#[account]
pub struct Ballot{
    pub topic: Pubkey,
    pub voter: Pubkey,
    pub approvals: Vec<bool>,
    pub bump: u8
}

impl Ballot {
    pub const SIZE: usize = 8 + 32 + 32 + 4 + Topic::MAX_OPTION_NUM + 1;
}