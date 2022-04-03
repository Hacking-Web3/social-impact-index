import {GlobalOutlined, InstagramOutlined, PlusOutlined, TwitterOutlined} from '@ant-design/icons';
import {Form, Modal, Upload, Input} from 'antd';
import {FC} from 'react';

// displays a page header
export interface IAddSIOModalProps {
  visible: boolean;
  onCancel: () => void;
}

export const AddSIOModal:FC<IAddSIOModalProps> = (props) => {
  const formItemLayout = {
    labelCol: { span: 4 },
    wrapperCol: { span: 8 },
  };

  const onFinish = () => {
    props.onCancel();
  }

  const normFile = (e: any) => {
    console.log('Upload event:', e);
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Modal title="Add SIO" visible={props.visible} onCancel={props.onCancel}>
      <Form
        name="add-sio"
        {...formItemLayout}
        onFinish={onFinish}
        initialValues={{
          'input-number': 3,
          'checkbox-group': ['A', 'B'],
          rate: 3.5,
        }}
      >
      <Form.Item label="SIO profile image">
        <Form.Item name="user-image" valuePropName="fileList" getValueFromEvent={normFile} noStyle>
          <Upload.Dragger name="files" action="/upload.do">
            <PlusOutlined />
          </Upload.Dragger>
        </Form.Item>
      </Form.Item>
      <Form.Item
        label="Name"
        name="sio-name"
        rules={[{ required: true, message: 'Please input SIO name' }]}
      >
        <Input placeholder="SIO name" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please input description' }]}
      >
        <Input.TextArea showCount maxLength={100} />
      </Form.Item>
      <Form.Item
        label="Wallet address"
        name="wallet-address"
        rules={[{ required: true, message: 'Please enter wallet address' }]}
      >
        <Form.Item
        name="Legal address"
        label="legal-address"
        rules={[{ required: true, message: 'Please enter legal address' }]}
      >
      </Form.Item>
        <Input placeholder="0x00..." />
      </Form.Item>
      <Form.Item
        label="Website"
        name="website"
      >
        <Input placeholder="0x00..." prefix={<GlobalOutlined />}/>
      </Form.Item>
      <Form.Item
        label="Twitter"
        name="twitter"
      >
        <Input placeholder="0x00..." prefix={<TwitterOutlined />}/>
      </Form.Item>
      <Form.Item
        label="Instagram"
        name="instagram"
      >
        <Input placeholder="0x00..." prefix={<InstagramOutlined />}/>
      </Form.Item>
    </Form>
    </Modal>
  );
}
