import React, { useContext } from "react";
import { Modal } from "antd";
import PageMinistryContext from "./PageMinistryContext";
import ModalArchiveMinistry from "./ModalArchiveMinistry";

export default function ModalFormArchiveMinistry() {
    const { toggleArchiveModal, setToggleArchiveModal, tabActive } = useContext(PageMinistryContext);

    const handleClose = () => {
        setToggleArchiveModal({ open: false });
    };


    return (
        <Modal
            title={`Archived ${tabActive}`}
            open={toggleArchiveModal.open}
            onCancel={handleClose}
            footer={null}
            width={1100}
        >
            <ModalArchiveMinistry onAdd={() => handleClose()} closeModal={handleClose} />
        </Modal>
    );
}
