import express from 'express';
import bodyParser from 'body-parser';

const router = express.Router();

router.use(bodyParser.json());

router.post('/create-session', (req, res) => {
    try {
        if (!!req.app.locals.sessionData) {
            return res.status(500).json({
                message: "Active session present. End it first"
            });
        }
        req.app.locals.sessionData = req.body.sessionData;
        req.app.locals.sessionData.sessionStatus = "RUNNING";
        res.json({
            message: "new session created",
            sessionData : req.app.locals.sessionData
        });
    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
});

router.post('/pause-session', (req, res) => {
    try {
        if (!req.app.locals.sessionData) {
            return res.status(500).json({
                message: "No active session"
            });
        }
        req.app.locals.sessionData.sessionStatus = "PAUSED";
        res.json({
            message: "session paused",
            sessionData: req.app.locals.sessionData
        });
    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
});

router.post('/resume-session', (req, res) => {
    try {
        if (!req.app.locals.sessionData) {
            return res.status(500).json({
                message: "No active session"
            });
        }
        req.app.locals.sessionData.sessionStatus = "RUNNING";
        res.json({
            message: "session resumed",
            sessionData: req.app.locals.sessionData
        });
    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
});

export default router;
