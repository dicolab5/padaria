import crypto from "node:crypto";
import express from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { transaction } from "./db.js";
import { AppError, asyncHandler } from "./errors.js";
import { hashPassword } from "./passwords.js";

export const publicRouter=express.Router();
const signupLimit=rateLimit({windowMs:60*60*1000,limit:5,standardHeaders:"draft-8",legacyHeaders:false,message:{error:{code:"RATE_LIMIT",message:"Muitas tentativas de cadastro. Tente novamente mais tarde."}}});
const signupSchema=z.object({
  bakeryName:z.string().trim().min(3).max(120),
  ownerName:z.string().trim().min(3).max(120),
  email:z.string().trim().toLowerCase().email().max(254),
  phone:z.string().trim().min(8).max(24),
  cnpj:z.string().trim().max(18).optional(),
  password:z.string().min(12).max(200),
  acceptTerms:z.literal(true),
  companyWebsite:z.string().max(0).default("")
}).superRefine((value,ctx)=>{if(value.cnpj&&value.cnpj.replace(/\D/g,"").length!==14)ctx.addIssue({code:"custom",path:["cnpj"],message:"CNPJ inválido."});});

publicRouter.post("/signup",signupLimit,asyncHandler(async(req,res)=>{
  const parsed=signupSchema.safeParse(req.body);
  if(!parsed.success)throw new AppError(422,"VALIDATION_ERROR","Confira os dados informados.",parsed.error.flatten().fieldErrors);
  const data=parsed.data,passwordHash=await hashPassword(data.password),portalCode=crypto.randomBytes(5).toString("hex").toUpperCase();
  try{const result=await transaction(async db=>{
    const tenant=await db.query(`INSERT INTO tenants(name,cnpj,plan,portal_code,subscription_status,trial_started_at,trial_ends_at)
      VALUES($1,$2,'trial',$3,'trial',now(),now()+interval '7 days') RETURNING id,name,trial_ends_at`,[data.bakeryName,data.cnpj||null,portalCode]);
    const tenantId=tenant.rows[0].id;
    const user=await db.query("INSERT INTO users(tenant_id,name,email,password_hash,role) VALUES($1,$2,$3,$4,'admin') RETURNING id,name,email,role",[tenantId,data.ownerName,data.email,passwordHash]);
    await db.query("INSERT INTO units(tenant_id,name,abbreviation,decimal_allowed) VALUES($1,'Unidade','un',false)",[tenantId]);
    await db.query("INSERT INTO tenant_settings(tenant_id,trade_name,phone,email) VALUES($1,$2,$3,$4)",[tenantId,data.bakeryName,data.phone,data.email]);
    await db.query("INSERT INTO financial_categories(tenant_id,name,type,system) VALUES($1,'Vendas','income',true),($1,'Compras','expense',true),($1,'Despesas operacionais','expense',false),($1,'Outras receitas','income',false)",[tenantId]);
    for(const name of ["Pães","Salgados","Doces","Bebidas"] )await db.query("INSERT INTO categories(tenant_id,name) VALUES($1,$2)",[tenantId,name]);
    return {tenant:tenant.rows[0],user:user.rows[0]};
  });res.status(201).json({message:"Degustação criada com sucesso.",trialEndsAt:result.tenant.trial_ends_at,email:result.user.email});}
  catch(error){if(error.code==="23505")throw new AppError(409,"EMAIL_IN_USE","Este e-mail já está cadastrado.");throw error;}
}));
