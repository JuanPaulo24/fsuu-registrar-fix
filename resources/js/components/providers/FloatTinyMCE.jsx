import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';

export default function FloatTinyMCE(props) {
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



    const handleEditorChange = (content, editor) => {
        if (onChange) {
            onChange(content);
        }
    };

    const handleInit = (evt, editor) => {
       
        editorRef.current = editor;
    };

    const handleError = (error) => {
       
    };

    // TinyMCE configuration optimized for email templates
    // Updated to use only TinyMCE 8 compatible plugins
    const editorConfig = {
        height: height,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount', 'emoticons',
            'codesample', 'pagebreak', 'quickbars'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table insertdatetime | removeformat charmap emoticons | code preview fullscreen | variables',
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
        content_css: 'default',
        branding: false,
        promotion: false,
        placeholder: placeholder,
        
        // Email template specific settings
        formats: {
            alignleft: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'left' } },
            aligncenter: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'center' } },
            alignright: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'right' } },
            alignjustify: { selector: 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li,table,img', styles: { textAlign: 'justify' } }
        },
        
        // Advanced settings for email templates
        valid_elements: '*[*]',
        extended_valid_elements: '*[*]',
        invalid_elements: 'script,iframe,object,embed',
        
        // Image handling
        images_upload_handler: (blobInfo, success, failure) => {
            // Custom image upload handler
            // For now, we'll convert to base64 (you can implement server upload later)
            const reader = new FileReader();
            reader.onload = () => {
                success(reader.result);
            };
            reader.readAsDataURL(blobInfo.blob());
        },
        
        // Table settings
        table_default_attributes: {
            border: '1'
        },
        table_default_styles: {
            'border-collapse': 'collapse',
            'width': '100%'
        },
        
        // Link settings
        link_default_target: '_blank',
        
        // Paste settings
        paste_data_images: true,
        paste_as_text: false,
        
        // Accessibility
        a11y_advanced_options: true,
        
        // Performance
        convert_urls: false,
        relative_urls: false,
        
        // Disable unwanted features for email templates
        resize: false,
        statusbar: false,
        
        // Domain configuration
        referrer_policy: 'origin',
        
        // License key configuration
        license_key: 'gpl',
        
        // Setup callback for debugging
        setup: (editor) => {
           
            
            editor.on('init', () => {
               
            });
            
            editor.on('LoadContent', () => {
               
            });
            
            editor.on('Error', (e) => {
               
            });
            
            // Add custom button for inserting variables
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
                                    onAction: () => editor.insertContent('[user:name]')
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
                                },
                                {
                                    type: 'menuitem',
                                    text: 'Revocation Reason - [document:revocation_reason]',
                                    onAction: () => editor.insertContent('[document:revocation_reason]')
                                },
                                {
                                    type: 'menuitem',
                                    text: 'Revocation Date - [document:revocation_date]',
                                    onAction: () => editor.insertContent('[document:revocation_date]')
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
        },
    };

    return (
        <div className={`float-wrapper tinymce-wrapper${className ? " " + className : ""}`}>
            <Editor
                onInit={handleInit}
                onError={handleError}
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                value={value}
                onEditorChange={handleEditorChange}
                disabled={disabled}
                init={editorConfig}
                tinymceScriptSrc={`https://cdn.tiny.cloud/1/${import.meta.env.VITE_TINYMCE_API_KEY}/tinymce/7/tinymce.min.js`}
                {...rest}
            />
        </div>
    );
}

FloatTinyMCE.propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    height: PropTypes.number,
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
};