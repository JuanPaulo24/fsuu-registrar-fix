import React, { useState } from "react";
import PropTypes from "prop-types";
import { PasswordInput } from "antd-password-input-strength";

export default function FloatInputPasswordStrength(props) {
    const {
        id,
        value,
        label,
        placeholder,
        required,
        size = "large",
        className,
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
            <PasswordInput value={value} size={size} {...rest} />

            <label className={`label ${size}${labelClass}`}>
                {isOccupied ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatInputPasswordStrength.propTypes = {
    id: PropTypes.string,
    value: PropTypes.string,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string,
    size: PropTypes.oneOf(["small", "middle", "large"]),
};
