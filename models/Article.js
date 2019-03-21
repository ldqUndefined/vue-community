const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArticleSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    author:{//关联user
        type:Schema.Types.ObjectId,
        ref: 'user',
        required:true
    },
    publishTime:{
        type:Date,
        default:Date.now
    },
    articleType:{
        type:String,//1分享 2提问
        default:'1'
    },
    comments:[{//关联评论
        type:Schema.Types.ObjectId,
        ref: 'comment'
    }],
    likes:{
        type:Number,
        default:0
    },
    browseNum:{
        type:Number,
        default:0
    },
    lastCommentAt:{
        type:Date,
        default:Date.now
    }
})

const Article = mongoose.model('article',ArticleSchema)

module.exports = Article