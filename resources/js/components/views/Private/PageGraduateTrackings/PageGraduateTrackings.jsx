import { Row, Col, Card, Typography } from "antd";

const { Title } = Typography;

export default function PageGraduateTrackings() {
    return (
        <>
            <Row gutter={[20, 20]}>
                <Col span={24}>
                    <Card>
                        <Title level={3}>Graduate Trackings</Title>
                        <p>Content for Graduate Trackings will be implemented here.</p>
                    </Card>
                </Col>
            </Row>
        </>
    );
}
