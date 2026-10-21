const {test,before,after}=require('node:test');
const assert=require('node:assert/strict');
const jwt=require('jsonwebtoken');
const app=require('../app');
const auth=require('../middleware/auth');
const {saleInput}=require('../utils/validation');
const Sale=require('../models/Sale');
let server,base;
const secret='synthetic-unit-secret-with-more-than-thirty-two-characters';
const owner='a'.repeat(24),other='b'.repeat(24),id='c'.repeat(24);
const sample={imei:'123456789012345',email:'demo@example.com',storeLocation:'business-loop',category:'new-line',activationDate:'2024-01-01'};
const token=()=>jwt.sign({id:owner},secret,{expiresIn:'1h'});
before(async()=>{process.env.JWT_SECRET=secret;server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;});
after(async()=>{await new Promise(r=>server.close(r));});
async function request(path,method='GET',body,credential=token()){return fetch(base+path,{method,headers:{'Content-Type':'application/json',...(credential?{Authorization:'Bearer '+credential}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});}
test('requires auth on reads and writes; rejects invalid/expired tokens',async()=>{
 for(const method of ['GET','POST'])assert.equal((await request('/api/sales',method,method==='POST'?sample:undefined,null)).status,401);
 for(const t of ['bad',jwt.sign({id:owner},secret,{expiresIn:-1}),jwt.sign({id:owner},'wrong-secret',{expiresIn:'1h'}),jwt.sign({id:owner},secret)])assert.equal((await request('/api/sales','GET',undefined,t)).status,401);
});
test('rejects non-string login credentials before querying MongoDB',async()=>assert.equal((await request('/api/auth/login','POST',{username:{$ne:null},password:'x'},null)).status,400));
test('sale fields reject ownership/operator injection and invalid schema types',()=>{
 assert.equal(saleInput(sample).category,'new-line');
 for(const p of [{userId:other},{$set:{status:'active'}},{category:'unknown'},{storeLocation:'unknown'},{email:'bad'},{activationDate:'2024-02-30'}])assert.throws(()=>saleInput({...sample,...p}));
 assert.equal(new Sale(saleInput(sample)).validateSync(),undefined);
});
test('nested bounty input enforces unique months, typed booleans and finite amounts',()=>{
 const month={monthNumber:1,paid:true,payments:[{type:'Synthetic',amount:-10}],dateChecked:'2024-02-01T12:00:00.000Z'};
 assert.equal(saleInput({...sample,bountyTracking:[month]}).bountyTracking[0].dateChecked,month.dateChecked);
 for(const bountyTracking of [[month,month],[{...month,monthNumber:9}],[{...month,paid:'false'}],[{...month,payments:[{type:'x',amount:Infinity}]}]])assert.throws(()=>saleInput({...sample,bountyTracking}));
});
test('read, update and delete queries remain scoped to the verified user',async()=>{
 const originals={find:Sale.find,findOneAndUpdate:Sale.findOneAndUpdate,findOneAndDelete:Sale.findOneAndDelete};const calls=[];
 Sale.find=async filter=>{calls.push(filter);return [];};
 Sale.findOneAndUpdate=async(filter,update,options)=>{calls.push(filter);assert.deepEqual(update,{$set:{notes:'Reviewed'}});assert.equal(options.runValidators,true);return null;};
 Sale.findOneAndDelete=async filter=>{calls.push(filter);return null;};
 try{
  assert.equal((await request('/api/sales')).status,200);
  assert.equal((await request('/api/sales/'+id,'PUT',{notes:'Reviewed'})).status,404);
  assert.equal((await request('/api/sales/'+id,'DELETE')).status,404);
  assert.deepEqual(calls,[{userId:owner},{_id:id,userId:owner},{_id:id,userId:owner}]);
 }finally{Object.assign(Sale,originals);}
});
test('rejects invalid IDs and ownership fields without an update query',async()=>{
 let called=false;const original=Sale.findOneAndUpdate;Sale.findOneAndUpdate=async()=>{called=true;return {};};
 try{assert.equal((await request('/api/sales/bad-id','PUT',{notes:'x'})).status,400);assert.equal((await request('/api/sales/'+id,'PUT',{userId:other})).status,400);assert.equal(called,false);}finally{Sale.findOneAndUpdate=original;}
});
test('missing secret configuration cannot grant access',()=>{delete process.env.JWT_SECRET;let status;const res={status(n){status=n;return this;},json(){}};try{auth({get:()=>''},res,()=>assert.fail('must not authorize'));assert.equal(status,503);}finally{process.env.JWT_SECRET=secret;}});
