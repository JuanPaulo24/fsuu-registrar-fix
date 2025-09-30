import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, Button, Popconfirm, Flex, Tag, notification } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPencil,
    faEnvelope,
    faUserSlash,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { GET, POST } from "../../../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../../../providers/notificationErrors";
import NoData from "../../../../../../common/NoData";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

export default function TableUser(props) {
    const {
        dataSource,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
    } = props;

    const navigate = useNavigate();
    const location = useLocation();
    
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-09-USERS-EDIT',
        'M-09-USERS-DEACTIVATE'
    ]);

    const { mutate: mutateDeactivateUser, loading: loadingDeactivateUser } =
        POST(`api/user_deactivate`, "users_active_list");

    const handleDeactivate = (record) => {
        mutateDeactivateUser(record, {
            onSuccess: (res) => {
                if (res.success) {
                    notification.success({
                        message: "User",
                        description: res.message,
                    });
                } else {
                    notification.error({
                        message: "User",
                        description: res.message,
                    });
                }
            },
            onError: (err) => {
                notificationErrors(err);
            },
        });
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
        return buttonPermissions['M-09-USERS-EDIT'] || buttonPermissions['M-09-USERS-DEACTIVATE'];
    }, [buttonPermissions]);

    return (
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
                                    <Popconfirm
                                        title="Are you sure to deactivate this data?"
                                        onConfirm={() => {
                                            handleDeactivate(record);
                                        }}
                                        onCancel={() => {
                                            notification.error({
                                                message: "User",
                                                description: "Data not deactivated",
                                            });
                                        }}
                                        okText="Yes"
                                        cancelText="No"
                                    >
                                        <Button
                                            type="link"
                                            className="w-auto h-auto p-0 text-danger"
                                            loading={loadingDeactivateUser}
                                            name="btn_delete"
                                            icon={<FontAwesomeIcon icon={faUserSlash} />}
                                        />
                                    </Popconfirm>
                                )}
                            </Flex>
                        );
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
                    ) : null
                }
                width={220}
            />
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
    );
}
