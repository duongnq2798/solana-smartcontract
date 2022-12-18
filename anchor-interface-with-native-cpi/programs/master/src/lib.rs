use anchor_lang::{prelude::*, solana_program::{self, instruction::Instruction, hash::hashv}};

declare_id!("HtTGeeRqoJyF77y4fhadcAw7i1jbdugsV9iY3hYUNHLd");

#[program]
pub mod master {

    use super::*;

    pub fn execute_plugin(ctx: Context<ExecutePlugin>, input_val: u64) -> Result<()> {
        
        msg!("execute_plugin begin");
        let input_data = PluginExecuteInput {
            value_a: input_val,
            value_b: 1
        };

        let result = cpi_plugin(ctx.accounts.plugin_program.key, ctx.accounts.plugin_state.to_account_info(), input_data);
        match result {
            Option::None => msg!("error calling the plugin"),
            Option::Some(res) => msg!("result: {:?}", res.result)
        }

        msg!("execute_plugin end");
        Ok(())
    }
}

#[derive(Accounts)] 
pub struct ExecutePlugin<'info> {
    /// CHECK:
    plugin_state: AccountInfo<'info>,
    /// CHECK:
    plugin_program: AccountInfo<'info>,
}

pub fn cpi_plugin(plugin_program: &Pubkey, plugin_state: AccountInfo, input_data: PluginExecuteInput) -> Option<PluginExecuteOutput> {
    
    let mut data = hashv(&[b"global:execute"]).to_bytes()[..8].to_vec();
    data.append(&mut input_data.try_to_vec().unwrap());

    let account_metas = vec![
        AccountMeta::new_readonly(*plugin_state.key, false),
    ];

    let ix = Instruction::new_with_bytes(
        *plugin_program,
        &data,
        account_metas,
    );

    let account_infos = [
        plugin_state
    ];
    let cpi_res = solana_program::program::invoke(&ix, &account_infos);

    return match cpi_res {
        Ok(()) => {
            let (program_key, serialized_result)= solana_program::program::get_return_data().unwrap();
            msg!("program_key: {}", program_key);
            msg!("serialized_result: {:?}", serialized_result);
        
            let mut serialized_result_slice: &[u8] = &serialized_result;
            PluginExecuteOutput::deserialize(&mut serialized_result_slice).ok()
        },
        Err(error) => {
            msg!("cpi_error: {}", error);
            Option::None
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PluginExecuteInput {
    value_a: u64,
    value_b: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct PluginExecuteOutput {
    result: u64,
}