const Conversation = require('../model/Conversation')

//new convo

async function conversation(req,res) {
    const newConversation = new Conversation({
        members : [req.body.senderId , req.body.receiverId],
    })
    try {
        const saved = await newConversation.save()
        res.status(200).send(saved)
    } catch (error) {
        res.status(500).send(err)
    }
}


//get convo of user

async function getUserConversations(req,res) {
    
    try {
        const conversation = await Conversation.find({
            members : {$in : [req.params.userId]},
        })
        res.status(200).send(conversation)
    } catch (error) {
        res.status(500).send(err)
    }
}

module.exports = {conversation,getUserConversations}