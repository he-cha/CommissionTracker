const jwt = require('jsonwebtoken');
const { getJWTSecret } = require('../utils/config');
module.exports = (req,res,next) => {
  let secret;
  try {secret=getJWTSecret();}catch{return res.status(503).json({error:'Authentication is not configured'});}
  const match=/^Bearer ([^\s]+)$/i.exec(req.get('Authorization') || '');
  if (!match)return res.status(401).json({error:'Sign in required'});
  try {
    const payload=jwt.verify(match[1],secret,{algorithms:['HS256']});
    if (typeof payload==='string' || typeof payload.id!=='string' || !/^[a-f\d]{24}$/i.test(payload.id) || typeof payload.exp!=='number')return res.status(401).json({error:'Invalid session'});
    req.user={id:payload.id};
    next();
  }catch{return res.status(401).json({error:'Invalid or expired session'});}
};
