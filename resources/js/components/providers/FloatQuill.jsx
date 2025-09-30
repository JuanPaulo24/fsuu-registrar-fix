import React from "react";
import PropTypes from "prop-types";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import "react-quill/dist/quill.snow.css";

const fontSizes = [
    "8px",
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "22px",
    "24px",
];
const FontSize = Quill.import("attributors/style/size");
FontSize.whitelist = fontSizes;
Quill.register(FontSize, true);
Quill.register("modules/imageResize", ImageResize);

export default function FloatQuill(props) {
    const { className, placeholder = "Text Editor", ...rest } = props;

    const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "video",
    ];

    const modulesToolBar = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, false] }],
                [{ size: fontSizes }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [
                    { list: "ordered" },
                    { list: "bullet" },
                    { indent: "-1" },
                    { indent: "+1" },
                ],
                ["link", "image", "video"],
                ["clean"],
            ],
        },
        imageResize: {
            modules: ["Resize", "DisplaySize"],
        },
    };

    return (
        <ReactQuill
            className={`float-wrapper${className ? " " + className : ""}`}
            theme="snow"
            modules={modulesToolBar}
            formats={formats}
            placeholder={placeholder}
            {...rest}
        />
    );
}

FloatQuill.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    placeholder: PropTypes.string,
    formats: PropTypes.array,
    modulesToolBar: PropTypes.object,
};
