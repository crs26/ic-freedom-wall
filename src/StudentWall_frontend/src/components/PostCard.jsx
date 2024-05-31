import React, { useState, useEffect } from 'react'
import { BiUpvote, BiDownvote, BiTrash, BiPencil } from 'react-icons/bi'
import { Link } from '../../../../node_modules/react-router-dom/dist/index'
import { StudentWall_backend as backend } from '../../../declarations/StudentWall_backend'
import { useAuth } from '../helpers/use-auth-client'
import { Modal } from '../../../../node_modules/react-bootstrap/esm/index'
import { toast } from 'react-toastify'

export default function PostCard ({ id, commented, update }) {
  useEffect(() => {
    getUpdatedMessage(id)
    if (commented) {
      getUpdatedMessage(id)
    }
  }, [id, commented])

  const { principal, whoamiActor } = useAuth()
  const [post, setPost] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [postEdit, setPostEdit] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const upVote = async (id) => {
    setIsLoading(true)
    backend.upVote(id).then(() => {
      getUpdatedMessage(id)
      toast('Vote has been updated')
      setIsLoading(false)
    })
  }

  const downVote = async (id) => {
    setIsLoading(true)
    backend.downVote(id).then(() => {
      getUpdatedMessage(id)
      toast('Vote has been updated')
      setIsLoading(false)
    })
  }

  const deletePost = async (id) => {
    setIsLoading(true)
    backend.deleteMessage(id).then(result => {
      toast('Post has been deleted')
      setIsLoading(false)
      getUpdatedMessage(id)
    })
  }

  const editPost = () => {
    setIsLoading(true)
    if (postEdit?.content?.Text) {
      whoamiActor.updateMessage(id, postEdit?.text, { Text: postEdit?.content.Text }).then((result) => {
        getUpdatedMessage(id)
        setShowModal(false)
        toast('Post has been updated')
      })
    } else {
      whoamiActor.updateMessage(id, postEdit?.text, { Image: postEdit?.content?.Image }).then((result) => {
        getUpdatedMessage(id)
        setShowModal(false)
        toast('Post has been updated')
      })
    }
  }

  const getUpdatedMessage = async (id) => {
    backend.getMessage(id).then(m => {
      if (m.err) {
        toast.error(m.err)
      } else {
        setPost(m.ok)
      }
      update()
    })
  }

  const renderContent = () => {
    if (post?.message.content?.Text) {
      return (
        <p>{post.message.content.Text}</p>
      )
    } else {
      const blob = new global.Blob([post?.message.content?.Image], { type: 'image/jpeg' })
      const urlCreator = window.URL || window.webkitURL
      const url = urlCreator.createObjectURL(blob)
      return (
        <div className='col-12 col-lg-6'>
          <img src={url} className='w-100' />
        </div>
      )
    }
  }

  const renderEditContent = () => {
    if (postEdit?.content.Text) {
      return (
        <textarea
          name='text' placeholder={post?.content?.Text}
          defaultValue={postEdit?.content.Text}
          onChange={(e) => setPostEdit({ ...postEdit, content: { Text: e.target.value } })}
        />
      )
    } else {
      const blob = new global.Blob([post?.message.content?.Image], { type: 'image/jpeg' })
      const urlCreator = window.URL || window.webkitURL
      const url = urlCreator.createObjectURL(blob)
      return (
        <div className='col-6'>
          <img src={url} className='w-100' />
        </div>
      )
    }
  }

  const renderEditModal = () => {
    return (
      <>
        <Modal show={showModal} className='' centered onHide={() => setShowModal(false)}>
          <Modal.Header>
            <h5 className='modal-title'>Update Post</h5>
            <button type='button' className='primary-btn-danger close' onClick={() => setShowModal(false)}>
              <span aria-hidden='true'>&times;</span>
            </button>
          </Modal.Header>
          <Modal.Body className='px-5'>
            <div className='d-md-flex post-card my-3'>
              <div className='d-flex w-100 justify-content-between justify-content-md-start'>
                <div className='col-12 d-grid form-inputs'>
                  <input name='subject' type='text' placeholder='Pick a topic' className='mb-2' defaultValue={postEdit?.text} onChange={(e) => setPostEdit({ ...postEdit, text: e.target.value })} />
                  {renderEditContent()}
                  <div className='mx-auto col-12 col-md-3 col-lg-2 justify-content-end mt-3 d-flex w-100'>
                    <button className='primary-btn mt-2 my-md-auto' onClick={editPost}>Update Post</button>
                  </div>
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            Save Post
          </Modal.Footer>
        </Modal>
      </>
    )
  }

  const shortPrincipal = (p) => {
    if (p) return `${p.substring(0, 5)}...${p.substring(p.length - 3)}`
  }

  const toImage = (b) => {
    const blob = new global.Blob([b], { type: 'image/jpeg' })
    const urlCreator = window.URL || window.webkitURL
    return urlCreator.createObjectURL(blob)
  }

  const convertEpoch = (epoch) => {
    const x = new Date(0)
    const e = parseInt(parseInt(epoch[0]) / 1000000)
    x.setUTCMilliseconds(e)
    return x
  }

  if (!post) return ''
  return (
    <>
      <div className='px-2 mx-1'>
        <div className='row post-card my-3 justify-content-center'>
          <div className='col-12 col-md-12'>
            <div className='d-flex gap-2 text-left col my-auto'>
              <div className='my-auto'>
                <img src={toImage(post.creator.image) || '/user.png'} className='user-img my-auto' />
              </div>
              <div>
                <p className='m-0'>{post.creator.name}</p>
                <Link to={'/user/messages/' + post.message.creator.toString()}>{shortPrincipal(post.message.creator.toString())}</Link>
              </div>
            </div>
          </div>
          <div className='col-12'>
            <div className='row justify-content-center'>
              <div className='col-12 my-auto py-4'>
                <div className='row px-md-5'>
                  <Link to={`/comment/${id}`}>
                    <h5>{post?.message.text}</h5>
                    {renderContent()}
                  </Link>
                </div>
              </div>
              <hr className='text-light' />
              <div className='row text-white d-flex justify-content-end'>
                <div className='row justify-content-end mb-3'>
                  {post.message.updatedAt.length ? `Edited: ${convertEpoch(post.message.updatedAt)}` : `Posted: ${convertEpoch([post.message.createdAt])}`}
                </div>
                <div className='col-12 col-md-4 my-auto'>
                  <div className='row justify-content-center'>
                    <div className='col-5 text-center post-card-footer'>
                      <p>{Number(post?.message?.vote) > 0 ? Number(post?.message?.vote) : '0'} votes</p>
                    </div>
                    <div className='col-5 text-center post-card-footer'>
                      <Link to={`/comment/${id}`} state={post}>{post?.message?.comments?.length > 0 ? post?.message?.comments?.length : '0'} comments</Link>
                    </div>
                  </div>
                </div>

                <div className={`col-md-1 col-2 ${post?.message.creator.toString() === principal?.toString() ? 'd-block' : 'd-none'} ${isLoading ? 'pe-none' : ''}`}>
                  <BiPencil onClick={() => {
                    setPostEdit(post.message)
                    setShowModal(true)
                  }}
                  />
                </div>

                <div className={`col-md-1 col-2 ${post?.message.creator.toString() === principal?.toString() ? 'd-block' : 'd-none'} ${isLoading ? 'pe-none' : ''}`}>
                  <BiTrash onClick={() => Number(deletePost(id))} />
                </div>
                <div className={`col-md-1 col-2 ${isLoading ? 'pe-none' : ''}`}>
                  <BiUpvote onClick={() => Number(upVote(id))} disabled />
                </div>

                <div className={`col-md-1 col-2 ${isLoading ? 'pe-none' : ''}`}>
                  <BiDownvote onClick={() => Number(downVote(id))} />
                </div>

              </div>
              <div className='row justify-content-end px-0' />
            </div>
          </div>
        </div>
      </div>
      {renderEditModal()}
    </>
  )
}
