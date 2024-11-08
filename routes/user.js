const express = require('express');
const Router = express.Router();
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const cloudinary = require("cloudinary").v2;
const dotenv = require('dotenv');
const userModel = require('../models/User');
const validateToken = require('../middleware/validateAuth');
dotenv.config();

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dqazvlsdd',
    api_key: '215172826878689',
    api_secret: 'BJ6iU96cv6X5LPEijfu6xpCcCNU'
});

Router.post("/signup", async (req, res) => {
    try {
        const { channelName, email, password, phone } = req.body;
        const { logoUrl } = req.files;  // Make sure to have express-fileupload middleware

        if (!channelName || !email || !password || !phone) {
            return res.status(400).json({ message: "Please fill all the input fields before registering" });
        }
        // Check if user already exists
        const existingUser = await userModel.findOne({ email: email, phone: phone });
        if (existingUser) {
            return res.status(400).json({ message: "Email has already been registered" });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 6);

        // Upload image to Cloudinary
        const uploadedImage = await cloudinary.uploader.upload(logoUrl.tempFilePath);


        // Create new user
        const newUser = await userModel.create({
            channelName: channelName,
            email: email,
            password: hashedPassword,
            phone: phone,
            logoUrl: uploadedImage.secure_url,
            logoId: uploadedImage.public_id,
        });

        // Return created user
        res.status(200).json({ user: newUser });
    } catch (error) {
        console.error(error);  // Log the error for debugging
        res.status(500).json({ error: error.message });
    }
});
// login route//

Router.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;
        console.log(`user password through frontend ${password}`)
        const user = await userModel.findOne({ email: email });
        console.log(`user infor from database ${user}`);
        if (!user) {
            return res.status(400).json({ message: "user not found" });
        }

        const ispasswordvalid = await bcrypt.compare(password, user.password,function(err,result){
            if(err){
                console.log(err);
            }else{
              
                console.log(`password validating result ${result}`)
            }
                  
        });
        console.log(`result of decrypting password ${ispasswordvalid}`);
        if (!ispasswordvalid) {
            return res.status(500).json({ message: "invalid password" });
        }
        const token = JWT.sign({ email: email, channelName: user.channelName, phone: user.phone, logoId: user.logoId }, process.env.TOKEN_SECRET_KEY, { expiresIn: '365d' });

        res.status(200).json({
            message: "user found",
            email: user.email,
            channelName: user.channelName,
            phone: user.phone,
            logoId: user.logoId,
            logoUrl: user.logoUrl,
            subscribers: user.subscribers,
            subscribedChannels: user.subscribedChannels,
            token: token,
            userId:user._id
        });


    } catch (error) {
        console.log(error);
    }
})

// subscribe route//
Router.put("/subscribe/:subscribingId", validateToken, async (req, res) => {
    try {
        const token = req.user
        const { email } = token
        const user = await userModel.findOne({ email: email });
        let { _id, channelName } = user;
        const subscribingchannel = await userModel.findOne({ _id: req.params.subscribingId });

        if (user.subscribedChannels.includes(req.params.subscribingId)) {
            subscribingchannel.subscribers -= 1;
            user.subscribedChannels = user.subscribedChannels.filter(userid => userid.toString() != req.params.subscribingId);
            subscribingchannel.subscribedBy = subscribingchannel.subscribedBy.filter(userid => userid.toString() != _id);
            await Promise.all([user.save(), subscribingchannel.save()]);
            return res.status(500).json({ message: "already subscribed" });
        }
        subscribingchannel.subscribers += 1;
        user.subscribedChannels.push(req.params.subscribingId);
        subscribingchannel.subscribedBy.push(_id);

        await Promise.all([user.save(), subscribingchannel.save()]);
        res.status(200).json({ msg: "subscribed succesfully" });
    } catch (error) {
        console.log(error)
    }

})


module.exports = Router;
