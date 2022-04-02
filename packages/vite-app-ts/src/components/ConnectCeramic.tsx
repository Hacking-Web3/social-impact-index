import { DID } from 'dids';
import KeyDidResolver from 'key-did-resolver'
import ThreeIdResolver from '@ceramicnetwork/3id-did-resolver';
import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import { createCeramic } from "../helpers/ceramic"
import { createDataStore } from "../helpers/datastore"

import {useState} from 'react';

const threeID = new ThreeIdConnect();
const ceramicPromise = createCeramic();
let connected: boolean;

async function authenticateWithEthereum(ethereumProvider: any, callback: any) {
  const [ceramic] = await Promise.all([ceramicPromise]);
  // Request accounts from the Ethereum provider
  const accounts: any[] = await ethereumProvider.request({
    method: 'eth_requestAccounts',
  });
  // Create an EthereumAuthProvider using the Ethereum provider and requested account
  const authProvider = new EthereumAuthProvider(ethereumProvider, accounts[0])
  // Connect the created EthereumAuthProvider to the 3ID Connect instance so it can be used to
  // generate the authentication secret
  await threeID.connect(authProvider)

  const keyDidResolver = KeyDidResolver.getResolver();
  const threeIdResolver = ThreeIdResolver.getResolver(ceramic)
  const resolverRegistry = {
    ...threeIdResolver,
    ...keyDidResolver
  }

  const did = new DID({
    // Get the DID provider from the 3ID Connect instance
    provider: threeID.getDidProvider(),
    resolver: resolverRegistry,
  })

  // Authenticate the DID using the 3ID provider from 3ID Connect, this will trigger the
  // authentication flow using 3ID Connect and the Ethereum provider
  await did.authenticate()

  await ceramic.setDID(did);

  const dataStore = createDataStore(ceramic);
  window.did = ceramic.did;

  const profile = await dataStore.get('basicProfile')

  connected = true;
  callback(profile.name)
}

// When using extensions such as MetaMask, an Ethereum provider may be injected as `window.ethereum`
async function tryAuthenticate(callback: any) {
  if (window.ethereum == null) {
    throw new Error('No injected Ethereum provider')
  }
  await authenticateWithEthereum(window.ethereum, callback)
}

const ConnectCeramic = () => {
  const [username, setUsername] = useState();

  if (!connected) {
    return <button onClick={tryAuthenticate.bind(this, setUsername)}>Connect</button> 
  }

  if (!username) {
    return "Hello stranger";
  } else {
    return `Hello ${username}`;
  }
}

export default ConnectCeramic;
