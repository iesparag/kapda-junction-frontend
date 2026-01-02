import { Product } from './product.model';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  discount?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  packagingCharge: number;
  deliveryCharge: number;
  totalAmount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

