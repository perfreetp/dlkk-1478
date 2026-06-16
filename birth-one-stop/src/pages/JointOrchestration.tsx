import React, { useState } from 'react';
import {
  Card,
  Checkbox,
  Button,
  Tag,
  Space,
  Row,
  Col,
  List,
  Modal,
  message,
  Divider,
  Steps,
  Collapse,
  Badge,
  Tooltip,
  Alert,
} from 'antd';
import {
  EditOutlined,
  FileTextOutlined,
  CheckSquareOutlined,
  FileSearchOutlined,
  PrinterOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  FileDoneOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import type { CaseInfo, ServiceItem, ScenarioItem } from '../types';
import { mockCases, mockServices, mockScenarios } from '../mock/data';

const { Step } = Steps;
const { Panel } = Collapse;

interface JointOrchestrationProps {
  currentCase?: CaseInfo;
  onNext?: (caseInfo: CaseInfo) => void;
  onBack?: () => void;
}

const JointOrchestration: React.FC<JointOrchestrationProps> = ({ currentCase, onNext, onBack }) => {
  const [caseInfo, setCaseInfo] = useState<CaseInfo>(currentCase || mockCases[0]);
  const [services, setServices] = useState<ServiceItem[]>(
    caseInfo.services.length > 0 ? caseInfo.services : mockServices
  );
  const [selectedScenario, setSelectedScenario] = useState<string>('');
  const [noticeModalVisible, setNoticeModalVisible] = useState(false);

  const departmentColors: Record<string, string> = {
    '卫生健康': '#52c41a',
    '公安': '#1890ff',
    '医保': '#faad14',
    '人社': '#722ed1',
  };

  const handleScenarioSelect = (scenario: ScenarioItem) => {
    setSelectedScenario(scenario.id);
    const updatedServices = services.map(s => ({
      ...s,
      selected: scenario.relatedServices.includes(s.id) || s.required,
    }));
    setServices(updatedServices);
    message.success(`已选择场景：${scenario.name}`);
  };

  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = services.map(s => 
      s.id === serviceId ? { ...s, selected: !s.selected } : s
    );
    setServices(updatedServices);
  };

  const handleGenerateNotice = () => {
    setNoticeModalVisible(true);
  };

  const handleConfirm = () => {
    const selectedCount = services.filter(s => s.selected).length;
    if (selectedCount === 0) {
      message.error('请至少选择一个联办事项');
      return;
    }
    const updatedCase = { ...caseInfo, services };
    setCaseInfo(updatedCase);
    message.success('联办编排已确认');
    onNext?.(updatedCase);
  };

  const selectedCount = services.filter(s => s.selected).length;
  const requiredCount = services.filter(s => s.required).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <EditOutlined className="text-blue-500" />
          联办编排
        </h2>
        <div className="text-sm text-gray-500">
          办件编号：<span className="font-mono font-medium text-blue-600">{caseInfo.caseNo}</span>
        </div>
      </div>

      <Alert
        message="办理流程概览"
        description="出生一件事联办包含多个部门事项，可根据实际情况选择办理"
        type="info"
        showIcon
      />

      <Card title={<span className="flex items-center gap-2"><FileSearchOutlined className="text-blue-500" />常见情形选择</span>}>
        <div className="text-sm text-gray-500 mb-4">
          选择常见情形可自动配置相关联办事项，提高受理效率
        </div>
        <Row gutter={[16, 16]}>
          {mockScenarios.map(scenario => (
            <Col span={8} key={scenario.id}>
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => handleScenarioSelect(scenario)}
              >
                <div className="flex items-start justify-between">
                  <div className="font-medium text-gray-800">{scenario.name}</div>
                  {selectedScenario === scenario.id && (
                    <CheckSquareOutlined className="text-blue-500 text-lg" />
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">{scenario.description}</div>
                <div className="mt-3">
                  <Tag color="blue" size="small">{scenario.relatedServices.length} 个事项</Tag>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card 
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <SafetyCertificateOutlined className="text-blue-500" />
              联办事项配置
            </span>
            <Space>
              <Tag color="green">已选 {selectedCount} 项</Tag>
              <Tag color="red">必选 {requiredCount} 项</Tag>
            </Space>
          </div>
        }
      >
        <Row gutter={[16, 16]}>
          {services.map(service => (
            <Col span={12} key={service.id}>
              <div
                className={`p-4 border rounded-lg transition-all ${
                  service.selected
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={service.selected}
                    disabled={service.required}
                    onChange={() => handleServiceToggle(service.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{service.name}</span>
                      {service.required && (
                        <Tooltip title="必办事项">
                          <Tag color="red" size="small">必选</Tag>
                        </Tooltip>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                    <div className="mt-2">
                      <Tag color={departmentColors[service.department]} size="small">
                        {service.department}
                      </Tag>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title={<span className="flex items-center gap-2"><FileDoneOutlined className="text-blue-500" />办理流程示意</span>}>
        <Steps current={selectedCount > 0 ? 1 : 0} size="small">
          <Step title="叫号接件" status="finish" />
          <Step title="信息核验" status="finish" />
          <Step title="联办编排" status="process" />
          <Step title="材料提交" status="wait" />
          <Step title="部门审核" status="wait" />
          <Step title="结果发放" status="wait" />
          <Step title="办结归档" status="wait" />
        </Steps>

        <Collapse className="mt-4" ghost>
          <Panel header="涉及部门及办理时限" key="1">
            <List
              size="small"
              dataSource={services.filter(s => s.selected)}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Tag color={departmentColors[item.department]}>{item.department}</Tag>}
                    title={item.name}
                    description="承诺时限：5个工作日"
                  />
                </List.Item>
              )}
            />
          </Panel>
          <Panel header="收费标准" key="2">
            <List
              size="small"
              dataSource={[
                { name: '出生医学证明', fee: '免费' },
                { name: '出生登记（户口申报）', fee: '免费' },
                { name: '城乡居民医保参保', fee: '按当年标准' },
                { name: '社会保障卡', fee: '免费' },
              ]}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta title={item.name} />
                  <div>{item.fee}</div>
                </List.Item>
              )}
            />
          </Panel>
        </Collapse>
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button onClick={onBack}>上一步：信息核验</Button>
        <Space>
          <Button icon={<PrinterOutlined />} onClick={handleGenerateNotice}>
            生成一次告知单
          </Button>
          <Button type="primary" onClick={handleConfirm}>
            确认并提交审核
          </Button>
        </Space>
      </div>

      <Modal
        title="一次告知单"
        open={noticeModalVisible}
        onCancel={() => setNoticeModalVisible(false)}
        width={700}
        footer={[
          <Button key="print" icon={<PrinterOutlined />}>打印告知单</Button>,
          <Button key="close" type="primary" onClick={() => setNoticeModalVisible(false)}>
            关闭
          </Button>,
        ]}
      >
        <div className="bg-white p-6 border rounded-lg">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-800">出生一件事联办一次告知单</h3>
            <div className="text-sm text-gray-500 mt-2">编号：{caseInfo.caseNo}</div>
          </div>

          <Divider />

          <div className="space-y-4">
            <div>
              <div className="font-medium text-gray-700 mb-2">一、办事人信息</div>
              <div className="text-sm text-gray-600 pl-4 space-y-1">
                <div>申请人：{caseInfo.applicant.name}</div>
                <div>联系电话：{caseInfo.applicant.phone}</div>
                <div>新生儿姓名：{caseInfo.birthInfo.childName}</div>
              </div>
            </div>

            <div>
              <div className="font-medium text-gray-700 mb-2">二、申请办理事项</div>
              <List
                size="small"
                dataSource={services.filter(s => s.selected)}
                renderItem={(item, index) => (
                  <List.Item>
                    <span>{index + 1}. {item.name}</span>
                    <Tag color={departmentColors[item.department]} size="small">
                      {item.department}
                    </Tag>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <div className="font-medium text-gray-700 mb-2">三、所需材料清单</div>
              <List
                size="small"
                dataSource={caseInfo.materials.filter(m => m.required)}
                renderItem={(item, index) => (
                  <List.Item>
                    <span>{index + 1}. {item.name}</span>
                    <Tag color={item.status === '已提供' ? 'green' : 'red'} size="small">
                      {item.status}
                    </Tag>
                  </List.Item>
                )}
              />
            </div>

            <div>
              <div className="font-medium text-gray-700 mb-2">四、办理时限</div>
              <div className="text-sm text-gray-600 pl-4">
                承诺办结时限：15个工作日
              </div>
            </div>

            <div>
              <div className="font-medium text-gray-700 mb-2">五、温馨提示</div>
              <div className="text-sm text-gray-600 pl-4">
                <p>1. 请确保所提供的材料真实有效</p>
                <p>2. 办理结果将通过短信通知，请保持电话畅通</p>
                <p>3. 如有疑问，请拨打咨询电话：12345</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-right text-sm text-gray-500">
            <div>受理窗口：综合窗口</div>
            <div>受理时间：{caseInfo.acceptTime || '2024-06-17 09:30:00'}</div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default JointOrchestration;
