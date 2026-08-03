export type UserRole = "ADMIN" | "USER";

export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "PAID"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface PackageRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  features: string[];
  imageUrl: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorRecord {
  id: string;
  name: string;
  category: string;
  description: string | null;
  price: number | null;
  contact: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  packageId: string;
  packageName: string;
  packagePrice: number;
  status: BookingStatus;
  weddingDate: string;
  venue: string;
  venueAddress: string;
  theme: string | null;
  guestCount: number;
  groomName: string;
  brideName: string;
  groomPhone: string;
  bridePhone: string;
  ceremonyType: string;
  notes: string | null;
  selectedVendorIds: string[];
  vendorTotal: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  userId: string;
  userName: string;
  amount: number;
  provider: "MIDTRANS" | "MANUAL";
  status: PaymentStatus;
  orderId: string | null;
  paymentUrl: string | null;
  proofUrl: string | null;
  proofPublicId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryRecord {
  id: string;
  bookingId: string | null;
  imageUrl: string;
  imagePublicId: string;
  caption: string | null;
  uploadedBy: string;
  createdAt: string;
}

export interface TimelineRecord {
  id: string;
  bookingId: string;
  title: string;
  description: string | null;
  eventTime: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageRecord {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  createdAt: string;
}
