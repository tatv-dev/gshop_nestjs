import { ValidationError } from 'class-validator';

/**
 * Flatten validation errors including array element errors
 * Expands array validation (with {each: true}) to individual element errors
 */
export function flattenValidationErrors(
  error: ValidationError,
  parentPath = '',
): Array<{
  property: string;
  value: any;
  constraints: Record<string, any>;
  children: ValidationError[];
}> {
  const results: Array<{
    property: string;
    value: any;
    constraints: Record<string, any>;
    children: ValidationError[];
  }> = [];

  const property = error.property;
  const value = error.value;
  const constraints = error.constraints || {};
  const children = error.children || [];
  const contexts = (error as any).contexts || {};

  // Build current field path
  const currentPath = parentPath ? `${parentPath}.${property}` : property;

  // Check if this is an array validation with "each: true"
  // In this case, we need to expand to individual element errors
  if (Array.isArray(value) && Object.keys(constraints).length > 0) {
    // Check if constraints indicate array element validation
    const isArrayElementValidation = Object.keys(constraints).some((key) => {
      // Common validators that use { each: true }
      return ['isInt', 'isString', 'min', 'max', 'isIn', 'isNotIn'].includes(key);
    });

    if (isArrayElementValidation) {
      // Expand to individual element errors
      value.forEach((elementValue, index) => {
        // Check if this element would fail validation
        let hasError = false;
        let failedConstraint: string | null = null; // Fix type here

        // Check each constraint
        for (const [constraintKey, constraintMessage] of Object.entries(constraints)) {
          // Simple validation checks for common validators
          if (constraintKey === 'isInt' && !Number.isInteger(elementValue)) {
            hasError = true;
            failedConstraint = constraintKey;
            break;
          } else if (constraintKey === 'min' && elementValue < contexts[constraintKey]?.min) {
            hasError = true;
            failedConstraint = constraintKey;
            break;
          } else if (constraintKey === 'max' && elementValue > contexts[constraintKey]?.max) {
            hasError = true;
            failedConstraint = constraintKey;
            break;
          } else if (constraintKey === 'isString' && typeof elementValue !== 'string') {
            hasError = true;
            failedConstraint = constraintKey;
            break;
          } else if (constraintKey === 'isIn') {
            // Check isIn constraint
            const allowedValues = contexts[constraintKey]?.allowedValues || [];
            if (!allowedValues.includes(elementValue)) {
              hasError = true;
              failedConstraint = constraintKey;
              break;
            }
          } else if (constraintKey === 'isNotIn') {
            // Check isNotIn constraint
            const forbiddenValues = contexts[constraintKey]?.forbiddenValues || [];
            if (forbiddenValues.includes(elementValue)) {
              hasError = true;
              failedConstraint = constraintKey;
              break;
            }
          }
        }

        if (hasError && failedConstraint) {
          results.push({
            property: `${currentPath}[${index}]`,
            value: elementValue,
            constraints: { [failedConstraint]: constraints[failedConstraint] },
            children: [],
          });
        }
      });

      // If we found element-level errors, don't add the top-level error
      if (results.length > 0) {
        return results;
      }
    }
  }

  // Top-level error (no element expansion or non-array)
  if (Object.keys(constraints).length > 0) {
    results.push({
      property: currentPath,
      value: value,
      constraints: constraints,
      children: children,
    });
  }

  // Recursively process children
  if (children.length > 0) {
    children.forEach((child) => {
      const childErrors = flattenValidationErrors(child, currentPath);
      results.push(...childErrors);
    });
  }

  return results;
}

/**
 * Format validation errors for exception response
 * Flattens all validation errors including nested array elements
 */
export function formatValidationErrors(errors: ValidationError[]): any[] {
  const formattedErrors: any[] = [];

  errors.forEach((error) => {
    const flattened = flattenValidationErrors(error);
    formattedErrors.push(...flattened);
  });

  return formattedErrors;
}
