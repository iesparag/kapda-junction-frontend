export interface Product {
  id: string;
  name: string;
  description: string;
  images: string[];
  price: number;
  discount?: number;
  stock: number;
  productModuleId: string;
  categoryId: string;
  subcategoryId?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

