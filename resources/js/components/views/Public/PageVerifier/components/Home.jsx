import { Row, Col, Card, Space, Button, Avatar, Typography, Spin, Badge } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faShieldCheck, 
    faClock, 
    faEye, 
    faBullhorn 
} from '@fortawesome/pro-regular-svg-icons';
import { useNavigate } from 'react-router-dom';
import { GET_PUBLIC } from '../../../../providers/useAxiosQuery';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

export default function Home({ onViewAllAnnouncements }) {
    const navigate = useNavigate();

    const handleVerifyDocument = () => {
        navigate('/verify');
    };

    // Fetch public postings from API (limit to first 2 for home page, only announcements and news)
    const { data: postingsResponse, isLoading, error } = GET_PUBLIC(
        'api/public/postings?page_size=2&type=announcement,news',
        'home_announcements',
        null,
        false // Disable global loading for public page
    );

    // Process and format the data (limit to first 2)
    const processedAnnouncements = () => {
        if (!postingsResponse?.data) return [];
        
        // Extract data array (handle both paginated and non-paginated responses)
        const announcements = Array.isArray(postingsResponse.data) 
            ? postingsResponse.data 
            : postingsResponse.data.data || [];

        // Format and sort announcements by priority (take first 2)
        return announcements.map(announcement => ({
            id: announcement.id,
            title: announcement.title,
            start_date: announcement.start_date ? dayjs(announcement.start_date).format('MMMM DD, YYYY') : null,
            content: announcement.content,
            type: announcement.type,
            priority_level: announcement.priority_level,
            // For priority ordering: high = 1, medium = 2, low = 3
            priorityOrder: announcement.priority_level === 'high' ? 1 : 
                          announcement.priority_level === 'medium' ? 2 : 3
        })).sort((a, b) => a.priorityOrder - b.priorityOrder).slice(0, 2);
    };

    const displayAnnouncements = processedAnnouncements();

    const getBadgeColor = (priorityLevel) => {
        switch (priorityLevel) {
            case 'high': return '#ef4444';
            case 'medium': return '#f59e0b';
            case 'low': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'announcement': return '#10b981';
            case 'notification': return '#3b82f6';
            case 'news': return '#8b5cf6';
            default: return '#6b7280';
        }
    };
    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <div style={{ 
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)',
                padding: '60px 32px',
                borderRadius: '12px',
                marginBottom: '48px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <Row gutter={[32, 32]} align="middle">
                    <Col xs={24} lg={14}>
                        <Title level={1} style={{ 
                            color: 'white', 
                            fontSize: '2.5rem',
                            fontWeight: 'bold',
                            marginBottom: '24px',
                            lineHeight: '1.2'
                        }}>
                            FSUU Document Verification Portal
                        </Title>
                        <Paragraph style={{ 
                            color: 'rgba(255, 255, 255, 0.9)', 
                            fontSize: '1.125rem',
                            marginBottom: '32px',
                            lineHeight: '1.6'
                        }}>
                            Fast, secure, and reliable document verification for Father Saturnino Urios University students, alumni, and stakeholders.
                        </Paragraph>
                        <Space size="large" wrap>
                            <Button 
                                type="primary" 
                                size="large" 
                                onClick={handleVerifyDocument}
                                style={{ 
                                    backgroundColor: 'white',
                                    borderColor: 'white',
                                    color: '#1e40af',
                                    fontWeight: '600',
                                    height: '48px',
                                    padding: '0 24px',
                                    fontSize: '16px'
                                }}
                            >
                                <FontAwesomeIcon icon={faShieldCheck} style={{ marginRight: '8px' }} />
                                Verify Document
                            </Button>
                            <Button 
                                ghost 
                                size="large"
                                style={{
                                    borderColor: 'white',
                                    color: 'white',
                                    fontWeight: '600',
                                    height: '48px',
                                    padding: '0 24px',
                                    fontSize: '16px'
                                }}
                            >
                                Learn More
                            </Button>
                        </Space>
                    </Col>
                    <Col xs={24} lg={10}>
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <Avatar 
                                size={180} 
                                style={{ 
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                    color: 'white',
                                    border: '3px solid rgba(255, 255, 255, 0.3)',
                                    backdropFilter: 'blur(10px)'
                                }}
                            >
                                <FontAwesomeIcon icon={faShieldCheck} style={{ fontSize: '72px' }} />
                            </Avatar>
                        </div>
                    </Col>
                </Row>
            </div>

            <Row gutter={[32, 32]} style={{ marginBottom: '48px' }}>
                <Col xs={24} md={8}>
                    <Card 
                        hoverable 
                        style={{ 
                            textAlign: 'center', 
                            height: '100%',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            padding: '24px 16px'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <Avatar 
                            size={80} 
                            style={{ 
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                marginBottom: '20px',
                                border: '2px solid #93c5fd'
                            }}
                        >
                            <FontAwesomeIcon icon={faShieldCheck} style={{ fontSize: '32px' }} />
                        </Avatar>
                        <Title level={4} style={{ color: '#1e40af', marginBottom: '16px' }}>
                            Secure Verification
                        </Title>
                        <Paragraph style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                            Advanced security protocols ensure your documents are verified safely and securely.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card 
                        hoverable 
                        style={{ 
                            textAlign: 'center', 
                            height: '100%',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            padding: '24px 16px'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <Avatar 
                            size={80} 
                            style={{ 
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                marginBottom: '20px',
                                border: '2px solid #93c5fd'
                            }}
                        >
                            <FontAwesomeIcon icon={faClock} style={{ fontSize: '32px' }} />
                        </Avatar>
                        <Title level={4} style={{ color: '#1e40af', marginBottom: '16px' }}>
                            Quick Processing
                        </Title>
                        <Paragraph style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                            Get your documents verified in minutes, not days. Our streamlined process saves you time.
                        </Paragraph>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card 
                        hoverable 
                        style={{ 
                            textAlign: 'center', 
                            height: '100%',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            padding: '24px 16px'
                        }}
                        bodyStyle={{ padding: '24px' }}
                    >
                        <Avatar 
                            size={80} 
                            style={{ 
                                backgroundColor: '#dbeafe',
                                color: '#1e40af',
                                marginBottom: '20px',
                                border: '2px solid #93c5fd'
                            }}
                        >
                            <FontAwesomeIcon icon={faEye} style={{ fontSize: '32px' }} />
                        </Avatar>
                        <Title level={4} style={{ color: '#1e40af', marginBottom: '16px' }}>
                            Real-time Tracking
                        </Title>
                        <Paragraph style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6' }}>
                            Track your verification status in real-time with our advanced monitoring system.
                        </Paragraph>
                    </Card>
                </Col>
            </Row>

            <Card 
                title={
                    <Space style={{ color: '#1e40af', fontSize: '18px', fontWeight: '600' }}>
                        <FontAwesomeIcon icon={faBullhorn} style={{ color: '#1e40af' }} />
                        <span>Latest Announcements</span>
                    </Space>
                }
                style={{
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                bodyStyle={{ padding: '24px' }}
            >
                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin size="large" />
                        <div style={{ marginTop: '16px', color: '#6b7280' }}>
                            Loading latest announcements...
                        </div>
                    </div>
                ) : error || displayAnnouncements.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                        <FontAwesomeIcon icon={faBullhorn} style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }} />
                        <div>No announcements available at the moment</div>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {displayAnnouncements.map(announcement => (
                                <div 
                                    key={announcement.id} 
                                    style={{ 
                                        borderLeft: `4px solid ${getBadgeColor(announcement.priority_level)}`,
                                        paddingLeft: '16px',
                                        backgroundColor: '#f8fafc',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginLeft: '0'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                        <Title level={5} style={{ marginBottom: '0', color: '#1e40af' }}>
                                            {announcement.title}
                                        </Title>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

                                            <Badge 
                                                color={getTypeColor(announcement.type)}
                                                text={announcement.type.charAt(0).toUpperCase() + announcement.type.slice(1)} 
                                                style={{ fontSize: '11px' }}
                                            />
                                        </div>
                                    </div>
                                    {announcement.start_date && (
                                        <Text type="secondary" style={{ fontSize: '12px', color: '#6b7280' }}>
                                             {announcement.start_date}
                                        </Text>
                                    )}
                                    <Paragraph style={{ marginTop: '12px', marginBottom: '0', color: '#374151', lineHeight: '1.6' }}>
                                        {announcement.content}
                                    </Paragraph>
                                </div>
                            ))}
                        </div>
                        <Button 
                            type="link" 
                            onClick={onViewAllAnnouncements}
                            style={{
                                marginTop: '20px',
                                padding: '0',
                                color: '#1e40af',
                                fontWeight: '500'
                            }}
                        >
                            View All Announcements →
                        </Button>
                    </>
                )}
            </Card>
        </div>
    );
}
