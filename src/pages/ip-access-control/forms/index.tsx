import { PageAction } from '@/config';
import { PageActionType } from '@/config/types';
import { Form } from 'antd';
import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { FormData, ListItem } from '../config/types';
import Basic from './basic';

interface IpAccessRuleFormProps {
  ref?: any;
  open: boolean;
  action: PageActionType;
  currentData?: ListItem | null;
  onFinish: (values: FormData) => Promise<void>;
  onFinishFailed?: (errorInfo: any) => void;
}

const IpAccessRuleForm: React.FC<IpAccessRuleFormProps> = forwardRef(
  (props, ref) => {
    const { action, currentData, open, onFinish, onFinishFailed } = props;
    const [form] = Form.useForm<FormData>();

    useEffect(() => {
      if (!open) {
        form.resetFields();
        return;
      }

      if (action === PageAction.EDIT && currentData) {
        form.setFieldsValue({
          name: currentData.name,
          description: currentData.description || undefined,
          action: currentData.action,
          cidr: currentData.cidr,
          priority: currentData.priority,
          enabled: currentData.enabled
        });
      }
    }, [action, currentData, form, open]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        form.submit();
      },
      resetFields: () => {
        form.resetFields();
      }
    }));

    return (
      <Form
        name="ipAccessRuleForm"
        form={form}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        preserve={false}
        // A new rule defaults to allow, enabled, and a mid-range
        // priority so it can be ordered either side of later ones
        // without renumbering.
        initialValues={{ action: 'allow', priority: 100, enabled: true }}
      >
        <Basic />
      </Form>
    );
  }
);

export default IpAccessRuleForm;
