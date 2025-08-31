#!/bin/bash

# This script is for rapid testing of the MedNova API.
# It should be run only AFTER the backend server is started with "node app.js".

# --- Colors for better terminal output ---
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}▶️ Running MedNova API Tests...${NC}"

# --- Step 1: Execute `curl` Tests in a controlled sequence ---
echo -e "${YELLOW}Running API Test 1: Create Patient...${NC}"
RESPONSE_CREATE=$(curl --silent --location --request POST 'http://localhost:3000/api/patient' \
--header 'Content-Type: application/json' \
--data-raw '{
    "patientID": "patient01",
    "firstName": "Kailas",
    "lastName": "Sharji",
    "dob": "2002-05-15",
    "gender": "Male",
    "contact": "9988776655",
    "emergencyContact": "5566778899"
}')
echo "${RESPONSE_CREATE}"
echo ""

sleep 2 # Small delay between transactions

echo -e "${YELLOW}Running API Test 2: Add Symptom Report...${NC}"
RESPONSE_SYMPTOM=$(curl --silent --location --request POST 'http://localhost:3000/api/symptom' \
--header 'Content-Type: application/json' \
--data-raw '{
    "patientID": "patient01",
    "recordID": "rep-001",
    "dataType": "SymptomReport",
    "details": "Fever, headache, fatigue"
}')
echo "${RESPONSE_SYMPTOM}"
echo ""

sleep 2 # Small delay

echo -e "${YELLOW}Running API Test 3: Read Patient Record...${NC}"
RESPONSE_READ=$(curl -s http://localhost:3000/api/patient/patient01)
echo "${RESPONSE_READ}"
echo ""

# --- Final Check ---
if echo "$RESPONSE_READ" | grep -q "patient01"; then
  echo -e "${GREEN}✅ Test Succeeded: Patient record found on the blockchain!${NC}"
else
  echo -e "${RED}❌ Test Failed: Could not find patient record.${NC}"
fi
