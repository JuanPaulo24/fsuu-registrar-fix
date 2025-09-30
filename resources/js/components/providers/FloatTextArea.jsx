import React, { useState } from "react";
import PropTypes from "prop-types";
import { Input } from "antd";

export default function FloatTextArea(props) {
    const {
        id,
        value,
        label,
        placeholder,
        required,
        className,
        rows = 4,
        size = "large",
        ...rest
    } = props;

    const [focus, setFocus] = useState(false);

    let new_placeholder = placeholder ? placeholder : label;

    let isOccupied = focus || (value && value.length !== 0);

    let labelClass = isOccupied ? " float-label" : "";

    let requiredMark = required ? (
        <span className="text-red-600">*</span>
    ) : null;

    return (
        <div
            id={id ?? ""}
            className={`float-wrapper${className ? " " + className : ""}`}
            onBlur={() => setFocus(false)}
            onFocus={() => setFocus(true)}
        >
            <Input.TextArea value={value} size={size} rows={rows} {...rest} />

            <label className={`label ${size}${labelClass}`}>
                {isOccupied ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatTextArea.propTypes = {
    id: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string,
    rows: PropTypes.number,
    size: PropTypes.oneOf(["small", "middle", "large"]),
};
