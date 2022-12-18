
use anchor_lang::prelude::*;
use crate::Players;

pub fn create_prediction(players: &mut Players, user: Pubkey, prediction: i8) -> Result<()> {
  for (index, _) in players.players.iter().enumerate() {
      if players.players[index] == None && players.players_predictions[index] == None {
          players.players[index] = Some(user);
          players.players_predictions[index] = Some(prediction);

          return Ok(());
      }
  }

  Err(ErrorCode::RequireEqViolated.into())
}
