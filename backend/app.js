const express=require('express');
const cors=require('cors');
const app=express();
app.use(cors());
app.use(express.json({limit:'1mb'}));
app.use('/api/auth',require('./routes/auth'));
app.use('/api/sales',require('./routes/sales'));
app.get('/api/health',(_req,res)=>res.json({status:'Backend is running'}));
module.exports=app;
