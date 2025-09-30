import { Card, Row, Col, Typography, Avatar } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookOpen, faGraduationCap, faAward } from '@fortawesome/pro-regular-svg-icons';

const { Title, Paragraph } = Typography;

export default function Academics() {
    const programs = [
        {
            icon: faBookOpen,
            title: 'College of Arts and Sciences',
            color: '#1e40af',
            bgColor: '#dbeafe',
            courses: [
                'Bachelor of Science in Biology',
                'Bachelor of Science in Psychology',
                'Bachelor of Arts in English',
                'Bachelor of Science in Mathematics'
            ]
        },
        {
            icon: faGraduationCap,
            title: 'College of Education',
            color: '#059669',
            bgColor: '#d1fae5',
            courses: [
                'Bachelor of Elementary Education',
                'Bachelor of Secondary Education',
                'Bachelor of Physical Education',
                'Master of Arts in Education'
            ]
        },
        {
            icon: faAward,
            title: 'College of Engineering',
            color: '#7c3aed',
            bgColor: '#ede9fe',
            courses: [
                'Civil Engineering',
                'Mechanical Engineering',
                'Electrical Engineering',
                'Computer Engineering'
            ]
        }
    ];

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            <Card style={{
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <Title level={2} style={{ color: '#1e40af', marginBottom: '16px' }}>
                    Academic Programs
                </Title>
                <Paragraph style={{ fontSize: '18px', marginBottom: '32px', color: '#374151', lineHeight: '1.6' }}>
                    FSUU offers a comprehensive range of academic programs across various disciplines, 
                    designed to meet the evolving needs of students and society.
                </Paragraph>
                
                <Row gutter={[32, 32]}>
                    {programs.map((program, index) => (
                        <Col xs={24} md={12} lg={8} key={index}>
                            <Card 
                                hoverable 
                                style={{ 
                                    height: '100%',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease'
                                }}
                                bodyStyle={{ padding: '24px' }}
                            >
                                <Avatar 
                                    size={64} 
                                    style={{ 
                                        backgroundColor: program.bgColor,
                                        color: program.color,
                                        marginBottom: '16px',
                                        border: `2px solid ${program.color}33`
                                    }}
                                >
                                    <FontAwesomeIcon icon={program.icon} style={{ fontSize: '24px' }} />
                                </Avatar>
                                <Title level={4} style={{ color: '#1e40af', marginBottom: '16px' }}>
                                    {program.title}
                                </Title>
                                <ul style={{ 
                                    listStyle: 'none', 
                                    padding: '0', 
                                    margin: '0',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}>
                                    {program.courses.map((course, courseIndex) => (
                                        <li 
                                            key={courseIndex}
                                            style={{
                                                padding: '8px 12px',
                                                backgroundColor: '#f8fafc',
                                                borderRadius: '6px',
                                                borderLeft: `3px solid ${program.color}`,
                                                color: '#374151',
                                                fontSize: '14px'
                                            }}
                                        >
                                            {course}
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Card>
        </div>
    );
}
