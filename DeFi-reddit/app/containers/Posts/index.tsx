import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useEffect } from 'react'
import Post from '../../components/Post'
import usePosts from '../../hooks/usePosts'

const Posts = () => {
  const wallet = useWallet()
  const connection = useConnection()

  const { posts, loading, getPosts } = usePosts(wallet, connection)

  useEffect(() => {
    getPosts()
  }, [])

  return (
    <>
      <h1>This is DATA</h1>
      {loading ? <> loading....</> : <Post posts={posts} />}
    </>
  )
}

export default Posts
