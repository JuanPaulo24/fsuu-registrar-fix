import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import FloatInput from "../../../../../providers/FloatInput";
import validateRules from "../../../../../providers/validateRules";
import notificationErrors from "../../../../../providers/notificationErrors";
import FloatInputNumber from "../../../../../providers/FloatInputNumber";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateRate, isLoading: isLoadingRate } = POST(
        `api/rate`,
        "rate_list"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateRate(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Rate",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Rate",
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
            } Rate`}
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
                    key={1}
                    onClick={() => {
                        setToggleModalForm({
                            open: false,
                            data: null,
                        });
                        form.resetFields();
                    }}
                    disabled={isLoadingRate}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingRate}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="name" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Name"
                        placeholder="Name"
                        required={true}
                    />
                </Form.Item>

                <Form.Item name="rate" rules={[validateRules.required()]}>
                    <FloatInputNumber
                        label="Rate"
                        placeholder="Rate"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
