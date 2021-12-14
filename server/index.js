const PORT = 8000
const express = require('express')
const bcrypt = require('bcrypt')
const { v1: uuidv1} = require('uuid')
const { connect } = require('getstream')
const StreamChat = require('stream-chat').StreamChat
const app = express()
const cors = require('cors')
app.use(cors())
app.use(express.json())



//sign up
app.post('/signup', async (req,res) => {
    try {
        const { username, password } = req.body

        const userId = uuidv1()
        const hashedPassword = await bcrypt.hash(password, 10)
        const client = connect(process.env.API_KEY, process.env.API_SECRET, process.env.APP_ID)
        const token = client.createUserToken(userId)

        res.status(200).json({ username, userId, hashedPassword, token})

        console.log(username, password)
    } catch (error) {
        console.log(error)

        res.status(500).json({message: error})
    }
})


//login
app.post('/login', async (req,res) => {
    try {
        const { username, password } = req.body
        const client = connect(process.env.API_KEY, process.env.API_SECRET, process.env.APP_ID)
        const chatClient = StreamChat.getInstance(process.env.API_KEY, process.env.API_SECRET)
        const { users} = await chatClient.queryUsers({ name: username })

        if (!users.length) return res.json(400).json({ message: 'User does not exist'})

        const success = await bcrypt.compare(password, users[0].hashedPassword)
        const token = client.createUserToken(users[0].id)
        const confirmedName = users[0].name
        const userId = users[0].id

        if (success) {
            res.status(200).json({ token, username: confirmedName, userId })
        } else {
            res.status(500).json({ message: 'Login failed'})
        }


    } catch (error) {
        console.log(error)
        res.status(500).json({message: error})
    }
})


app.listen(PORT, () => console.log('Server running on PORT ' + PORT))