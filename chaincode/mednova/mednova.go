// MedNova Chaincode (Smart Contract)
// This file defines the complete on-chain logic for the MedNova healthcare network.
// It manages patient registration, secure data logging, and access control.

package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing patient health records.
type SmartContract struct {
	contractapi.Contract
}

// Patient defines the structure for a patient's record.
// The JSON tags are used for serialization.
type Patient struct {
	ObjectType       string   `json:"docType"` // Used to distinguish different object types in the ledger
	PatientID        string   `json:"patientID"`
	FirstName        string   `json:"firstName"`
	LastName         string   `json:"lastName"`
	DateOfBirth      string   `json:"dateOfBirth"`
	Gender           string   `json:"gender"`
	Contact          string   `json:"contact"`
	EmergencyContact string   `json:"emergencyContact"`
	ConsentedDocs    []string `json:"consentedDocs"` // List of DoctorIDs who have consent to view records
}

// HealthDataRecord represents a generic log entry (symptom, IoT, prescription).
// Storing each entry as a separate record is more scalable and secure.
type HealthDataRecord struct {
	ObjectType string `json:"docType"`
	RecordID   string `json:"recordID"`
	PatientID  string `json:"patientID"`
	AuthorID   string `json:"authorID"`   // Can be a DoctorID, PatientID, or DeviceID
	Timestamp  string `json:"timestamp"`
	DataType   string `json:"dataType"`   // e.g., "SymptomReport", "IoTReading", "Prescription"
	Details    string `json:"details"`    // A JSON string containing the specific data
	IsVerified bool   `json:"isVerified"` // True if the entry was made by a certified doctor
}

// RegisterPatient adds a new patient to the ledger.
func (s *SmartContract) RegisterPatient(ctx contractapi.TransactionContextInterface, patientID string, firstName string, lastName string, dob string, gender string, contact string, emergencyContact string) error {
	// Check if a patient with this ID already exists to prevent duplicates
	exists, err := s.assetExists(ctx, patientID)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("the patient %s already exists", patientID)
	}

	patient := Patient{
		ObjectType:       "patient",
		PatientID:        patientID,
		FirstName:        firstName,
		LastName:         lastName,
		DateOfBirth:      dob,
		Gender:           gender,
		Contact:          contact,
		EmergencyContact: emergencyContact,
		ConsentedDocs:    []string{}, // Initialize with no doctors having consent
	}

	patientJSON, err := json.Marshal(patient)
	if err != nil {
		return err
	}

	// PutState writes the new patient record to the blockchain's world state
	return ctx.GetStub().PutState(patientID, patientJSON)
}

// LogHealthRecord creates a new health data entry (e.g., a symptom report).
func (s *SmartContract) LogHealthRecord(ctx contractapi.TransactionContextInterface, patientID string, recordID string, dataType string, details string) error {
	// Get the identity of the user submitting this transaction
	clientID, err := ctx.GetClientIdentity().GetID()
	if err != nil {
		return fmt.Errorf("failed to get client ID: %v", err)
	}

	// Verify that the patient for this record actually exists
	exists, err := s.assetExists(ctx, patientID)
	if err != nil {
		return err
	}
	if !exists {
		return fmt.Errorf("the patient %s does not exist", patientID)
	}

	// --- Access Control Logic ---
	isDoctor, err := s.isCallerDoctor(ctx)
	if err != nil {
		return err
	}

	// Rule: Only a user with the 'doctor' role can log a 'Prescription'
	if dataType == "Prescription" && !isDoctor {
		return fmt.Errorf("caller is not authorized to issue prescriptions. ClientID: %s", clientID)
	}

	record := HealthDataRecord{
		ObjectType: "healthRecord",
		RecordID:   recordID,
		PatientID:  patientID,
		AuthorID:   clientID, // The transaction submitter is the author
		Timestamp:  time.Now().UTC().Format(time.RFC3339),
		DataType:   dataType,
		Details:    details,
		IsVerified: isDoctor, // Mark as verified if the author is a doctor
	}

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return err
	}

	// PutState writes the new health record to the blockchain
	return ctx.GetStub().PutState(recordID, recordJSON)
}

// QueryPatient returns a patient's core record from the world state.
func (s *SmartContract) QueryPatient(ctx contractapi.TransactionContextInterface, patientID string) (*Patient, error) {
	patientJSON, err := ctx.GetStub().GetState(patientID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if patientJSON == nil {
		return nil, fmt.Errorf("the patient %s does not exist", patientID)
	}

	var patient Patient
	err = json.Unmarshal(patientJSON, &patient)
	if err != nil {
		return nil, err
	}

	return &patient, nil
}

// QueryPatientHistory returns all health records for a specific patient.
func (s *SmartContract) QueryPatientHistory(ctx contractapi.TransactionContextInterface, patientID string) ([]*HealthDataRecord, error) {
	// This is a rich query that finds all records associated with a patientID
	queryString := fmt.Sprintf(`{"selector":{"docType":"healthRecord","patientID":"%s"}}`, patientID)

	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	var records []*HealthDataRecord
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var record HealthDataRecord
		err = json.Unmarshal(queryResponse.Value, &record)
		if err != nil {
			return nil, err
		}
		records = append(records, &record)
	}

	return records, nil
}

// assetExists returns true when an asset with a given ID exists in the world state.
func (s *SmartContract) assetExists(ctx contractapi.TransactionContextInterface, id string) (bool, error) {
	assetJSON, err := ctx.GetStub().GetState(id)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %v", err)
	}
	return assetJSON != nil, nil
}

// isCallerDoctor checks if the transaction submitter has the 'doctor' role attribute.
// This is a critical function for access control.
func (s *SmartContract) isCallerDoctor(ctx contractapi.TransactionContextInterface) (bool, error) {
	// The 'role' is set when the user is registered with the Certificate Authority (CA)
	role, found, err := ctx.GetClientIdentity().GetAttributeValue("role")
	if err != nil {
		return false, fmt.Errorf("failed to get 'role' attribute: %v", err)
	}
	if !found {
		// Attribute not found, so the user is not a doctor
		return false, nil
	}

	return role == "doctor", nil
}

// main function starts the chaincode.
func main() {
	chaincode, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating MedNova chaincode: %v", err)
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting MedNova chaincode: %v", err)
	}
}
