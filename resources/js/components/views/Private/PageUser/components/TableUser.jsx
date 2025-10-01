import { useContext, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, Button, notification, Popconfirm, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faPencil,
    faUserSlash,
    faUserGear,
    faUndo,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";
import { useQueryClient } from "react-query";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import PageUserContext from "./PageUserContext";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";
import ModalPasswordVerification from "../../PageDocumentManagement/components/ModalPasswordVerification";
import { showGlobalLoading, hideGlobalLoading } from "@/components/providers/globalLoading";

export default function TableUser(props) {
    const {
        dataSource,
        onChangeTable,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
        viewMode,
    } = useContext(PageUserContext);

    const navigate = useNavigate();
    const location = useLocation();
    const queryClient = useQueryClient();
    
    const [passwordVerification, setPasswordVerification] = useState({
        open: false,
        record: null,
        action: null, // 'deactivate' or 'reactivate'
    });
    
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-03-EDIT',
        'M-03-DEACTIVATE',
        'M-03-REACTIVATE',
        'M-04-COMPOSE'
    ]);

    const { mutate: mutateDeactivateUser, loading: loadingDeactivateUser } =
        POST(`api/user_deactivate`, "users_registrar_staff_list");

    const { mutate: mutateReactivateUser, loading: loadingReactivateUser } =
        POST(`api/user_reactivate`, "users_registrar_staff_list");

    const handleDeactivateClick = (record) => {
        setPasswordVerification({
            open: true,
            record: record,
            action: 'deactivate',
        });
    };

    const handleReactivateClick = (record) => {
        setPasswordVerification({
            open: true,
            record: record,
            action: 'reactivate',
        });
    };

    const handlePasswordVerified = () => {
        if (passwordVerification.record) {
            showGlobalLoading();
            
            if (passwordVerification.action === 'deactivate') {
                mutateDeactivateUser(passwordVerification.record, {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "User",
                                description: res.message,
                            });
                            queryClient.invalidateQueries(["users_registrar_staff_list"]);
                            
                            setTimeout(() => {
                                hideGlobalLoading();
                            }, 500);
                        } else {
                            notification.error({
                                message: "User",
                                description: res.message,
                            });
                            hideGlobalLoading();
                        }
                        setPasswordVerification({ open: false, record: null, action: null });
                    },
                    onError: (err) => {
                        notificationErrors(err);
                        hideGlobalLoading();
                        setPasswordVerification({ open: false, record: null, action: null });
                    },
                });
            } else if (passwordVerification.action === 'reactivate') {
                mutateReactivateUser(passwordVerification.record, {
                    onSuccess: (res) => {
                        if (res.success) {
                            notification.success({
                                message: "User",
                                description: res.message,
                            });
                            queryClient.invalidateQueries(["users_registrar_staff_list"]);
                            
                            setTimeout(() => {
                                hideGlobalLoading();
                            }, 500);
                        } else {
                            notification.error({
                                message: "User",
                                description: res.message,
                            });
                            hideGlobalLoading();
                        }
                        setPasswordVerification({ open: false, record: null, action: null });
                    },
                    onError: (err) => {
                        notificationErrors(err);
                        hideGlobalLoading();
                        setPasswordVerification({ open: false, record: null, action: null });
                    },
                });
            }
        }
    };

    // Check if user has any action permissions
    const hasAnyActionPermission = useMemo(() => {
        if (viewMode === "deactivated") {
            return buttonPermissions['M-03-REACTIVATE'];
        }
        return buttonPermissions['M-03-EDIT'] || buttonPermissions['M-03-DEACTIVATE'];
    }, [buttonPermissions, viewMode]);

    return (
        <>
        <Table
            id="tbl_user"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource && dataSource.data && dataSource.data.data}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
        >
            {hasAnyActionPermission && (
                <Table.Column
                    title="Action"
                    key="action"
                    dataIndex="action"
                    align="center"
                    render={(text, record) => {
                        if (viewMode === "deactivated") {
                            return buttonPermissions['M-03-REACTIVATE'] ? (
                                <Button 
                                    type="link" 
                                    icon={<FontAwesomeIcon icon={faUndo} />}
                                    className="text-blue-500 hover:text-blue-700"
                                    onClick={() => handleReactivateClick(record)}
                                    title="Reactivate User"
                                />
                            ) : null;
                        } else {
                            return (
                                <Flex gap={10} justify="center">
                                    {buttonPermissions['M-03-EDIT'] && (
                                        <Button
                                            type="link"
                                            className="w-auto h-auto p-0"
                                            onClick={() => {
                                                navigate(`/users/edit/${record.uuid}`);
                                            }}
                                            name="btn_edit"
                                            icon={<FontAwesomeIcon icon={faPencil} />}
                                        />
                                    )}
                                    {buttonPermissions['M-03-DEACTIVATE'] && (
                                        <Button
                                            type="link"
                                            className="w-auto h-auto p-0 text-danger"
                                            onClick={() => handleDeactivateClick(record)}
                                            name="btn_delete"
                                            icon={<FontAwesomeIcon icon={faUserSlash} />}
                                            title="Deactivate User"
                                        />
                                    )}
                                </Flex>
                            );
                        }
                    }}
                    width={150}
                />
            )}
            <Table.Column
                title="Start Date"
                key="created_at"
                dataIndex="created_at"
                render={(text, _) =>
                    text ? dayjs(text).format("MM/DD/YYYY") : ""
                }
                sorter
                width={150}
            />
            <Table.Column
                title="Full Name"
                key="fullname"
                dataIndex="fullname"
                sorter={true}
                render={(text, record) =>
                    text ? (
                        viewMode === "deactivated" ? (
                            <span className="text-gray-700">{text}</span>
                        ) : (
                            <Button
                                type="link"
                                className="p-0 w-auto h-auto"
                                onClick={() => {
                                    navigate(
                                        `${location.pathname}/edit/${record.uuid}`
                                    );
                                }}
                            >
                                {text}
                            </Button>
                        )
                    ) : null
                }
                width={220}
            />
            {buttonPermissions['M-04-COMPOSE'] && (
                <Table.Column
                    title="Email"
                    key="email"
                    dataIndex="email"
                    sorter={true}
                    align="center"
                    render={(text, record) =>
                        text ? (
                            <Button
                                type="link"
                                className="p-0 w-auto h-auto"
                                icon={<FontAwesomeIcon icon={faEnvelope} />}
                                onClick={() => {
                                    navigate('/email', {
                                        state: {
                                            composeData: {
                                                to: text
                                            }
                                        }
                                    });
                                }}
                                title={`Send email to ${text}`}
                            />
                        ) : null
                    }
                    width={220}
                />
            )}

            <Table.Column
                title="User Role"
                key="user_role"
                dataIndex="user_role"
                sorter={true}
                render={(text, record) => record.user_role?.user_role || ''}
                width={150}
            />
            <Table.Column
                title="Status"
                key="status"
                dataIndex="status"
                sorter={true}
                align="center"
                width={150}
            />
        </Table>
        
        <ModalPasswordVerification
            open={passwordVerification.open}
            onCancel={() => setPasswordVerification({ open: false, record: null, action: null })}
            onSuccess={handlePasswordVerified}
            title={passwordVerification.action === 'deactivate' ? "Deactivate User - Password Verification" : "Reactivate User - Password Verification"}
            description={passwordVerification.action === 'deactivate' 
                ? "To deactivate this user, please verify your identity by entering your password."
                : "To reactivate this user, please verify your identity by entering your password."}
        />
        </>
    );
}
