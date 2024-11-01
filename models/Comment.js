const mongoose = require('mongoose');

 
const commentSchema = new mongoose.Schema({
 
     user_id:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'User'},
     videoId:{type:String,required:true},
     commentText:{type:String,required:true},

},{timestamps:true})


module.exports = mongoose.model('comment',commentSchema);



