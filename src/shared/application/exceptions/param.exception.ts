export interface ExceptionParams {
  messageKey: string;
  params?: Record<string, any>;
  errors?: ValidationError[];
  instance?: string;
}

export interface ValidationError { 
  field: string; 
  value: any; 
  messageKey: string; 
  params?: Record<string, any>; 
}

export interface ValidationExceptionParams {
  errors: ValidationError[];
  instance?: string;
}