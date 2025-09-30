import React, { useContext, useEffect } from "react";
import { Modal, Form, Button, Row, Col, message } from "antd";
import { POST } from "../../../../../../providers/useAxiosQuery";
import FloatInput from "../../../../../../providers/FloatInput";
import validateRules from "../../../../../../providers/validateRules";
import PageSystemConfigurationsContext from "../../TabSystemsConfigurationsContext";

export default function ModalRoleForm() {
    const { toggleModalForm, setToggleModalForm, refreshKey, setRefreshKey } = useContext(PageSystemConfigurationsContext);
    const [form] = Form.useForm();

    // Create/Update user role mutation
    const saveUserRole = POST(
        "api/user_role",
        "user_roles_list",
        true,
        () => {
            if (import.meta.env.MODE !== 'production') {
                // eslint-disable-next-line no-console
                console.log('USER_ROLES: saved', form.getFieldsValue());
            }
            message.success(toggleModalForm.data ? "Role updated successfully" : "Role created successfully");
            handleCancel();
            // Trigger refresh in parent component
            setRefreshKey((k) => k + 1);
        }
    );

    // Populate form when editing
    useEffect(() => {
        if (toggleModalForm.open && toggleModalForm.data) {
            form.setFieldsValue({
                user_role: toggleModalForm.data.user_role,
            });
        }
    }, [toggleModalForm, form]);

    const handleCancel = () => {
        setToggleModalForm({ open: false, data: null });
        form.resetFields();
    };

    const onFinish = (values) => {
        const data = {
            user_role: values.user_role?.toUpperCase(),
        };

        if (toggleModalForm.data?.id) {
            data.id = toggleModalForm.data.id;
        }

        saveUserRole.mutate(data, {
            onError: (err) => {
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('USER_ROLES: save error', err?.response?.data || err?.message || err);
                }
            }
        });
    };

    return (
        <Modal
            title={`${toggleModalForm.data ? "Edit" : "Add"} User Role`}
            open={toggleModalForm.open}
            onCancel={handleCancel}
            footer={[
                <Button
                    key="cancel"
                    onClick={handleCancel}
                    disabled={saveUserRole.isLoading}
                >
                    CANCEL
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={() => form.submit()}
                    loading={saveUserRole.isLoading}
                >
                    SUBMIT
                </Button>,
            ]}
            destroyOnClose
            width={600}
        >
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        <Form.Item 
                            name="user_role" 
                            label="User Role"
                            rules={[validateRules.required()]}
                        >
                            <FloatInput
                                label="User Role"
                                placeholder="e.g., ADMIN, FACULTY, STUDENT"
                                required={true}
                                style={{ textTransform: 'uppercase' }}
                                onChange={(e) => {
                                    const upperValue = e.target.value.toUpperCase();
                                    form.setFieldsValue({ user_role: upperValue });
                                }}
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
}