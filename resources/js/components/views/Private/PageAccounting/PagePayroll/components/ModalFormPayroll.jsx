import React, { useContext } from "react";
import { Modal } from "antd";
import PagePayrollContext from "./PagePayrollContext";
import PayrollInfo from "./ModalPayroll";

export default function ModalFormPayroll() {
    const { toggleModalForm, setToggleModalForm } = useContext(PagePayrollContext);

    const handleClose = () => {
        setToggleModalForm({ open: false, data: null });
    };

    return (
        <Modal
            title={(toggleModalForm.data ? "Edit " : "")}
            open={toggleModalForm.open}
            onCancel={handleClose}
            footer={null}
            className="modal-form-payroll"
            width={1100}
            closable={false}
            bodyStyle={{ 
                    padding: 0, 
                    maxWidth: "none" 
                }}
        >
            <PayrollInfo onAdd={handleClose} closeModal={handleClose} />
        </Modal>
    );
}