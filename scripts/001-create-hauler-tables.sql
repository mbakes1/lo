-- Create hauler applications table
CREATE TABLE IF NOT EXISTS hauler_applications (
    id SERIAL PRIMARY KEY,
    application_number VARCHAR(20) UNIQUE NOT NULL,
    
    -- Basic Information
    full_name VARCHAR(255) NOT NULL,
    id_number VARCHAR(50) NOT NULL,
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('individual', 'business')),
    business_name VARCHAR(255),
    beee_level VARCHAR(10),
    cipc_registration VARCHAR(50),
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    physical_address TEXT NOT NULL,
    province VARCHAR(50) NOT NULL,
    
    -- Banking Information
    bank_name VARCHAR(100) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_number VARCHAR(20) NOT NULL,
    account_type VARCHAR(50) NOT NULL,
    branch_code VARCHAR(10) NOT NULL,
    
    -- Consent & Terms
    accept_terms BOOLEAN NOT NULL DEFAULT false,
    consent_to_store BOOLEAN NOT NULL DEFAULT false,
    consent_to_contact BOOLEAN NOT NULL DEFAULT false,
    
    -- Application Status
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'requires_documents')),
    notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by VARCHAR(255)
);

-- Create trucks table
CREATE TABLE IF NOT EXISTS hauler_trucks (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES hauler_applications(id) ON DELETE CASCADE,
    truck_number INTEGER NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    load_capacity VARCHAR(20) NOT NULL,
    horse_registration VARCHAR(50) NOT NULL,
    trailer1_registration VARCHAR(50),
    trailer2_registration VARCHAR(50),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(application_id, truck_number)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hauler_applications_status ON hauler_applications(status);
CREATE INDEX IF NOT EXISTS idx_hauler_applications_created_at ON hauler_applications(created_at);
CREATE INDEX IF NOT EXISTS idx_hauler_applications_email ON hauler_applications(email);
CREATE INDEX IF NOT EXISTS idx_hauler_applications_application_number ON hauler_applications(application_number);
CREATE INDEX IF NOT EXISTS idx_hauler_trucks_application_id ON hauler_trucks(application_id);

-- Create function to generate application numbers
CREATE OR REPLACE FUNCTION generate_application_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    counter INTEGER;
BEGIN
    -- Get current year and month
    SELECT 'HA' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || LPAD(
        COALESCE(
            (SELECT MAX(CAST(SUBSTRING(application_number FROM 9) AS INTEGER)) + 1
             FROM hauler_applications 
             WHERE application_number LIKE 'HA' || TO_CHAR(CURRENT_DATE, 'YYYYMM') || '%'),
            1
        )::TEXT, 
        4, '0'
    ) INTO new_number;
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate application numbers
CREATE OR REPLACE FUNCTION set_application_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.application_number IS NULL OR NEW.application_number = '' THEN
        NEW.application_number := generate_application_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_application_number
    BEFORE INSERT ON hauler_applications
    FOR EACH ROW
    EXECUTE FUNCTION set_application_number();

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_hauler_applications_updated_at
    BEFORE UPDATE ON hauler_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
