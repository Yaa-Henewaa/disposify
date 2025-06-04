import { body, ValidationChain } from 'express-validator';

export class ProductSchema {
  static create(): ValidationChain[] {
    return [
      body('name').notEmpty().withMessage('Name is required'),
      body('price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
      body('stock')
        .isInt({ min: 0 })
        .withMessage('Stock must be a positive integer'),
      body('description').optional().isString()
    ];
  }

  static update(): ValidationChain[] {
    return [
      body('name').optional().notEmpty().withMessage('Name cannot be empty'),
      body('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
      body('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a positive integer'),
      body('description').optional().isString()
    ];
  }
}