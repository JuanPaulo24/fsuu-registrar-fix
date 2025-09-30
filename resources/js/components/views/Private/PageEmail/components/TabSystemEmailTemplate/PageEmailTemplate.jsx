import { Card, Col, Row } from "antd";
import PageEmailContent from "./components/PageEmailContent";

export default function PageEmailTemplate() {
    return (
        <div className="page-email-template">
            <Row>
                <Col xs={24} md={24} lg={24} xl={24}>
                    <Card>
                        <PageEmailContent />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
