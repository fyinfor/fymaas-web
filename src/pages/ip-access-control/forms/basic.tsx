import {
  Input as CInput,
  InputNumber,
  Select,
  Switch,
  Textarea,
  useAppUtils
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Form } from 'antd';
import { validateCidr } from '../config/cidr';
import { FormData } from '../config/types';

const Basic = () => {
  const intl = useIntl();
  const { getRuleMessage } = useAppUtils();

  const actionOptions = [
    {
      label: intl.formatMessage({ id: 'ipAccess.action.allow' }),
      value: 'allow'
    },
    {
      label: intl.formatMessage({ id: 'ipAccess.action.deny' }),
      value: 'deny'
    }
  ];

  return (
    <>
      <Form.Item<FormData>
        name="name"
        rules={[
          {
            required: true,
            message: getRuleMessage('input', 'common.table.name')
          }
        ]}
      >
        <CInput.Input
          label={intl.formatMessage({ id: 'common.table.name' })}
          required
        />
      </Form.Item>
      <Form.Item<FormData>
        name="cidr"
        rules={[
          {
            required: true,
            message: getRuleMessage('input', 'ipAccess.form.cidr')
          },
          {
            validator: async (_rule, value) => {
              if (!value) {
                return Promise.resolve();
              }
              const error = validateCidr(value);
              if (!error) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error(
                  intl.formatMessage({
                    id:
                      error === 'hostBits'
                        ? 'ipAccess.form.rule.cidrHostBits'
                        : 'ipAccess.form.rule.cidr'
                  })
                )
              );
            }
          }
        ]}
      >
        <CInput.Input
          label={intl.formatMessage({ id: 'ipAccess.form.cidr' })}
          placeholder="10.0.0.0/8"
          required
        />
      </Form.Item>
      <Form.Item<FormData> name="action">
        <Select
          label={intl.formatMessage({ id: 'ipAccess.form.action' })}
          options={actionOptions}
          required
        />
      </Form.Item>
      <Form.Item<FormData> name="priority">
        <InputNumber
          label={intl.formatMessage({ id: 'ipAccess.form.priority' })}
          min={0}
          style={{ width: '100%' }}
          description={intl.formatMessage({
            id: 'ipAccess.form.priority.tips'
          })}
        />
      </Form.Item>
      <Form.Item<FormData> name="enabled" valuePropName="checked">
        <Switch label={intl.formatMessage({ id: 'ipAccess.form.enabled' })} />
      </Form.Item>
      <Form.Item<FormData> name="description">
        <Textarea
          label={intl.formatMessage({ id: 'common.table.description' })}
          trim={false}
          autoSize={{ minRows: 2, maxRows: 6 }}
        />
      </Form.Item>
    </>
  );
};

export default Basic;
