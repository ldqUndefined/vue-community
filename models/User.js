const mongoose = require('mongoose')
const Schema = mongoose.Schema


const UserSchema = new Schema({
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    registerDate:{
        type:Date,
        default:Date.now
    },
    name:{
        type:String,
        default:'中大人_未命名'
    },
    avatar:{
        type:String,
        default:'http://localhost:5000/uploads/default.jpg'
    },
    identity:{
        type:Number,
        default:1
    },
    birthday:{
        type:Date
    },
    gender:{
        type:Number,
        min:0,
        max:1,
        default:1
    },
    selfDescription:{
        type:String,
        default:''
    },
    articles:[{
        type: Schema.Types.ObjectId,
        ref: 'article'
    }],
    comments:[{
        type: Schema.Types.ObjectId,
        ref: 'comment'
    }],
    follow:[{
        type:Schema.Types.ObjectId,
        ref:'user'
    }],
    fans:[{
        type:Schema.Types.ObjectId,
        ref:'user'
    }]
})

const User = mongoose.model('user',UserSchema)

module.exports = User