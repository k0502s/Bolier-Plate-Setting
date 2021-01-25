const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10;
var jwt = require('jsonwebtoken');
 

const userSchema = mongoose.Schema({
name: {
    type: String,
    maxlength: 50
},
email: {
    type: String,
    trim: true,
    unique: 1
},
password: {
    type: String,
    minlength: 5
},
lastname: {
    type: String,
    maxlengh: 50
},
role: {
    type: Number,
    default: 0
},
image: String,
token: {
    type: String
},
tokenExp: {
    type: Number
}

})

//pre는 몽고DB의 메소드로 레지스터에서 정보를 저장
//전에 콜백함수를 실행 시킨다는 의미다.
userSchema.pre('save', function(next){
  
    //여기서 비밀번호 암호화 한다.

    var user = this;
    //.isModified메소드를 이용하여 패스워드가 변환될때만
    //실행되게 if문 걸어줌
    if(user.isModified('password')){
        bcrypt.genSalt(saltRounds, function(err, salt) {
            if(err) return next(err)
            bcrypt.hash(user.password, salt, function(err, hash) {
                if(err) return next(err)
                user.password = hash
                next()
            })
        })
    }
    else{
        next()
    }

})

userSchema.methods.comparePassword = function(plainPassword, cb){
    //plainPassword 1234567  암호화 번호 $2b$10$AS1tgbgoGFXe8BZGys/5RuEwxnEKsvIBu73SJbnCYdyvu58K.erhS
  bcrypt.compare(plainPassword, this.password, function(err, isMatch){
      if(err) return cb(err);
      cb(null, isMatch)
  })
}
userSchema.methods.generateToken = function(cb){
    var user = this;
    //jsonwebToken을 이용해서 token을 생성하기
  var token = jwt.sign(user._id.toHexString(), 'secretToken') //toHexString()로 인해 user._id + '' = token 했음. 
  user.token = token
  user.save(function(err, user){
      if(err) return cb(err);
      cb(null, user)
  })
}

userSchema.statics.fineByToken = function(token, cb){
    var user = this;

    
    //토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded){ //decoded에 decode한 토큰이 담김. 즉 'secretToken'이다.


        //유저 아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if (err) return cb(err);
            cb(null, user)
        })
    })
}


const User = mongoose.model('User', userSchema)

module.exports = {User}