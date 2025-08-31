'use strict';

const express = require('express');
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let contract;

async function initializeFabric() {
    try {
        console.log('Initializing Fabric connection...');

        // Step 1: Load the base connection profile from the file system.
        const ccpPath = path.resolve(
            __dirname,
            '..',
            'test-network',
            'organizations',
            'peerOrganizations',
            'org1.example.com',
            'connection-org1.json'
        );
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Step 2: Load the certificate of the CA that issued the peer's TLS certificate.
        const peerTlsCaCertPath = path.resolve(
            __dirname,
            '..',
            'test-network',
            'organizations',
            'peerOrganizations',
            'org1.example.com',
            'tlsca',
            'tlsca.org1.example.com-cert.pem'
        );
        const peerTlsCaCert = fs.readFileSync(peerTlsCaCertPath);

        // Step 3: Embed the TLS CA certificate into the connection profile.
        ccp.peers['peer0.org1.example.com'].tlsCACerts.pem = peerTlsCaCert.toString();
        ccp.peers['peer0.org1.example.com'].grpcOptions = {
            'ssl-target-name-override': 'peer0.org1.example.com'
        };

        // Step 4: Set up the wallet to hold identities.
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`✅ Wallet path: ${walletPath}`);

        // Step 5: Pick identity from ENV or default to "appUser3"
        const userId = process.env.USER_ID || 'appUser3';
        console.log(`ℹ️  Using identity: ${userId}`);

        const identity = await wallet.get(userId);
        if (!identity) {
            console.error(`❌ An identity for the user "${userId}" does not exist in the wallet.`);
            console.error('👉 Please run registerUser.js <userId> first.');
            process.exit(1);
        }

        // Step 6: Connect to gateway
        const gateway = new Gateway();
        console.log('Connecting to gateway with self-contained connection profile...');
        await gateway.connect(ccp, {
            wallet,
            identity: userId,
            discovery: { enabled: false, asLocalhost: true }
        });

        // Step 7: Get the network and contract.
        const network = await gateway.getNetwork('mychannel');
        contract = network.getContract('mednova');

        console.log('✅ Fabric connection initialized successfully.');
        return gateway;

    } catch (error) {
        console.error(`❌ Failed to initialize Fabric connection: ${error}`);
        process.exit(1);
    }
}

// --- API Endpoints ---
app.post('/api/patient', async (req, res) => {
    try {
        const { patientID, firstName, lastName, dob, gender, contact, emergencyContact } = req.body;
        if (!patientID || !firstName || !lastName || !dob || !gender || !contact || !emergencyContact) {
            return res.status(400).json({ error: 'Missing required patient details.' });
        }
        console.log(`Submitting 'RegisterPatient' transaction for patient: ${patientID}`);
        await contract.submitTransaction(
            'RegisterPatient',
            patientID,
            firstName,
            lastName,
            dob,
            gender,
            contact,
            emergencyContact
        );
        res.status(201).json({ message: `Patient ${patientID} registered successfully.` });
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

app.post('/api/symptom', async (req, res) => {
    try {
        const { patientID, recordID, dataType, details } = req.body;
        if (!patientID || !recordID || !dataType || !details) {
            return res.status(400).json({ error: 'Missing required fields for health record.' });
        }
        console.log(`Submitting 'LogHealthRecord' transaction for patient: ${patientID}`);
        await contract.submitTransaction('LogHealthRecord', patientID, recordID, dataType, details);
        res.status(201).json({ message: 'Health record has been submitted successfully.' });
    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

app.get('/api/patient/:patientID', async (req, res) => {
    try {
        const patientID = req.params.patientID;
        console.log(`Evaluating 'QueryPatient' transaction for patient: ${patientID}`);
        const result = await contract.evaluateTransaction('QueryPatient', patientID);
        res.status(200).json(JSON.parse(result.toString()));
    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(500).json({ error: error.toString() });
    }
});

// --- Start Server ---
initializeFabric().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.log('❌ Failed to start server:', err);
});
