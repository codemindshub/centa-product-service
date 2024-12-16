import Joi from 'joi';

// Creation Schema for Product
export const createProductSchema = Joi.object({
  sku: Joi.string()
    .trim()
    .max(100)
    .required()
    .pattern(/^[A-Za-z0-9-_]+$/)
    .messages({
      'string.base': 'SKU must be a string',
      'string.empty': 'SKU cannot be empty',
      'string.max': 'SKU cannot exceed 100 characters',
      'string.pattern.base': 'SKU can only contain alphanumeric characters, hyphens, and underscores',
      'any.required': 'SKU is required'
    }),
  
  name: Joi.string()
    .trim()
    .max(255)
    .required()
    .messages({
      'string.base': 'Product name must be a string',
      'string.empty': 'Product name cannot be empty',
      'string.max': 'Product name cannot exceed 255 characters',
      'any.required': 'Product name is required'
    }),
  
  description: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty',
      'any.required': 'Description is required'
    }),
  
  price: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Price must be a number',
      'number.precision': 'Price must have maximum 2 decimal places',
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  
  cost_price: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Cost price must be a number',
      'number.precision': 'Cost price must have maximum 2 decimal places',
      'number.min': 'Cost price cannot be negative',
      'any.required': 'Cost price is required'
    }),
  
  category_id: Joi.string()
    .trim()
    .optional()
    .allow(null)
    .messages({
      'string.base': 'Category ID must be a string',
      'string.trim': 'Category ID cannot have leading or trailing whitespace'
    }),
  
  barcode: Joi.string()
    .trim()
    .max(48)
    .required()
    .messages({
      'string.base': 'Barcode must be a string',
      'string.empty': 'Barcode cannot be empty',
      'string.max': 'Barcode cannot exceed 48 characters',
      'any.required': 'Barcode is required'
    }),
  
  max_stock_threshold: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Maximum stock threshold must be a number',
      'number.integer': 'Maximum stock threshold must be an integer',
      'number.min': 'Maximum stock threshold cannot be negative',
      'any.required': 'Maximum stock threshold is required'
    }),
  
  min_stock_threshold: Joi.number()
    .integer()
    .min(0)
    .required()
    .when('max_stock_threshold', {
      is: Joi.exist(),
      then: Joi.number().max(Joi.ref('max_stock_threshold'))
    })
    .messages({
      'number.base': 'Minimum stock threshold must be a number',
      'number.integer': 'Minimum stock threshold must be an integer',
      'number.min': 'Minimum stock threshold cannot be negative',
      'number.max': 'Minimum stock threshold cannot be greater than maximum stock threshold',
      'any.required': 'Minimum stock threshold is required'
    }),
  
  is_deleted: Joi.boolean()
    .optional()
    .default(false)
});

// Update Schema for Product
export const updateProductSchema = Joi.object({
  sku: Joi.string()
    .trim()
    .max(100)
    .pattern(/^[A-Za-z0-9-_]+$/)
    .optional()
    .messages({
      'string.base': 'SKU must be a string',
      'string.empty': 'SKU cannot be empty',
      'string.max': 'SKU cannot exceed 100 characters',
      'string.pattern.base': 'SKU can only contain alphanumeric characters, hyphens, and underscores'
    }),
  
  name: Joi.string()
    .trim()
    .max(255)
    .optional()
    .messages({
      'string.base': 'Product name must be a string',
      'string.empty': 'Product name cannot be empty',
      'string.max': 'Product name cannot exceed 255 characters'
    }),
  
  description: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description cannot be empty'
    }),
  
  price: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Price must be a number',
      'number.precision': 'Price must have maximum 2 decimal places',
      'number.min': 'Price cannot be negative'
    }),
  
  cost_price: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Cost price must be a number',
      'number.precision': 'Cost price must have maximum 2 decimal places',
      'number.min': 'Cost price cannot be negative'
    }),
  
  category_id: Joi.string()
    .trim()
    .optional()
    .allow(null)
    .messages({
      'string.base': 'Category ID must be a string',
      'string.trim': 'Category ID cannot have leading or trailing whitespace'
    }),
  
  barcode: Joi.string()
    .trim()
    .max(48)
    .optional()
    .messages({
      'string.base': 'Barcode must be a string',
      'string.empty': 'Barcode cannot be empty',
      'string.max': 'Barcode cannot exceed 48 characters'
    }),
  
  max_stock_threshold: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Maximum stock threshold must be a number',
      'number.integer': 'Maximum stock threshold must be an integer',
      'number.min': 'Maximum stock threshold cannot be negative'
    }),
  
  min_stock_threshold: Joi.number()
    .integer()
    .min(0)
    .optional()
    .when('max_stock_threshold', {
      is: Joi.exist(),
      then: Joi.number().max(Joi.ref('max_stock_threshold'))
    })
    .messages({
      'number.base': 'Minimum stock threshold must be a number',
      'number.integer': 'Minimum stock threshold must be an integer',
      'number.min': 'Minimum stock threshold cannot be negative',
      'number.max': 'Minimum stock threshold cannot be greater than maximum stock threshold'
    }),
  
  is_deleted: Joi.boolean()
    .optional()
});
