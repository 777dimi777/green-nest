import{CategoryForm}from"@/features/admin/components/category-form";export default async function Page({params}:{params:Promise<{id:string}>}){const{id}=await params;return <CategoryForm id={id}/>}
