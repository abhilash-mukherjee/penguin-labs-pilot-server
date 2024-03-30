import mongoose from "mongoose";

// Define User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    mobileNo: { type: String, required: true }
});

// Define Patient Schema
const patientSchema = new mongoose.Schema({
    email: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ailment: { type: String, required: true },
    name: { type: String, required: true }
});

// Define Session Schema
const sessionSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    status: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    module: { type: String, required: true },
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
    zThresholdInMetres: { type: Number, required: true }
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

// Define Game2SessionParams Schema
const game2SessionParamsSchema = new mongoose.Schema({
    sessionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    targetSide: { type: String, required: true },
});

// Define Game2SessionMetrics Schema
const game2SessionMetricsSchema = new mongoose.Schema({
    sessionID: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
    score: { type: Number, required: true }
});


// Define models based on schemas
export const User = mongoose.model('User', userSchema);
export const Patient = mongoose.model('Patient', patientSchema);
export const Session = mongoose.model('Session', sessionSchema);
export const LateralMovementSessionParams = mongoose.model('LateralMovementSessionParams', lateralMovementSessionParamsSchema);
export const LateralMovementSessionMetrics = mongoose.model('LateralMovementSessionMetrics', lateralMovementSessionMetricsSchema);
export const Game2SessionParams = mongoose.model('Game2SessionParams', game2SessionParamsSchema);
export const Game2SessionMetrics = mongoose.model('Game2SessionMetrics', game2SessionMetricsSchema);
