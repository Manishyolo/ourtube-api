const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoute = require('./routes/user');
const videoRoute = require('./routes/video');
const commentRoute = require('./routes/comment');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const cors = require('cors');
dotenv.config()



const connectwithdatabase = async()=>{
     try {
        const response = await mongoose.connect(process.env.MONGODB_URI);
        console.log("connected with database...")
     } catch (error) {
         console.log(error)
     }
}

connectwithdatabase()

app.use(cors());
app.use(bodyParser.json())
app.use(fileUpload({
    useTempFiles:true,
  
}))
app.use("/user",userRoute);
app.use("/video",videoRoute);
app.use('/comment',commentRoute);


module.exports = app;