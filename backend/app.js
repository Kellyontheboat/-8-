const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const dotenv = require('dotenv');
const { uploadFile, getObjectSignedUrl } = require('./services/s3.js');
const db = require('./models');

dotenv.config();
console.log("CURRENT NODE_ENV:", process.env.NODE_ENV);

const app = express();
const port = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

const Message = db.Message;

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

// !file path:local
// app.use(express.static(path.join(__dirname, '../frontend/public')))

// !file path:local docker
// const pathToPublic = path.join(__dirname, '../app/frontend/public');
// console.log('Path to public:', pathToPublic);
// app.use(express.static(pathToPublic));

// !file path:EC2 docker
const pathToPublic = path.join(__dirname, '../frontend/public');
console.log('Path to public:', pathToPublic);
app.use(express.static(pathToPublic));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'))
})

app.get('/api/posts', async (req, res) => {
  const messages = await Message.findAll({
    order: [['createdAt', 'DESC']],
    raw: true // Use raw:true to get plain js object directly
  })

  // Add imgUrl to each plain message
  const messagesWithImgUrl = await Promise.all(messages.map(async (message) => {
    message.imgUrl = "https://d348uiae81km7c.cloudfront.net/"+message.img
    return message
  }))

  res.json(messagesWithImgUrl)
})

app.post('/api/posts', upload.single('image'), async (req, res) => {
  const content = req.body.caption
  const img = req.file
  console.log('content:', content)
  console.log('img:', img)
  const imageName = generateFileName()

  const message = await Message.create({ content, img: imageName })
  await uploadFile(imageName, img.buffer, img.mimetype)

  res.status(201).send(message)
})

// HTTPS setup
const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/www.good-msg.xyz/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/www.good-msg.xyz/fullchain.pem'),
};

https.createServer(options, app).listen(port, () => {
  console.log(`Express server is running on https://localhost:${port}`);
});
