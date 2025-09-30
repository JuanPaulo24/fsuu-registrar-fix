import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';

// Self-hosted version of TinyMCE that doesn't require API key validation
export default function FloatTinyMCESelfHosted(props) {
    const { 
        className, 
        placeholder = "Text Editor", 
        height = 300,
        value,
        onChange,
        disabled = false,
        ...rest 
    } = props;

    const editorRef = useRef(null);


    const handleError = (error) => {
        console.error('[FloatTinyMCE SelfHosted] Error:', error);
    };

    // Configuration for self-hosted version
    const editorConfig = {
        height: height,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table insertdatetime | removeformat charmap | code preview fullscreen | variables',
        content_style: `
            body { 
                font-family: Arial, sans-serif; 
                font-size: 14px; 
                line-height: 1.6; 
                margin: 8px; 
            }
            h1, h2, h3, h4, h5, h6 { 
                margin: 0.5em 0; 
                font-weight: bold; 
                line-height: 1.4; 
            }
            p { 
                margin: 0.5em 0; 
            }
            ul, ol { 
                margin: 0.5em 0; 
                padding-left: 1.5em; 
            }
            blockquote { 
                border-left: 4px solid #ccc; 
                margin: 1em 0; 
                padding: 0.5em 1em; 
                background-color: #f9f9f9; 
                font-style: italic; 
            }
            table { 
                border-collapse: collapse; 
                width: 100%; 
            }
            table, th, td { 
                border: 1px solid #ddd; 
            }
            th, td { 
                padding: 8px; 
                text-align: left; 
            }
        `,
        skin: 'oxide',
        content_css: false,
        placeholder: placeholder,
        branding: false,
        promotion: false,
        
        // Self-hosted specific settings
        base_url: '/tinymce',
        suffix: '.min',
        
        // Setup callback for custom functionality
        setup: (editor) => {
           
            
            // Add custom variables menu
            editor.ui.registry.addMenuButton('variables', {
                text: 'Variables',
                fetch: (callback) => {
                    
                    const items = [
                        {
                            type: 'menuitem',
                            text: 'User Information',
                            getSubmenuItems: () => [
                                {
                                    type: 'menuitem',
                                    text: 'User Name - [user:name]',
                                    onAction: () => {
                                  
                                        editor.insertContent('[user:name]');
                                    }
                                },
                                {
                                    type: 'menuitem',
                                    text: 'User Account - [user:account]',
                                    onAction: () => editor.insertContent('[user:account]')
                                },
                                {
                                    type: 'menuitem',
                                    text: 'User Password - [user:password]',
                                    onAction: () => editor.insertContent('[user:password]')
                                }
                            ]
                        },
                        {
                            type: 'menuitem',
                            text: 'Authentication',
                            getSubmenuItems: () => [
                                {
                                    type: 'menuitem',
                                    text: 'Auth Code - [auth:code]',
                                    onAction: () => editor.insertContent('[auth:code]')
                                },
                                {
                                    type: 'menuitem',
                                    text: 'Auth Expiry - [auth:expiry]',
                                    onAction: () => editor.insertContent('[auth:expiry]')
                                }
                            ]
                        },
                        {
                            type: 'menuitem',
                            text: 'Document Verification',
                            getSubmenuItems: () => [
                                {
                                    type: 'menuitem',
                                    text: 'Document Type - [document:type]',
                                    onAction: () => editor.insertContent('[document:type]')
                                },
                                {
                                    type: 'menuitem',
                                    text: 'Verification Status - [verification:status]',
                                    onAction: () => editor.insertContent('[verification:status]')
                                },
                                {
                                    type: 'menuitem',
                                    text: 'Verification Date - [verification:date]',
                                    onAction: () => editor.insertContent('[verification:date]')
                                }
                            ]
                        },
                        {
                            type: 'menuitem',
                            text: 'Message System',
                            getSubmenuItems: () => [
                                {
                                    type: 'menuitem',
                                    text: 'Message Reference - [message:reference]',
                                    onAction: () => editor.insertContent('[message:reference]')
                                },
                                {
                                    type: 'menuitem',
                                    text: 'Message Date - [message:date]',
                                    onAction: () => editor.insertContent('[message:date]')
                                }
                            ]
                        },
                        {
                            type: 'menuitem',
                            text: 'System Information',
                            getSubmenuItems: () => [
                                {
                                    type: 'menuitem',
                                    text: 'System Date - [system:date]',
                                    onAction: () => editor.insertContent('[system:date]')
                                },
                                {
                                    type: 'menuitem',
                                    text: 'System Time - [system:time]',
                                    onAction: () => editor.insertContent('[system:time]')
                                }
                            ]
                        }
                    ];
                    callback(items);
                }
            });
            
            editor.on('Error', (e) => {
                console.error('[FloatTinyMCE SelfHosted] Editor error:', e);
            });
        },
    };

    return (
        <div className={`float-wrapper tinymce-wrapper${className ? " " + className : ""}`}>
            <Editor
                onInit={handleInit}
                onError={handleError}
                value={value}
                onEditorChange={handleEditorChange}
                disabled={disabled}
                init={editorConfig}
                // Use local TinyMCE script
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                {...rest}
            />
        </div>
    );
}

FloatTinyMCESelfHosted.propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    height: PropTypes.number,
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
};