const mongoose = require('mongoose');

 
const videoSchema = new mongoose.Schema({
     title:{type:String,required:true},
     description:{type:String,required:true},
     user_id:{type:String,required:true},
     videoUrl:{type:String,required:true},
     videoId:{type:String,required:true},
     thumbnailUrl:{type:String,required:true},
     thumbnailId:{type:String,required:true},
     category:{type:String,required:true},
     tags:[{type:String,required:true}],
     likes:{type:Number,default:0},
     dislike:{type:Number,default:0},
     views:{type:Number,default:0},
     likedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
     dislikedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
     
},{timestamps:true})


module.exports = mongoose.model('Video',videoSchema);



