import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { GET, POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import FloatSelect from "../../../../../providers/FloatSelect";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { data: dataStatusCategories } = GET(
        `api/status_category`,
        "status_category_select"
    );

    const { mutate: mutateStatus, isLoading: isLoadingStatus } = POST(
        `api/status`,
        "status_list"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateStatus(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Status",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Status",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    useEffect(() => {
        if (toggleModalForm.open) {
            form.setFieldsValue({
                ...toggleModalForm.data,
            });
        }

        return () => {};
    }, [toggleModalForm]);

    return (
        <Modal
            title={`${
                toggleModalForm.data && toggleModalForm.data.id ? "Edit" : "Add"
            } Status`}
            open={toggleModalForm.open}
            onCancel={() => {
                setToggleModalForm({
                    open: false,
                    data: null,
                });
                form.resetFields();
            }}
            forceRender
            footer={[
                <Button
                    onClick={() => {
                        setToggleModalForm({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    key={1}
                    disabled={isLoadingStatus}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    onClick={() => form.submit()}
                    loading={isLoadingStatus}
                    key={2}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="status_category_id"
                    rules={[validateRules.required()]}
                >
                    <FloatSelect
                        label="Status Category"
                        placeholder="Status Category"
                        required={true}
                        options={
                            dataStatusCategories && dataStatusCategories.data
                                ? dataStatusCategories.data.map((item) => ({
                                      label: item.status_category,
                                      value: item.id,
                                  }))
                                : []
                        }
                    />
                </Form.Item>
                <Form.Item name="status" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Status"
                        placeholder="Status"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
