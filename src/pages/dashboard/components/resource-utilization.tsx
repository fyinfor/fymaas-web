import { LineChart } from '@gpustack/core-ui/charts';
import { useIntl } from '@umijs/max';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useMemo } from 'react';
import { filterHistoryByHours } from '../utils/format';

const TypeKeyMap = {
  cpu: {
    label: 'CPU',
    type: 'CPU',
    intl: false,
    color: '#F59E0B'
  },
  ram: {
    label: 'dashboard.memory',
    type: 'Memory',
    intl: true,
    color: '#249EC2'
  },
  gpu: {
    label: 'GPU',
    type: 'GPU',
    intl: false,
    color: '#18A875'
  },
  vram: {
    label: 'dashboard.vram',
    type: 'VRAM',
    intl: true,
    color: '#7567B8'
  }
};

const UtilizationOvertime: React.FC<{
  hours?: number;
  data: {
    cpu: {
      timestamp: number;
      value: number;
    }[];
    ram: {
      timestamp: number;
      value: number;
    }[];
    gpu: {
      timestamp: number;
      value: number;
    }[];
    vram: {
      timestamp: number;
      value: number;
    }[];
  };
}> = ({ data, hours = 24 }) => {
  const intl = useIntl();
  const typeList = ['gpu', 'vram', 'cpu', 'ram'];

  const tooltipValueFormatter = (value: any) => {
    return !value && value !== 0 ? value : `${value}%`;
  };

  const generateData = useMemo(() => {
    const legendData: string[] = [];
    const xAxisData: string[] = [];
    const seriesData = _.map(typeList, (label: string) => {
      const itemConfig = _.get(TypeKeyMap, label, {} as any);
      const name = itemConfig.intl
        ? intl.formatMessage({ id: itemConfig.label })
        : itemConfig.label;
      legendData.push(name);
      const itemDataList = filterHistoryByHours(_.get(data, label, []), hours);
      return {
        name,
        color: itemConfig.color,
        data: _.map(itemDataList, (item: any) => {
          const time = dayjs(item.timestamp * 1000).format(
            hours >= 24 ? 'MM-DD HH:mm' : 'HH:mm:ss'
          );
          xAxisData.push(time);
          return {
            time: item,
            value: _.round(_.get(item, 'value', 0), 1)
          };
        })
      };
    });
    return {
      seriesData,
      legendData,
      xAxisData: _.uniq(xAxisData)
    };
  }, [data, hours, intl]);

  return (
    <LineChart
      height={280}
      seriesData={generateData.seriesData}
      legendData={generateData.legendData}
      xAxisData={generateData.xAxisData}
      tooltipValueFormatter={tooltipValueFormatter}
      smooth={true}
      width="100%"
      yAxisName="(%)"
    />
  );
};

export default UtilizationOvertime;
