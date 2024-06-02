const Post = require('../model/Post');
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
  const upload = multer({ storage: storage }).fields([
      { name: 'audio', maxCount: 1 },
      { name: 'image', maxCount: 1 }
  ]);
  
  async function createPost(req, res) {
      upload(req, res, async (err) => {
          if (err) {
              console.error('Error uploading files:', err);
              return res.status(500).send({ msg: 'Error uploading files' });
          }
  
          try {
              const { post } = req.body;
              if (!post) {
                  throw new Error('Post data is missing');
              }
  
              const parsedPost = JSON.parse(post);
              console.log('Parsed post:', parsedPost);
  
              if (!req.files || Object.keys(req.files).length === 0) {
                  return res.status(400).send({ msg: 'Files are required.' });
              }
  
              const audioFile = req.files.audio ? req.files.audio[0] : null;
              const imageFile = req.files.image ? req.files.image[0] : null;
  
              if (!audioFile || !imageFile) {
                  return res.status(400).send({ msg: 'Both image and audio files are required.' });
              }
  
              console.log('Supabase storage config before:', req.files.audio[0].buffer);
  
              const uniqueAudioName = `audio-${Date.now()}.mp3`; // Adjust extension for audio
              const uniqueImageName = `image-${Date.now()}.jpg`;
  
              console.log('Supabase storage config:');
  
              const audioUploadPromise = await supabase.storage.from('shaayri').upload(uniqueAudioName, audioFile.buffer, {
                  contentType: 'audio/mpeg',
                  cacheControl: 'max-age=3600',
                  upsert: false
              });
  
              console.log('Supabase audio upload successful:', audioUploadPromise);

              console.log('Supabase storage config before:', req.files.image[0].buffer);
  
              const imageUploadPromise = await supabase.storage.from('shaayri').upload(uniqueImageName, imageFile.buffer, {
                  contentType: 'image/jpeg',
                  cacheControl: 'max-age=3600', 
                  upsert: false
              }); 
  
              console.log('Supabase image upload successful:', imageUploadPromise);
  
              const audioUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/shaayri/${audioUploadPromise.data.path}`;
              const imgUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/shaayri/${imageUploadPromise.data.path}`;
  
              console.log('audioUrl:', audioUrl);
              console.log('imageUrl:', imgUrl);
  
              const newPost = new Post({
                  ...parsedPost,
                  audioUrl: audioUrl,
                  imgUrl: imgUrl
              });
  
              console.log('New post data before saving:', newPost);
  
              const savedPost = await newPost.save();
              res.status(200).send(savedPost);
          } catch (error) {
              console.error('Error saving post:', error);
              res.status(500).send({ msg: 'Error creating post' });
          }
      });
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