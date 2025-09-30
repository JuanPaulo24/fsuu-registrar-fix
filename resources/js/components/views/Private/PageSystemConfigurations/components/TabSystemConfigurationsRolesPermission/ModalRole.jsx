import React, { useContext } from "react";
import { Modal } from "antd";
import ModalRoleForm from "./ModalRoleForm";
import PageSystemConfigurationsContext from "../TabSystemsConfigurationsContext";

export default function ModalRole() {
    const { toggleModalForm, setToggleModalForm, handleAdd } = useContext(PageSystemConfigurationsContext);

    const handleClose = () => {
        setToggleModalForm({ open: false, data: null });
    };

    return (
        <Modal
            title={toggleModalForm.data ? "Edit Role" : "New Role"}
            open={toggleModalForm.open}
            onCancel={handleClose}
            footer={null}
            width={900}
            closable={false}
        >
            <ModalRoleForm onAdd={handleAdd} closeModal={handleClose} initialData={toggleModalForm.data} />
        </Modal>
    );
}
