import { Modal, Form, Row, Col, Button, Space, Typography, Upload, message, List, Tag, Select, Divider } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
    faClose, 
    faPaperPlane, 
    faFloppyDisk,
    faPaperclip,
    faTrash,
    faFile,
    faEye
} from "@fortawesome/pro-regular-svg-icons";
import { useState, useEffect } from "react";

import FloatInput from "../../../../../../providers/FloatInput";
import FloatTinyMCESimple from "../../../../../../providers/FloatTinyMCESimple";
import { GET } from "../../../../../../providers/useAxiosQuery";
import EmailMentionSelect from "./EmailMentionSelect";

const { Title } = Typography;

export default function ComposeEmailModal({ open, onClose, onEmailSent, onDraftSaved, replyData, draftData, initialData }) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [savingDraft, setSavingDraft] = useState(false);
    const [attachments, setAttachments] = useState([]);
    const [userBodyContent, setUserBodyContent] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [originalMessage, setOriginalMessage] = useState(null);
    const [showOriginalMessage, setShowOriginalMessage] = useState(false);
    const [showCC, setShowCC] = useState(false);
    const [showBCC, setShowBCC] = useState(false);

    // Fetch default banners
    const { data: defaultBannersData } = GET(
        "api/default_banners",
        "default_banners"
    );


    // Convert image to base64 for email embedding
    const getImageAsBase64 = async (imagePath) => {
        try {
            const response = await fetch(imagePath);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (error) {
            console.error('Error converting image to base64:', error);
            return null;
        }
    };

    // Build complete email body with header banner + user content + footer banner
    const buildCompleteEmailBody = async (userContent) => {
        if (!defaultBannersData?.data) {
            return userContent; // Return user content as-is if no default banners
        }

        const { header_images, footer_images } = defaultBannersData.data;
        let completeBody = '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: transparent;">';

        // Add header banner
        if (header_images && header_images.length > 0) {
            completeBody += '<div style="text-align: center; margin-bottom: 20px;">';
            for (const image of header_images) {
                const base64Image = await getImageAsBase64(image.file_path);
                if (base64Image) {
                    const dimensions = image.image_dimensions;
                    const width = dimensions?.width ? dimensions.width + 'px' : '100%';
                    const height = dimensions?.height ? dimensions.height + 'px' : 'auto';
                    
                    completeBody += '<img src="' + base64Image + '" alt="Header Banner" style="width: ' + width + '; height: ' + height + '; object-fit: contain; background-color: transparent; display: inline-block; margin-bottom: 8px;" />';
                }
            }
            completeBody += '</div>';
        }

        // Add user content
        completeBody += '<div style="padding: 20px 0;">';
        completeBody += userContent || '';
        completeBody += '</div>';

        // Add footer banner
        if (footer_images && footer_images.length > 0) {
            completeBody += '<div style="text-align: center; margin-top: 20px;">';
            for (const image of footer_images) {
                const base64Image = await getImageAsBase64(image.file_path);
                if (base64Image) {
                    const dimensions = image.image_dimensions;
                    const width = dimensions?.width ? dimensions.width + 'px' : '100%';
                    const height = dimensions?.height ? dimensions.height + 'px' : 'auto';
                    
                    completeBody += '<img src="' + base64Image + '" alt="Footer Banner" style="width: ' + width + '; height: ' + height + '; object-fit: contain; background-color: transparent; display: inline-block; margin-bottom: 8px;" />';
                }
            }
            completeBody += '</div>';
        }

        completeBody += '</div>';
        return completeBody;
    };

    // Pre-fill form when replyData, draftData, or initialData is provided
    useEffect(() => {
        if (open && replyData) {
            console.log('Pre-filling form with reply data:', replyData);
            
            // Only set fields that have values
            const fieldsToSet = {};
            if (replyData.to) fieldsToSet.to = replyData.to;
            if (replyData.subject) fieldsToSet.subject = replyData.subject;
            if (replyData.cc) fieldsToSet.cc = replyData.cc;
            if (replyData.bcc) fieldsToSet.bcc = replyData.bcc;
            
            form.setFieldsValue(fieldsToSet);
            setUserBodyContent(replyData.body || '');
            
            // Show CC/BCC fields if they have content
            setShowCC(!!(replyData.cc && replyData.cc.trim()));
            setShowBCC(!!(replyData.bcc && replyData.bcc.trim()));
            
            // Set original message if available
            if (replyData.originalMessage) {
                setOriginalMessage(replyData.originalMessage);
            } else {
                setOriginalMessage(null);
            }
        } else if (open && draftData) {
            console.log('Pre-filling form with draft data:', draftData);
            
            // Only set fields that have actual content (not empty strings)
            const fieldsToSet = {};
            if (draftData.to && draftData.to.trim()) fieldsToSet.to = draftData.to;
            if (draftData.cc && draftData.cc.trim()) fieldsToSet.cc = draftData.cc;
            if (draftData.bcc && draftData.bcc.trim()) fieldsToSet.bcc = draftData.bcc;
            if (draftData.subject && draftData.subject.trim()) fieldsToSet.subject = draftData.subject;
            
            form.setFieldsValue(fieldsToSet);
            setUserBodyContent(draftData.body || '');
            
            // Show CC/BCC fields if they have content
            setShowCC(!!(draftData.cc && draftData.cc.trim()));
            setShowBCC(!!(draftData.bcc && draftData.bcc.trim()));
        } else if (open && initialData) {
            console.log('Pre-filling form with initial data:', initialData);
            form.setFieldsValue({
                to: initialData.to || ''
            });
            setUserBodyContent(initialData.body || '');
            setOriginalMessage(null);
            setShowCC(false);
            setShowBCC(false);
        } else if (open) {
            // Reset when opening modal without any data
            setUserBodyContent('');
            setOriginalMessage(null);
            setShowCC(false);
            setShowBCC(false);
        }
    }, [open, replyData, draftData, initialData, form]);

    // Handle modal close - reset form and state
    const handleClose = () => {
        form.resetFields();
        setUserBodyContent('');
        setAttachments([]);
        setShowPreview(false);
        setPreviewContent('');
        setOriginalMessage(null);
        setShowOriginalMessage(false);
        setShowCC(false);
        setShowBCC(false);
        onClose();
    };

    // Handle preview toggle
    const handlePreview = async () => {
        if (!showPreview) {
            const completeBody = await buildCompleteEmailBody(userBodyContent);
            setPreviewContent(completeBody);
        }
        setShowPreview(!showPreview);
    };

    const handleSend = async (values) => {
        setLoading(true);
        try {
            // Build complete email body with header and footer banners
            const completeBody = await buildCompleteEmailBody(userBodyContent);

            // Prepare email data with attachments
            // Convert arrays to comma-separated strings for backend compatibility
            const emailData = {
                ...values,
                body: completeBody, // Use the complete body with banners
                to: Array.isArray(values.to) ? values.to.join(',') : (values.to || ''),
                cc: Array.isArray(values.cc) ? values.cc.join(',') : (values.cc || ''),
                bcc: Array.isArray(values.bcc) ? values.bcc.join(',') : (values.bcc || ''),
                attachments: attachments.map(file => ({
                    filename: file.name,
                    content: file.base64,
                    contentType: file.type
                }))
            };

            // If we're sending an existing draft, include the draft ID so it can be deleted
            if (draftData?.draftId) {
                emailData.draftId = draftData.draftId;
            }


            const response = await fetch('/api/gmail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
            });

            const result = await response.json();
            
            if (response.ok && result.success) {
                message.success('Email sent successfully!');
                handleClose();
                
                // Callback to parent to refresh email list
                if (onEmailSent) {
                    onEmailSent();
                }
            } else {
                throw new Error(result.message || 'Failed to send email');
            }
        } catch (error) {
            message.error(`Failed to send email: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        setSavingDraft(true);
        try {
            const values = form.getFieldsValue();
            
            // Only save if there's at least some content
            if (!values.to && !values.subject && !userBodyContent) {
                message.warning('Nothing to save. Please add some content first.');
                return;
            }

            // Build complete email body with header and footer banners
            const completeBody = await buildCompleteEmailBody(userBodyContent);

            // Prepare draft data with attachments
            // Convert arrays to comma-separated strings for backend compatibility
            const draftDataPayload = {
                ...values,
                body: completeBody, // Use the complete body with banners
                to: Array.isArray(values.to) ? values.to.join(',') : (values.to || ''),
                cc: Array.isArray(values.cc) ? values.cc.join(',') : (values.cc || ''),
                bcc: Array.isArray(values.bcc) ? values.bcc.join(',') : (values.bcc || ''),
                attachments: attachments.map(file => ({
                    filename: file.name,
                    content: file.base64,
                    contentType: file.type
                })),
                isDraft: true
            };

            // If we're editing an existing draft, include the draft ID for updating
            if (draftData?.draftId) {
                draftDataPayload.draftId = draftData.draftId;
            }


            const response = await fetch('/api/gmail/save-draft', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(draftDataPayload)
            });

            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                // If JSON parsing fails, it means server returned HTML (likely 500 error page)
                console.error('JSON parsing failed. Server likely returned HTML error page.');
                console.error('Response status:', response.status);
                console.error('Response text preview:', await response.text().then(text => text.substring(0, 200)));
                throw new Error(`Server error (${response.status}). Check server logs for details.`);
            }
            
            if (response.ok && result.success) {
                message.success('Draft saved successfully!');
                handleClose();
                
                // Callback to parent to refresh draft folder
                if (onDraftSaved) {
                    onDraftSaved();
                }
            } else {
                throw new Error(result.message || 'Failed to save draft');
            }
        } catch (error) {
            message.error(`Failed to save draft: ${error.message}`);
        } finally {
            setSavingDraft(false);
        }
    };

    // File attachment handling
    const handleFileUpload = (info) => {
        const { file } = info;
        
        console.log('File upload info:', info);
        console.log('File object:', file);
        
        if (file.status === 'uploading') {
            return;
        }

        // Convert file to base64
        const reader = new FileReader();
        reader.onload = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:type;base64, prefix
            const newAttachment = {
                uid: file.uid,
                name: file.name,
                type: file.type,
                size: file.size,
                base64: base64
            };

            console.log('New attachment created:', newAttachment);
            console.log('Base64 length:', base64.length);

            setAttachments(prev => {
                const updated = [...prev, newAttachment];
                console.log('Updated attachments:', updated);
                return updated;
            });
            message.success(`${file.name} attached successfully`);
        };
        reader.onerror = () => {
            console.error('FileReader error for file:', file.name);
            message.error(`Failed to attach ${file.name}`);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveAttachment = (uid) => {
        setAttachments(prev => prev.filter(file => file.uid !== uid));
        message.success('Attachment removed');
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Custom upload props
    const uploadProps = {
        name: 'file',
        multiple: true,
        beforeUpload: () => false, // Prevent auto upload
        onChange: handleFileUpload,
        showUploadList: false,
        accept: '*/*'
    };

    return (
        <Modal
            title={
                <Space>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    <Title level={4} style={{ margin: 0 }}>
                        Compose Email
                    </Title>
                </Space>
            }
            open={open}
            onCancel={handleClose}
            footer={null}
            width={800}
            closeIcon={<FontAwesomeIcon icon={faClose} />}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSend}
                style={{ marginTop: 16 }}
            >
                {/* Recipients */}
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <Form.Item
                            name="to"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) {
                                            return Promise.reject(new Error('Please enter at least one recipient email'));
                                        }
                                        
                                        // Handle both array and string values
                                        const emailsToValidate = Array.isArray(value) ? value : [value];
                                        
                                        // Filter out mention tokens (they will be expanded)
                                        const regularEmails = emailsToValidate.filter(email => !email.startsWith('@'));
                                        
                                        // Validate each regular email address
                                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                        const invalidEmails = regularEmails.filter(email => !emailRegex.test(email.trim()));
                                        
                                        if (invalidEmails.length > 0) {
                                            return Promise.reject(new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`));
                                        }
                                        
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <EmailMentionSelect
                                placeholder="Type email addresses or @mentions (e.g., @all, @students)"
                                disabled={false} // Keep enabled for replies and forwards
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* CC Field - Only show when enabled */}
                {showCC && (
                    <Row gutter={[16, 0]}>
                        <Col span={24}>
                            <Form.Item 
                                name="cc"
                            rules={[
                                {
                                    validator: (_, value) => {
                                        if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) {
                                            return Promise.resolve();
                                        }
                                        
                                        // Handle both array and string values
                                        const emailsToValidate = Array.isArray(value) ? value : [value];
                                        
                                        // Validate each email address
                                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                        const invalidEmails = emailsToValidate.filter(email => !emailRegex.test(email.trim()));
                                        
                                        if (invalidEmails.length > 0) {
                                            return Promise.reject(new Error(`Invalid CC email addresses: ${invalidEmails.join(', ')}`));
                                        }
                                        
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <EmailMentionSelect
                                placeholder="CC (Optional) - Type email addresses or @mentions"
                                size="large"
                            />
                        </Form.Item>
                        </Col>
                    </Row>
                )}

                {/* BCC Field - Only show when enabled */}
                {showBCC && (
                    <Row gutter={[16, 0]}>
                        <Col span={24}>
                            <Form.Item 
                                name="bcc"
                                rules={[
                                    {
                                        validator: (_, value) => {
                                            if (!value || (Array.isArray(value) && value.length === 0) || (typeof value === 'string' && !value.trim())) {
                                                return Promise.resolve();
                                            }
                                            
                                            // Handle both array and string values
                                            const emailsToValidate = Array.isArray(value) ? value : [value];
                                            
                                            // Validate each email address
                                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                                            const invalidEmails = emailsToValidate.filter(email => !emailRegex.test(email.trim()));
                                            
                                            if (invalidEmails.length > 0) {
                                                return Promise.reject(new Error(`Invalid BCC email addresses: ${invalidEmails.join(', ')}`));
                                            }
                                            
                                            return Promise.resolve();
                                        }
                                    }
                                ]}
                            >
                                <EmailMentionSelect
                                    placeholder="BCC (Optional) - Type email addresses or @mentions"
                                    size="large"
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                )}

                {/* Subject */}
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <Form.Item
                            name="subject"
                            rules={[{ required: true, message: "Please enter email subject" }]}
                        >
                            <FloatInput 
                                placeholder="Enter email subject" 
                                label="Subject" 
                                disabled={!!(replyData)} // Disable for both replies and forwards
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* CC/BCC Toggle Buttons - Positioned below subject, aligned right */}
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <div style={{ 
                            display: 'flex', 
                            justifyContent: 'flex-end', 
                            gap: 8, 
                            marginBottom: 16,
                            paddingRight: 0
                        }}>
                            {!showCC && (
                                <Button 
                                    type="link" 
                                    size="small" 
                                    onClick={() => setShowCC(true)}
                                    style={{ 
                                        padding: '0 8px', 
                                        height: 'auto', 
                                        color: '#1890ff',
                                        fontSize: '14px'
                                    }}
                                >
                                    Cc
                                </Button>
                            )}
                            {!showBCC && (
                                <Button 
                                    type="link" 
                                    size="small" 
                                    onClick={() => setShowBCC(true)}
                                    style={{ 
                                        padding: '0 8px', 
                                        height: 'auto', 
                                        color: '#1890ff',
                                        fontSize: '14px'
                                    }}
                                >
                                    Bcc
                                </Button>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* Email Body */}
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <div style={{ marginBottom: 16 }}>
                            <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                Email Body
                            </Typography.Text>
                            <Typography.Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
                                Header and footer banners will be automatically added when sending
                            </Typography.Text>
                        </div>
                        <FloatTinyMCESimple 
                            placeholder="Write your email message here..."
                            height={300}
                            value={userBodyContent}
                            onChange={(content) => {
                                setUserBodyContent(content);
                                // Also update the form field for validation
                                form.setFieldValue('body', content);
                            }}
                        />
                        <Form.Item
                            name="body"
                            hidden
                            rules={[{ required: true, message: "Please enter email body" }]}
                        >
                            <input type="hidden" />
                        </Form.Item>
                        


                        {/* Preview Section */}
                        {showPreview && (
                            <div style={{ marginTop: 16, border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px', backgroundColor: '#fafafa' }}>
                                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                    Email Preview (with Header & Footer Banners)
                                </Typography.Text>
                                <div 
                                    style={{ 
                                        backgroundColor: '#fff', 
                                        padding: '20px', 
                                        border: '1px solid #e8e8e8', 
                                        borderRadius: '4px',
                                        maxHeight: '400px',
                                        overflowY: 'auto'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: previewContent }}
                                />
                            </div>
                        )}

                        {/* Original Message Section (for replies and forwards) */}
                        {originalMessage && (
                            <div style={{ 
                                marginTop: 16, 
                                border: '1px solid #e8e8e8', 
                                borderRadius: '6px', 
                                backgroundColor: '#fafafa' 
                            }}>
                                <div 
                                    style={{ 
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        borderBottom: showOriginalMessage ? '1px solid #e8e8e8' : 'none',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                    onClick={() => setShowOriginalMessage(!showOriginalMessage)}
                                >
                                    <Typography.Text style={{ color: '#666', fontSize: '13px' }}>
                                        {replyData?.isForward 
                                            ? `--- Forwarded message from ${originalMessage.from} on ${originalMessage.date} ---`
                                            : `--- On ${originalMessage.date}, ${originalMessage.from} wrote: ---`
                                        }
                                    </Typography.Text>
                                    <Typography.Text style={{ color: '#1890ff', fontSize: '12px' }}>
                                        {showOriginalMessage ? 'Hide' : 'Show'} {replyData?.isForward ? 'original message' : 'quoted text'}
                                    </Typography.Text>
                                </div>
                                
                                {showOriginalMessage && (
                                    <div style={{ 
                                        padding: '16px',
                                        backgroundColor: '#fff',
                                        maxHeight: '300px',
                                        overflowY: 'auto',
                                        fontSize: '13px',
                                        lineHeight: '1.5',
                                        color: '#666'
                                    }}>
                                        {replyData?.isForward && (
                                            <div style={{ marginBottom: '12px', fontSize: '12px' }}>
                                                <div><strong>Subject:</strong> {originalMessage.subject}</div>
                                                <div><strong>From:</strong> {originalMessage.from}</div>
                                                <div><strong>To:</strong> {originalMessage.to}</div>
                                                <div style={{ height: '8px' }}></div>
                                            </div>
                                        )}
                                        
                                        {(() => {
                                            // Check if content contains HTML tags
                                            const hasHtmlTags = /<[^>]+>/.test(originalMessage.content);
                                            
                                            if (hasHtmlTags) {
                                                // Render as HTML with basic sanitization
                                                const sanitized = originalMessage.content
                                                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                                                    .replace(/on\w+="[^"]*"/g, '');
                                                
                                                return (
                                                    <div 
                                                        dangerouslySetInnerHTML={{ __html: sanitized }}
                                                        style={{ wordBreak: 'break-word' }}
                                                    />
                                                );
                                            } else {
                                                // Render as plain text
                                                return (
                                                    <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                                        {originalMessage.content}
                                                    </div>
                                                );
                                            }
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}
                    </Col>
                </Row>

                {/* Attachments */}
                <Row gutter={[16, 0]}>
                    <Col span={24}>
                        <Upload {...uploadProps}>
                            <Button 
                                type="dashed" 
                                icon={<FontAwesomeIcon icon={faPaperclip} />}
                                style={{ marginBottom: 16 }}
                            >
                                Add Attachment
                            </Button>
                        </Upload>
                        
                        {/* Display attached files */}
                        {attachments.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
                                    Attachments ({attachments.length}):
                                </Typography.Text>
                                <List
                                    size="small"
                                    dataSource={attachments}
                                    renderItem={(file) => (
                                        <List.Item
                                            actions={[
                                                <Button
                                                    key="remove"
                                                    type="text"
                                                    size="small"
                                                    danger
                                                    icon={<FontAwesomeIcon icon={faTrash} />}
                                                    onClick={() => handleRemoveAttachment(file.uid)}
                                                />
                                            ]}
                                        >
                                            <List.Item.Meta
                                                avatar={<FontAwesomeIcon icon={faFile} />}
                                                title={file.name}
                                                description={
                                                    <Space>
                                                        <Tag color="blue">{formatFileSize(file.size)}</Tag>
                                                        <Tag>{file.type || 'Unknown type'}</Tag>
                                                    </Space>
                                                }
                                            />
                                        </List.Item>
                                    )}
                                />
                            </div>
                        )}
                    </Col>
                </Row>

                {/* Action Buttons */}
                <Row justify="end" gutter={[8, 0]}>
                    <Col>
                        <Button onClick={handleClose}>
                            Cancel
                        </Button>
                    </Col>
                    <Col>
                        <Button 
                            icon={<FontAwesomeIcon icon={faFloppyDisk} />}
                            onClick={handleSaveDraft}
                            loading={savingDraft}
                            disabled={loading}
                        >
                            {savingDraft ? 'Saving...' : 'Save Draft'}
                        </Button>
                    </Col>
                    <Col>
                        <Button 
                            type="primary" 
                            htmlType="submit"
                            loading={loading}
                            disabled={savingDraft}
                            icon={<FontAwesomeIcon icon={faPaperPlane} />}
                        >
                            {loading ? 'Sending...' : 'Send Email'}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}