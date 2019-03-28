const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReportCommentSchema = new Schema({
    reporter:{//举报者
        type:Schema.Types.ObjectId,
        ref: 'user',
        required:true
    },
    reportedComment:{//被举报评论
        type:Schema.Types.ObjectId,
        ref: 'comment',
        required:true
    },
    reportDate:{
        type:Date,
        default:Date.now
    },
    reportType:{//举报类型0其他1广告2人身攻击3水贴
        type:String,
        default:'0'
    },
    additionalContent:{//追加内容
        type:String
    },
    processingState:{//处理状态，0未处理，1已处理
        type:String,
        default:'0'
    },
    dealDate:{
        type:Date
    }
})


const ReportComment = mongoose.model('reportComment',ReportCommentSchema)

module.exports = ReportComment