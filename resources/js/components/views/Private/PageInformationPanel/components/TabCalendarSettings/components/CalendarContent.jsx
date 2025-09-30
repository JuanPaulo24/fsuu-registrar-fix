import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Card, Calendar, Badge, Button, Form, message } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarCheck, faPlus } from "@fortawesome/pro-regular-svg-icons";
import dayjs from "dayjs";
import { GET, POST } from "../../../../../../providers/useAxiosQuery";
import ModalFormEvent from "./ModalFormEvent";
import ModalEventsList from "./ModalEventsList";
import CalendarLegend from "./CalendarLegend";
import { hasButtonPermission } from "@/hooks/useButtonPermissions";

const CalendarContent = forwardRef(function CalendarContent({ onEventsChange, isArchived = false }, ref) {
    const [selectedDate, setSelectedDate] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [noEndDate, setNoEndDate] = useState(false);
    const [form] = Form.useForm();
    
    // Modal for showing all events on a specific date
    const [eventsModalVisible, setEventsModalVisible] = useState(false);
    const [selectedDateEvents, setSelectedDateEvents] = useState([]);
    const [selectedDateLabel, setSelectedDateLabel] = useState('');

    // API calls
    const { data: eventsResponse, isLoading, refetch: refetchEvents } = GET(
        isArchived ? "api/calendar?isTrash=true" : "api/calendar", 
        isArchived ? "calendar_events_archived" : "calendar_events"
    );
    const { mutate: createEvent } = POST("api/calendar", "create_calendar_event");
    const { mutate: archiveRestoreEvent } = POST("api/calendar_archived", "archive_restore_calendar_event");

    const events = eventsResponse?.data || [];

    // Notify parent component when events change
    useEffect(() => {
        if (onEventsChange) {
            onEventsChange(events);
        }
    }, [events, onEventsChange]);

    // Auto-refresh when isArchived changes (tab switching)
    useEffect(() => {
        refetchEvents();
    }, [isArchived, refetchEvents]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
        editEvent: handleEditEvent,
        deleteEvent: handleDeleteEvent,
        getEventColor,
        refetchEvents
    }));

    const getEventsByDate = (date) => {
        const dateStr = date.format('YYYY-MM-DD');
        return events.filter(event => {
            const eventStart = dayjs(event.start_date);
            const eventEnd = event.end_date ? dayjs(event.end_date) : eventStart;
            
            // Check if the date falls within the event's date range
            return date.isSame(eventStart, 'day') || 
                   date.isSame(eventEnd, 'day') || 
                   (date.isAfter(eventStart, 'day') && date.isBefore(eventEnd, 'day'));
        });
    };

    const getEventsByMonth = (date) => {
        return events.filter(event => {
            const eventStart = dayjs(event.start_date);
            const eventEnd = event.end_date ? dayjs(event.end_date) : eventStart;
            
            // Check if the event occurs within this month
            return eventStart.isSame(date, 'month') || 
                   eventEnd.isSame(date, 'month') || 
                   (eventStart.isBefore(date, 'month') && eventEnd.isAfter(date, 'month'));
        });
    };

    const getListData = (value) => {
        const dayEvents = getEventsByDate(value);
        return dayEvents.map(event => ({
            type: getEventBadgeType(event.event_type || event.type),
            content: event.event_title || event.title
        }));
    };

    const getEventBadgeType = (type) => {
        switch (type) {
            case 'Academic Events': return 'processing';
            case 'Training and Development': return 'warning';
            case 'Institutional & Program Events': return 'success';
            case 'Professional & Industry-Related': return 'error';
            case 'Competitions': return 'default';
            case 'Cultural Events': return 'processing';
            case 'Community Outreach Events': return 'success';
            default: return 'default';
        }
    };

    const getEventColor = (type, status = 'active') => {
        // If inactive or archived, return gray
        if (status === 'inactive' || isArchived) {
            return '#9ca3af'; // Gray color for inactive/archived
        }
        
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

    const dateCellRender = (value) => {
        const dayEvents = getEventsByDate(value);
        const maxVisibleEvents = 2;
        const visibleEvents = dayEvents.slice(0, maxVisibleEvents);
        const hasMoreEvents = dayEvents.length > maxVisibleEvents;
        const moreEventsCount = dayEvents.length - maxVisibleEvents;
        
        return (
            <div className="relative h-16">
                {visibleEvents.map((event, index) => {
                    const eventStart = dayjs(event.start_date);
                    const eventEnd = event.end_date ? dayjs(event.end_date) : eventStart;
                    const isStartDay = value.isSame(eventStart, 'day');
                    const isEndDay = value.isSame(eventEnd, 'day');
                    const isMiddleDay = value.isAfter(eventStart, 'day') && value.isBefore(eventEnd, 'day');
                    
                    // Don't render if it's not part of this event's date range
                    if (!isStartDay && !isEndDay && !isMiddleDay) return null;
                    
                    let borderRadius = '4px';
                    let eventClasses = ['calendar-event-bar', 'text-white', 'text-xs', 'p-1', 'mb-1', 'overflow-hidden', 'text-ellipsis', 'whitespace-nowrap'];
                    
                    if (!isStartDay && !isEndDay) {
                        borderRadius = '0px';
                        eventClasses.push('multi-day-middle');
                    } else if (isStartDay && !isEndDay) {
                        borderRadius = '4px 0px 0px 4px';
                        eventClasses.push('multi-day-start');
                    } else if (!isStartDay && isEndDay) {
                        borderRadius = '0px 4px 4px 0px';
                        eventClasses.push('multi-day-end');
                    }
                    
                    return (
                        <div
                            key={`${event.id}-${index}`}
                            className={eventClasses.join(' ')}
                                                    style={{
                                backgroundColor: getEventColor(event.event_type || event.type, event.status),
                                borderRadius: borderRadius,
                                fontSize: '10px',
                                lineHeight: '12px',
                                position: 'absolute',
                                top: `${index * 14}px`,
                                left: 0,
                                right: 0,
                                zIndex: 1,
                                minHeight: '12px', // Ensure visibility even without text
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            title={event.event_title || event.title}
                        >
                            {/* Only show title on start day to avoid duplication */}
                            {isStartDay ? (event.event_title || event.title) : ''}
                        </div>
                    );
                })}
                
                {hasMoreEvents && (
                    <div
                        className="text-blue-600 text-xs font-medium cursor-pointer"
                        style={{
                            position: 'absolute',
                            top: `${visibleEvents.length * 14}px`,
                            left: 0,
                            right: 0,
                            fontSize: '10px',
                            lineHeight: '12px',
                            zIndex: 2
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateEvents(dayEvents);
                            setSelectedDateLabel(`Events for ${value.format('MMMM DD, YYYY')}`);
                            setEventsModalVisible(true);
                        }}
                    >
                        +{moreEventsCount} more
                    </div>
                )}
            </div>
        );
    };

    const monthCellRender = (value) => {
        const monthEvents = getEventsByMonth(value);
        const maxVisibleEvents = 3;
        const visibleEvents = monthEvents.slice(0, maxVisibleEvents);
        const hasMoreEvents = monthEvents.length > maxVisibleEvents;
        const moreEventsCount = monthEvents.length - maxVisibleEvents;
        
        return (
            <div className="month-events-container p-2">
                {visibleEvents.map((event, index) => (
                    <div
                        key={`${event.id}-${index}`}
                        className="month-event-item text-white text-xs p-1 mb-1 rounded cursor-pointer hover:opacity-80"
                        style={{
                            backgroundColor: getEventColor(event.event_type || event.type, event.status),
                            fontSize: '10px',
                            lineHeight: '12px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}
                        title={`${event.event_title || event.title} - ${dayjs(event.start_date).format('MMM DD')}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            const monthEvents = getEventsByMonth(value);
                            setSelectedDateEvents(monthEvents);
                            setSelectedDateLabel(`Events for ${value.format('MMMM YYYY')}`);
                            setEventsModalVisible(true);
                        }}
                    >
                        {event.event_title || event.title}
                    </div>
                ))}
                
                {hasMoreEvents && (
                    <div
                        className="text-blue-600 text-xs font-medium cursor-pointer hover:text-blue-800"
                        style={{
                            fontSize: '10px',
                            lineHeight: '12px'
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDateEvents(monthEvents);
                            setSelectedDateLabel(`Events for ${value.format('MMMM YYYY')}`);
                            setEventsModalVisible(true);
                        }}
                    >
                        +{moreEventsCount} more events
                    </div>
                )}
            </div>
        );
    };

    const onSelect = (date) => {
        const dayEvents = getEventsByDate(date);
        if (dayEvents.length > 0) {
            setSelectedDateEvents(dayEvents);
            setSelectedDateLabel(`Events for ${date.format('MMMM DD, YYYY')}`);
            setEventsModalVisible(true);
        }
    };

    const handleAddEvent = () => {
        setEditingEvent(null);
        form.resetFields();
        // Set default status to active for new events
        form.setFieldsValue({
            status: 'active'
        });
        setModalVisible(true);
    };

    const handleEditEvent = (event) => {
        setEditingEvent(event);
        form.setFieldsValue({
            title: event.event_title || event.title,
            description: event.event_description || event.description,
            type: event.event_type || event.type,
            status: event.status,
            startDate: dayjs(event.start_date),
            endDate: event.end_date ? dayjs(event.end_date) : null
        });
        
        setNoEndDate(!event.end_date);
        setModalVisible(true);
    };

    const handleDeleteEvent = (eventId, permanent = false) => {
        const payload = isArchived ? 
            { ids: [eventId], isTrash: true } : // Restore from archive
            { ids: [eventId], isTrash: false }; // Archive active event

        archiveRestoreEvent(payload, {
            onSuccess: (res) => {
                if (res.success) {
                    const action = isArchived ? 'restored' : 'archived';
                    message.success(`Event ${action} successfully`);
                    refetchEvents();
                    
                    // If restoring from archived, also refresh the parent to update both tabs
                    if (isArchived && onEventsChange) {
                        // Small delay to ensure the restore completes
                        setTimeout(() => {
                            refetchEvents();
                        }, 100);
                    }
                } else {
                    const action = isArchived ? 'restore' : 'archive';
                    message.error(res.message || `Failed to ${action} event`);
                }
            },
            onError: (error) => {
                const action = isArchived ? 'restore' : 'archive';
                message.error(`Failed to ${action} event`);
                console.error('Archive/Restore error:', error);
            }
        });
    };

    const handleSubmitEvent = async () => {
        try {
            const values = await form.validateFields();
            const formattedValues = {
                id: editingEvent?.id || null,
                event_title: values.title,
                event_description: values.description,
                event_type: values.type,
                status: values.status,
                start_date: values.startDate.format('YYYY-MM-DD'),
                end_date: (!noEndDate && values.endDate) ? values.endDate.format('YYYY-MM-DD') : null
            };

            createEvent(formattedValues, {
                onSuccess: (res) => {
                    if (res.success) {
                        message.success(editingEvent ? 'Event updated successfully' : 'Event created successfully');
                        refetchEvents();
                        setModalVisible(false);
                        form.resetFields();
                        setEditingEvent(null);
                        setNoEndDate(false);
                    } else {
                        message.error(res.message || 'Failed to save event');
                    }
                },
                onError: (error) => {
                    message.error('Failed to save event');
                    console.error('Save error:', error);
                }
            });
        } catch (error) {
            message.error('Please fill in all required fields');
        }
    };

    return (
        <>
            <Card
                title={
                    <div className="flex justify-between items-center">
                        <div className="text-white font-bold flex items-center gap-3">
                            <FontAwesomeIcon icon={faCalendarCheck} className="text-white" />
                            <span>Academic Calendar</span>
                        </div>
                        {!isArchived && hasButtonPermission('M-07-EVENTS-ADD') && (
                            <Button 
                                type="primary" 
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                onClick={handleAddEvent}
                                size="small"
                            >
                                Add Event
                            </Button>
                        )}
                    </div>
                }
                styles={{ 
                    header: {
                        backgroundColor: isArchived ? '#6b7280' : '#1890ff', 
                        color: '#ffffff',
                        borderBottom: isArchived ? '1px solid #9ca3af' : '1px solid #40a9ff'
                    }
                }}
            >
                <Calendar 
                    cellRender={(current, info) => {
                        if (info.type === 'date') {
                            return dateCellRender(current);
                        }
                        if (info.type === 'month') {
                            return monthCellRender(current);
                        }
                        return info.originNode;
                    }}
                    onSelect={onSelect}
                    style={{ borderRadius: '8px' }}
                />
            </Card>

            <CalendarLegend 
                getEventColor={getEventColor}
                isArchived={isArchived}
            />

            <ModalFormEvent
                open={modalVisible}
                onCancel={() => {
                    setModalVisible(false);
                    setEditingEvent(null);
                }}
                onSubmit={handleSubmitEvent}
                form={form}
                editingEvent={editingEvent}
                noEndDate={noEndDate}
                setNoEndDate={setNoEndDate}
            />

            <ModalEventsList
                open={eventsModalVisible}
                onCancel={() => setEventsModalVisible(false)}
                selectedDateLabel={selectedDateLabel}
                selectedDateEvents={selectedDateEvents}
                onEditEvent={handleEditEvent}
                onDeleteEvent={handleDeleteEvent}
                getEventColor={getEventColor}
            />
        </>
    );
});

export default CalendarContent;