import { StatusBadge } from '@/components/console';
import { useIntl } from '@umijs/max';
import {
  Alert,
  Button,
  Flex,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Typography,
  message
} from 'antd';
import React from 'react';
import { evaluateIp, queryIpAccessPolicy, updateIpAccessPolicy } from '../apis';
import { EvaluateResult, IpAccessPolicy, IpScope } from '../config/types';

interface PolicyPanelProps {
  /** Bumped by the parent after a rule changes, so the test result
   *  cannot keep showing a verdict from a stale rule set. */
  rulesVersion: number;
  scope: IpScope;
}

const PolicyPanel: React.FC<PolicyPanelProps> = ({ rulesVersion, scope }) => {
  const intl = useIntl();
  const [policy, setPolicy] = React.useState<IpAccessPolicy | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [testIp, setTestIp] = React.useState('');
  const [testing, setTesting] = React.useState(false);
  const [testResult, setTestResult] = React.useState<EvaluateResult | null>(
    null
  );

  const load = React.useCallback(async () => {
    try {
      setPolicy(await queryIpAccessPolicy(scope));
    } catch (error) {
      // handled by the interceptor
    }
  }, [scope.kind, scope.scopeId]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    setTestResult(null);
  }, [rulesVersion]);

  const save = async (next: IpAccessPolicy) => {
    setSaving(true);
    try {
      const saved = await updateIpAccessPolicy(next, scope);
      setPolicy(saved);
      setTestResult(null);
      message.success(intl.formatMessage({ id: 'common.message.success' }));
    } catch (error) {
      // handled by the interceptor
    } finally {
      setSaving(false);
    }
  };

  const handleEnabledChange = (checked: boolean) => {
    if (!policy) {
      return;
    }
    if (!checked) {
      save({ ...policy, enabled: false });
      return;
    }
    // Turning enforcement on is the moment a mistake locks people out,
    // so it is the one action worth interrupting for.
    Modal.confirm({
      title: intl.formatMessage({ id: 'ipAccess.policy.confirm.title' }),
      content: intl.formatMessage({
        id:
          policy.default_action === 'deny'
            ? 'ipAccess.policy.confirm.deny'
            : 'ipAccess.policy.confirm.allow'
      }),
      okText: intl.formatMessage({ id: 'common.button.confirm' }),
      cancelText: intl.formatMessage({ id: 'common.button.cancel' }),
      onOk: () => save({ ...policy, enabled: true })
    });
  };

  const handleTest = async () => {
    if (!testIp.trim()) {
      return;
    }
    setTesting(true);
    try {
      setTestResult(await evaluateIp(testIp.trim(), scope));
    } catch (error) {
      // handled by the interceptor
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{ marginTop: 24 }}>
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        {intl.formatMessage({ id: 'ipAccess.page.description' })}
      </Typography.Paragraph>

      <Flex wrap gap={24} align="center">
        <Space>
          <span>{intl.formatMessage({ id: 'ipAccess.policy.enabled' })}</span>
          <Switch
            checked={!!policy?.enabled}
            loading={saving}
            disabled={!policy}
            onChange={handleEnabledChange}
          />
        </Space>
        <Space>
          <span>
            {intl.formatMessage({ id: 'ipAccess.policy.defaultAction' })}
          </span>
          <Select
            style={{ width: 180 }}
            value={policy?.default_action}
            disabled={!policy || saving}
            onChange={(value) =>
              policy && save({ ...policy, default_action: value })
            }
            options={[
              {
                label: intl.formatMessage({ id: 'ipAccess.action.allow' }),
                value: 'allow'
              },
              {
                label: intl.formatMessage({ id: 'ipAccess.action.deny' }),
                value: 'deny'
              }
            ]}
          />
        </Space>
        <Space>
          <Input
            style={{ width: 200 }}
            value={testIp}
            placeholder={intl.formatMessage({ id: 'ipAccess.test.holder' })}
            onChange={(e) => setTestIp(e.target.value)}
            onPressEnter={handleTest}
          />
          <Button loading={testing} onClick={handleTest}>
            {intl.formatMessage({ id: 'ipAccess.test.button' })}
          </Button>
          {testResult && (
            <StatusBadge tone={testResult.allowed ? 'success' : 'danger'} plain>
              {intl.formatMessage({
                id: testResult.allowed
                  ? 'ipAccess.test.allowed'
                  : 'ipAccess.test.blocked'
              })}
              {testResult.matched_rule_id
                ? ` · #${testResult.matched_rule_id}`
                : ` · ${intl.formatMessage({ id: 'ipAccess.test.byDefault' })}`}
            </StatusBadge>
          )}
        </Space>
      </Flex>

      {policy?.enabled && policy?.default_action === 'deny' && (
        <Alert
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
          message={intl.formatMessage({ id: 'ipAccess.policy.denyWarning' })}
        />
      )}
    </div>
  );
};

export default PolicyPanel;
