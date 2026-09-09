import { PageAction } from '@/config';
import { PageActionType } from '@/config/types';
import {
  AlertBlockInfo,
  ColumnWrapper,
  CopyButton,
  GSDrawer,
  ModalFooter,
  useSubmitLock
} from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Form } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useEffect, useRef, useState } from 'react';
import { createApisKey, updateApisKey } from '../../apis';
import { FormData, ListItem } from '../../config/types';
import ApiKeySecret from '../api-key-secret';
import APIKeyForm from './form';

const ModalFooterStyle = {
  padding: '16px 24px 8px',
  display: 'flex',
  justifyContent: 'flex-end'
};

type AddModalProps = {
  title: string;
  action: PageActionType;
  open: boolean;
  currentData?: Partial<ListItem> | null;
  onOk: () => void;
  onCancel: () => void;
};

const AddModal: React.FC<AddModalProps> = ({
  title,
  action,
  open,
  currentData,
  onOk,
  onCancel
}) => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const [showKey, setShowKey] = useState(false);
  const [apikeyValue, setAPIKeyValue] = useState('');
  const { loading, guard, run, release } = useSubmitLock();
  const [isChanged, setIsChanged] = useState(false);
  const cacheFormRef = useRef<{
    allowed_type: string;
    allowed_model_names: string[];
  }>({} as any);

  const toExpiresInSeconds = (data: FormData) => {
    if (data.expires_never || !data.expires_at) {
      return 0;
    }
    const expiresAt = dayjs(data.expires_at as Dayjs).endOf('day');
    return Math.max(expiresAt.diff(dayjs(), 'second'), 1);
  };

  const createAPIKey = async (data: FormData) => {
    const params = {
      ..._.omit(data, ['expires_at', 'expires_never', 'key_type', 'custom']),
      expires_in: toExpiresInSeconds(data)
    };
    const res = await createApisKey({ data: params });
    onOk();
    setAPIKeyValue(res.value);
    setShowKey(true);
  };

  const updateAPIKey = async (data: FormData) => {
    await updateApisKey(currentData?.id as number, { data });
    onOk();
    onCancel();
  };

  const handleOnOk = async (formdata: FormData) => {
    await run(async () => {
      try {
        const data = {
          ..._.omit(formdata, ['allowed_type']),
          scope: ['inference'],
          allowed_model_names:
            formdata.allowed_type === 'all'
              ? []
              : formdata.allowed_model_names || []
        };
        if (action === PageAction.CREATE) {
          await createAPIKey(data);
        } else if (action === PageAction.EDIT && currentData?.id) {
          await updateAPIKey({
            ..._.omit(data, ['expires_at', 'expires_never', 'expires_in'])
          });
        }
      } catch (error) {
        // handled in interceptor
      }
    });
  };

  const handleSumit = () => {
    guard(() => form.submit());
  };

  const handleDone = () => {
    onCancel();
  };

  const handleAfterOpenChange = (isOpen: boolean) => {
    setShowKey(false);
  };

  const customEqual = (objValue: any, othValue: any) => {
    if (_.isArray(objValue) && _.isArray(othValue)) {
      return _.isEmpty(_.xor(objValue, othValue));
    }
    return undefined;
  };

  const handleOnValuesChange = async (changedValues: any, allValues: any) => {
    const initialValues = cacheFormRef.current;
    await new Promise((resolve) => {
      setTimeout(resolve, 100);
    });
    if (
      _.isEqualWith(
        initialValues,
        _.pick(allValues, Object.keys(initialValues)),
        customEqual
      )
    ) {
      setIsChanged(false);
    } else {
      setIsChanged(true);
    }
  };

  const initValues = () => {
    if (action === PageAction.CREATE && open) {
      form.setFieldsValue({
        expires_never: false,
        expires_at: dayjs().add(1, 'month')
      });
    }
    if (action === PageAction.EDIT && currentData && open) {
      const isLegacyAllScope = currentData.scope?.includes('*');
      const normalizedAllowedModelNames = isLegacyAllScope
        ? []
        : currentData.allowed_model_names || [];
      const hasExpiry = Boolean(currentData.expires_at);
      form.setFieldsValue({
        name: currentData.name,
        description: currentData.description,
        scope: ['inference'],
        allowed_type: normalizedAllowedModelNames.length ? 'custom' : 'all',
        expires_never: !hasExpiry,
        expires_at: hasExpiry ? dayjs(currentData.expires_at) : undefined,
        allowed_model_names: normalizedAllowedModelNames
      });
    }

    cacheFormRef.current = {
      allowed_type: form.getFieldValue('allowed_type'),
      allowed_model_names: form.getFieldValue('allowed_model_names')
    };
  };

  useEffect(() => {
    if (!open) {
      setIsChanged(false);
      cacheFormRef.current = {} as any;
    } else {
      initValues();
    }
  }, [open]);

  return (
    <GSDrawer
      title={
        !showKey ? title : intl.formatMessage({ id: 'apikeys.title.created' })
      }
      open={open}
      onClose={onCancel}
      afterOpenChange={handleAfterOpenChange}
      destroyOnHidden={true}
      closeIcon={false}
      mask={{
        closable: false
      }}
      keyboard={false}
      styles={{
        wrapper: { width: 600 }
      }}
      footer={false}
    >
      <ColumnWrapper
        styles={{
          container: { paddingBlock: 0 }
        }}
        footer={
          !showKey ? (
            <>
              {isChanged && (
                <div style={{ marginInline: 24, paddingTop: 8 }}>
                  <AlertBlockInfo
                    type="warning"
                    contentStyle={{ paddingInline: 0 }}
                    message={intl.formatMessage({
                      id: 'models.button.accessSettings.tips'
                    })}
                  ></AlertBlockInfo>
                </div>
              )}
              <ModalFooter
                onOk={handleSumit}
                onCancel={onCancel}
                loading={loading}
                style={ModalFooterStyle}
              ></ModalFooter>
            </>
          ) : (
            <>
              <ModalFooter
                onOk={handleDone}
                onCancel={onCancel}
                loading={loading}
                okText={intl.formatMessage({ id: 'common.button.done' })}
                showCancelBtn={false}
                style={ModalFooterStyle}
              ></ModalFooter>
            </>
          )
        }
      >
        <Form
          name="addAPIKey"
          form={form}
          onFinish={handleOnOk}
          onFinishFailed={release}
          preserve={false}
          initialValues={{
            allowed_type: 'all',
            scope: ['inference'],
            allowed_model_names: []
          }}
        >
          {!showKey && (
            <APIKeyForm
              action={action}
              currentData={currentData}
              onValuesChange={handleOnValuesChange}
            ></APIKeyForm>
          )}
          {showKey && action === PageAction.CREATE && (
            <div>
              <p
                style={{
                  margin: '0 0 16px',
                  color: 'var(--ant-color-text-secondary)',
                  fontSize: 13,
                  lineHeight: 1.6
                }}
              >
                {intl.formatMessage({ id: 'apikeys.table.save.tips' })}
              </p>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 14px',
                  border: '1px solid var(--ant-color-border)',
                  borderRadius: 8,
                  background: 'var(--ant-color-fill-quaternary)'
                }}
              >
                <ApiKeySecret block value={apikeyValue} />
              </div>
              <div style={{ marginTop: 16 }}>
                <CopyButton
                  text={apikeyValue}
                  shape="default"
                  size="middle"
                  type="default"
                >
                  {intl.formatMessage({ id: 'apikeys.button.copySecret' })}
                </CopyButton>
              </div>
            </div>
          )}
        </Form>
      </ColumnWrapper>
    </GSDrawer>
  );
};

export default AddModal;
