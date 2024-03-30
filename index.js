import express from 'express';
import mongoose from 'mongoose';
import unityClientRouter from './routes/unity-client.js';
import webClientRouter from './routes/web-client.js';
import { mongoDBURL } from './helpers/stringConstants.js';

const app = express();
const port = 3000;

let sessionData;
export {sessionData};

app.use('/unity-client', unityClientRouter);
app.use('/web-client', webClientRouter);

app.get("/", (req,res) => res.json({message: "Hello world"}));

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

mongoose.connect(mongoDBURL).then(() => console.log("mongoose connected :", mongoDBURL));
