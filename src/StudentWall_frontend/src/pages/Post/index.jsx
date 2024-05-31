import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import NewPostCard from '../../components/NewPostCard'
import PostCard from '../../components/PostCard'
import { useAuth } from '../../helpers/use-auth-client'
import { setPosts } from '../../app/postSlice'
import { messageToObj } from '../../helpers/parser'

export const Post = () => {
  const [editPost, setEditPost] = useState({})
  const { isAuthenticated, user, whoamiActor } = useAuth()
  const posts = useSelector(state => state.post.value)
  const dispatch = useDispatch()
  useEffect(() => {
    update()
  }, [isAuthenticated])

  const update = () => {
    if (posts.length > 0) {
      return
    }
    whoamiActor?.getPostCount().then(async (e) => {
      const postArray = []
      for (let i = 0; i < e; i++) {
        const p = await whoamiActor?.getMessageByRank(i)
        if (p.err) {
          console.log(p.err)
        } else {
          postArray.push(messageToObj(p.ok))
        }
      }
      dispatch(setPosts(postArray))
    })
  }

  return (
    <div className='container justify-content-center'>
      {isAuthenticated && user?.name ? <NewPostCard update={update} setEditPost={setEditPost} id={editPost?.id} subject={editPost?.subject} body={editPost?.text} edit={editPost?.edit} /> : ''}
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
