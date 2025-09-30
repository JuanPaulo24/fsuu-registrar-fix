import { useEffect, useState } from "react";
import { Card, Button, Flex, message, Row, Col } from "antd";
import { faPlus, faRefresh } from "@fortawesome/pro-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PageSystemConfigurationsContext from "../TabSystemsConfigurationsContext";
import ModalCourseForm from "./components/ModalCourseForm";
import TableCourse from "./components/TableCourse";
import ModalArchivePrevention from "../../../../../common/ModalArchivePrevention";
import { POST, GET } from "../../../../../providers/useAxiosQuery";
import { apiUrl, token } from "../../../../../providers/appConfig";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../../providers/CustomTableFilter";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

export default function TabSystemConfigurationsCourse() {
    const [toggleModalForm, setToggleModalForm] = useState({ open: false, data: null });
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
    const archiveCourse = POST(
        "api/course_archived",
        "courses_list",
        true,
        () => {
            message.success("Title archived successfully");
        }
    );

    const restoreCourse = POST(
        "api/course_archived",
        "courses_list",
        true,
        () => {
            message.success("Title restored successfully");
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
            // Check if course is being used by any users
            const authToken = token();
            if (!authToken) {
                message.error('Authentication required. Please login again.');
                return;
            }

            const checkResponse = await fetch(apiUrl(`api/courses/${record.id}/usage-check`), {
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
                console.log('COURSES: usage check response', usageData);
            }
            
            if (usageData.canArchive === false) {
                setArchivePreventionModal({
                    visible: true,
                    itemName: record.course_name,
                    usageCount: usageData.usageCount,
                    usageDetails: usageData.users || []
                });
                return;
            }
            
            // Proceed with archive if no users are assigned
            archiveCourse.mutate({
                ids: [record.id],
                isTrash: false
            }, {
                onSuccess: () => {
                    setRefreshKey((k) => k + 1);
                    if (import.meta.env.MODE !== 'production') {
                        // eslint-disable-next-line no-console
                        console.log('COURSES: archived', record.id);
                    }
                },
                onError: (err) => {
                    if (import.meta.env.MODE !== 'production') {
                        // eslint-disable-next-line no-console
                        console.log('COURSES: archive error', err?.response?.data || err?.message || err);
                    }
                }
            });
        } catch (error) {
            if (import.meta.env.MODE !== 'production') {
                // eslint-disable-next-line no-console
                console.log('COURSES: usage check error', error);
            }
            message.error('Failed to check title usage. Please try again.');
        }
    };

    const handleRestore = (record) => {
        restoreCourse.mutate({
            ids: [record.id],
            isTrash: true
        }, {
            onSuccess: () => {
                setRefreshKey((k) => k + 1);
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('COURSES: restored', record.id);
                }
            },
            onError: (err) => {
                if (import.meta.env.MODE !== 'production') {
                    // eslint-disable-next-line no-console
                    console.log('COURSES: restore error', err?.response?.data || err?.message || err);
                }
            }
        });
    };

    const handleEdit = (record) => {
        setToggleModalForm({ open: true, data: record });
    };

    const handleAdd = () => {
        setToggleModalForm({ open: true, data: null });
    };

    const handleFetched = (count) => setTotal(count || 0);

    const handleRefresh = () => {
        setRefreshKey((k) => k + 1);
    };

    return (
        <PageSystemConfigurationsContext.Provider value={{ toggleModalForm, setToggleModalForm, viewMode }}>
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
                            {hasButtonPermission('M-09-TITLES-ADD') && (
                                <Button
                                    type="primary"
                                    icon={<FontAwesomeIcon icon={faPlus} />}
                                    onClick={handleAdd}
                                >
                                    Add New Title
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
                                    placeholder="Search titles..."
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
                        <TableCourse
                            viewMode={viewMode}
                            onEdit={handleEdit}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
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

            <ModalCourseForm />
            
            <ModalArchivePrevention
                isVisible={archivePreventionModal.visible}
                onClose={() => setArchivePreventionModal({ visible: false, itemName: "", usageCount: 0, usageDetails: [] })}
                itemType="Title"
                itemName={archivePreventionModal.itemName}
                usageCount={archivePreventionModal.usageCount}
                usageDetails={archivePreventionModal.usageDetails}
            />
        </PageSystemConfigurationsContext.Provider>
    );
}
