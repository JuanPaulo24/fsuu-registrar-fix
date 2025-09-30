import { Card, Row, Col, Typography, Button, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/pro-regular-svg-icons";
import EmailTable from "./EmailTable";

export default function EmailContainer({ activeFolder, selectedEmail, setSelectedEmail, emailCache, setEmailCache, sidebarVisible, setSidebarVisible, isMobile }) {
    const cardTitle = (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Typography.Text style={{ color: "#fff" }}>
                {`${activeFolder.charAt(0).toUpperCase() + activeFolder.slice(1)} Emails`}
            </Typography.Text>
            {!isMobile && (
                <Button
                    type="text"
                    size="small"
                    icon={<FontAwesomeIcon icon={faBars} style={{ color: '#fff' }} />}
                    onClick={() => setSidebarVisible(!sidebarVisible)}
                    style={{ 
                        color: '#fff',
                        border: 'none',
                        background: 'transparent'
                    }}
                    title="Toggle Sidebar"
                />
            )}
        </Space>
    );

    return (
        <Card
            title={cardTitle}
            headStyle={{ backgroundColor: "#002a8d", color: "#fff" }}
            size="small"
            style={{ height: "100%" }}
        >
            <Row gutter={[16, 16]} style={{ height: "100%" }}>
                <Col xs={24} sm={24} md={24} lg={24} className="email-table-container">
                    <EmailTable 
                        activeFolder={activeFolder}
                        onSelectEmail={setSelectedEmail}
                        emailCache={emailCache}
                        setEmailCache={setEmailCache}
                    />
                </Col>
            </Row>
        </Card>
    );
}