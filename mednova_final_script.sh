#!/bin/bash
set -e

# --- Colors ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🏁 MedNova Ultimate Diagnostic Test: Starting...${NC}"

# --- Step 1: Network & Chaincode ---
echo -e "${GREEN}▶️ Setting up a clean Fabric network...${NC}"
(cd test-network && ./network.sh down)
(cd test-network && ./network.sh up createChannel -ca)
(cd test-network && ./network.sh deployCC -ccn mednova -ccp ../chaincode/mednova -ccl go)

# --- Step 2: Identities and Dependencies ---
echo -e "${GREEN}▶️ Deleting old wallet and reinstalling dependencies with Node v16...${NC}"
(cd node-backend && rm -rf wallet)
(export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 16 && cd node-backend && npm install)


echo -e "${GREEN}▶️ Creating fresh identities...${NC}"
(export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 16 && cd node-backend && node enrollAdmin.js)
(export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 16 && cd node-backend && node registerUser.js)

# --- Step 3: Chaincode Readiness Check ---
echo -e "${YELLOW}Waiting for chaincode to be ready...${NC}"
chmod +x test-network/scripts/ccutils.sh
(cd test-network && ./scripts/ccutils.sh query -c mychannel -n mednova -c '{"Args":["QueryPatient","patient-warmup"]}')
echo -e "${GREEN}Chaincode is ready!${NC}"


# --- Step 4: Run Backend with DEEP DIAGNOSTIC LOGGING ---
echo -e "${GREEN}▶️ Starting Node.js backend server with deep gRPC logging enabled...${NC}"
cd node-backend
rm -f server.log

# *** THIS IS THE CRITICAL DIAGNOSTIC STEP ***
# We are enabling verbose logging for the gRPC and Fabric SDK libraries.
export GRPC_TRACE=all
export GRPC_VERBOSITY=DEBUG
export FABRIC_LOGGING_SPEC=DEBUG

# Run the server in the correct Node.js version environment
(export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" && nvm use 16 && node app.js > server.log 2>&1 &)
SERVER_PID=$!
cd ..

echo -e "${YELLOW}Waiting for server to initialize...${NC}"
until grep -q "Server is running" node-backend/server.log; do
  if ! ps -p $SERVER_PID > /dev/null; then
    echo -e "${RED}❌ Server failed to start. Log:${NC}"
    cat node-backend/server.log
    exit 1
  fi
  sleep 1
done
echo -e "${GREEN}Server ready! Running API tests...${NC}"

# --- Step 5: API Tests ---
# We expect these to fail, but they will generate the logs we need.
./test_api.sh || true # The '|| true' ensures the script doesn't exit on failure here

# --- Step 6: Capture the Evidence ---
echo -e "\n\n================================================================="
echo -e "==== CAPTURING FINAL DIAGNOSTIC LOGS ===="
echo -e "=================================================================\n"

echo -e "${YELLOW}--- Backend Server Log (server.log) ---${NC}"
cat node-backend/server.log

echo -e "\n${YELLOW}--- Peer Logs (peer0.org1.example.com) ---${NC}"
docker logs peer0.org1.example.com

# --- Clean up ---
echo -e "\n${YELLOW}▶️ Stopping backend server...${NC}"
kill $SERVER_PID
echo -e "${GREEN}🏁 End of MedNova diagnostic test.${NC}"
```

### **Your Final Mission**

You have been incredibly patient. This is the last test you will need to run.

1.  **Replace the code** in your `mednova_final_script.sh` with this final, diagnostic version.
2.  From your `fabric-samples` root directory, run the script:
    ```bash
    ./mednova_final_script.sh
    

