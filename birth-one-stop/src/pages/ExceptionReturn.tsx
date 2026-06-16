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
  List,
  Avatar,
  Radio,
  Checkbox,
  Divider,
  Badge,
  Steps,
  Alert,
} from 'antd';
import {
  CloseCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  CheckOutlined,
  ExclamationOutlined,
  SendOutlined,
  RollbackOutlined,
  WarningOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import type { CaseInfo, ReturnReason } from '../types';
import { mockCases, mockReturnReasons } from '../mock/data';

const { Option } = Select;
const { TextArea } = Input;

interface ExceptionReturnProps {
  currentCase?: CaseInfo;
  onComplete?: (caseInfo: CaseInfo) => void;
}

const ExceptionReturn: React.FC<ExceptionReturnProps> = ({ currentCase, onComplete }) => {
  const [cases, setCases] = useState<CaseInfo[]>(mockCases.filter(c => c.status === '受理中' || c.status === '审核中'));
  const [isReturnModalVisible, setIsReturnModalVisible] = useState(false);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseInfo | null>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [returnRemark, setReturnRemark] = useState('');
  const [isSpecialCase, setIsSpecialCase] = useState(false);
  const [reviewReason, setReviewReason] = useState('');
  const [form] = Form.useForm();

  const reasonCategories = [...new Set(mockReturnReasons.map(r => r.category))];

  const handleReturn = (record: CaseInfo) => {
    setSelectedCase(record);
    setSelectedReasons([]);
    setReturnRemark('');
    setIsSpecialCase(false);
    setIsReturnModalVisible(true);
  };

  const handleToggleReason = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleConfirmReturn = () => {
    if (selectedReasons.length === 0) {
      message.warning('请至少选择一个退件原因');
      return;
    }
    if (selectedCase) {
      const updatedCases = cases.map(c =>
        c.caseNo === selectedCase.caseNo
          ? { ...c, status: '已退回' as const, currentNode: '异常退回' }
          : c
      );
      setCases(updatedCases);
      setIsReturnModalVisible(false);
      message.success('退件成功，已通知办事人');
      onComplete?.({ ...selectedCase, status: '已退回' });
    }
  };

  const handleSubmitReview = () => {
    if (!reviewReason) {
      message.warning('请填写复核申请说明');
      return;
    }
    message.success('特殊情形复核申请已提交，请等待审批');
    setIsReviewModalVisible(false);
    setIsReturnModalVisible(false);
  };

  const columns = [
    {
      title: '叫号',
      dataIndex: 'queueNo',
      key: 'queueNo',
      width: 80,
      render: (text: string) => (
        <Tag color="blue" className="font-bold">{text}</Tag>
      ),
    },
    {
      title: '办件编号',
      dataIndex: 'caseNo',
      key: 'caseNo',
      width: 160,
      render: (text: string) => <span className="font-mono text-sm">{text}</span>,
    },
    {
      title: '办事人',
      key: 'applicant',
      render: (_: any, record: CaseInfo) => (
        <div className="flex items-center gap-2">
          <Avatar size={28} icon={<UserOutlined />} className="bg-blue-500" />
          <span>{record.applicant.name}</span>
        </div>
      ),
    },
    {
      title: '联系电话',
      dataIndex: ['applicant', 'phone'],
      key: 'phone',
    },
    {
      title: '当前环节',
      dataIndex: 'currentNode',
      key: 'currentNode',
      render: (text: string) => <Tag color="processing">{text}</Tag>,
    },
    {
      title: '受理时间',
      dataIndex: 'acceptTime',
      key: 'acceptTime',
      render: (time?: string) => time || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: CaseInfo) => (
        <Space>
          <Button size="small" danger icon={<CloseCircleOutlined />} onClick={() => handleReturn(record)}>
            退回
          </Button>
          <Button size="small" icon={<RiseOutlined />} onClick={() => { setSelectedCase(record); setIsReviewModalVisible(true); }}>
            特殊复核
          </Button>
        </Space>
      ),
    },
  ];

  const selectedReasonList = mockReturnReasons.filter(r => selectedReasons.includes(r.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <CloseCircleOutlined className="text-red-500" />
          异常退回
        </h2>
        <Space>
          <div className="text-sm text-gray-500">
            今日退件 <span className="font-bold text-red-600">2</span> 件
          </div>
        </Space>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card className="bg-red-50 border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">累计退件</div>
                <div className="text-3xl font-bold text-red-600 mt-1">23</div>
              </div>
              <ExclamationOutlined className="text-4xl text-red-400" />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-orange-50 border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">待复核</div>
                <div className="text-3xl font-bold text-orange-600 mt-1">3</div>
              </div>
              <WarningOutlined className="text-4xl text-orange-400" />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card className="bg-green-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">退件率</div>
                <div className="text-3xl font-bold text-green-600 mt-1">8.5%</div>
              </div>
              <CheckOutlined className="text-4xl text-green-400" />
            </div>
          </Card>
        </Col>
      </Row>

      <Alert
        message="退件注意事项"
        description={
          <ul className="text-sm space-y-1">
            <li>• 退件前请确认已与办事人充分沟通，说明退件原因</li>
            <li>• 对于特殊情形，可提交复核申请，由后台审批人员处理</li>
            <li>• 退件后需生成书面退件通知书，由办事人签字确认</li>
          </ul>
        }
        type="warning"
        showIcon
      />

      <Card title="在办件列表">
        <Table
          columns={columns}
          dataSource={cases}
          rowKey="caseNo"
          pagination={{ pageSize: 8 }}
          size="small"
        />
      </Card>

      <Card title="高频退件原因 TOP5">
        <Row gutter={[16, 16]}>
          {mockReturnReasons
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((reason, index) => (
              <Col span={12} key={reason.id}>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                    index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : 'bg-blue-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{reason.name}</div>
                    <div className="text-xs text-gray-500">{reason.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-700">{reason.count}</div>
                    <div className="text-xs text-gray-400">次</div>
                  </div>
                </div>
              </Col>
            ))}
        </Row>
      </Card>

      <Modal
        title="退件处理"
        open={isReturnModalVisible}
        onCancel={() => setIsReturnModalVisible(false)}
        width={700}
        footer={null}
      >
        {selectedCase && (
          <div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{selectedCase.queueNo}</span>
                  <span className="mx-2">-</span>
                  <span>{selectedCase.applicant.name}</span>
                </div>
                <Tag color="processing">{selectedCase.currentNode}</Tag>
              </div>
            </div>

            <Divider orientation="left" plain>退件原因</Divider>

            <div className="space-y-4">
              {reasonCategories.map(category => (
                <div key={category}>
                  <div className="text-sm font-medium text-gray-600 mb-2">{category}</div>
                  <div className="flex flex-wrap gap-2">
                    {mockReturnReasons
                      .filter(r => r.category === category)
                      .map(reason => (
                        <Tag
                          key={reason.id}
                          color={selectedReasons.includes(reason.id) ? 'red' : 'default'}
                          className="cursor-pointer px-3 py-1"
                          onClick={() => handleToggleReason(reason.id)}
                        >
                          {selectedReasons.includes(reason.id) ? <CheckOutlined /> : null}
                          {reason.name}
                        </Tag>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <Divider orientation="left" plain>已选退件原因</Divider>

            {selectedReasonList.length > 0 ? (
              <List
                size="small"
                dataSource={selectedReasonList}
                renderItem={item => (
                  <List.Item
                    actions={[
                      <Button
                        type="text"
                        size="small"
                        danger
                        icon={<CloseCircleOutlined />}
                        onClick={() => handleToggleReason(item.id)}
                      />
                    ]}
                  >
                    <List.Item.Meta title={item.name} description={item.category} />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center text-gray-400 py-4 text-sm">
                请选择退件原因
              </div>
            )}

            <Divider orientation="left" plain>退件说明</Divider>

            <TextArea
              rows={3}
              placeholder="请详细说明退件原因和注意事项..."
              value={returnRemark}
              onChange={e => setReturnRemark(e.target.value)}
            />

            <div className="mt-4">
              <Checkbox checked={isSpecialCase} onChange={e => setIsSpecialCase(e.target.checked)}>
                <span className="text-orange-600">特殊情形，需提交复核</span>
              </Checkbox>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button onClick={() => setIsReturnModalVisible(false)}>取消</Button>
              {isSpecialCase ? (
                <Button type="primary" icon={<RiseOutlined />} onClick={handleSubmitReview}>
                  提交复核申请
                </Button>
              ) : (
                <Button danger icon={<RollbackOutlined />} onClick={handleConfirmReturn}>
                  确认退件
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="特殊情形复核申请"
        open={isReviewModalVisible}
        onCancel={() => setIsReviewModalVisible(false)}
        width={550}
        footer={[
          <Button key="cancel" onClick={() => setIsReviewModalVisible(false)}>取消</Button>,
          <Button key="submit" type="primary" icon={<SendOutlined />} onClick={handleSubmitReview}>
            提交申请
          </Button>,
        ]}
      >
        {selectedCase && (
          <div className="space-y-4">
            <Alert
              type="info"
              showIcon
              message="特殊情形复核说明"
              description="对于特殊情形的办件，可提交后台审批人员复核，复核通过后可继续办理"
            />

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">申请办件</div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{selectedCase.queueNo}</span>
                <span className="mx-2">-</span>
                <span>{selectedCase.applicant.name}</span>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">特殊情形类型</div>
              <Select style={{ width: '100%' }} placeholder="请选择特殊情形类型">
                <Option value="policy">政策适用特殊情形</Option>
                <Option value="material">材料容缺受理</Option>
                <Option value="urgent">紧急特殊办理</Option>
                <Option value="other">其他特殊情形</Option>
              </Select>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">申请说明</div>
              <TextArea
                rows={4}
                placeholder="请详细说明特殊情形及申请理由..."
                value={reviewReason}
                onChange={e => setReviewReason(e.target.value)}
              />
            </div>

            <div className="text-xs text-gray-500">
              注：复核申请提交后，将由后台审批人员在1个工作日内处理
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExceptionReturn;
