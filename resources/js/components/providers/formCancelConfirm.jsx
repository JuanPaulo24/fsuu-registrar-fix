import { Modal } from "antd";

export const handleCancel = (form, setToggleModalForm) => {
    Modal.confirm({
        title: "Confirm Cancel",
        content: "Are you sure you want to cancel? All entered data will be lost.",
        okText: "Yes",
        cancelText: "No",
        maskClosable: true,
        centered: true,
        className: "text-center",
        okButtonProps: {
            className: "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
        },
        cancelButtonProps: {
            className: "border border-green-500 text-green-500 hover:border-green-600 hover:text-green-600 px-4 py-2 rounded-lg"
        },
        onOk: () => {
            form.resetFields();
            setToggleModalForm({ open: false, data: null});
        },
    });
}; 