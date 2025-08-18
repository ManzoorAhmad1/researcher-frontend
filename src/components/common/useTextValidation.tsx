import { useCallback, useState } from "react";
import toast from "react-hot-toast";

export interface ValidationOptions {
  minLength?: number;
  maxLength?: number;
  allowEmpty?: boolean;
  customErrorMessages?: {
    empty?: string;
    minLength?: string;
    maxLength?: string;
    invalidContent?: string;
    dangerousPattern?: string;
    gibberish?: string;
  };
}

export interface UseTextValidationReturn {
  validateText: (text: string) => string;
  sanitizeText: (text: string) => string;
  validateAndShowToast: (text: string) => boolean; // Deprecated: kept for backward compatibility
  validateOnly: (text: string) => boolean; // New: validation without toast
  errors: { [key: string]: string };
  setError: (key: string, error: string) => void;
  clearError: (key: string) => void;
  clearAllErrors: () => void;
  hasErrors: boolean;
}

export const useTextValidation = (options: ValidationOptions = {}): UseTextValidationReturn => {
  const {
    minLength = 2,
    maxLength = 200000,
    allowEmpty = false,
    customErrorMessages = {}
  } = options;

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const defaultMessages = {
    empty: "Search cannot be empty",
    minLength: `Search must be at least ${minLength} characters long`,
    maxLength: `Search must be less than ${maxLength} characters`,
    invalidContent: "Search must contain at least one letter",
    dangerousPattern: "Invalid search format. Please use letters, numbers, and basic punctuation only",
    gibberish: "Please enter valid search terms, not random text"
  };

  const messages = { ...defaultMessages, ...customErrorMessages };

  const validateText = useCallback((text: string): string => {
    if (!text || text.trim().length === 0) {
      return allowEmpty ? "" : messages.empty;
    }
    
    if (text.trim().length < minLength) {
      return messages.minLength;
    }
    
    if (text.trim().length > maxLength) {
      return messages.maxLength;
    }
    
    // Check if text contains only special characters or numbers
    const hasValidContent = /[a-zA-Z]/.test(text);
    if (!hasValidContent) {
      return messages.invalidContent;
    }
    
    // Check for gibberish - too many consecutive consonants or random patterns
    const trimmedText = text.trim().toLowerCase();
    
    // Check for excessive consecutive consonants (more than 4 in a row)
    const excessiveConsonants = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(trimmedText);
    if (excessiveConsonants) {
      return messages.gibberish;
    }
    
    // Check for very long strings without vowels or spaces (likely gibberish)
    if (trimmedText.length > 10 && !/[aeiou\s]/i.test(trimmedText)) {
      return messages.gibberish;
    }
    
    // Check for repeating patterns that suggest gibberish
    const hasRepeatingPattern = /(.{2,})\1{3,}/.test(trimmedText);
    if (hasRepeatingPattern) {
      return messages.gibberish;
    }
    
    // Check for keyboard mashing patterns (consecutive keyboard keys)
    const keyboardPatterns = [
      /qwerty/i, /asdfg/i, /zxcvb/i, 
      /hjkl/i, /uiop/i, /dfgh/i,
      /abcdef/i, /123456/i
    ];
    
    for (const pattern of keyboardPatterns) {
      if (pattern.test(trimmedText)) {
        return messages.gibberish;
      }
    }
    
    // Check for potentially dangerous patterns
    const dangerousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /^[^a-zA-Z0-9\s\-_\.]*$/
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(text)) {
        return messages.dangerousPattern;
      }
    }
    
    return "";
  }, [minLength, maxLength, allowEmpty, messages]);

  const sanitizeText = useCallback((text: string): string => {
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[<>"']/g, '');
  }, []);

  const validateAndShowToast = useCallback((text: string): boolean => {
    const error = validateText(text);
    if (error) {
      toast.error(error);
      return false;
    }
    return true;
  }, [validateText]);

  const validateOnly = useCallback((text: string): boolean => {
    const error = validateText(text);
    return !error; // Return true if no error, false if there's an error
  }, [validateText]);

  const setError = useCallback((key: string, error: string) => {
    setErrors(prev => ({ ...prev, [key]: error }));
  }, []);

  const clearError = useCallback((key: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    validateText,
    sanitizeText,
    validateAndShowToast,
    validateOnly,
    errors,
    setError,
    clearError,
    clearAllErrors,
    hasErrors
  };
};

// Additional utility hook for query row validation
export const useQueryRowValidation = (options: ValidationOptions = {}) => {
  const validation = useTextValidation(options);
  const [queryRowErrors, setQueryRowErrors] = useState<{ [key: number]: string }>({});

  const validateQueryRow = useCallback((id: number, searchTerm: string) => {
    const error = validation.validateText(searchTerm);
    setQueryRowErrors(prev => ({
      ...prev,
      [id]: error
    }));
    return error;
  }, [validation.validateText]);

  const clearQueryRowError = useCallback((id: number) => {
    setQueryRowErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  }, []);

  const clearAllQueryRowErrors = useCallback(() => {
    setQueryRowErrors({});
  }, []);

  const hasQueryRowErrors = Object.values(queryRowErrors).some(error => error !== "");

  return {
    ...validation,
    queryRowErrors,
    validateQueryRow,
    clearQueryRowError,
    clearAllQueryRowErrors,
    hasQueryRowErrors
  };
};
