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





module.exports.getMessageFrom=getMessageFrom;
module.exports.postMessage = postMessage;
