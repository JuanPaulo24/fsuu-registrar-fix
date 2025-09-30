import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Space, Popconfirm, Tag } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faArchive, faUndo } from "@fortawesome/pro-regular-svg-icons";
import { GET } from "../../../../../../providers/useAxiosQuery";
import ArchivePositionWarningModal from "./ArchivePositionWarningModal";
import NoData from "../../../../../../common/NoData";

const TablePosition = ({ 
    viewMode, 
    onEdit, 
    onArchive, 
    onRestore, 
    tableFilter, 
    setTableFilter, 
    onFetched,
    refreshKey,
}) => {
    const [rows, setRows] = useState([]);

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
        `api/positions?${params}`,
        "positions_list",
        {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
                const total = res?.data?.total || list.length || 0;
                setRows(list);
                if (onFetched) onFetched(total);
                devLog("POSITIONS: fetch success", { total, params });
            },
            onError: (err) => {
                devLog("POSITIONS: fetch error", err?.response?.data || err?.message || err);
            },
            isLoading: true,
            enabled: true,
        }
    );

    // Fetch user roles to map id -> role name (fallback when relation not eager-loaded)
    const { data: rolesApiData } = GET(
        `api/user_role?page_size=1000`,
        "user_roles_map_for_positions",
        {
            isLoading: false,
            enabled: true,
        }
    );

    const roleIdToName = useMemo(() => {
        const list = Array.isArray(rolesApiData?.data) ? rolesApiData.data : (rolesApiData?.data?.data || []);
        const map = {};
        (list || []).forEach((r) => {
            map[r.id] = r.user_role;
        });
        return map;
    }, [rolesApiData]);

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
        devLog("POSITIONS: table sort change", { columnKey: sorter.columnKey, order: sorter.order });
    };

    const [warning, setWarning] = useState({ open: false, positionName: "", usersCount: 0 });

    const showArchiveBlocked = (position) => {
        setWarning({ open: true, positionName: position?.position_name, usersCount: position?.users_count || 0 });
    };

    const renderActions = (record) => {
        if (viewMode === "archive") {
            return (
                <Popconfirm
                    title="Restore this position?"
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
            );
        } else {
            const hasUsers = Number(record?.users_count || 0) > 0;
            return (
                <Space size="middle">
                    <Button
                        type="link"
                        onClick={() => onEdit(record)}
                        icon={<FontAwesomeIcon icon={faEdit} />}
                        className="text-green-500 hover:text-green-700"
                    />
                    {hasUsers ? (
                        <Button
                            type="link"
                            onClick={() => showArchiveBlocked(record)}
                            icon={<FontAwesomeIcon icon={faArchive} />}
                            className="text-red-500 hover:text-red-700"
                        />
                    ) : (
                        <Popconfirm
                            title="Are you sure to archive this position?"
                            onConfirm={() => onArchive(record)}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button 
                                type="link" 
                                icon={<FontAwesomeIcon icon={faArchive} />}
                                className="text-red-500 hover:text-red-700"
                            />
                        </Popconfirm>
                    )}
                </Space>
            );
        }
    };

    const columns = [
        {
            title: "Actions",
            key: "action",
            dataIndex: "action",
            align: "center",
            render: (text, record) => renderActions(record),
            width: 120,
            fixed: 'left'
        },
        {
            title: "Position Name",
            dataIndex: "position_name",
            key: "position_name",
            sorter: true,
            render: (text, record) => (
                <div>
                    <div className="font-medium text-gray-900">{text}</div>
                    <div className="text-gray-500 text-sm">{record.description}</div>
                </div>
            )
        },
        {
            title: "User Role",
            key: "user_role",
            dataIndex: "user_role",
            width: 500,
            render: (userRole, record) => {
                // Prefer eager-loaded relation, otherwise fall back to roles map via user_role_id
                const fromRelation = userRole?.user_role || record?.user_role?.user_role;
                const fromMap = roleIdToName?.[record?.user_role_id];
                const roleName = fromRelation || fromMap || "No Role";
                return (
                    <Tag color="blue" style={{ fontSize: '12px' }}>
                        {roleName}
                    </Tag>
                );
            }
        },
        {
            title: "Users",
            key: "users",
            width: 100,
            render: (text, record) => (
                <Tag color={record.users_count > 0 ? "green" : "default"} style={{ fontSize: '11px' }}>
                    {record.users_count || 0}
                </Tag>
            ),
        },
        {
            title: "Created At",
            dataIndex: "created_at",
            key: "created_at",
            width: 300,
            sorter: true,
            render: (text) => {
                if (!text) return "-";
                const date = new Date(text);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            },
        },
    ];

    return (
        <>
        <Table
            id="tbl_positions"
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
        <ArchivePositionWarningModal
            open={warning.open}
            onClose={() => setWarning({ open: false, positionName: "", usersCount: 0 })}
            positionName={warning.positionName}
            usersCount={warning.usersCount}
        />
        </>
    );
};

export default TablePosition;