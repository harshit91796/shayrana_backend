const Post = require('../model/Post');
const User = require('../model/User')
const { findById } = require('../model/User');


//create post 
  
async function createPost(req,res){
    const newPost = new Post(req.body)
    try {
        const savedPost = await newPost.save();
        res.status(200).send(savedPost)
    } catch (error) {
        res.status(500).send({msg : error.message})
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