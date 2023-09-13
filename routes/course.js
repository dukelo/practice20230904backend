const router = require('express').Router()
const courseValidation = require('../validation').courseValidation
const Course = require('../models/index').course

router.use((req, res, next) => {
  console.log('course route success')
  next()
})

// queryall
router.get('/', async(req, res) => {
  console.log('query all course')
  try {
    let allCourse = await Course.find({}).exec()
    return res.status(400).send({
      message: 'query all success',
      allCourse
    })
  } catch(e) {
    return res.status(500).send(e)
  }
})

// queryone

router.get('/:_id', async(req, res) => {
  console.log('queryone')
  let { _id } = req.params
  try {
    if (_id) {
      let oneCourse = await Course.findOne({ _id }).populate("instructor", ['username', 'email']).exec()
      return res.status(400).send({
        message: 'queryone success',
        oneCourse
      })
    }
  } catch(e) {
    return res.status(500).send(e)
  }
})

// query by instructor
router.get('/instructor/:_instructor_id', async(req,res) => {
  try {
    let { _instructor_id } = req.params
    let courseFound = await Course.find({instructor: _instructor_id}).populate('instructor', ['username', 'email']).exec()
    return res.status(200).send(courseFound)
  } catch(e) {
    return res.status(500).send(e)
  }
})

// query by student
router.get('/student/:_student_id', async(req,res) => {

  try {
    let { _student_id } = req.params
    console.log('_student_id' + _student_id)
    let courseFound = await Course.find({students: _student_id}).populate('instructor', ['username', 'email']).exec()
    return res.status(200).send(courseFound)
  } catch(e) {
    return res.status(500).send(e)
  }
})

// query by name
router.get('/findbyname/:name', async(req, res) => {
  let { name } = req.params
  console.log('name ' + name)
  console.log(req.params)

  try {
    let courseFound = await Course.find({ title: name }).populate('instructor', ['username', 'email']).exec()
    return res.status(200).send(courseFound)
  } catch(e) {
    console.log(e)
    res.status(500).send(e)
  }
})

// register course
router.post('/enroll/:_id', async(req, res) => {
  try {
    let { _id } = req.params
    console.log(_id)
    let course = await Course.findOne({_id}).exec()
    course.students.push(req.user._id)
    course.save()
    return res.status(200).send('register success')
  } catch(e) {
    return res.status(500).send(e)
  }
})



// increase new course
router.post('/', async (req, res) => {
    // check connection
    console.log('course')
    // check form content
    let { error } = courseValidation(req.body)
    if (error) {
      return res.status(400).send(error.details[0].message)
    }
    // check instructor
    if (req.user.isStudent()) {
      return res.status(400).send('only instructor create course')
    }

    console.log(req.user.role)
    console.log(req.body)
    console.log(req.user._id)

    let { title, description, price } = req.body

    try {
      let newCourse = new Course(
        {title, description, price, instructor: req.user._id}
      )
      let saveCourse = await newCourse.save()
      console.log(saveCourse)
      return res.status(200).send(
        {
          message: 'save course success',
          saveCourse
        }
      )
    } catch(e) {
      return res.status(500).send('can not save course')
      // return res.status(500).send(e)
    }
})

// update
router.patch('/:_id', async(req, res) => {
  console.log('update')
  // check form content
  let { _id } = req.params
  let { error } = courseValidation(req.body)
  if (error) {
    return res.status(400).send(error.details[0].message)
  }

  // check data exist
  try {
    let doc = await Course.findOne({ _id })
    console.log('doc')
    console.log(doc)
    if(!doc) {
      return res.status(400).send('data is not exist')
    }
  
    if(doc.instructor.equals(req.user._id)) {
      let updateCourse = await Course.findOneAndUpdate({ _id }, req.body, {new: true, runValidators: true})
      return res.status(400).send({
        message: 'update success',
        updateCourse
      })
    } else {
      return res.status(400).send('have no permission to update')
    }
  } catch(e) {
    return res.status(500).send(e)
  }
})

module.exports = router