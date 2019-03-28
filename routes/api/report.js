const express = require('express')
const router = express.Router()

const ReportArticle = require('../../models/ReportArticle')
const ReportComment = require('../../models/ReportComment')

router.post('/article',(req,res) => {
    ReportArticle.findOne({reporter:req.body.reporter,reportedArticle:req.body.reportedArticle})
        .then((theReport) => {
            if(theReport){
                res.json({
                    statusCode:'5000',
                    description:'你已经举报过该文章'
                })
            }else{
                let newReportArticle = new ReportArticle({
                    reporter:req.body.reporter,
                    reportedArticle:req.body.reportedArticle,
                    reportType:req.body.reportType,
                    additionalContent:req.body.additionalContent
                })
                newReportArticle.save()
                    .then((reportarticle) => {
                        res.json({
                            statusCode:'0000',
                            description:'举报成功'
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        })
        .catch((err) => {
            console.log(err)
        })
})


router.post('/comment',(req,res) => {
    ReportComment.findOne({reporter:req.body.reporter,reportedComment:req.body.reportedComment})
        .then((theReport) => {
            if(theReport){
                res.json({
                    statusCode:'5000',
                    description:'你已经举报过该评论'
                })
            }else{
                let newReportComment = new ReportComment({
                    reporter:req.body.reporter,
                    reportedComment:req.body.reportedComment,
                    reportType:req.body.reportType,
                    additionalContent:req.body.additionalContent
                })
                newReportComment.save()
                    .then((reportcomment) => {
                        res.json({
                            statusCode:'0000',
                            description:'举报成功'
                        })
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        })
        .catch((err) => {
            console.log(err)
        })
})





module.exports = router