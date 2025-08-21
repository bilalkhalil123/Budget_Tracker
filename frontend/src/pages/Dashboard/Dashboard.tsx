import React, { useEffect, useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChartOutlined, 
  DollarOutlined, 
  LogoutOutlined, 
  MenuFoldOutlined, 
  MenuUnfoldOutlined,
  UserOutlined,
  BellOutlined
} from '@ant-design/icons';
import ApiService from '../../services/api';
import './Dashboard.css';
import logo from '../../assets/app-logo.png';

const { Header, Sider, Content } = Layout;

const Dashboard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(ApiService.getCurrentUser());

  useEffect(() => {
    const handler = (e: any) => setUser(e?.detail || ApiService.getCurrentUser());
    if (typeof window !== 'undefined') {
      window.addEventListener('userUpdated', handler as any);
    }

    (async () => {
      try {
        const res: any = await ApiService.getProfile();
        if (res?.success && res.user) {
          localStorage.setItem('user', JSON.stringify(res.user));// (key,value)
          setUser(res.user);
        }
      } catch {}
    })();

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('userUpdated', handler as any);
      }
    };
  }, []);

  const handleLogout = () => {
    ApiService.logout();
    navigate('/login');
  };

  const menuItems = [    //array of objects describe options in sidebar
    {
      key: '/dashboard/analysis',// unique identifier for munu componenet
      icon: <BarChartOutlined />,
      label: 'Analysis',
      onClick: () => navigate('/dashboard/analysis')
    },
    {
      key: '/dashboard/expenses',
      icon: <DollarOutlined />,
      label: 'Expenses',
      onClick: () => navigate('/dashboard/expenses')
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      danger: true
    }
  ];

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile')
    },
  ];

  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/analysis')) return '/dashboard/analysis';
    if (path.includes('/expenses')) return '/dashboard/expenses';
    return '/dashboard/expenses'; 
  };

  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path.includes('/analysis')) return 'Analysis';
    if (path.includes('/expenses')) return 'Expenses';
    if (path.includes('/profile')) return 'Profile';
    return 'Dashboard';
  };

  return (
    <div className="dashboard-layout" role="application" aria-label="Budget Tracker Dashboard">
      <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`} role="navigation" aria-label="Main navigation">
        <header className="sidebar-header">
          <img src={logo} alt="Budget Tracker Logo" className="sidebar-logo" />
          {!collapsed && <h1 className="sidebar-title">Budget Tracker</h1>}
        </header>
        
        <nav aria-label="Dashboard navigation">
          <Menu
            theme={'light'}
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            className="sidebar-menu"
            role="menubar"
          />
        </nav>
      </aside>
      
      <div className="dashboard-main">
        <header className="dashboard-header" role="banner">
          <div className="header-left">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="collapse-btn"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </button>
            <h2 className="page-title">{getCurrentPageName()}</h2>
          </div>
          
          <div className="header-right" role="toolbar" aria-label="User actions">
            <Button 
              type="text" 
              icon={<BellOutlined />} 
              className="notification-btn"
              aria-label="Notifications"
            />
            <Dropdown 
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              trigger={['click']}
            >
              <button className="user-profile" aria-label="User menu">
                <Avatar src={user?.avatarUrl} icon={<UserOutlined />} />
                <span className="user-name">{user?.firstName || 'User'}</span>
              </button>
            </Dropdown>
          </div>
        </header>
        
        <main className="dashboard-content" role="main" aria-label="Dashboard content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

