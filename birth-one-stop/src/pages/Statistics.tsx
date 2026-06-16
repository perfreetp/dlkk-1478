import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  DatePicker,
  Select,
  Space,
  Tag,
  List,
  Progress,
  Table,
  Divider,
  Tooltip,
} from 'antd';
import {
  BarChartOutlined,
  RiseOutlined,
  FallOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined,
  WarningOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { mockDailyStats, mockReturnReasons, mockServices } from '../mock/data';
import type { DailyStats, ReturnReason } from '../types';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Statistics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [dailyStats] = useState<DailyStats[]>(mockDailyStats);
  const [returnReasons] = useState<ReturnReason[]>(mockReturnReasons);

  const totalStats = {
    total: dailyStats.reduce((sum, d) => sum + d.totalCount, 0),
    completed: dailyStats.reduce((sum, d) => sum + d.completedCount, 0),
    supplement: dailyStats.reduce((sum, d) => sum + d.supplementCount, 0),
    returned: dailyStats.reduce((sum, d) => sum + d.returnCount, 0),
    avgDuration: Math.round(dailyStats.reduce((sum, d) => sum + d.avgDuration, 0) / dailyStats.length),
  };

  const completionRate = totalStats.total > 0 
    ? Math.round((totalStats.completed / totalStats.total) * 100) 
    : 0;

  const PIE_COLORS = ['#52c41a', '#faad14', '#ff4d4f', '#1890ff', '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16'];

  const pieData = returnReasons.map(r => ({
    name: r.name,
    value: r.count,
  }));

  const sortedReasons = [...returnReasons].sort((a, b) => b.count - a.count);

  const serviceStats = [
    { name: '出生医学证明', count: 187, rate: 100 },
    { name: '出生登记', count: 182, rate: 97.3 },
    { name: '医保参保登记', count: 165, rate: 88.2 },
    { name: '预防接种证', count: 158, rate: 84.5 },
    { name: '社会保障卡', count: 95, rate: 50.8 },
    { name: '生育保险待遇', count: 42, rate: 22.5 },
  ];

  const hourData = [
    { hour: '09:00', count: 12 },
    { hour: '10:00', count: 18 },
    { hour: '11:00', count: 15 },
    { hour: '12:00', count: 5 },
    { hour: '13:00', count: 8 },
    { hour: '14:00', count: 20 },
    { hour: '15:00', count: 22 },
    { hour: '16:00', count: 16 },
    { hour: '17:00', count: 10 },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BarChartOutlined className="text-blue-500" />
          统计分析
        </h2>
        <Space>
          <Select defaultValue="week" style={{ width: 120 }} onChange={setTimeRange}>
            <Option value="today">今日</Option>
            <Option value="week">近7天</Option>
            <Option value="month">近30天</Option>
            <Option value="quarter">本季度</Option>
          </Select>
          <RangePicker
            defaultValue={[dayjs().subtract(7, 'day'), dayjs()]}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <Statistic
                title="总办件量"
                value={totalStats.total}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
              <div className="text-green-500 text-sm flex items-center">
                <RiseOutlined />
                <span className="ml-1">12.5%</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <Statistic
                title="已办结"
                value={totalStats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
              <div className="text-green-500 text-sm flex items-center">
                <RiseOutlined />
                <span className="ml-1">8.3%</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <Statistic
                title="补正件"
                value={totalStats.supplement}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
              <div className="text-red-500 text-sm flex items-center">
                <FallOutlined />
                <span className="ml-1">5.2%</span>
              </div>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <Statistic
                title="退回件"
                value={totalStats.returned}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
              <div className="text-green-500 text-sm flex items-center">
                <FallOutlined />
                <span className="ml-1">3.1%</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card title="日办件趋势" extra={<Tag color="blue">近7天</Tag>}>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Bar dataKey="totalCount" name="总办件" fill="#1890ff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completedCount" name="已办结" fill="#52c41a" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="supplementCount" name="补正" fill="#faad14" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="returnCount" name="退回" fill="#ff4d4f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="办结率">
            <div className="text-center py-6">
              <Progress
                type="dashboard"
                percent={completionRate}
                size={180}
                strokeColor={{
                  '0%': '#52c41a',
                  '100%': '#1890ff',
                }}
              />
              <div className="mt-4 text-gray-500 text-sm">
                办结率 <span className="text-xl font-bold text-green-600">{completionRate}%</span>
              </div>
            </div>
            <Divider plain />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">平均办理时长</span>
                <span className="font-bold text-blue-600">{totalStats.avgDuration} 分钟</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">一次性通过率</span>
                <span className="font-bold text-green-600">86.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">群众满意度</span>
                <span className="font-bold text-orange-600">98.2%</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card title="高频退件原因 TOP10" extra={<Tag color="red">按次数排序</Tag>}>
            <div className="space-y-3">
              {sortedReasons.map((reason, index) => (
                <div key={reason.id} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index < 3 ? 'bg-red-500' : 'bg-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{reason.name}</span>
                      <span className="text-sm font-bold text-gray-600">{reason.count} 次</span>
                    </div>
                    <Progress 
                      percent={Math.round((reason.count / sortedReasons[0].count) * 100)} 
                      showInfo={false}
                      size="small"
                      strokeColor={index < 3 ? '#ff4d4f' : '#bfbfbf'}
                    />
                  </div>
                  <Tag color="default" size="small">{reason.category}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="退件原因分布">
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={14}>
          <Card title="联办事项办理统计">
            <Table
              size="small"
              dataSource={serviceStats}
              rowKey="name"
              pagination={false}
              columns={[
                {
                  title: '事项名称',
                  dataIndex: 'name',
                  key: 'name',
                  width: 180,
                },
                {
                  title: '办理量',
                  dataIndex: 'count',
                  key: 'count',
                  width: 100,
                  render: (text: number) => (
                    <span className="font-bold">{text}</span>
                  ),
                },
                {
                  title: '办理占比',
                  dataIndex: 'rate',
                  key: 'rate',
                  render: (rate: number) => (
                    <div className="flex items-center gap-2">
                      <Progress 
                        percent={rate} 
                        size="small" 
                        style={{ width: 150 }}
                        strokeColor="#1890ff"
                      />
                      <span className="text-sm text-gray-500 w-14 text-right">{rate}%</span>
                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
        <Col span={10}>
          <Card title="办件时段分布">
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line type="monotone" dataKey="count" stroke="#1890ff" strokeWidth={2} dot={{ fill: '#1890ff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card title="窗口效率榜" size="small">
            <List
              size="small"
              dataSource={[
                { name: '王窗口', count: 45, avg: 15 },
                { name: '李窗口', count: 42, avg: 16 },
                { name: '张窗口', count: 38, avg: 18 },
                { name: '赵窗口', count: 35, avg: 19 },
                { name: '钱窗口', count: 32, avg: 20 },
              ]}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                      }`}>
                        {index + 1}
                      </div>
                    }
                    title={item.name}
                    description={`办理 ${item.count} 件 · 平均 ${item.avg} 分钟`}
                  />
                  <TrophyOutlined className={index < 3 ? 'text-yellow-500' : 'text-gray-300'} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="常见情形分布" size="small">
            <List
              size="small"
              dataSource={[
                { name: '婚内生育（一孩）', count: 68, percent: 45 },
                { name: '婚内生育（二孩）', count: 45, percent: 30 },
                { name: '婚内生育（三孩）', count: 20, percent: 13 },
                { name: '非婚生育', count: 12, percent: 8 },
                { name: '其他', count: 6, percent: 4 },
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={<Progress percent={item.percent} size="small" showInfo={false} />}
                  />
                  <span className="font-bold">{item.count}件</span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="办事人类型" size="small">
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-pink-500" />
                  <span>母亲办理</span>
                </div>
                <span className="font-bold">65%</span>
              </div>
              <Progress percent={65} showInfo={false} strokeColor="#eb2f96" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-blue-500" />
                  <span>父亲办理</span>
                </div>
                <span className="font-bold">28%</span>
              </div>
              <Progress percent={28} showInfo={false} strokeColor="#1890ff" />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TeamOutlined className="text-green-500" />
                  <span>委托办理</span>
                </div>
                <span className="font-bold">7%</span>
              </div>
              <Progress percent={7} showInfo={false} strokeColor="#52c41a" />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Statistics;
