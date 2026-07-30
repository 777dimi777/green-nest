import{CouponForm}from"@/features/admin/components/coupon-form";export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <CouponForm id={id}/>}
