import React from "react";
import { Modal, Button } from "antd";

const ArchivePositionWarningModal = ({ open, onClose, positionName, usersCount }) => {
    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={[
                <Button key="ok" type="primary" onClick={onClose}>
                    OK
                </Button>,
            ]}
            title="Cannot Archive Position"
            destroyOnClose
            maskClosable={false}
        >
            <div className="space-y-2">
                <p className="text-gray-700">
                    This position cannot be archived because there are users assigned.
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Position:</span> {positionName || "—"}
                </p>
                <p className="text-gray-700">
                    <span className="font-semibold">Assigned users:</span> {usersCount || 0}
                </p>
                <p className="text-gray-600 text-sm">
                    Please remove or reassign all users linked to this position before archiving.
                </p>
            </div>
        </Modal>
    );
};

export default ArchivePositionWarningModal;

