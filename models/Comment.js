const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema({
    user:{ type: Schema.Types.ObjectId, ref:'user', required:true},
    article:{ type: Schema.Types.ObjectId, ref:'article',required:true},
    content:{ type: String, required:true},
    create_at:{ type: Date, default:Date.now}
})

const Comments = mongoose.model('comment',CommentSchema)

module.exports = Comments