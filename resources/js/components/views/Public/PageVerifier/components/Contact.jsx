import { Card, Row, Col, Typography, Avatar, Divider } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope } from '@fortawesome/pro-regular-svg-icons';

const { Title, Paragraph, Text } = Typography;

export default function Contact() {
    const contactInfo = [
        {
            icon: faMapMarkerAlt,
            title: 'Address',
            content: ['San Vicente, Butuan City', 'Agusan del Norte, Philippines 8600'],
            color: '#3b82f6'
        },
        {
            icon: faPhone,
            title: 'Phone',
            content: ['(085) 342-5661', '(085) 342-5662'],
            color: '#10b981'
        },
        {
            icon: faEnvelope,
            title: 'Email',
            content: ['info@fsuu.edu.ph', 'registrar@fsuu.edu.ph'],
            color: '#8b5cf6'
        }
    ];

    const officeHours = [
        { day: 'Monday - Friday', time: '8:00 AM - 5:00 PM' },
        { day: 'Saturday', time: '8:00 AM - 12:00 PM' },
        { day: 'Sunday', time: 'Closed' }
    ];

    const registrarServices = [
        { service: 'Document Verification', time: '8:00 AM - 4:00 PM' },
        { service: 'Transcript Requests', time: '8:00 AM - 3:00 PM' }
    ];

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Card style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <Title level={2} style={{ color: '#1e40af', marginBottom: '16px' }}>
                    Contact Information
                </Title>
                <Paragraph style={{ fontSize: '18px', marginBottom: '32px', color: '#374151', lineHeight: '1.6' }}>
                    Get in touch with us for any inquiries or assistance.
                </Paragraph>
                
                <Row gutter={[32, 32]}>
                    <Col xs={24} lg={12}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {contactInfo.map((info, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <Avatar 
                                        size={48} 
                                        style={{ 
                                            backgroundColor: `${info.color}20`,
                                            color: info.color,
                                            border: `2px solid ${info.color}33`
                                        }}
                                    >
                                        <FontAwesomeIcon icon={info.icon} />
                                    </Avatar>
                                    <div style={{ flex: 1 }}>
                                        <Title level={5} style={{ marginBottom: '8px', color: '#1e40af' }}>
                                            {info.title}
                                        </Title>
                                        {info.content.map((line, lineIndex) => (
                                            <Text key={lineIndex} style={{ display: 'block', color: '#374151', lineHeight: '1.5' }}>
                                                {line}
                                            </Text>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Col>
                    
                    <Col xs={24} lg={12}>
                        <Card style={{ 
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            height: '100%'
                        }}>
                            <Title level={4} style={{ color: '#1e40af', marginBottom: '16px' }}>
                                Office Hours
                            </Title>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                                {officeHours.map((hour, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text strong style={{ color: '#374151' }}>{hour.day}:</Text>
                                        <Text style={{ color: '#6b7280' }}>{hour.time}</Text>
                                    </div>
                                ))}
                            </div>
                            
                            <Divider style={{ margin: '20px 0' }} />
                            
                            <Title level={5} style={{ color: '#1e40af', marginBottom: '16px' }}>
                                Registrar Office
                            </Title>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {registrarServices.map((service, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={{ color: '#374151' }}>{service.service}:</Text>
                                        <Text style={{ color: '#6b7280' }}>{service.time}</Text>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    );
}
