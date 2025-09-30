import React, { useEffect, useMemo, useContext } from "react";
import { Form, Button, Row, Col, message } from "antd";
import FloatSelect from "../../../../../../providers/FloatSelect";
import FloatInput from "../../../../../../providers/FloatInput";
import FloatTextArea from "../../../../../../providers/FloatTextArea";
import { GET, POST } from "../../../../../../providers/useAxiosQuery";
import PageSystemConfigurationsContext from "../../TabSystemsConfigurationsContext";

function ModalPositionForm({ onAdd, closeModal, initialData }) {
    const { toggleModalForm, setToggleModalForm, setRefreshKey } = useContext(PageSystemConfigurationsContext);
    const [form] = Form.useForm();

    // Fetch roles for dropdown
    const { data: rolesApiData, isLoading: rolesLoading } = GET(
        `api/user_role?page_size=1000`,
        "user_roles_options",
        {
            isLoading: true,
            enabled: true,
        }
    );

    const roleOptions = useMemo(() => {
        const list = Array.isArray(rolesApiData?.data) ? rolesApiData.data : (rolesApiData?.data?.data || []);
        return (list || []).map((r) => ({ value: r.id, label: r.user_role }));
    }, [rolesApiData]);

    // Populate when editing
    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                positionName: initialData.position_name,
                description: initialData.description,
                user_role_id: initialData.user_role_id,
            });
        }
    }, [initialData, form]);

    const handleCancel = () => {
        setToggleModalForm({ open: false, data: null });
        form.resetFields();
        if (closeModal) closeModal();
    };

    // Create/Update position mutation
    const savePosition = POST(
        "api/positions",
        "positions_list",
        true,
        () => {
            message.success(toggleModalForm.data ? "Position updated successfully" : "Position created successfully");
            handleCancel();
            if (setRefreshKey) setRefreshKey((k) => k + 1);
        }
    );

    const onFinish = (values) => {
        const data = {
            position_name: values.positionName?.toUpperCase(),
            description: values.description,
            user_role_id: values.user_role_id,
        };

        if (toggleModalForm?.data?.id) {
            data.id = toggleModalForm.data.id;
        }

        savePosition.mutate(data, {
            onError: (err) => {
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('POSITIONS: save error', err?.response?.data || err?.message || err);
                }
            }
        });

        // If a legacy onAdd was passed, call it for backward compatibility
        if (onAdd) onAdd(data);
    };

    return (
        <div className="modal-container bg-white rounded-lg shadow-lg">
            <div style={{ padding: "20px" }}>
                <Form form={form} layout="vertical" onFinish={onFinish} className="w-full">
                    {/* Position Name */}
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item name="positionName" rules={[{ required: true, message: "Please enter position name" }]}>
                                <FloatInput 
                                    label="Position Name" 
                                    placeholder="e.g., REGISTRAR STAFF"
                                    required={true}
                                    style={{ textTransform: 'uppercase' }}
                                    onChange={(e) => {
                                        const upperValue = e.target.value.toUpperCase();
                                        form.setFieldsValue({ positionName: upperValue });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Description */}
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Form.Item name="description">
                                <FloatTextArea 
                                    label="Description" 
                                    rows={3}
                                    placeholder="Brief description"
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* Role Select */}
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Form.Item name="user_role_id" rules={[{ required: true, message: "Please select role" }]}>
                                <FloatSelect 
                                    label="Role" 
                                    options={roleOptions} 
                                    loading={rolesLoading} 
                                    placeholder="Select role" 
                                />
                            </Form.Item>
                        </Col>
                    </Row>

                    <div className="flex justify-end gap-3 mt-4">
                        <Button onClick={handleCancel} className="border border-green-500 text-green-500 px-4 py-2 rounded-lg" disabled={savePosition.isLoading}>
                            Cancel
                        </Button>
                        <Button type="primary" htmlType="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg" loading={savePosition.isLoading}>
                            Submit
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
}

export default ModalPositionForm;