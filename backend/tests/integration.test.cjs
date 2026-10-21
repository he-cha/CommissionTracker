const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {MongoMemoryServer}=require('mongodb-memory-server');
const app=require('../app');
const User=require('../models/User');
const Sale=require('../models/Sale');
const {saleInput}=require('../utils/validation');
let db,server,base,tokenA,tokenB,owner;
const secret='test-only-secret-that-is-not-a-deployment-credential-123456';
const sample={imei:'123456789012345',storeLocation:'business-loop',category:'new-line',email:'demo@example.com',activationDate:'2024-01-01',status:'active',bountyTracking:[{monthNumber:1,paid:false,payments:[{type:'Synthetic commission',amount:25}]}]};
async function request(path,method='GET',body,credential=tokenA){
 const response=await fetch(base+path,{method,headers:{'Content-Type':'application/json',...(credential?{Authorization:'Bearer '+credential}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 return {status:response.status,body:await response.json()};
}
before(async()=>{
 process.env.JWT_SECRET=secret;db=await MongoMemoryServer.create();await mongoose.connect(db.getUri());
 owner=await User.create({username:'owner',password:await bcrypt.hash('test-password',4)});
 await User.create({username:'other',password:await bcrypt.hash('test-password',4)});
 server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
 tokenA=(await request('/api/auth/login','POST',{username:'owner',password:'test-password'},null)).body.token;
 tokenB=(await request('/api/auth/login','POST',{username:'other',password:'test-password'},null)).body.token;
});
after(async()=>{if(server)await new Promise(resolve=>server.close(resolve));await mongoose.disconnect();if(db)await db.stop();});
test('unauthenticated requests and expired tokens return 401',async()=>{
 assert.equal((await request('/api/sales','GET',undefined,null)).status,401);
 assert.equal((await request('/api/sales','POST',sample,null)).status,401);
 for(const token of ['garbage',jwt.sign({id:String(owner._id)},secret,{expiresIn:-1}),jwt.sign({id:String(owner._id)},secret)])assert.equal((await request('/api/sales','GET',undefined,token)).status,401);
});
test('rejects login selector injection',async()=>assert.equal((await request('/api/auth/login','POST',{username:{$ne:null},password:'x'},null)).status,400));
test('sales are owned by the authenticated user and inaccessible to another user',async()=>{
 const created=await request('/api/sales','POST',sample);assert.equal(created.status,201);assert.equal(created.body.userId,String(owner._id));
 const id=created.body._id;
 assert.equal((await request('/api/sales','GET',undefined,tokenB)).body.length,0);
 assert.equal((await request('/api/sales/'+id,'PUT',{notes:'Unauthorized edit'},tokenB)).status,404);
 assert.equal((await request('/api/sales/'+id,'DELETE',undefined,tokenB)).status,404);
 assert.equal((await Sale.findById(id)).notes,undefined);
 assert.equal((await request('/api/sales/'+id,'PUT',{userId:'b'.repeat(24)})).status,400);
 assert.equal((await request('/api/sales/'+id,'PUT',{$set:{status:'deactivated'}})).status,400);
 assert.equal((await request('/api/sales/'+id,'PUT',{status:'invalid'})).status,400);
 assert.equal((await request('/api/sales/'+id,'PUT',{notes:'Reviewed'})).body.notes,'Reviewed');
 assert.equal((await request('/api/sales/'+id,'DELETE')).status,200);
});
test('rejects invalid dates, email, enums and nested payments before persistence',async()=>{
 const before=await Sale.countDocuments();
 for(const body of [{...sample,activationDate:'2024-02-30'},{...sample,email:'not-email'},{...sample,category:'invalid'},{...sample,bountyTracking:[{monthNumber:8,paid:false,payments:[]}]},{...sample,bountyTracking:[{monthNumber:1,paid:'false',payments:[]}]},{...sample,bountyTracking:[{monthNumber:1,paid:false,payments:[{type:'x',amount:'25'}]}]}])assert.equal((await request('/api/sales','POST',body)).status,400);
 assert.equal(await Sale.countDocuments(),before);
 assert.throws(()=>saleInput({...sample,bountyTracking:[{monthNumber:1,paid:false,payments:[{type:'x',amount:NaN}]}]}));
});
test('supports legacy dateChecked and validates update schema',async()=>{
 const created=await request('/api/sales','POST',sample);const id=created.body._id;
 const updated=await request('/api/sales/'+id,'PUT',{bountyTracking:[{monthNumber:1,paid:true,payments:[],dateChecked:'2024-02-01T12:00:00.000Z'}]});
 assert.equal(updated.status,200);assert.equal(updated.body.bountyTracking[0].dateChecked,'2024-02-01T12:00:00.000Z');
 assert.equal((await request('/api/sales/bad-id','DELETE')).status,400);
});
test('secret configuration failures do not permit access',async()=>{
 delete process.env.JWT_SECRET;try{assert.equal((await request('/api/sales')).status,503);}finally{process.env.JWT_SECRET=secret;}
});
