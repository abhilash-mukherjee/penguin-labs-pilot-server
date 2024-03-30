// unityClient.js

import express from 'express';
import bodyParser from 'body-parser';

const router = express.Router();
router.use(bodyParser.json());


router.get('/current-session', (req, res) => {
    res.json({
        sessionData: req.app.locals.sessionData
    });
});

router.post('/end-session', (req, res) => {
    try {
        req.app.locals.sessionData = null;
        res.json({
            message: "session ended",
            sessionData: req.app.locals.sessionData
        });
    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
});

export default router;
