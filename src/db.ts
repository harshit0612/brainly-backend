import {connect, model ,Types,Schema} from 'mongoose';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
mongoose.connect(process.env.MONGO_URL!);

export const UserSchema = new Schema({
    username: {type:String,unique:true,required:true},
    password: {type:String,required: true}
})


 
export const contentTypes = ['image','youtube','twitter','audio'];

export const ContentSchema = new Schema({
    link: {type:String,required: true},
    type: {type:String,enum:contentTypes, required: true},
    title: {type:String,required: true},
    tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'tag',require:false}],
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true}
})

export const tagSchema = new Schema({
    title: {type:String,required:true}
})

export const linkSchema = new Schema({
    hash: {type:String, required: true ,unique: true},
    UserId: {type:mongoose.Schema.Types.ObjectId, ref: 'user', required: true}
})

export const userModel = model("user",UserSchema);
export const contentModel = model("content",ContentSchema);
export const tagModel = model("tag",tagSchema);
export const linkModel = model("link",linkSchema);

