import { pool, transaction } from "../src/db.js";
import { hashPassword } from "../src/passwords.js";
const email=(process.env.SEED_ADMIN_EMAIL||"admin@padaria.local").toLowerCase();
const password=process.env.SEED_ADMIN_PASSWORD||"TroqueEstaSenha123!";
const existing=await pool.query("SELECT 1 FROM tenants LIMIT 1");
if(existing.rowCount){console.log("Banco já possui empresa; seed inicial ignorado.");await pool.end();process.exit(0);}
await transaction(async db => {
  const t=await db.query("INSERT INTO tenants(name,cnpj) VALUES($1,$2) RETURNING id",["Pão & Gestão Padaria Artesanal","12.345.678/0001-90"]);
  const tenant=t.rows[0].id;
  const hash=await hashPassword(password);
  await db.query("INSERT INTO users(tenant_id,name,email,password_hash,role) VALUES($1,$2,$3,$4,'admin')",[tenant,"Marina Lima",email,hash]);
  const unitResult=await db.query("INSERT INTO units(tenant_id,name,abbreviation,decimal_allowed) VALUES($1,'Unidade','un',false) RETURNING id",[tenant]);
  const unitId=unitResult.rows[0].id;
  await db.query("INSERT INTO tenant_settings(tenant_id,trade_name) VALUES($1,$2)",[tenant,"Pão & Gestão"]);
  await db.query("INSERT INTO financial_categories(tenant_id,name,type,system) VALUES($1,'Vendas','income',true),($1,'Compras','expense',true),($1,'Despesas operacionais','expense',false),($1,'Outras receitas','income',false)",[tenant]);
  const categories={};
  for(const name of ["Pães","Folhados","Salgados","Doces","Bebidas"]){const r=await db.query("INSERT INTO categories(tenant_id,name) VALUES($1,$2) RETURNING id",[tenant,name]);categories[name]=r.rows[0].id;}
  const images=["https://images.unsplash.com/photo-1725297952102-ab28892a31ab?auto=format&fit=crop&w=500&q=80","https://images.unsplash.com/photo-1763207291761-e27bb059d851?auto=format&fit=crop&w=500&q=80","https://images.unsplash.com/photo-1594403758808-58d9e13cff40?auto=format&fit=crop&w=500&q=80","https://images.unsplash.com/photo-1787069943470-66fd161e100a?auto=format&fit=crop&w=500&q=80","https://images.unsplash.com/photo-1771757751633-4912e7282379?auto=format&fit=crop&w=500&q=80","https://images.unsplash.com/photo-1746959482020-e4f61eefba28?auto=format&fit=crop&w=500&q=80"];
  const products=[["Pão Francês","Pães",1.2,0.52,148,50,images[0]],["Croissant Francês","Folhados",12.9,5.6,24,10,images[1]],["Cookie Chocolate","Doces",8.5,3.4,32,12,images[2]],["Croissant Amêndoas","Folhados",15.9,7.1,16,8,images[3]],["Pão de Queijo","Salgados",6.5,2.8,8,20,images[4]],["Torta de Frutas","Doces",16.9,7.4,7,5,images[5]],["Baguete Artesanal","Pães",14.9,6.2,19,8,images[0]],["Cappuccino","Bebidas",9.9,2.7,99,20,images[3]]];
  for(let i=0;i<products.length;i++){const [n,c,p,cost,s,min,image]=products[i];await db.query("INSERT INTO products(tenant_id,category_id,unit_id,name,barcode,price,cost,stock,minimum_stock,image_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",[tenant,categories[c],unitId,n,`789000102${i+1}`,p,cost,s,min,image]);}
});
console.log(`Dados criados. Administrador: ${email}. Use a senha configurada no .env.`); await pool.end();
