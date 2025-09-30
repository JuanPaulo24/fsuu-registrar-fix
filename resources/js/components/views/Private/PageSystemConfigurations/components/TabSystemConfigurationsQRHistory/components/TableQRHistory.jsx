import { useState, useEffect } from 'react';
import { 
    Table, 
    Space, 
    Tag, 
    Input, 
    Select, 
    DatePicker, 
    Button, 
    Tooltip,
    Row,
    Col,
    Statistic,
    Card
} from 'antd';
import { 
    SearchOutlined, 
    ReloadOutlined, 
    DownloadOutlined,
    EyeOutlined 
} from '@ant-design/icons';
import { GET } from '../../../../../../providers/useAxiosQuery';
import ModalQRHistoryDetails from './ModalQRHistoryDetails';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

export default function TableQRHistory() {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState([]);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [selectedScan, setSelectedScan] = useState(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);

    // Fetch scan history data
    const { 
        data: scanHistoryData, 
        isLoading, 
        refetch 
    } = GET(
        `api/scan-history?page=${pagination.current}&per_page=${pagination.pageSize}&search=${searchText}&status=${statusFilter}&date_from=${dateRange[0] || ''}&date_to=${dateRange[1] || ''}`,
        'scan-history',
        true
    );

    // Fetch statistics
    const { data: statsData } = GET('api/scan-history/stats', 'scan-history-stats', true);

    const handleSearch = (value) => {
        setSearchText(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleStatusFilter = (value) => {
        setStatusFilter(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleDateFilter = (dates) => {
        if (dates) {
            setDateRange([
                dates[0].format('YYYY-MM-DD'),
                dates[1].format('YYYY-MM-DD')
            ]);
        } else {
            setDateRange([]);
        }
        setPagination({ ...pagination, current: 1 });
    };

    const handleTableChange = (paginationInfo) => {
        setPagination(paginationInfo);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'success': return 'green';
            case 'revoked': return 'orange';
            case 'failed': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'success': return 'Success';
            case 'revoked': return 'Revoked';
            case 'failed': return 'Failed';
            default: return status;
        }
    };

    const columns = [
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button 
                            icon={<EyeOutlined />} 
                            size="small" 
                            onClick={() => handleViewDetails(record)}
                        />
                    </Tooltip>
                </Space>
            )
        },
        {
            title: 'Date & Time',
            dataIndex: 'scanned_at',
            key: 'scanned_at',
            width: 160,
            render: (text) => (
                <div>
                    <div>{dayjs(text).format('MMM DD, YYYY')}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {dayjs(text).format('HH:mm:ss')}
                    </div>
                </div>
            ),
            sorter: true
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: 200,
            ellipsis: true
        },
        {
            title: 'Student Info',
            key: 'student_info',
            width: 200,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: '500' }}>{record.student_name}</div>
                    {record.student_id && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                            ID: {record.student_id}
                        </div>
                    )}
                </div>
            )
        },
        {
            title: 'Document Type',
            dataIndex: 'document_type',
            key: 'document_type',
            width: 150,
            ellipsis: true
        },
        {
            title: 'Serial Number',
            dataIndex: 'serial_number',
            key: 'serial_number',
            width: 130,
            ellipsis: true
        },
        {
            title: 'Status',
            dataIndex: 'scan_status',
            key: 'scan_status',
            width: 100,
            render: (status) => (
                <Tag color={getStatusColor(status)}>
                    {getStatusText(status)}
                </Tag>
            )
        },
        {
            title: 'Email Sent',
            dataIndex: 'email_sent',
            key: 'email_sent',
            width: 100,
            render: (sent) => (
                <Tag color={sent ? 'green' : 'default'}>
                    {sent ? 'Yes' : 'No'}
                </Tag>
            )
        },
        {
            title: 'Device Info',
            key: 'device_info',
            width: 120,
            render: (_, record) => (
                <div>
                    <div style={{ fontSize: '12px' }}>{record.browser}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>{record.device}</div>
                </div>
            )
        },
        {
            title: 'IP Address',
            dataIndex: 'ip_address',
            key: 'ip_address',
            width: 120,
            ellipsis: true
        }

    ];

    const handleViewDetails = (record) => {
        setSelectedScan(record);
        setDetailsModalVisible(true);
    };

    const handleCloseDetailsModal = () => {
        setDetailsModalVisible(false);
        setSelectedScan(null);
    };

    const handleExport = () => {
        // TODO: Implement export functionality
        window.open(`/api/scan-history/export?search=${searchText}&status=${statusFilter}&date_from=${dateRange[0] || ''}&date_to=${dateRange[1] || ''}`, '_blank');
    };

    return (
        <div>
            {/* Statistics Cards */}
            {statsData && (
                <Row gutter={16} style={{ marginBottom: '24px' }}>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Total Scans"
                                value={statsData.total}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Successful"
                                value={statsData.successful}
                                valueStyle={{ color: '#52c41a' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Failed"
                                value={statsData.failed}
                                valueStyle={{ color: '#ff4d4f' }}
                            />
                        </Card>
                    </Col>
                    <Col span={6}>
                        <Card>
                            <Statistic
                                title="Revoked"
                                value={statsData.revoked}
                                valueStyle={{ color: '#fa8c16' }}
                            />
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filters */}
            <Row gutter={16} style={{ marginBottom: '16px' }}>
                <Col span={6}>
                    <Input.Search
                        placeholder="Search by email, student name..."
                        onSearch={handleSearch}
                        style={{ width: '100%' }}
                        allowClear
                    />
                </Col>
                <Col span={4}>
                    <Select
                        placeholder="Status"
                        style={{ width: '100%' }}
                        value={statusFilter}
                        onChange={handleStatusFilter}
                    >
                        <Select.Option value="all">All Status</Select.Option>
                        <Select.Option value="success">Success</Select.Option>
                        <Select.Option value="failed">Failed</Select.Option>
                        <Select.Option value="revoked">Revoked</Select.Option>
                    </Select>
                </Col>
                <Col span={6}>
                    <RangePicker
                        style={{ width: '100%' }}
                        onChange={handleDateFilter}
                        format="YYYY-MM-DD"
                    />
                </Col>
                <Col span={8}>
                    <Space>
                        <Button 
                            icon={<ReloadOutlined />} 
                            onClick={() => refetch()}
                        >
                            Refresh
                        </Button>
                        <Button 
                            icon={<DownloadOutlined />} 
                            onClick={handleExport}
                        >
                            Export
                        </Button>
                    </Space>
                </Col>
            </Row>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={scanHistoryData?.data || []}
                loading={isLoading}
                pagination={{
                    ...pagination,
                    total: scanHistoryData?.total || 0,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                        `${range[0]}-${range[1]} of ${total} items`,
                }}
                onChange={handleTableChange}
                rowKey="id"
                scroll={{ x: 1200 }}
                size="small"
            />

            <ModalQRHistoryDetails
                visible={detailsModalVisible}
                onCancel={handleCloseDetailsModal}
                scanData={selectedScan}
            />
        </div>
    );
}