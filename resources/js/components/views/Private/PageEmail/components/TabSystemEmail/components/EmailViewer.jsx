import { Card, Avatar, Button, Space, Typography, Divider, Tag, Modal, Row, Col, message } from "antd";
import { useState } from "react";
import DOMPurify from "dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faReply, 
    faForward, 
    faTrash, 
    faArrowLeft,
    faPaperclip,
    faExclamationTriangle,
    faShieldCheck
} from "@fortawesome/pro-regular-svg-icons";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

const { Text, Title } = Typography;

export default function EmailViewer({ email, open, onClose, onReply, onMarkAsSpam, onReportNotSpam }) {
    const [downloadingAttachment, setDownloadingAttachment] = useState(null);
    const [markingAsSpam, setMarkingAsSpam] = useState(false);
    const [reportingNotSpam, setReportingNotSpam] = useState(false);
    
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-04-REPLY',
        'M-04-FORWARD', 
        'M-04-SPAM'
    ]);
    
    if (!email) return null;

    const getPriorityColor = (priority) => {
        switch (priority) {
            case "urgent": return "red";
            case "high": return "orange";
            case "normal": return "blue";
            case "low": return "gray";
            default: return "blue";
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return "Unknown size";
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 Bytes';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const handleDownloadAttachment = async (attachment) => {
        const downloadKey = `${attachment.attachmentId}_${email.attachments.indexOf(attachment)}`;
        setDownloadingAttachment(downloadKey);
        
        try {
            console.log('Downloading attachment:', attachment);
            
            const response = await fetch(`/api/gmail/attachment/${email.id}/${attachment.attachmentId}?filename=${encodeURIComponent(attachment.filename)}&mimeType=${encodeURIComponent(attachment.mimeType)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                // Create blob from base64 data and trigger download
                const binaryString = atob(result.data.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                const blob = new Blob([bytes], { type: attachment.mimeType || 'application/octet-stream' });
                const url = window.URL.createObjectURL(blob);
                
                const link = document.createElement('a');
                link.href = url;
                link.download = attachment.filename || 'attachment';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                message.success('Attachment downloaded successfully');
            } else {
                throw new Error(result.message || 'Failed to download attachment');
            }
        } catch (error) {
            console.error('Download error:', error);
            message.error(`Failed to download attachment: ${error.message}`);
        } finally {
            setDownloadingAttachment(null);
        }
    };

    const handleAction = async (action) => {
        console.log(`${action} action for email:`, email.id);
        
        switch (action) {
            case 'reply':
                handleReply();
                break;
            case 'forward':
                handleForward();
                break;
            case 'spam':
                await handleMarkAsSpam();
                break;
            case 'reportNotSpam':
                await handleReportNotSpam();
                break;
            default:
                console.log(`Action ${action} not implemented yet`);
        }
    };

    const handleReply = () => {
        if (onReply) {
            const replyData = {
                to: email.fromEmail || email.from,
                subject: email.subject.startsWith('Re: ') ? email.subject : `Re: ${email.subject}`,
                body: '', // Empty body, original content will be handled separately
                originalMessage: {
                    date: email.date,
                    from: email.from,
                    content: email.body || email.bodyHtml
                }
            };
            onReply(replyData);
            onClose();
        }
    };


    const handleForward = () => {
        if (onReply) {
            const forwardData = {
                // Don't set 'to' field, let it be empty for user to fill
                subject: email.subject.startsWith('Fwd: ') ? email.subject : `Fwd: ${email.subject}`,
                body: '', // Empty body, original content will be handled separately
                isForward: true,
                originalMessage: {
                    date: email.date,
                    from: email.from,
                    to: email.to || email.toEmail,
                    subject: email.subject,
                    content: email.body || email.bodyHtml
                }
            };
            onReply(forwardData);
            onClose();
        }
    };

    const handleMarkAsSpam = async () => {
        if (!email.id) {
            message.error('Cannot mark email as spam: No email ID found');
            return;
        }

        try {
            setMarkingAsSpam(true);
            
            // Show confirmation dialog
            Modal.confirm({
                title: 'Mark as Spam',
                content: 'Are you sure you want to mark this email as spam? This will move it to the spam folder.',
                okText: 'Mark as Spam',
                okType: 'danger',
                cancelText: 'Cancel',
                onOk: async () => {
                    try {
                        console.log('Marking email as spam with ID:', email.id);
                        
                        const response = await fetch(`/api/gmail/mark-spam/${email.id}`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json',
                            },
                        });

                        const result = await response.json();
                        
                        if (response.ok && result.success) {
                            message.success('Email marked as spam successfully!');
                            
                            // Callback to parent to refresh email list and close modal
                            if (onMarkAsSpam) {
                                onMarkAsSpam(email.id);
                            }
                            onClose();
                        } else {
                            throw new Error(result.message || 'Failed to mark email as spam');
                        }
                    } catch (error) {
                        console.error('Error marking email as spam:', error);
                        message.error(`Failed to mark email as spam: ${error.message}`);
                    }
                }
            });
        } catch (error) {
            console.error('Error in spam confirmation:', error);
            message.error(`Error: ${error.message}`);
        } finally {
            setMarkingAsSpam(false);
        }
    };

    const handleReportNotSpam = async () => {
        if (!email.id) {
            message.error('Cannot report as not spam: No email ID found');
            return;
        }

        try {
            setReportingNotSpam(true);
            
            // Show confirmation dialog
            Modal.confirm({
                title: 'Report Not Spam',
                content: 'Are you sure this email is not spam? This will move it back to your inbox.',
                okText: 'Report Not Spam',
                okType: 'primary',
                cancelText: 'Cancel',
                onOk: async () => {
                    try {
                        console.log('Reporting email as not spam with ID:', email.id);
                        
                        const response = await fetch(`/api/gmail/report-not-spam/${email.id}`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                'Content-Type': 'application/json',
                            },
                        });

                        const result = await response.json();
                        
                        if (response.ok && result.success) {
                            message.success('Email reported as not spam successfully!');
                            
                            // Callback to parent to refresh email list and close modal
                            if (onReportNotSpam) {
                                onReportNotSpam(email.id);
                            }
                            onClose();
                        } else {
                            throw new Error(result.message || 'Failed to report email as not spam');
                        }
                    } catch (error) {
                        console.error('Error reporting email as not spam:', error);
                        message.error(`Failed to report email as not spam: ${error.message}`);
                    }
                }
            });
        } catch (error) {
            console.error('Error in report not spam confirmation:', error);
            message.error(`Error: ${error.message}`);
        } finally {
            setReportingNotSpam(false);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            title={<Text style={{ color: "#fff" }}>Email Details</Text>}
            styles={{ header: { backgroundColor: "#002a8d" } }}
        >
            <Card
                style={{ height: "100%", overflow: "auto", border: 0 }}
                bordered={false}
            >
            {/* Email Header */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ margin: 0 }}>
                    {email.subject}
                </Title>
                <Space style={{ marginTop: 8 }}>
                    <Tag color={getPriorityColor(email.priority)} size="small">
                        {email.priority}
                    </Tag>
                    {email.hasAttachment && (
                        <Tag icon={<FontAwesomeIcon icon={faPaperclip} />} color="blue">
                            Attachment
                        </Tag>
                    )}
                </Space>
            </div>

            <Divider />

            {/* Sender/Recipient Info */}
            <div style={{ marginBottom: 16 }}>
                <Space align="start">
                    <Avatar size="large">
                        {(email.from || email.to || "").charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                        <div>
                            <Text strong>
                                {email.from ? "From: " : "To: "}
                                {email.from || email.to}
                            </Text>
                        </div>
                        {email.fromEmail && (
                            <div>
                                <Text type="secondary">{email.fromEmail}</Text>
                            </div>
                        )}
                        <div>
                            <Text type="secondary">{email.date}</Text>
                        </div>
                    </div>
                </Space>
            </div>

            <Divider />

            {/* Email Body (render sanitized HTML when available) */}
            {(() => {
                console.log('EmailViewer: Rendering email body', {
                    hasBodyHtml: !!email.bodyHtml,
                    bodyHtmlLength: email.bodyHtml?.length,
                    bodyLength: email.body?.length,
                    bodyHtmlPreview: email.bodyHtml?.substring(0, 100),
                    bodyPreview: email.body?.substring(0, 100)
                });

                // Check if email.body contains HTML tags (fallback for when bodyHtml is not set)
                const hasHtmlTags = /<[^>]+>/.test(email.body);
                const htmlContent = email.bodyHtml || (hasHtmlTags ? email.body : null);

                if (htmlContent) {
                    const sanitized = DOMPurify.sanitize(htmlContent, {
                        USE_PROFILES: { html: true },
                        FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "link", "meta"],
                        FORBID_ATTR: [
                            "onerror",
                            "onload",
                            "onclick",
                            "onmouseover",
                            "onfocus",
                            "onmouseenter",
                            "onmouseleave",
                        ],
                    });

                    const withSafeLinks = sanitized.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer nofollow" ');
                    const withResponsiveImgs = withSafeLinks.replace(/<img\s/gi, '<img loading="lazy" style="max-width:100%;height:auto;" ');

                    return (
                        <div
                            style={{
                                minHeight: 200,
                                padding: 16,
                                backgroundColor: "#fafafa",
                                borderRadius: 6,
                                lineHeight: 1.6,
                                overflowX: "auto",
                            }}
                            dangerouslySetInnerHTML={{ __html: withResponsiveImgs }}
                        />
                    );
                } else {
                    return (
                        <div style={{
                            minHeight: 200,
                            padding: 16,
                            backgroundColor: "#fafafa",
                            borderRadius: 6,
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6
                        }}>
                            {email.body}
                        </div>
                    );
                }
            })()}

            {/* Attachments Section */}
            {email.hasAttachment && email.attachments && email.attachments.length > 0 && (
                <div style={{ marginTop: 16 }}>
                    <Divider />
                    <Text strong>Attachments:</Text>
                    <div style={{ marginTop: 8 }}>
                        {email.attachments.map((attachment, index) => (
                            <div key={index} style={{ marginBottom: 4 }}>
                                <Button 
                                    type="link" 
                                    icon={<FontAwesomeIcon icon={faPaperclip} />}
                                    onClick={() => handleDownloadAttachment(attachment)}
                                    loading={downloadingAttachment === `${attachment.attachmentId}_${index}`}
                                >
                                    {attachment.filename} ({formatFileSize(attachment.size)})
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
                <Divider />
                <Row justify="end">
                    <Col>
                        <Space>
                            {buttonPermissions['M-04-REPLY'] && (
                                <Button 
                                    type="primary" 
                                    icon={<FontAwesomeIcon icon={faReply} />}
                                    onClick={() => handleAction("reply")}
                                >
                                    Reply
                                </Button>
                            )}
                            {buttonPermissions['M-04-FORWARD'] && (
                                <Button 
                                    icon={<FontAwesomeIcon icon={faForward} />}
                                    onClick={() => handleAction("forward")}
                                >
                                    Forward
                                </Button>
                            )}
                            {email.folder === 'spam' ? (
                                <Button 
                                    type="primary"
                                    loading={reportingNotSpam}
                                    icon={<FontAwesomeIcon icon={faShieldCheck} />}
                                    onClick={() => handleAction("reportNotSpam")}
                                >
                                    {reportingNotSpam ? 'Reporting Not Spam...' : 'Report Not Spam'}
                                </Button>
                            ) : (
                                buttonPermissions['M-04-SPAM'] && (
                                    <Button 
                                        danger 
                                        loading={markingAsSpam}
                                        icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
                                        onClick={() => handleAction("spam")}
                                    >
                                        {markingAsSpam ? 'Marking as Spam...' : 'Mark as Spam'}
                                    </Button>
                                )
                            )}
                        </Space>
                    </Col>
                </Row>
            </Card>
        </Modal>
    );
}