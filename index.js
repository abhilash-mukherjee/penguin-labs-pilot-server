import express from 'express';
import bodyParser from 'body-parser';
const app = express()
const port = 3000

app.use(bodyParser.json())

var sessionData = null;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/current-session', (req, res) => {
    res.json({
        sessionData
    })
})
app.post('/create-session', (req, res) => {
    try {
        if (!!sessionData) {
            return res.status(500).json({
                message: "Active session present. End it first"
            })
        }
        sessionData = req.body.sessionData;
        sessionData.sessionStatus = "RUNNING";
        res.json({
            message: "new session created",
            sessionData
        })
    }
    catch (e) {
        res.status(500).json({
            message: e.message
        })
    }
})

app.post('/pause-session', (req, res) => {
    try {
        if (!sessionData) {
            return res.status(500).json({
                message: "No active session"
            })
        }
        sessionData.sessionStatus = "PAUSED";
        res.json({
            message: "session paused",
            sessionData
        })
    }
    catch (e) {
        res.status(500).json({
            message: e.message
        })
    }
})

app.post('/resume-session', (req, res) => {
    try {
        if (!sessionData) {
            return res.status(500).json({
                message: "No active session"
            })
        }
        sessionData.sessionStatus = "RUNNING";
        res.json({
            message: "session resumed",
            sessionData
        })
    }
    catch (e) {
        res.status(500).json({
            message: e.message
        })
    }
})


app.post('/end-session', (req, res) => {
    try {

        sessionData = null;
        res.json({
            message: "session ended",
            sessionData
        })
    }
    catch (e) {
        res.status(500).json({
            message: e.message
        })
    }
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})