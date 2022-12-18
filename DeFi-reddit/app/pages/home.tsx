import { useWallet } from '@solana/wallet-adapter-react'
import CreatePosts from '../containers/Create'
import Posts from '../containers/Posts'
const Index = () => {
  const wallet = useWallet()
  return (
    <>
      <h1>This is home page</h1>
      {wallet?.publicKey && <CreatePosts />}
      {wallet?.publicKey && <Posts />}
    </>
  )
}

export default Index
