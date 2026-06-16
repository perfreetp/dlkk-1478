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
  message,
  Row,
  Col,
  Descriptions,
  Avatar,
  Steps,
  Timeline,
  Divider,
  List,
  Badge,
  Tooltip,
  Radio,
  Upload,
} from 'antd';
import {
  FolderOpenOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PrinterOutlined,
  EyeOutlined,
  FileDoneOutlined,
  InboxOutlined,
  FileSearchOutlined,
  PaperClipOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { CaseInfo, FlowNode } from '../types';
import { mockCases } from '../mock/data';
import dayjs from 'dayjs';

const { Option } = Select;
const { Dragger } = Upload;

interface CompletionArchiveProps {
  currentCase?: CaseInfo;
}

const CompletionArchive: React.FC<CompletionArchiveProps> = ({ currentCase }) => {
  const [cases, setCases] = useState<CaseInfo[]>(mockCases.filter(c => c.status === '已办结' || c.status === '审核中'));
  const [selectedCase, setSelectedCase] = useState<CaseInfo | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isArchiveModalVisible, setIsArchiveModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleViewDetail = (record: CaseInfo) => {
    setSelectedCase(record);
    setIsDetailModalVisible(true);
  };

  const handleArchive = (record: CaseInfo) => {
    setSelectedCase(record);
    setIsArchiveModalVisible(true);
  };

  const handleConfirmArchive = () => {
    if (selectedCase) {
      const updatedCases = cases.map(c =>
        c.caseNo === selectedCase.caseNo
          ? { ...c, status: '已办结' as const, currentNode: '办结归档' }
          : c
      );
      setCases(updatedCases);
      setIsArchiveModalVisible(false);
      message.success('归档成功');
    }
  };

  const statusColors: Record<string, string> = {
    '审核中': 'processing',
    '已办结': 'success',
    '已退回': 'error',
  };

  const filteredCases = cases.filter(item => {
    const matchSearch = 
      item.caseNo.includes(searchText) ||
      item.applicant.name.includes(searchText) ||
      item.queueNo.includes(searchText);
    const matchStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      title: '叫号',
      dataIndex: 'queueNo',
      key: 'queueNo',
      width: 70,
      render: (text: string) => (
        <Tag color="green" className="font-bold">{text}</Tag>
      ),
    },
    {
      title: '办件编号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 150,
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: '办事人',
      key: 'applicant',
      render: (_: any, record: CaseInfo) => (
        <div className="flex items-center gap-2">
          <Avatar size={28} icon={<UserOutlined />} className="bg-green-500" />
          <span>{record.applicant.name}</span>
        </div>
      ),
    },
    {
      title: '新生儿',
      key: 'child',
      render: (_: any, record: CaseInfo) => (
        <span>{record.birthInfo.childName || '-'}</span>
      ),
    },
    {
      title: '联办事项',
      key: 'services',
      render: (_: any, record: CaseInfo) => (
        <div className="flex flex-wrap gap-1">
          {record.services.slice(0, 2).map(s => (
            <Tag key={s.id} color="green" size="small">{s.name}</Tag>
          ))}
          {record.services.length > 2 && (
            <Tag color="default" size="small">+{record.services.length - 2}</Tag>
          )}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>{status}</Tag>
      ),
    },
    {
      title: '办结时间',
      key: 'completeTime',
      width: 160,
      render: (_: any, record: CaseInfo) => {
        const completeNode = record.flowHistory.find(n => n.nodeName === '办结归档');
        return completeNode?.time || '-';
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: CaseInfo) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          {record.status === '审核中' && (
            <Button size="small" type="primary" icon={<FolderOpenOutlined />} onClick={() => handleArchive(record)}>
              归档
            </Button>
          )}
          <Button size="small" icon={<PrinterOutlined />}>打印</Button>
        </Space>
      ),
    },
  ];

  const getStepStatus = (status: string) => {
    switch (status) {
      case '已完成':
        return 'finish';
      case '进行中':
        return 'process';
      case '未开始':
        return 'wait';
      default:
        return 'wait';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <FolderOpenOutlined className="text-green-500" />
          办结归档
        </h2>
        <div className="text-sm text-gray-500">
          今日办结 <span className="font-bold text-green-600">7</span> 件
        </div>
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">累计办结</div>
                <div className="text-3xl font-bold text-green-600 mt-1">156</div>
              </div>
              <FileDoneOutlined className="text-4xl text-green-400" />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">待归档</div>
                <div className="text-3xl font-bold text-blue-600 mt-1">8</div>
              </div>
              <InboxOutlined className="text-4xl text-blue-400" />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">已归档</div>
                <div className="text-3xl font-bold text-purple-600 mt-1">148</div>
              </div>
              <FolderOpenOutlined className="text-4xl text-purple-400" />
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">平均办理时长</div>
                <div className="text-3xl font-bold text-orange-600 mt-1">
                  17<span className="text-lg">分钟</span>
                </div>
              </div>
              <ClockCircleOutlined className="text-4xl text-orange-400" />
            </div>
          </Card>
        </Col>
      </Row>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <Space size="middle">
            <Input
              placeholder="搜索姓名/编号"
              prefix={<FileSearchOutlined />}
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
              <Option value="审核中">待归档</Option>
              <Option value="已办结">已办结</Option>
            </Select>
          </Space>
          <div className="text-sm text-gray-500">
            共 <span className="font-bold text-green-600">{filteredCases.length}</span> 条记录
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredCases}
          rowKey="caseNo"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="办件详情"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        width={900}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>打印凭证</Button>,
          <Button key="close" onClick={() => setIsDetailModalVisible(false)}>关闭</Button>,
        ]}
      >
        {selectedCase && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold">{selectedCase.queueNo}</span>
                <span className="mx-2 text-gray-400">|</span>
                <span className="text-gray-600">{selectedCase.caseNo}</span>
              </div>
              <Tag color={statusColors[selectedCase.status]} className="text-sm px-3 py-1">
                {selectedCase.status}
              </Tag>
            </div>

            <Card title="办件流向" size="small">
              <Steps
                current={selectedCase.flowHistory.filter(n => n.status === '已完成').length}
                size="small"
                items={selectedCase.flowHistory.map(node => ({
                  title: node.nodeName,
                  status: getStepStatus(node.status),
                  description: node.time ? dayjs(node.time).format('MM-DD HH:mm') : '',
                }))}
              />
            </Card>

            <Row gutter={16}>
              <Col span={12}>
                <Card title="申请人信息" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="姓名">{selectedCase.applicant.name}</Descriptions.Item>
                    <Descriptions.Item label="联系电话">{selectedCase.applicant.phone}</Descriptions.Item>
                    <Descriptions.Item label="身份证号">{selectedCase.applicant.idNumber}</Descriptions.Item>
                    <Descriptions.Item label="联系地址">{selectedCase.applicant.address}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              <Col span={12}>
                <Card title="新生儿信息" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="姓名">{selectedCase.birthInfo.childName}</Descriptions.Item>
                    <Descriptions.Item label="性别">{selectedCase.birthInfo.gender}</Descriptions.Item>
                    <Descriptions.Item label="出生日期">{selectedCase.birthInfo.birthDate}</Descriptions.Item>
                    <Descriptions.Item label="出生医院">{selectedCase.birthInfo.hospital}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>

            <Card title="联办事项" size="small">
              <List
                size="small"
                dataSource={selectedCase.services.filter(s => s.selected)}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<CheckCircleOutlined className="text-green-500 text-lg" />}
                      title={item.name}
                      description={item.department}
                    />
                    <Tag color="green">已完成</Tag>
                  </List.Item>
                )}
              />
            </Card>

            <Card title="办理时间线" size="small">
              <Timeline
                items={selectedCase.flowHistory
                  .filter(n => n.status === '已完成')
                  .map(node => ({
                    color: 'green',
                    children: (
                      <div>
                        <div className="font-medium">{node.nodeName}</div>
                        <div className="text-sm text-gray-500">
                          操作人：{node.operator} | {node.time}
                        </div>
                        {node.remark && (
                          <div className="text-sm text-gray-600 mt-1">备注：{node.remark}</div>
                        )}
                      </div>
                    ),
                  }))}
              />
            </Card>

            <Card title="办理结果" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-700 mb-2 flex items-center gap-2">
                      <FileTextOutlined />
                      纸质结果
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>• 出生医学证明 1 份</p>
                      <p>• 户口薄 1 本</p>
                      <p>• 医保参保证明 1 份</p>
                    </div>
                    <div className="mt-2 text-xs text-green-600">
                      状态：已发放
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
                      <PaperClipOutlined />
                      电子结果
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>• 电子出生证 1 份</p>
                      <p>• 电子户口页 1 份</p>
                      <p>• 电子医保凭证 1 份</p>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      状态：已生成并推送
                    </div>
                  </div>
                </Col>
              </Row>
            </Card>
          </div>
        )}
      </Modal>

      <Modal
        title="归档确认"
        open={isArchiveModalVisible}
        onCancel={() => setIsArchiveModalVisible(false)}
        width={600}
        footer={[
          <Button key="cancel" onClick={() => setIsArchiveModalVisible(false)}>取消</Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmArchive}>确认归档</Button>,
        ]}
      >
        {selectedCase && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="font-medium mb-2">
                {selectedCase.queueNo} - {selectedCase.applicant.name}
              </div>
              <div className="text-sm text-gray-500">{selectedCase.caseNo}</div>
            </div>

            <Divider plain>归档材料清单</Divider>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">纸质材料</span>
                <Tag color="green">已核对</Tag>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">电子材料</span>
                <Tag color="green">已上传</Tag>
              </div>
              <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                <span className="text-sm">审批记录</span>
                <Tag color="green">完整</Tag>
              </div>
            </div>

            <Divider plain>结果双登记</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <div className="text-sm">
                  <div className="font-medium mb-2">纸质结果登记</div>
                  <Radio.Group defaultValue="delivered">
                    <Radio value="delivered">已发放</Radio>
                    <Radio value="mailing">邮寄中</Radio>
                  </Radio.Group>
                </div>
              </Col>
              <Col span={12}>
                <div className="text-sm">
                  <div className="font-medium mb-2">电子结果登记</div>
                  <Radio.Group defaultValue="pushed">
                    <Radio value="pushed">已推送</Radio>
                    <Radio value="generating">生成中</Radio>
                  </Radio.Group>
                </div>
              </Col>
            </Row>

            <Divider plain>归档凭证上传</Divider>

            <Dragger
              name="file"
              multiple
              beforeUpload={() => false}
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此处上传归档凭证</p>
              <p className="ant-upload-hint">支持扫描件、照片等格式</p>
            </Dragger>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CompletionArchive;
