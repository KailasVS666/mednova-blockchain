'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        // --- Get username from CLI args ---
        const userId = process.argv[2];
        if (!userId) {
            console.error("❌ Please provide a user ID. Example: node registerUser.js aliceX");
            process.exit(1);
        }

        // --- Load connection profile for Org1 ---
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

        // --- Create CA client ---
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(
            caInfo.url,
            { trustedRoots: caTLSCACerts, verify: false },
            caInfo.caName
        );

        // --- Setup wallet ---
        const walletPath = path.join(__dirname, 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`✅ Wallet path: ${walletPath}`);
        console.log(`ℹ️  Registering user: ${userId}`);

        // --- Check if identity exists locally ---
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`⚠️ Identity for "${userId}" already exists in wallet`);
            return;
        }

        // --- Get admin identity ---
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            console.error('❌ Admin identity not found in wallet. Run enrollAdmin.js first.');
            return;
        }
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // --- Register & Enroll user ---
        let enrollment;
        let secret;
        try {
            secret = await ca.register({
                affiliation: 'org1.department1',
                enrollmentID: userId,
                role: 'client'
            }, adminUser);

            console.log(`✅ Registered "${userId}" with secret: ${secret}`);
        } catch (err) {
            if (err.toString().includes("already registered")) {
                console.log(`⚠️ User "${userId}" already registered. Attempting to enroll...`);
                // ⚠️ You must use the same secret as before — defaulting to "<userId>pw"
                secret = `${userId}pw`;
            } else {
                throw err;
            }
        }

        enrollment = await ca.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes()
            },
            mspId: 'Org1MSP',
            type: 'X.509'
        };

        await wallet.put(userId, x509Identity);
        console.log(`✅ Successfully registered and enrolled "${userId}"`);

    } catch (error) {
        console.error(`❌ Failed to register user: ${error}`);
        process.exit(1);
    }
}

main();
