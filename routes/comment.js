const express = require('express');
const Router = express.Router();
const validateToken = require('../middleware/validateAuth');
const userModel = require('../models/User');
const commentModel = require('../models/Comment');
Router.post("/new-comment/:videoId", validateToken, async (req, res) => {
  try {
    const { email } = req.user;
    const user = await userModel.findOne({ email: email });
    const { _id } = user;
    const { commentText } = req.body;
    const newComment = await commentModel.create({

      user_id: _id,
      videoId: req.params.videoId,
      commentText: commentText,
    })
    const createdcomment = await newComment.save();
    console.log('comment added');
    res.status(200).json({ comment: createdcomment });
  } catch (error) {
    console.log(error);
  }
})
// get all comments route///
Router.get('/:videoId', async (req, res) => {
  try {
    const comments = await commentModel.find({ videoId: req.params.videoId }).populate('user_id');
    res.status(200).json({ comments: comments });
  } catch (error) {
    console.log(error);
  }
})
// update comment route//
Router.put("/:commentId", validateToken, async (req, res) => {
  try {

    const { email } = req.user;
    const user = await userModel.findOne({ email: email });

    const comment = await commentModel.findById(req.params.commentId);
    if (!comment) {
      return res.status(400).json({ msg: "no comment found" });
    }

    if (comment.user_id.toString() !== user._id.toString()) {

      return res.status(500).json({ error: "unauthorized access" });

    }

    comment.commentText = req.body.commentText;
    const updatedcomment = await comment.save();

    res.status(200).json({ updatedComment: updatedcomment });





  } catch (error) {
    console.log(error);

  }


})

// delete comment route //
Router.delete("/:commentId", validateToken, async (req, res) => {
  try {

    const { email } = req.user;
    const user = await userModel.findOne({ email: email });

    const comment = await commentModel.findById(req.params.commentId);
    if (comment.user_id.toString() !== user._id.toString()) {

      return res.status(500).json({ error: "unauthorized access" });

    }

    const deletedcomment = await commentModel.findByIdAndDelete(req.params.commentId)

    res.status(200).json({
      deletedresponse: deletedcomment,
    });


  } catch (error) {

  }
});
module.exports = Router;