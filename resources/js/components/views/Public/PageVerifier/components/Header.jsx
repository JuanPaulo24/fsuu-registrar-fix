import { Layout, Row, Col, Flex, Avatar, Typography, Button, Menu } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldCheck, faQuestionCircle, faHeadset, faPhone, faEnvelope } from '@fortawesome/pro-regular-svg-icons';
import SearchEngine from './SearchEngine';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

export default function Header({ activeMenu, onMenuChange, onSearch }) {
    const menuItems = [
        {
            key: 'home',
            label: 'Home',
        },
        {
            key: 'about',
            label: 'About',
        },
        {
            key: 'academics',
            label: 'Academics',
        },
        {
            key: 'calendar',
            label: 'Calendar',
        },
        {
            key: 'announcements',
            label: 'Announcements',
        },
        {
            key: 'contact',
            label: 'Contact Us',
        },
    ];
    return (
        <>
            <div style={{
                background: 'linear-gradient(135deg, #00BFFF 0%, #1E90FF 100%)',
                padding: '6px 0',
                borderBottom: '1px solid rgba(30, 64, 175, 0.1)',
                fontSize: '12px',
                color: '#ffffff'
            }}>
                <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
                    <Row justify="space-between" align="middle">
                        <Col xs={24} sm={12} md={16}>
                            <Flex gap={16} align="center" wrap="wrap">
                                <Flex gap={4} align="center">
                                    <FontAwesomeIcon icon={faHeadset} style={{ fontSize: '12px' }} />
                                    <span style={{ fontWeight: '500' }}>Help & Support</span>
                                </Flex>
                                <Flex gap={4} align="center">
                                    <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: '12px' }} />
                                    <span>FAQ</span>
                                </Flex>
                            </Flex>
                        </Col>
                        <Col xs={24} sm={12} md={8}>
                            <Flex gap={12} align="center" justify="end" wrap="wrap">
                                <Flex gap={4} align="center">
                                    <FontAwesomeIcon icon={faPhone} style={{ fontSize: '12px' }} />
                                    <span style={{ fontWeight: '500' }}>+63 123 456 7890</span>
                                </Flex>
                                <Flex gap={4} align="center">
                                    <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: '12px' }} />
                                    <span style={{ fontWeight: '500' }}>registrar@fsuu.edu.ph</span>
                                </Flex>
                            </Flex>
                        </Col>
                    </Row>
                </div>
            </div>
            
        <AntHeader style={{ 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(248, 250, 252, 1) 100%)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            padding: '0',
            height: 'auto',
            borderBottom: '1px solid #e5e7eb',
            backdropFilter: 'blur(10px)',
            position: 'relative'
        }}>
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 16px' }}>
                <Row align="middle" style={{ padding: '12px 0' }}>
                    <Col xs={12} sm={8} md={6} lg={6}>
                        <Flex align="center" gap={0}>
                            <div style={{
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: 'scale(1)',
                                ':hover': {
                                    transform: 'scale(1.05)'
                                }
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                e.currentTarget.style.filter = 'drop-shadow(0 8px 16px rgba(30, 64, 175, 0.2))';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.filter = 'none';
                            }}
                            >
                                <img 
                                    src="/images/fsuu-registrar-logo.png"
                                    alt="FSUU Office of Registrar"
                                    style={{
                                        height: window.innerWidth <= 768 ? '64px' : '84px',
                                        width: 'auto',
                                        objectFit: 'contain',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                    }}
                                />
                            </div>
                        </Flex>
                    </Col>
                    
                    <Col xs={12} sm={16} md={18} lg={18}>
                        <Row gutter={[8, 8]} justify="end">
                            <Col xs={24} sm={16} md={14} lg={12}>
                                <SearchEngine onSearch={onSearch} />
                            </Col>
                            <Col xs={24} sm={8} md={10} lg={6}>
                                <Flex justify="end">
                                    <Button 
                                        type="primary" 
                                        size={window.innerWidth <= 768 ? "middle" : "large"}
                                        style={{
                                            backgroundColor: '#1e40af',
                                            borderColor: '#1e40af',
                                            fontWeight: '600',
                                            height: window.innerWidth <= 768 ? '36px' : '40px',
                                            borderRadius: '8px',
                                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            fontSize: window.innerWidth <= 768 ? '12px' : '14px',
                                            width: window.innerWidth <= 768 ? '100%' : 'auto'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1d4ed8';
                                            e.currentTarget.style.borderColor = '#1d4ed8';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(30, 64, 175, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1e40af';
                                            e.currentTarget.style.borderColor = '#1e40af';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faShieldCheck} style={{ 
                                            marginRight: window.innerWidth <= 768 ? '4px' : '8px',
                                            transition: 'transform 0.3s ease'
                                        }} />
                                        {window.innerWidth <= 768 ? 'Verify' : 'Verify Document'}
                                    </Button>
                                </Flex>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                
                <Row style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', paddingBottom: '8px' }}>
                    <Col span={24}>
                        <Menu 
                            mode="horizontal" 
                            selectedKeys={[activeMenu]}
                            items={menuItems}
                            onClick={(e) => onMenuChange(e.key)}
                            style={{
                                border: 'none',
                                justifyContent: 'center',
                                backgroundColor: 'transparent',
                                overflowX: 'auto',
                                whiteSpace: 'nowrap'
                            }}
                            theme="light"
                            className="elegant-menu"
                        />
                        <style jsx>{`
                            .elegant-menu {
                                scrollbar-width: none;
                                -ms-overflow-style: none;
                            }
                            
                            .elegant-menu::-webkit-scrollbar {
                                display: none;
                            }
                            
                            .elegant-menu .ant-menu-item {
                                border-radius: 8px !important;
                                margin: 0 2px !important;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                                position: relative !important;
                                overflow: hidden !important;
                                font-size: 14px !important;
                                padding: 6px 12px !important;
                                min-width: auto !important;
                                flex-shrink: 0 !important;
                            }
                            
                            @media (max-width: 768px) {
                                .elegant-menu .ant-menu-item {
                                    font-size: 12px !important;
                                    padding: 4px 8px !important;
                                    margin: 0 1px !important;
                                }
                                
                                .elegant-menu {
                                    justify-content: flex-start !important;
                                    padding: 0 8px !important;
                                }
                            }
                            
                            @media (max-width: 480px) {
                                .elegant-menu .ant-menu-item {
                                    font-size: 11px !important;
                                    padding: 4px 6px !important;
                                }
                            }
                            
                            .elegant-menu .ant-menu-item:hover {
                                background: linear-gradient(135deg, rgba(30, 64, 175, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%) !important;
                                color: #1e40af !important;
                                transform: translateY(-2px) !important;
                                box-shadow: 0 4px 12px rgba(30, 64, 175, 0.15) !important;
                            }
                            
                            .elegant-menu .ant-menu-item::before {
                                content: '' !important;
                                position: absolute !important;
                                top: 0 !important;
                                left: -100% !important;
                                width: 100% !important;
                                height: 100% !important;
                                background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent) !important;
                                transition: left 0.5s ease !important;
                            }
                            
                            .elegant-menu .ant-menu-item:hover::before {
                                left: 100% !important;
                            }
                            
                            .elegant-menu .ant-menu-item-selected {
                                background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
                                color: white !important;
                                box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3) !important;
                                border-radius: 8px !important;
                            }
                            
                            .elegant-menu .ant-menu-item-selected::after {
                                display: none !important;
                            }
                        `}</style>
                    </Col>
                </Row>
            </div>
        </AntHeader>
        </>
    );
}
