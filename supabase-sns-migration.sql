-- SNS (social links) columns for profiles table
-- Run this once in Supabase SQL Editor

alter table profiles
  add column if not exists instagram text,
  add column if not exists facebook  text,
  add column if not exists twitter   text;
