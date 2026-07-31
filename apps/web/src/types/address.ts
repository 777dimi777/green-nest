export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  apartment: string | null;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
export interface AddressRequest {
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
  city: string;
  postalCode: string;
  street: string;
  streetNumber: string;
  apartment?: string;
  isDefault?: boolean;
}
