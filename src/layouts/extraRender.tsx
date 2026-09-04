import { GPUStackVersionAtom, UpdateCheckAtom } from '@/atoms/user';
import PluginExtraField from '@/components/plugin-extra-fields';
import ThemeToggle from '@/components/theme-toggle';
import VersionInfo, { modalConfig } from '@/components/version-info';
import HotKeys from '@/config/hotkeys';
import externalLinks from '@/constants/external-links';
import { getBranding } from '@/enterprise/branding/runtime';
import { logout } from '@/pages/login/apis';
import { getGPUStackPlugin } from '@/plugins';
import { platformCall } from '@/utils';
import { useModel } from '@@/plugin-model';
import {
  DiscordOutlined,
  InfoCircleOutlined,
  ReadOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { DropdownActions, IconFont, useBodyScroll } from '@gpustack/core-ui';
import { history, useIntl, useNavigate } from '@umijs/max';
import { Avatar, Divider, Modal } from 'antd';
import { useAtom } from 'jotai';
import { useMemo, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import styled from 'styled-components';
import { DEFAULT_ENTER_PAGE } from '../config/settings';
import CommandPalette from './command-palette';

const NewLabel = styled.span`
  position: relative;
  top: -1px;
  right: 0;
  padding: 1px 5px;
  display: inline-flex;
  color: #fff;
  height: 16px;
  justify-content: center;
  align-items: center;
  background-color: var(--ant-orange-5);
  border-radius: 6px;
  font-size: 10px;
  line-height: 1;
`;

const IconWrapper = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--console-text-secondary);
  transition:
    background-color 120ms ease,
    color 120ms ease;

  &:hover {
    background: var(--console-bg-hover);
    color: var(--console-text);
  }
`;

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
`;

const SearchTrigger = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  min-width: 260px;
  padding: 0 10px 0 12px;
  border: 1px solid var(--console-border);
  border-radius: 6px;
  background: var(--console-bg-page);
  color: var(--console-text-tertiary);
  cursor: pointer;
  font-size: 13px;
  transition:
    border-color 120ms ease,
    background-color 120ms ease;

  &:hover {
    border-color: color-mix(
      in srgb,
      var(--console-border) 60%,
      var(--console-brand)
    );
    color: var(--console-text-secondary);
  }

  kbd {
    margin-left: auto;
    font-size: 11px;
    padding: 1px 6px;
    border-radius: 5px;
    border: 1px solid var(--console-border);
    background: var(--console-bg-elevated);
    color: var(--console-text-tertiary);
    font-family: inherit;
  }
`;

const DropdownWrapper = styled.div`
  min-width: 180px;
  box-shadow: var(--ant-box-shadow-secondary);
  background-color: var(--ant-color-bg-elevated);
  border-radius: var(--ant-border-radius-lg);
  padding: var(--ant-padding-xs);
  .ant-dropdown-menu {
    padding: 0;
    box-shadow: none;
    background-color: transparent;
    border-radius: 0;
    a {
      color: var(--ant-color-text);
    }
  }
`;

const CustomItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  justify-content: flex-start;
  padding: 0 var(--ant-padding-xs);
  cursor: pointer;
  border-radius: 6px;
  &.user-info {
    cursor: default;
    justify-content: space-between;
    .user-name {
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      max-width: 100px;
    }
  }
  &:not(.user-info):hover {
    background-color: var(--ant-control-item-bg-hover);
  }
  background-color: var(--ant-color-bg-elevated);
`;

export const ExtraContent = (props: { isDarkTheme?: boolean }) => {
  const { isDarkTheme } = props;
  const plugin = getGPUStackPlugin();
  const { saveScrollHeight, restoreScrollHeight } = useBodyScroll();
  const [modal, contextHolder] = Modal.useModal();
  const [version] = useAtom(GPUStackVersionAtom);
  const [updateCheck] = useAtom(UpdateCheckAtom);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const intl = useIntl();
  const initialInfo = useModel('@@initialState') || {
    initialState: undefined,
    loading: false,
    setInitialState: null
  };

  const { initialState } = initialInfo;
  const navigate = useNavigate();
  const loginPath = DEFAULT_ENTER_PAGE.login;

  useHotkeys(
    HotKeys.SEARCH,
    (e) => {
      e.preventDefault();
      setPaletteOpen(true);
    },
    { enableOnFormTags: false }
  );

  const showUpgrade = useMemo(() => {
    return (
      initialState?.currentUser?.is_admin &&
      updateCheck.latest_version &&
      updateCheck.latest_version !== version?.version &&
      version?.isProd
    );
  }, [
    updateCheck.latest_version,
    version.version,
    version.isProd,
    initialState?.currentUser?.is_admin
  ]);

  const avatarStyle = useMemo(() => {
    if (isDarkTheme) {
      return {
        color: 'var(--ant-color-text)',
        border: 'none'
      };
    }
    return {};
  }, [isDarkTheme]);

  const showVersion = () => {
    saveScrollHeight();
    modal.info({
      ...modalConfig,
      width: 460,
      content: <VersionInfo intl={intl} />,
      onCancel: restoreScrollHeight
    });
  };

  const handleLogout = async () => {
    await logout();
    navigate(loginPath);
  };

  const helpList = [
    {
      key: 'faq',
      icon: <IconFont type="icon-fankuifaqs"></IconFont>,
      label: intl.formatMessage({ id: 'common.button.faq' }),
      url: externalLinks.faq
    },
    {
      key: 'Discord',
      icon: <DiscordOutlined />,
      label: 'Discord',
      url: externalLinks.discord
    },
    {
      key: 'docs',
      icon: <ReadOutlined />,
      label: intl.formatMessage({ id: 'common.button.docs' }),
      url: getBranding().doc_url || externalLinks.documentation
    }
  ];

  const helpMenu = {
    items: helpList.map((item) => ({
      key: item.key,
      label: (
        <a
          className="flex flex-center gap-8"
          href={item.url}
          target="_blank"
          rel="noreferrer"
        >
          {item.icon}
          {item.label}
        </a>
      )
    }))
  };

  const userMenu = {
    items: [
      {
        key: 'settings',
        label: (
          <span className="flex flex-center">
            <IconFont type="icon-preferences" />
            <span className="m-l-8" style={{ marginLeft: 8 }}>
              {intl?.formatMessage?.({ id: 'menu.settings.profile' })}
            </span>
          </span>
        ),
        onClick: () => {
          history.push('/settings/profile');
        }
      },
      {
        key: 'version',
        label: (
          <span className="flex flex-center">
            <InfoCircleOutlined />
            <span className="m-l-8" style={{ marginLeft: 8 }}>
              {intl?.formatMessage?.({ id: 'common.button.version' })}
              {version?.version ? ` ${version.version}` : ''}
            </span>
            {showUpgrade && (
              <NewLabel style={{ marginLeft: 8 }}>
                {intl.formatMessage({ id: 'common.text.new' })}
              </NewLabel>
            )}
          </span>
        ),
        onClick: showVersion
      }
    ]
  };

  const userPopupRender = (originNode: React.ReactNode) => {
    return (
      <DropdownWrapper>
        <CustomItem className="user-info border-bottom">
          <span className="flex-center gap-8">
            <Avatar
              size={24}
              style={{ ...avatarStyle }}
              src={initialState?.currentUser?.avatar_url}
              icon={
                <IconFont type="icon-user-filled" className="font-size-24" />
              }
            />
            <span className="user-name">
              {initialState?.currentUser?.username}
            </span>
          </span>
        </CustomItem>
        <Divider style={{ marginBlock: 4 }} />
        {originNode}
        <Divider style={{ marginBlock: 4 }} />
        <CustomItem onClick={handleLogout} className="border-top">
          <IconFont type="icon-logout" style={{ fontSize: 17 }} />
          <span>{intl?.formatMessage?.({ id: 'common.button.logout' })}</span>
        </CustomItem>
      </DropdownWrapper>
    );
  };

  const helpPopupRender = (originNode: React.ReactNode) => {
    return <DropdownWrapper>{originNode}</DropdownWrapper>;
  };

  return (
    <Wrapper>
      {contextHolder}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
      />
      <PluginExtraField name="OrgSwitcher" isDarkTheme={isDarkTheme} />
      <SearchTrigger type="button" onClick={() => setPaletteOpen(true)}>
        <SearchOutlined />
        <span>{intl.formatMessage({ id: 'common.command.placeholder' })}</span>
        <kbd>{platformCall().isMac ? '⌘ K' : 'Ctrl K'}</kbd>
      </SearchTrigger>
      {!plugin && (
        <DropdownActions menu={{ ...helpMenu }} popupRender={helpPopupRender}>
          <IconWrapper>
            <IconFont type="icon-help" className="font-size-18" />
          </IconWrapper>
        </DropdownActions>
      )}
      <ThemeToggle />
      <PluginExtraField name="GlobalSettings" />
      <DropdownActions menu={{ ...userMenu }} popupRender={userPopupRender}>
        <IconWrapper
          style={{
            width: 'auto',
            gap: 8,
            padding: '2px 8px 2px 2px',
            borderRadius: 999,
            background: 'var(--console-bg-muted)'
          }}
        >
          <Avatar
            size={24}
            style={{ ...avatarStyle }}
            src={initialState?.currentUser?.avatar_url}
            icon={<IconFont type="icon-user-filled" className="font-size-20" />}
          />
          <span
            style={{
              maxWidth: 88,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--console-text)'
            }}
          >
            {initialState?.currentUser?.username}
          </span>
        </IconWrapper>
      </DropdownActions>
    </Wrapper>
  );
};
