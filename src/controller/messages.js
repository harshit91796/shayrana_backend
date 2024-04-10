const Message = require('../model/Message')

//add message


async function message(req,res) {
    const newMessage = new Message(req.body)
    try {
        const saved = await newMessage.save();
        res.status(200).send(saved)
    } catch (error) {
        res.status(500).send(err)
    }
}


//get

async function getMessage(req,res) {
    
    try {
        const message = await Message.find({
            conversationId : req.params.conversationId,
        })
        res.status(200).send(message)
    } catch (error) {
        res.status(500).send(err)
    }
}


module.exports = {message,getMessage}