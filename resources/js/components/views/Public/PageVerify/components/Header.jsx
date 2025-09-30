import { Layout, Row, Col, Button, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faShieldCheck } from '@fortawesome/pro-regular-svg-icons';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

export default function Header() {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate('/home');
    };

    return (
        <AntHeader style={{ 
            backgroundColor: '#1e40af', 
            padding: '0 24px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
        }}>
            <Row justify="space-between" align="middle" style={{ height: '100%' }}>
                <Col>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <FontAwesomeIcon 
                            icon={faShieldCheck} 
                            style={{ 
                                color: 'white', 
                                fontSize: '28px' 
                            }} 
                        />
                        <Title 
                            level={3} 
                            style={{ 
                                color: 'white', 
                                margin: 0,
                                fontSize: '1.5rem',
                                fontWeight: '600'
                            }}
                        >
                            Document Verification
                        </Title>
                    </div>
                </Col>
                <Col>
                    <Button 
                        ghost 
                        icon={<FontAwesomeIcon icon={faArrowLeft} />}
                        onClick={handleBackToHome}
                        style={{
                            borderColor: 'white',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Back to Home
                    </Button>
                </Col>
            </Row>
        </AntHeader>
    );
}