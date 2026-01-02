export interface ProductModule {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  bannerImage?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

