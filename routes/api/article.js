const express = require('express')
const router = express.Router()

const Article = require('../../models/Article')
const User = require('../../models/User')
const Comment = require('../../models/Comment')

router.get('/',(req,res) => {//获取全部类型，skip一页几个，page第几页
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let totalArticles = 0
    Article.countDocuments({}).then((total) => {totalArticles=total}).catch((err) => {console.log(err)})
    Article.find().sort({lastCommentAt:-1}).limit(page).skip(page*(num-1))
        .populate({path:'author',select:"avatar"})
        .then((articles) => {
            res.json({
                statusCode:'0000',
                description:'成功获取文章',
                articles:articles,
                totalArticles
            })
        })
})

router.get('/typearticle',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let articleType = req.query.articleType
    let totalArticles = 0
    Article.countDocuments({articleType}).then((total) => {totalArticles=total}).catch((err) => {console.log(err)})
    Article.find({articleType:articleType}).sort({lastCommentAt:-1}).limit(page).skip(page*(num-1))
        .populate({path:'author',select:"avatar"})
        .then((articles) => {
            res.json({
                statusCode:'0000',
                description:'成功获取文章',
                articles:articles,
                totalArticles
            })
        })
})

router.get('/:id',(req,res) => {
    let totalComments = 0
    Article.findById(req.params.id).then((article) => {
        totalComments = article.comments.length
    })
    Article.findByIdAndUpdate(req.params.id,{$inc:{browseNum:1}})
        .populate([
            {path:'comments',select:'user content create_at',options:{sort: {create_at:-1},limit:10},
        populate:{path:'user',select:'avatar name'}},
            {path:'author',select:'name avatar email'}
    ])
        .then((article) => {
            res.json({
                statusCode:'0000',
                description:'成功获取文章',
                article:article,
                totalComments
            })
        })
})

router.get('/:id/comments',(req,res) => {
    let page = parseInt(req.query.page) 
    let num = parseInt(req.query.num)
    let totalComments = 0
    Article.findById(req.params.id).then((article) => {
        totalComments = article.comments.length
    })
    Article.findById(req.params.id)
        .populate({path:'comments',select:'user content create_at',options:{sort: {create_at:-1},limit:page,skip:(page*(num-1)),
        populate:{path:'user',select:'avatar name'}}})
        .then((article) => {
            res.json({
                statusCode:'0000',
                description:'成功获取当前页评论',
                comments:article.comments,
                totalComments
            })
        })
        .catch((err) => {
            console.log(err)
        })
})

router.post('/add', (req,res) => {
    let newArticle = new Article({
        title:req.body.title,
        content:req.body.content,
        author:req.body.authorId,
        articleType:req.body.articleType
    })
    newArticle.save()
        .then((article) => {
            User.findByIdAndUpdate(req.body.authorId,{$push:{articles:article._id}})
                .then((user) => {
                    res.json({
                        statusCode:'0000',
                        description:'文章发布成功'
                    })
                })
        })
        .catch((err) => {
            console.log(err)
            res.json({
                statusCode:'9999',
                description:'文章发布失败'
            })
        })
})

router.post('/delete/:id',(req,res) => {
    Article.findByIdAndRemove(req.params.id)
        .then((article) => {
            User.findByIdAndUpdate(article.author,{$pull:{articles:req.params.id}})
                .then((user) => {
                    res.json({
                        statusCode:'0000',
                        description:'文章删除成功'
                    })
                })
        })
        .catch((err) => {
            console.log(err)
            res.json({
                statusCode:'9999',
                description:'文章删除失败'
            })
        })
})

router.post('/addcomment',(req,res) => {
    let newComment = new Comment({
        user:req.body.userId,
        article:req.body.articleId,
        content:req.body.content
    })
    newComment.save()
    .then((comment) => {
        Article.findByIdAndUpdate(req.body.articleId,{$push:{comments:comment._id},$set:{lastCommentAt:Date.now()}})
            .then((article) => {
                User.findByIdAndUpdate(req.body.userId,{$push:{comments:comment._id}})
                    .then((user) => {
                        res.json({
                            statusCode:'0000',
                            description:'评论发表成功'
                        })
                    })
            })
    })
    .catch((err)=>{
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'评论失败'
        })
    })
})

router.post('/deletecomment',(req,res) => {
    Comment.findByIdAndRemove(req.body.commentId).then((comment) => {
        Article.findByIdAndUpdate(comment.article,{$pull:{comments:comment._id}})
            .then((article) => {
                User.findByIdAndUpdate(comment.user,{$pull:{comments:comment._id}})
                    .then((user) => {
                        res.json({
                            statusCode:'0000',
                            description:'删除评论成功'
                        })
                    })
            })
    })
    .catch((err) => {
        console.log(err)
        res.json({
            statusCode:'9999',
            description:'删除评论失败'
        })
    })
})





module.exports = router