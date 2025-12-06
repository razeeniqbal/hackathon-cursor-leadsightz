-- Create profiles table for user profile management
CREATE TABLE IF NOT EXISTS profiles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  knowledge_base TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups of active profile
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active);

-- Insert a default profile
INSERT INTO profiles (name, knowledge_base, is_active) 
VALUES (
  'Default Profile',
  'We are a leading software development company specializing in custom solutions for businesses. Our strengths include rapid development, scalable architecture, and 24/7 support. Key products: CRM systems, inventory management, and e-commerce platforms.',
  true
);
