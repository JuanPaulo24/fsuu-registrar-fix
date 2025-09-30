import { Menu, Card, Badge, Typography, Button, Space, Divider } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faInbox, 
    faPaperPlane, 
    faFileEdit, 
    faTrash,
    faRefresh,
    faArchive,
    faTrashCan
} from "@fortawesome/pro-regular-svg-icons";

export default function EmailSidebar({ 
    activeFolder, 
    setActiveFolder, 
    setSelectedEmail, 
    emailCache, 
    onRefresh
}) {
    const menuItems = [
        {
            key: "inbox",
            icon: <FontAwesomeIcon icon={faInbox} />,
            label: (
                <Space>
                    <span>Inbox</span>
                    {emailCache?.inbox?.loaded && (
                        <Badge 
                            count={emailCache.inbox.data.filter(email => !email.isRead).length || emailCache.inbox.data.length} 
                            showZero 
                            style={{ 
                                backgroundColor: emailCache.inbox.data.some(email => !email.isRead) ? '#ff4d4f' : '#666666' 
                            }} 
                        />
                    )}
                </Space>
            ),
        },
        {
            key: "sent",
            icon: <FontAwesomeIcon icon={faPaperPlane} />,
            label: (
                <Space>
                    <span>Sent</span>
                </Space>
            ),
        },
        {
            key: "draft",
            icon: <FontAwesomeIcon icon={faFileEdit} />,
            label: (
                <Space>
                    <span>Draft</span>
                    {emailCache?.draft?.loaded && (
                        <Badge 
                            count={emailCache.draft.data.filter(email => !email.isRead).length || emailCache.draft.data.length} 
                            showZero 
                            style={{ 
                                backgroundColor: emailCache.draft.data.some(email => !email.isRead) ? '#ff4d4f' : '#666666' 
                            }} 
                        />
                    )}
                </Space>
            ),
        },
        {
            key: "archive",
            icon: <FontAwesomeIcon icon={faArchive} />,
            label: (
                <Space>
                    <span>Archive</span>
                    {emailCache?.archive?.loaded && (
                        <Badge 
                            count={emailCache.archive.data.filter(email => !email.isRead).length || emailCache.archive.data.length} 
                            showZero 
                            style={{ 
                                backgroundColor: emailCache.archive.data.some(email => !email.isRead) ? '#ff4d4f' : '#666666' 
                            }} 
                        />
                    )}
                </Space>
            ),
        },
        {
            key: "spam",
            icon: <FontAwesomeIcon icon={faTrash} />,
            label: (
                <Space>
                    <span>Spam</span>
                    {emailCache?.spam?.loaded && (
                        <Badge 
                            count={emailCache.spam.data.filter(email => !email.isRead).length || emailCache.spam.data.length} 
                            showZero 
                            style={{ 
                                backgroundColor: emailCache.spam.data.some(email => !email.isRead) ? '#ff4d4f' : '#666666' 
                            }} 
                        />
                    )}
                </Space>
            ),
        },
    ];

    const handleMenuClick = ({ key }) => {
        setActiveFolder(key);
        setSelectedEmail(null); // Clear selected email when switching folders
    };

    return (
        <Card
            title={<Typography.Text style={{ color: "#fff" }}>Email Folders</Typography.Text>}
            headStyle={{ backgroundColor: "#002a8d", color: "#fff" }}
            size="small"
            style={{ height: "100%" }}
        >
            {/* Refresh Controls */}
            <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
                <Button
                    type="default"
                    size="small"
                    icon={<FontAwesomeIcon icon={faRefresh} style={{ color: '#666666' }} />}
                    onClick={onRefresh}
                    block
                    style={{ 
                        backgroundColor: '#f5f5f5', 
                        borderColor: '#d9d9d9',
                        color: '#666666'
                    }}
                >
                    Refresh
                </Button>
                
            </Space>

            <Divider style={{ margin: "8px 0" }} />

            <Menu
                mode="vertical"
                selectedKeys={[activeFolder]}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ border: "none" }}
            />
        </Card>
    );
}