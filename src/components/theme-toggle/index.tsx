import useUserSettings from '@/hooks/use-user-settings';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  wrapper: css`
    display: inline-flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
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

    .anticon {
      font-size: 16px;
    }
  `
}));

const ThemeToggle: React.FC = () => {
  const { setTheme, userSettings } = useUserSettings();
  const { styles } = useStyles();

  const handleChangeTheme = () => {
    const currentTheme =
      userSettings.theme === 'realDark' ? 'light' : 'realDark';
    setTheme(currentTheme);
  };

  return (
    <div className={styles.wrapper} onClick={handleChangeTheme}>
      {userSettings.theme === 'realDark' ? <MoonOutlined /> : <SunOutlined />}
    </div>
  );
};

export default ThemeToggle;
