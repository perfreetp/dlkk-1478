import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Radio,
  InputNumber,
  message,
  Row,
  Col,
  Statistic,
  Avatar,
  Tooltip,
  Divider,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  UserOutlined,
  PhoneOutlined,
  IdcardOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';
import type { CaseInfo } from '../types';
import { mockCases, queueTypes, applicantTypes } from '../mock/data';
import dayjs from 'dayjs';

const { Option } = Select;

interface QueueReceptionProps {
  onCaseSelect?: (caseInfo: CaseInfo) => void;
  onStartVerify?: (caseInfo: CaseInfo) => void;
}

const QueueReception: React.FC<QueueReceptionProps> = ({ onCaseSelect, onStartVerify }) => {
  const [cases, setCases] = useState<CaseInfo[]>(mockCases);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [queueTypeFilter, setQueueTypeFilter] = useState<string>('all');
  const [form] = Form.useForm();

  const statusColors: Record<string, string> = {
    '待受理': 'default',
    '受理中': 'processing',
    '补正': 'warning',
    '审核中': 'processing',
    '已办结': 'success',
    '已退回': 'error',
  };

  const filteredCases = cases.filter(item => {
    const matchSearch = 
      item.caseNo.includes(searchText) ||
      item.applicant.name.includes(searchText) ||
      item.applicant.phone.includes(searchText) ||
      item.queueNo.includes(searchText);
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchQueueType = queueTypeFilter === 'all' || item.queueNo.startsWith(queueTypeFilter);
    return matchSearch && matchStatus && matchQueueType;
  });

  const handleCreateCase = (values: any) => {
    const newCase: CaseInfo = {
      caseNo: `CS${dayjs().format('YYYYMMDD')}${String(cases.length + 1).padStart(4, '0')}`,
      queueNo: `${values.queueType}${String(cases.length + 1).padStart(3, '0')}`,
      status: '待受理',
      applicant: {
        id: `a${Date.now()}`,
        name: values.applicantName,
        idType: values.idType || '居民身份证',
        idNumber: values.idNumber || '',
        phone: values.phone || '',
        address: values.address || '',
      },
      birthInfo: {
        childName: '',
        gender: '男',
        birthDate: '',
        birthPlace: '',
        hospital: '',
        healthCertificateNo: '',
      },
      father: {
        relation: '父亲',
        name: values.fatherName || '',
        idType: '居民身份证',
        idNumber: values.fatherId || '',
        phone: '',
        address: '',
      },
      mother: {
        relation: '母亲',
        name: values.motherName || '',
        idType: '居民身份证',
        idNumber: values.motherId || '',
        phone: '',
        address: '',
      },
      materials: [],
      services: [],
      createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      currentNode: '叫号接件',
      flowHistory: [
        { nodeName: '叫号接件', status: '进行中', operator: '', time: dayjs().format('YYYY-MM-DD HH:mm:ss') },
        { nodeName: '信息核验', status: '未开始', operator: '', time: '' },
        { nodeName: '联办编排', status: '未开始', operator: '', time: '' },
        { nodeName: '审核发证', status: '未开始', operator: '', time: '' },
        { nodeName: '办结归档', status: '未开始', operator: '', time: '' },
      ],
    };
    setCases([newCase, ...cases]);
    setIsModalVisible(false);
    form.resetFields();
    message.success('建单成功，已加入叫号队列');
  };

  const handleStartProcess = (record: CaseInfo) => {
    const updatedCases = cases.map(item => 
      item.caseNo === record.caseNo 
        ? { ...item, status: '受理中', acceptTime: dayjs().format('YYYY-MM-DD HH:mm:ss') }
        : item
    );
    setCases(updatedCases);
    message.success(`已开始受理 ${record.queueNo} 号`);
    if (onStartVerify) {
      onStartVerify({ ...record, status: '受理中', acceptTime: dayjs().format('YYYY-MM-DD HH:mm:ss') });
    }
  };

  const columns = [
    {
      title: '叫号',
      dataIndex: 'queueNo',
      key: 'queueNo',
      width: 80,
      render: (text: string) => {
        const type = text.charAt(0);
        const typeInfo = queueTypes.find(q => q.value === type);
        return (
          <Tag color={typeInfo?.color} className="font-bold text-base px-3 py-1">
            {text}
          </Tag>
        );
      },
    },
    {
      title: '办件编号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 160,
      render: (text: string) => <span className="font-mono text-gray-600">{text}</span>,
    },
    {
      title: '办事人信息',
      key: 'applicant',
      width: 250,
      render: (_: any, record: CaseInfo) => (
        <div className="flex items-center gap-3">
          <Avatar size={40} icon={<UserOutlined />} className="bg-blue-500" />
          <div>
            <div className="font-medium">{record.applicant.name}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <PhoneOutlined />
              {record.applicant.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '办事人类型',
      key: 'applicantType',
      width: 100,
      render: () => <Tag color="blue">母亲</Tag>,
    },
    {
      title: '联办事项',
      key: 'services',
      render: (_: any, record: CaseInfo) => (
        <div className="flex flex-wrap gap-1">
          {record.services.slice(0, 3).map(s => (
            <Tag key={s.id} color="green" size="small">{s.name}</Tag>
          ))}
          {record.services.length > 3 && (
            <Tag color="default" size="small">+{record.services.length - 3}</Tag>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: '取号时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (time: string) => (
        <div className="text-sm">
          <div>{dayjs(time).format('HH:mm:ss')}</div>
          <div className="text-gray-400 text-xs">{dayjs(time).format('YYYY-MM-DD')}</div>
        </div>
      ),
    },
    {
      title: '等待时长',
      key: 'waitTime',
      width: 100,
      render: (_: any, record: CaseInfo) => {
        const diff = dayjs().diff(dayjs(record.createTime), 'minute');
        const hours = Math.floor(diff / 60);
        const mins = diff % 60;
        return (
          <div className={`font-medium ${diff > 30 ? 'text-red-500' : diff > 15 ? 'text-orange-500' : 'text-gray-600'}`}>
            {hours > 0 ? `${hours}小时` : ''}{mins}分钟
          </div>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right' as const,
      render: (_: any, record: CaseInfo) => (
        <Space>
          {record.status === '待受理' && (
            <Button type="primary" size="small" icon={<PlayCircleOutlined />} onClick={() => handleStartProcess(record)}>
              开始受理
            </Button>
          )}
          {record.status === '受理中' && (
            <Button size="small" onClick={() => onCaseSelect?.(record)}>
              继续办理
            </Button>
          )}
          <Button size="small" type="link">详情</Button>
        </Space>
      ),
    },
  ];

  const statsData = [
    { label: '今日叫号', value: 15, icon: <FileTextOutlined />, color: '#1890ff' },
    { label: '等待中', value: 5, icon: <ClockCircleOutlined />, color: '#faad14' },
    { label: '办理中', value: 3, icon: <PlayCircleOutlined />, color: '#1890ff' },
    { label: '已完成', value: 7, icon: <CheckCircleOutlined />, color: '#52c41a' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileTextOutlined className="text-blue-500" />
          叫号接件
        </h2>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          快速建单
        </Button>
      </div>

      <Row gutter={16}>
        {statsData.map((stat, index) => (
          <Col span={6} key={index}>
            <Card className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <Statistic title={stat.label} value={stat.value} />
                <div className="text-3xl" style={{ color: stat.color }}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <Space size="middle">
            <Input
              placeholder="搜索姓名/手机号/编号"
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 280 }}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Select
              defaultValue="all"
              style={{ width: 140 }}
              onChange={setStatusFilter}
            >
              <Option value="all">全部状态</Option>
              <Option value="待受理">待受理</Option>
              <Option value="受理中">受理中</Option>
              <Option value="补正">补正</Option>
              <Option value="已办结">已办结</Option>
              <Option value="已退回">已退回</Option>
            </Select>
            <Select
              defaultValue="all"
              style={{ width: 160 }}
              onChange={setQueueTypeFilter}
            >
              <Option value="all">全部号别</Option>
              {queueTypes.map(type => (
                <Option key={type.value} value={type.value}>{type.label}</Option>
              ))}
            </Select>
          </Space>
          <div className="text-sm text-gray-500">
            共 <span className="font-bold text-blue-600">{filteredCases.length}</span> 条记录
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCases}
          rowKey="caseNo"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: () => onCaseSelect?.(record),
            style: { cursor: 'pointer' }
          })}
        />
      </Card>

      <Modal
        title="快速建单"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={650}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateCase}
        >
          <div className="mb-4">
            <div className="text-sm font-medium text-gray-700 mb-3">办事人类型</div>
            <Form.Item name="applicantType" initialValue="mother">
              <Radio.Group size="large">
                {applicantTypes.map(type => (
                  <Radio.Button key={type.value} value={type.value}>{type.label}</Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
          </div>

          <Divider orientation="left">基本信息</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="applicantName"
                label="办事人姓名"
                rules={[{ required: true, message: '请输入办事人姓名' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="请输入姓名" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
                <Input prefix={<PhoneOutlined />} placeholder="请输入手机号" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={16}>
              <Form.Item name="idNumber" label="身份证号">
                <Input prefix={<IdcardOutlined />} placeholder="请输入身份证号码" size="large" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="queueType" label="号别" initialValue="A">
                <Select size="large">
                  {queueTypes.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">父母信息（选填，可后续补充）</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="fatherName" label="父亲姓名">
                <Input placeholder="请输入父亲姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="fatherId" label="父亲身份证号">
                <Input placeholder="请输入父亲身份证号" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="motherName" label="母亲姓名">
                <Input placeholder="请输入母亲姓名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="motherId" label="母亲身份证号">
                <Input placeholder="请输入母亲身份证号" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-3 pt-4">
            <Button size="large" onClick={() => setIsModalVisible(false)}>取消</Button>
            <Button type="primary" size="large" htmlType="submit" icon={<PlusOutlined />}>
              确认建单
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default QueueReception;
