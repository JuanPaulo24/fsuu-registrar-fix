import { Modal, Typography } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/pro-regular-svg-icons";

const { Text } = Typography;

export default function ModalActiveDocumentWarning({ 
    open, 
    onConfirm, 
    onCancel, 
    documentType, 
    profileName,
    profilesWithActiveDocuments 
}) {
    return (
        <Modal
            open={open}
            onOk={onConfirm}
            onCancel={onCancel}
            wrapClassName="modal-active-document-warning-wrap"
            title={
                <div className="active-document-warning-header">
                    <FontAwesomeIcon 
                        icon={faExclamationTriangle} 
                        style={{ color: '#faad14', marginRight: '8px' }} 
                    />
                    Active Document Warning
                </div>
            }
            okText="Yes, Proceed"
            cancelText="Cancel"
            okButtonProps={{
                className: "btn-warning"
            }}
            centered
            width={profilesWithActiveDocuments && profilesWithActiveDocuments.length > 1 ? 600 : 500}
        >
            <div className="active-document-warning-content">
                {profilesWithActiveDocuments && profilesWithActiveDocuments.length > 1 ? (
                    <>
                        <Text>
                            The following <strong>{profilesWithActiveDocuments.length} profiles</strong> already have active <strong>{documentType}</strong> documents:
                        </Text>
                        <ul style={{ margin: '12px 0', paddingLeft: '20px' }}>
                            {profilesWithActiveDocuments.map((profile, index) => (
                                <li key={index} style={{ marginBottom: '4px' }}>
                                    <Text strong>
                                        {profile.fullname || `${profile.firstname || ''} ${profile.lastname || ''}`}
                                    </Text>
                                    <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                                        (ID: {profile.id_number || profile.id})
                                    </Text>
                                </li>
                            ))}
                        </ul>
                        <Text>
                            Do you wish to proceed with generating new documents?
                        </Text>
                    </>
                ) : (
                    <Text>
                        A current <strong>{documentType}</strong> with this profile "<strong>{profileName}</strong>" is still active. 
                        Do you wish to proceed?
                    </Text>
                )}
                <br />
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                    Proceeding will create new versions of the documents while the previous versions remain active.
                </Text>
            </div>
        </Modal>
    );
}