import React, { useState } from 'react'

const ImageUploader = () => {
  const [image, setImage] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    const reader = new global.FileReader()

    reader.onloadend = () => {
      const imageData = new global.Blob([reader.result], { type: file.type })
      setImage(imageData)
    }

    if (file) {
      reader.readAsArrayBuffer(file)
    }
  }

  const handleUpload = () => {
    // Here, you can perform your upload logic using the image Blob
    // For example, you can send it to a server using Axios or fetch()

    // Example using fetch():
    fetch('https://example.com/upload', {
      method: 'POST',
      body: image
    })
      .then((response) => {
        // Handle the response from the server
      })
      .catch((error) => {
        // Handle any errors that occur during the upload
        console.log(error)
      })
  }

  return (
    <div>
      <input type='file' accept='image/*' onChange={handleImageChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  )
}

export default ImageUploader
