import { useState, useRef, useEffect } from "react";
import { Row, Col, Button, Space } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faArchive } from "@fortawesome/pro-regular-svg-icons";
import CalendarContent from "./components/CalendarContent";
import EventsSidebar from "./components/EventsSidebar";
import ArchivedEventsSidebar from "./components/ArchivedEventsSidebar";

export default function TabCalendarManagement() {
    const [activeTabKey, setActiveTabKey] = useState("active");
    const [events, setEvents] = useState([]);
    const [archivedEvents, setArchivedEvents] = useState([]);
    const calendarRef = useRef();
    const archivedCalendarRef = useRef();

    // Handle events update from CalendarContent
    const handleEventsChange = (newEvents) => {
        setEvents(newEvents);
    };

    const handleArchivedEventsChange = (newEvents) => {
        setArchivedEvents(newEvents);
    };

    // Event handlers for active events
    const handleEditEvent = (event) => {
        if (calendarRef.current) {
            calendarRef.current.editEvent(event);
        }
    };

    const handleDeleteEvent = (eventId) => {
        if (calendarRef.current) {
            calendarRef.current.deleteEvent(eventId);
        }
    };

    // Event handlers for archived events
    const handleRestoreEvent = (eventId) => {
        if (archivedCalendarRef.current) {
            archivedCalendarRef.current.deleteEvent(eventId); // This will restore the event
        }
    };

    const handlePermanentDelete = (eventId) => {
        if (archivedCalendarRef.current) {
            archivedCalendarRef.current.deleteEvent(eventId, true); // Permanent delete
        }
    };

    // Toggle between Active and Archived views
    const isArchived = activeTabKey === 'archived';

    const handleToggle = (archived) => {
        const key = archived ? 'archived' : 'active';
        setActiveTabKey(key);
        setTimeout(() => {
            if (!archived && calendarRef.current) {
                window.dispatchEvent(new CustomEvent('refetch_calendar_events'));
            }
            if (archived && archivedCalendarRef.current) {
                window.dispatchEvent(new CustomEvent('refetch_calendar_events_archived'));
            }
        }, 100);
    };

    const getEventColor = (type, status = 'active') => {
        // If inactive or archived, return gray
        if (status === 'inactive' || activeTabKey === 'archived') {
            return '#9ca3af'; // Gray color for inactive/archived
        }

        // For active tab, use CalendarContent's getEventColor if available
        if (calendarRef.current && activeTabKey === 'active') {
            return calendarRef.current.getEventColor(type, status);
        }
        
        // Fallback colors
        switch (type) {
            case 'Academic Events': return '#3b82f6';
            case 'Training and Development': return '#f59e0b';
            case 'Institutional & Program Events': return '#10b981';
            case 'Professional & Industry-Related': return '#ef4444';
            case 'Competitions': return '#8b5cf6';
            case 'Cultural Events': return '#06b6d4';
            case 'Community Outreach Events': return '#84cc16';
            default: return '#6b7280';
        }
    };

    return (
        <div className="calendar-management">
            {/* Active/Archived Toggle */}
            <Row style={{ marginTop: 12, marginBottom: 20 }}>
                <Col span={24}>
                    <Space size="large">
                            <Button 
                            type={!isArchived ? "primary" : "default"}
                            icon={<FontAwesomeIcon icon={faCalendarCheck} />}
                            onClick={() => handleToggle(false)}
                            style={{ fontWeight: !isArchived ? 'bold' : 'normal' }}
                        >
                            Active
                            </Button>
                        <Button
                            type={isArchived ? "primary" : "default"}
                            icon={<FontAwesomeIcon icon={faArchive} />}
                            onClick={() => handleToggle(true)}
                            style={{ fontWeight: isArchived ? 'bold' : 'normal' }}
                        >
                            Archived
                        </Button>
                    </Space>
                        </Col>
                    </Row>

            <Row gutter={[20, 20]}>
                <Col xs={24} lg={16}>
                    <CalendarContent 
                        ref={isArchived ? archivedCalendarRef : calendarRef}
                        onEventsChange={isArchived ? handleArchivedEventsChange : handleEventsChange}
                        isArchived={isArchived}
                    />
                        </Col>

                <Col xs={24} lg={8}>
                    {isArchived ? (
                        <ArchivedEventsSidebar 
                            events={archivedEvents}
                            onRestoreEvent={handleRestoreEvent}
                            onDeleteEvent={handlePermanentDelete}
                            getEventColor={getEventColor}
                        />
                    ) : (
                        <EventsSidebar 
                            events={events}
                            onEditEvent={handleEditEvent}
                            onDeleteEvent={handleDeleteEvent}
                            getEventColor={getEventColor}
                        />
                    )}
                </Col>
        </Row>
        </div>
    );
}