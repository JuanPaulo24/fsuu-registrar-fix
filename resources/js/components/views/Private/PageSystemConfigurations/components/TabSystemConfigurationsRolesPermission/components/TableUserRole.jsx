import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Space, Popconfirm, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faArchive, faUndo, faShieldKeyhole } from "@fortawesome/pro-regular-svg-icons";
import { GET } from "../../../../../../providers/useAxiosQuery";
import NoData from "../../../../../../common/NoData";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

const TableUserRole = ({ 
    viewMode, 
    onEdit, 
    onArchive, 
    onRestore, 
    onManagePermissions,
    tableFilter, 
    setTableFilter, 
    onFetched,
    refreshKey,
}) => {
    const [rows, setRows] = useState([]);
    
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-09-ROLES-MANAGE',
        'M-09-ROLES-EDIT',
        'M-09-ROLES-ARCHIVE',
        'M-09-ROLES-RESTORE'
    ]);

    const devLog = (...args) => {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.MODE !== 'production') {
            // eslint-disable-next-line no-console
            console.log(...args);
        }
    };

    const params = useMemo(() => {
        const query = { ...tableFilter };
        // Only send isTrash when viewing Archive; omit for Active
        if (viewMode === "archive") {
            query.isTrash = 1;
        } else {
            delete query.isTrash;
        }
        return new URLSearchParams(query).toString();
    }, [tableFilter, viewMode]);

    const { data: apiData, isLoading, refetch } = GET(
        `api/user_role?${params}`,
        "user_roles_list",
        {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
                const total = res?.data?.total || list.length || 0;
                setRows(list);
                if (onFetched) onFetched(total);
                devLog("USER_ROLES: fetch success", { total, params });
            },
            onError: (err) => {
                devLog("USER_ROLES: fetch error", err?.response?.data || err?.message || err);
            },
            isLoading: true,
            enabled: true,
        }
    );

    useEffect(() => {
        refetch();
    }, [params, refreshKey]);

    const onChangeTable = (pagination, filters, sorter) => {
        setTableFilter(prev => ({
            ...prev,
            sort_field: sorter.columnKey || "id",
            sort_order: sorter.order ? sorter.order.replace("end", "") : "desc",
            page: 1,
        }));
        devLog("USER_ROLES: table sort change", { columnKey: sorter.columnKey, order: sorter.order });
    };

    // Check if user has any action permissions
    const hasAnyActionPermission = useMemo(() => {
        if (viewMode === "archive") {
            return buttonPermissions['M-09-ROLES-RESTORE'];
        } else {
            return buttonPermissions['M-09-ROLES-MANAGE'] || 
                   buttonPermissions['M-09-ROLES-EDIT'] || 
                   buttonPermissions['M-09-ROLES-ARCHIVE'];
        }
    }, [buttonPermissions, viewMode]);

    const renderActions = (record) => {
        if (viewMode === "archive") {
            return buttonPermissions['M-09-ROLES-RESTORE'] ? (
                <Popconfirm
                    title="Restore this role?"
                    onConfirm={() => onRestore(record)}
                    okText="Yes"
                    cancelText="No"
                >
                    <Button 
                        type="link" 
                        icon={<FontAwesomeIcon icon={faUndo} />}
                        className="text-blue-500 hover:text-blue-700"
                    />
                </Popconfirm>
            ) : null;
        } else {
            return (
                <Space size="middle">
                    {buttonPermissions['M-09-ROLES-MANAGE'] && (
                        <Button
                            type="link"
                            onClick={() => onManagePermissions(record)}
                            icon={<FontAwesomeIcon icon={faShieldKeyhole} />}
                            className="text-blue-500 hover:text-blue-700"
                            title="Manage Permissions"
                        />
                    )}
                    {buttonPermissions['M-09-ROLES-EDIT'] && (
                        <Button
                            type="link"
                            onClick={() => onEdit(record)}
                            icon={<FontAwesomeIcon icon={faEdit} />}
                            className="text-green-500 hover:text-green-700"
                            title="Edit Role"
                        />
                    )}
                    {buttonPermissions['M-09-ROLES-ARCHIVE'] && (
                        <Popconfirm
                            title="Archive this role?"
                            description="Are you sure you want to archive this role?"
                            onConfirm={() => onArchive(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button
                                type="link"
                                icon={<FontAwesomeIcon icon={faArchive} />}
                                className="text-red-500 hover:text-red-700"
                                title="Archive Role"
                            />
                        </Popconfirm>
                    )}
                </Space>
            );
        }
    };

    const columns = useMemo(() => {
        const baseColumns = [];
        
        // Only add Actions column if user has any action permissions
        if (hasAnyActionPermission) {
            baseColumns.push({
                title: "Actions",
                key: "action",
                dataIndex: "action",
                align: "center",
                render: (text, record) => renderActions(record),
                width: 300,
                fixed: 'left'
            });
        }
        
        baseColumns.push({
            title: "User Role",
            dataIndex: "user_role",
            key: "user_role",
            sorter: true,
            render: (text) => (
                <span className="text-gray-700">{text}</span>
            )
        });
        
        return baseColumns;
    }, [hasAnyActionPermission, viewMode, buttonPermissions]);

    return (
        <>
        <Table
            id="tbl_user_roles"
            className="ant-table-default ant-table-striped"
            dataSource={rows}
            rowKey={(record) => record.id}
            pagination={false}
            bordered={false}
            scroll={{ x: "max-content" }}
            sticky
            onChange={onChangeTable}
            loading={false}
            columns={columns}
            locale={{
                emptyText: <NoData />
            }}
            size="small"
        />
        </>
    );
};

export default TableUserRole;