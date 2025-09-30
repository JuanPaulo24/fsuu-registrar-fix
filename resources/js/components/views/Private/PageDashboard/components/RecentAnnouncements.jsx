import { Card, Typography, List, Tag, Button } from "antd";
import { NotificationOutlined, CalendarOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { GET } from "../../../../providers/useAxiosQuery";
import dayjs from "dayjs";

const { Title, Text } = Typography;

export default function RecentAnnouncements() {
    const navigate = useNavigate();
    
    // Fetch recent postings/announcements
    const { data: postingsData, isLoading } = GET(
        'api/posting?per_page=3',
        'dashboard-recent-postings',
        true
    );

    // Process postings data or use fallback
    const getAnnouncements = () => {
        if (!postingsData?.data) {
            // Fallback data if no real postings
            return [
                {
                    id: 1,
                    title: "Verification System Maintenance",
                    content: "The document authentication system will undergo scheduled maintenance to improve validation accuracy...",
                    date: "2025-09-15",
                    priority: "high",
                    category: "System"
                },
                {
                    id: 2,
                    title: "New Validation Protocols Implemented",
                    content: "Enhanced security measures and validation protocols are now active for all document types...",
                    date: "2025-09-14",
                    priority: "medium",
                    category: "Security"
                },
                {
                    id: 3,
                    title: "Exception Case Processing Update",
                    content: "New procedures for handling special verification cases and manual review processes...",
                    date: "2025-09-13",
                    priority: "low",
                    category: "Process"
                }
            ];
        }

        return postingsData.data.slice(0, 3).map(posting => ({
            id: posting.id,
            title: posting.title || "Untitled Announcement",
            content: posting.content || posting.description || "No content available...",
            date: posting.created_at || posting.date_posted,
            priority: posting.priority || "medium",
            category: posting.category || posting.type || "General"
        }));
    };

    const announcements = getAnnouncements();

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#dc2626'; // red-600
            case 'medium': return '#ea580c'; // orange-600
            case 'low': return '#16a34a'; // green-600
            default: return '#2563eb'; // blue-600
        }
    };

    const getPriorityBgColor = (priority) => {
        switch (priority) {
            case 'high': return '#fef2f2'; // red-50
            case 'medium': return '#fff7ed'; // orange-50
            case 'low': return '#f0fdf4'; // green-50
            default: return '#eff6ff'; // blue-50
        }
    };

    const handleViewAllAnnouncements = () => {
        navigate('/information-panel', { state: { activeTab: 'posting' } });
    };

    const handleAnnouncementClick = (announcement) => {
        navigate('/information-panel', { 
            state: { 
                activeTab: 'posting',
                selectedAnnouncement: announcement 
            } 
        });
    };


    return (
        <div className="chart-container w-full bg-white rounded-lg shadow-sm border h-full flex flex-col">
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <div>
                            <Title level={4} className="mb-0 text-gray-800">System Announcements</Title>
                            <p className="text-xs text-gray-500 mt-1">Important updates and notifications for the verification system</p>
                        </div>
                    </div>
                    <Button 
                        type="text" 
                        onClick={handleViewAllAnnouncements}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        size="small"
                    >
                        View All
                    </Button>
                </div>
                
                <List
                    className="flex-1"
                    dataSource={announcements}
                    split={false}
                    renderItem={(announcement, index) => (
                        <List.Item 
                            className="px-0 py-3 cursor-pointer hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 border-l-4 border-transparent hover:border-blue-500"
                            onClick={() => handleAnnouncementClick(announcement)}
                            style={{
                                backgroundColor: index % 2 === 0 ? '#fafbff' : 'transparent',
                                marginBottom: '8px',
                                borderRadius: '8px'
                            }}
                        >
                            <List.Item.Meta
                                avatar={
                                    <div className="flex items-center">
                                        <div 
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ 
                                                backgroundColor: '#e8f0fe',
                                                color: '#0027ae'
                                            }}
                                        >
                                            <NotificationOutlined className="text-sm" />
                                        </div>
                                    </div>
                                }
                                title={
                                    <div className="flex justify-between items-start">
                                        <Text strong className="text-sm text-gray-900">
                                            {announcement.title}
                                        </Text>
                                        <div 
                                            className="px-2 py-1 rounded-full text-xs font-medium"
                                            style={{
                                                backgroundColor: getPriorityBgColor(announcement.priority),
                                                color: getPriorityColor(announcement.priority)
                                            }}
                                        >
                                            {announcement.priority.toUpperCase()}
                                        </div>
                                    </div>
                                }
                                description={
                                    <div className="mt-1">
                                        <Text className="text-xs text-gray-500 block line-clamp-2 mb-2">
                                            {announcement.content}
                                        </Text>
                                        <div className="flex justify-between items-center">
                                            <div 
                                                className="px-2 py-1 rounded-md text-xs font-medium"
                                                style={{
                                                    backgroundColor: '#eff6ff',
                                                    color: '#2563eb'
                                                }}
                                            >
                                                {announcement.category}
                                            </div>
                                            <Text className="text-xs text-gray-400 flex items-center">
                                                <CalendarOutlined className="mr-1" />
                                                {new Date(announcement.date).toLocaleDateString()}
                                            </Text>
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </div>
        </div>
    );
}