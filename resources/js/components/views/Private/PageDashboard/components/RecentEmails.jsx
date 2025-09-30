import { Card, Typography, List, Avatar, Button } from "antd";
import { MailOutlined, ClockCircleOutlined, PaperClipOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { GET } from "../../../../providers/useAxiosQuery";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

export default function RecentEmails() {
    const navigate = useNavigate();
    
    // Fetch recent emails from Gmail API inbox
    const { data: emailsData, isLoading, error } = GET(
        'api/gmail/inbox',
        'dashboard-recent-emails',
        true
    );

    // Log API call status for debugging
    console.log('📡 Gmail API Call Status:', {
        url: 'api/gmail/inbox',
        isLoading,
        hasData: !!emailsData,
        error: error || null
    });

    // Process email data from Gmail service
    const getRecentEmails = () => {
        console.log('🔍 RecentEmails Debug Info:', {
            isLoading,
            emailsData,
            emailsDataType: typeof emailsData,
            hasSuccess: emailsData?.success,
            hasDataProperty: !!emailsData?.data,
            hasNestedData: !!emailsData?.data?.data,
            nestedDataLength: emailsData?.data?.data ? emailsData.data.data.length : 0
        });

        // Check if we have real Gmail data (following GmailController response format)
        const emails = emailsData?.data?.data || [];
        
        if (emailsData?.success && Array.isArray(emails) && emails.length > 0) {            
            return emails.slice(0, 3).map((email) => ({
                id: email.id,
                subject: email.subject || "No Subject",
                sender: email.from || email.fromEmail || "Unknown Sender",
                time: email.date ? dayjs(email.date).fromNow() : "Unknown time",
                isRead: email.isRead || false,
                hasAttachment: email.hasAttachment || false,
                priority: email.priority || "normal"
            }));
        }

        console.log('❌ No Gmail emails available:', {
            hasEmailsData: !!emailsData,
            success: emailsData?.success,
            hasNestedData: !!emailsData?.data?.data,
            emailsLength: emails.length,
            errorMessage: emailsData?.message
        });

        // Return empty array if no real emails
        return [];
    };

    const recentEmails = getRecentEmails();

    const handleViewAllEmails = () => {
        navigate('/email');
    };

    const handleEmailClick = (email) => {
        navigate('/email', { state: { selectedEmail: email } });
    };

    return (
        <div className="chart-container w-full bg-white rounded-lg shadow-sm border h-full flex flex-col">
            <div className="p-4 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                        <div>
                            <Title level={4} className="mb-0 text-gray-800">Recent Communications</Title>
                            <p className="text-xs text-gray-500 mt-1">Latest verification-related email correspondence</p>
                        </div>
                    </div>
                    <Button 
                        type="text" 
                        onClick={handleViewAllEmails}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                        size="small"
                    >
                        View All
                    </Button>
                </div>
                
                {recentEmails.length === 0 ? (
                    <div className="flex justify-center items-center h-48">
                        <div className="text-center">
                            <MailOutlined className="text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500 text-sm">No emails available</p>
                            <p className="text-gray-400 text-xs mt-1">
                                {error ? `Error: ${error.message || 'Failed to fetch emails'}` : 
                                emailsData?.success === false ? `API Error: ${emailsData.message || 'Gmail service error'}` :
                                'Gmail service may not be configured or no emails found'}
                            </p>
                            {emailsData && !emailsData.success && (
                                <p className="text-red-400 text-xs mt-2">
                                    Check console for detailed error information
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <List
                        className="flex-1"
                        dataSource={recentEmails}
                        split={false}
                        renderItem={(email, index) => (
                        <List.Item 
                            className="px-0 py-3 cursor-pointer hover:bg-blue-50 rounded-lg p-3 transition-all duration-200 border-l-4 border-transparent hover:border-blue-500"
                            onClick={() => handleEmailClick(email)}
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
                                                backgroundColor: email.isRead ? '#e8f0fe' : '#0027ae',
                                                color: email.isRead ? '#5f6368' : '#fff'
                                            }}
                                        >
                                            <MailOutlined className="text-sm" />
                                        </div>
                                    </div>
                                }
                                title={
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center flex-1 min-w-0">
                                            <Text 
                                                strong={!email.isRead} 
                                                className={`text-sm ${email.isRead ? 'text-gray-600' : 'text-gray-900'} truncate`}
                                            >
                                                {email.subject}
                                            </Text>
                                            {email.hasAttachment && (
                                                <PaperClipOutlined className="ml-2 text-gray-400 text-xs" />
                                            )}
                                            {email.priority === 'high' && (
                                                <ExclamationCircleOutlined className="ml-1 text-red-500 text-xs" />
                                            )}
                                        </div>
                                        {!email.isRead && (
                                            <div className="w-2 h-2 bg-blue-600 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                                        )}
                                    </div>
                                }
                                description={
                                    <div className="mt-1">
                                        <Text className="text-xs text-gray-500 block">
                                            From: {email.sender}
                                        </Text>
                                        <Text className="text-xs text-gray-400 flex items-center mt-1">
                                            <ClockCircleOutlined className="mr-1" />
                                            {email.time}
                                        </Text>
                                    </div>
                                }
                            />
                        </List.Item>
                        )}
                    />
                )}
            </div>
        </div>
    );
}