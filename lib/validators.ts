export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain a number');
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateBill = (bill: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!bill.name?.trim()) errors.push('Bill name is required');
  if (!bill.amount || bill.amount <= 0) errors.push('Amount must be greater than 0');
  if (!bill.dueDate || bill.dueDate < 1 || bill.dueDate > 31) errors.push('Due date must be between 1-31');
  if (!bill.category?.trim()) errors.push('Category is required');
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateIncome = (income: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!income.name?.trim()) errors.push('Income source name is required');
  if (!income.amount || income.amount <= 0) errors.push('Amount must be greater than 0');
  if (!['monthly', 'bi-weekly', 'weekly', 'annual'].includes(income.frequency)) {
    errors.push('Invalid frequency');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateEmergencyFund = (data: any): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (!data.targetAmount || data.targetAmount <= 0) errors.push('Target amount must be greater than 0');
  if (!data.targetDate) errors.push('Target date is required');
  if (new Date(data.targetDate) <= new Date()) errors.push('Target date must be in the future');
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const calculateMonthlyEquivalent = (amount: number, frequency: string): number => {
  switch (frequency) {
    case 'bi-weekly':
      return (amount * 26) / 12;
    case 'weekly':
      return (amount * 52) / 12;
    case 'annual':
      return amount / 12;
    case 'monthly':
    default:
      return amount;
  }
};
