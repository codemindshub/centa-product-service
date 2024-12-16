import Joi from 'joi';

// Creation Schema for Category
export const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(200)
    .required()
    .messages({
      'string.base': 'Category name must be a string',
      'string.empty': 'Category name cannot be empty',
      'string.max': 'Category name cannot exceed 200 characters',
      'any.required': 'Category name is required'
    }),
  
  parent_id: Joi.string()
    .trim()
    .optional()
    .allow(null)
    .messages({
      'string.base': 'Parent category ID must be a string',
      'string.trim': 'Parent category ID cannot have leading or trailing whitespace'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 500 characters'
    })
});

// Update Schema for Category
export const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .max(200)
    .optional()
    .messages({
      'string.base': 'Category name must be a string',
      'string.empty': 'Category name cannot be empty',
      'string.max': 'Category name cannot exceed 200 characters'
    }),
  
  parent_id: Joi.string()
    .trim()
    .optional()
    .allow(null)
    .messages({
      'string.base': 'Parent category ID must be a string',
      'string.trim': 'Parent category ID cannot have leading or trailing whitespace'
    }),
  
  description: Joi.string()
    .trim()
    .max(500)
    .optional()
    .allow('')
    .messages({
      'string.base': 'Description must be a string',
      'string.max': 'Description cannot exceed 500 characters'
    })
});
