import Joi from 'joi';

// Creation Schema for ProductVariant
export const createProductVariantSchema = Joi.object({
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
  
  variant_name: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.base': 'Variant name must be a string',
      'string.empty': 'Variant name cannot be empty',
      'string.max': 'Variant name cannot exceed 200 characters',
      'any.required': 'Variant name is required'
    }),
  
  variant_value: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.base': 'Variant value must be a string',
      'string.empty': 'Variant value cannot be empty',
      'string.max': 'Variant value cannot exceed 200 characters',
      'any.required': 'Variant value is required'
    }),
  
  brand: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.base': 'Brand must be a string',
      'string.empty': 'Brand cannot be empty',
      'string.max': 'Brand cannot exceed 200 characters',
      'any.required': 'Brand is required'
    }),
  
  unit_price: Joi.number()
    .precision(2)
    .min(0)
    .required()
    .messages({
      'number.base': 'Unit price must be a number',
      'number.precision': 'Unit price must have maximum 2 decimal places',
      'number.min': 'Unit price cannot be negative',
      'any.required': 'Unit price is required'
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
    })
});

// Update Schema for ProductVariant
export const updateProductVariantSchema = Joi.object({
  product_sku: Joi.string()
    .trim()
    .max(100)
    .optional()
    .messages({
      'string.base': 'Product SKU must be a string',
      'string.empty': 'Product SKU cannot be empty',
      'string.max': 'Product SKU cannot exceed 100 characters'
    }),
  
  variant_name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.base': 'Variant name must be a string',
      'string.empty': 'Variant name cannot be empty',
      'string.max': 'Variant name cannot exceed 200 characters'
    }),
  
  variant_value: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.base': 'Variant value must be a string',
      'string.empty': 'Variant value cannot be empty',
      'string.max': 'Variant value cannot exceed 200 characters'
    }),
  
  brand: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.base': 'Brand must be a string',
      'string.empty': 'Brand cannot be empty',
      'string.max': 'Brand cannot exceed 200 characters'
    }),
  
  unit_price: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Unit price must be a number',
      'number.precision': 'Unit price must have maximum 2 decimal places',
      'number.min': 'Unit price cannot be negative'
    }),
  
  cost_price: Joi.number()
    .precision(2)
    .min(0)
    .optional()
    .messages({
      'number.base': 'Cost price must be a number',
      'number.precision': 'Cost price must have maximum 2 decimal places',
      'number.min': 'Cost price cannot be negative'
    })
});

// Validation function for unique constraint
export function validateUniqueConstraint(data) {
  const uniqueConstraintSchema = Joi.object({
    variant_name: Joi.string().required(),
    variant_value: Joi.string().required(),
    product_sku: Joi.string().required(),
    brand: Joi.string().required()
  });

  return uniqueConstraintSchema.validate(data);
}
