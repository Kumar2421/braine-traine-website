/**
 * Validation utilities for forms
 */

export const validators = {
  email: (value) => {
    if (!value || !value.trim()) {
      return 'Email is required'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value.trim())) {
      return 'Please enter a valid email address'
    }
    return null
  },

  password: (value, minLength = 6) => {
    if (!value) {
      return 'Password is required'
    }
    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters`
    }
    return null
  },

  required: (value, fieldName = 'This field') => {
    if (!value || !value.trim()) {
      return `${fieldName} is required`
    }
    return null
  },

  minLength: (value, minLength, fieldName = 'This field') => {
    if (!value || value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters`
    }
    return null
  },

  maxLength: (value, maxLength, fieldName = 'This field') => {
    if (value && value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters`
    }
    return null
  },

  url: (value) => {
    if (!value || !value.trim()) {
      return null // URL is optional
    }
    try {
      new URL(value)
      return null
    } catch {
      return 'Please enter a valid URL'
    }
  },
}

/**
 * Validate a form object against a schema
 * @param {Object} values - Form values
 * @param {Object} schema - Validation schema { fieldName: [validators] }
 * @returns {Object} - { fieldName: errorMessage }
 */
export function validateForm(values, schema) {
  const errors = {}

  Object.keys(schema).forEach((fieldName) => {
    const fieldValidators = schema[fieldName]
    const value = values[fieldName]

    for (const validator of fieldValidators) {
      const error = validator(value, fieldName)
      if (error) {
        errors[fieldName] = error
        break // Stop at first error
      }
    }
  })

  return errors
}

/**
 * Check if form is valid
 */
export function isFormValid(errors) {
  return Object.keys(errors).length === 0
}

