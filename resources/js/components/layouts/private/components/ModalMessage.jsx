import React, { useState, useEffect, useRef } from "react";
import { Modal, Input, Button, List, Avatar, Typography, App, Spin, Empty } from "antd";
import {
  SendOutlined,
  PlusOutlined,
  SmileOutlined,
  LikeOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import "../../../../../sass/pages/modal-message/modal-message.scss";
import { userData, token, pusherAppKey, pusherAppCluster } from "../../../providers/appConfig";
import { GET, POST } from "../../../providers/useAxiosQuery";

// Fallback Echo initialization if bootstrap didn't load
if (!window.Echo && typeof window !== 'undefined') {
  console.log("🔧 [Fallback] Initializing Echo in ModalMessage...");
  import("laravel-echo").then(({ default: Echo }) => {
    import("pusher-js").then(({ default: Pusher }) => {
      window.Pusher = Pusher;
        // Test debug auth endpoint first
        console.log('🔍 Testing debug auth endpoint...');
        fetch('/api/debug/broadcasting/auth', {
          method: 'POST',
          headers: {
            'Authorization': token(),
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            socket_id: 'test_socket',
            channel_name: 'private-conversation.1'
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log('🔍 Debug auth response:', data);
        })
        .catch(error => {
          console.error('🔍 Debug auth error:', error);
        });

        window.Echo = new Echo({
          broadcaster: "pusher",
          key: pusherAppKey || import.meta.env.VITE_PUSHER_APP_KEY,
          cluster: pusherAppCluster || import.meta.env.VITE_PUSHER_APP_CLUSTER,
          forceTLS: true,
          encrypted: true,
          authEndpoint: "/api/broadcasting/auth",
          auth: {
            headers: {
              Authorization: token(),
              Accept: "application/json",
            },
          },
        });
      console.log("✅ [Fallback] Echo initialized");
    });
  });
}

const { Title, Text } = Typography;

function ModalMessage({ isOpen, onClose }) {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [selectedNewUser, setSelectedNewUser] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUserId = userData()?.id;
  const { message } = App.useApp();
  const subscribedConversationsRef = useRef(new Set());

  // Use your existing hooks for API calls
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    refetch: refetchConversations
  } = GET("api/messages/conversations", "conversations", {
    enabled: isOpen,
    onSuccess: (data) => {
      if (data.success) {
        setConversations(data.conversations);
      }
    }
  });

  const {
    data: usersData,
    isLoading: usersLoading,
  } = GET("api/messages/users", "messaging-users", {
    enabled: isOpen && showNewConversation,
    onSuccess: (data) => {
      if (data.success) {
        // Users data will be handled in the component
      }
    }
  });

  const {
    data: messagesData,
    isLoading: messagesLoading,
    refetch: refetchMessages
  } = GET(
    selectedConversation ? `api/messages/conversations/${selectedConversation.id}/messages` : "",
    ["conversation-messages", selectedConversation?.id],
    {
      enabled: !!selectedConversation,
      onSuccess: (data) => {
        if (data.success) {
          setMessages(data.messages);
        }
      }
    }
  );

  // Hook for sending messages
  const sendMessageMutation = POST("api/messages/send", ["conversations", "conversation-messages"], true, (data) => {
    console.log('📨 Send message response:', data);
    if (data && data.success) {
      console.log('✅ Message sent successfully');
      refetchConversations();
      refetchMessages();
      try {
        message.success('Message sent successfully!');
      } catch (e) {
        console.log('✅ Message sent successfully (notification failed)');
      }
    } else {
      console.error('❌ Failed to send message:', data);
      try {
        message.error('Failed to send message. Please try again.');
      } catch (e) {
        console.error('❌ Failed to send message (notification failed)');
      }
    }
  });

  // Hook for starting new conversations
  const startConversationMutation = POST("api/messages/conversations/start", "conversations", true, (data) => {
    if (data && data.success) {
      setShowNewConversation(false);
      setSelectedNewUser(null);
      refetchConversations();
      // Select the new conversation
      const newConversation = {
        id: data.conversation.id,
        participants: [selectedNewUser]
      };
      setSelectedConversation(newConversation);
      try {
        message.success('Conversation started successfully!');
      } catch (e) {
        console.log('✅ Conversation started successfully (notification failed)');
      }
    } else {
      try {
        message.error('Failed to start conversation. Please try again.');
      } catch (e) {
        console.error('❌ Failed to start conversation (notification failed)');
      }
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle send message errors
  useEffect(() => {
    if (sendMessageMutation.error) {
      console.error('❌ Send message error:', sendMessageMutation.error);
      try {
        message.error('Network error. Please try again.');
      } catch (e) {
        console.error('❌ Network error (notification failed)');
      }
    }
  }, [sendMessageMutation.error]);

  // Handle start conversation errors
  useEffect(() => {
    if (startConversationMutation.error) {
      console.error('❌ Start conversation error:', startConversationMutation.error);
      try {
        message.error('Network error. Please try again.');
      } catch (e) {
        console.error('❌ Network error (notification failed)');
      }
    }
  }, [startConversationMutation.error]);

  // Setup Echo listeners when conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setupEchoListeners();
    }
    return () => {
      cleanupEchoListeners();
    };
  }, [selectedConversation]);

  const setupEchoListeners = () => {
    if (selectedConversation && window.Echo) {
      console.log('🔔 Setting up Echo listener for conversation:', selectedConversation.id);
      window.Echo.private(`conversation.${selectedConversation.id}`)
        .listen('.message.sent', (e) => {
          console.log('📨 [Selected Conv] Received new message:', e);
          // Always refetch to ensure consistent shape and ordering
          if (e?.message?.conversation_id === selectedConversation.id) {
            console.log('🔄 [Selected Conv] Refetching messages for conversation:', selectedConversation.id);
            refetchMessages();
          }
          console.log('🔄 [Selected Conv] Refetching conversations list');
          refetchConversations();
        })
        .error((error) => {
          console.error('❌ [Selected Conv] Echo subscription error:', error);
        });
    } else {
      console.warn('⚠️ Cannot setup Echo listeners - missing conversation or Echo');
    }
  };

  const cleanupEchoListeners = () => {
    if (selectedConversation && window.Echo) {
      window.Echo.leave(`conversation.${selectedConversation.id}`);
    }
  };

  // Subscribe to all conversations to keep list and active chat in sync across tabs
  useEffect(() => {
    console.log('🌐 [Global] useEffect triggered - isOpen:', isOpen, 'conversations:', conversations?.length, 'Echo:', !!window.Echo);
    
    if (!isOpen || !window.Echo) {
      console.log('⏭️ [Global] Skipping subscription - modal closed or Echo not ready');
      return;
    }
    if (!conversations || conversations.length === 0) {
      console.log('⏭️ [Global] Skipping subscription - no conversations');
      return;
    }

    const subscribed = subscribedConversationsRef.current;
    console.log('📋 [Global] Current subscriptions:', Array.from(subscribed));
    
    conversations.forEach((conv) => {
      if (!subscribed.has(conv.id)) {
        console.log('🔔 [Global] Subscribing to conversation:', conv.id);
        window.Echo.private(`conversation.${conv.id}`)
          .listen('.message.sent', (e) => {
            console.log('📨 [Global] Received conversation update:', e);
            console.log('🔄 [Global] Refetching conversations list');
            refetchConversations();
            // If this conversation is open, refresh its messages
            if (selectedConversation?.id === e?.message?.conversation_id) {
              console.log('🔄 [Global] Refetching messages for open conversation:', selectedConversation.id);
              refetchMessages();
            }
          })
          .error((error) => {
            console.error('❌ [Global] Echo subscription error for conversation', conv.id, ':', error);
          });
        subscribed.add(conv.id);
      } else {
        console.log('✅ [Global] Already subscribed to conversation:', conv.id);
      }
    });

    return () => {
      // When modal closes, leave all subscribed conversation channels
      if (!isOpen && window.Echo) {
        console.log('🧹 [Global] Cleaning up subscriptions');
        subscribed.forEach((id) => {
          console.log('🔕 [Global] Leaving conversation:', id);
          window.Echo.leave(`conversation.${id}`);
        });
        subscribed.clear();
      }
    };
  }, [isOpen, conversations, selectedConversation]);

  const handleSend = () => {
    console.log('🚀 handleSend called');
    console.log('📝 newMessage:', newMessage);
    console.log('💬 selectedConversation:', selectedConversation);
    console.log('⏳ isLoading:', sendMessageMutation.isLoading);
    
    if (newMessage.trim() === "" || !selectedConversation || sendMessageMutation.isLoading) {
      console.log('❌ Send blocked - empty message, no conversation, or loading');
      return;
    }

    const messageToSend = newMessage.trim();
    console.log('📤 Sending message:', messageToSend);
    setNewMessage(""); // Clear immediately for better UX

    const payload = {
      conversation_id: selectedConversation.id,
      message: messageToSend,
      type: 'text'
    };
    console.log('📦 Payload:', payload);

    sendMessageMutation.mutate(payload);
  };

  const handleStartNewConversation = () => {
    if (!selectedNewUser || newMessage.trim() === "" || startConversationMutation.isLoading) return;

    const messageToSend = newMessage.trim();
    setNewMessage(""); // Clear immediately for better UX

    startConversationMutation.mutate({
      participant_id: selectedNewUser.id,
      message: messageToSend
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get users from the API data
  const users = usersData?.success ? usersData.users : [];

  const filteredConversations = conversations.filter((conversation) =>
    conversation.participants.some(participant => 
      participant.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConversationSelect = (conversation) => {
    cleanupEchoListeners();
    setSelectedConversation(conversation);
    setShowNewConversation(false);
  };

  const handleNewConversationClick = () => {
    setShowNewConversation(true);
    setSelectedConversation(null);
    setMessages([]);
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <App>
      <Modal
        title="Messages"
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={1100}
        closable={true}
      >
      <div className="modal-message-container" style={{ display: "flex" }}>
        {/* Conversations List */}
        <div className="user-list" style={{ width: "280px", paddingRight: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <Title level={4} className="chat-title">
              Chats
            </Title>
            <Button 
              type="primary" 
              icon={<UserAddOutlined />} 
              onClick={handleNewConversationClick}
              size="small"
            >
              New
            </Button>
          </div>
          
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />

          {(conversationsLoading || usersLoading) ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <Spin />
            </div>
          ) : showNewConversation ? (
            // New conversation user list
            <List
              dataSource={filteredUsers}
              renderItem={(user) => (
                <List.Item
                  key={user.id}
                  className={`user-item ${
                    selectedNewUser?.id === user.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedNewUser(user)}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    marginTop: "8px",
                    background:
                      selectedNewUser?.id === user.id ? "#e6f7ff" : "transparent",
                  }}
                >
                  <List.Item.Meta
                    avatar={<Avatar src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=1890ff&color=fff`} />}
                    title={user.name}
                  />
                </List.Item>
              )}
            />
          ) : (
            // Existing conversations
            <List
              dataSource={filteredConversations}
              renderItem={(conversation) => (
                <List.Item
                  key={conversation.id}
                  className={`user-item ${
                    selectedConversation?.id === conversation.id ? "selected" : ""
                  }`}
                  onClick={() => handleConversationSelect(conversation)}
                  style={{
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "8px",
                    marginTop: "8px",
                    background:
                      selectedConversation?.id === conversation.id ? "#e6f7ff" : "transparent",
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={conversation.participants[0]?.avatar || 
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.participants[0]?.name || 'User')}&background=1890ff&color=fff`} 
                      />
                    }
                    title={conversation.participants[0]?.name || 'Unknown User'}
                    description={
                      conversation.latest_message ? (
                        <Text ellipsis style={{ fontSize: "12px", color: "#666" }}>
                          {conversation.latest_message.message}
                        </Text>
                      ) : (
                        <Text style={{ fontSize: "12px", color: "#999", fontStyle: "italic" }}>
                          No messages yet
                        </Text>
                      )
                    }
                  />
                  {conversation.latest_message && (
                    <div style={{ fontSize: "10px", color: "#999" }}>
                      {conversation.last_message_at}
                    </div>
                  )}
                </List.Item>
              )}
            />
          )}
        </div>

        {/* Chat Window */}
        <div className="chat-window" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          {selectedConversation || showNewConversation ? (
            <>
              <Title level={5} className="chat-header" style={{ marginBottom: "12px" }}>
                {showNewConversation ? (
                  selectedNewUser ? `New chat with ${selectedNewUser.name}` : "Select a user to start chatting"
                ) : (
                  `Chat with ${selectedConversation?.participants[0]?.name || 'Unknown User'}`
                )}
              </Title>

              {/* Messages */}
              <div
                className="messages-container"
                style={{
                  flex: 1,
                  overflowY: "auto",
                  marginBottom: "12px",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  minHeight: "300px",
                }}
              >
                {messagesLoading ? (
                  <div style={{ textAlign: "center", padding: "40px" }}>
                    <Spin size="large" />
                  </div>
                ) : messages.length === 0 ? (
                  <Empty 
                    description={showNewConversation ? "Start your conversation" : "No messages yet"} 
                    style={{ marginTop: "40px" }}
                  />
                ) : (
                  <List
                    dataSource={messages}
                    renderItem={(msg) => (
                      <List.Item
                        key={msg.id}
                        className={`message-item ${
                          msg.sender.is_current_user ? "sent" : "received"
                        }`}
                        style={{
                          justifyContent:
                            msg.sender.is_current_user ? "flex-end" : "flex-start",
                          border: "none",
                          padding: "4px 0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: msg.sender.is_current_user ? "row-reverse" : "row",
                            alignItems: "flex-end",
                            gap: "8px",
                            maxWidth: "70%",
                          }}
                        >
                          {!msg.sender.is_current_user && (
                            <Avatar 
                              size="small" 
                              src={msg.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.sender.name)}&background=1890ff&color=fff`} 
                            />
                          )}
                          <div
                            style={{
                              background: msg.sender.is_current_user ? "#1890ff" : "#f5f5f5",
                              color: msg.sender.is_current_user ? "white" : "black",
                              padding: "8px 12px",
                              borderRadius: "18px",
                              maxWidth: "100%",
                              wordBreak: "break-word",
                            }}
                          >
                            <div>{msg.message}</div>
                            <div 
                              style={{ 
                                fontSize: "10px", 
                                opacity: 0.7, 
                                marginTop: "2px",
                                textAlign: msg.sender.is_current_user ? "right" : "left"
                              }}
                            >
                              {formatMessageTime(msg.created_at)}
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    )}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "8px",
                  borderTop: "1px solid #ddd",
                  gap: "8px",
                }}
              >
                {/* Text input */}
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={showNewConversation ? "Type your first message..." : "Type a message..."}
                  onPressEnter={showNewConversation ? handleStartNewConversation : handleSend}
                  disabled={sendMessageMutation.isLoading || startConversationMutation.isLoading || (showNewConversation && !selectedNewUser)}
                  style={{ flex: 1, borderRadius: "20px", padding: "8px 12px" }}
                />

                {/* Send button */}
                <Button 
                  type="primary" 
                  icon={<SendOutlined />} 
                  onClick={showNewConversation ? handleStartNewConversation : handleSend}
                  loading={sendMessageMutation.isLoading || startConversationMutation.isLoading}
                  disabled={!newMessage.trim() || (showNewConversation && !selectedNewUser)}
                  shape="circle"
                />
              </div>
            </>
          ) : (
            <div className="empty-chat-message" style={{ textAlign: "center", marginTop: "40px" }}>
              <Title level={4}>Select a conversation to start chatting</Title>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />} 
                onClick={handleNewConversationClick}
                style={{ marginTop: "16px" }}
              >
                Start New Conversation
              </Button>
            </div>
          )}
        </div>
      </div>
      </Modal>
    </App>
  );
}

export default ModalMessage;
