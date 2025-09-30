import { Modal, Button, Form, notification } from "antd";

import { useEffect } from "react";
import FloatInput from "../../../../providers/FloatInput";
import { POST } from "../../../../providers/useAxiosQuery";

export default function ModalUserUploadPictureForm(props) {
    const {
        toggleModalUserUploadPictureForm,
        setToggleModalUserUploadPictureForm,
    } = props;

    const [form] = Form.useForm();

    const { mutate: mutateImage, loading: loadingImage } = POST(
        `api/user`,
        "user_image"
    );

    const onFinish = (values) => {
        // Form submission logged for debugging - removed for security

        let data = {
            ...values,
            id:
                toggleModalUserUploadPictureForm.data &&
                toggleModalUserUploadPictureForm.data.id
                    ? toggleModalUserUploadPictureForm.data.id
                    : "",
        };

        mutateImage(data, {
            onSuccess: (res) => {
                // Response logged for debugging - removed for security
                if (res.success) {
                    setToggleModalUserUploadPictureForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Image",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Image",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notification.error({
                    message: "Image",
                    description: "Something went wrong",
                });
            },
        });
    };

    useEffect(() => {
        if (toggleModalUserUploadPictureForm.open) {
            form.setFieldsValue({
                ...toggleModalUserUploadPictureForm.data,
            });
        }

        return () => {};
    }, [toggleModalUserUploadPictureForm]);

    return (
        <Modal
            title="Take Photo"
            open={toggleModalUserUploadPictureForm.open}
            onCancel={() => {
                setToggleModalUserUploadPictureForm({
                    open: false,
                    data: null,
                });
                form.resetFields();
            }}
            forceRender
            footer={[
                <Button
                    className="btn-main-primary outlined"
                    size="large"
                    key={1}
                    onClick={() => {
                        setToggleModalUserUploadPictureForm({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                >
                    CANCEL
                </Button>,
                <Button
                    className="btn-main-primary"
                    type="primary"
                    size="large"
                    key={2}
                    onClick={() => form.submit()}
                    loading={loadingImage}
                >
                    SUBMIT
                </Button>,
            ]}
        ></Modal>
    );
}
