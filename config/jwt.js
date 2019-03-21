const jwt = require('jsonwebtoken')
const keys = require('./keys.js')
function jwtMiddleWare(req,res,next){
    let token = req.headers.authorization
    jwt.verify(token,keys.secretOrPrivateKey,(err,decoded) => {
        if(err){
            res.status(401).json({
                statusCode:'9999',
                description:'token失效或不存在'
            })
        }else{
            next()
        }
    })
}

module.exports = jwtMiddleWare