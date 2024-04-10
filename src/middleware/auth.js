const User = require('../model/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

async function hashPass(req,res,next){
  try {
    const pass = req.body.password
    if(!pass){
    return res.status(400).send("there is no password")
    }
    const hashedPass = await bcrypt.hash(pass,8)
    req.body.password = hashedPass
    next();
  } catch (error) {
    res.status(500).send({msg : error.message})
  }

}

module.exports = {hashPass}