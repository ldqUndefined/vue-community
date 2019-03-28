const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const keys = require('../../config/keys')

const Article = require('../../models/Article')
const User = require('../../models/User')
const Comments = require('../../models/Comment')
const ReportArticle = require('../../models/ReportArticle')
const ReportComment = require('../../models/ReportComment')

router.get('/getuser',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let totalUsers = 0
    User.countDocuments({}).then((total) => {totalUsers=total}).catch((err) => {console.log(err)})
    User.find().sort({registerDate:-1}).limit(page).skip(page*(num-1))
        .select('email registerDate name avatar gender selfDescription articles comments')
        .then((users) => {
            res.json({
                statusCode:'0000',
                description:'查找用户成功',
                users,
                totalUsers
            })
        })
})

router.get('/getuserbyid',(req,res) => {
    User.findById(req.query.id).select('email name gender registerDate avatar identity selfDescription birthday')
    .then((user) => {
        if(user){
            res.json({
                statusCode:'0000',
                description:'查找成功',
                user
            })
        }else{
            res.json({
                statusCode:'9999',
                description:'该用户不存在'
            })
        }
    })
    .catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'该用户不存在'
        })
    })
})

router.get('/getuserbyname',(req,res) => {
    User.findOne({name:req.query.name}).select('email name gender registerDate avatar identity selfDescription birthday')
    .then((user) => {
        if(user){
            res.json({
                statusCode:'0000',
                description:'查找成功',
                user
            })
        }else{
            res.json({
                statusCode:'9999',
                description:'该用户不存在'
            })
        }
    })
    .catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'该用户不存在'
        })
    })
})


router.get('/getuserbyemail',(req,res) => {
    User.findOne({email:req.query.email}).select('email name gender registerDate avatar identity selfDescription birthday')
    .then((user) => {
        if(user){
            res.json({
                statusCode:'0000',
                description:'查找成功',
                user
            })
        }else{
            res.json({
                statusCode:'9999',
                description:'该用户不存在'
            })
        }
    })
    .catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'该用户不存在'
        })
    })
})


router.post('/setuserdetail',(req,res) => {
    if(!req.body.birthday){
        req.body.birthday=null
    }
    User.findByIdAndUpdate(req.body._id,{$set:{
        name:req.body.name,
        birthday:new Date(req.body.birthday),
        gender:req.body.gender,
        selfDescription:req.body.selfDescription
    }}).then((user) => {
        res.json({
            statusCode:'0000',
            description:'资料修改成功'
        })
    }).catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'资料修改失败'
        })
    })
})


router.post('/setuserpassword',(req,res) => {
    User.findOne({email:req.body.email}).then((user) => {
        if(!user){
            res.json({
                statusCode:'9999',
                description:'账号不存在'
            })
        }else{
            bcrypt.hash(req.body.password, keys.saltRounds).then((hash) => {
                User.findOneAndUpdate(req.body.email,{$set:{password:hash}})
                    .then(() => {
                        res.json({
                            statusCode:'0000',
                            description:'密码修改成功'
                        })
                    })
                    .catch(err => console.log(err))
            });
        }
    })
})

