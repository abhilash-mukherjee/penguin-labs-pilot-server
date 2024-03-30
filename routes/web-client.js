import express from 'express';
import bodyParser from 'body-parser';
import { User, Patient, Session, LateralMovementSessionParams, Game2SessionParams} from '../db/schemas.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { auth } from '../middlewares/middlewares.js';
import { game2Module, lateralMovementModule } from '../helpers/stringConstants.js';
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
        if (!patientDetails || !patientDetails.email || !patientDetails.name || !patientDetails.ailment) {
            return res.status(400).json({ message: "Invalid patient details" });
        }
        if (!sessionParams) {
            return res.status(400).json({ message: "Session parameters are required" });
        }

        // Check if the patient with corresponding email exists, if not, create the patient and save it in db
        let patient = await Patient.findOne({ email: patientDetails.email });
        if (!patient) {
            patient = new Patient({
                email: patientDetails.email,
                createdBy: userId,
                ailment: patientDetails.ailment,
                name: patientDetails.name
            });
            await patient.save();
        }

        // Refactor common logic outside conditional blocks
        if (sessionData.module === lateralMovementModule || sessionData.module === game2Module) {
            let sessionParamsSchema, SessionParamsModel;

            if (sessionData.module === lateralMovementModule) {
                sessionParamsSchema = LateralMovementSessionParams;
                SessionParamsModel = LateralMovementSessionParams;
            } else if (sessionData.module === game2Module) {
                sessionParamsSchema = Game2SessionParams;
                SessionParamsModel = Game2SessionParams;
            }

            try {
                // Validate session params based on the module
                const sessionParamsObject = new sessionParamsSchema(sessionData.sessionParams);
                await sessionParamsObject.validate();
            } catch (error) {
                return res.status(400).json({ message: `Invalid session parameters for ${sessionData.module}` });
            }


            // Create a new session object
            const newSession = new Session({
                date: new Date(),
                status: "NOT_STARTED",
                createdBy: userId,
                patient: patient._id,
                module: sessionData.module
            });
            await newSession.save();

            // Create a session params object
            const sessionParams = new SessionParamsModel({
                sessionID: newSession._id,
                ...sessionData.sessionParams
            });
            await sessionParams.save();

            req.app.locals.sessionData = { ...sessionData, id: String(newSession._id) };
            
            console.log(`New ${sessionData.module} session created. \nData: `, req.app.locals.sessionData);

            return res.json({ message: `New ${sessionData.module} session created`, sessionData: req.app.locals.sessionData });
        }
        
        else{
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
        req.app.locals.sessionData.sessionStatus = "PAUSED";

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
        req.app.locals.sessionData.sessionStatus = "RUNNING";

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

export default router;
