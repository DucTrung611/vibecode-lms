export interface OrderItem {
  id: string;
  orderId: string;
  courseId: string;
  price: number;
  course?: { id: string; title: string; thumbnailUrl: string | null };
}

export interface Order {
  id: string;
  studentId: string;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
  paidAt: string | null;
  createdAt: string;
  items?: OrderItem[];
}
