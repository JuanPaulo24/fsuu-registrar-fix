import { useState, useEffect } from "react";
import { Card, Button, Table, Space, Tag, Flex, Row, Col } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faEye, faEdit } from "@fortawesome/pro-regular-svg-icons";
import ModalCreateTicket from "./ModalCreateTicket";
import ModalViewTicket from "./ModalViewTicket";
import {
    TableGlobalSearchAnimated,
    TablePageSize,
    TablePagination,
    TableShowingEntriesV2,
} from "../../../../../providers/CustomTableFilter";

// Sample ticket data for UI demonstration
const sampleTickets = [
    {
        id: 1,
        ticket_number: "TKT-2025-001",
        title: "Login Issue - Cannot Access System",
        category: "Authentication",
        priority: "High",
        status: "Open",
        reported_by: "John Doe",
        assigned_to: "IT Support Team",
        created_at: "2025-01-10 09:30:00",
        updated_at: "2025-01-10 09:30:00",
        description: "User unable to login to the system despite correct credentials.",
    },
    {
        id: 2,
        ticket_number: "TKT-2025-002",
        title: "Database Connection Error",
        category: "Technical",
        priority: "Critical",
        status: "In Progress",
        reported_by: "Jane Smith",
        assigned_to: "Database Admin",
        created_at: "2025-01-09 14:15:00",
        updated_at: "2025-01-10 08:45:00",
        description: "Database connection timeouts causing system slowdowns.",
    },
    {
        id: 3,
        ticket_number: "TKT-2025-003",
        title: "Feature Request - Export Functionality",
        category: "Enhancement",
        priority: "Low",
        status: "Resolved",
        reported_by: "Mike Johnson",
        assigned_to: "Development Team",
        created_at: "2025-01-08 11:20:00",
        updated_at: "2025-01-10 16:30:00",
        description: "Request to add PDF export functionality to reports module.",
    },
    {
        id: 4,
        ticket_number: "TKT-2025-004",
        title: "UI Bug - Button Misalignment",
        category: "Bug",
        priority: "Medium",
        status: "Open",
        reported_by: "Sarah Wilson",
        assigned_to: "Frontend Team",
        created_at: "2025-01-10 13:45:00",
        updated_at: "2025-01-10 13:45:00",
        description: "Submit buttons are misaligned on mobile devices.",
    },
];

