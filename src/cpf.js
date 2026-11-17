export const normalizeCpf=value=>String(value||"").replace(/\D/g,"");

export function isValidCpf(value){
  const cpf=normalizeCpf(value);
  if(cpf.length!==11||/^(\d)\1{10}$/.test(cpf))return false;
  const digit=length=>{let sum=0;for(let index=0;index<length;index++)sum+=Number(cpf[index])*(length+1-index);const rest=(sum*10)%11;return rest===10?0:rest;};
  return digit(9)===Number(cpf[9])&&digit(10)===Number(cpf[10]);
}
