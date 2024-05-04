
const User = require('../model/User')
const { findById } = require('../model/User');
const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const multer = require('multer')
const fs = require('fs')

dotenv.config()

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );

  const storage = multer.memoryStorage();
  const upload = multer({ storage: storage });
  

//create post 

async function createPost(req, res) {
    try {
    
    console.log(req.body,req.file)
    
    upload.single('file')(req, res, async (err) => {
      if (err) {
        return res.status(500).send({ msg: err.message });
      }
  
      const uniqueName = `audio-${Date.now()}.mp3`; // Adjust extension for audio
  
      const { data, error } = await supabase.storage
        .from('shayarana')
        .upload(uniqueName, req.file.buffer, {
          contentType: 'audio/mpeg', // Specify audio content type
          cacheControl: 'max-age=3600', 
        });
  
      if (error) {
        return res.status(500).send({ msg: error.message });
      }
  
      console.log('Supabase upload successful:', data);
      const audioUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/${data.fullPath}`;
      console.log('urlll', audioUrl);
  
      newPost.audioUrl = audioUrl;
  
      console.log('New post data before saving:', newPost); // Log for debugging
  
     
    });
   
        const savedPost = await 
        res.status(200).send(savedPost);
      } catch (error) {
        console.error('Error saving post:', error); // Log the error
        res.status(500).send({ msg: 'Error creating post' });
      }
  }
  


//update post

async function updatePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).send("post has been updated");
        } else {
            res.status(400).send("You cannot update someone else's post");
        }
    } catch (error) {
        res.status(500).send({ msg: error.message });
    }
}

//delete post

async function deletePost(req, res) {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId === req.body.userId) {
            await post.deleteOne();
            res.status(200).send("post has been deleted");
        } else {
            res.status(400).send('You cannot delete someone else\'s post');
        }
    } catch (error) {
        res.status(500).send({ msg: error.message });
    }
}



//get post

async function getPost(req,res){
    try {
        const post = await Post.findById(req.params.id)
        res.status(200).send(post)
    } catch (error) {
        res.status(500).send({ msg: error.message });
    }
}

//like post

async function likePost(req,res){
    try {
        const post = await Post.findById(req.params.id)
        console.log(post)
        console.log(req.body.userId)
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({ $push : {likes : req.body.userId} }); 
            res.status(200).send({msg : "the post has been liked"}) 
        }
        else{
            await post.updateOne({ $pull : {likes : req.body.userId} }); 
         res.status(200).send({msg : "the post has been disliked"})
        }
    } catch (error) {
        res.status(500).send({ msg: error.message });
    }
}

//get all post

async function getAllPost(req,res){
  
        try {
          const user = await User.findOne({ username: req.params.username });
          const posts = await Post.find({ userId: user._id });
          res.status(200).json(posts);
        } catch (err) {
          res.status(500).json(err);
        }
    
}

//get timeline post

async function getTimeLinePost(req,res){
     try {
        const currentUser = await User.findById(req.params.userId)
        const userPosts = await Post.find({userId : currentUser._id})
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
               return Post.find({userId : friendId });
            })
        )
        res.json(userPosts.concat(...friendPosts))
     } catch (error) {
        res.status(500).send({ msg: error.message });
     }
}


module.exports = {createPost,updatePost,deletePost,likePost,getPost,getTimeLinePost,getAllPost}