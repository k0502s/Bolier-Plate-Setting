const express = require('express')
const app = express()
const port = 4000
const bodyParser = require('body-parser');
const {User} = require("./models/User");
const {auth} = require('./middleware/auth');
const config = require('./config/key');
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')

 
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());



mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))



app.get('/', (req, res) => {
  res.send('my name is jinsoek')
})


app.get('/api/hello', (req, res) => {



  res.send('TEST')
})


//회원가입
app.post('/api/users/register', (req, res) => {

  const user = new User(req.body)
  //.save는 mongoDB의 메소드
  // 접속에 성공(status(200))하면 json을 이용하여 success: true 뜨게 함
  user.save((err, user) => {
    if (err) return res.json({success: false, err})
    return res.status(200).json({
      success: true 
    })
  })
})




// 로그인
app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({email: req.body.email}, (err, user) => {
    if(!user){
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    //요청된 이메일이 데이터 베이스에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      if(!isMatch)
      return res.json({loginSuccess: false, message: "비밀번호 틀렸습니다."})
      //비밀번호 맞다면 토큰을 생성하기
      user.generateToken( (err, user) => {
        if(err) return res.status(400).send(err);

        //토큰을 저장한다. 어디에? 쿠키, 로컬 스토리지 등
      res.cookie("x_auth", user.token)
      .status(200)
      .json({loginSuccess: true, userId: user._id})


      })
     })
    })
  })



  
                         //미들웨어
app.get('/api/users/auth',auth, (req, res) => {

//여기까지 미들웨어를 통과해 있다는 애기는 authentication이 true라는 말
res.status(200).json({
_id: req.user._id,
isAdmin: req.user.role === 0 ? false : true,
//role 0 -> 일반 유저 role -> 0이 아니면 관리자
isAuth: true,
email: req.user.email,
name: req.user.name,
lastname: req.user.role,
image: req.user.image
})

})



//로그아웃. 토큰을 지워버림.
app.get('/api/users/logout', auth, (req, res) => {

  User.findOneAndUpdate({_id: req.user._id},
    {token: ""},
    (err, user) => {
      if (err) return res.json({success: false, err});
      return res.status(200).send({
        success: true
      })
    })

})





app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

