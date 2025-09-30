import { useEffect } from "react";
import { Modal, Button, Form, notification, Select } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateStatusCategory, isLoading: isLoadingStatusCategory } =
        POST(`api/status_category`, "status_category_list");

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateStatusCategory(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Status Category",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Status Category",
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
            } Status Category`}
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
                    disabled={isLoadingStatusCategory}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    onClick={() => form.submit()}
                    loading={isLoadingStatusCategory}
                    key={2}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item
                    name="status_category"
                    rules={[validateRules.required()]}
                >
                    <FloatInput
                        label="Status Category"
                        placeholder="Status Category"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
