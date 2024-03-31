import dotenv from 'dotenv';
dotenv.config();
export const mongoDBURL = process.env.MONGO_URL;
export const unityClientSecret = process.env.UNITY_CLIENT_SECRET;
export const lateralMovementModule = "LATERAL_MOVEMENT"
export const game2Module = "GAME2"