import { pool, transaction } from "../src/db.js";
const base=`http://localhost:${process.env.PORT||3000}/api`,email=`teste-crediario-${Date.now()}@local.invalid`;
let customerId,saleId,receivableId;
async function request(path,options={}){const r=await fetch(base+path,options),body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(`${path}: ${r.status} ${body.error?.message||""}`);return {r,body};}
try{
  const login=await request("/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:process.env.SEED_ADMIN_EMAIL,password:process.env.SEED_ADMIN_PASSWORD})});
  const cookie=login.r.headers.get("set-cookie").split(";")[0],headers={"content-type":"application/json",cookie,"x-csrf-token":login.body.csrf};
  const customer=await request("/customers",{method:"POST",headers,body:JSON.stringify({name:"Cliente Teste Crediário",email,active:true})});customerId=customer.body.id;
  const products=await request("/products",{headers});const product=products.body[0];
  const due=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
  const sale=await request("/sales",{method:"POST",headers,body:JSON.stringify({customerId,paymentMethod:"store_credit",dueAt:due,discount:0,notes:"Fluxo automatizado",items:[{productId:product.id,quantity:1}]})});saleId=sale.body.id;
  const statement=await request(`/customers/${customerId}/statement`,{headers});receivableId=statement.body.receivables[0]?.id;if(!receivableId||Number(statement.body.summary.balance)<=0)throw new Error("Conta a receber não foi criada.");
  const balance=Number(statement.body.receivables[0].balance);const payment=await request(`/credit/receivables/${receivableId}/payments`,{method:"POST",headers,body:JSON.stringify({amount:balance,paymentMethod:"pix",notes:"Teste automatizado"})});if(payment.body.receivableStatus!=="paid"||Number(payment.body.balance)!==0)throw new Error("Quitação não atualizou o saldo.");
  console.log(JSON.stringify({sale:sale.body.number,receivable:"created",payment:"paid",balance:0}));
}finally{
  if(saleId)await transaction(async db=>{const items=await db.query("SELECT product_id,quantity FROM sale_items WHERE sale_id=$1",[saleId]);for(const i of items.rows)await db.query("UPDATE products SET stock=stock+$1 WHERE id=$2",[i.quantity,i.product_id]);if(receivableId){await db.query("DELETE FROM cash_movements WHERE reference_id IN (SELECT id FROM customer_credit_payments WHERE receivable_id=$1)",[receivableId]);await db.query("DELETE FROM customer_credit_payments WHERE receivable_id=$1",[receivableId]);await db.query("DELETE FROM financial_entries WHERE reference_type='receivable' AND reference_id=$1",[receivableId]);await db.query("DELETE FROM customer_receivables WHERE id=$1",[receivableId]);}await db.query("DELETE FROM stock_movements WHERE reference_id=$1",[saleId]);await db.query("DELETE FROM sale_items WHERE sale_id=$1",[saleId]);await db.query("DELETE FROM audit_logs WHERE entity_id=$1",[saleId]);await db.query("DELETE FROM sales WHERE id=$1",[saleId]);});
  if(customerId)await pool.query("DELETE FROM customers WHERE id=$1",[customerId]);await pool.end();
}
