const {User} = require('../models/User');

let auth = (req, res, next) => {
//인증 처리 하는 곳

//클라이언트 쿠키에서 토큰을 가져온다.
let token = req.cookies.x_auth;

//토큰을 복호화 한 후 유저를 찾는다.
User.fineByToken(token, (err, user) => {
    //유저 없으면 인증 불가
    if(err) throw err; 
    if(!user) return res.json({isAuth: false, error: true})

    //유저가 있으면 인증 완룐
    req.token = token;
    req.user = user;
    next(); //index.js의 get으로 미들웨어로서 갈수 있게함

})


}

module.exports = {auth};