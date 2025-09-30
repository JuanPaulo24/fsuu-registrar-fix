import React, { useEffect, useMemo, useState } from "react";
import { Table, Button, Space, Popconfirm } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faArchive, faUndo } from "@fortawesome/pro-regular-svg-icons";
import { GET } from "../../../../../../providers/useAxiosQuery";
import NoData from "../../../../../../common/NoData";
import { hasMultipleButtonPermissions } from "@/hooks/useButtonPermissions";

const TableCourse = ({ 
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
    
    // Check button permissions
    const buttonPermissions = hasMultipleButtonPermissions([
        'M-09-TITLES-EDIT',
        'M-09-TITLES-ARCHIVE',
        'M-09-TITLES-RESTORE'
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
        `api/courses?${params}`,
        "courses_list",
        {
            onSuccess: (res) => {
                const list = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
                const total = res?.data?.total || list.length || 0;
                setRows(list);
                if (onFetched) onFetched(total);
                devLog("COURSES: fetch success", { total, params });
            },
            onError: (err) => {
                devLog("COURSES: fetch error", err?.response?.data || err?.message || err);
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
        devLog("COURSES: table sort change", { columnKey: sorter.columnKey, order: sorter.order });
    };

    // Check if user has any action permissions
    const hasAnyActionPermission = useMemo(() => {
        if (viewMode === "archive") {
            return buttonPermissions['M-09-TITLES-RESTORE'];
        } else {
            return buttonPermissions['M-09-TITLES-EDIT'] || buttonPermissions['M-09-TITLES-ARCHIVE'];
        }
    }, [buttonPermissions, viewMode]);

    const renderActions = (record) => {
        if (viewMode === "archive") {
            return buttonPermissions['M-09-TITLES-RESTORE'] ? (
                <Popconfirm
                    title="Restore this title?"
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
                    {buttonPermissions['M-09-TITLES-EDIT'] && (
                        <Button
                            type="link"
                            onClick={() => onEdit(record)}
                            icon={<FontAwesomeIcon icon={faEdit} />}
                            className="text-green-500 hover:text-green-700"
                        />
                    )}
                    {buttonPermissions['M-09-TITLES-ARCHIVE'] && (
                        <Popconfirm
                            title="Are you sure to archive this title?"
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
                width: 120,
                fixed: 'left'
            });
        }
        
        baseColumns.push(
            {
                title: "Initial Title",
                key: "course_code",
                dataIndex: "course_code",
                width: 150,
                sorter: true,
                render: (text) => (
                    <span className="font-medium text-gray-900">{text}</span>
                )
            },
            {
                title: "Title",
                key: "course_name",
                dataIndex: "course_name",
                width: 400,
                sorter: true,
                render: (text) => (
                    <span className="text-gray-700">{text}</span>
                )
            }
        );
        
        return baseColumns;
    }, [hasAnyActionPermission, viewMode, buttonPermissions]);

    return (
        <Table
            id="tbl_courses"
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
    );
};

export default TableCourse;