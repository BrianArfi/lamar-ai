-- Career-Ops Multi-Tenant SaaS Database Schema
-- Designed for Supabase / PostgreSQL with Row-Level Security (RLS)

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Users Profiles Table
-- Linked to Supabase Auth.users
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    location_policy JSONB DEFAULT '{"always_allow": [], "allow": [], "block": []}'::jsonb,
    salary_target JSONB DEFAULT '{"min": 0, "max": 0, "currency": "USD"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile." 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id);

-- 3. Resumes (Master CVs) Table
-- Supports Zero-Knowledge professional histories (excluding sensitive personal details)
CREATE TABLE public.resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    version_name TEXT DEFAULT 'Default' NOT NULL,
    cv_markdown TEXT NOT NULL, -- Core CV text (excluding personal address/phone/email)
    skills TEXT[] DEFAULT '{}'::text[] NOT NULL,
    is_master BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Resumes
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- Resumes Policies
CREATE POLICY "Users can manage their own resumes."
    ON public.resumes FOR ALL
    USING (auth.uid() = user_id);

-- 4. Applications Tracker Table
-- Replaces data/applications.md
CREATE TABLE public.applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    status TEXT DEFAULT 'Evaluated' NOT NULL, -- Checked against canonical templates/states.yml
    fit_score NUMERIC(3,2) NOT NULL, -- Format: X.XX (e.g. 4.25)
    job_url TEXT,
    has_pdf BOOLEAN DEFAULT false NOT NULL,
    notes TEXT,
    applied_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Applications Policies
CREATE POLICY "Users can manage their own applications."
    ON public.applications FOR ALL
    USING (auth.uid() = user_id);

-- 5. Job Evaluations Table
-- Replaces reports/{num}-{company}-{date}.md
CREATE TABLE public.job_evaluations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    report_markdown TEXT NOT NULL, -- Complete A-F detailed analysis markdown
    legitimacy_tier TEXT DEFAULT 'Unknown' NOT NULL, -- Block G (Posting legitimacy)
    gaps JSONB DEFAULT '[]'::jsonb NOT NULL,
    customization_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Job Evaluations
ALTER TABLE public.job_evaluations ENABLE ROW LEVEL SECURITY;

-- Job Evaluations Policies
CREATE POLICY "Users can manage their own evaluations."
    ON public.job_evaluations FOR ALL
    USING (auth.uid() = user_id);

-- 6. Interview Story Bank Table
-- Replaces interview-prep/story-bank.md
CREATE TABLE public.story_bank (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    star_situation TEXT NOT NULL,
    star_task TEXT NOT NULL,
    star_action TEXT NOT NULL,
    star_result TEXT NOT NULL,
    reflection TEXT,
    archetype_tags TEXT[] DEFAULT '{}'::text[] NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Story Bank
ALTER TABLE public.story_bank ENABLE ROW LEVEL SECURITY;

-- Story Bank Policies
CREATE POLICY "Users can manage their own story bank."
    ON public.story_bank FOR ALL
    USING (auth.uid() = user_id);

-- 7. Automatic Profiling Triggers
-- Create public.profile automatically upon Supabase Auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', 'Anonymous User'),
        new.email
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
