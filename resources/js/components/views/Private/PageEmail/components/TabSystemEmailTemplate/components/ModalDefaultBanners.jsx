import React, { useState, useEffect } from "react";
import { Modal, Form, Typography, message, Card } from "antd";
import { faClose, faCog } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ImageUploader from "./ImageUploader";
import { POST, GET } from "../../../../../../providers/useAxiosQuery";

export default function ModalDefaultBanners({ open, onClose }) {
    const [form] = Form.useForm();
    const [defaultHeaderImages, setDefaultHeaderImages] = useState([]);
    const [defaultFooterImages, setDefaultFooterImages] = useState([]);

    // Fetch default banners (you can create a specific endpoint for this)
    const { data: defaultBannersData, refetch } = GET(
        "api/default_banners",
        "default_banners",
        false // Don't auto-fetch
    );

    // Save default banners mutation
    const saveDefaultBanners = POST(
        "api/default_banners",
        "default_banners",
        true,
        () => {
            message.success("Default banners updated successfully");
            onClose();
            refetch();
        }
    );

    useEffect(() => {
        if (open) {
            // Load existing default banners
            if (defaultBannersData?.data) {
                const data = defaultBannersData.data;
                if (data.header_images) {
                    setDefaultHeaderImages(data.header_images.map(img => ({
                        id: img.id,
                        uid: img.id,
                        name: img.file_name,
                        status: 'done',
                        url: img.file_path,
                        file_path: img.file_path,
                        file_name: img.file_name,
                        file_size: img.file_size,
                        dimensions: img.image_dimensions
                    })));
                }
                if (data.footer_images) {
                    setDefaultFooterImages(data.footer_images.map(img => ({
                        id: img.id,
                        uid: img.id,
                        name: img.file_name,
                        status: 'done',
                        url: img.file_path,
                        file_path: img.file_path,
                        file_name: img.file_name,
                        file_size: img.file_size,
                        dimensions: img.image_dimensions
                    })));
                }
            }
            // Fetch data when modal opens
            refetch();
        } else {
            // Reset when modal closes
            setDefaultHeaderImages([]);
            setDefaultFooterImages([]);
        }
    }, [open, defaultBannersData, refetch]);

    const handleSubmit = () => {
        const formData = new FormData();

        // Add new header images
        let headerImageIndex = 0;
        defaultHeaderImages.forEach((image) => {
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
        defaultHeaderImages.forEach((image) => {
            if (!image.file && image.id && image.dimensions) {
                formData.append(`existing_header_images[${image.id}][width]`, image.dimensions.width);
                formData.append(`existing_header_images[${image.id}][height]`, image.dimensions.height);
            }
        });

        // Add new footer images
        let footerImageIndex = 0;
        defaultFooterImages.forEach((image) => {
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
        defaultFooterImages.forEach((image) => {
            if (!image.file && image.id && image.dimensions) {
                formData.append(`existing_footer_images[${image.id}][width]`, image.dimensions.width);
                formData.append(`existing_footer_images[${image.id}][height]`, image.dimensions.height);
            }
        });

        saveDefaultBanners.mutate(formData);
    };

    const handleCancel = () => {
        setDefaultHeaderImages([]);
        setDefaultFooterImages([]);
        onClose();
    };

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            footer={null}
            width={800}
            closeIcon={<FontAwesomeIcon icon={faClose} />}
            className="modal-default-banners"
            title={
                <Typography.Text>
                    <FontAwesomeIcon icon={faCog} style={{ marginRight: "8px" }} />
                    SETUP DEFAULT BANNERS
                </Typography.Text>
            }
            style={{ top: 20 }}
        >
            <div style={{ marginBottom: "24px" }}>
                <Typography.Text type="secondary">
                    Configure default header and footer banners that can be reused across all email templates.
                </Typography.Text>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Card title="Default Header Banner" size="small" style={{ marginBottom: "16px" }}>
                    <ImageUploader
                        images={defaultHeaderImages}
                        onImagesChange={setDefaultHeaderImages}
                        title="Upload Default Header Banner"
                        description="Upload the default banner image for email headers (full-width banner, logo, etc.)"
                        maxCount={1}
                        type="header"
                    />
                </Card>

                <Card title="Default Footer Banner" size="small" style={{ marginBottom: "24px" }}>
                    <ImageUploader
                        images={defaultFooterImages}
                        onImagesChange={setDefaultFooterImages}
                        title="Upload Default Footer Banner"
                        description="Upload the default banner image for email footers (signature, contact info, etc.)"
                        maxCount={1}
                        type="footer"
                    />
                </Card>

                <div style={{ textAlign: "right" }}>
                    <button
                        type="button"
                        onClick={handleCancel}
                        style={{
                            marginRight: "8px",
                            padding: "8px 16px",
                            border: "1px solid #d9d9d9",
                            borderRadius: "4px",
                            backgroundColor: "white",
                            cursor: "pointer"
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saveDefaultBanners.isPending}
                        style={{
                            padding: "8px 16px",
                            border: "none",
                            borderRadius: "4px",
                            backgroundColor: "#1890ff",
                            color: "white",
                            cursor: "pointer"
                        }}
                    >
                        {saveDefaultBanners.isPending ? "Saving..." : "Save Default Banners"}
                    </button>
                </div>
            </Form>
        </Modal>
    );
}