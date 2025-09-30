import React, { useContext } from "react";
import { Modal } from "antd";
import PageMinistryContext from "./PageMinistryContext";
import ParishionerInfo from "./ModalParishioner";

export default function ModalFormMinistry() {
    const { toggleModalForm, setToggleModalForm, tabActive } = useContext(PageMinistryContext);

    const handleClose = () => {
        setToggleModalForm({ open: false, data: null });
    };

    return (
        <Modal
            title={(toggleModalForm.data ? "Edit " : "Add ") + tabActive}
            open={toggleModalForm.open}
            onCancel={handleClose}
            footer={null}
            className="modal-form-ministry"
            width={1100}
            closable={false}
        >
            <ParishionerInfo onAdd={() => handleClose()} closeModal={handleClose} tabActive={tabActive} />

        </Modal>
    );
}
