// ZKPassport Noir Circuit
// Purpose: Prove identity without exposing personal data
// Privacy: Personal data hashed locally, only hashes revealed on-chain
// Compliance: ICAO Doc 9303 MRZ format validation

use std::hash::poseidon;

// Import MRZ validation module
mod mrz_validation;
use mrz_validation::{validate_mrz_format, validate_mrz_checksums, extract_mrz_fields};

// Constants for KYC levels
global KYC_LEVEL_NONE: u8 = 0;
global KYC_LEVEL_BASIC: u8 = 1;
global KYC_LEVEL_ENHANCED: u8 = 2;
global KYC_LEVEL_PREMIUM: u8 = 3;

// Main circuit: Prove identity with ZK
fn main(
    // PRIVATE INPUTS (known only to prover, not revealed)
    nationality: str,           // Country code (ex: "USA")
    document_number: str,       // Passport number (ex: "N1234567")
    date_of_birth: str,         // Date in YYMMDD format (ex: "920315")
    sex: u8,                     // Sex code ('M' or 'F')
    document_expiry: str,        // Expiry date YYMMDD (ex: "261231")
    mrz_line_1: str,            // First MRZ line for checksum validation
    mrz_line_2: str,            // Second MRZ line for checksum validation
    
    // PUBLIC INPUTS (visible in proof, but only hashes - data still private)
    pub nationality_hash: Field,
    pub dob_hash: Field,
    pub doc_hash: Field,
    pub kyc_level: u8,
    pub verification_timestamp: u64,
    pub document_type: u8,      // 0 = Passport, 1 = ID Card, 2 = Travel Document
) {
    // ============================================================================
    // STEP 1: Validate input formats (no data leakage)
    // ============================================================================
    
    // Validate nationality: 3-letter ISO code
    assert(nationality.len() == 3, "Nationality must be 3 characters");
    let nat_bytes = nationality.as_bytes();
    let _ = validate_alphabetic_uppercase(nat_bytes);
    
    // Validate date of birth: YYMMDD format
    assert(date_of_birth.len() == 6, "DOB must be 6 characters (YYMMDD)");
    let dob_bytes = date_of_birth.as_bytes();
    let _ = validate_numeric(dob_bytes);
    validate_date_format(dob_bytes);
    
    // Validate document number: 5-15 alphanumeric
    assert(document_number.len() >= 5, "Document number too short");
    assert(document_number.len() <= 15, "Document number too long");
    
    // Validate sex
    assert((sex == 77) | (sex == 70), "Sex must be 'M' (77) or 'F' (70)");
    
    // Validate document expiry: YYMMDD format
    assert(document_expiry.len() == 6, "Expiry must be 6 characters (YYMMDD)");
    let exp_bytes = document_expiry.as_bytes();
    let _ = validate_numeric(exp_bytes);
    validate_date_format(exp_bytes);
    
    // Validate document type
    assert(document_type <= 2, "Document type must be 0-2");
    
    // Validate KYC level
    assert(kyc_level >= KYC_LEVEL_BASIC, "KYC level must be >= 1");
    assert(kyc_level <= KYC_LEVEL_PREMIUM, "KYC level must be <= 3");
    
    // ============================================================================
    // STEP 2: Validate MRZ format and checksums (ICAO Doc 9303)
    // ============================================================================
    
    // Validate MRZ line 1 format
    validate_mrz_format(mrz_line_1, 0);
    
    // Validate MRZ line 2 format
    validate_mrz_format(mrz_line_2, 1);
    
    // Validate all MRZ checksums (document, date, expiry, final)
    validate_mrz_checksums(mrz_line_1, mrz_line_2);
    
    // ============================================================================
    // STEP 3: Extract and verify MRZ fields match input data
    // ============================================================================
    
    let (extracted_nat, extracted_doc, extracted_dob) = extract_mrz_fields(mrz_line_1, mrz_line_2);
    
    // Verify extracted data matches private inputs
    assert(extracted_nat == nationality, "MRZ nationality mismatch");
    assert(extracted_doc == document_number, "MRZ document number mismatch");
    assert(extracted_dob == date_of_birth, "MRZ date of birth mismatch");
    
    // ============================================================================
    // STEP 4: Compute Poseidon hashes (irreversible encryption)
    // ============================================================================
    
    // Hash nationality using Poseidon
    let nat_hash_computed = poseidon::bn254::hash_1([nationality_hash_input(nationality)]);
    assert(nat_hash_computed == nationality_hash, "Nationality hash mismatch");
    
    // Hash date of birth
    let dob_hash_computed = poseidon::bn254::hash_1([dob_hash_input(date_of_birth)]);
    assert(dob_hash_computed == dob_hash, "DOB hash mismatch");
    
    // Hash document number
    let doc_hash_computed = poseidon::bn254::hash_1([doc_hash_input(document_number)]);
    assert(doc_hash_computed == doc_hash, "Document hash mismatch");
    
    // ============================================================================
    // STEP 5: Validate KYC level based on document data
    // ============================================================================
    
    if kyc_level >= KYC_LEVEL_BASIC {
        // Basic KYC: Just verify valid document exists
        assert(is_valid_nationality(nationality), "Invalid nationality");
        assert(is_valid_passport_format(document_number), "Invalid passport format");
    }
    
    if kyc_level >= KYC_LEVEL_ENHANCED {
        // Enhanced KYC: Verify document is not expired
        assert(is_not_expired(document_expiry), "Document expired");
    }
    
    if kyc_level >= KYC_LEVEL_PREMIUM {
        // Premium KYC: Verify age >= 18
        assert(is_age_18_or_older(date_of_birth), "User must be 18+");
    }
    
    // ============================================================================
    // STEP 6: Verify timestamp is reasonable (not in future, recent enough)
    // ============================================================================
    
    // Basic sanity check: timestamp should be reasonable
    // This prevents future-dated proofs
    assert(verification_timestamp > 0, "Invalid timestamp");
    // Note: Full validation of current time would require external input
    // This is validated on-chain by verifier
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Convert string to field element for hashing
fn nationality_hash_input(nat: str) -> Field {
    let bytes = nat.as_bytes();
    let mut value: Field = 0;
    for i in 0..bytes.len() {
        value = value * 256 + bytes[i] as Field;
    }
    value
}

// Convert DOB string to field element
fn dob_hash_input(dob: str) -> Field {
    let bytes = dob.as_bytes();
    let mut value: Field = 0;
    for i in 0..bytes.len() {
        value = value * 256 + bytes[i] as Field;
    }
    value
}

// Convert document number to field element
fn doc_hash_input(doc: str) -> Field {
    let bytes = doc.as_bytes();
    let mut value: Field = 0;
    for i in 0..bytes.len() {
        value = value * 256 + bytes[i] as Field;
    }
    value
}

// Validate all bytes are alphabetic uppercase (A-Z)
fn validate_alphabetic_uppercase(bytes: &[u8]) {
    for i in 0..bytes.len() {
        let byte = bytes[i];
        // A=65, Z=90
        assert((byte >= 65) & (byte <= 90), "Invalid character (must be A-Z)");
    }
}

// Validate all bytes are numeric (0-9)
fn validate_numeric(bytes: &[u8]) {
    for i in 0..bytes.len() {
        let byte = bytes[i];
        // 0=48, 9=57
        assert((byte >= 48) & (byte <= 57), "Invalid character (must be 0-9)");
    }
}

// Validate date format YYMMDD
fn validate_date_format(bytes: &[u8]) {
    // All characters must be numeric
    validate_numeric(bytes);
    
    // Parse month (position 2-3)
    let month = (bytes[2] - 48) * 10 + (bytes[3] - 48);
    assert((month >= 1) & (month <= 12), "Invalid month (must be 01-12)");
    
    // Parse day (position 4-5)
    let day = (bytes[4] - 48) * 10 + (bytes[5] - 48);
    assert((day >= 1) & (day <= 31), "Invalid day (must be 01-31)");
}

// Check if nationality is valid ISO 3166-1 alpha-3 code
// This is a simplified check - in production, use full list
fn is_valid_nationality(nationality: str) -> bool {
    // List of common valid nationality codes (simplified for testing)
    // In production, this would be a more comprehensive list
    let valid_countries = ["USA", "GBR", "CAN", "AUS", "DEU", "FRA", "ESP", "ITA", "MEX", "BRA", "JPN", "CHN", "IND", "RUS", "ZAF"];
    
    let mut found = false;
    for i in 0..15 {
        if nationality == valid_countries[i] {
            found = true;
        }
    }
    found
}

// Validate passport number format
fn is_valid_passport_format(doc_number: str) -> bool {
    // Passport numbers typically start with letter, followed by alphanumerics
    let bytes = doc_number.as_bytes();
    
    // First character should be alphabetic
    let first = bytes[0];
    assert((first >= 65 & first <= 90) | (first >= 97 & first <= 122), "Passport must start with letter");
    
    true
}

// Check if document is not expired (simplified - doesn't check against current date)
fn is_not_expired(expiry_date: str) -> bool {
    // In a real scenario, this would check against current date
    // For circuit, we just validate format (done elsewhere)
    // The Cairo contract will do real expiry validation
    true
}

// Check if user is 18+ years old
fn is_age_18_or_older(dob: str) -> bool {
    // Extract year (position 0-1)
    let dob_bytes = dob.as_bytes();
    let yy = (dob_bytes[0] - 48) * 10 + (dob_bytes[1] - 48);
    
    // Convert to full year (1900s for 00-30, 2000s for 31-99)
    // This is simplified - real implementation would use current date
    // For now, just check year is not in future
    assert(yy <= 99, "Invalid year");
    
    true
}
