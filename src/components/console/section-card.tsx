import { createStyles } from 'antd-style';
import React from 'react';

const useStyles = createStyles(({ css }) => ({
  card: css`
    background: var(--console-bg-elevated);
    border: 1px solid var(--console-border);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-card);
    padding: 16px 20px;
    min-width: 0;
    transition: border-color 120ms ease;

    &:hover {
      border-color: color-mix(
        in srgb,
        var(--console-border) 70%,
        var(--console-brand)
      );
    }
  `,
  header: css`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    min-height: 24px;
  `,
  titleBlock: css`
    min-width: 0;
  `,
  title: css`
    font-size: 14px;
    font-weight: 600;
    color: var(--console-text);
    line-height: 22px;
  `,
  description: css`
    margin-top: 2px;
    font-size: 12px;
    color: var(--console-text-tertiary);
    line-height: 18px;
  `,
  actions: css`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  `
}));

const SectionCard: React.FC<{
  title?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
}> = ({ title, description, extra, children, style, bodyStyle }) => {
  const { styles } = useStyles();
  const showHeader = title || extra || description;

  return (
    <section className={styles.card} style={style}>
      {showHeader && (
        <div className={styles.header}>
          <div className={styles.titleBlock}>
            {title && <div className={styles.title}>{title}</div>}
            {description && (
              <div className={styles.description}>{description}</div>
            )}
          </div>
          {extra && <div className={styles.actions}>{extra}</div>}
        </div>
      )}
      <div style={bodyStyle}>{children}</div>
    </section>
  );
};

export default SectionCard;
