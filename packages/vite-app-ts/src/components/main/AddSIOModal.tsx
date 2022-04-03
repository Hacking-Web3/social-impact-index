import { GlobalOutlined, InstagramOutlined, PlusOutlined, TwitterOutlined } from '@ant-design/icons';
import { Form, Modal, Upload, Input } from 'antd';
import {ethers} from 'ethers';
import { transactor } from 'eth-components/functions';
import { EthComponentsSettingsContext } from 'eth-components/models';
import { FC, useContext } from 'react';

import { getSIOModel } from '~~/helpers/datastore';
import {useGasPrice} from 'eth-hooks';
import {useEthersContext} from 'eth-hooks/context';
import {useAppContracts} from '~~/config/contractContext';

// displays a page header
export interface IAddSIOModalProps {
  visible: boolean;
  onCancel: () => void;
}

export const AddSIOModal: FC<IAddSIOModalProps> = (props) => {
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
  };

  const ethersContext = useEthersContext();

  const ethComponentsSettings = useContext(EthComponentsSettingsContext);
  const [gasPrice] = useGasPrice(ethersContext.chainId, 'fast');
  const tx = transactor(ethComponentsSettings, ethersContext?.signer, gasPrice);

  const collect = useAppContracts('Collect', ethersContext.chainId);

  const onFinish = (props): void => {
    console.log(props);
    props.onCancel();
  };

  const onFinishFailed = (props): void => {
    console.log('failed');
    console.log(props);
    props.onCancel();
  };

  const normFile = (e: any): any => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const submitForm = async (): Promise<void> => {
    try {
      await form.validateFields();
    } catch (e) {
      console.log(e);
      return;
    }

    const { image, ...values } = form.getFieldsValue();

    if (!values.twitter) { 
      values.twitter = "";
    }

    if (!values.website) { 
      values.website = "";
    }

    if (!values.instagram) { 
      values.instagram = "";
    }

    const model = getSIOModel();

    const tile = await model.createTile('SIOProfile', values, { pin: true });

    console.log(tile.id.toString());

    const randomId = ethers.BigNumber.from(ethers.utils.randomBytes(32));

    const result = tx?.(collect?.setSIOs([randomId], [{ceramicStream: tile.id.toString(), ownerAddress: values.walletAddress, acceptAnonymous: true}]), (update: any) => {
      console.log('📡 Transaction Update:', update);
      if (update && (update.status === 'confirmed' || update.status === 1)) {
        console.log(' 🍾 Transaction ' + update.hash + ' finished!');
        console.log(
          ' ⛽️ ' +
            update.gasUsed +
            '/' +
            (update.gasLimit || update.gas) +
            ' @ ' +
            parseFloat(update.gasPrice) / 1000000000 +
            ' gwei'
        );
      }
    });
  }

  return (
    <Modal title="Add SIO" visible={props.visible} onCancel={props.onCancel} onOk={submitForm}>
      <Form
        name="add-sio"
        {...formItemLayout}
        onFinishFailed={onFinishFailed}
        onFinish={onFinish}
        form={form}
        initialValues={{
          'input-number': 3,
          'checkbox-group': ['A', 'B'],
          rate: 3.5,
        }}>
        <Form.Item label="SIO profile image">
          <Form.Item name="image" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
            <Upload.Dragger name="files" action="/upload.do">
              <PlusOutlined />
            </Upload.Dragger>
          </Form.Item>
        </Form.Item>
        <Form.Item label="Name" name="name" rules={[{ required: true, message: 'Please input SIO name' }]}>
          <Input placeholder="SIO name" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please input description' }]}>
          <Input.TextArea showCount maxLength={100} />
        </Form.Item>
        <Form.Item
        name="Legal address"
        label="legalAddress"
        rules={[{ required: true, message: 'Please enter legal address' }]}
      >
        <Input placeholder="..." />
      </Form.Item>
        <Form.Item
          label="Wallet address"
          name="walletAddress"
          rules={[{ required: true, message: 'Please enter wallet address' }]}>
          <Input placeholder="0x00..." />
        </Form.Item>
        <Form.Item label="Website" name="website">
          <Input prefix={<GlobalOutlined />} />
        </Form.Item>
        <Form.Item label="Twitter" name="twitter">
          <Input prefix={<TwitterOutlined />} />
        </Form.Item>
        <Form.Item label="Instagram" name="instagram">
          <Input prefix={<InstagramOutlined />} />
        </Form.Item>
      </Form>
    </Modal>
  );
};
