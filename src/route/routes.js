const express = require('express')
const router = express.Router()
const {register,Login,update,deleteUser,getUser,follow,unFollow, userSearch} = require('../controller/users')
const {createPost,updatePost,deletePost,likePost,getPost,getTimeLinePost,getAllPost} = require('../controller/post')
const {hashPass} = require('../middleware/auth')
const { conversation, getUserConversations } = require('../controller/conversations')
const { message, getMessage } = require('../controller/messages')



//user
router.get('/search',userSearch)
router.post('/register',hashPass,register)
router.post('/login',Login)
router.route('/:id')
  .get(getUser)
  .put(hashPass, update)
  .delete(deleteUser);

router.put('/:id/follow',follow)
router.put('/:id/unfollow',unFollow)


//post

router.post('/createpost',createPost)
router.put('/:id/updatepost',updatePost)
router.delete('/:id/deletepost',deletePost)
router.put('/:id/likepost',likePost)
router.get('/:id/getpost',getPost)
router.get('/profile/:username',getAllPost)
router.get('/timeline/:userId', getTimeLinePost)

//conversation

router.post('/conversation',conversation)
router.get('/conversation/:userId',getUserConversations)
router.post('/message',message)
router.get('/message/:conversationId',getMessage)




module.exports = router

