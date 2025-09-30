import React, { useContext } from "react";
import { Modal } from "antd";
import ModalPositionForm from "./ModalPositionForm";
import PageSystemConfigurationsContext from "../../TabSystemsConfigurationsContext";

export default function ModalPosition() {
    const { toggleModalForm, setToggleModalForm, handleAdd } = useContext(PageSystemConfigurationsContext);

    const handleClose = () => {
        setToggleModalForm({ open: false, data: null });
    };

    return (
        <Modal
            title={toggleModalForm.data ? "Edit Position" : "New Position"}
            open={toggleModalForm.open}
            onCancel={handleClose}
            footer={null}
            width={900}
            closable={false}
        >
            <ModalPositionForm onAdd={handleAdd} closeModal={handleClose} initialData={toggleModalForm.data} />
        </Modal>
    );
}