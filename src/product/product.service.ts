
import { prisma } from '../utils/db';
import { CreateProductParams, Product, UpdateProductParams } from './product.entities';

export const createProduct = async (data: CreateProductParams): Promise<Product> => {
  const product = await prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      stock: data.stock,
      userId: data.userId
    }
  });


  return product;
};

export const updateProduct = async (params: UpdateProductParams) => {
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: params.name,
      description: params.description,
      price: params.price,
      stock: params.stock
    }
  });

  return product;
};

export const deleteProduct = async (id: string) => {
  try {
    await prisma.product.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error('Error deleting product');
  }
};

export const getProduct = async (id: string):Promise<Product> => {
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};
export const getAllProducts = async ():Promise<Product[]> => {
  try {
    const products = await prisma.product.findMany();
    return products as Product[];
  } catch (error) {
    throw new Error('Error fetching products');
  }
};