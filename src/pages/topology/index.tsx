import { request, useIntl } from '@umijs/max';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Edge,
  type Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card, Descriptions, Drawer, Empty, Select, Space, Tag } from 'antd';
import dagre from 'dagre';
import React from 'react';
import PageBox from '../_components/page-box';

const KIND_COLOR: Record<string, string> = {
  cluster: '#1677ff',
  worker: '#52c41a',
  gpu: '#722ed1',
  instance: '#fa8c16'
};

const NODE_W = 200;
const NODE_H = 64;

const layoutGraph = (
  nodes: Node[],
  edges: Edge[]
): { nodes: Node[]; edges: Edge[] } => {
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({ rankdir: 'TB', nodesep: 48, ranksep: 80 });
  nodes.forEach((node) =>
    graph.setNode(node.id, { width: NODE_W, height: NODE_H })
  );
  edges.forEach((edge) => graph.setEdge(edge.source, edge.target));
  dagre.layout(graph);
  return {
    nodes: nodes.map((node) => {
      const pos = graph.node(node.id);
      return {
        ...node,
        position: {
          x: (pos?.x || 0) - NODE_W / 2,
          y: (pos?.y || 0) - NODE_H / 2
        }
      };
    }),
    edges
  };
};

const Topology: React.FC = () => {
  const intl = useIntl();
  const [graph, setGraph] = React.useState<{ nodes: any[]; edges: any[] }>({
    nodes: [],
    edges: []
  });
  const [clusterId, setClusterId] = React.useState<number | undefined>();
  const [selected, setSelected] = React.useState<any>(null);

  const load = async (id?: number) => {
    const data = await request('/topology', {
      params: id ? { cluster_id: id } : {}
    });
    setGraph({ nodes: data.nodes || [], edges: data.edges || [] });
  };

  React.useEffect(() => {
    load(clusterId).catch(() => undefined);
  }, [clusterId]);

  const clusters = graph.nodes.filter((n) => n.kind === 'cluster');

  const flow = React.useMemo(() => {
    const nodes: Node[] = graph.nodes.map((n) => ({
      id: String(n.id),
      data: {
        raw: n,
        label: (
          <Space size={4}>
            <Tag color={KIND_COLOR[n.kind] || 'default'}>{n.kind}</Tag>
            <span>{n.label}</span>
            {n.status ? <Tag>{n.status}</Tag> : null}
          </Space>
        )
      },
      position: { x: 0, y: 0 },
      style: {
        width: NODE_W,
        border: `1px solid ${KIND_COLOR[n.kind] || '#d9d9d9'}`,
        borderRadius: 8,
        padding: 8
      }
    }));
    const edges: Edge[] =
      graph.edges.length > 0
        ? graph.edges.map((e, i) => ({
            id: e.id || `e-${i}`,
            source: String(e.source || e.from),
            target: String(e.target || e.to)
          }))
        : graph.nodes
            .filter((n) => n.parent_id)
            .map((n) => ({
              id: `${n.parent_id}-${n.id}`,
              source: String(n.parent_id),
              target: String(n.id)
            }));
    return layoutGraph(nodes, edges);
  }, [graph]);

  return (
    <PageBox>
      <Space style={{ margin: '24px 0 16px' }}>
        <Select
          allowClear
          style={{ width: 260 }}
          placeholder={intl.formatMessage({ id: 'topology.filter.cluster' })}
          value={clusterId}
          onChange={(v) => setClusterId(v)}
          options={clusters.map((c) => ({
            label: c.label,
            value: c.extra?.id ?? Number(String(c.id).split(':').pop())
          }))}
        />
      </Space>
      <Card styles={{ body: { height: 640, padding: 0 } }}>
        {graph.nodes.length ? (
          <ReactFlow
            nodes={flow.nodes}
            edges={flow.edges}
            fitView
            onNodeClick={(_event, node) =>
              setSelected((node.data as any)?.raw || null)
            }
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        ) : (
          <Empty
            style={{ paddingTop: 120 }}
            description={intl.formatMessage({ id: 'topology.empty' })}
          />
        )}
      </Card>
      <Drawer
        open={!!selected}
        width={400}
        onClose={() => setSelected(null)}
        title={selected?.label || intl.formatMessage({ id: 'topology.detail' })}
      >
        {selected ? (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item
              label={intl.formatMessage({ id: 'topology.kind' })}
            >
              {selected.kind}
            </Descriptions.Item>
            <Descriptions.Item
              label={intl.formatMessage({ id: 'topology.status' })}
            >
              {selected.status || '—'}
            </Descriptions.Item>
            {Object.entries(selected.extra || {}).map(([key, value]) => (
              <Descriptions.Item key={key} label={key}>
                {String(value)}
              </Descriptions.Item>
            ))}
          </Descriptions>
        ) : null}
      </Drawer>
    </PageBox>
  );
};

export default Topology;
