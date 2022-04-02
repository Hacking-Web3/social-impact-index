// import { CeramicClient } from '@ceramicnetwork/http-client';

// export const ceramic = new CeramicClient('https://ceramic-clay.3boxlabs.com');

import type { CeramicApi } from '@ceramicnetwork/common';
import Ceramic from '@ceramicnetwork/http-client';
// import { Caip10Link } from '@ceramicnetwork/stream-caip10-link';
// import { TileDocument } from '@ceramicnetwork/stream-tile';

declare global {
  interface Window {
    ceramic?: CeramicApi;
    [index: string]: any;
  }
}

export async function createCeramic(): Promise<CeramicApi> {
  console.log('should be doing things here')
  const ceramic = new Ceramic('https://ceramic-clay.3boxlabs.com');
  window.ceramic = ceramic;
  // window.TileDocument = TileDocument;
  // window.Caip10Link = Caip10Link;
  return Promise.resolve(ceramic as CeramicApi);
}