export default function TabTicketingSystem() {
    const [toggleModalCreate, setToggleModalCreate] = useState({ open: false });
    const [toggleModalView, setToggleModalView] = useState({ open: false, data: null });
    const [viewMode, setViewMode] = useState("all");
    const [tableFilter, setTableFilter] = useState({ 
        page: 1, 
        page_size: 10, 
        search: "",
        sort_field: "created_at",
        sort_order: "desc"
    });
    
    const [tickets, setTickets] = useState(sampleTickets);

    // Filter tickets based on view mode
    const getFilteredTickets = () => {
        let filtered = tickets;
        
        if (viewMode !== "all") {
            filtered = tickets.filter(ticket => 
                ticket.status.toLowerCase() === viewMode.toLowerCase()
            );
        }
        
        // Apply search filter
        if (tableFilter.search) {
            filtered = filtered.filter(ticket =>
                ticket.title.toLowerCase().includes(tableFilter.search.toLowerCase()) ||
                ticket.ticket_number.toLowerCase().includes(tableFilter.search.toLowerCase()) ||
                ticket.category.toLowerCase().includes(tableFilter.search.toLowerCase()) ||
                ticket.reported_by.toLowerCase().includes(tableFilter.search.toLowerCase())
            );
        }
        
        return filtered;
    };

    const filteredTickets = getFilteredTickets();
    const startIndex = (tableFilter.page - 1) * tableFilter.page_size;
    const endIndex = startIndex + tableFilter.page_size;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    // Handle page overflow when data changes
    useEffect(() => {
        const maxPage = Math.ceil(filteredTickets.length / tableFilter.page_size);
        if (tableFilter.page > maxPage && maxPage > 0) {
            setTableFilter(prev => ({ ...prev, page: maxPage }));
        }
    }, [filteredTickets.length, tableFilter.page_size, tableFilter.page]);

    const getPriorityColor = (priority) => {
        switch (priority.toLowerCase()) {
            case "critical": return "red";
            case "high": return "orange";
            case "medium": return "blue";
            case "low": return "green";
            default: return "default";
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case "open": return "processing";
            case "in progress": return "warning";
            case "resolved": return "success";
            case "closed": return "default";
            default: return "default";
        }
    };

    const columns = [
        {
            title: "Ticket #",
            dataIndex: "ticket_number",
            key: "ticket_number",
            width: 140,
            render: (text) => <span className="font-semibold text-blue-600">{text}</span>,
        },
        {
            title: "Title",
            dataIndex: "title",
            key: "title",
            ellipsis: true,
        },
        {
            title: "Category",
            dataIndex: "category",
            key: "category",
            width: 120,
            render: (category) => (
                <Tag color="blue">{category}</Tag>
            ),
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: 100,
            render: (priority) => (
                <Tag color={getPriorityColor(priority)}>{priority}</Tag>
            ),
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            width: 120,
            render: (status) => (
                <Tag color={getStatusColor(status)}>{status}</Tag>
            ),
        },
        {
            title: "Reported By",
            dataIndex: "reported_by",
            key: "reported_by",
            width: 150,
        },
        {
            title: "Created",
            dataIndex: "created_at",
            key: "created_at",
            width: 150,
            render: (date) => new Date(date).toLocaleDateString(),
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        size="small"
                        icon={<FontAwesomeIcon icon={faEye} />}
                        onClick={() => setToggleModalView({ open: true, data: record })}
                        title="View Details"
                    />
                    <Button
                        type="text"
                        size="small"
                        icon={<FontAwesomeIcon icon={faEdit} />}
                        onClick={() => setToggleModalCreate({ open: true, data: record })}
                        title="Edit Ticket"
                    />
                </Space>
            ),
        },
    ];

    return (
        <>
            <Card>
                {/* Header Section */}
                <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={24} sm={12} md={8}>
                        <Button
                            type="primary"
                            icon={<FontAwesomeIcon icon={faPlus} />}
                            onClick={() => setToggleModalCreate({ open: true })}
                            block
                        >
                            Create New Ticket
                        </Button>
                    </Col>
                    <Col xs={24} sm={12} md={16}>
                        <Flex justify="flex-end" gap={8} wrap="wrap">
                            <Button 
                                type={viewMode === "all" ? "primary" : "default"}
                                onClick={() => setViewMode("all")}
                                size="small"
                            >
                                All Tickets
                            </Button>
                            <Button 
                                type={viewMode === "open" ? "primary" : "default"}
                                onClick={() => setViewMode("open")}
                                size="small"
                            >
                                Open
                            </Button>
                            <Button 
                                type={viewMode === "in progress" ? "primary" : "default"}
                                onClick={() => setViewMode("in progress")}
                                size="small"
                            >
                                In Progress
                            </Button>
                            <Button 
                                type={viewMode === "resolved" ? "primary" : "default"}
                                onClick={() => setViewMode("resolved")}
                                size="small"
                            >
                                Resolved
                            </Button>
                        </Flex>
                    </Col>
                </Row>

                {/* Filter Controls */}
                <Row gutter={[16, 16]} className="mb-4">
                    <Col xs={24} md={12}>
                        <TableGlobalSearchAnimated
                            tableFilter={tableFilter}
                            setTableFilter={setTableFilter}
                            placeholder="Search tickets, title, category, or reporter..."
                        />
                    </Col>
                    <Col xs={24} md={12}>
                        <Flex justify="flex-end">
                            <TablePageSize
                                tableFilter={tableFilter}
                                setTableFilter={setTableFilter}
                            />
                        </Flex>
                    </Col>
                </Row>

                {/* Table */}
                <Table
                    columns={columns}
                    dataSource={paginatedTickets}
                    pagination={false}
                    rowKey="id"
                    scroll={{ x: 800 }}
                    size="small"
                />

                {/* Pagination Footer */}
                <Row gutter={[16, 16]} className="mt-4">
                    <Col xs={24}>
                        <Flex justify="space-between" align="center" className="tbl-bottom-filter">
                            <div />
                            <Flex align="center">
                                <TableShowingEntriesV2 />
                                <TablePagination
                                    tableFilter={tableFilter}
                                    setTableFilter={setTableFilter}
                                    total={filteredTickets?.length || 0}
                                    showLessItems={true}
                                    showSizeChanger={false}
                                    tblIdWrapper="tbl_wrapper"
                                />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Card>

            {/* Modals */}
            <ModalCreateTicket
                toggleModal={toggleModalCreate}
                setToggleModal={setToggleModalCreate}
                tickets={tickets}
                setTickets={setTickets}
            />
            
            <ModalViewTicket
                toggleModal={toggleModalView}
                setToggleModal={setToggleModalView}
            />
        </>
    );
}
