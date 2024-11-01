const express = require('express');
const Router = express.Router();
const userModel = require('../models/User');
const videoModel = require('../models/Video');
const validateToken = require('../middleware/validateAuth');
const cloudinary = require('cloudinary').v2;

Router.post('/upload',validateToken,async (req,res)=>{ 
     
       const {email} = req.user;
       const user = await userModel.findOne({email:email});
       const {title,description,category,tags} = req.body;
       const {video,thumbnailUrl} = req.files;
       const uploadedvideo = await cloudinary.uploader.upload(video.tempFilePath,{
              resource_type:'video'
       })
       const uploadedThumbnail = await cloudinary.uploader.upload(thumbnailUrl.tempFilePath);
  
  
       const videodata = await videoModel.create({
              title:title,
              description:description,
              user_id:user._id,
              videoUrl:uploadedvideo.secure_url,
              videoId:uploadedvideo.public_id,
              thumbnailUrl:uploadedThumbnail.secure_url,
              thumbnailId:uploadedThumbnail.public_id,
              category:category,
              tags:tags.split(","),
           
       })
       res.status(200).json({
              newvideo:videodata,
       })
})
// video update router //
 Router.put("/:videoId",validateToken,async (req,res)=>{
    try {
        const token = req.user
        const {email} = token
        const user = await userModel.findOne({email:email});
        const {_id,channelName} = user
        const video = await videoModel.findOne({_id:req.params.videoId});
        const {title,description,user_id,thumbnailUrl,thumbnailId,category,tags,} = video;
    
      if(_id == user_id){
     
        if(req.files){
              //update thumbnail and text //
             const {title,description,category,tags} = req.body;
            await cloudinary.uploader.destroy(thumbnailId);
           const updatedthumbnail = await cloudinary.uploader.upload(req.files.thumbnailUrl.tempFilePath)
           const updatedData = {
              title:title,
              description:description,
              category:category,
           
              tags:tags.split(","),
              thumbnailUrl:updatedthumbnail.secure_url,
              thumbnailId:updatedthumbnail.public_id,
           } 
           const updatedVideoDetail = await videoModel.findByIdAndUpdate(req.params.videoId,updatedData,{new:true});
           res.status(200).json({
              updatedvideo:updatedVideoDetail
           })
        }
        else{
         const {title,description,category,tags} = req.body;
              const updatedData = {
                     title:title,
                     description:description,
                     category:category,
                    
                     tags:tags.split(","),
              
                  } 
                  const updatedVideoDetail = await videoModel.findByIdAndUpdate(req.params.videoId,updatedData,{new:true});
                  res.status(200).json({
                     updatedvideo:updatedVideoDetail
                  })
        }
      }
      else{
       res.status(500).json({message:"no permisson to update video"})
      }

    } catch (error) {
        console.log(error); 
        res.status(500).json({message : error});
    }
 });
// delete router //
Router.delete('/:videoId',validateToken,async (req,res)=>{
   try {
      const token = req.user
      const {email} = token
      const user = await userModel.findOne({email:email});
      const {_id,channelName} = user;
      const video = await videoModel.findOne({_id:req.params.videoId});
    
     if(video.user_id == _id){
    
    await cloudinary.uploader.destroy(video.videoId,{resource_type:'video'});
     await cloudinary.uploader.destroy(video.thumbnailId);
    const deletedresponse =  await videoModel.findByIdAndDelete(req.params.videoId);
         res.status(200).json({
            deleteddata:deletedresponse
         })
     }else{
      res.status(200).json({message:"you have no permisson"});
     }

   } catch (error) {
       console.log(error);

   }
})

// like route
Router.put("/like/:videoId",validateToken,async (req,res)=>{
   try {
      const token = req.user
      const {email} = token
      const user = await userModel.findOne({email:email});
      const {_id,channelName} = user;
      const video = await videoModel.findOne({_id:req.params.videoId});
      if(video.likedBy.includes(_id)){
         video.likes -= 1;
         video.likedBy = video.likedBy.filter(userid=> userid.toString() != _id)
         await video.save();
         return res.status(500).json({error:"already licked"})
      }
      if(video.dislikedBy.includes(_id)){
         video.dislike -= 1;
         video.dislikedBy = video.dislikedBy.filter(userid=> userid.toString() != _id);
      }
      video.likes += 1;
      video.likedBy.push(_id);
      await video.save();
      res.status(200).json({message:"liked"});

   } catch (error) {
       console.log(error);
       res.status(500).json({error:error});
   }
})

// dislike route
Router.put("/dislike/:videoId",validateToken,async (req,res)=>{
   try {
      const token = req.user
      const {email} = token
      const user = await userModel.findOne({email:email});
      const {_id,channelName} = user;
      const video = await videoModel.findOne({_id:req.params.videoId});
      if(video.dislikedBy.includes(_id)){
         video.dislike -= 1;
         video.dislikedBy = video.dislikedBy.filter(userid=> userid.toString() != _id)
         await video.save();
         return res.status(500).json({error:"already disliked"})
      }
      if(video.likedBy.includes(_id)){
         video.likes -= 1;
         video.likedBy = video.likedBy.filter(userid=>userid.toString() != _id);
      }
      video.dislike += 1;
      video.dislikedBy.push(_id);
      await video.save();
      res.status(200).json({message:"disliked"});

   } catch (error) {
       console.log(error);
       res.status(500).json({error:error});
   }
})
// view api route //
Router.put("/view/:videoId",async(req,res)=>{
   try {
      const video = await videoModel.findById(req.params.videoId);
       video.views += 1;
      console.log(video);
      await video.save();
      res.status(200).json({msg:video});
   } catch (error) {
       console.log(error);
   }


})
module.exports = Router;