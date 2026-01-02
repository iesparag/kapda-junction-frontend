export interface Category {
  id: string;
  name: string;
  slug: string;
  productModuleId: string;
  parentCategoryId?: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

