import { Modal, Typography, Space, Button, Alert } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faClock, faSignOut } from '@fortawesome/pro-regular-svg-icons';
import { useSessionTimeout } from '../../providers/SessionTimeoutProvider';

const { Title, Text } = Typography;

export default function SessionTimeoutModal() {
    const { 
        showTimeoutModal, 
        timeRemaining, 
        isWarning, 
        extendSession, 
        confirmLogout 
    } = useSessionTimeout();

    if (!showTimeoutModal) return null;

    return (
        <Modal
            open={showTimeoutModal}
            closable={false}
            maskClosable={false}
            keyboard={false}
            footer={null}
            width={450}
            centered
            style={{ top: 20 }}
        >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <FontAwesomeIcon 
                    icon={faExclamationTriangle} 
                    style={{ 
                        fontSize: '48px', 
                        color: '#ff7a00',
                        marginBottom: '16px' 
                    }} 
                />
                
                <Title level={3} style={{ marginBottom: '16px', color: '#d46b08' }}>
                    Session Timeout Warning
                </Title>
                
                <Alert
                    message="Your session is about to expire due to inactivity"
                    description={
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                            <Text>
                                For your security, you will be automatically logged out in:
                            </Text>
                            <div style={{ 
                                padding: '8px 16px', 
                                backgroundColor: '#fff2e8',
                                borderRadius: '6px',
                                border: '1px solid #ffbb96',
                                display: 'inline-block'
                            }}>
                                <FontAwesomeIcon icon={faClock} style={{ marginRight: '8px', color: '#d46b08' }} />
                                <Text strong style={{ fontSize: '18px', color: '#d46b08' }}>
                                    {timeRemaining}
                                </Text>
                            </div>
                        </Space>
                    }
                    type="warning"
                    showIcon={false}
                    style={{ marginBottom: '24px', textAlign: 'left' }}
                />

                <Space size="middle" style={{ width: '100%', justifyContent: 'center' }}>
                    <Button
                        type="primary"
                        size="large"
                        onClick={extendSession}
                        style={{
                            minWidth: '140px',
                            height: '44px',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}
                    >
                        Stay Logged In
                    </Button>
                    
                    <Button
                        danger
                        size="large"
                        icon={<FontAwesomeIcon icon={faSignOut} />}
                        onClick={confirmLogout}
                        style={{
                            minWidth: '140px',
                            height: '44px',
                            fontSize: '16px',
                            fontWeight: '500'
                        }}
                    >
                        Logout Now
                    </Button>
                </Space>

                <div style={{ marginTop: '16px' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        This helps protect your account when you're away from your computer
                    </Text>
                </div>
            </div>
        </Modal>
    );
}