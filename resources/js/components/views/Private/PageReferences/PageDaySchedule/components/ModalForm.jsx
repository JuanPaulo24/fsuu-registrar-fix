import { useEffect } from "react";
import { Modal, Button, Form, notification } from "antd";

import { POST } from "../../../../../providers/useAxiosQuery";
import validateRules from "../../../../../providers/validateRules";
import FloatInput from "../../../../../providers/FloatInput";
import notificationErrors from "../../../../../providers/notificationErrors";

export default function ModalForm(props) {
    const { toggleModalForm, setToggleModalForm } = props;

    const [form] = Form.useForm();

    const { mutate: mutateDaySchedule, isLoading: isLoadingDaySchedule } = POST(
        `api/ref_day_schedule`,
        "day_schedule_list"
    );

    const onFinish = (values) => {
        let data = {
            ...values,
            id:
                toggleModalForm.data && toggleModalForm.data.id
                    ? toggleModalForm.data.id
                    : "",
        };

        mutateDaySchedule(data, {
            onSuccess: (res) => {
                if (res.success) {
                    setToggleModalForm({
                        open: false,
                        data: null,
                    });
                    form.resetFields();
                    notification.success({
                        message: "Day Schedule",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Day Schedule",
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
            title="FORM Day Schedule"
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
                    loading={isLoadingDaySchedule}
                >
                    SUBMIT
                </Button>,
            ]}
        >
            <Form form={form} onFinish={onFinish}>
                <Form.Item name="code" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Day Code"
                        placeholder="Day Code"
                        required={true}
                    />
                </Form.Item>
                <Form.Item name="name" rules={[validateRules.required()]}>
                    <FloatInput
                        label="Name"
                        placeholder="Name"
                        required={true}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}
