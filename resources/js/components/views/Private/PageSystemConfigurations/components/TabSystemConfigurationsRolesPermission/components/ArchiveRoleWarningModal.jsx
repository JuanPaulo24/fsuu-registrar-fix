import React from "react";
import { Modal, Button } from "antd";

const ArchiveRoleWarningModal = ({ open, onClose, roleName, positionsCount }) => {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="ok" type="primary" onClick={onClose}>
                    OK
                </Button>,
            ]}
            title="Cannot Archive Role"
            destroyOnClose
            maskClosable={false}
        >
            <div className="space-y-2">
                <p className="text-gray-700">
                    This role cannot be archived because it has positions assigned.
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Role:</span> {roleName || "—"}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Assigned positions:</span> {positionsCount || 0}
                </p>
                <p className="text-gray-600 text-sm">
                    Please remove or reassign all positions linked to this role before archiving.
                </p>
            </div>
        </Modal>
    );
};

export default ArchiveRoleWarningModal;

