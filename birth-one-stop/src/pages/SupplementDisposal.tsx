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
} from 'antd';
import {
  ExclamationCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  PhoneOutlined,
  CheckOutlined,
  CloseOutlined,
  SendOutlined,
  PrinterOutlined,
  MessageOutlined,
  WarningOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { CaseInfo, SupplementOpinion } from '../types';
import { mockCases, mockSupplementOpinions } from '../mock/data';

const { Option } = Select;
const { TextArea } = Input;

interface SupplementDisposalProps {
  currentCase?: CaseInfo;
  onComplete?: (caseInfo: CaseInfo) => void;
}

const SupplementDisposal: React.FC<SupplementDisposalProps> = ({ currentCase, onComplete }) => {
  const [cases, setCases] = useState<CaseInfo[]>(mockCases.filter(c => c.status === '补正'));
  const [selectedCase, setSelectedCase] = useState<CaseInfo | null>(currentCase || null);
  const [isNoticeModalVisible, setIsNoticeModalVisible] = useState(false);
  const [selectedOpinions, setSelectedOpinions] = useState<string[]>([]);
  const [customOpinion, setCustomOpinion] = useState('');
  const [form] = Form.useForm();

  const opinionCategories = [...new Set(mockSupplementOpinions.map(o => o.category))];

  const handleSelectCase = (record: CaseInfo) => {
    setSelectedCase(record);
  };

  const handleToggleOpinion = (opinionId: string) => {
    setSelectedOpinions(prev => 
      prev.includes(opinionId) 
        ? prev.filter(id => id !== opinionId)
        : [...prev, opinionId]
    );
  };

  const handleAddOpinion = (opinion: SupplementOpinion) => {
    if (!selectedOpinions.includes(opinion.id)) {
      setSelectedOpinions([...selectedOpinions, opinion.id]);
      message.success('已添加补正意见');
    }
  };

  const handleGenerateNotice = () => {
    if (selectedOpinions.length === 0 && !customOpinion) {
      message.warning('请至少选择或输入一条补正意见');
      return;
    }
    setIsNoticeModalVisible(true);
  };

  const handleConfirmSupplement = () => {
    if (selectedOpinions.length === 0 && !customOpinion) {
      message.warning('请至少选择或输入一条补正意见');
      return;
    }
    if (selectedCase) {
      const updatedCases = cases.map(c => 
        c.caseNo === selectedCase.caseNo
          ? { ...c, status: '补正', currentNode: '补正处置' }
          : c
      );
      setCases(updatedCases);
      message.success('补正通知已发送');
      setIsNoticeModalVisible(false);
      onComplete?.(selectedCase);
    }
  };

  const columns = [
    {
      title: '叫号',
      dataIndex: 'queueNo',
      key: 'queueNo',
      width: 80,
      render: (text: string) => (
        <Tag color="orange" className="font-bold">{text}</Tag>
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
          <Avatar size={28} icon={<UserOutlined />} className="bg-orange-500" />
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
      title: '缺失材料数',
      key: 'missingCount',
      render: (_: any, record: CaseInfo) => {
        const missingCount = record.materials.filter(m => m.status === '缺失').length;
        return (
          <Badge count={missingCount} size="small" color="#ff4d4f">
            <Tag color="red">缺失</Tag>
          </Badge>
        );
      },
    },
    {
      title: '补正期限',
      key: 'deadline',
      render: () => <span className="text-orange-600">5个工作日内</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: CaseInfo) => (
        <Space>
          <Button size="small" type="primary" onClick={() => handleSelectCase(record)}>
            处理
          </Button>
          <Button size="small">详情</Button>
        </Space>
      ),
    },
  ];

  const selectedOpinionList = mockSupplementOpinions.filter(o => selectedOpinions.includes(o.id));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <ExclamationCircleOutlined className="text-orange-500" />
          补正处置
        </h2>
        <div className="text-sm text-gray-500">
          待补正 <span className="font-bold text-orange-600">{cases.length}</span> 件
        </div>
      </div>

      <Row gutter={16}>
        <Col span={selectedCase ? 14 : 24}>
          <Card title="待补正列表">
            <Table
              columns={columns}
              dataSource={cases}
              rowKey="caseNo"
              pagination={{ pageSize: 6 }}
              size="small"
              onRow={(record) => ({
                onClick: () => handleSelectCase(record),
                style: { cursor: 'pointer' }
              })}
              rowClassName={(record) => 
                selectedCase?.caseNo === record.caseNo ? 'bg-blue-50' : ''
              }
            />
          </Card>
        </Col>

        {selectedCase && (
          <Col span={10}>
            <Card 
              title="补正意见配置"
              extra={<Button size="small" onClick={() => setSelectedCase(null)}>关闭</Button>}
            >
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  当前办件：{selectedCase.queueNo} - {selectedCase.applicant.name}
                </div>
                <div className="text-xs text-gray-500">
                  缺失材料：{selectedCase.materials.filter(m => m.status === '缺失').length} 项
                </div>
              </div>

              <Divider orientation="left" plain>标准话术库</Divider>

              <div className="space-y-3">
                {opinionCategories.map(category => (
                  <div key={category}>
                    <div className="text-sm font-medium text-gray-600 mb-2">{category}</div>
                    <div className="flex flex-wrap gap-2">
                      {mockSupplementOpinions
                        .filter(o => o.category === category)
                        .map(opinion => (
                          <Tag
                            key={opinion.id}
                            color={selectedOpinions.includes(opinion.id) ? 'blue' : 'default'}
                            className="cursor-pointer px-3 py-1"
                            onClick={() => handleToggleOpinion(opinion.id)}
                          >
                            {selectedOpinions.includes(opinion.id) ? <CheckOutlined /> : <PlusOutlined />}
                            {opinion.content.slice(0, 15)}...
                          </Tag>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              <Divider orientation="left" plain>已选补正意见</Divider>

              {selectedOpinionList.length > 0 ? (
                <List
                  size="small"
                  dataSource={selectedOpinionList}
                  renderItem={item => (
                    <List.Item
                      actions={[
                        <Button 
                          type="text" 
                          size="small" 
                          danger
                          icon={<CloseOutlined />}
                          onClick={() => handleToggleOpinion(item.id)}
                        />
                      ]}
                    >
                      <List.Item.Meta description={item.content} />
                    </List.Item>
                  )}
                />
              ) : (
                <div className="text-center text-gray-400 py-4 text-sm">
                  暂未选择补正意见
                </div>
              )}

              <Divider orientation="left" plain>自定义补正意见</Divider>

              <TextArea
                rows={3}
                placeholder="请输入自定义补正意见..."
                value={customOpinion}
                onChange={e => setCustomOpinion(e.target.value)}
              />

              <div className="mt-4 flex justify-end gap-2">
                <Button icon={<PrinterOutlined />} onClick={handleGenerateNotice}>
                  生成补正通知
                </Button>
                <Button type="primary" icon={<SendOutlined />} onClick={handleConfirmSupplement}>
                  发送补正通知
                </Button>
              </div>
            </Card>
          </Col>
        )}
      </Row>

      <Modal
        title="补正通知书"
        open={isNoticeModalVisible}
        onCancel={() => setIsNoticeModalVisible(false)}
        width={650}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>打印通知书</Button>,
          <Button key="send" type="primary" icon={<SendOutlined />} onClick={handleConfirmSupplement}>
            确认发送
          </Button>,
        ]}
      >
        {selectedCase && (
          <div className="bg-white p-6 border rounded-lg">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">补正材料通知书</h3>
              <div className="text-sm text-gray-500 mt-2">编号：{selectedCase.caseNo}-BZ</div>
            </div>

            <Divider />

            <div className="space-y-4 text-sm">
              <p>
                <span className="font-medium">{selectedCase.applicant.name}：</span>
              </p>
              <p className="pl-4">
                您于 {selectedCase.acceptTime} 申请办理的出生一件事联办业务，经审查，申请材料不齐全，需补充以下材料：
              </p>

              <div className="pl-6">
                <ol className="list-decimal space-y-2">
                  {selectedOpinionList.map((opinion, index) => (
                    <li key={opinion.id} className="text-gray-700">{opinion.content}</li>
                  ))}
                  {customOpinion && (
                    <li className="text-gray-700">{customOpinion}</li>
                  )}
                </ol>
              </div>

              <p className="pl-4">
                请您在 <span className="text-red-600 font-medium">5个工作日内</span> 将补正材料提交至受理窗口。
                逾期未补正的，将视为自动放弃申请。
              </p>

              <div className="pt-4">
                <p className="text-gray-600">咨询电话：12345</p>
                <p className="text-gray-600">工作时间：周一至周五 9:00-17:00</p>
              </div>
            </div>

            <div className="mt-8 text-right text-sm text-gray-500">
              <div>受理窗口：综合窗口</div>
              <div>通知时间：{new Date().toLocaleString()}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default SupplementDisposal;
