const express = require('express')
const router = express.Router()
const User = require('../../models/User')
const bcrypt = require('bcryptjs')
const keys = require('../../config/keys')
const jwt = require('jsonwebtoken')

router.post('/register', (req,res) => {
    User.findOne({email:req.body.email}).then((user) => {
        //邮箱已存在
        if(user){
            res.json({
                statusCode:'9999',
                description:'邮箱已被注册'
            })
        //邮箱未注册
        }else{
            bcrypt.hash(req.body.password, keys.saltRounds).then((hash) => {
                let newUser = new User({
                    email:req.body.email,
                    password:hash,
                    name:'中大人_'+Date.now()
                })
                newUser
                    .save()
                    .then(user => res.json({
                        statusCode:'0000',
                        description:'注册成功',
                    }))
                    .catch((err) => {
                        console.log(err)
                        res.json({
                            statusCode:'9999',
                            description:'数据库操作失败'
                        })
                    })
            })
        }
    })
})

router.post('/', (req,res) => {
    User.findOne({email:req.body.email}).then((user) => {   
        if(user){//如果邮箱存在
            bcrypt.compare(req.body.password, user.password).then((success) => {
                if(success){//匹配成功
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
                    let token = jwt.sign({
                        _id:user._id,
                        email:user.email,
                        name:user.name,
                        registerDate:user.registerDate,
                        avatar:user.avatar,
                        birthday:user.birthday,
                        gender:user.gender,
                        selfDescription:user.selfDescription
                    },keys.secretOrPrivateKey,{expiresIn:3600})
                    res.json({
                        statusCode:'0000',
                        description:'登陆成功',
                        returnUser,
                        token
                    })
                }else{//匹配失败
                    res.json({
                        statusCode:'9999',
                        description:'密码错误'
                    })
                }
            });
        }else{//如果邮箱不存在
            res.json({
                statusCode:'9999',
                description:'该邮箱不存在'
            })
        }
    })
})

router.post('/changepassword',(req,res) => {
    User.findById(req.body.id).then((user) => {
        if(!user){
            res.json({
                statusCode:'9999',
                description:'账号不存在'
            })
        }else{
            bcrypt.compare(req.body.password, user.password).then((success) => {
                if(success){//密码正确-修改
                    bcrypt.hash(req.body.newPassword, keys.saltRounds).then((hash) => {
                        User.findByIdAndUpdate(req.body.id,{$set:{password:hash}})
                            .then(() => {
                                res.json({
                                    statusCode:'0000',
                                    description:'密码修改成功'
                                })
                            })
                            .catch(err => console.log(err))
                    });
                }else{//密码错误
                    res.json({
                        statusCode:'9999',
                        description:'密码错误，修改失败'
                    })
                }
            });
        }
    })
})

router.post('/managelogin',(req,res) => {
    User.findOne({email:req.body.email}).then((user) => {   
        if(user){//如果邮箱存在
            bcrypt.compare(req.body.password, user.password).then((success) => {
                if(success){//匹配成功
                    if(user.identity === 1){
                        res.json({
                            statusCode:'9999',
                            description:'你不是管理员'
                        })
                    }else{
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
                        let token = jwt.sign({
                            _id:user._id,
                            email:user.email,
                            name:user.name,
                            registerDate:user.registerDate,
                            avatar:user.avatar,
                            birthday:user.birthday,
                            gender:user.gender,
                            selfDescription:user.selfDescription
                        },keys.secretOrPrivateKey,{expiresIn:3600})
                        res.json({
                            statusCode:'0000',
                            description:'登陆成功',
                            returnUser,
                            token
                        })
                    }
                }else{//匹配失败
                    res.json({
                        statusCode:'9999',
                        description:'密码错误'
                    })
                }
            });
        }else{//如果邮箱不存在
            res.json({
                statusCode:'9999',
                description:'该邮箱不存在'
            })
        }
    })
})


module.exports = router