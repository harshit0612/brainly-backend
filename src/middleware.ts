import { NextFunction,Request,Response } from "express";
import { JWT_SECRET } from "./index.js";
import jwt from 'jsonwebtoken';

// Extend Request type to include userId
export interface AuthRequest extends Request {
    userId?: string;
}

export const userMiddleware = (req: AuthRequest,res: Response,next: NextFunction)=> {
    const token = req.headers.authorization;

    if(token){
        jwt.verify(token,JWT_SECRET,(err,decoded)=>{
          
            if(err || !decoded){
                res.status(401).json({
                    message: "Unauthorized access"
                })
            }
            else{
             
                req.userId = (decoded as { userId: string }).userId;
            
                next();
            }
        })
    }
    else {
        res.status(401).send({
            message: "Unauthorized"
        })
    }
}