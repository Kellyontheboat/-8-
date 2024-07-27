const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const dotenv = require('dotenv')
dotenv.config()

const bucketName = process.env.AWS_BUCKET_NAME
const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
})

const uploadFile = async (fileName, fileContent, mimetype) => {
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
    ContentType: mimetype // 'image/jpeg'
  }
  try {
    const result = await s3Client.send(new PutObjectCommand(uploadParams))
    console.log('Upload Success:', result)
    return result
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

const getObjectSignedUrl = async (fileName) => {
  const params = {
    Bucket: bucketName,
    Key: fileName
  }

  // https://aws.amazon.com/tw/blogs/developer/generate-presigned-url-modular-aws-sdk-javascript/
  const command = new GetObjectCommand(params)
  const seconds = 30
  const url = await getSignedUrl(s3Client, command, { expiresIn: seconds })

  return url
}

module.exports = { uploadFile, getObjectSignedUrl }
