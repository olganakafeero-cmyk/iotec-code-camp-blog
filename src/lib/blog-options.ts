export const CATEGORIES = ['architecture', 'technology'] as const
export const STATUSES = ['draft', 'published'] as const
export const SUBSCRIPTION_MODES = ['free', 'paid'] as const

export const CURRENCY = 'UGX'
export const AUTHOR = { id: 'olgah', name: 'Olgah Majorine', role: 'Software Engineer' }

export const labelOf = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)
export const PRICE_PRESETS = [2500, 5000, 10000]