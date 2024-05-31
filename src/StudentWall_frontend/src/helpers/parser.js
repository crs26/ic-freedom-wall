export const messageToObj = (data) => {
  const obj = data
  obj.id = parseInt(data.id)
  obj.message.createdAt = parseInt(data.message.createdAt)
  obj.message.vote = parseInt(data.message.vote)
  data.message.image = blobToImage(data.message.image)
  data.creator.image = blobToImage(data.creator.image)
  data.message.creator = data.message.creator.toString()
  if (data.message.content.Image) obj.message.content.Image = blobToImage(data.message.content.Image)
  data.message.updatedAt = parseInt(data.message.updatedAt)
  for (let index = 0; index < data.message.comments.length; index++) {
    const element = data.message.comments[index]
    obj.message.comments[index].creator = element.creator.toString()
    obj.message.comments[index].createdAt = parseInt(element.createdAt)
    obj.message.comments[index].updatedAt = parseInt(element.updatedAt)
  }
  return obj
}

function blobToImage (b) {
  const blob = new global.Blob([b], { type: 'image/jpeg' })
  const urlCreator = window.URL || window.webkitURL
  const url = urlCreator.createObjectURL(blob)
  return url
}
