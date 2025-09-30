import React, { useState, useEffect } from 'react';
import { Modal, Form, InputNumber, Button, Row, Col, Alert, Typography, Image, Space } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRulerCombined, faImage } from '@fortawesome/pro-regular-svg-icons';
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

export default function ModalImageDimensions({ 
    visible, 
    onSave, 
    onCancel, 
    image,
    isEditing = false,
    initialDimensions = null
}) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (visible && image) {
            if (initialDimensions) {
                form.setFieldsValue(initialDimensions);
            } else {
                // Try to get natural dimensions if it's a new image
                if (image.file) {
                    const img = document.createElement('img');
                    img.onload = () => {
                        form.setFieldsValue({
                            width: img.naturalWidth,
                            height: img.naturalHeight
                        });
                    };
                    img.src = image.url;
                } else {
                    // Default dimensions
                    form.setFieldsValue({
                        width: 600,
                        height: 200
                    });
                }
            }
        }
    }, [visible, image, initialDimensions, form]);

    const handleSave = async () => {
        try {
            setLoading(true);
            const values = await form.validateFields();
            onSave(values);
        } catch (error) {
            console.error('Validation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title={
                <Space>
                    <FontAwesomeIcon icon={faRulerCombined} />
                    {isEditing ? 'Edit Image Dimensions' : 'Set Image Dimensions'}
                </Space>
            }
            open={visible}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="save" type="primary" loading={loading} onClick={handleSave}>
                    {isEditing ? 'Update Dimensions' : 'Save & Continue'}
                </Button>
            ]}
            width={600}
            className="modal-image-dimensions"
        >
            <div className="image-dimensions-content">
                {image && (
                    <Row gutter={24}>
                        <Col xs={24} md={12}>
                            <div style={{ marginBottom: 24 }}>
                                <Title level={5}>
                                    <FontAwesomeIcon icon={faImage} style={{ marginRight: 8 }} />
                                    Image Preview
                                </Title>
                                <Image
                                    src={image.url}
                                    alt={image.name}
                                    style={{
                                        width: '100%',
                                        maxHeight: 200,
                                        objectFit: 'contain',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: 8
                                    }}
                                />
                                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                                    {image.name}
                                </Text>
                            </div>
                        </Col>
                        
                        <Col xs={24} md={12}>
                            <Alert
                                message="Set Display Dimensions"
                                description="These dimensions will be used when displaying the image in emails. The image will be automatically resized to fit these dimensions."
                                type="info"
                                showIcon
                                style={{ marginBottom: 24 }}
                            />

                            <Form
                                form={form}
                                layout="vertical"
                                name="image_dimensions"
                            >
                                <Form.Item
                                    label="Width (pixels)"
                                    name="width"
                                    rules={[
                                        { required: true, message: 'Please enter width' },
                                        { type: 'number', min: 50, max: 1200, message: 'Width must be between 50 and 1200 pixels' }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={50}
                                        max={1200}
                                        placeholder="e.g., 600"
                                        addonAfter="px"
                                    />
                                </Form.Item>

                                <Form.Item
                                    label="Height (pixels)"
                                    name="height"
                                    rules={[
                                        { required: true, message: 'Please enter height' },
                                        { type: 'number', min: 50, max: 800, message: 'Height must be between 50 and 800 pixels' }
                                    ]}
                                >
                                    <InputNumber
                                        style={{ width: '100%' }}
                                        min={50}
                                        max={800}
                                        placeholder="e.g., 200"
                                        addonAfter="px"
                                    />
                                </Form.Item>
                            </Form>

                            <Alert
                                message="Recommended Sizes"
                                description={
                                    <div>
                                        <Text style={{ fontSize: 12, display: 'block' }}>
                                            • Header: 600×150 to 800×200 pixels
                                        </Text>
                                        <Text style={{ fontSize: 12, display: 'block' }}>
                                            • Footer: 600×100 to 800×150 pixels
                                        </Text>
                                        <Text style={{ fontSize: 12, display: 'block' }}>
                                            • Logo: 200×80 to 300×120 pixels
                                        </Text>
                                    </div>
                                }
                                type="warning"
                                showIcon
                                style={{ marginTop: 16 }}
                            />
                        </Col>
                    </Row>
                )}
            </div>
        </Modal>
    );
}

ModalImageDimensions.propTypes = {
    visible: PropTypes.bool.isRequired,
    onSave: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    image: PropTypes.object,
    isEditing: PropTypes.bool,
    initialDimensions: PropTypes.object
};