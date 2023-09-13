const router = require('express').Router()
const registerValidation = require('../validation').registerValidation
const loginValidation = require('../validation').loginValidation
const User = require('../models/index').user
const jwt = require('jsonwebtoken')

// router.use((req, res, next) => {
//   console.log('auth success')
//   next()
// })

router.get('/testAPI', (req, res) => {
  return res.send('test API success')
})

router.post('/register', async (req, res) => {
  // check connection
  console.log('register')
  
  // check form content
  let { error } = registerValidation(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }

  let { username, email, password, role} = req.body
  // check repeat email
  let emailExist = await User.findOne({email})
  if(emailExist) {
    return res.status(400).send('repeat email')
  }

  // new register
  try {
    let newUser = new User({ username, email, password, role})
    let saveUser = await newUser.save()
    // return res.send({
    return res.status(200).send({
      message: 'Success Saved',
      saveUser
    })
  } catch(e) {
    return res.status(500).send('fail saved')
  }
})

// router.post("/register", async (req, res) => {
//   //確認數據是否符合規範
//   let { error } = registerValidation(req.body);
//   if (error) return res.status(400).send(error.details[0].message);

//   // 確認信箱是否被註冊過
//   const emailExist = await User.findOne({ email: req.body.email });
//   if (emailExist) return res.status(400).send("此信箱已經被註冊過了。。。");

//   // 製作新用戶
//   let { email, username, password, role } = req.body;
//   let newUser = new User({ email, username, password, role });
//   try {
//     let savedUser = await newUser.save();
//     return res.send({
//       msg: "使用者成功儲存。",
//       savedUser,
//     });
//   } catch (e) {
//     return res.status(500).send("無法儲存使用者。。。");
//   }
// });




// login
router.post('/login', async (req, res) => {
    // check connection
    console.log('login')
  
    // check form content
    let { error } = loginValidation(req.body)
    if (error) {
      return res.status(400).send(error.details[0].message)
    }

    let user = await User.findOne({email: req.body.email})
    
    if(!user) {
      return res.status(401).send('no this email')
    }

    user.comparePassword(req.body.password, (err, isMatch) => {
      if (err) {
        return res.status(500).send('server error')
      }

      if (isMatch) {
        const tokenObject = { _id: user._id, email: user.email}
        const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET)
        return res.status(200).send({
          message: 'login success',
          token: 'JWT '+token,
          user
        })
      } else {
        return res.status(401).send('password is error')
      }
    })
})


module.exports = router