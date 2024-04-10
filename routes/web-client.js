import express from 'express';
import bodyParser from 'body-parser';
import { User, Session, LateralMovementSessionParams, GrabAndReachoutParams, LateralMovementSessionMetrics, GrabAndReachoutMetrics } from '../db/schemas.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../middlewares/middlewares.js';
import { GrabAndReachoutModule as grabAndReachoutModule, lateralMovementModule } from '../helpers/stringConstants.js';
import { getSessionFilterForDateString } from '../helpers/methods.js';
const router = express.Router();
router.use(bodyParser.json());


router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, mobileNo } = req.body;

        // Validate input fields
        if (!name || !email || !password || !mobileNo) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            name,
            email,
            hashedPassword,
            mobileNo
        });

        // Save the user to the database
        await newUser.save();

        // Create and send JWT token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET);
        res.json({ message: "User created successfully", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input fields
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.hashedPassword);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Create and send JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



router.post('/create-session', auth, async (req, res) => {
    try {
        // Validate request body structure
        const { sessionData } = req.body;
        if (!sessionData || !sessionData.module || !sessionData.sessionParams) {
            return res.status(400).json({ message: "Invalid request body structure" });
        }

        // Check if a session is running
        if (!!req.app.locals.sessionData) {
            return res.status(400).json({ message: "Another session is active" });
        }

        // Get user based on the user id present in header
        const userId = req.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if all other params are supplied correctly
        const { patientDetails, sessionParams } = sessionData;
        if (!patientDetails || !patientDetails.name || !patientDetails.ailment) {
            return res.status(400).json({ message: "Invalid patient details" });
        }
        if (!sessionParams) {
            return res.status(400).json({ message: "Session parameters are required" });
        }


        if (sessionData.module === lateralMovementModule || sessionData.module === grabAndReachoutModule) {
            let SessionParamsModel;
            if (sessionData.module === lateralMovementModule) {
                SessionParamsModel = LateralMovementSessionParams;
            } else if (sessionData.module === grabAndReachoutModule) {
                SessionParamsModel = GrabAndReachoutParams;
            }

            // Create a new session object
            const newSession = new Session({
                date: new Date(),
                status: "NOT_STARTED",
                createdBy: userId,
                module: sessionData.module,
                patientName: patientDetails.name,
                patientEmail: patientDetails.email,
                ailment: patientDetails.ailment
            });
            await newSession.save();

            // Create a session params object
            const sessionParams = new SessionParamsModel({
                sessionID: newSession._id,
                ...sessionData.sessionParams
            });
            try {
                const savedParam = await sessionParams.save();
                console.log("params saved:",savedParam);
            }
            catch (e) {
                return res.status(400).json({ message: e.message });
            }

            req.app.locals.sessionData = { ...newSession.toObject(), id: String(newSession._id), sessionParams: {...sessionParams.toObject()} };

            console.log(`New ${sessionData.module} session created. \nData: `, req.app.locals.sessionData);

            return res.json({ message: `New ${sessionData.module} session created`, sessionData: req.app.locals.sessionData });
        }

        else {
            return res.status(400).json({ message: "Module does not exist" });
        }

        // Handle other module types if needed

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/pause-session', auth, async (req, res) => {
    try {
        const { id } = req.body;

        // Check if sessionData exists locally
        if (!req.app.locals.sessionData) {
            return res.status(500).json({ message: "No active session" });
        }

        // Check if the id passed matches with the ID of the current sessionData stored locally
        if (req.app.locals.sessionData.id !== id) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        // Update session status to "PAUSED" in the local sessionData
        req.app.locals.sessionData.status = "PAUSED";

        // Update session status in the database
        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        session.status = "PAUSED";
        await session.save();

        return res.json({ message: "Session paused", sessionData: req.app.locals.sessionData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/resume-session', auth, async (req, res) => {
    try {
        const { id } = req.body;

        // Check if sessionData exists locally
        if (!req.app.locals.sessionData) {
            return res.status(500).json({ message: "No active session" });
        }

        // Check if the id passed matches with the ID of the current sessionData stored locally
        if (String(req.app.locals.sessionData.id) !== id) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        // Update session status to "RUNNING" in the local sessionData
        req.app.locals.sessionData.status = "RUNNING";

        // Update session status in the database
        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        session.status = "RUNNING";
        await session.save();

        return res.json({ message: "Session resumed", sessionData: req.app.locals.sessionData });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/end-session', auth, async (req, res) => {
    try {
        const { id } = req.body;

        // Check if sessionData exists locally
        if (!req.app.locals.sessionData) {
            return res.status(500).json({ message: "No active session" });
        }

        // Check if the id passed matches with the ID of the current sessionData stored locally
        if (String(req.app.locals.sessionData.id) !== id) {
            return res.status(400).json({ message: "Invalid session ID" });
        }

        // Set locally stored sessionData to null
        req.app.locals.sessionData = null;

        // Update session status to "ENDED" in the database
        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        session.status = "ENDED";
        await session.save();

        return res.json({ message: "Session ended" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/sessions', auth, async (req, res) => {
    try {
        let { sortBy, module, patientName, limit, date, email } = req.query;
        const userId = req.userId; // Assuming auth middleware adds userId

        // Set default values if parameters are not provided
        if (!sortBy) {
            sortBy = 'desc'; // Default sort by descending creation date
        }
        if (!limit) {
            limit = 10; // Default number of sessions to return
        } else {
            limit = parseInt(limit);
        }

        // Build filter object based on query parameters
        const filter = {
            createdBy: userId // Filter sessions by user ID
        };

        if (date) {
            filter.date = getSessionFilterForDateString(date);
        }

        if (module) {
            filter.module = module;
        }
        if (patientName) {
            filter.patientName = patientName; // Directly filter by patient name
        }
        if (email) {
            filter.patientEmail = email; // Directly filter by patient email
        }

        // Apply sorting based on sortBy parameter
        let sortOption = { date: -1 }; // Default sort by descending creation date
        if (sortBy === 'asc') {
            sortOption = { date: 1 }; // Sort by ascending creation date
        }

        // Fetch sessions from DB based on filter and sorting
        const sessions = await Session.find(filter)
            .sort(sortOption)
            .limit(limit);

        res.json({ sessions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/session-details', auth, async (req, res) => {
    try {
        const { id } = req.query;

        // Check if ID is passed
        if (!id) {
            return res.status(400).json({ message: 'Session ID is required' });
        }

        // Try fetching the session with the provided ID from the database
        const session = await Session.findById(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Initialize session data object
        const sessionData = { ...session.toObject() };

        // Fetch corresponding session params and metrics based on the module
        let sessionParams = null;
        let sessionMetrics = null;
        if (sessionData.module === lateralMovementModule) {
            sessionParams = await LateralMovementSessionParams.findOne({ sessionID: id });
            sessionMetrics = await LateralMovementSessionMetrics.findOne({ sessionID: id });
        } else if (sessionData.module === grabAndReachoutModule) {
            sessionParams = await GrabAndReachoutParams.findOne({ sessionID: id });
            sessionMetrics = await GrabAndReachoutMetrics.findOne({ sessionID: id });
        }

        // Construct the response JSON
        const responseData = {
            sessionData,
            sessionParams: sessionParams ? sessionParams.toObject() : {},
            sessionMetrics: sessionMetrics ? sessionMetrics.toObject() : {}
        };

        // Return the response JSON
        res.json(responseData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(400).json({ message: "user not found" });
        const userDetails = { ...user.toObject() };
        return res.json({ userDetails });
    }
    catch (e) {
        res.status(500).json({ message: error.message });

    }
})

router.get('/current-session', auth, (req, res) => {
    res.json({
        sessionData: req.app.locals.sessionData
    });
});

export default router;
