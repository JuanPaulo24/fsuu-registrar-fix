import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import FloatInput from "../../../../../providers/FloatInput";
import validateRules from "../../../../../providers/validateRules";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateFloor, isLoading: isLoadingFloor } = POST(
        `api/floor`,
        "floor_list"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateFloor(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Floor",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Floor",
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
            } Floor`}
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
                    disabled={isLoadingFloor}
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={isLoadingFloor}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="floor" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Floor Level"
                        placeholder="Floor Level"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
