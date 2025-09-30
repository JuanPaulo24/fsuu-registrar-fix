import { useState, useEffect, useCallback } from 'react';
import { GET } from '../components/providers/useAxiosQuery';
import { token } from '../components/providers/appConfig';

const useEmailMentions = () => {
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mentionData, setMentionData] = useState(null);

    // Fetch all users by role data once
    const { data: usersByRoleData } = GET(
        'api/email-mentions/users-by-role',
        'email-mentions-users-by-role',
        {
            isLoading: false // Disable global loading for email mention data
        }
    );

    useEffect(() => {
        if (usersByRoleData?.data) {
            setMentionData(usersByRoleData.data);
        }
    }, [usersByRoleData]);

    // Get email suggestions based on search query
    const fetchSuggestions = useCallback(async (searchQuery) => {
        if (!searchQuery) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/email-mentions/suggestions?q=${encodeURIComponent(searchQuery)}`, {
                headers: {
                    'Authorization': token(),
                    'Accept': 'application/json',
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    setSuggestions(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching email suggestions:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Expand a mention to actual email addresses
    const expandMention = useCallback(async (mentionKey) => {
        try {
            const response = await fetch('/api/email-mentions/expand', {
                method: 'POST',
                headers: {
                    'Authorization': token(),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ mention: mentionKey }),
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    return result.data.emails;
                }
            }
        } catch (error) {
            console.error('Error expanding mention:', error);
        }
        return [];
    }, []);

    // Process selected values to expand mentions
    const processSelectedValues = useCallback(async (selectedValues) => {
        const processedEmails = [];
        
        for (const value of selectedValues) {
            if (value.startsWith('@')) {
                // This is a mention, expand it
                const emails = await expandMention(value);
                processedEmails.push(...emails);
            } else {
                // This is a regular email
                processedEmails.push(value);
            }
        }
        
        // Remove duplicates
        return [...new Set(processedEmails)];
    }, [expandMention]);

    // Get formatted suggestions for display
    const getFormattedSuggestions = useCallback((searchQuery) => {
        if (!searchQuery) {
            // When no search, show recent/common suggestions

            // Add mention suggestions
            const mentionSuggestions = [];
            if (mentionData?.special_mentions) {
                mentionData.special_mentions.forEach(mention => {
                    mentionSuggestions.push({
                        value: mention.mention_key,
                        label: mention.display_name,
                        type: 'mention'
                    });
                });
            }

            if (mentionData?.roles) {
                mentionData.roles.forEach(role => {
                    mentionSuggestions.push({
                        value: role.mention_key,
                        label: role.display_name,
                        type: 'mention'
                    });
                });
            }

            return [...mentionSuggestions];
        }

        // Return suggestions from API
        return suggestions;
    }, [suggestions, mentionData]);

    return {
        suggestions: getFormattedSuggestions,
        loading,
        fetchSuggestions,
        expandMention,
        processSelectedValues,
        mentionData
    };
};

export default useEmailMentions;