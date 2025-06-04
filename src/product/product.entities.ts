export interface CreateProductParams {
  name: string;
  description?: string;
  price: number;
  stock: number;
  userId: string;
}

export interface UpdateProductParams {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
}

export type ProductResponse= {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Product = Omit<ProductResponse, 'createdAt' | 'updatedAt'>;