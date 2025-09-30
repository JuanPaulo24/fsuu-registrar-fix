import React, { useState } from "react";
import { Modal, Form, Input, Button, Alert, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock, faExclamationTriangle } from "@fortawesome/pro-regular-svg-icons";
import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";

export default function ModalPasswordVerification({
    open,
    onCancel,
    onSuccess,
    title = "Password Verification Required",
    description = "Please enter your password to continue with this action.",
}) {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { mutate: verifyPassword } = POST("api/verify_password", "password_verification");

    const handleSubmit = () => {
        form.validateFields()
            .then(values => {
                setLoading(true);
                setError("");
                
                verifyPassword(
                    { password: values.password },
                    {
                        onSuccess: (res) => {
                            if (res.success) {
                                form.resetFields();
                                onSuccess();
                            } else {
                                setError(res.message || "Invalid password. Please try again.");
                            }
                            setLoading(false);
                        },
                        onError: (err) => {
                            setError("Failed to verify password. Please try again.");
                            notificationErrors(err);
                            setLoading(false);
                        },
                    }
                );
            })
            .catch(info => {
                console.log('Validation Failed:', info);
            });
    };

    const handleCancel = () => {
        form.resetFields();
        setError("");
        onCancel();
    };

    return (
        <Modal
            wrapClassName="modal-password-verification-wrap"
            title={
                <Space align="center">
                    <FontAwesomeIcon 
                        icon={faLock} 
                        className="text-primary" 
                        style={{ fontSize: "20px" }}
                    />
                    <span>{title}</span>
                </Space>
            }
            open={open}
            onCancel={handleCancel}
            footer={[
                <Button key="cancel" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    danger
                    loading={loading}
                    onClick={handleSubmit}
                    icon={<FontAwesomeIcon icon={faExclamationTriangle} />}
                >
                    Verify and Continue
                </Button>,
            ]}
            width={480}
            centered
            maskClosable={false}
            className="modal-password-verification"
        >
            <div className="py-4">
                <Alert
                    message={description}
                    type="warning"
                    showIcon
                    className="mb-4"
                />

                {error && (
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        closable
                        onClose={() => setError("")}
                        className="mb-4"
                    />
                )}

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: "Please enter your password",
                            },
                        ]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="Enter your password"
                            prefix={<FontAwesomeIcon icon={faLock} className="text-gray-400" />}
                            autoFocus
                            onPressEnter={handleSubmit}
                        />
                    </Form.Item>
                </Form>

                <div className="text-sm text-gray-500 mt-4">
                    <p>
                        <strong>Note:</strong> This action requires authentication to ensure 
                        security and proper authorization.
                    </p>
                </div>
            </div>
        </Modal>
    );
}