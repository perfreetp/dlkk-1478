import { useState } from 'react';
import { ConfigProvider, App as AntdApp, message } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from './components/Layout/MainLayout';
import QueueReception from './pages/QueueReception';
import InformationVerification from './pages/InformationVerification';
import JointOrchestration from './pages/JointOrchestration';
import SupplementDisposal from './pages/SupplementDisposal';
import ExceptionReturn from './pages/ExceptionReturn';
import CompletionArchive from './pages/CompletionArchive';
import Statistics from './pages/Statistics';
import type { CaseInfo } from './types';
import './App.css';

function App() {
  const [currentModule, setCurrentModule] = useState('queue');
  const [currentCase, setCurrentCase] = useState<CaseInfo | undefined>(undefined);

  const handleModuleChange = (key: string) => {
    setCurrentModule(key);
    setCurrentCase(undefined);
  };

  const handleCaseSelect = (caseInfo: CaseInfo) => {
    setCurrentCase(caseInfo);
    if (caseInfo.status === '待受理' || caseInfo.status === '受理中') {
      setCurrentModule('verify');
    }
  };

  const handleStartVerify = (caseInfo: CaseInfo) => {
    setCurrentCase(caseInfo);
    setCurrentModule('verify');
  };

  const handleVerifyNext = (caseInfo: CaseInfo) => {
    setCurrentCase(caseInfo);
    setCurrentModule('orchestrate');
  };

  const handleOrchestrateNext = (caseInfo: CaseInfo) => {
    const updatedCase: CaseInfo = {
      ...caseInfo,
      status: '审核中',
      currentNode: '部门审核',
      flowHistory: caseInfo.flowHistory.map(node => {
        if (node.nodeName === '联办编排') return { ...node, status: '已完成' as const, operator: '王窗口', time: new Date().toLocaleString() };
        if (node.nodeName === '审核发证') return { ...node, status: '进行中' as const };
        return node;
      }),
    };
    setCurrentCase(updatedCase);
    setCurrentModule('archive');
    message.success('已提交审核，办件进入审核状态');
  };

  const handleBackToVerify = () => {
    setCurrentModule('verify');
  };

  const handleSupplement = (caseInfo: CaseInfo) => {
    setCurrentCase(caseInfo);
    setCurrentModule('supplement');
  };

  const renderContent = () => {
    switch (currentModule) {
      case 'queue':
        return (
          <QueueReception
            currentCase={currentCase}
            onCaseSelect={handleCaseSelect}
            onStartVerify={handleStartVerify}
          />
        );
      case 'verify':
        return (
          <InformationVerification
            currentCase={currentCase}
            onNext={handleVerifyNext}
            onSupplement={handleSupplement}
          />
        );
      case 'orchestrate':
        return (
          <JointOrchestration
            currentCase={currentCase}
            onNext={handleOrchestrateNext}
            onBack={handleBackToVerify}
          />
        );
      case 'supplement':
        return <SupplementDisposal currentCase={currentCase} />;
      case 'return':
        return <ExceptionReturn currentCase={currentCase} />;
      case 'archive':
        return <CompletionArchive currentCase={currentCase} />;
      case 'stats':
        return <Statistics />;
      default:
        return <QueueReception onCaseSelect={handleCaseSelect} />;
    }
  };

  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: '#1d4ed8' } }}>
      <AntdApp>
        <MainLayout currentModule={currentModule} onModuleChange={handleModuleChange}>
          {renderContent()}
        </MainLayout>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
