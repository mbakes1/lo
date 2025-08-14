-- Add documents table to store uploaded document information
CREATE TABLE IF NOT EXISTS hauler_documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES hauler_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_path VARCHAR(500), -- For future file storage implementation
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_document_type CHECK (document_type IN (
        'vehicle_registration',
        'drivers_license', 
        'vehicle_insurance',
        'roadworthy_certificate',
        'bank_statement',
        'bank_confirmation',
        'id_document',
        'business_registration',
        'tax_clearance',
        'other'
    ))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hauler_documents_application_id ON hauler_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_hauler_documents_type ON hauler_documents(document_type);
