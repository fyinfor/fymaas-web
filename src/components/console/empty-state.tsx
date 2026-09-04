import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  wrap: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 200px;
    padding: 32px 24px;
    text-align: center;
  `,
  icon: css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    margin-bottom: 4px;
    border-radius: 10px;
    background: var(--console-bg-muted);
    color: var(--console-text-tertiary);
    font-size: 18px;
  `,
  title: css`
    font-size: 14px;
    font-weight: 600;
    color: var(--console-text);
    line-height: 22px;
  `,
  description: css`
    max-width: 360px;
    font-size: 13px;
    line-height: 20px;
    color: var(--console-text-tertiary);
  `,
  action: css`
    margin-top: 8px;
  `
}));

const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ icon, title, description, action, style }) => {
  const { styles } = useStyles();
  return (
    <div className={styles.wrap} style={style}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.title}>{title}</div>
      {description && <div className={styles.description}>{description}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
};

export default EmptyState;
