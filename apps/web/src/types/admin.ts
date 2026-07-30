import type { PaginationMeta } from "./api";
import type { Order, OrderStatus, PaymentMethod, PaymentStatus } from "./order";
import type { NotificationType } from "./notification";
import type { User, UserRole } from "./user";
export interface AnalyticsOverview { totals:{revenue:number;orders:number;users:number;products:number;completedPayments:number;failedPayments:number;couponsUsed:number}; averages:{orderValue:number} }
export interface RevenueSeries { granularity:"DAY"|"MONTH";data:{date:string;revenue:number;orders:number}[] }
export interface UsersSeries { granularity:"DAY"|"MONTH";data:{date:string;users:number}[] }
export interface OrdersAnalytics { total:number;statuses:{status:OrderStatus;count:number;percentage:number}[] }
export interface PaymentAnalytics { totals:{attempts:number;completed:number;failed:number;pending:number;refunded:number};successRate:number }
export interface AdminList<T> { data:T[];pagination:PaginationMeta }
export interface AdminOrderSummary extends Pick<Order,"id"|"orderNumber"|"status"|"paymentStatus"|"subtotal"|"shippingPrice"|"discount"|"totalPrice"|"createdAt"|"updatedAt"> { user:{id:string;firstName:string;lastName:string;email:string} }
export interface AdminOrder extends Order { user:{id:string;firstName:string;lastName:string;email:string};coupon:{id:string;code:string}|null;payment:AdminPayment|null }
export interface AdminPayment { id:string;method:PaymentMethod;status:"PENDING"|"COMPLETED"|"FAILED"|"REFUNDED";amount:number|string;currency:string;provider:string;providerTransactionId:string|null;failureReason:string|null;paidAt:string|null;createdAt:string;updatedAt:string;order:{id:string;orderNumber:string;totalPrice:number|string;status:string;paymentStatus:string};user:{id:string;firstName:string;lastName:string;email:string} }
export type AdminUser=User;
export interface AdminUserDetails extends User { statistics:{orders:number;reviews:number;wishlistItems:number;addresses:number;totalSpent:number} }
export interface Coupon { id:string;code:string;description:string|null;percentage:number|null;fixedAmount:number|string|null;minimumOrder:number|string|null;usageLimit:number|null;usedCount:number;active:boolean;startsAt:string|null;expiresAt:string|null;createdAt:string;updatedAt:string }
export interface CouponRequest { code:string;description?:string;percentage?:number|null;fixedAmount?:number|null;minimumOrder?:number;usageLimit?:number;active?:boolean;startsAt?:string|null;expiresAt?:string|null }
export interface AdminOrderQuery { search?:string;page?:number;limit?:number;status?:OrderStatus;paymentStatus?:PaymentStatus;userId?:string;from?:string;to?:string;sortBy?:"createdAt"|"updatedAt"|"totalPrice"|"status"|"paymentStatus";sortOrder?:"asc"|"desc" }
export interface AdminPaymentQuery { search?:string;page?:number;limit?:number;status?:AdminPayment["status"];method?:PaymentMethod;orderId?:string;sortBy?:"createdAt"|"amount"|"status"|"method";sortOrder?:"asc"|"desc" }
export interface AdminCouponQuery { search?:string;page?:number;limit?:number;active?:boolean;type?:"PERCENTAGE"|"FIXED";expired?:boolean;sortBy?:"createdAt"|"code"|"expiresAt"|"usedCount";sortOrder?:"asc"|"desc" }
export interface AdminUserQuery { search?:string;page?:number;limit?:number;role?:UserRole }
export interface AdminNotification { id:string;type:NotificationType;title:string;message:string;read:boolean;readAt:string|null;orderId:string|null;paymentId:string|null;createdAt:string;user:{id:string;firstName:string;lastName:string;email:string} }
export interface AdminNotificationQuery { search?:string;userId?:string;read?:boolean;type?:NotificationType;page?:number;limit?:number }
