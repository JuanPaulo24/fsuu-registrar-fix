import React, { useState, useCallback, useEffect } from 'react';
import { Select, Tag, Typography } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUser } from '@fortawesome/pro-regular-svg-icons';
import useEmailMentions from '@/hooks/useEmailMentions';

const { Text } = Typography;

const EmailMentionSelect = ({ 
    value, 
    onChange, 
    placeholder = "Type email addresses or @mentions",
    disabled = false,
    size = "large",
    style = {},
    ...props 
}) => {
    const [searchText, setSearchText] = useState('');
    const [currentValue, setCurrentValue] = useState(value || []);
    const { 
        suggestions, 
        loading, 
        fetchSuggestions, 
        processSelectedValues 
    } = useEmailMentions();

    // Handle search input change
    const handleSearch = useCallback((searchValue) => {
        setSearchText(searchValue);
        fetchSuggestions(searchValue);
    }, [fetchSuggestions]);

    // Handle value change with mention expansion and email validation
    const handleChange = useCallback(async (newValue) => {
        if (!newValue) {
            setCurrentValue([]);
            onChange && onChange([]);
            return;
        }

        // Check if any new values are mentions that need expansion
        const newValues = Array.isArray(newValue) ? newValue : [newValue];
        const lastValue = newValues[newValues.length - 1];
        
        // Validate email format for non-mention values
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = newValues.filter(value => 
            !value.startsWith('@') && !emailRegex.test(value.trim())
        );
        
        // If there are invalid emails, reject them
        if (invalidEmails.length > 0) {
            // Keep only valid emails and mentions
            const validValues = newValues.filter(value => 
                value.startsWith('@') || emailRegex.test(value.trim())
            );
            setCurrentValue(validValues);
            onChange && onChange(validValues);
            return;
        }
        
        if (lastValue && lastValue.startsWith('@')) {
            // This is a mention, expand it
            const expandedEmails = await processSelectedValues([lastValue]);
            const otherValues = newValues.slice(0, -1).filter(v => !v.startsWith('@'));
            const finalValues = [...otherValues, ...expandedEmails]; 
            const uniqueValues = [...new Set(finalValues)];
            
            setCurrentValue(uniqueValues);
            onChange && onChange(uniqueValues);
        } else {
            setCurrentValue(newValue);
            onChange && onChange(newValue);
        }
    }, [processSelectedValues, onChange]);

    // Custom option renderer
    const optionRender = useCallback((option) => {
        const { type, label, value } = option.data || option;
        
        if (type === 'mention') {
            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FontAwesomeIcon 
                        icon={value === '@all' || value === '@everyone' ? faUsers : faUsers} 
                        style={{ color: '#1890ff' }} 
                    />
                    <div>
                        <Text strong style={{ color: '#1890ff' }}>{label}</Text>
                        <br />
                    </div>
                </div>
            );
        }
        
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FontAwesomeIcon icon={faUser} style={{ color: '#666' }} />
                <Text>{label}</Text>
            </div>
        );
    }, []);

    // Custom tag renderer for selected values
    const tagRender = useCallback((props) => {
        const { label, value, closable, onClose } = props;
        
        if (value && value.startsWith('@')) {
            return (
                <Tag
                    color="blue"
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3 }}
                >
                    {label}
                </Tag>
            );
        }
        
        return (
            <Tag
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
            >
                {label}
            </Tag>
        );
    }, []);

    // Format options for display
    const formattedOptions = suggestions(searchText).map(suggestion => ({
        value: suggestion.value,
        label: suggestion.label,
        type: suggestion.type,
        data: suggestion
    }));

    useEffect(() => {
        setCurrentValue(value || []);
    }, [value]);

    return (
        <Select
            mode="tags"
            style={{ width: '100%', ...style }}
            placeholder={placeholder}
            value={currentValue}
            onChange={handleChange}
            onSearch={handleSearch}
            options={formattedOptions}
            optionRender={optionRender}
            tagRender={tagRender}
            loading={loading}
            size={size}
            disabled={disabled}
            tokenSeparators={[',', ';', ' ']}
            filterOption={false} // We handle filtering ourselves
            notFoundContent={
                searchText ? (
                    searchText.startsWith('@') ? (
                        <div style={{ padding: '8px 12px', textAlign: 'center' }}>

                        </div>
                    ) : (
                        <div style={{ padding: '8px 12px', textAlign: 'center' }}>
                            <Text type="secondary">
                                No matching emails found. 
                            </Text>
                        </div>
                    )
                ) : (
                    <div style={{ padding: '8px 12px', textAlign: 'center' }}>
                    </div>
                )
            }
            dropdownRender={(menu) => (
                <>
                    {menu}
                    {searchText && searchText.startsWith('@') && (
                        <div style={{ 
                            padding: '8px 12px', 
                            borderTop: '1px solid #f0f0f0',
                            backgroundColor: '#fafafa'
                        }}>

                        </div>
                    )}
                </>
            )}
            {...props}
        />
    );
};

export default EmailMentionSelect;