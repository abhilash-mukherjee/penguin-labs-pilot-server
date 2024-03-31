import express from 'express';
import bodyParser from 'body-parser';
import { unityClientAuth } from '../middlewares/middlewares.js';
import { Game2SessionMetrics, LateralMovementSessionMetrics, Session } from '../db/schemas.js';
import { game2Module, lateralMovementModule } from '../helpers/stringConstants.js';

const router = express.Router();
router.use(bodyParser.json());


router.get('/current-session', unityClientAuth, (req, res) => {
    res.json({
        sessionData: req.app.locals.sessionData
    });
});

router.post('/end-session', unityClientAuth, async (req, res) => {
    try {
        if(!req.app.locals.sessionData){
            return res.status(400).json({message: "no active session"});
        }
        const session = await Session.findById(req.app.locals.sessionData.id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        session.status = "ENDED";
        await session.save();
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

router.post('/metrics', unityClientAuth, async (req, res) => {
    try {
        const { id, sessionMetrics } = req.body;
        let existingSession;
        if (!!id && !!sessionMetrics) {
            existingSession = await Session.findById(id);
            if(!existingSession) return res.status(400).json({ message: 'No session with this id' });
        }
        else {
            return res.status(400).json({ message: 'No session id or sessionMetrics passed' });
        }

        // Save session metrics based on the module of the local session
        if (existingSession.module === lateralMovementModule) {
            const lateralMovementMetrics = new LateralMovementSessionMetrics({
                sessionID: id,
                ...sessionMetrics
            });
            await lateralMovementMetrics.save();
            return res.json({ message: 'Session metrics saved', metrics: lateralMovementMetrics });
        } else if (existingSession.module === game2Module) {
            const game2Metrics = new Game2SessionMetrics({
                sessionID: id,
                ...sessionMetrics
            });
            await game2Metrics.save();
            return res.json({ message: 'Session metrics saved', metrics: game2Metrics });
        } else {
            return res.status(400).json({ message: 'Invalid session module' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


export default router;
