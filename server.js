import express from "express"
import dotenv from "dotenv";
import { errorHandler } from "./middleware/errorHandler.js";

import cors from 'cors';
import closetRouter from './routes/closet.routes.js'
import outfitRouter from './routes/outfitState.routes.js'
import connectDB from "./config/db.js";
const server = express();
server.use(cors());

//{ origin: 'http://localhost:5173', credentials: true }

dotenv.config();
server.use(express.json());

//Routers

server.use("/api/closet" , closetRouter)
server.use("/api/outfit" , outfitRouter)



//errors
server.use(errorHandler);

const PORT = process.env.PORT ;
connectDB().then(()=>{
    console.log("connected to mongoo!")
    server.listen(PORT, ()=>
    console.log(`Server online at port ${PORT}`)
    )
})