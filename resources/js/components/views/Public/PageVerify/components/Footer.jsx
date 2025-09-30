import { Layout, Typography, Row, Col } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export default function Footer() {
    return (
        <AntFooter style={{ 
            backgroundColor: '#1f2937', 
            color: 'white',
            textAlign: 'center',
            padding: '24px'
        }}>
            <Row justify="center">
                <Col>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                        © {new Date().getFullYear()} Father Saturnino Urios University. All rights reserved.
                    </Text>
                </Col>
            </Row>
        </AntFooter>
    );
}