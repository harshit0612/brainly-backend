import express from 'express';
import bcrypt, { hash } from 'bcrypt'
import Jwt from 'jsonwebtoken';
import {z} from 'zod';
import { userModel, contentModel, linkModel, tagModel } from './db';
export const JWT_SECRET: string = "fwgedgwvsnbjhabsvvsvc";
import { userMiddleware } from './middleware';
import { random } from './utils';
import {} from './override';
import {AuthRequest} from './middleware';
import corsMiddleware from "cors";
const app = express();
app.use(express.json()); 
app.use(corsMiddleware());

//zod validation
const UserValidType = z.object({
    username : z.string().min(3).max(10, "username should be 3-10 letters"),
    password : z.string().min(8).max(20,"Password should be 8 to 20 letters")
})

app.post('/api/v1/signup',async (req,res)=> {
    try{
        const userData = UserValidType.parse(req.body);
    }
    catch(err){
        res.status(400).json({
            message: "Input are not valid"
        }); 
    }
    try{
        const username = req.body.username;
        const password = req.body.password;
        const userExist = await userModel.findOne({
            username : username
        })
        if(userExist){
            res.status(403).json({
                message : "Username already taken"
            })
            return;
        }
        const hashedPassword = await bcrypt.hash(password,10);

        await userModel.create({
            username: username,
            password: hashedPassword
        })
        res.status(200).json({
            message: "You are signup"
        });

    }
    catch(e){
        res.status(500).json({
            message : "Internal server Error!!!"
        })
    }
    
 
})

app.post('/api/v1/signin',async (req,res)=>{
    try{
        const username = req.body.username;
        const password = req.body.password;

        const user = await userModel.findOne({
            username : username
        })
    
        if(user){
            const passwordMatched = await bcrypt.compare(password,user.password);
            if(passwordMatched){
                const token = Jwt.sign({
                    userId: user._id.toString()
                },JWT_SECRET);
                res.json({
                    token
                })
            }
            
            else{
                res.send(403).json({
                    message : "Incorrect password"
                })
            }
            
        }
        else{
            res.json({
                message: "User does't exists"
            })
        }
    }
    catch(error){
        res.status(500).json({
            message: "Internal server error"
        })
    }

})



app.post('/api/v1/content',userMiddleware,async (req:AuthRequest,res)=>{
    try{
        const link = req.body.link;
       
        const title = req.body.title;
      
        const type = req.body.type;
     
        // const tags = req.body.tags;
     

        await contentModel.create({
            link,
            type,
            title,
            userId : req.userId,
            tags : []
        })
    

        res.json({
            message : "Content added Successfully!!!"
        })
    }
    catch(e){
        res.json({
            message : "Internal Server error"
        })
    }

})


app.get('/api/v1/content',userMiddleware,async (req: AuthRequest,res)=>{
    const userId = req.userId;
    try {
        const content = await contentModel.find({ userId }).populate("userId", "username");
      
        res.json({
            content: content
        })
    } 
    catch (error) {
        res.json({
            message: "Error while fetching content!!"
        })
    }    
})

app.delete('/api/v1/content', userMiddleware, async (req: AuthRequest, res): Promise<void> => {
    const { contentId } = req.query;

    if (!contentId) {
        res.status(400).json({ error: "Content ID is required" });
        return; 
    }

    try {
        await contentModel.deleteOne({
            contentId,
            userId: req.userId,
        });

        res.json({ message: "Content deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
});


app.post('/api/v1/brain/share',userMiddleware,async (req,res)=>{
    const share = req.body.share;
    if(share){
        const existingLink = await linkModel.findOne({
            UserId: req.userId
        })
        if(existingLink){  
            res.json({
                hash: existingLink.hash
            })
            return;
        }
        const hash = random(10);
        await linkModel.create({
            UserId: req.userId,
            hash: hash
        })
        res.json({
            hash : hash
        })
    }
    else{
        await linkModel.deleteOne({
            UserId: req.userId
        })
        res.json({
            message : "Updated shareable link"
        })
    }
    
})

app.get('/api/v1/brain/:shareLink',async (req,res)=>{
    const hash = req.params.shareLink;
 

    const link = await linkModel.findOne({
        hash
    });
  
    if(!link){
        res.json({
            message: "Invalid link"
        })
        return;
    }
  
    const content = await contentModel.find({
        userId : link.UserId
    })
 
    const user = await userModel.findOne({
        _id: link.UserId
    })
   
    if(!user){
        res.status(411).json({
            message: "User not found!!!"
        })
        return;
    }

    res.json({
        username: user.username,
        content: content
    }) 
})


app.listen(4000);

