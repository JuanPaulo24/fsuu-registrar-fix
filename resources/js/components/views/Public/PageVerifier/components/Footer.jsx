import { Layout, Row, Col, Typography, Divider, Avatar } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faFacebookF, faTwitter, faInstagram, faYoutube, faLinkedinIn 
} from '@fortawesome/free-brands-svg-icons';
import { 
    faMapMarkerAlt, faPhone, faEnvelope, faGraduationCap 
} from '@fortawesome/pro-regular-svg-icons';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link } = Typography;

export default function Footer() {
    const quickLinks = [
        { label: 'Admissions', href: '#' },
        { label: 'Academic Calendar', href: '#' },
        { label: 'Student Portal', href: '#' },
        { label: 'Faculty Portal', href: '#' },
        { label: 'Alumni Association', href: '#' },
        { label: 'Library', href: '#' }
    ];

    const academicPrograms = [
        { label: 'College of Engineering', href: '#' },
        { label: 'College of Business', href: '#' },
        { label: 'College of Education', href: '#' },
        { label: 'College of Arts & Sciences', href: '#' },
        { label: 'Graduate Studies', href: '#' },
        { label: 'Research Programs', href: '#' }
    ];

    const socialLinks = [
        { icon: faFacebookF, href: 'https://facebook.com/fsuu', color: '#1877f2' },
        { icon: faTwitter, href: 'https://twitter.com/fsuu', color: '#1da1f2' },
        { icon: faInstagram, href: 'https://instagram.com/fsuu', color: '#e4405f' },
        { icon: faYoutube, href: 'https://youtube.com/fsuu', color: '#ff0000' },
        { icon: faLinkedinIn, href: 'https://linkedin.com/school/fsuu', color: '#0077b5' }
    ];

    const contactInfo = [
        {
            icon: faMapMarkerAlt,
            text: 'San Vicente, Butuan City, Agusan del Norte, Philippines 8600'
        },
        {
            icon: faPhone,
            text: '(085) 342-5661 / (085) 342-5662'
        },
        {
            icon: faEnvelope,
            text: 'info@fsuu.edu.ph'
        }
    ];

    return (
        <AntFooter style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
            color: 'white',
            padding: '48px 24px 24px 24px',
            marginTop: 'auto'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Row gutter={[32, 32]}>
                    {/* University Information */}
                    <Col xs={24} md={12} lg={6}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                            <Avatar 
                                size={40} 
                                style={{ 
                                    backgroundColor: 'white',
                                    color: '#1e40af',
                                    marginRight: '12px'
                                }}
                            >
                                <FontAwesomeIcon icon={faGraduationCap} />
                            </Avatar>
                            <Title level={4} style={{ color: 'white', margin: 0 }}>
                                FSUU
                            </Title>
                        </div>
                        <Text style={{ color: '#cbd5e1', lineHeight: '1.6', display: 'block', marginBottom: '16px' }}>
                            Father Saturnino Urios University is a premier educational institution 
                            committed to academic excellence and holistic development.
                        </Text>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {socialLinks.map((social, index) => (
                                <Avatar
                                    key={index}
                                    size={36}
                                    style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = social.color;
                                        e.target.style.transform = 'translateY(-2px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                        e.target.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <FontAwesomeIcon icon={social.icon} />
                                </Avatar>
                            ))}
                        </div>
                    </Col>

                    {/* Quick Links */}
                    <Col xs={24} md={12} lg={6}>
                        <Title level={5} style={{ color: 'white', marginBottom: '16px' }}>
                            Quick Links
                        </Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {quickLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.href}
                                    style={{
                                        color: '#cbd5e1',
                                        textDecoration: 'none',
                                        transition: 'color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'white'}
                                    onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </Col>

                    {/* Academic Programs */}
                    <Col xs={24} md={12} lg={6}>
                        <Title level={5} style={{ color: 'white', marginBottom: '16px' }}>
                            Academic Programs
                        </Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {academicPrograms.map((program, index) => (
                                <Link
                                    key={index}
                                    href={program.href}
                                    style={{
                                        color: '#cbd5e1',
                                        textDecoration: 'none',
                                        transition: 'color 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => e.target.style.color = 'white'}
                                    onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                                >
                                    {program.label}
                                </Link>
                            ))}
                        </div>
                    </Col>

                    {/* Contact Information */}
                    <Col xs={24} md={12} lg={6}>
                        <Title level={5} style={{ color: 'white', marginBottom: '16px' }}>
                            Contact Information
                        </Title>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {contactInfo.map((info, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                    <FontAwesomeIcon 
                                        icon={info.icon} 
                                        style={{ color: '#94a3b8', marginTop: '4px', flexShrink: 0 }}
                                    />
                                    <Text style={{ color: '#cbd5e1', lineHeight: '1.5' }}>
                                        {info.text}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    </Col>
                </Row>

                <Divider style={{ 
                    borderColor: 'rgba(255, 255, 255, 0.2)', 
                    margin: '32px 0 24px 0' 
                }} />

                <Row justify="space-between" align="middle">
                    <Col xs={24} md={12}>
                        <Text style={{ color: '#94a3b8' }}>
                            © {new Date().getFullYear()} Father Saturnino Urios University. All rights reserved.
                        </Text>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '24px', justifyContent: 'flex-end' }}>
                            <Link
                                href="#"
                                style={{
                                    color: '#94a3b8',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                            >
                                Privacy Policy
                            </Link>
                            <Link
                                href="#"
                                style={{
                                    color: '#94a3b8',
                                    textDecoration: 'none',
                                    transition: 'color 0.3s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.color = 'white'}
                                onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </Col>
                </Row>
            </div>
        </AntFooter>
    );
}
