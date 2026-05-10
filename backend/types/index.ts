export type Role = 'buyer' | 'seller' | 'admin'

export interface UserRole {
  id: string
  user_id: string
  role: Role
  created_at: string
}

export interface Listing {
  id: string
  seller_id: string
  title: string
  sector: string
  state: string
  lga: string | null
  asking_price: string
  revenue_band: string
  years_operating: string
  staff_range: string
  deal_type: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface AccessRequest {
  id: string
  listing_id: string
  buyer_id: string
  note: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface BuyerRequest {
  id: string
  buyer_id: string
  sector: string
  preferred_state: string
  budget_range: string
  deal_type: string
  description: string
  status: 'pending' | 'reviewed'
  created_at: string
}

export const SECTORS = [
  'Food & Hospitality',
  'Healthcare',
  'Agribusiness',
  'Manufacturing',
  'Education',
  'Retail',
  'Logistics',
  'Technology',
  'Real Estate',
  'Financial Services',
  'Other',
]

export const STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT - Abuja','Gombe',
  'Imo','Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos',
  'Nasarawa','Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto',
  'Taraba','Yobe','Zamfara',
]

export const REVENUE_BANDS = [
  'Under ₦5M','₦5M–₦10M','₦10M–₦20M','₦20M–₦50M','₦50M–₦100M','Above ₦100M',
]

export const DEAL_TYPES = [
  'Full sale','Partial sale','Investment partnership','Merger','Succession',
]
