import React, { useState } from "react";
import PropTypes from "prop-types";
import { Input } from "antd";

export default function FloatInput(props) {
    const {
        id,
        value,
        label,
        placeholder,
        className,
        required,
        size = "large",
        ...rest
    } = props;

    const [focus, setFocus] = useState(false);

    let new_placeholder = !placeholder ? label : placeholder;

    let isOccupied = focus || (value && value !== "" && value.length !== 0);

    let labelClass =
        isOccupied || (value && value === "0" && value.length !== 0)
            ? " float-label"
            : "";

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
            <Input value={value} size={size} autoComplete="off" {...rest} />

            <label className={`label ${size}${labelClass}`}>
                {isOccupied ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatInput.propTypes = {
    id: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    required: PropTypes.bool,
    size: PropTypes.oneOf(["small", "middle", "large"]),
};
