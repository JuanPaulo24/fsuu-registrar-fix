import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateTimeSchedule, loading: loadingDaySchedule } = POST(
        `api/section`,
        "section_list"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateTimeSchedule(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Section",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Section",
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toggleModalForm]);

    return (
        <Modal
            title={`${
                toggleModalForm.data && toggleModalForm.data.id ? "Edit" : "Add"
            } Section`}
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
                >
                    CANCEL
                </Button>,
                <Button
                    type="primary"
                    key={2}
                    onClick={() => form.submit()}
                    loading={loadingDaySchedule}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="section" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Section"
                        placeholder="Section"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
