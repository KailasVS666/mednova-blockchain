const { Wallets } = require('fabric-network');

(async () => {
  const wallet = await Wallets.newFileSystemWallet('./wallet');
  const id = await wallet.get('appUser');
  console.log('appUser exists:', !!id);
  if (id) {
    console.log('Identity type:', id.type);
    console.log('MSP ID:', id.mspId);
    console.log('Credential keys:', Object.keys(id.credentials));
  }
})();
