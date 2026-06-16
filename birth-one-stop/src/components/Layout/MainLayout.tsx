import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Avatar, Dropdown, Space, Tooltip } from 'antd';
import {
  UserOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  EditOutlined,
  FolderOpenOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Header, Sider, Content } = Layout;

interface MainLayoutProps {
  children: React.ReactNode;
  currentModule: string;
  onModuleChange: (key: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentModule, onModuleChange }) => {
  const [currentTime, setCurrentTime] = useState(dayjs().format('YYYY-MM-DD HH:mm:ss'));
  const [notificationCount] = useState(3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs().format('YYYY-MM-DD HH:mm:ss'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { key: 'queue', icon: <FileTextOutlined />, label: '叫号接件', badge: 5 },
    { key: 'verify', icon: <CheckCircleOutlined />, label: '信息核验' },
    { key: 'orchestrate', icon: <EditOutlined />, label: '联办编排' },
    { key: 'supplement', icon: <ExclamationCircleOutlined />, label: '补正处置', badge: 2 },
    { key: 'return', icon: <CloseCircleOutlined />, label: '异常退回' },
    { key: 'archive', icon: <FolderOpenOutlined />, label: '办结归档' },
    { key: 'stats', icon: <BarChartOutlined />, label: '统计分析' },
  ];

  const userMenuItems = [
    { key: 'profile', icon: <UserOutlined />, label: '个人中心' },
    { key: 'settings', icon: <SettingOutlined />, label: '系统设置' },
    { type: 'divider' as const },
    { key: 'logout', icon: <LogoutOutlined />, label: '退出登录' },
  ];

  return (
    <Layout className="h-screen w-screen overflow-hidden">
      <Header className="bg-gradient-to-r from-blue-700 to-blue-600 flex items-center justify-between px-6 shadow-md" style={{ background: 'linear-gradient(90deg, #1e3a8a, #1d4ed8)' }}>
        <div className="flex items-center gap-4">
          <div className="text-white text-xl font-bold flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <SwapOutlined className="text-2xl" />
            </div>
            <span>出生一件事联办工作台</span>
          </div>
          <div className="text-blue-200 text-sm ml-4">综合受理窗口</div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-white/90">
            <ClockCircleOutlined className="text-blue-300" />
            <span className="font-mono text-sm">{currentTime}</span>
          </div>

          <Space size={16}>
            <Tooltip title="消息通知">
              <Badge count={notificationCount} size="small">
                <BellOutlined className="text-white text-lg cursor-pointer hover:text-blue-200 transition-colors" />
              </Badge>
            </Tooltip>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors">
                <Avatar size="small" icon={<UserOutlined />} className="bg-blue-400" />
                <span className="text-white text-sm">王窗口</span>
              </div>
            </Dropdown>
          </Space>
        </div>
      </Header>

      <Layout>
        <Sider width={220} className="bg-white border-r border-gray-200 shadow-sm">
          <div className="p-3">
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg p-3 mb-3">
              <div className="text-xs text-orange-600 font-medium mb-1">⏰ 窗口受理时限</div>
              <div className="text-lg font-bold text-orange-700">20 分钟/件</div>
              <div className="text-xs text-orange-500 mt-1">当前平均：17分钟</div>
            </div>
          </div>

          <Menu
            mode="inline"
            selectedKeys={[currentModule]}
            onClick={({ key }) => onModuleChange(key)}
            style={{ borderRight: 0 }}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.badge ? (
                <div className="flex items-center justify-between w-full">
                  <span>{item.label}</span>
                  <Badge count={item.badge} size="small" color="#ff4d4f" />
                </div>
              ) : item.label,
            }))}
            className="py-2"
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xs text-blue-600 font-medium mb-1">今日办件</div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-700">15</span>
                <span className="text-xs text-blue-500">件</span>
              </div>
              <div className="flex gap-3 mt-2 text-xs">
                <span className="text-green-600">已办 5</span>
                <span className="text-orange-600">在办 8</span>
                <span className="text-red-600">退回 2</span>
              </div>
            </div>
          </div>
        </Sider>

        <Content className="bg-gray-50 overflow-auto">
          <div className="p-6 min-h-full">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