router.get('/getarticle',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let totalArticles = 0
    Article.countDocuments({}).then((total) => {totalArticles=total}).catch((err) => {console.log(err)})
    Article.find().sort({publishTime:-1}).limit(page).skip(page*(num-1))
        .select('title content author publishTime articleType browseNum lastCommentAt comments')
        .populate({path:'author',select:'avatar name'})
        .then((articles) => {
            res.json({
                statusCode:'0000',
                description:'获取文章成功',
                articles,
                totalArticles
            })
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get('/getcomment',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let totalComments = 0
    Comments.countDocuments({}).then((total) => {totalComments=total}).catch((err) => {console.log(err)})
    Comments.find().sort({create_at:-1}).limit(page).skip(page*(num-1))
        .populate([{
            path:'user',select:'name avatar'
        },{
            path:'article',select:'title content publishTime'
        }])
        .then((comments) => {
            res.json({
                statusCode:'0000',
                description:'获取评论成功',
                comments,
                totalComments
            })
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get('/getreportarticle',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let state = req.query.state
    let totalreportArticles = 0
    ReportArticle.countDocuments({processingState:state}).then((total) => {totalreportArticles=total}).catch((err) => {console.log(err)})
    ReportArticle.find({processingState:state}).sort({reportDate:-1}).limit(page).skip(page*(num-1))
        .populate([{
            path:'reporter',select:'name avatar'
        },{
            path:'reportedArticle',select:'title content publishTime'
        }])
        .then((reportArticles) => {
            res.json({
                statusCode:'0000',
                description:'获取被举报文章成功',
                reportArticles,
                totalreportArticles
            })
        })
        .catch((err) => {
            console.log(err)
        })
})

router.post('/handleReportArticle',(req,res) => {
    ReportArticle.findByIdAndUpdate(req.body.handleRepordId,{$set:{processingState:'1',dealDate:Date.now()}})
        .then((rparticle) => {
            res.json({
                statusCode:'0000',
                description:'处理成功'
            })
        })
        .catch((err) => {
            console.log(err)
            res.json({
                statusCode:'9999',
                description:'处理失败'
            })
        })
})

router.get('/getreportcomment',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let state = req.query.state
    let totalreportComments = 0
    ReportComment.countDocuments({processingState:state}).then((total) => {totalreportComments=total}).catch((err) => {console.log(err)})
    ReportComment.find({processingState:state}).sort({reportDate:-1}).limit(page).skip(page*(num-1))
        .populate([{
            path:'reporter',select:'name avatar'
        },{
            path:'reportedComment',select:'content article create_at',populate:{path:'article',select:'title content'}
        }])
        .then((reportComments) => {
            res.json({
                statusCode:'0000',
                description:'获取被举报评论成功',
                reportComments,
                totalreportComments
            })
        })
        .catch((err) => {
            console.log(err)
        })
})

router.post('/handleReportComment',(req,res) => {
    ReportComment.findByIdAndUpdate(req.body.handleRepordId,{$set:{processingState:'1',dealDate:Date.now()}})
        .then((rpcomment) => {
            res.json({
                statusCode:'0000',
                description:'处理成功'
            })
        })
        .catch((err) => {
            console.log(err)
            res.json({
                statusCode:'9999',
                description:'处理失败'
            })
        })
})

router.get('/getArticleById',(req,res) => {
    Article.findById(req.query.id).select('author title content comments publishTime browseNum articleType')
        .populate({path:'author',select:'name avatar'})
        .then((article) => {
            if(article){
                res.json({
                    statusCode:'0000',
                    description:'查找文章成功',
                    article
                })
            }else{
                res.json({
                    statusCode:'9999',
                    description:'该文章不存在'
                })
            }
        })
        .catch((err) => {
            console.log(err)
            res.json({
                statusCode:'9999',
                description:'该文章不存在'
            })
        })
})

router.post('/setArticleTitleAndContent',(req,res) => {
    Article.findByIdAndUpdate(req.body._id,{$set:{
        title:req.body.title,
        content:req.body.content
    }})
    .then((article) => {
        res.json({
            statusCode:'0000',
            description:'编辑文章成功'
        })
    })
    .catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'编辑文章失败'
        })
    })
})

router.get('/getCommentById',(req,res) => {
    Comments.findById(req.query.id).populate([{
        path:'user',select:'name avatar'
    },{
        path:'article',select:'title content publishTime'
    }])
    .then((comment) => {
        if(comment){
            res.json({
                statusCode:'0000',
                description:'查找评论成功',
                comment
            })
        }else{
            res.json({
                statusCode:'9999',
                description:'该评论不存在'
            })
        }
    })
    .catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'该评论不存在'
        })
    })
})

router.post('/setCommentContent',(req,res) => {
    Comments.findByIdAndUpdate(req.body._id,{$set:{
        content:req.body.content
    }})
    .then((comment) => {
        res.json({
            statusCode:'0000',
            description:'编辑评论成功'
        })
    })
    .catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'编辑评论失败'
        })
    })
})

router.get('/getFront',(req,res) => {
    let returnData = {}
    User.countDocuments({}).then((total) => {
        returnData.totalUsers = total
        User.countDocuments({identity:2}).then((total) => {
            returnData.totalManage = total
            Article.countDocuments({}).then((total) => {
                returnData.totalArticles = total
                Comments.countDocuments({}).then((total) => {
                    returnData.totalComments = total
                    Comments.countDocuments({}).then((total) => {
                        returnData.totalComments = total
                        ReportArticle.countDocuments({}).then((total) => {
                            returnData.totalReportArticles = total
                            ReportComment.countDocuments({}).then((total) => {
                                returnData.totalReportComments = total
                                ReportArticle.countDocuments({processingState:'1'}).then((total) => {
                                    returnData.doneReportArticles = total
                                    ReportComment.countDocuments({processingState:'1'}).then((total) => {
                                        returnData.doneReportComments = total
                                        res.json({
                                            statusCode:'0000',
                                            description:'成功获取首页数据',
                                            returnData
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
    
    
    
    
    
    

    
})







module.exports = router