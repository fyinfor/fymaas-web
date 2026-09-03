import { ExclamationCircleFilled } from '@ant-design/icons';
import { AlertBlockInfo, SwitchCard } from '@gpustack/core-ui';
import { useIntl } from '@umijs/max';
import { Input, Radio, Select, Typography } from 'antd';
import React, { useEffect, useMemo } from 'react';
import useServerUrlProbe from '../../hooks/use-server-url-probe';
import {
  CUSTOM_VALUE,
  defaultServerUrlConfig,
  mergeServerUrlCandidates,
  normalizeLanServerUrl,
  ServerUrlNetwork
} from '../../utils/server-url';
import { useAddWorkerContext } from './add-worker-context';

const ServerUrlSelect: React.FC = () => {
  const intl = useIntl();
  const { registrationInfo, summary, updateField } = useAddWorkerContext();
  const serverUrlConfig =
    summary.get('serverUrlConfig') || defaultServerUrlConfig(registrationInfo);

  const merged = useMemo(
    () => mergeServerUrlCandidates(registrationInfo),
    [
      registrationInfo?.server_url,
      registrationInfo?.server_lan_url,
      registrationInfo?.api_port,
      JSON.stringify(registrationInfo?.server_url_candidates || [])
    ]
  );

  useEffect(() => {
    updateField('serverUrlConfig', defaultServerUrlConfig(registrationInfo));
  }, [
    registrationInfo?.cluster_id,
    registrationInfo?.server_url,
    registrationInfo?.server_lan_url
  ]);

  const options =
    serverUrlConfig.network === 'private' ? merged.private : merged.public;
  const selectValue = serverUrlConfig.custom
    ? CUSTOM_VALUE
    : serverUrlConfig.url || CUSTOM_VALUE;
  const { loading, result } = useServerUrlProbe(serverUrlConfig.url);

  const setConfig = (next: {
    network?: ServerUrlNetwork;
    url?: string;
    custom?: boolean;
  }) => {
    updateField('serverUrlConfig', {
      ...serverUrlConfig,
      ...next
    });
  };

  const handleNetworkChange = (network: ServerUrlNetwork) => {
    const list = network === 'private' ? merged.private : merged.public;
    const first = list[0]?.url || '';
    setConfig({
      network,
      url:
        network === 'private'
          ? normalizeLanServerUrl(first, merged.apiPort)
          : first,
      custom: !first
    });
  };

  const handleSelectChange = (value: string) => {
    if (value === CUSTOM_VALUE) {
      setConfig({ custom: true, url: '' });
      return;
    }
    setConfig({ custom: false, url: value });
  };

  const probeMessage = (() => {
    if (loading) {
      return intl.formatMessage(
        { id: 'clusters.addworker.probe.checking' },
        { url: serverUrlConfig.url }
      );
    }
    if (!result || !serverUrlConfig.url) {
      return '';
    }
    if (result.kind === 'api' && result.ok) {
      return intl.formatMessage(
        { id: 'clusters.addworker.probe.ok' },
        { version: result.version || '-' }
      );
    }
    if (result.kind === 'redirect') {
      return intl.formatMessage(
        { id: 'clusters.addworker.probe.redirect' },
        { location: result.location || 'https://' }
      );
    }
    if (result.kind === 'html') {
      return intl.formatMessage({ id: 'clusters.addworker.probe.html' });
    }
    if (result.kind === 'invalid') {
      return intl.formatMessage({ id: 'clusters.addworker.probe.invalid' });
    }
    if (result.kind === 'unreachable') {
      return intl.formatMessage(
        { id: 'clusters.addworker.probe.unreachable' },
        { url: serverUrlConfig.url }
      );
    }
    return intl.formatMessage(
      { id: 'clusters.addworker.probe.unexpected' },
      { url: serverUrlConfig.url }
    );
  })();

  return (
    <div style={{ marginBottom: 16 }}>
      <SwitchCard
        label={intl.formatMessage({
          id: 'clusters.addworker.serverUrl.network'
        })}
        defaultValue={true}
        showSwitch={false}
        styles={{
          wrapper: {
            borderRadius: 4
          }
        }}
      >
        <Typography.Text type="secondary">
          {intl.formatMessage({
            id: 'clusters.addworker.serverUrl.network.tips'
          })}
        </Typography.Text>
        <Radio.Group
          value={serverUrlConfig.network}
          onChange={(e) => handleNetworkChange(e.target.value)}
          style={{ marginTop: 8, display: 'flex', gap: 16, flexWrap: 'wrap' }}
        >
          <Radio value="private">
            {intl.formatMessage({
              id: 'clusters.addworker.serverUrl.private'
            })}
            <Typography.Text type="secondary" style={{ marginLeft: 6 }}>
              {intl.formatMessage({
                id: 'clusters.addworker.serverUrl.private.tag'
              })}
            </Typography.Text>
          </Radio>
          <Radio value="public">
            {intl.formatMessage({
              id: 'clusters.addworker.serverUrl.public'
            })}
          </Radio>
        </Radio.Group>
        {options.length > 0 && (
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={selectValue}
            onChange={handleSelectChange}
            options={[
              ...options.map((item) => ({
                label: item.url,
                value: item.url
              })),
              {
                label: intl.formatMessage({
                  id: 'clusters.addworker.serverUrl.custom'
                }),
                value: CUSTOM_VALUE
              }
            ]}
          />
        )}
        {(serverUrlConfig.custom || options.length === 0) && (
          <Input
            style={{ width: '100%', marginTop: 8 }}
            value={serverUrlConfig.url}
            placeholder={intl.formatMessage({
              id: 'clusters.addworker.serverUrl.placeholder'
            })}
            onChange={(e) =>
              setConfig({ custom: true, url: e.target.value.trim() })
            }
            onBlur={() => {
              if (serverUrlConfig.network !== 'private') {
                return;
              }
              const next = normalizeLanServerUrl(
                serverUrlConfig.url,
                merged.apiPort
              );
              if (next !== serverUrlConfig.url) {
                setConfig({ custom: true, url: next });
              }
            }}
          />
        )}
        {serverUrlConfig.custom && !serverUrlConfig.url && (
          <Typography.Text type="danger">
            {intl.formatMessage({
              id: 'clusters.addworker.serverUrl.required'
            })}
          </Typography.Text>
        )}
        {probeMessage && (
          <AlertBlockInfo
            style={{ marginTop: 8 }}
            type={
              loading
                ? 'info'
                : result?.ok
                  ? 'success'
                  : result?.kind === 'redirect'
                    ? 'warning'
                    : 'danger'
            }
            icon={<ExclamationCircleFilled />}
            message={probeMessage}
          />
        )}
      </SwitchCard>
    </div>
  );
};

export default ServerUrlSelect;
