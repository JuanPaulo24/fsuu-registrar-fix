import { useState } from "react";
import { Card, Typography, Collapse, Row, Col, Divider, List, Tag, Alert } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faBook, 
    faInfoCircle,
    faExclamationTriangle
} from "@fortawesome/pro-regular-svg-icons";

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

export default function TabSystemManual() {
    const [activeKey, setActiveKey] = useState(['getting-started']);

    const systemInfo = {
        version: "2.1.0",
        lastUpdated: "January 2025"
    };

    const navigationSections = [
        {
            key: 'dashboard',
            label: 'Dashboard',
            color: '#0027ae',
            content: {
                overview: 'Main dashboard displaying verification statistics, charts, and recent system activities.',
                features: [
                    'KPI Cards: Total Verifications, Successful, Failed, Exception Cases',
                    'Document Usage Chart showing verification trends',
                    'Document Generation Donut Chart for document types',
                    'Recent Emails from Gmail integration',
                    'Recent Announcements and system notifications',
                    'Google Map integration for location-based data'
                ],
                quickStart: [
                    'Log in to access the main dashboard',
                    'View verification statistics in KPI cards',
                    'Check recent emails and announcements',
                    'Monitor document verification trends in charts'
                ]
            }
        },
        {
            key: 'student-profiles',
            label: 'Student Profiles',
            color: '#0027ae',
            content: {
                overview: 'Student Profile Management system for managing student data and personal information.',
                features: [
                    'Student Profile Management with data table',
                    'Add New Student functionality with modal form',
                    'Profile editing and updates',
                    'Student tracking and document history',
                    'Profile deactivation and status management',
                    'Search and filter capabilities',
                    'Pagination and sorting options'
                ],
                navigation: [
                    'Go to Student Profiles from the sidebar',
                    'Click "Add New Student" button to open modal form',
                    'Use search and filters to find specific students',
                    'Click edit/view buttons to manage individual profiles',
                    'Access student tracking for document history'
                ]
            }
        },
        {
            key: 'users',
            label: 'Users',
            color: '#0027ae',
            content: {
                overview: 'Manage system users, roles, and permissions.',
                features: [
                    'Create and manage user accounts',
                    'Assign roles and permissions',
                    'Monitor user activity and login attempts',
                    'Reset passwords and manage access',
                    'User role management'
                ],
                navigation: [
                    'Go to Users from the sidebar',
                    'Click "Add New User" to create accounts',
                    'Use the role dropdown to assign permissions',
                    'Monitor activity in user management'
                ]
            }
        },
        {
            key: 'email',
            label: 'Email',
            color: '#0027ae',
            content: {
                overview: 'Gmail-integrated email system with folder management, templates, and auto-reply functionality.',
                features: [
                    'Gmail API integration (Inbox, Sent, Drafts, Spam, Archive, Deleted)',
                    'Email composition with rich text editor',
                    'Email templates for verification results and 2FA',
                    'Auto-reply system for automated responses',
                    'Email caching and background loading',
                    'Attachment handling and download',
                    'Email search and filtering',
                    'Real-time email monitoring'
                ],
                navigation: [
                    'Access Email module from the sidebar',
                    'Select folder (Inbox, Sent, Drafts, etc.) from sidebar',
                    'Click "Compose" to create new emails',
                    'Use templates for verification results and 2FA',
                    'Configure auto-reply settings in templates'
                ]
            }
        },
        {
            key: 'qr-scanner',
            label: 'QR Scanner',
            color: '#0027ae',
            content: {
                overview: 'QR code scanning system with BASE45 decoding and document verification capabilities.',
                features: [
                    'Camera-based QR code scanning with QrScanner library',
                    'BASE45 decoding for structured QR codes',
                    'Document verification with multi-step process',
                    'Scan history tracking and filtering',
                    'Camera selection and error handling',
                    'Verification loading modal with progress steps',
                    'Document verification result display',
                    'Upload QR code from file option'
                ],
                navigation: [
                    'Go to QR Scanner from the sidebar',
                    'Allow camera permissions when prompted',
                    'Point camera at QR code or upload file',
                    'View verification results in modal',
                    'Check scan history for past verifications'
                ]
            }
        },
        {
            key: 'document-management',
            label: 'Document Management',
            color: '#0027ae',
            content: {
                overview: 'Document generation and management system with tabs for Transcript of Records, Certifications, and Document Trackings.',
                features: [
                    'Transcript of Records generation and management',
                    'Certifications document processing',
                    'Document tracking and status monitoring',
                    'Enhanced document generation with modal system',
                    'Document viewer and loading modals',
                    'Password verification for sensitive operations',
                    'Document revocation and warning systems',
                    'Profile editing integration'
                ],
                navigation: [
                    'Access Document Management from the sidebar',
                    'Select tab: Transcript of Records, Certifications, or Document Trackings',
                    'Use "Generate Document" for new documents',
                    'View and manage existing documents in tables',
                    'Track document status and history'
                ]
            }
        },
        {
            key: 'information-panel',
            label: 'Information Panel',
            color: '#0027ae',
            content: {
                overview: 'Display system information, announcements, and notifications.',
                features: [
                    'System announcements display',
                    'Information panel management',
                    'Notification center',
                    'System status updates',
                    'Important notices and alerts'
                ],
                navigation: [
                    'Access Information Panel from the sidebar',
                    'View current announcements and notices',
                    'Manage panel content and updates',
                    'Monitor system status and alerts'
                ]
            }
        },
        {
            key: 'system-configurations',
            label: 'System Configurations',
            color: '#0027ae',
            content: {
                overview: 'Configure system settings, preferences, and administrative options.',
                features: [
                    'System configuration management',
                    'User interface customization',
                    'Security settings and policies',
                    'Backup and maintenance schedules',
                    'Integration and API settings'
                ],
                navigation: [
                    'Go to System Configurations from the sidebar',
                    'Modify settings in respective configuration tabs',
                    'Save changes and restart services if needed',
                    'Monitor system health and performance'
                ]
            }
        }
    ];

    const commonTasks = [
        {
            title: 'Add New Student Profile',
            description: 'Register a new student in the Student Profile Management system',
            steps: ['Go to Student Profiles from sidebar', 'Click "Add New Student" button', 'Fill in the modal form with student details', 'Save and verify the profile in the data table']
        },
        {
            title: 'Scan QR Code for Document Verification',
            description: 'Use QR Scanner to verify document authenticity with BASE45 decoding',
            steps: ['Access QR Scanner from sidebar', 'Allow camera permissions when prompted', 'Point camera at QR code or upload file', 'View verification results in the modal display']
        },
        {
            title: 'Generate Transcript of Records',
            description: 'Create and manage Transcript of Records documents',
            steps: ['Go to Document Management', 'Select "Transcript of Records" tab', 'Click "Generate Document" button', 'Fill in required information and generate PDF']
        },
        {
            title: 'Send Email Using Gmail Integration',
            description: 'Compose and send emails through the Gmail-integrated system',
            steps: ['Navigate to Email module', 'Select appropriate folder (Inbox, Sent, etc.)', 'Click "Compose" to open email editor', 'Use templates or compose new email and send']
        },
        {
            title: 'View Dashboard Statistics',
            description: 'Monitor system verification statistics and recent activities',
            steps: ['Access Dashboard from sidebar', 'View KPI cards for verification statistics', 'Check Recent Emails and Announcements', 'Monitor document usage charts and trends']
        }
    ];

    const troubleshooting = [
        {
            issue: 'Cannot access the system',
            solution: 'Check your internet connection and clear browser cache. Contact IT support if the problem persists.',
            severity: 'high'
        },
        {
            issue: 'Documents not uploading',
            solution: 'Ensure file size is under 10MB and format is supported (PDF, DOC, DOCX). Check your internet connection.',
            severity: 'medium'
        },
        {
            issue: 'Email notifications not sending',
            solution: 'Verify email configuration in System Settings. Check SMTP settings and credentials.',
            severity: 'medium'
        },
        {
            issue: 'Reports not generating',
            solution: 'Clear browser cache and try again. Ensure you have proper permissions for the selected data range.',
            severity: 'low'
        }
    ];

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high': return '#0027ae';
            case 'medium': return '#3c61e7';
            case 'low': return '#0027ae';
            default: return '#0027ae';
        }
    };

    return (
        <>
            <style>
                {`
                    @media print {
                        .no-print {
                            display: none !important;
                        }
                        .print-break {
                            page-break-before: always;
                        }
                        .print-avoid-break {
                            page-break-inside: avoid;
                        }
                        body {
                            font-size: 12pt;
                            line-height: 1.4;
                        }
                        .ant-card {
                            break-inside: avoid;
                            margin-bottom: 20pt;
                        }
                        .ant-collapse {
                            break-inside: avoid;
                        }
                        .ant-collapse .ant-collapse-content {
                            display: block !important;
                        }
                        .ant-collapse .ant-collapse-item {
                            break-inside: avoid;
                        }
                    }
                `}
            </style>
            <div style={{ fontFamily: 'MontserratRegular, sans-serif', marginTop: '20px' }}>
            {/* Table of Contents / Catalog */}
            <Card 
                title={
                    <Typography.Text style={{ color: "#fff" }}>
                        FSUU Registrar Validation System Manual
                    </Typography.Text>
                }
                headStyle={{ backgroundColor: "#002a8d", color: "#fff" }}
                size="small"
                style={{ marginBottom: 24 }}
            >
                <Title level={3} style={{ color: '#0027ae', marginBottom: 16, marginTop: 16 }}>
                    Table of Contents
                </Title>
                <Row gutter={[24, 16]}>
                    <Col xs={24} md={12}>
                        <Title level={5} style={{ color: '#0027ae', marginBottom: 12 }}>
                            System Modules
                        </Title>
                        <List
                            size="small"
                            dataSource={navigationSections}
                            renderItem={(section, index) => (
                                <List.Item style={{ padding: '4px 0' }}>
                                    <Text 
                                        style={{ 
                                            color: '#0027ae', 
                                            cursor: 'pointer',
                                            textDecoration: 'underline'
                                        }}
                                        onClick={() => setActiveKey([section.key])}
                                    >
                                        {index + 1}. {section.label}
                                    </Text>
                                </List.Item>
                            )}
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Title level={5} style={{ color: '#0027ae', marginBottom: 12 }}>
                            Quick Reference
                        </Title>
                        <List
                            size="small"
                            dataSource={[
                                'Common Tasks',
                                'Troubleshooting Guide',
                                'System Requirements'
                            ]}
                            renderItem={(item, index) => (
                                <List.Item style={{ padding: '4px 0' }}>
                                    <Text style={{ color: '#6b7280' }}>
                                        {index + navigationSections.length + 1}. {item}
                                    </Text>
                                </List.Item>
                            )}
                        />
                    </Col>
                </Row>
            </Card>

            {/* System Modules Guide */}
            <Card style={{ marginBottom: 24 }}>
                
                <Collapse 
                    activeKey={activeKey} 
                    onChange={setActiveKey}
                    expandIconPosition="right"
                >
                    {navigationSections.map((section) => (
                        <Panel
                            key={section.key}
                            header={
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <span style={{ fontSize: 16, fontWeight: 500, color: section.color }}>
                                        {section.label}
                                    </span>
                                </div>
                            }
                            style={{ 
                                marginBottom: 8
                            }}
                        >
                            <div style={{ padding: '16px 0' }}>
                                <Paragraph style={{ fontSize: 15, marginBottom: 16 }}>
                                    {section.content.overview}
                                </Paragraph>
                                
                                <Row gutter={[24, 16]}>
                                    <Col xs={24} md={12}>
                                        <Title level={5} style={{ color: section.color, marginBottom: 12 }}>
                                            Key Features
                                        </Title>
                                        <List
                                            size="small"
                                            dataSource={section.content.features}
                                            renderItem={(item) => (
                                                <List.Item style={{ padding: '4px 0' }}>
                                                    <span style={{ 
                                                        color: section.color, 
                                                        marginRight: 8,
                                                        fontSize: 12
                                                    }}>
                                                        •
                                                    </span>
                                                    {item}
                                                </List.Item>
                                            )}
                                        />
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Title level={5} style={{ color: section.color, marginBottom: 12 }}>
                                            How to Use
                                        </Title>
                                        <List
                                            size="small"
                                            dataSource={section.content.navigation || section.content.quickStart}
                                            renderItem={(item, index) => (
                                                <List.Item style={{ padding: '4px 0' }}>
                                                    <Tag color={section.color} style={{ marginRight: 8 }}>
                                                        {index + 1}
                                                    </Tag>
                                                    {item}
                                                </List.Item>
                                            )}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Panel>
                    ))}
                </Collapse>
            </Card>

            {/* Common Tasks */}
            <Card style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#0027ae', marginBottom: 16 }}>
                    Common Tasks
                </Title>
                <List
                    dataSource={commonTasks}
                    renderItem={(task, index) => (
                        <List.Item style={{ padding: '16px 0', borderBottom: index < commonTasks.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <div>
                                <Text strong style={{ color: '#0027ae', fontSize: '16px' }}>
                                    {task.title}
                                </Text>
                                <Paragraph style={{ margin: '8px 0', color: '#6b7280' }}>
                                    {task.description}
                                </Paragraph>
                                <div style={{ marginTop: '8px' }}>
                                    {task.steps.map((step, stepIndex) => (
                                        <div key={stepIndex} style={{ marginBottom: '4px', display: 'flex', alignItems: 'flex-start' }}>
                                            <span style={{ 
                                                color: '#0027ae', 
                                                marginRight: '8px', 
                                                fontWeight: 'bold',
                                                minWidth: '20px'
                                            }}>
                                                {stepIndex + 1}.
                                            </span>
                                            <Text style={{ color: '#4a5568' }}>{step}</Text>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            {/* Troubleshooting */}
            <Card style={{ marginBottom: 24 }}>
                <Title level={4} style={{ color: '#0027ae', marginBottom: 16 }}>
                    Troubleshooting
                </Title>
                <List
                    dataSource={troubleshooting}
                    renderItem={(item, index) => (
                        <List.Item style={{ padding: '16px 0', borderBottom: index < troubleshooting.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                            <div>
                                <Text strong style={{ color: '#0027ae', fontSize: '16px' }}>
                                    {item.issue}
                                </Text>
                                <Paragraph style={{ margin: '8px 0', color: '#6b7280' }}>
                                    {item.solution}
                                </Paragraph>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>

            </div>
        </>
    );
}
