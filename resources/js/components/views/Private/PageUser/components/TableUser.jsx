import { useContext, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, Button, notification, Popconfirm, Flex } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEnvelope,
    faPencil,
    faUserSlash,
    faUserGear,
} from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";

import { POST } from "../../../../providers/useAxiosQuery";
import notificationErrors from "../../../../providers/notificationErrors";
import PageUserContext from "./PageUserContext";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

export default function TableUser(props) {
    const {
        dataSource,
        onChangeTable,
        tableFilter,
        setTableFilter,
        selectedRowKeys,
        setSelectedRowKeys,
    } = useContext(PageUserContext);

    const navigate = useNavigate();
    const location = useLocation();
    
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-03-EDIT',
        'M-03-DEACTIVATE'
    ]);

    const { mutate: mutateDeactivateUser, loading: loadingDeactivateUser } =
        POST(`api/user_deactivate`, "users_registrar_staff_list");

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

    // Check if user has any action permissions
    const hasAnyActionPermission = useMemo(() => {
        return buttonPermissions['M-03-EDIT'] || buttonPermissions['M-03-DEACTIVATE'];
    }, [buttonPermissions]);

    return (
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
