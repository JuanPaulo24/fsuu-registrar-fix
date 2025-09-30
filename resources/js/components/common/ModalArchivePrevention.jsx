import React from "react";
import { Modal, Typography, Alert, Button } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/pro-regular-svg-icons";

const { Text } = Typography;

export default function ModalArchivePrevention({ 
    isVisible, 
    onClose, 
    itemType, 
    itemName, 
    usageCount, 
    usageDetails = [] 
}) {
    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <FontAwesomeIcon 
                        icon={faExclamationTriangle} 
                        className="text-yellow-500 text-xl"
                    />
                    <span className="text-lg font-semibold">Cannot Archive {itemType}</span>
                </div>
            }
            open={isVisible}
            onCancel={onClose}
            footer={[
                <Button
                    key="ok"
                    type="primary"
                    onClick={onClose}
                    className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 px-6"
                >
                    I Understand
                </Button>
            ]}
            width={500}
            centered
        >
            <div className="space-y-4 py-4">
                <Alert
                    message="Archive Prevention"
                    description={
                        <div className="space-y-2">
                            <p>The {itemType.toLowerCase()} <strong>"{itemName}"</strong> cannot be archived because it is currently being used.</p>

                                <Text strong className="text-red-700 text-base">
                                    {usageCount} user{usageCount !== 1 ? 's' : ''} currently assigned to this {itemType.toLowerCase()}
                                </Text>

                        </div>
                    }
                    type="warning"
                    showIcon
                    className="mb-4"
                />
            </div>
        </Modal>
    );
}