import mongoose from "mongoose";
// Define User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    hashedPassword: String,
    mobileNo: String
});

// Define Patient Schema
const patientSchema = new mongoose.Schema({
    email: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    ailment: String,
    name: String
});

// Define Session Schema
const sessionSchema = new mongoose.Schema({
    date: Date,
    status: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient'
    },
    module: String
});

// Define LateralMovementSessionParams Schema
const lateralMovementSessionParamsSchema = new mongoose.Schema({
    sessionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    duration: Number,
    cubeGap: Number,
    speed: Number,
    isStanding: Boolean,
    targetSide: String,
    rightOffsetCentimeters: Number,
    leftOffsetCentimeters: Number,
    cubeScaleDecimeters: Number,
    spawningDistanceMetres: Number,
    spawnHeightDecimetres: Number,
    zThresholdInMetres: Number
});

// Define LateralMovementSessionData Schema
const lateralMovementSessionMetricsSchema = new mongoose.Schema({
    sessionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    score: Number,
    leftCubes: Number,
    rightCubes: Number,
    leftDodges: Number,
    rightDodges: Number,
    leftHits: Number,
    rightHits: Number
});

const game2SessionParamsSchema = new mongoose.Schema({
    sessionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
});

// Define LateralMovementSessionData Schema
const game2SessionMetricsSchema = new mongoose.Schema({
    sessionID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
    },
    score: Number
});

// Define models based on schemas
export const User = mongoose.model('User', userSchema);
export const Patient = mongoose.model('Patient', patientSchema);
export const Session = mongoose.model('Session', sessionSchema);
export const LateralMovementSessionParams = mongoose.model('LateralMovementSessionParams', lateralMovementSessionParamsSchema);
export const LateralMovementSessionMetrics = mongoose.model('LateralMovementSessionMetrics', lateralMovementSessionMetricsSchema);
export const Game2SessionParams = mongoose.model('Game2SessionParams', game2SessionParamsSchema);
export const Game2SessionMetrics = mongoose.model('Game2SessionMetrics', game2SessionMetricsSchema);
