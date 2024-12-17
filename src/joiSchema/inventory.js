import Joi from 'joi'

const createInventorySchema = Joi.object({
  product_sku: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.base': 'Product SKU must be a string',
      'string.empty': 'Product SKU cannot be empty',
      'string.max': 'Product SKU cannot exceed 100 characters',
      'any.required': 'Product SKU is required'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity cannot be negative',
      'any.required': 'Quantity is required'
    }),
  
  qauntity_reserved: Joi.number()
    .integer()
    .min(0)
    .default(0)
    .messages({
      'number.base': 'Reserved quantity must be a number',
      'number.integer': 'Reserved quantity must be an integer',
      'number.min': 'Reserved quantity cannot be negative'
    }),
  
  batch_number: Joi.string()
    .trim()
    .max(100)
    .required()
    .messages({
      'string.base': 'Batch number must be a string',
      'string.empty': 'Batch number cannot be empty',
      'string.max': 'Batch number cannot exceed 100 characters',
      'any.required': 'Batch number is required'
    }),
  
  location: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Location must be a string',
      'string.empty': 'Location cannot be empty',
      'any.required': 'Location is required'
    }),
  
  manufacturing_date: Joi.date()
    .iso()
    .required()
    .messages({
      'date.base': 'Manufacturing date must be a valid date',
      'date.format': 'Manufacturing date must be in ISO format',
      'any.required': 'Manufacturing date is required'
    }),
  
  expiry_date: Joi.date()
    .iso()
    .min(Joi.ref('manufacturing_date'))
    .required()
    .messages({
      'date.base': 'Expiry date must be a valid date',
      'date.format': 'Expiry date must be in ISO format',
      'date.min': 'Expiry date must be after manufacturing date',
      'any.required': 'Expiry date is required'
    }),
  
  is_deleted: Joi.boolean()
    .default(false)
});

// Update Schema for Inventory
const updateInventorySchema = Joi.object({
  product_sku: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Product SKU must be a string',
      'string.empty': 'Product SKU cannot be empty',
      'string.max': 'Product SKU cannot exceed 100 characters'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'number.min': 'Quantity cannot be negative'
    }),
  
  qauntity_reserved: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Reserved quantity must be a number',
      'number.integer': 'Reserved quantity must be an integer',
      'number.min': 'Reserved quantity cannot be negative'
    }),
  
  batch_number: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Batch number must be a string',
      'string.empty': 'Batch number cannot be empty',
      'string.max': 'Batch number cannot exceed 100 characters'
    }),
  
  location: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'Location must be a string',
      'string.empty': 'Location cannot be empty'
    }),
  
  manufacturing_date: Joi.date()
    .iso()
    .optional()
    .messages({
      'date.base': 'Manufacturing date must be a valid date',
      'date.format': 'Manufacturing date must be in ISO format'
    }),
  
  expiry_date: Joi.date()
    .iso()
    .min(Joi.ref('manufacturing_date'))
    .optional()
    .when('manufacturing_date', {
      is: Joi.exist(),
      then: Joi.required()
    })
    .messages({
      'date.base': 'Expiry date must be a valid date',
      'date.format': 'Expiry date must be in ISO format',
      'date.min': 'Expiry date must be after manufacturing date'
    }),
  
  is_deleted: Joi.boolean()
    .optional()
});
