-- Migration: 027_add_custom_budget_targets
-- Adds custom target percentages for the 50/30/20 rule to user_profiles

ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS budget_needs_target INTEGER NOT NULL DEFAULT 50,
ADD COLUMN IF NOT EXISTS budget_wants_target INTEGER NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS budget_savings_target INTEGER NOT NULL DEFAULT 20;

-- Add a CHECK constraint to ensure the sum of all three targets is exactly 100
-- This guarantees absolute data integrity at the database level
ALTER TABLE public.user_profiles
ADD CONSTRAINT check_budget_targets_sum_100
CHECK (budget_needs_target + budget_wants_target + budget_savings_target = 100);
