function postMessage(req,res){
    const Message = require('../models/message');

    var unMessage = new Message({
        from : req.username,
        content : req.text,
        room : req.room,
        date:req.date
    });
    unMessage.save()

}

function getMessageFrom(req,res) {
    const Message = require('../models/message');

    switch (req.params.typeDate) {
        case 's':
            var gte = new Date(new Date().setHours(new Date().getHours()+2, new Date().getMinutes(), new Date().getSeconds() - req.params.dateFrom));
            break;
        case 'm':
            var gte = new Date(new Date().setHours(new Date().getHours()+2, new Date().getMinutes() - req.params.dateFrom, new Date().getSeconds()))
            break;
        case 'h':
            var gte = new Date(new Date().setHours(new Date().getHours() - req.params.dateFrom+2, new Date().getMinutes(), new Date().getSeconds()))
            break;
        case 'd':
            var gte = new Date(new Date().setDate(new Date().getDate() - req.params.dateFrom));
            break;
        default:
            console.log('please, entry a good date type like s, m, h or d');
    }
    console.log(gte)
    Message.find({room: req.params.room, date :{$gte : gte, $lt : new Date(new Date().setHours(new Date().getHours()+2,new Date().getMinutes(),new  Date().getSeconds()))}},function (err,messages) {
        if (err) throw err;

        res.status(200).send(messages)
    })
}

function getCommunicateMost(req,res){
    const Message = require('../models/message');
    Message.aggregate([{$group:{_id:"$from",count:{$sum:1}}},{$sort:{count:-1}}],function (err,response) {
        if (err) throw err;

        res.status(200).send(response)
    })

}
function getCommunicateMostPerRoom(req,res){
    const Message = require('../models/message');
    Message.aggregate([{$match:{room:parseInt(req.params.roomID)}},{$group:{_id:"$from",count:{$sum:1}}},{$sort:{count:-1}}],function (err,response) {
        if (err) throw err;

        res.status(200).send(response)
    })

}

function getNumberMessageTotal(req,res){
    const Message = require('../models/message');
    Message.countDocuments({},function (err,response) {
        if (err) throw err;

        res.json("Number of documents in the collection: " + response)
    })
}

function getNumberMessagePerRoom(req,res){
    const Message = require('../models/message');
    Message.countDocuments({room:req.params.roomID},function (err,response) {
        if (err) throw err;

        res.json("Number of documents in the room: "+req.params.roomID+" : " + response)
    })
}

// MAP REDUCE PART 

const o={}

o.map = function () {
    var contentSplitted = this.content.split(" ");

    contentSplitted.forEach(function (contentItem) {
        emit(contentItem,1);
    })

}

o.reduce = function  (key, values) {

    return Array.sum(values);


}
o.verbose=true;
function getDetailsMessage(req,res){
    const Message = require('../models/message');

    Message.mapReduce(o,function (err,results,stats) {

        if (err) throw err;
        res.json(results)
    })

}


module.exports.getDetailsMessage=getDetailsMessage;
module.exports.getNumberMessagePerRoom=getNumberMessagePerRoom;
module.exports.getNumberMessageTotal=getNumberMessageTotal;
module.exports.getCommunicateMostPerRoom=getCommunicateMostPerRoom;
module.exports.getCommunicateMost=getCommunicateMost;
module.exports.getMessageFrom=getMessageFrom;
module.exports.postMessage = postMessage;
