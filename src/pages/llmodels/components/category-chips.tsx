import { useIntl } from '@umijs/max';
import { createStyles } from 'antd-style';
import { categoryOptions } from '../config';

const useStyles = createStyles(({ css }) => ({
  row: css`
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  `,
  chip: css`
    height: 32px;
    padding: 0 12px;
    border: 1px solid var(--border-default);
    border-radius: 6px;
    background: var(--bg-card);
    color: var(--text-primary);
    font-size: 13px;
    line-height: 30px;
    cursor: pointer;
    user-select: none;
    transition:
      background-color 120ms ease,
      border-color 120ms ease,
      color 120ms ease;

    &:hover {
      background: var(--bg-hover);
    }

    &.active {
      background: var(--primary-soft);
      border-color: var(--primary);
      color: var(--primary-hover);
      font-weight: 500;
    }
  `
}));

const CategoryChips: React.FC<{
  value?: string | string[] | null;
  onChange: (value: string) => void;
}> = ({ value, onChange }) => {
  const intl = useIntl();
  const { styles, cx } = useStyles();
  const current = Array.isArray(value) ? value[0] || '' : value || '';

  const options = [
    { label: intl.formatMessage({ id: 'models.filter.all' }), value: '' },
    ...categoryOptions
  ];

  return (
    <div className={styles.row}>
      {options.map((item) => (
        <button
          key={item.value || 'all'}
          type="button"
          className={cx(styles.chip, current === item.value && 'active')}
          onClick={() => onChange(item.value || '')}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default CategoryChips;
