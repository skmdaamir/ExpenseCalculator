-- =========================================================================
-- GROUP EVENT & TRIP POOL EXPENSE MANAGER - SUPABASE POSTGRESQL SCHEMA
-- Execute this script directly in the Supabase SQL Editor to initialize.
-- =========================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. EVENTS TABLE
-- Holds multi-event records (Trips, Wedding Pools, Collaborative Gifts, etc.)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'trip', -- 'trip', 'wedding_gift', 'party', 'collab', 'other'
    currency VARCHAR(10) DEFAULT 'INR',   -- e.g. 'INR', 'USD', 'EUR', 'GBP'
    status VARCHAR(20) DEFAULT 'active',  -- 'active', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PARTICIPANTS TABLE
-- Represents friends / members participating in an event
CREATE TABLE IF NOT EXISTS participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    upi_id VARCHAR(100),                  -- e.g. 'rohan@oksbi' for easy UPI settlement
    is_manager BOOLEAN DEFAULT FALSE,    -- Designates whether this person is a Pool Manager
    color VARCHAR(30) DEFAULT '#0d9488',  -- Theme avatar color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TRANSACTIONS TABLE
-- Supports all 3 distinct financial transaction types:
--   - 'pool_deposit': Friend contributes money into Manager's pool
--   - 'pool_expense': Manager spends from collected pool on group items/expenses
--   - 'direct_expense': Friend pays out-of-pocket directly for a group item
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL,            -- 'pool_deposit' | 'pool_expense' | 'direct_expense'
    title VARCHAR(255) NOT NULL,          -- Item name or deposit label (e.g., 'Resort Booking', 'Espresso Machine')
    category VARCHAR(50) DEFAULT 'misc',  -- 'accommodation', 'food', 'travel', 'gift', 'activities', 'shopping', 'misc'
    amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
    quantity INTEGER DEFAULT 1,
    paid_by_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE, -- Who gave the money / paid
    manager_id UUID REFERENCES participants(id) ON DELETE SET NULL,         -- The Manager holding or paying the pool
    split_type VARCHAR(20) DEFAULT 'equal', -- 'equal', 'custom'
    date DATE DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRANSACTION_SPLITS TABLE
-- Itemized per-participant shares for pool_expense and direct_expense
CREATE TABLE IF NOT EXISTS transaction_splits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
    share_amount DECIMAL(12, 2) NOT NULL CHECK (share_amount >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_participants_event_id ON participants(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_event_id ON transactions(event_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_splits_transaction_id ON transaction_splits(transaction_id);
CREATE INDEX IF NOT EXISTS idx_splits_participant_id ON transaction_splits(participant_id);

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- Enabling public read/write access using Supabase Anon Key (for lightweight client-side access)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_splits ENABLE ROW LEVEL SECURITY;

-- Allow anonymous select/insert/update/delete for the app
DROP POLICY IF EXISTS "Public access on events" ON events;
CREATE POLICY "Public access on events" ON events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on participants" ON participants;
CREATE POLICY "Public access on participants" ON participants FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on transactions" ON transactions;
CREATE POLICY "Public access on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access on transaction_splits" ON transaction_splits;
CREATE POLICY "Public access on transaction_splits" ON transaction_splits FOR ALL USING (true) WITH CHECK (true);

-- =========================================================================
-- OPTIONAL DEMO SEED DATA (Uncomment if you want to insert sample data in SQL)
-- =========================================================================
/*
DO $$
DECLARE
    event_id_var UUID;
    p_rohan UUID;
    p_aman UUID;
    p_priya UUID;
    p_kabir UUID;
    t_deposit1 UUID;
    t_expense1 UUID;
BEGIN
    INSERT INTO events (title, description, category, currency)
    VALUES ('Goa Trip 2026', 'Annual friends beach trip to South Goa', 'trip', 'INR')
    RETURNING id INTO event_id_var;

    INSERT INTO participants (event_id, name, upi_id, is_manager) VALUES (event_id_var, 'Rohan (Manager)', 'rohan@oksbi', true) RETURNING id INTO p_rohan;
    INSERT INTO participants (event_id, name, upi_id, is_manager) VALUES (event_id_var, 'Aman', 'aman@icici', false) RETURNING id INTO p_aman;
    INSERT INTO participants (event_id, name, upi_id, is_manager) VALUES (event_id_var, 'Priya', 'priya@okhdfc', false) RETURNING id INTO p_priya;
    INSERT INTO participants (event_id, name, upi_id, is_manager) VALUES (event_id_var, 'Kabir', 'kabir@paytm', false) RETURNING id INTO p_kabir;

    -- Aman deposits 5000 to Rohan
    INSERT INTO transactions (event_id, type, title, amount, paid_by_id, manager_id)
    VALUES (event_id_var, 'pool_deposit', 'Initial Pool Contribution', 5000, p_aman, p_rohan);
END $$;
*/
