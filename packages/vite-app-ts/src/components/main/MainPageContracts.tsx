import { GenericContract } from 'eth-components/ant/generic-contract';
import { useEthersContext } from 'eth-hooks/context';
import React, { FC, useState } from 'react';

import { IScaffoldAppProviders } from '~~/components/main/hooks/useScaffoldAppProviders';
import { useAppContracts } from '~~/config/contractContext';
import { NETWORKS } from '~~/models/constants/networks';
export interface IMainPageContractsProps {
  scaffoldAppProviders: IScaffoldAppProviders;
  isAddSIOModalVisible: boolean;
  setIsSIOModalVisible: (visibility: boolean) => void;
}
import { AddSIOModal } from '~~/components/main/AddSIOModal';
import {SIOModal} from './SIOModal';

/**
 * 🎛 this scaffolding is full of commonly used components
    this <GenericContract/> component will automatically parse your ABI
    and give you a form to interact with it locally
 * @param props 
 * @returns 
 */
export const MainPageContracts: FC<IMainPageContractsProps> = (props) => {
  const ethersContext = useEthersContext();
  const mainnetDai = useAppContracts('DAI', NETWORKS.mainnet.chainId);
  const collect = useAppContracts('Collect', ethersContext.chainId);

  const [sios, addSios] = useState([]);

  if (ethersContext.account == null) {
    return <></>;
  }

  return (
    <>
      <>
        {/* **********
          ❓ this scaffolding is full of commonly used components
          this <Contract/> component will automatically parse your ABI
          and give you a form to interact with it locally
        ********** */}
        <GenericContract
          contractName="Collect"
          contract={collect}
          mainnetAdaptor={props.scaffoldAppProviders.mainnetAdaptor}
          blockExplorer={props.scaffoldAppProviders.targetNetwork.blockExplorer}
        />

        {/* **********
         * ❓ uncomment for a second contract:
         ********** */}
        {/*
          <GenericContract
            contractName="SecondContract"
            contract={contract={contractList?.['SecondContract']}
            mainnetProvider={props.appProviders.mainnetProvider}
            blockExplorer={props.appProviders.targetNetwork.blockExplorer}
            contractConfig={props.contractConfig}
          />
        */}
      </>

      <AddSIOModal visible={props.isAddSIOModalVisible} onCancel={() => props.setIsSIOModalVisible(false)} onSIOAdded={(element) => { addSios(oldSios => [...oldSios, element]) }}/>
      <SIOModal visible={props.isAddSIOModalVisible} ceramicStream="kjzl6cwe1jw147inns66gt9s27ia8qmwbf4w23nlcgz48wqyvt78jla8k72l32h" />
    </>
  );
};
