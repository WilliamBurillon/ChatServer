var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var MessageSchema = new Schema({
    from:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required: true
    },
    room:{
        type : Number,
        required : true

    },
    date:{
        type:Date,
        required:true
    }
})
module.exports = mongoose.model('Message', MessageSchema);
