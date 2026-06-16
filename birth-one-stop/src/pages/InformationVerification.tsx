import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Tag,
  Space,
  Row,
  Col,
  Descriptions,
  Table,
  Alert,
  Divider,
  Progress,
  message,
  Tooltip,
  Badge,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
  ReloadOutlined,
  IdcardOutlined,
  FileProtectOutlined,
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  ArrowRightOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { CaseInfo, MaterialItem } from '../types';
import { mockCases, mockMaterials } from '../mock/data';

interface InformationVerificationProps {
  currentCase?: CaseInfo;
  onNext?: (caseInfo: CaseInfo) => void;
  onSupplement?: (caseInfo: CaseInfo) => void;
}

const InformationVerification: React.FC<InformationVerificationProps> = ({ currentCase, onNext, onSupplement }) => {
  const [caseInfo, setCaseInfo] = useState<CaseInfo>(currentCase || mockCases[0]);
  const [verifyingBirth, setVerifyingBirth] = useState(false);
  const [verifyingParent, setVerifyingParent] = useState(false);
  const [verifyingMaterial, setVerifyingMaterial] = useState(false);
  const [verifyingAutoRead, setVerifyingAutoRead] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    birthInfo: boolean | null;
    fatherId: boolean | null;
    motherId: boolean | null;
    materials: boolean | null;
  }>({
    birthInfo: null,
    fatherId: null,
    motherId: null,
    materials: null,
  });

  const handleVerifyBirthInfo = () => {
    setVerifyingBirth(true);
    setTimeout(() => {
      setVerificationResult(prev => ({ ...prev, birthInfo: true }));
      setVerifyingBirth(false);
      message.success('出生医学信息核验通过');
    }, 1500);
  };

  const handleVerifyParentIds = () => {
    setVerifyingParent(true);
    setTimeout(() => {
      const fatherMatch = caseInfo.father.name && caseInfo.father.idNumber.length === 18;
      const motherMatch = caseInfo.mother.name && caseInfo.mother.idNumber.length === 18;
      setVerificationResult(prev => ({ ...prev, fatherId: fatherMatch, motherId: motherMatch }));
      setVerifyingParent(false);
      if (fatherMatch && motherMatch) {
        message.success('父母证件信息核验通过');
      } else {
        message.warning('父母证件信息存在不一致，请核对');
      }
    }, 1500);
  };

  const handleVerifyMaterials = () => {
    setVerifyingMaterial(true);
    setTimeout(() => {
      const allRequiredProvided = caseInfo.materials.filter(m => m.required).every(m => m.status === '已提供');
      setVerificationResult(prev => ({ ...prev, materials: allRequiredProvided }));
      setVerifyingMaterial(false);
      if (allRequiredProvided) {
        message.success('材料核验通过');
      } else {
        message.warning('存在缺失的必选材料');
      }
    }, 1000);
  };

  const handleAutoRead = () => {
    setVerifyingAutoRead(true);
    setTimeout(() => {
      const updatedCase = {
        ...caseInfo,
        birthInfo: {
          childName: '张小明',
          gender: '男' as const,
          birthDate: '2024-06-15',
          birthPlace: '上海市浦东新区',
          hospital: '上海市第一妇婴保健院',
          healthCertificateNo: '310115202400001',
        },
        materials: mockMaterials,
      };
      setCaseInfo(updatedCase);
      setVerificationResult({
        birthInfo: true,
        fatherId: true,
        motherId: true,
        materials: false,
      });
      setVerifyingAutoRead(false);
      message.success('电子证照信息读取成功');
    }, 2000);
  };

  const getMaterialStatusIcon = (status: string) => {
    switch (status) {
      case '已提供':
        return <CheckCircleOutlined className="text-green-500" />;
      case '缺失':
        return <CloseCircleOutlined className="text-red-500" />;
      case '待核验':
        return <ExclamationCircleOutlined className="text-orange-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case '已提供':
        return 'success';
      case '缺失':
        return 'error';
      case '待核验':
        return 'warning';
      default:
        return 'default';
    }
  };

  const completedCount = Object.values(verificationResult).filter(v => v === true).length;
  const totalCount = 4;
  const progress = (completedCount / totalCount) * 100;

  const materialColumns = [
    {
      title: '材料名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: MaterialItem) => (
        <div className="flex items-center gap-2">
          {getMaterialStatusIcon(record.status)}
          <span className={record.status === '缺失' && record.required ? 'text-red-600 font-medium' : ''}>
            {text}
            {record.required && <span className="text-red-500 ml-1">*</span>}
          </span>
        </div>
      ),
    },
    {
      title: '是否必选',
      dataIndex: 'required',
      key: 'required',
      width: 100,
      render: (required: boolean) => (
        <Tag color={required ? 'red' : 'default'}>{required ? '必选' : '可选'}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      render: (text?: string) => text || '-',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <SafetyCertificateOutlined className="text-blue-500" />
          信息核验
        </h2>
        <Space>
          <div className="text-sm text-gray-500">
            办件编号：<span className="font-mono font-medium text-blue-600">{caseInfo.caseNo}</span>
          </div>
          <Button icon={<ReloadOutlined />} onClick={handleAutoRead} loading={verifyingAutoRead}>
            读取电子证照
          </Button>
        </Space>
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-3xl">
              <Progress type="circle" percent={Math.round(progress)} size={70} format={() => `${completedCount}/${totalCount}`} />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-800">核验进度</div>
              <div className="text-sm text-gray-500">已完成 {completedCount} 项核验，共 {totalCount} 项</div>
            </div>
          </div>
          <Space>
            <Button type="primary" onClick={handleVerifyBirthInfo} loading={verifyingBirth}>
              核验出生信息
            </Button>
            <Button onClick={handleVerifyParentIds} loading={verifyingParent}>
              核验父母证件
            </Button>
            <Button onClick={handleVerifyMaterials} loading={verifyingMaterial}>
              核验材料清单
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={16}>
        <Col span={12}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileProtectOutlined className="text-blue-500" />
                  出生医学信息
                </span>
                {verificationResult.birthInfo !== null && (
                  verificationResult.birthInfo 
                    ? <Tag color="success" icon={<CheckCircleOutlined />}>核验通过</Tag>
                    : <Tag color="error" icon={<CloseCircleOutlined />}>核验未通过</Tag>
                )}
              </div>
            }
            className="h-full"
          >
            <Descriptions column={1} size="small">
              <Descriptions.Item label="新生儿姓名">{caseInfo.birthInfo.childName || '-'}</Descriptions.Item>
              <Descriptions.Item label="性别">{caseInfo.birthInfo.gender || '-'}</Descriptions.Item>
              <Descriptions.Item label="出生日期">{caseInfo.birthInfo.birthDate || '-'}</Descriptions.Item>
              <Descriptions.Item label="出生地点">{caseInfo.birthInfo.birthPlace || '-'}</Descriptions.Item>
              <Descriptions.Item label="出生医院">{caseInfo.birthInfo.hospital || '-'}</Descriptions.Item>
              <Descriptions.Item label="出生医学证明编号">
                {caseInfo.birthInfo.healthCertificateNo || '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col span={12}>
          <Card 
            title={
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TeamOutlined className="text-blue-500" />
                  父母证件信息比对
                </span>
                {verificationResult.fatherId !== null && verificationResult.motherId !== null && (
                  verificationResult.fatherId && verificationResult.motherId
                    ? <Tag color="success" icon={<CheckCircleOutlined />}>比对一致</Tag>
                    : <Tag color="warning" icon={<WarningOutlined />}>存在差异</Tag>
                )}
              </div>
            }
            className="h-full"
          >
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserOutlined className="text-blue-500" />
                  <span className="font-medium">父亲信息</span>
                  {verificationResult.fatherId !== null && (
                    verificationResult.fatherId 
                      ? <CheckCircleOutlined className="text-green-500" />
                      : <CloseCircleOutlined className="text-red-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1 pl-6">
                  <div>姓名：{caseInfo.father.name || '-'}</div>
                  <div className="font-mono">证件：{caseInfo.father.idNumber || '-'}</div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="text-gray-400 flex items-center gap-2">
                  <div className="w-16 h-px bg-gray-300"></div>
                  <ArrowRightOutlined className="text-blue-400" />
                  <div className="w-16 h-px bg-gray-300"></div>
                </div>
              </div>

              <div className="p-3 bg-pink-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserOutlined className="text-pink-500" />
                  <span className="font-medium">母亲信息</span>
                  {verificationResult.motherId !== null && (
                    verificationResult.motherId 
                      ? <CheckCircleOutlined className="text-green-500" />
                      : <CloseCircleOutlined className="text-red-500" />
                  )}
                </div>
                <div className="text-sm text-gray-600 space-y-1 pl-6">
                  <div>姓名：{caseInfo.mother.name || '-'}</div>
                  <div className="font-mono">证件：{caseInfo.mother.idNumber || '-'}</div>
                </div>
              </div>

              {verificationResult.fatherId !== null && verificationResult.motherId !== null && (
                <Alert
                  type={verificationResult.fatherId && verificationResult.motherId ? 'success' : 'warning'}
                  showIcon
                  message={
                    verificationResult.fatherId && verificationResult.motherId
                      ? '父母证件信息一致，与出生证明匹配'
                      : '父母证件信息存在不一致，请人工核对'
                  }
                />
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <Card 
        title={
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <IdcardOutlined className="text-blue-500" />
              申请材料清单
            </span>
            {verificationResult.materials !== null && (
              verificationResult.materials
                ? <Tag color="success" icon={<CheckCircleOutlined />}>材料齐全</Tag>
                : <Tag color="error" icon={<CloseCircleOutlined />}>材料缺失</Tag>
            )}
          </div>
        }
      >
        <div className="mb-4">
          <Space>
            <Badge count={caseInfo.materials.filter(m => m.status === '已提供').length} showZero color="#52c41a">
              <Tag color="success">已提供</Tag>
            </Badge>
            <Badge count={caseInfo.materials.filter(m => m.status === '缺失').length} showZero color="#ff4d4f">
              <Tag color="error">缺失</Tag>
            </Badge>
            <Badge count={caseInfo.materials.filter(m => m.status === '待核验').length} showZero color="#faad14">
              <Tag color="warning">待核验</Tag>
            </Badge>
          </Space>
        </div>

        <Table
          columns={materialColumns}
          dataSource={caseInfo.materials}
          rowKey="id"
          pagination={false}
          size="small"
          rowClassName={(record) => record.status === '缺失' && record.required ? 'bg-red-50' : ''}
        />

        {caseInfo.materials.some(m => m.status === '缺失' && m.required) && (
          <Alert
            type="error"
            showIcon
            message="存在必选材料缺失"
            description="请提示办事人补充以下必选材料，或选择补正处置流程。"
            className="mt-4"
          />
        )}
      </Card>

      <div className="flex justify-between items-center pt-4">
        <Button onClick={() => onSupplement?.(caseInfo)}>
          补正处置
        </Button>
        <Space>
          <Button>保存草稿</Button>
          <Button 
            type="primary" 
            onClick={() => {
              const hasMissingRequired = caseInfo.materials.some(m => m.required && m.status === '缺失');
              if (hasMissingRequired) {
                message.error('存在必选材料缺失，请先补正后再进入下一步');
                return;
              }
              onNext?.(caseInfo);
            }}
            disabled={!verificationResult.birthInfo || !verificationResult.fatherId || !verificationResult.motherId}
          >
            下一步：联办编排
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default InformationVerification;
