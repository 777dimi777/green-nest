import { PageContainer } from "@/components/common/page-container";
import { ProtectedRoute } from "@/features/auth/components/protected-route";
import { WishlistPage } from "@/features/wishlist/components/wishlist-page";
export default function Page(){return <ProtectedRoute><PageContainer className="py-12"><WishlistPage/></PageContainer></ProtectedRoute>}
