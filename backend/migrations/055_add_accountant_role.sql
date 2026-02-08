-- Migration: Add accountant to account_role enum
-- Required for Back Office account management

ALTER TYPE account_role ADD VALUE IF NOT EXISTS 'accountant';
