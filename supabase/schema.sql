-- Enable PostGIS if needed for distance calculations, though we can also do it mathematically in SQL or via Server Actions.
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Create NGOs table
CREATE TABLE IF NOT EXISTS public.ngos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Needs table
CREATE TABLE IF NOT EXISTS public.needs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ngo_id UUID REFERENCES public.ngos(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    urgency TEXT NOT NULL DEFAULT 'medium', -- critical, high, medium, low
    status TEXT NOT NULL DEFAULT 'open', -- open, in-progress, fulfilled
    quantity INTEGER NOT NULL DEFAULT 1,
    fulfilled_quantity INTEGER NOT NULL DEFAULT 0,
    location_lat DOUBLE PRECISION NOT NULL,
    location_lng DOUBLE PRECISION NOT NULL,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Volunteers table
CREATE TABLE IF NOT EXISTS public.volunteers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    avatar TEXT,
    skills TEXT[] DEFAULT '{}',
    availability TEXT NOT NULL DEFAULT 'available', -- available, busy, offline
    location_lat DOUBLE PRECISION NOT NULL,
    location_lng DOUBLE PRECISION NOT NULL,
    address TEXT,
    total_hours INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    rating DOUBLE PRECISION DEFAULT 5.0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Assignments table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    need_id UUID REFERENCES public.needs(id) ON DELETE CASCADE,
    volunteer_id UUID REFERENCES public.volunteers(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, completed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(need_id, volunteer_id)
);

-- Turn on RLS (Row Level Security) and set to permissive for this demo
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for all users" ON public.ngos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.needs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.volunteers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON public.assignments FOR ALL USING (true) WITH CHECK (true);

-- Insert Demo Data (Seed)
INSERT INTO public.ngos (id, name, email) VALUES 
('11111111-1111-1111-1111-111111111111', 'Global Relief Foundation', 'contact@globalrelief.org'),
('22222222-2222-2222-2222-222222222222', 'Healthcare Without Borders', 'info@healthcarewb.org')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.volunteers (id, name, email, phone, skills, availability, location_lat, location_lng, address, total_hours, missions_completed, rating) VALUES 
('v1111111-1111-1111-1111-111111111111', 'Priya Sharma', 'priya@example.com', '+91 98765 43210', ARRAY['First Aid', 'Logistics', 'Communication'], 'available', 28.6139, 77.2090, 'New Delhi', 342, 28, 4.9),
('v2222222-2222-2222-2222-222222222222', 'Arjun Patel', 'arjun@example.com', '+91 98765 43211', ARRAY['Construction', 'Project Management', 'Driving'], 'busy', 19.0760, 72.8777, 'Mumbai', 567, 45, 4.8),
('v3333333-3333-3333-3333-333333333333', 'Sneha Reddy', 'sneha@example.com', '+91 98765 43212', ARRAY['Medical', 'Counseling', 'Teaching'], 'available', 13.0827, 80.2707, 'Chennai', 289, 22, 4.7)
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.needs (id, ngo_id, title, description, category, urgency, status, quantity, fulfilled_quantity, location_lat, location_lng, address) VALUES 
('n1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Emergency Food Supply', 'Urgent need for food supplies', 'food', 'critical', 'in-progress', 200, 85, 28.6139, 77.2090, 'Eastern District, Delhi'),
('n2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'Medical Supplies for Camp', 'Need essential medicines', 'medical', 'critical', 'open', 500, 0, 19.0760, 72.8777, 'Andheri, Mumbai')
ON CONFLICT (id) DO NOTHING;
