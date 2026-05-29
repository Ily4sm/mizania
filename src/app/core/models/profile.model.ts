export interface Profile {
  id: string;
  full_name: string;
  email: string;
  preferred_language: 'fr' | 'en' | 'ar';
  theme: 'light' | 'dark';
  currency: string;
  plan: 'free' | 'premium';
  created_at: string;
  updated_at: string;
}