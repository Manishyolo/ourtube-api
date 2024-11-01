const JWT = require('jsonwebtoken');
const dotenv = require('dotenv')

dotenv.config();
const validateToken = async(req,res,next)=>{
          try {
             const token = req.headers.authorization.split(" ")[1];
             const verifytoken = await JWT.verify(token,process.env.TOKEN_SECRET_KEY)
                  console.log(token,verifytoken)    
                  req.user = verifytoken  
                 next()        

          } catch (error) {
             console.log(error);
             return res.status(500).json({message:"invalid token"})
          }         
}




module.exports = validateToken;