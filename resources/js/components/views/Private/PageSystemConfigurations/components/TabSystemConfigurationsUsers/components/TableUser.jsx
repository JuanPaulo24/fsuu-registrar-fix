import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, Button, Popconfirm, Flex, Tag, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPencil,
    faEnvelope,
    faUserSlash,
    faUndo,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";
import { useQueryClient } from "react-query";

import { GET, POST } from "../../../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../../../providers/notificationErrors";
import NoData from "../../../../../../common/NoData";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";
import ModalPasswordVerification from "../../../../PageDocumentManagement/components/ModalPasswordVerification";
import { showGlobalLoading, hideGlobalLoading } from "@/components/providers/globalLoading";

export default function TableUser(props) {
    const {
        dataSource,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
        viewMode,
    } = props;

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
        'M-09-USERS-EDIT',
        'M-09-USERS-DEACTIVATE',
        'M-09-USERS-REACTIVATE',
        'M-04-COMPOSE'
    ]);

    const { mutate: mutateDeactivateUser, loading: loadingDeactivateUser } =
        POST(`api/user_deactivate`, "users_active_list");

    const { mutate: mutateReactivateUser, loading: loadingReactivateUser } =
        POST(`api/user_reactivate`, "users_active_list");

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
                            queryClient.invalidateQueries(["users_active_list"]);
                            
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
                            queryClient.invalidateQueries(["users_active_list"]);
                            
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

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter((ps) => ({
            ...ps,
            sort_field: sorter.columnKey,
            sort_order: sorter.order ? sorter.order.replace("end", "") : null,
            page: 1,
            page_size: "50",
        }));
    };

    // Check if user has any action permissions
    const hasAnyActionPermission = useMemo(() => {
        if (viewMode === "deactivated") {
            return buttonPermissions['M-09-USERS-REACTIVATE'];
        }
        return buttonPermissions['M-09-USERS-EDIT'] || buttonPermissions['M-09-USERS-DEACTIVATE'];
    }, [buttonPermissions, viewMode]);

    return (
        <>
        <Table
            id="tbl_user"
            className="ant-table-default ant-table-striped"
            dataSource={dataSource?.data?.data || []}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            onChange={onChangeTable}
            scroll={{ x: "max-content" }}
            sticky
            loading={false}
            locale={{
                emptyText: <NoData />
            }}
        >
            {hasAnyActionPermission && (
                <Table.Column
                    title="Action"
                    key="action"
                    dataIndex="action"
                    align="center"
                    render={(text, record) => {
                        if (viewMode === "deactivated") {
                            return buttonPermissions['M-09-USERS-REACTIVATE'] ? (
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
                                    {buttonPermissions['M-09-USERS-EDIT'] && (
                                        <Button
                                            type="link"
                                            className="w-auto h-auto p-0"
                                            onClick={() => {
                                                navigate(`/system-configurations/users/edit/${record.uuid}`);
                                            }}
                                            name="btn_edit"
                                            icon={<FontAwesomeIcon icon={faPencil} />}
                                        />
                                    )}
                                    {buttonPermissions['M-09-USERS-DEACTIVATE'] && (
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
                    width={100}
                />
            )}
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
                                        `/system-configurations/users/edit/${record.uuid}`
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
