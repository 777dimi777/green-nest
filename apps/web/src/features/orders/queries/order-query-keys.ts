export const orderQueryKeys={all:["orders"] as const,list:["orders","my"] as const,detail:(id:string)=>["orders","my",id] as const};
