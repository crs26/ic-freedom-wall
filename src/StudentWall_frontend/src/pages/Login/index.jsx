import React, { useRef, useState } from 'react'
import Identity from '../../helpers/Identity'
import { useAuth } from '../../helpers/use-auth-client'
import { toast } from 'react-toastify'

export const LoginPage = () => {
  const { isAuthenticated, whoamiActor, principal, user } = useAuth()
  const [previewImage, setPreviewImage] = useState(null)
  const [imgBlob, setImgBlob] = useState(null)
  const MAX_FILE_SIZE = 1048576
  const userRef = useRef(null)
  const [userName, setuserName] = useState('')

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file && file.size <= MAX_FILE_SIZE) {
      const urlCreator = window.URL || window.webkitURL
      const url = urlCreator.createObjectURL(file)
      setPreviewImage(url)
      // Convert the selected image to a Blob

      // Perform upload logic with the Blob object
      const reader = new global.FileReader()
      reader.onloadend = () => {
        const arrayBuffer = reader.result
        console.log(arrayBuffer)
        const uint8Array = new Uint8Array(arrayBuffer)
        console.log('Array value:', uint8Array)
        setImgBlob(uint8Array)
      }
      reader.readAsArrayBuffer(file)
    } else {
      toast.error('File too large')
    }
  }

  const handleRegister = () => {
    whoamiActor.addUser(userRef.current.value, principal, imgBlob).then((e) => {
      toast('Succesfully Registered')
      window.location.replace('/')
    })
  }

  if (user?.name) window.location.replace('/')

  return (
    <div className='row d-flex justify-content-center align-items-center m-0' style={{ height: '90vh', width: '100vw' }}>
      <div className='col-10 col-md-8 col-xl-4'>
        <div className='card bg-dark'>
          <div className='card-header'>
            <h3 className='text-center text-main'>Login with Internet Identity</h3>
          </div>
          <div className='card-body'>
            <div className='row d-flex justify-content-center'>
              <h3 className='text-center'>User Registration</h3>
              <p className='text-center'>{user.principal}</p>
              <div className='col-8 text-center'>
                {previewImage && (
                  <img
                    src={previewImage}
                    alt='Preview'
                    className='img-preview mx-auto'
                    style={{ maxWidth: '10.0em', height: '10.0em', margin: '10px' }}
                  />
                )}
                <div className='input-group mb-3 d-flex'>
                  <input type='text' className='rounded my-1 username-reg col-12' placeholder='Username' ref={userRef} onChange={(e) => setuserName(e.target.value)} />
                  <div className='col-12 input-group-prepend'>
                    <label htmlFor='file-input' className='btn btn-primary w-50 col-md-6'>
                      Image
                    </label>
                    <input type='file' id='file-input' accept='image/*' className='col-6 btn btn-primary d-none' onChange={handleFileChange} />
                    <button className={`col-6 btn btn-primary w-50 col-md-6 ${imgBlob && userName.length ? '' : 'd-none'}`} disabled={!isAuthenticated && userName.length > 0} onClick={handleRegister}>Register</button>
                    <p className='text-light'>User display picture is reuired</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='row'>
              <Identity cusClass={`${user.principal ? '' : 'd-none'}`} />
            </div>
          </div>
          <div className='card-footer'>
            <p className='text-center my-auto'>Motoko Bootcamp @ 2023</p>
          </div>
        </div>
      </div>
    </div>
  )
}
