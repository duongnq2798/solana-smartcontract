import * as anchor from '@project-serum/anchor'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { getProgramInstance } from '../../utils/program'

const CreatePosts = () => {
  const wallet = useWallet()
  const connection = useConnection()
  const program = getProgramInstance(connection.connection, wallet)
  const newAcc = anchor.web3.Keypair.generate()

  const createNew = async () => {
    try {
        await program.rpc.initialize(
            //@ts-ignore
            'Hello i am Rehan this is nth post',
            'This is title of the post',
            ['test'],
            'https://test-img.jpg',
            {
              accounts: {
                blogAccount: newAcc.publicKey,
                user: wallet.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
              },
              signers: [newAcc],
            }
          )
    } catch (error) {
        alert('Something went wrong try again later')
    }
  }

  return (
    <>
      <h1>This is form</h1>
      <div>
        <button onClick={createNew}>Create</button>
      </div>
    </>
  )
}

export default CreatePosts
