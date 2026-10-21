const textFields = new Set(['imei','storeLocation','category','customerName','customerPin','email','activationDate','status','notes']);
const stores = new Set(['paris-rd','business-loop','jefferson-city','sedalia']);
const categories = new Set(['new-line','port-in','upgrade','finance-postpaid','add-a-line','port-in-add-a-line','byod']);
function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.getPrototypeOf(value) !== Object.prototype) throw new Error('Expected a JSON object');
  return value;
}
function date(value) {
  const d = new Date(value);
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value) && Number.isFinite(d.getTime()) && d.toISOString().slice(0,10) === value.slice(0,10);
}
function bounty(items) {
  if (!Array.isArray(items) || items.length > 6) throw new Error('Supply at most six bounty months');
  const months = new Set();
  return items.map(item => {
    object(item);
    if (Object.keys(item).some(k=>!['_id','monthNumber','paid','payments','datePaid','dateChecked','notes'].includes(k))) throw new Error('Unexpected bounty field');
    if (!Number.isInteger(item.monthNumber) || item.monthNumber<1 || item.monthNumber>6 || months.has(item.monthNumber)) throw new Error('Invalid or duplicate bounty month');
    months.add(item.monthNumber);
    if (typeof item.paid !== 'boolean') throw new Error('paid must be boolean');
    if (!Array.isArray(item.payments) || item.payments.length>100) throw new Error('Invalid payments');
    const payments=item.payments.map(p=>{
      object(p);
      if (Object.keys(p).some(k=>!['_id','type','amount'].includes(k)) || typeof p.type!=='string' || !p.type.trim() || p.type.length>255 || typeof p.amount!=='number' || !Number.isFinite(p.amount)) throw new Error('Invalid payment');
      return {type:p.type.trim(),amount:p.amount};
    });
    const clean={monthNumber:item.monthNumber,paid:item.paid,payments};
    for (const key of ['datePaid','dateChecked','notes']) {
      if (item[key]===undefined)continue;
      if (typeof item[key]!=='string' || item[key].length>10000)throw new Error(`Invalid ${key}`);
      if (key!=='notes' && item[key] && !date(item[key]))throw new Error(`Invalid ${key}`);
      clean[key]=item[key];
    }
    return clean;
  });
}
function saleInput(body, partial=false) {
  object(body);const clean={};
  for (const [key,value] of Object.entries(body)) {
    if (['_id','id','__v','createdAt','updatedAt'].includes(key)) continue;
    if (key==='bountyTracking') {clean[key]=bounty(value);continue;}
    if (!textFields.has(key))throw new Error(`Unexpected sale field: ${key}`);
    if (typeof value!=='string' || value.length>(key==='notes'?10000:1000))throw new Error(`Invalid ${key}`);
    const v=key==='notes'?value:value.trim();
    if (['imei','email','activationDate'].includes(key) && !v)throw new Error(`Invalid ${key}`);
    if (key==='imei' && v.length>128)throw new Error('Invalid imei');
    if (key==='email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))throw new Error('Invalid email');
    if (key==='activationDate' && !date(v))throw new Error('Invalid activationDate');
    if (key==='storeLocation' && !stores.has(v))throw new Error('Invalid storeLocation');
    if (key==='category' && !categories.has(v))throw new Error('Invalid category');
    if (key==='status' && !['active','deactivated'].includes(v))throw new Error('Invalid status');
    clean[key]=v;
  }
  if (!partial && ['imei','email','activationDate','category','storeLocation'].some(k=>!clean[k]))throw new Error('Required sale fields are missing');
  if (!Object.keys(clean).length)throw new Error('No editable fields supplied');
  return clean;
}
function validateSale(partial=false) {
  return (req,res,next)=>{
    try {req.body=saleInput(req.body,partial);next();}
    catch(error){res.status(400).json({error:error.message});}
  };
}
function validateId(req,res,next) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id))return res.status(400).json({error:'Invalid sale ID'});
  next();
}
module.exports={saleInput,validateSale,validateId};
