import { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Table, Flex, Popconfirm, notification, Tag, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash, faEye } from "@fortawesome/pro-regular-svg-icons";
import { 
    faCheckCircle, 
    faTimesCircle, 
    faFileAlt,
    faExclamationTriangle 
} from "@fortawesome/pro-solid-svg-icons";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import PageStudentTrackingsContext from "./PageStudentTrackingsContext";
import ModalStudentDocumentHistory from "./ModalStudentDocumentHistory";

export default function TableStudentTrackings(props) {
    const {
        dataSource,
        onChangeTable,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
    } = useContext(PageStudentTrackingsContext);

    const navigate = useNavigate();
    const location = useLocation();

    // Modal state for document history
    const [documentHistoryVisible, setDocumentHistoryVisible] = useState(false);
    const [selectedStudentData, setSelectedStudentData] = useState(null);

    const { mutate: mutateDeactivateProfile, isLoading: loadingDeactivateProfile } =
        POST(`api/profile_deactivate`, "student_trackings_list");

    const handleDeactivate = (record) => {
        mutateDeactivateProfile(record, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "Student Tracking",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "Student Tracking",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
    };

    // Helper function to get documents by type for a profile
    const getDocumentsByType = (profile, documentType) => {
        if (!profile?.issued_document) return [];
        
        return profile.issued_document.filter(doc => 
            doc.document_type === documentType
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    };

    // Helper function to determine if a document is active (not revoked)
    const isDocumentActive = (document) => {
        return !document.date_revoked;
    };

    // Helper function to get the latest active document for a type
    const getLatestActiveDocument = (profile, documentType) => {
        const documents = getDocumentsByType(profile, documentType);
        return documents.find(doc => isDocumentActive(doc)) || null;
    };

    // Function to handle opening document history modal
    const handleViewDocumentHistory = (record) => {
        setSelectedStudentData(record);
        setDocumentHistoryVisible(true);
    };

    // Function to render document status based on real data
    const renderDocumentStatus = (record, documentType) => {
        const latestActive = getLatestActiveDocument(record, documentType);
        const allDocuments = getDocumentsByType(record, documentType);
        
        let icon, color, text, iconColor;
        
        if (latestActive) {
            icon = faCheckCircle;
            color = 'success';
            text = 'Has Document';
            iconColor = 'text-green-500';
        } else if (allDocuments.length > 0) {
            // Has documents but all are revoked
            icon = faExclamationTriangle;
            color = 'warning';
            text = 'No Document';
            iconColor = 'text-orange-500';
        } else {
            icon = faTimesCircle;
            color = 'error';
            text = 'No Document';
            iconColor = 'text-red-500';
        }

        return (
            <Space size="small">
                <FontAwesomeIcon 
                    icon={icon} 
                    className={iconColor}
                />
                <Tag color={color} size="small">
                    {text}
                </Tag>
            </Space>
        );
    };


    
    return (
        <>
        <Table
            id="tbl_student_trackings"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource && dataSource.data && dataSource.data.data}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            <Table.Column
                title="Action"
                key="action"
                dataIndex="action"
                align="center"
                render={(text, record) => {
                    return (
                        <Flex gap={10} justify="center">
                            <Button
                                type="link"
                                className="w-auto h-auto p-0"
                                onClick={() => handleViewDocumentHistory(record)}
                                name="btn_view_documents"
                                icon={<FontAwesomeIcon icon={faEye} />}
                                title="View Document History"
                            />
                        </Flex>
                    );
                }}
                width={100}
            />

            <Table.Column
                title="School ID"
                key="id_number"
                dataIndex="id_number"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="Full Name"
                key="fullname"
                dataIndex="fullname"
                sorter={true}
                width={250}
            />
            <Table.Column
                title="Gender"
                key="gender"
                dataIndex="gender"
                sorter={true}
                align="center"
                width={120}
            />
                <Table.Column
                    title="Program"
                    key="course"
                    dataIndex="course"
                sorter={true}
                width={150}
            />
            <Table.Column
                title="TOR Status"
                key="tor_status"
                dataIndex="tor_status"
                align="center"
                width={150}
                render={(text, record) => renderDocumentStatus(record, 'Transcript of Records')}
            />
            <Table.Column
                title="Diploma Status"
                key="diploma_status"
                dataIndex="diploma_status"
                align="center"
                width={150}
                render={(text, record) => renderDocumentStatus(record, 'Diploma')}
            />
            <Table.Column
                title="Certificate of Units Earned"
                key="certificate_status"
                dataIndex="certificate_status"
                align="center"
                width={180}
                render={(text, record) => renderDocumentStatus(record, 'Certificate of Units Earned')}
            />
        </Table>
        
        {/* Document History Modal */}
        <ModalStudentDocumentHistory
            visible={documentHistoryVisible}
            onCancel={() => {
                setDocumentHistoryVisible(false);
                setSelectedStudentData(null);
            }}
            profileData={selectedStudentData}
        />
        </>
    );
}
