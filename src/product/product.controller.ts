import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { validationResult } from 'express-validator';
import { ProductSchema } from './product.schema';
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getAllProducts
} from './product.service';

export const createProductHandler = [
  ...ProductSchema.create(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(JSON.stringify({ errors: errors.array() }));
    }

    const {body,user} = req;

    const{id} = user!;

    const product = await createProduct({
      ...body,
      userId: id
    });

    res.status(201).json(product);
  })
];

export const updateProductHandler = [
  ...ProductSchema.update(),
  asyncHandler(async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400);
      throw new Error(JSON.stringify({ errors: errors.array() }));
    }

    const product = await updateProduct({
      id: req.params.id,
      ...req.body
    });

    res.json(product);
  })
];

export const deleteProductHandler = asyncHandler(async (req: Request, res: Response) => {
  await deleteProduct(req.params.id);
  res.status(204).send();
});


export const getProductHandler = asyncHandler(async (req: Request, res: Response) => {
  const product = await getProduct(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }
  res.json(product);
});

export const getAllProductsHandler = asyncHandler(async (req: Request, res: Response) => {
  const products = await getAllProducts();
  res.json(products);
});