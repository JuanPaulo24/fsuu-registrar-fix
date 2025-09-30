import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Editor } from '@tinymce/tinymce-react';

// Simple TinyMCE component for local development
export default function FloatTinyMCESimple(props) {
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

    useEffect(() => {
       
    }, []);

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

    // Simple configuration for local TinyMCE
    const editorConfig = {
        height: height,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image media table insertdatetime | removeformat charmap | code preview fullscreen',
        content_style: `
            body { 
                font-family: Arial, sans-serif; 
                font-size: 14px; 
                line-height: 1.6; 
                margin: 8px; 
            }
        `,
        skin: 'oxide',
        content_css: 'default',
        placeholder: placeholder,
        branding: false,
        promotion: false,
        license_key: 'gpl',
        
        // Local TinyMCE settings
        base_url: '/tinymce',
        suffix: '.min',
        
        // Fix z-index issues with modals
        inline: false,
        fixed_toolbar_container: null,
        ui_mode: 'combined',
        
        // Ensure dropdowns appear above modals
        popup_css_add: '.tox-tinymce-aux { z-index: 100000 !important; }',
        
        setup: (editor) => {

            
            editor.on('init', () => {
               
                
                // Ensure all TinyMCE UI elements have proper z-index
                setTimeout(() => {
                    const auxElements = document.querySelectorAll('.tox-tinymce-aux, .tox-silver-sink, .tox-menu, .tox-collection, .tox-toolbar-overlord, .tox-dialog-wrap');
                    auxElements.forEach(el => {
                        el.style.zIndex = '100000';
                    });
                }, 100);
            });
            
            editor.on('Error', (e) => {
                
            });
            
            // Fix z-index when dropdowns open
            editor.on('OpenWindow', () => {
                setTimeout(() => {
                    const auxElements = document.querySelectorAll('.tox-tinymce-aux, .tox-silver-sink, .tox-dialog-wrap, .tox-menu, .tox-collection, .tox-toolbar-overlord');
                    auxElements.forEach(el => {
                        el.style.zIndex = '100000';
                    });
                }, 10);
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
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                {...rest}
            />
        </div>
    );
}

FloatTinyMCESimple.propTypes = {
    className: PropTypes.string,
    placeholder: PropTypes.string,
    height: PropTypes.number,
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
};