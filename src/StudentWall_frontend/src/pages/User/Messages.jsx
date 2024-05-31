import React, { useEffect, useState } from 'react'
import PostCard from '../../components/PostCard'
import { useParams } from '../../../../../node_modules/react-router-dom/dist/index'
import { useAuth } from '../../helpers/use-auth-client'
import { Principal } from '../../../../../node_modules/@dfinity/principal/lib/cjs/index'
import { toast } from 'react-toastify'

export const UserMessages = () => {
  const [posts, setPosts] = useState([{}])
  const { p } = useParams()
  const { whoamiActor } = useAuth()

  useEffect(() => {
    update()
  }, [whoamiActor])

  const update = () => {
    whoamiActor?.getAllUserMessage(Principal.fromText(p)).then((e) => {
      if (e.err) {
        toast.error(e.err)
      } else {
        setPosts(e.ok)
      }
    })
  }

  return (
    <div className='container justify-content-center'>
      {
        posts?.map((post) => {
          if (post.id) {
            const numId = BigInt(post.id)
            return <PostCard key={numId} id={numId} update={update} />
          }
          return ''
        })
      }
    </div>
  )
}
