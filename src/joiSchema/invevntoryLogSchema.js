import Joi from 'joi';

// Enum for Inventory Movement Type
export const InventoryMovementType = {
  stock_in: 'stock_in',
  stock_out:'stock_out',
  stock_removed: 'stock_removed',
  transfer: 'transfer',
};

// Creation Schema for InventoryLog
export const createInventoryLogSchema = Joi.object({
  inventory_id: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Inventory ID must be a string',
      'string.empty': 'Inventory ID cannot be empty',
      'any.required': 'Inventory ID is required'
    }),
  
  type: Joi.string()
    .valid(...Object.values(InventoryMovementType))
    .required()
    .messages({
      'any.only': 'Invalid inventory movement type',
      'any.required': 'Inventory movement type is required'
    }),
  
  qunatity: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer',
      'any.required': 'Quantity is required'
    }),
  
  source_inventory_id: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Source Inventory ID must be a string',
      'string.empty': 'Source Inventory ID cannot be empty',
      'any.required': 'Source Inventory ID is required'
    }),
  
  destination_inventory_id: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Destination Inventory ID must be a string',
      'string.empty': 'Destination Inventory ID cannot be empty',
      'any.required': 'Destination Inventory ID is required'
    }),
  
  creator_id: Joi.string()
    .trim()
    .required()
    .messages({
      'string.base': 'Creator ID must be a string',
      'string.empty': 'Creator ID cannot be empty',
      'any.required': 'Creator ID is required'
    }),
  
  movement_reason: Joi.string()
    .trim()
    .max(500)
    .required()
    .messages({
      'string.base': 'Movement reason must be a string',
      'string.empty': 'Movement reason cannot be empty',
      'string.max': 'Movement reason cannot exceed 500 characters',
      'any.required': 'Movement reason is required'
    })
});

// Update Schema for InventoryLog
export const updateInventoryLogSchema = Joi.object({
  inventory_id: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'Inventory ID must be a string',
      'string.empty': 'Inventory ID cannot be empty'
    }),
  
  type: Joi.string()
    .valid(...Object.values(InventoryMovementType))
    .optional()
    .messages({
      'any.only': 'Invalid inventory movement type'
    }),
  
  qunatity: Joi.number()
    .integer()
    .optional()
    .messages({
      'number.base': 'Quantity must be a number',
      'number.integer': 'Quantity must be an integer'
    }),
  
  source_inventory_id: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'Source Inventory ID must be a string',
      'string.empty': 'Source Inventory ID cannot be empty'
    }),
  
  destination_inventory_id: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'Destination Inventory ID must be a string',
      'string.empty': 'Destination Inventory ID cannot be empty'
    }),
  
  creator_id: Joi.string()
    .trim()
    .optional()
    .messages({
      'string.base': 'Creator ID must be a string',
      'string.empty': 'Creator ID cannot be empty'
    }),
  
  movement_reason: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.base': 'Movement reason must be a string',
      'string.empty': 'Movement reason cannot be empty',
      'string.max': 'Movement reason cannot exceed 500 characters'
    })
});

// Validation function to ensure source and destination inventories are different
export function validateInventoryLogConstraints(data) {
  if (data.source_inventory_id === data.destination_inventory_id) {
    return {
      error: {
        details: [{
          message: 'Source and destination inventory IDs must be different'
        }]
      }
    };
  }
  return { value: data };
}

// Optional: Validation functions for easier error handling
export function validateCreateInventoryLog(data) {
  const creationValidation = createInventoryLogSchema.validate(data);
  if (creationValidation.error) return creationValidation;

  return validateInventoryLogConstraints(data);
}

export function validateUpdateInventoryLog(data) {
  const updateValidation = updateInventoryLogSchema.validate(data);
  if (updateValidation.error) return updateValidation;

  // Optional: Add constraint validation for update if needed
  return { value: data };
}