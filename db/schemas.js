import mongoose from "mongoose";

// Define User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    mobileNo: { type: String, required: true }
});



// Define Session Schema
const sessionSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    status: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    module: { type: String, required: true },
    patientName: { type: String, required: true },
    ailment: { type: String, required: true },
    patientEmail: { type: String },
});

// Define LateralMovementSessionParams Schema
const lateralMovementSessionParamsSchema = new mongoose.Schema({
    sessionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    duration: { type: Number, required: true },
    cubeGap: { type: Number, required: true },
    speed: { type: Number, required: true },
    isStanding: { type: Boolean, required: true },
    targetSide: { type: String, required: true },
    rightOffsetCentimeters: { type: Number, required: true },
    leftOffsetCentimeters: { type: Number, required: true },
    cubeScaleDecimeters: { type: Number, required: true },
    spawningDistanceMetres: { type: Number, required: true },
    spawnHeightDecimetres: { type: Number, required: true },
    zThresholdInMetres: { type: Number, required: true },
    environment: {type: Number }
});

// Define LateralMovementSessionData Schema
const lateralMovementSessionMetricsSchema = new mongoose.Schema({
    sessionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    score: { type: Number, required: true },
    leftCubes: { type: Number, required: true },
    rightCubes: { type: Number, required: true },
    leftDodges: { type: Number, required: true },
    rightDodges: { type: Number, required: true },
    leftHits: { type: Number, required: true },
    rightHits: { type: Number, required: true }
});

const boxSchema = new mongoose.Schema({
    boxX: { type: Number, required: true },
    boxZ: { type: Number, required: true },
    label: { type: String, required: true },
    colorLight: { type: String, required: true },
    colorDark: { type: String, required: true }
});

const sphereSchema = new mongoose.Schema({
    spawnCentreX: { type: Number, required: true },
    spawnCentreZ: { type: Number, required: true },
    zoneWidth: { type: Number, required: true },
    color: { type: String, required: true },
    label: { type: String, required: true }
});

// Define Game2SessionParams Schema
const grabAndReachoutParamsSchema = new mongoose.Schema({
    sessionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    targetHand: { type: String, required: true },
    reps: { type: Number, required: true },
    boxes: [boxSchema],
    spheres: [sphereSchema]
});

// Define Game2SessionMetrics Schema
const grabAndReachoutMetricsSchema = new mongoose.Schema({
    sessionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    score: { type: Number, required: true }
});


// Define models based on schemas
export const User = mongoose.model('User', userSchema);
export const Session = mongoose.model('Session', sessionSchema);
export const LateralMovementSessionParams = mongoose.model('LateralMovementSessionParams', lateralMovementSessionParamsSchema);
export const LateralMovementSessionMetrics = mongoose.model('LateralMovementSessionMetrics', lateralMovementSessionMetricsSchema);
export const GrabAndReachoutParams = mongoose.model('GrabAndReachoutParams', grabAndReachoutParamsSchema);
export const GrabAndReachoutMetrics = mongoose.model('GrabAndReachoutMetrics', grabAndReachoutMetricsSchema);
