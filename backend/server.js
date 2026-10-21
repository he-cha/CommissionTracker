require('dotenv').config();
const mongoose=require('mongoose');
const {getJWTSecret}=require('./utils/config');
const app=require('./app');
getJWTSecret();
if (!process.env.MONGODB_URI)throw new Error('MONGODB_URI is required');
mongoose.connect(process.env.MONGODB_URI)
  .then(()=>app.listen(process.env.PORT || 5000,()=>console.log('Commission API started')))
  .catch(()=>{console.error('MongoDB connection failed');process.exitCode=1;});
