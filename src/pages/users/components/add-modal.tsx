import { PageAction, PasswordReg } from '@/config';
import { PageActionType } from '@/config/types';
import {
  catalogRoleLabel,
  PLATFORM_ADMIN_ROLE,
  PLATFORM_USER_ROLE,
  sortCatalogRoles,
  type CatalogRole
} from '@/enterprise/role-labels';
import {
  Input as CInput,
  FormDrawer,
  IconFont,
  Select as SealSelect,
  Switch as SealSwitch,
  useSubmitLock
} from '@gpustack/core-ui';
import { request, useIntl, useModel } from '@umijs/max';
import { Form, Select } from 'antd';
import { useEffect, useState } from 'react';
import {
  AuthSources,
  formatAuthSourceLabel,
  generateLocalPassword
} from '../config';
import { FormData, ListItem } from '../config/types';

type AddModalProps = {
  title: string;
  action: PageActionType;
  open: boolean;
  onOk: (values: FormData) => void;
  data?: ListItem | null;
  onCancel: () => void;
};
const AddModal: React.FC<AddModalProps> = ({
  title,
  action,
  open,
  onOk,
  data,
  onCancel
}) => {
  const { initialState } = useModel('@@initialState') || {};
  const [form] = Form.useForm();
  const intl = useIntl();
  const { loading, guard, run, release } = useSubmitLock();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [roles, setRoles] = useState<CatalogRole[]>([]);
  const [orgs, setOrgs] = useState<{ id: number; name: string }[]>([]);
  const existingSource = data?.source ?? AuthSources.LOCAL;
  // Add User only creates a local account. External (OIDC / SAML / CAS)
  // rows are provisioned on first SSO login, so the source picker is
  // gone from create. Edit shows the stored source read-only.
  const isLocalUser =
    action === PageAction.CREATE || existingSource === AuthSources.LOCAL;

  const initFormValue = (catalog: CatalogRole[]) => {
    const adminRole = catalog.find(
      (item) =>
        item.code === PLATFORM_ADMIN_ROLE || item.name === PLATFORM_ADMIN_ROLE
    );
    const userRole = catalog.find(
      (item) =>
        item.code === PLATFORM_USER_ROLE || item.name === PLATFORM_USER_ROLE
    );
    if (action === PageAction.EDIT && open) {
      const fallback = data?.is_admin ? adminRole?.id : userRole?.id;
      form.setFieldsValue({
        ...data,
        role_id: data?.role_id || fallback,
        organization_id: data?.organization_id ?? undefined,
        is_active: !!data?.is_active,
        source: data?.source || AuthSources.LOCAL
      });
    } else if (action === PageAction.CREATE && open) {
      form.setFieldsValue({
        role_id: userRole?.id,
        is_active: true,
        source: AuthSources.LOCAL,
        password: generateLocalPassword()
      });
    }
  };

  const fillRandomPassword = () => {
    form.setFieldValue('password', generateLocalPassword());
    setPasswordVisible(true);
  };

  const handleSubmit = () => {
    guard(() => form.submit());
  };

  const onFinish = async (values: FormData) => {
    await run(() => onOk(values));
  };

  useEffect(() => {
    if (!open) {
      return;
    }
    setPasswordVisible(action === PageAction.CREATE);
    Promise.all([
      request('/roles', {
        params: { page: 1, perPage: 200, is_active: true }
      }),
      request('/organizations', { params: { page: 1, perPage: 200 } })
    ])
      .then(([rolePage, orgPage]) => {
        const catalog = sortCatalogRoles(rolePage.items || []);
        setRoles(catalog);
        setOrgs(
          (orgPage.items || []).map((item: any) => ({
            id: item.id,
            name: item.display_name || item.name
          }))
        );
        initFormValue(catalog);
      })
      .catch(() => {
        setRoles([]);
        setOrgs([]);
        initFormValue([]);
      });
  }, [open]);

  return (
    <FormDrawer
      title={title}
      open={open}
      onCancel={onCancel}
      onSubmit={handleSubmit}
      loading={loading}
    >
      <Form
        name="addUserForm"
        form={form}
        onFinish={onFinish}
        onFinishFailed={release}
        preserve={false}
      >
        <Form.Item<FormData>
          name="username"
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
            autoComplete="off"
            label={intl.formatMessage({ id: 'common.table.name' })}
            required
          ></CInput.Input>
        </Form.Item>
        <Form.Item<FormData> name="full_name" rules={[{ required: false }]}>
          <CInput.Input
            trim={false}
            label={intl.formatMessage({ id: 'users.form.fullname' })}
          ></CInput.Input>
        </Form.Item>
        <Form.Item<FormData>
          name="email"
          rules={[
            {
              type: 'email',
              message: intl.formatMessage({ id: 'users.form.rule.email' })
            }
          ]}
        >
          <CInput.Input
            label={intl.formatMessage({ id: 'users.form.email' })}
          ></CInput.Input>
        </Form.Item>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <Form.Item<FormData>
              name="phone"
              rules={[
                {
                  pattern: /^\+?[\d\s\-()]{6,20}$/,
                  message: intl.formatMessage({ id: 'users.form.rule.phone' })
                }
              ]}
            >
              <CInput.Input
                label={intl.formatMessage({ id: 'users.form.phone' })}
              ></CInput.Input>
            </Form.Item>
          </div>
          <div style={{ flex: 1 }}>
            <Form.Item<FormData> name="organization_id">
              <SealSelect
                allowClear
                label={intl.formatMessage({ id: 'users.form.organization' })}
              >
                {orgs.map((item) => (
                  <Select.Option value={item.id} key={item.id}>
                    {item.name}
                  </Select.Option>
                ))}
              </SealSelect>
            </Form.Item>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <Form.Item<FormData>
              name="role_id"
              rules={[
                {
                  required: true,
                  message: intl.formatMessage(
                    { id: 'common.form.rule.select' },
                    {
                      name: intl.formatMessage({ id: 'users.table.role' })
                    }
                  )
                }
              ]}
            >
              <SealSelect
                label={intl.formatMessage({ id: 'users.table.role' })}
                disabled={
                  data?.id === initialState?.currentUser?.id &&
                  action === PageAction.EDIT
                }
              >
                {roles.map((item) => {
                  return (
                    <Select.Option value={item.id} key={item.id}>
                      {item.code === PLATFORM_ADMIN_ROLE ||
                      item.name === PLATFORM_ADMIN_ROLE ? (
                        <IconFont
                          type="icon-manage_user"
                          className="size-16"
                        ></IconFont>
                      ) : (
                        <IconFont
                          type="icon-user"
                          className="size-16"
                        ></IconFont>
                      )}
                      <span className="m-l-5">
                        {catalogRoleLabel(item.name, intl.formatMessage)}
                      </span>
                    </Select.Option>
                  );
                })}
              </SealSelect>
            </Form.Item>
          </div>
          {(data?.id !== initialState?.currentUser?.id ||
            action === PageAction.CREATE) && (
            <div style={{ flex: 1 }}>
              <Form.Item<FormData>
                name="is_active"
                rules={[{ required: false }]}
                valuePropName="checked"
              >
                <SealSwitch
                  label={intl.formatMessage({ id: 'users.form.active' })}
                  description={intl.formatMessage({
                    id: 'users.form.active.description'
                  })}
                />
              </Form.Item>
            </div>
          )}
        </div>

        {action === PageAction.EDIT && (
          <>
            <Form.Item<FormData> name="source" hidden>
              <input type="hidden" />
            </Form.Item>
            <Form.Item
              extra={intl.formatMessage({ id: 'users.form.source.readonly' })}
            >
              <CInput.Input
                disabled
                label={intl.formatMessage({ id: 'users.form.source' })}
                value={formatAuthSourceLabel(
                  existingSource,
                  intl.formatMessage
                )}
              />
            </Form.Item>
          </>
        )}

        {isLocalUser && (
          <Form.Item<FormData>
            name="password"
            rules={[
              {
                required: action === PageAction.CREATE,
                pattern: PasswordReg,
                message: intl.formatMessage({ id: 'users.form.rule.password' })
              }
            ]}
            extra={
              <a
                href="#generate-password"
                onClick={(event) => {
                  event.preventDefault();
                  fillRandomPassword();
                }}
              >
                {intl.formatMessage({ id: 'users.form.password.generate' })}
              </a>
            }
          >
            <CInput.Password
              autoComplete={'new-password'}
              label={intl.formatMessage({ id: 'common.form.password' })}
              required={action === PageAction.CREATE}
              visibilityToggle={{
                visible: passwordVisible,
                onVisibleChange: setPasswordVisible
              }}
              onPressEnter={handleSubmit}
            ></CInput.Password>
          </Form.Item>
        )}
      </Form>
    </FormDrawer>
  );
};

export default AddModal;
