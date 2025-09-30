import React, { useState } from 'react';
import { Upload, Card, Row, Col, Button, Image, Typography, Space, Tooltip, message } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTrash, faEdit, faEye } from '@fortawesome/pro-regular-svg-icons';
import PropTypes from 'prop-types';
import ModalImageDimensions from './ModalImageDimensions';

const { Dragger } = Upload;
const { Text } = Typography;

export default function ImageUploader({ 
    images = [], 
    onImagesChange, 
    title = "Upload Images",
    description = "Click or drag images to this area to upload",
    maxCount = 5,
    readOnly = false,
    type = "header" // "header" or "footer"
}) {
    const [dimensionModalVisible, setDimensionModalVisible] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(null);
    const [tempImages, setTempImages] = useState([]);

    const handleUpload = ({ fileList }) => {
        // Filter only successful uploads
        const validFiles = fileList.filter(file => 
            file.status === 'done' || file.status === 'uploading' || !file.status
        );
        
        // Convert to our format
        const newImages = validFiles.map(file => ({
            uid: file.uid,
            name: file.name,
            status: file.status || 'done',
            url: file.url || (file.response && file.response.url) || URL.createObjectURL(file.originFileObj),
            file: file.originFileObj,
            dimensions: null // Will be set in dimension modal
        }));

        setTempImages(newImages);
        
        // If we have new files that need dimensions, show modal
        const needsDimensions = newImages.filter(img => !img.dimensions && img.file);
        if (needsDimensions.length > 0) {
            setSelectedImageIndex(newImages.findIndex(img => !img.dimensions && img.file));
            setDimensionModalVisible(true);
        } else {
            onImagesChange(newImages);
        }
    };

    const handleDimensionsSave = (dimensions) => {
        const updatedImages = [...tempImages];
        if (selectedImageIndex !== null) {
            updatedImages[selectedImageIndex] = {
                ...updatedImages[selectedImageIndex],
                dimensions
            };
        }
        
        // Check if we're editing existing images or processing new uploads
        // If tempImages equals current images length and selected image already had dimensions, we're editing
        const isEditingExisting = tempImages.length === images.length && 
                                 tempImages.some(img => img.file_path || (img.dimensions && !img.file));
        
        if (isEditingExisting) {
            // For editing existing images, just update and close
            setDimensionModalVisible(false);
            setSelectedImageIndex(null);
            onImagesChange(updatedImages);
            setTempImages([]);
        } else {
            // Check if there are more NEW images that need dimensions
            const nextIndex = updatedImages.findIndex((img, index) => 
                index > selectedImageIndex && !img.dimensions && img.file
            );
            
            if (nextIndex !== -1) {
                setSelectedImageIndex(nextIndex);
                // Modal stays open for next image
            } else {
                setDimensionModalVisible(false);
                setSelectedImageIndex(null);
                onImagesChange(updatedImages);
                setTempImages([]);
            }
        }
    };

    const handleDimensionsCancel = () => {
        setDimensionModalVisible(false);
        setSelectedImageIndex(null);
        
        // If we were editing existing images, don't show warning
        const isEditingExisting = tempImages.length === images.length;
        if (!isEditingExisting) {
            message.warning('Upload cancelled - dimensions are required for images');
        }
        
        setTempImages([]);
    };

    const removeImage = (indexToRemove) => {
        const updatedImages = images.filter((_, index) => index !== indexToRemove);
        onImagesChange(updatedImages);
    };

    const editImageDimensions = (index) => {
        // For editing existing images, we need to set tempImages to current images
        setTempImages([...images]);
        setSelectedImageIndex(index);
        setDimensionModalVisible(true);
    };

    const uploadProps = {
        name: 'file',
        multiple: true,
        accept: 'image/*',
        beforeUpload: () => false, // Prevent auto upload
        onChange: handleUpload,
        fileList: [],
        disabled: readOnly
    };

    const currentImage = selectedImageIndex !== null ? 
        (tempImages[selectedImageIndex] || images[selectedImageIndex]) : null;

    return (
        <div className="image-uploader">
            {!readOnly && (
                <Card className="upload-card" style={{ marginBottom: 16 }}>
                    <Dragger {...uploadProps} className="image-upload-dragger">
                        <div className="upload-content">
                            <FontAwesomeIcon icon={faUpload} style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }} />
                            <Typography.Title level={4}>{title}</Typography.Title>
                            <Text type="secondary">{description}</Text>
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Support for single or bulk upload. Max {maxCount} images.
                                </Text>
                            </div>
                        </div>
                    </Dragger>
                </Card>
            )}

            {images.length > 0 && (
                <Card 
                    title={`${type === 'header' ? 'Header' : 'Footer'} Images (${images.length})`}
                    className={readOnly ? "readonly-images" : ""}
                >
                    <Row gutter={[16, 16]}>
                        {images.map((image, index) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={image.uid || index}>
                                <Card 
                                    className="image-item"
                                    cover={
                                        <Image
                                            src={image.url || image.file_path}
                                            alt={image.name || image.file_name}
                                            style={{ 
                                                height: type === 'header' ? 100 : 80, 
                                                objectFit: 'contain',
                                                width: '100%',
                                                backgroundColor: '#fafafa'
                                            }}
                                            preview={{
                                                src: image.url || image.file_path, // Use original size for preview
                                                mask: (
                                                    <Space>
                                                        <FontAwesomeIcon icon={faEye} />
                                                        Preview
                                                    </Space>
                                                )
                                            }}
                                        />
                                    }
                                    actions={!readOnly ? [
                                        <Tooltip title="Edit Dimensions">
                                            <Button 
                                                type="link" 
                                                icon={<FontAwesomeIcon icon={faEdit} />}
                                                onClick={() => editImageDimensions(index)}
                                            />
                                        </Tooltip>,
                                        <Tooltip title="Remove">
                                            <Button 
                                                type="link" 
                                                danger
                                                icon={<FontAwesomeIcon icon={faTrash} />}
                                                onClick={() => removeImage(index)}
                                            />
                                        </Tooltip>
                                    ] : []}
                                >
                                    <Card.Meta
                                        title={
                                            <Text ellipsis style={{ fontSize: 12 }}>
                                                {image.name || image.file_name}
                                            </Text>
                                        }
                                        description={
                                            <Space direction="vertical" size={4}>
                                                {image.dimensions && (
                                                    <Text type="secondary" style={{ fontSize: 11 }}>
                                                        {image.dimensions.width} × {image.dimensions.height}px
                                                    </Text>
                                                )}
                                                <Text type="secondary" style={{ fontSize: 11 }}>
                                                    {image.file_size || 'Unknown size'}
                                                </Text>
                                            </Space>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card>
            )}

            <ModalImageDimensions
                visible={dimensionModalVisible}
                onSave={handleDimensionsSave}
                onCancel={handleDimensionsCancel}
                image={currentImage}
                isEditing={selectedImageIndex !== null && (tempImages[selectedImageIndex]?.dimensions || images[selectedImageIndex]?.dimensions)}
                initialDimensions={
                    selectedImageIndex !== null 
                        ? (tempImages[selectedImageIndex]?.dimensions || images[selectedImageIndex]?.dimensions || null)
                        : null
                }
            />
        </div>
    );
}

ImageUploader.propTypes = {
    images: PropTypes.array,
    onImagesChange: PropTypes.func.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    maxCount: PropTypes.number,
    readOnly: PropTypes.bool,
    type: PropTypes.oneOf(['header', 'footer'])
};