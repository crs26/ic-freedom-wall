import React, { useRef, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../helpers/use-auth-client'

export default function NewComment ({ postId, update, setCommented, commented }) {
  const inText = useRef()
  const { whoamiActor, user } = useAuth()
  const [isLoading, setisLoading] = useState(false)

  const addComment = () => {
    setisLoading(true)
    whoamiActor.writeComment(inText.current.value, postId).then((e) => {
      console.log(e)
      if (!e.err) {
        update()
        setCommented(!commented)
        inText.current.value = ''
        toast.success('Comment added')
      } else {
        toast.error(e.rr)
      }
      setisLoading(false)
    })
  }

  return (
    <div className='d-md-flex justify-content-center post-card my-3' style={{ position: 'relative' }}>
      <div className='row w-100 mx-auto justify-content-between'>
        <div className='col-12 mb-2'>
          <div className='d-flex gap-2 text-left col my-auto'>
            <div className='my-auto'>
              <img src={user.image || '/user.png'} className='user-img my-auto' />
            </div>
            <div className='my-auto'>
              <p className='m-0'>{user.name}</p>
              <p className='m-0'>{user.principalShort}</p>
            </div>
          </div>
        </div>
        <div className='col-12 d-grid form-inputs'>
          <textarea
            placeholder='What do you think?'
            className='ms-2 ms-lg-0 mx-md-2'
            ref={inText}
          />
        </div>
      </div>
      <div className='mx-auto col-12 col-md-3 col-lg-2 d-flex justify-content-end comment-btn-area'>
        <button className='primary-btn mt-2 my-md-auto px-3' onClick={addComment} disabled={isLoading}>Comment</button>
      </div>
    </div>
  )
}
