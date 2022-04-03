import { CeramicApi } from '@ceramicnetwork/common';
import { DataModel } from '@glazed/datamodel';
import { DIDDataStore } from '@glazed/did-datastore';

declare global {
  interface Window {
    DataStore: DIDDataStore;
  }
}

const publishedModel = {
  schemas: {
    basicProfile: 'ceramic://k3y52l7qbv1frxt706gqfzmq6cbqdkptzk8uudaryhlkf6ly9vx21hqu4r6k1jqio',
  },
  definitions: {
    basicProfile: 'kjzl6cwe1jw145cjbeko9kil8g9bxszjhyde21ob8epxuxkaon1izyqsu8wgcic',
  },
  tiles: {},
};

const newModel = {
  schemas: {
    SIOProfile: 'ceramic://k3y52l7qbv1frxtg2e5k48e2w4yotro2hqi1ind7hg3m718qiqr0fos99k1odalmo',
  },
  definitions: {
    imageSources: {
      type: 'object',
      required: ['original'],
      properties: {
        original: {
          $ref: '#/definitions/imageMetadata',
        },
        alternatives: {
          type: 'array',
          items: {
            $ref: '#/definitions/imageMetadata',
          },
        },
      },
    },
  },
  tiles: {},
};

let SIOModel: DataModel<typeof newModel>;

export function createDataStore(ceramic: CeramicApi): DIDDataStore {
  const datastore = new DIDDataStore({ ceramic, model: publishedModel });
  SIOModel = new DataModel({ ceramic, model: newModel });
  window.DataStore = datastore;
  return datastore;
}

export const getSIOModel = (): DataModel<typeof newModel> => {
  return SIOModel;
};
