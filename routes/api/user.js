const express = require('express')
const router = express.Router()
const multer = require('multer')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
    destination: function(req,file,cb){
        cb(null,'./uploads')
    },
    filename: function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname)
    }
})

const upload = multer({storage:storage})

const User = require('../../models/User')
const Article = require('../../models/Article')
const Comments = require('../../models/Comment')

router.post('/setavatar',upload.single('avatar'),(req,res) => {
    let aURL = 'http://localhost:5000/uploads/'+req.file.filename
    User.findByIdAndUpdate(req.body.id,{$set:{avatar:aURL}})
        .then((user) => {
            if(user.avatar !== 'http://localhost:5000/uploads/default.jpg'){
                let oldAvatar = user.avatar.replace('http://localhost:5000/uploads/',path.join(__dirname,'../../uploads/'))
                fs.unlink(oldAvatar,(err) => {
                    if(err){
                        console.log(err)
                    }
                })
            }
            res.json({
                statusCode:'0000',
                description:'上传头像成功'
            })
        })
        .catch((err) => {
            console.log(err)
            res.json({
                statusCode:'9999',
                description:'上传头像失败'
            })
        })
})

router.post('/changeDetail',(req,res) => {
    if(!req.body.birthday){
        req.body.birthday=null
    }
    User.findByIdAndUpdate(req.body.id,{$set:{
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

router.post('/checkpassword',(req,res) => {
    User.findById(req.body.id)
        .then((user) => {
            bcrypt.compare(req.body.password, user.password).then((success) => {
                if(success){
                    res.json({
                        statusCode:'0000',
                        description:'密码正确'
                    })
                }else{
                    res.json({
                        statusCode:'9999',
                        description:'密码不正确'
                    })
                }
            })
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get('/checkifname',(req,res) => {
    let checkname = req.query.name
    let id = req.query.id
    User.findOne({name:checkname})
        .then((user) => {
            if((!user) || (user._id==id)){
                res.json({
                    statusCode:'0000',
                    description:'该用户名可用'
                })
            }else{
                res.json({
                    statusCode:'9999',
                    description:'该用户名已被使用'
                })
            }
        })
        .catch((err) => {
            console.log(err)
        })
})

router.get('/:id',(req,res) => {
    User.findById(req.params.id,'name registerDate gender birthday email articles selfDescription avatar comments')
    .populate([{
        path:'articles',
        select:'author browseNum title publishTime comments lastCommentAt articleType',
        options:{sort: {publishTime:-1},limit:5},
        populate:{
            path:'author',
            select:'avatar'
        }
    },{
        path:'comments',
        select:'create_at content article',
        options:{sort: {create_at:-1},limit:5},
        populate:[{
            path:'article',
            select:'title',
        },{
            path:'user',
            select:'avatar name'
        }]
    }])
    .then((user) => {
        res.json({
            statusCode:'0000',
            description:'获取个人资料成功',
            user:user
        })
    })
    .catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'获取个人资料失败'
        })
    })
})

router.get('/:id/article',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let id = req.params.id
    let totalArticles = 0
    let currentUser = {}
    Article.countDocuments({author:id}).then((total) => {totalArticles = total}).catch((err) => {console.log(err)})
    User.findById(id).then((user) => {
        currentUser._id = user._id
        currentUser.avatar = user.avatar
        currentUser.name = user.name
        currentUser.selfDescription = user.selfDescription
    })
    Article.find({author:id}).sort({publishTime:-1}).limit(page).skip(page*(num-1))
        .populate({path:'author',select:"avatar selfDescription"})
        .then((articles) => {
            res.json({
                statusCode:'0000',
                description:'成功获取文章',
                articles:articles,
                totalArticles,
                currentUser
            })
        })
})


router.get('/:id/comment',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let id = req.params.id
    let totalComments = 0
    let currentUser = {}
    Comments.countDocuments({user:id}).then((total) => {totalComments = total}).catch((err) => {console.log(err)})
    User.findById(id).then((user) => {
        currentUser._id = user._id
        currentUser.avatar = user.avatar
        currentUser.name = user.name
        currentUser.selfDescription = user.selfDescription
    })
    Comments.find({user:id}).sort({create_at:-1}).limit(page).skip(page*(num-1))
        .populate([{path:'user', select:'avatar name'},{path:'article',select:'title'}])
        .then((comments) => {
            res.json({
                statusCode:'0000',
                description:'成功获取评论',
                comments:comments,
                totalComments,
                currentUser
            })
        })
})

router.get('/current/:id',(req,res) => {
    User.findById(req.params.id)
        .then((user) => {
            let returnUser = {
                _id:user._id,
                email:user.email,
                name:user.name,
                registerDate:user.registerDate,
                avatar:user.avatar,
                birthday:user.birthday,
                gender:user.gender,
                selfDescription:user.selfDescription
            }
            res.json({
                statusCode:'0000',
                description:'获取当前用户身份成功',
                returnUser
            })
        })
        .catch((err) => {
            console.log(err)
        })
})


module.exports = router