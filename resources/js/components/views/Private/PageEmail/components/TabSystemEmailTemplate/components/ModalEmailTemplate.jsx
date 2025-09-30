import React, { useContext, useEffect, useState } from "react";
import { Modal, Form, Button, Typography, Row, Col, Tabs, Switch, message, Card, List, Tag, Alert, Divider, Space, Tooltip } from "antd";
import { faClose, faInfoCircle, faCopy, faLightbulb } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FloatInput from "../../../../../../providers/FloatInput";
import FloatSelect from "../../../../../../providers/FloatSelect";
import FloatTinyMCESimple from "../../../../../../providers/FloatTinyMCESimple";
import ImageUploader from "./ImageUploader";
import { POST, GET } from "../../../../../../providers/useAxiosQuery";
import PageEmailContext from "./PageEmailContext";

export default function ModalEmailTemplate() {
    const { toggleModalForm, setToggleModalForm, refetchSource } = useContext(PageEmailContext);
    const [form] = Form.useForm();
    const [activeTab, setActiveTab] = useState("1");
    const [previewMode, setPreviewMode] = useState(false);
    const [existingTemplates, setExistingTemplates] = useState([]);
    const [headerImages, setHeaderImages] = useState([]);
    const [footerImages, setFooterImages] = useState([]);

    // Template type options
    // Fetch template types from API
    const { data: templateTypesData } = GET(
        "api/email_template/types",
        "email_template_types"
    );

    const templateTypeOptions = templateTypesData?.data ? 
        Object.entries(templateTypesData.data).map(([value, label]) => ({ value, label })) : 
        [
            { value: "verification_result_success", label: "Verification Result (Success)" },
            { value: "verification_result_revoked", label: "Verification Result (Revoked)" },
            // { value: "two_factor_auth", label: "Two-Factor Authentication" },
            // { value: "auto_reply", label: "Auto-Reply" },
        ];

    // Save template mutation
    const saveTemplate = POST(
        "api/email_template",
        "email_templates_list",
        true,
        () => {
            message.success(toggleModalForm.data ? "Template updated successfully" : "Template created successfully");
            refetchSource();
            handleCancel();
        },
        (error) => {
            // Handle validation errors, especially duplicate template type
            if (error.response?.status === 422) {
                const errorMessage = error.response.data?.message || "Validation failed";
                const errors = error.response.data?.errors || {};
                
                // Show specific error message
                message.error(errorMessage);
                
                // Set form field errors if available
                if (errors.template_type) {
                    form.setFields([{
                        name: 'template_type',
                        errors: errors.template_type
                    }]);
                }
            }
        }
    );

    // Send test email mutation
    const sendTestEmailMutation = POST(
        "api/email_template/send_test",
        "send_test_email",
        false,
        (response) => {
            // Show success message with profile information if available
            const successMessage = response.data?.message || `Test email sent successfully to castrodesjohnpaul@gmail.com`;
            message.success(successMessage);
        }
    );

    // Fetch existing templates for header/footer reuse
    const { data: templatesData } = GET(
        "api/email_template?page_size=100&system_id=3",
        "email_templates_for_reuse"
    );

    // Fetch default banners
    const { data: defaultBannersData } = GET(
        "api/default_banners",
        "default_banners"
    );

    useEffect(() => {
        if (toggleModalForm.open) {
            if (toggleModalForm.data) {
                form.setFieldsValue({
                    ...toggleModalForm.data,
                    is_active: toggleModalForm.data.is_active ?? true,
                });
                
                // Load existing images from attachments
                if (toggleModalForm.data.header_images) {
                    setHeaderImages(toggleModalForm.data.header_images.map(img => ({
                        id: img.id, // Add the attachment ID
                        uid: img.id,
                        name: img.file_name,
                        status: 'done',
                        url: img.file_path,
                        file_path: img.file_path,
                        file_name: img.file_name,
                        file_size: img.file_size,
                        dimensions: img.image_dimensions
                    })));
                } else {
                    setHeaderImages([]);
                }
                
                if (toggleModalForm.data.footer_images) {
                    setFooterImages(toggleModalForm.data.footer_images.map(img => ({
                        id: img.id, // Add the attachment ID
                        uid: img.id,
                        name: img.file_name,
                        status: 'done',
                        url: img.file_path,
                        file_path: img.file_path,
                        file_name: img.file_name,
                        file_size: img.file_size,
                        dimensions: img.image_dimensions
                    })));
                } else {
                    setFooterImages([]);
                }
            } else {
                form.setFieldsValue({
                    template_type: "verification_result_success",
                    is_active: true,
                    system_id: 3,
                });
                setHeaderImages([]);
                setFooterImages([]);
            }
        } else {
            form.resetFields();
            setActiveTab("1");
            setPreviewMode(false);
            setHeaderImages([]);
            setFooterImages([]);
        }
    }, [toggleModalForm.open, form]);

    useEffect(() => {
        if (templatesData?.data?.data) {
            setExistingTemplates(templatesData.data.data);
        }
    }, [templatesData]);

    const handleCancel = () => {
        setToggleModalForm({ open: false, data: null });
        form.resetFields();
        setActiveTab("1");
        setPreviewMode(false);
    };

    const handleSubmit = (values) => {
        // Force TinyMCE to save content to the form field before submission
        if (window.tinymce) {
            window.tinymce.triggerSave();
            // Try to get any active TinyMCE editor
            const editors = window.tinymce.editors;
            if (editors && editors.length > 0) {
                // Get the first (and likely only) editor
                const editor = editors[0];
                if (editor) {
                    const bodyContent = editor.getContent();
                    if (bodyContent) {
                        values.body = bodyContent;
                        // Also update the form field
                        form.setFieldValue('body', bodyContent);
                    }
                }
            }
        }

        // Debug: Log the values to see what's being sent
        console.log('Form values before submission:', values);

        // Validate required fields manually
        if (!values.title || values.title.trim() === '') {
            message.error('Title is required');
            return;
        }
        if (!values.subject || values.subject.trim() === '') {
            message.error('Subject is required');
            return;
        }
        if (!values.body || values.body.trim() === '' || values.body === '<p></p>' || values.body === '<p><br></p>') {
            message.error('Body content is required');
            return;
        }

        const formData = new FormData();
        
        // Add basic form data
        Object.keys(values).forEach(key => {
            if (values[key] !== undefined && values[key] !== null) {
                // Convert boolean values to string for FormData
                if (typeof values[key] === 'boolean') {
                    formData.append(key, values[key] ? '1' : '0');
                } else {
                    formData.append(key, values[key]);
                }
            }
        });
        
        // Add system_id if not present
        if (!values.system_id) {
            formData.append('system_id', 3);
        }

        if (toggleModalForm.data?.id) {
            formData.append('id', toggleModalForm.data.id);
        }

        // Add header images (new uploads)
        let headerImageIndex = 0;
        headerImages.forEach((image) => {
            if (image.file) {
                formData.append(`header_images[]`, image.file);
                if (image.dimensions) {
                    formData.append(`header_image_dimensions[${headerImageIndex}][width]`, image.dimensions.width);
                    formData.append(`header_image_dimensions[${headerImageIndex}][height]`, image.dimensions.height);
                }
                headerImageIndex++;
            }
        });

        // Add existing header images with updated dimensions
        headerImages.forEach((image) => {
            if (!image.file && image.id && image.dimensions && !image.isDefault) {
                console.log('Sending existing header image dimensions:', image.id, image.dimensions);
                formData.append(`existing_header_images[${image.id}][width]`, image.dimensions.width);
                formData.append(`existing_header_images[${image.id}][height]`, image.dimensions.height);
            }
        });

        // Add footer images (new uploads)
        let footerImageIndex = 0;
        footerImages.forEach((image) => {
            if (image.file) {
                formData.append(`footer_images[]`, image.file);
                if (image.dimensions) {
                    formData.append(`footer_image_dimensions[${footerImageIndex}][width]`, image.dimensions.width);
                    formData.append(`footer_image_dimensions[${footerImageIndex}][height]`, image.dimensions.height);
                }
                footerImageIndex++;
            }
        });

        // Add existing footer images with updated dimensions
        footerImages.forEach((image) => {
            if (!image.file && image.id && image.dimensions && !image.isDefault) {
                console.log('Sending existing footer image dimensions:', image.id, image.dimensions);
                formData.append(`existing_footer_images[${image.id}][width]`, image.dimensions.width);
                formData.append(`existing_footer_images[${image.id}][height]`, image.dimensions.height);
            }
        });

        // Add default header images
        const defaultHeaderImages = headerImages.filter(image => image.isDefault);
        defaultHeaderImages.forEach((image, index) => {
            formData.append(`default_header_images[${index}][id]`, image.id);
            if (image.dimensions) {
                formData.append(`default_header_images[${index}][dimensions][width]`, image.dimensions.width);
                formData.append(`default_header_images[${index}][dimensions][height]`, image.dimensions.height);
            }
        });

        // Add default footer images
        const defaultFooterImages = footerImages.filter(image => image.isDefault);
        defaultFooterImages.forEach((image, index) => {
            formData.append(`default_footer_images[${index}][id]`, image.id);
            if (image.dimensions) {
                formData.append(`default_footer_images[${index}][dimensions][width]`, image.dimensions.width);
                formData.append(`default_footer_images[${index}][dimensions][height]`, image.dimensions.height);
            }
        });

        saveTemplate.mutate(formData);
    };

    const handleTestSend = () => {
        // Validate the form before sending test
        form.validateFields(['title', 'subject', 'body', 'template_type'])
            .then((values) => {
                // Include template ID if editing existing template
                const testData = {
                    ...values,
                    template_id: toggleModalForm.data?.id || null
                };
                
                // Send test email with current form values
                sendTestEmailMutation.mutate(testData);
            })
            .catch((error) => {
                message.error('Please fill in all required fields before sending test email');
                console.error('Validation failed:', error);
            });
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            message.success('Variable copied to clipboard!');
        }).catch(() => {
            message.error('Failed to copy variable');
        });
    };

    const reuseHeaderFooter = (templateId, type) => {
        const template = existingTemplates.find(t => t.id === templateId);
        if (template) {
            const currentValues = form.getFieldsValue();
            if (type === 'header') {
                form.setFieldsValue({
                    ...currentValues,
                    header: template.header
                });
                message.success('Header reused successfully!');
            } else if (type === 'footer') {
                form.setFieldsValue({
                    ...currentValues,
                    footer: template.footer
                });
                message.success('Footer reused successfully!');
            }
        }
    };

    const reuseImages = (templateId, type) => {
        const template = existingTemplates.find(t => t.id === templateId);
        if (template) {
            if (type === 'header' && template.header_images) {
                const reusedImages = template.header_images.map(img => ({
                    uid: `reused_${img.id}`,
                    name: img.file_name,
                    status: 'done',
                    url: img.file_path,
                    file_path: img.file_path,
                    file_name: img.file_name,
                    file_size: img.file_size,
                    dimensions: img.image_dimensions
                }));
                setHeaderImages([...headerImages, ...reusedImages]);
                message.success(`${reusedImages.length} header image(s) reused successfully!`);
            } else if (type === 'footer' && template.footer_images) {
                const reusedImages = template.footer_images.map(img => ({
                    uid: `reused_${img.id}`,
                    name: img.file_name,
                    status: 'done',
                    url: img.file_path,
                    file_path: img.file_path,
                    file_name: img.file_name,
                    file_size: img.file_size,
                    dimensions: img.image_dimensions
                }));
                setFooterImages([...footerImages, ...reusedImages]);
                message.success(`${reusedImages.length} footer image(s) reused successfully!`);
            }
        }
    };

    const useDefaultBanner = (type) => {
        if (!defaultBannersData?.data) {
            message.warning('No default banners configured. Please setup default banners first.');
            return;
        }

        const defaultData = defaultBannersData.data;
        if (type === 'header' && defaultData.header_images) {
            setHeaderImages(defaultData.header_images.map(img => ({
                id: img.id,
                uid: `default_${img.id}`,
                name: img.file_name,
                status: 'done',
                url: img.file_path,
                file_path: img.file_path,
                file_name: img.file_name,
                file_size: img.file_size,
                dimensions: img.image_dimensions,
                isDefault: true // Flag to identify default banner images
            })));
            message.success('Default header banner has been loaded');
        } else if (type === 'footer' && defaultData.footer_images) {
            setFooterImages(defaultData.footer_images.map(img => ({
                id: img.id,
                uid: `default_${img.id}`,
                name: img.file_name,
                status: 'done',
                url: img.file_path,
                file_path: img.file_path,
                file_name: img.file_name,
                file_size: img.file_size,
                dimensions: img.image_dimensions,
                isDefault: true // Flag to identify default banner images
            })));
            message.success('Default footer banner has been loaded');
        } else {
            message.warning(`No default ${type} banner configured`);
        }
    };

    const renderGuideTab = () => {
        const variables = [
            {
                category: "User Information",
                items: [
                    { variable: "[user:name]", description: "Full name of the user", example: "John Doe" },
                    { variable: "[user:account]", description: "User account/username", example: "john.doe@urios.edu.ph" },
                    { variable: "[user:password]", description: "Temporary password for new accounts", example: "TempPass123" },
                ]
            },
            {
                category: "Authentication",
                items: [
                    { variable: "[auth:code]", description: "Two-factor authentication code", example: "123456" },
                    { variable: "[auth:expiry]", description: "Code expiration time", example: "10 minutes" },
                ]
            },
            {
                category: "Document Verification",
                items: [
                    { variable: "[document:type]", description: "Type of document being verified", example: "Transcript of Records" },
                    { variable: "[verification:status]", description: "Verification result", example: "Verified" },
                    { variable: "[verification:date]", description: "Date of verification", example: "September 12, 2025" },
                    { variable: "[document:revocation_reason]", description: "Reason for document revocation (only for revoked documents)", example: "Validity period lapsed" },
                    { variable: "[document:revocation_date]", description: "Date when document was revoked", example: "September 15, 2025" },
                ]
            },
            {
                category: "Message System",
                items: [
                    { variable: "[message:reference]", description: "Message reference number", example: "MSG-2025-001234" },
                    { variable: "[message:date]", description: "Date message was received", example: "September 12, 2025" },
                ]
            },
            {
                category: "Academic Information",
                items: [
                    { variable: "[profile:grades]", description: "Student's academic grades organized by year and semester (HTML table format)", example: "Displays tables with subject codes and grades" },
                ]
            },
            {
                category: "System Information",
                items: [
                    { variable: "[system:date]", description: "Current system date", example: "September 12, 2025" },
                    { variable: "[system:time]", description: "Current system time", example: "10:30 AM" },
                ]
            }
        ];

        return (
            <div className="template-guide-tab" style={{ maxHeight: "450px", overflowY: "auto" }}>
                <Alert
                    message="Email Template Guide"
                    description="This guide helps you create professional email templates with dynamic content. Use the variables below to personalize your emails."
                    type="info"
                    icon={<FontAwesomeIcon icon={faLightbulb} />}
                    style={{ marginBottom: "20px" }}
                />

                <Typography.Title level={5}>
                    <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: "8px" }} />
                    Available Variables
                </Typography.Title>

                {variables.map((category, index) => (
                    <Card 
                        key={index}
                        size="small" 
                        title={category.category} 
                        className="variable-category-card"
                        style={{ marginBottom: "16px" }}
                    >
                        <List
                            dataSource={category.items}
                            renderItem={(item) => (
                                <List.Item className="variable-item">
                                    <div style={{ width: "100%" }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ flex: 1 }}>
                                                <Tag 
                                                    color="blue" 
                                                    className="variable-tag"
                                                    style={{ marginBottom: "4px", cursor: "pointer" }}
                                                    onClick={() => copyToClipboard(item.variable)}
                                                >
                                                    {item.variable}
                                                </Tag>
                                                <Typography.Text className="variable-description" style={{ display: "block" }}>
                                                    {item.description}
                                                </Typography.Text>
                                                <Typography.Text className="variable-example" style={{ display: "block" }}>
                                                    Example: {item.example}
                                                </Typography.Text>
                                            </div>
                                            <Tooltip title="Copy variable">
                                                <Button
                                                    size="small"
                                                    type="text"
                                                    className="copy-variable-btn"
                                                    icon={<FontAwesomeIcon icon={faCopy} />}
                                                    onClick={() => copyToClipboard(item.variable)}
                                                />
                                            </Tooltip>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                ))}

                <Divider />

                <Typography.Title level={5}>Best Practices</Typography.Title>
                <List
                    className="best-practices-list"
                    size="small"
                    dataSource={[
                        "Use clear and professional language in your templates",
                        "Test variables with sample data before using in production",
                        "Keep header and footer consistent across template types",
                        "Include proper unsubscribe information where required",
                        "Use the preview tab to check formatting before saving"
                    ]}
                    renderItem={(item) => (
                        <List.Item>
                            <Typography.Text>• {item}</Typography.Text>
                        </List.Item>
                    )}
                />
            </div>
        );
    };

    const renderPreview = () => {
        const values = form.getFieldsValue();
        const body = values.body || "";

    return (
            <div style={{ border: "1px solid #d9d9d9", borderRadius: "6px", padding: "16px", minHeight: "400px" }}>
                <Typography.Title level={5}>Email Preview</Typography.Title>
                <div 
                    style={{ 
                        backgroundColor: "#fff", 
                        padding: "20px", 
                        border: "1px solid #e8e8e8", 
                        borderRadius: "4px" 
                    }}
                >
                    {/* Header Images Section */}
                    {headerImages.length > 0 && (
                        <div className="preview-header-section" style={{ marginBottom: "20px", textAlign: "center" }}>
                            {headerImages.map((image, index) => (
                                <img
                                    key={image.uid || index}
                                    src={image.url || image.file_path}
                                    alt={image.name || image.file_name}
                                    style={{
                                        width: image.dimensions ? `${image.dimensions.width}px` : '100%',
                                        height: image.dimensions ? `${image.dimensions.height}px` : 'auto',
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                        marginBottom: index < headerImages.length - 1 ? '8px' : '0',
                                        backgroundColor: 'transparent',
                                        display: 'inline-block'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                    
                    {/* Body Content */}
                    <div style={{ padding: "20px 0", minHeight: "200px" }} dangerouslySetInnerHTML={{ __html: body }} />
                    
                    {/* Footer Images Section */}
                    {footerImages.length > 0 && (
                        <div className="preview-footer-section" style={{ marginTop: "20px", textAlign: "center" }}>
                            {footerImages.map((image, index) => (
                                <img
                                    key={image.uid || index}
                                    src={image.url || image.file_path}
                                    alt={image.name || image.file_name}
                                    style={{
                                        width: image.dimensions ? `${image.dimensions.width}px` : '100%',
                                        height: image.dimensions ? `${image.dimensions.height}px` : 'auto',
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                        marginBottom: index < footerImages.length - 1 ? '8px' : '0',
                                        backgroundColor: 'transparent',
                                        display: 'inline-block'
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
                <Typography.Text type="secondary" style={{ fontSize: "12px" }}>
                    Variables like [user:name], [auth:code], etc. will be replaced with actual values when sent.
                </Typography.Text>
            </div>
        );
    };

    const tabItems = [
        {
            key: "1",
            label: "Guide",
            children: renderGuideTab(),
        },
        {
            key: "2",
            label: "Basic Information",
            forceRender: true,
            children: (
                <div className="basic-info-section">
                    <Row gutter={[24, 20]}>
                        <Col span={24}>
                <Form.Item name="title" rules={[{ required: true, message: "Title is required" }]}>
                                <FloatInput placeholder="Template Title" label="Title" />
                </Form.Item>
                        </Col>
                        <Col span={16}>
                <Form.Item name="subject" rules={[{ required: true, message: "Subject is required" }]}>
                                <FloatInput placeholder="Email Subject" label="Subject" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name="template_type" rules={[{ required: true, message: "Template type is required" }]}>
                                <FloatSelect 
                                    placeholder="Select Type" 
                                    label="Template Type"
                                    options={templateTypeOptions}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Form.Item name="is_active" valuePropName="checked">
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <Switch />
                                    <Typography.Text>Active Template</Typography.Text>
                                </div>
                </Form.Item>
                        </Col>
                    </Row>
                </div>
            ),
        },
        {
            key: "3",
            label: "Header Banner",
            forceRender: true,
            children: (
                <div className="template-default-section">
                    <Card size="small" className="default-banner-card" style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography.Text strong>Default Header Banner:</Typography.Text>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => useDefaultBanner('header')}
                                disabled={!defaultBannersData?.data?.header_images?.length}
                            >
                                Use Default Header
                            </Button>
                        </div>
                        {!defaultBannersData?.data?.header_images?.length && (
                            <Typography.Text type="secondary" style={{ fontSize: "12px", marginTop: "4px", display: "block" }}>
                                No default header banner configured. Use "Setup Default Banners" to configure.
                            </Typography.Text>
                        )}
                    </Card>
                    <ImageUploader
                        images={headerImages}
                        onImagesChange={setHeaderImages}
                        title="Upload Header Banner"
                        description="Upload one banner image for email header (full-width banner, logo, etc.)"
                        maxCount={1}
                        type="header"
                    />
                </div>
            ),
        },
        {
            key: "4",
            label: "Body Template",
            forceRender: true,
            children: (
                <Form.Item name="body" rules={[{ required: true, message: "Body is required" }]}>
                    <FloatTinyMCESimple 
                        placeholder="Main email content"
                        height={300}
                    />
                </Form.Item>
            ),
        },
        {
            key: "5",
            label: "Footer Banner", 
            forceRender: true,
            children: (
                <div className="template-default-section">
                    <Card size="small" className="default-banner-card" style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <Typography.Text strong>Default Footer Banner:</Typography.Text>
                            <Button
                                type="primary"
                                size="small"
                                onClick={() => useDefaultBanner('footer')}
                                disabled={!defaultBannersData?.data?.footer_images?.length}
                            >
                                Use Default Footer
                            </Button>
                        </div>
                        {!defaultBannersData?.data?.footer_images?.length && (
                            <Typography.Text type="secondary" style={{ fontSize: "12px", marginTop: "4px", display: "block" }}>
                                No default footer banner configured. Use "Setup Default Banners" to configure.
                            </Typography.Text>
                        )}
                    </Card>
                    <ImageUploader
                        images={footerImages}
                        onImagesChange={setFooterImages}
                        title="Upload Footer Banner"
                        description="Upload one banner image for email footer (signature, contact info, etc.)"
                        maxCount={1}
                        type="footer"
                    />
                </div>
            ),
        },
        {
            key: "6",
            label: "Preview",
            forceRender: true,
            children: renderPreview(),
        },
    ];

    return (
        <Modal 
            open={toggleModalForm.open} 
            onCancel={handleCancel} 
            footer={null} 
            width={1000} 
            closeIcon={<FontAwesomeIcon icon={faClose} />} 
            className="modal-form-email-template" 
            title={
                <Typography.Text>
                    {toggleModalForm.data ? "EDIT EMAIL TEMPLATE" : "CREATE EMAIL TEMPLATE"}
                </Typography.Text>
            }
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item name="system_id" hidden>
                    <input type="hidden" />
                </Form.Item>
                
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    items={tabItems}
                    style={{ minHeight: "500px" }}
                    destroyInactiveTabPane={false}
                />
                
                <Row justify="space-between" gutter={10} style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f0f0f0" }}>
                    <Col>
                        <Button 
                            type="default"
                            onClick={handleTestSend}
                            loading={sendTestEmailMutation.isPending}
                            style={{ 
                                backgroundColor: '#52c41a', 
                                borderColor: '#52c41a', 
                                color: 'white' 
                            }}
                        >
                            🧪 Send Test Email
                        </Button>
                    </Col>
                    <Col>
                        <Row gutter={10}>
                            <Col>
                                <Button onClick={handleCancel}>
                                    Cancel
                                </Button>
                            </Col>
                            <Col>
                                <Button 
                                    type="primary" 
                                    htmlType="submit"
                                    loading={saveTemplate.isPending}
                                >
                                    {toggleModalForm.data ? "Update Template" : "Create Template"}
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}