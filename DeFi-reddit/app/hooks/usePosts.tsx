import { useState } from 'react'
import toast from 'react-hot-toast'
import { getProgramInstance } from '../utils/program'

const usePosts = (wallet: any, connection: any) => {
  const [posts, setPosts] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const program = getProgramInstance(connection.connection, wallet)
  
    const getPosts = async () => {
      try {
        const posts = await program.account.blogAccount.all()
        setPosts(posts)
        toast.success("This didn't work.")
      } catch (error) {
        toast.error("This didn't work.")
      }
      setLoading(false)
    }


  return { posts, loading, getPosts }
}

export default usePosts
