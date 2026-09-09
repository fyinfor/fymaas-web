import { PageAction } from '@/config';
import { PageActionType } from '@/config/types';
import { Input as CInput } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Checkbox, DatePicker, Form } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import React from 'react';
import { FormData, ListItem } from '../../config/types';
import AllowModelsForm from './allow-models';

const APIKeyForm: React.FC<{
  action: PageActionType;
  currentData?: Partial<ListItem> | null;
  onValuesChange?: (changedValues: any, allValues: any) => void;
}> = ({ action, currentData, onValuesChange }) => {
  const intl = useIntl();
  const form = Form.useFormInstance<FormData>();
  const expiresNever = Form.useWatch('expires_never', form);

  const expirePresets = [
    {
      label: intl.formatMessage({ id: 'apikeys.form.expiration.7days' }),
      value: dayjs().add(7, 'day')
    },
    {
      label: intl.formatMessage({ id: 'apikeys.form.expiration.1month' }),
      value: dayjs().add(1, 'month')
    },
    {
      label: intl.formatMessage({ id: 'apikeys.form.expiration.6months' }),
      value: dayjs().add(6, 'month')
    }
  ];

  return (
    <>
      <p
        style={{
          margin: '0 0 16px',
          color: 'var(--ant-color-text-secondary)',
          fontSize: 13,
          lineHeight: 1.6
        }}
      >
        {intl.formatMessage({ id: 'apikeys.form.editorDescription' })}
      </p>
      <Form.Item<FormData>
        name="name"
        rules={[
          {
            required: true,
            message: intl.formatMessage(
              { id: 'common.form.rule.input' },
              {
                name: intl.formatMessage({ id: 'common.table.name' })
              }
            )
          }
        ]}
      >
        <CInput.Input
          trim
          disabled={action === PageAction.EDIT}
          label={intl.formatMessage({ id: 'common.table.name' })}
          required
        ></CInput.Input>
      </Form.Item>

      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 8
        }}
      >
        {intl.formatMessage({ id: 'apikeys.form.expiretime' })}
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 12,
          alignItems: 'center',
          marginBottom: 4
        }}
      >
        <Form.Item
          name="expires_at"
          style={{ marginBottom: 0 }}
          rules={[
            {
              validator: async (_, value) => {
                if (form.getFieldValue('expires_never')) {
                  return;
                }
                if (!value) {
                  return Promise.reject(
                    new Error(
                      intl.formatMessage(
                        { id: 'common.form.rule.select' },
                        {
                          name: intl.formatMessage({
                            id: 'apikeys.form.expiretime'
                          })
                        }
                      )
                    )
                  );
                }
              }
            }
          ]}
        >
          <DatePicker
            allowClear
            size="large"
            disabled={action === PageAction.EDIT || !!expiresNever}
            style={{ width: '100%' }}
            format="YYYY-MM-DD"
            placeholder={intl.formatMessage({
              id: 'apikeys.form.expirePlaceholder'
            })}
            presets={expirePresets}
            disabledDate={(current: Dayjs) =>
              !!current &&
              current.startOf('day').isBefore(dayjs().startOf('day'))
            }
            getPopupContainer={() => document.body}
          />
        </Form.Item>
        <Form.Item
          name="expires_never"
          valuePropName="checked"
          style={{ marginBottom: 0 }}
        >
          <Checkbox
            disabled={action === PageAction.EDIT}
            onChange={(event) => {
              if (event.target.checked) {
                form.setFieldValue('expires_at', undefined);
              } else if (!form.getFieldValue('expires_at')) {
                form.setFieldValue('expires_at', dayjs().add(1, 'month'));
              }
            }}
          >
            {intl.formatMessage({ id: 'apikeys.form.expiration.never' })}
          </Checkbox>
        </Form.Item>
      </div>
      <div
        style={{
          color: 'var(--ant-color-text-tertiary)',
          fontSize: 12,
          lineHeight: 1.5,
          marginBottom: 24
        }}
      >
        {intl.formatMessage({ id: 'apikeys.form.expireHint' })}
      </div>
      <Form.Item<FormData> name="description" rules={[{ required: false }]}>
        <CInput.TextArea
          scaleSize={true}
          label={intl.formatMessage({ id: 'common.table.description' })}
        ></CInput.TextArea>
      </Form.Item>

      <AllowModelsForm
        currentData={currentData}
        action={action}
        onValuesChange={onValuesChange}
      ></AllowModelsForm>
    </>
  );
};

export default APIKeyForm;
