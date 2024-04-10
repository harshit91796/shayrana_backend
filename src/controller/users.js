const User = require('../model/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
dotenv.config()

async function register(req,res){
   try {
    const {username,email,password} = req.body
   const user = await User.create(req.body)
   res.status(200).send("user is created")
   } catch (error) {
    res.status(500).send({msg : error.message})
   }

}

async function Login(req,res){
    try {
     const {email,password} = req.body
     const user = await User.findOne({email : email})
     if(!user){
        return res.status(400).send("there is no user with that email")
     }
     const hash = await bcrypt.compare(password,user.password)

     if(hash){
       const token = jwt.sign({userId : user._id},process.env.secret_key)
       res.setHeader('X-api-key',token)
       res.status(200).send({status : true, data : user ,message : "user is logged in"})
     }
     
    } catch (error) {
     res.status(500).send({msg : error.message})
    }
 
 }

 //crud

 

 //update user
 
 async function update(req,res){
   try {
   if(req.body.userId===req.params.id || req.body.isAdmin){
         if(req.body.password){
            try {
               const hashedPass = await bcrypt.hash(req.body.password,8)
               req.body.password = hashedPass
            } catch (error) {
             return  res.status(500).send({msg : error.message})
            }
         }

         try {
            const user = await User.findByIdAndUpdate(req.params.id,{$set : req.body},{new:true})
            // console.log(user)
            res.status(200).send({status : true,message : "user is updated"})
         } catch (error) {
            return  res.status(500).send({msg : error.message})
         }
   }else{
      return res.status(400).send("you can only update your account!")
   }
    
   } catch (error) {
    return res.status(500).send({msg : error.message})
   }

}

 //delete user

 async function deleteUser(req,res){
   try {
   if(req.body.userId===req.params.id || req.body.isAdmin){
         if(req.body.userId){
         try {
            const user = await User.deleteOne({_id : req.params.id})
            res.status(200).send({status : true,message : "user is deleted"})
         } catch (error) {
            return  res.status(500).send({msg : error.message})
         }
      }
   }else{
      return res.status(400).send("you can only delete your account!")
   }
    
   } catch (error) {
    return res.status(500).send({msg : error.message})
   }

}

 //get user
 async function getUser(req,res){
   try {
      const username = await User.findOne({username : req.params.id}) || await User.findById(req.params.id)
   //   const user = await User.findById(req.params.id)
   //   if(!user){
   //    return res.status(400).send("there is no user with that email")
   // }
   // const { password,updateAt, ...other} = username._doc
   // console.log(other)
   res.status(200).json({data : username,msg : "ok"})

    
   } catch (error) {
    return res.status(500).send({msg : error.message})
   }

}


 //follow user
 async function follow(req,res){
   try{
      if(req.body.userId !== req.params.id){
          try {
            const user = await User.findById(req.params.id)
            const current = await User.findById(req.body.userId)
            if(!user.followers.includes(req.body.userId)){
               await user.updateOne({$push : {followers : req.body.userId}})
               await current.updateOne({$push : {followings : req.params.id}})
               return res.status(200).send("user has been followed")
            }
            else{
               return res.status(400).send("you already follow the user")
            }
          } catch (error) {
            
          }
      }
      else{

      }
   }
   catch (error) {
    return res.status(500).send({msg : error.message})
   }

}


 //unfollow user

 async function unFollow(req,res){
   try{
      if(req.body.userId !== req.params.id){
          try {
            const user = await User.findById(req.params.id)
            const current = await User.findById(req.body.userId)
            if(user.followers.includes(req.body.userId)){
               await user.updateOne({$pull : {followers : req.body.userId}})
               await current.updateOne({$pull : {followings : req.params.id}})
               return res.status(200).send("user has been unfollowed")
            }
            else{
               return res.status(400).send("you already unfollow the user")
            }
          } catch (error) {
            
          }
      }
      else{
         return res.status(400).send("id are same")
      }
   }
   catch (error) {
    return res.status(500).send({msg : error.message})
   }

}

// search user

async function userSearch(req, res) {
   try {
      console.log('Received username:', req.query.username);
      const username = req.query.username;
  
      if (!username) {
        return res.status(400).json({ error: 'Username is required for search.' });
      }
  
      // Use a MongoDB query to search for users based on the username
      const users = await User.find({ username: { $regex: new RegExp(username), $options: 'i' } });
  
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
 };
 

module.exports = {register,Login,update,deleteUser,getUser,follow,unFollow,userSearch}