import { Row, Col, Card, Typography, Divider, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faPhone, 
    faEnvelope, 
    faMapMarkerAlt, 
    faClock,
    faHeadset,
    faTools,
    faShieldAlt,
    faDatabase,
    faCode
} from "@fortawesome/pro-solid-svg-icons";
import { 
    faSkype, 
    faMicrosoft, 
    faSlack 
} from "@fortawesome/free-brands-svg-icons";

const { Title, Text, Paragraph } = Typography;

export default function TabContactInformation() {
    const contactSections = [
        {
            title: "IT Support Desk",
            icon: faHeadset,
            color: "#1890ff",
            contacts: [
                {
                    name: "Primary Support",
                    phone: "+1 (555) 123-4567",
                    email: "support@company.com",
                    hours: "Monday - Friday: 8:00 AM - 6:00 PM",
                    emergency: "+1 (555) 987-6543"
                }
            ]
        },
        {
            title: "System Maintenance",
            icon: faTools,
            color: "#52c41a",
            contacts: [
                {
                    name: "Maintenance Team",
                    phone: "+1 (555) 234-5678",
                    email: "maintenance@company.com",
                    hours: "24/7 Emergency Support",
                    emergency: "+1 (555) 876-5432"
                }
            ]
        },
        {
            title: "Security Team",
            icon: faShieldAlt,
            color: "#fa541c",
            contacts: [
                {
                    name: "Security Operations",
                    phone: "+1 (555) 345-6789",
                    email: "security@company.com",
                    hours: "24/7 Security Monitoring",
                    emergency: "+1 (555) 765-4321"
                }
            ]
        },
        {
            title: "Database Administration",
            icon: faDatabase,
            color: "#722ed1",
            contacts: [
                {
                    name: "Database Team",
                    phone: "+1 (555) 456-7890",
                    email: "dba@company.com",
                    hours: "Monday - Friday: 7:00 AM - 7:00 PM",
                    emergency: "+1 (555) 654-3210"
                }
            ]
        },
        {
            title: "Development Team",
            icon: faCode,
            color: "#13c2c2",
            contacts: [
                {
                    name: "Development Support",
                    phone: "+1 (555) 567-8901",
                    email: "dev-support@company.com",
                    hours: "Monday - Friday: 9:00 AM - 5:00 PM",
                    emergency: "support@company.com"
                }
            ]
        }
    ];

    const communicationChannels = [
        {
            platform: "Microsoft Teams",
            icon: faMicrosoft,
            contact: "support-team@company.com",
            description: "For real-time chat and video support"
        },
        {
            platform: "Slack",
            icon: faSlack,
            contact: "#it-support",
            description: "Internal communication channel"
        },
        {
            platform: "Skype",
            icon: faSkype,
            contact: "company.support",
            description: "Video calls and screen sharing"
        }
    ];

    const escalationProcedure = [
        {
            level: "Level 1",
            team: "IT Support Desk",
            description: "Initial support for common issues, password resets, basic troubleshooting"
        },
        {
            level: "Level 2",
            team: "Technical Specialists",
            description: "Advanced technical issues, system configuration, network problems"
        },
        {
            level: "Level 3",
            team: "Senior Engineers",
            description: "Complex system issues, critical failures, custom development"
        },
        {
            level: "Emergency",
            team: "On-Call Team",
            description: "Critical system outages, security incidents, data loss scenarios"
        }
    ];

    return (
        <Row gutter={[20, 20]}>
            {/* Contact Information Cards */}
            <Col span={24}>
                <Title level={3}>
                    <FontAwesomeIcon icon={faHeadset} className="mr-2" />
                    IT Support & Maintenance Contacts
                </Title>
                <Paragraph type="secondary">
                    Contact information for technical support, system maintenance, and emergency assistance.
                </Paragraph>
            </Col>

            {contactSections.map((section, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                    <Card 
                        className="h-full"
                        title={
                            <Space>
                                <FontAwesomeIcon 
                                    icon={section.icon} 
                                    style={{ color: section.color }} 
                                />
                                <span>{section.title}</span>
                            </Space>
                        }
                    >
                        {section.contacts.map((contact, contactIndex) => (
                            <div key={contactIndex}>
                                <Text strong className="block mb-2">{contact.name}</Text>
                                
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faPhone} className="w-4 mr-2 text-gray-500" />
                                        <Text>{contact.phone}</Text>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faEnvelope} className="w-4 mr-2 text-gray-500" />
                                        <Text>{contact.email}</Text>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faClock} className="w-4 mr-2 text-gray-500" />
                                        <Text>{contact.hours}</Text>
                                    </div>
                                    
                                    {contact.emergency && (
                                        <div className="flex items-center mt-3 p-2 bg-red-50 rounded">
                                            <FontAwesomeIcon icon={faPhone} className="w-4 mr-2 text-red-500" />
                                            <div>
                                                <Text strong className="text-red-600">Emergency:</Text>
                                                <br />
                                                <Text className="text-red-600">{contact.emergency}</Text>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </Card>
                </Col>
            ))}

            {/* Communication Channels */}
            <Col span={24}>
                <Divider />
                <Title level={4}>
                    Alternative Communication Channels
                </Title>
            </Col>

            {communicationChannels.map((channel, index) => (
                <Col xs={24} sm={8} key={index}>
                    <Card size="small">
                        <Space direction="vertical" size="small" className="w-full">
                            <div className="flex items-center">
                                <FontAwesomeIcon 
                                    icon={channel.icon} 
                                    className="w-5 h-5 mr-2" 
                                    style={{ color: "#1890ff" }} 
                                />
                                <Text strong>{channel.platform}</Text>
                            </div>
                            <Text>{channel.contact}</Text>
                            <Text type="secondary" className="text-sm">
                                {channel.description}
                            </Text>
                        </Space>
                    </Card>
                </Col>
            ))}

            {/* Escalation Procedure */}
            <Col span={24}>
                <Divider />
                <Title level={4}>
                    Support Escalation Procedure
                </Title>
                <Paragraph type="secondary">
                    Our support follows a structured escalation process to ensure your issues are resolved efficiently.
                </Paragraph>
            </Col>

            {escalationProcedure.map((level, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <Card 
                        size="small"
                        className={`border-l-4 ${
                            level.level === 'Emergency' 
                                ? 'border-l-red-500' 
                                : 'border-l-blue-500'
                        }`}
                    >
                        <Space direction="vertical" size="small" className="w-full">
                            <Text 
                                strong 
                                className={
                                    level.level === 'Emergency' 
                                        ? 'text-red-600' 
                                        : 'text-blue-600'
                                }
                            >
                                {level.level}
                            </Text>
                            <Text strong>{level.team}</Text>
                            <Text type="secondary" className="text-sm">
                                {level.description}
                            </Text>
                        </Space>
                    </Card>
                </Col>
            ))}

            {/* Office Location */}
            <Col span={24}>
                <Divider />
                <Card
                    title={
                        <Space>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-blue-500" />
                            <span>Office Location</span>
                        </Space>
                    }
                >
                    <Row gutter={[16, 16]}>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size="small">
                                <Text strong>Main Office</Text>
                                <Text>123 Technology Drive</Text>
                                <Text>Suite 400</Text>
                                <Text>City, State 12345</Text>
                                <Text>Country</Text>
                            </Space>
                        </Col>
                        <Col xs={24} md={12}>
                            <Space direction="vertical" size="small">
                                <Text strong>Office Hours</Text>
                                <Text>Monday - Friday: 8:00 AM - 6:00 PM</Text>
                                <Text>Saturday: 9:00 AM - 1:00 PM</Text>
                                <Text>Sunday: Closed</Text>
                                <Text type="secondary">*Emergency support available 24/7</Text>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            </Col>
        </Row>
    );
}
