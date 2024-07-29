document.addEventListener('DOMContentLoaded', () => {
  const postForm = document.getElementById('postForm')
  const fileInput = document.getElementById('fileInput')
  const captionInput = document.getElementById('captionInput')
  const messagesContainer = document.getElementById('messages-container')

  async function fetchRenderPosts () {
    const response = await fetch('api/posts')
    const posts = await response.json()

    posts.forEach(post => {
      const imgUrl = post.imgUrl
      const content = post.content
      const contentDiv = document.createElement('div')
      const imgElement = document.createElement('img')
      const hr = document.createElement('hr')
      contentDiv.innerText = content
      imgElement.src = imgUrl

      messagesContainer.appendChild(contentDiv)
      messagesContainer.appendChild(imgElement)
      messagesContainer.appendChild(hr)
    })
  }

  fetchRenderPosts()

  postForm.addEventListener('submit', async (event) => {
    event.preventDefault()

    const file = fileInput.files[0]
    const caption = captionInput.value
    console.log(caption)

    const formData = new FormData()
    formData.append('image', file) // NodeList [ #text "image", file ]
    formData.append('caption', caption)

    console.log(formData)
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        const errorResponse = await response.json()
        alert(errorResponse.error || 'Unknown error occurred')
        return
      }

      const result = await response.json()
      console.log('Success:', result)
      // Reload the page after a successful POST
      location.reload()
    } catch (error) {
      console.error('Error:', error)
    }
  })
})
