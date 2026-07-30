import { PageContainer } from "@/components/common/page-container";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { CartPage } from "@/features/cart/components/cart-page";
export default function Page(){return <ProtectedRoute><PageContainer className="py-12"><CartPage/></PageContainer></ProtectedRoute>}
