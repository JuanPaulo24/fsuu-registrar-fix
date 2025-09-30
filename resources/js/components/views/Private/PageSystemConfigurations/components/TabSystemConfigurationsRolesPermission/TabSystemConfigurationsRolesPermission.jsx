import { useEffect, useState } from "react";
import { Card, Button, Flex, message, Row, Col } from "antd";
import { faPlus, faRefresh } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageSystemConfigurationsContext from "../TabSystemsConfigurationsContext";
import ModalRoleForm from "./components/ModalRoleForm";
import TableUserRole from "./components/TableUserRole";
import ModalRolePermissions from "./components/ModalRolePermissions";
import ModalArchivePrevention from "../../../../../common/ModalArchivePrevention";
import { POST } from "../../../../../providers/useAxiosQuery";
import { apiUrl, token } from "../../../../../providers/appConfig";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../../providers/CustomTableFilter";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

export default function TabSystemConfigurationsRolesPermission() {
    const [toggleModalForm, setToggleModalForm] = useState({ open: false, data: null });
    const [permissionModal, setPermissionModal] = useState({ open: false, data: null });
    const [viewMode, setViewMode] = useState("active");
    const [tableFilter, setTableFilter] = useState({ 
        page: 1, 
        page_size: 10, 
        search: "",
        sort_field: "id",
        sort_order: "desc"
    });

    // table will fetch data itself; we just keep total for pagination widgets
    const [total, setTotal] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);
    
    // Archive prevention modal state
    const [archivePreventionModal, setArchivePreventionModal] = useState({
        visible: false,
        itemName: "",
        usageCount: 0,
        usageDetails: []
    });

    // Archive/Restore mutation
    const archiveUserRole = POST(
        "api/role_archived",
        "user_roles_list",
        true,
        () => {
            message.success("Role archived successfully");
        }
    );

    const restoreUserRole = POST(
        "api/role_archived",
        "user_roles_list",
        true,
        () => {
            message.success("Role restored successfully");
        }
    );

    // Handle view mode change
    useEffect(() => {
        setTableFilter(prev => ({
            ...prev,
            page: 1
        }));
    }, [viewMode]);

    const handleArchive = async (record) => {
        try {
            // Check if role is being used by any users
            const authToken = token();
            if (!authToken) {
                message.error('Authentication required. Please login again.');
                return;
            }

            const checkResponse = await fetch(apiUrl(`api/user-roles/${record.id}/usage-check`), {
                headers: {
                    'Authorization': authToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!checkResponse.ok) {
                throw new Error(`HTTP error! status: ${checkResponse.status}`);
            }
            
            const usageData = await checkResponse.json();
            
            if (import.meta.env.MODE !== 'production') {
                // eslint-disable-next-line no-console
                console.log('USER_ROLES: usage check response', usageData);
            }
            
            if (usageData.canArchive === false) {
                setArchivePreventionModal({
                    visible: true,
                    itemName: record.user_role || record.role_name || record.name,
                    usageCount: usageData.usageCount,
                    usageDetails: usageData.users || []
                });
                return;
            }
            
            // Proceed with archive if no users are assigned
            archiveUserRole.mutate({
                ids: [record.id],
                isTrash: false
            }, {
                onSuccess: () => {
                    setRefreshKey((k) => k + 1);
                    if (import.meta.env.MODE !== 'production') {
                        // eslint-disable-next-line no-console
                        console.log('USER_ROLES: archived', record.id);
                    }
                },
                onError: (err) => {
                    if (import.meta.env.MODE !== 'production') {
                        // eslint-disable-next-line no-console
                        console.log('USER_ROLES: archive error', err?.response?.data || err?.message || err);
                    }
                }
            });
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {
                // eslint-disable-next-line no-console
                console.log('USER_ROLES: usage check error', error);
            }
            message.error('Failed to check role usage. Please try again.');
        }
    };

    const handleRestore = (record) => {
        restoreUserRole.mutate({
            ids: [record.id],
            isTrash: true
        }, {
            onSuccess: () => {
                setRefreshKey((k) => k + 1);
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('USER_ROLES: restored', record.id);
                }
            },
            onError: (err) => {
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('USER_ROLES: restore error', err?.response?.data || err?.message || err);
                }
            }
        });
    };

    const handleEdit = (record) => {
        setToggleModalForm({ open: true, data: record });
    };

    const handleManagePermissions = (record) => {
        setPermissionModal({ open: true, data: record });
    };

    const handlePermissionModalClose = () => {
        setPermissionModal({ open: false, data: null });
    };

    const handlePermissionChange = () => {
        // Refresh the table or handle any updates needed after permission change
        setRefreshKey((k) => k + 1);
    };

    const handleAdd = () => {
        setToggleModalForm({ open: true, data: null });
    };

    const handleFetched = (totalRecords) => {
        setTotal(totalRecords);
    };

    const handleRefresh = () => {
        setRefreshKey((k) => k + 1);
    };

    

    return (
        <PageSystemConfigurationsContext.Provider value={{ 
            toggleModalForm, 
            setToggleModalForm, 
            viewMode,
            refreshKey,
            setRefreshKey
        }}>
            <Card>
                <Row gutter={[20, 20]} id="tbl_wrapper">
                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Flex
                            gap={16}
                            wrap="wrap"
                            align="center"
                            className="tbl-top-controls"
                            style={{ marginBottom: 16 }}
                        >
                            {hasButtonPermission('M-09-ROLES-ADD') && (
                                <Button
                                    type="primary"
                                    icon={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={handleAdd}
                                >
                                    Add New Role
                                </Button>
                            )}
                            
                            <Flex align="center" gap={8}>
                                <Button 
                                    type={viewMode === "active" ? "primary" : "default"} 
                                    onClick={() => setViewMode("active")}
                                >
                                    Active
                                </Button>
                                <Button 
                                    type={viewMode === "archive" ? "primary" : "default"} 
                                    onClick={() => setViewMode("archive")}
                                >
                                    Archive
                                </Button>
                            </Flex>
                            
                            <div style={{ flex: 1, minWidth: 200 }}>
                                <TableGlobalSearchAnimated
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    placeholder="Search roles..."
                                />
                            </div>
                            
                            <Button
                                type="default"
                                size="middle"
                                icon={<FontAwesomeIcon icon={faRefresh} />}
                                onClick={handleRefresh}
                                title="Refresh table data"
                                className="table-refresh-btn"
                            />
                            
                            <TablePageSize
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </Flex>
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <TableUserRole
                            viewMode={viewMode}
                            onEdit={handleEdit}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            onManagePermissions={handleManagePermissions}
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            onFetched={handleFetched}
                            refreshKey={refreshKey}
                        />
                    </Col>

                    <Col xs={24} sm={24} md={24} lg={24}>
                        <Flex
                            justify="space-between"
                            align="center"
                            className="tbl-bottom-filter"
                        >
                            <div />
                            <Flex align="center">
                                <TableShowingEntriesV2 />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={total}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper"
                                />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Card>

            <ModalRoleForm />
            
            <ModalRolePermissions
                visible={permissionModal.open}
                onClose={handlePermissionModalClose}
                roleData={permissionModal.data}
                onPermissionChange={handlePermissionChange}
            />
            
            <ModalArchivePrevention
                isVisible={archivePreventionModal.visible}
                onClose={() => setArchivePreventionModal({ visible: false, itemName: "", usageCount: 0, usageDetails: [] })}
                itemType="Role"
                itemName={archivePreventionModal.itemName}
                usageCount={archivePreventionModal.usageCount}
                usageDetails={archivePreventionModal.usageDetails}
            />
        </PageSystemConfigurationsContext.Provider>
    );
}
