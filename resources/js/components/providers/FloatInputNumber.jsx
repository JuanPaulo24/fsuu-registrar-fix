import React, { useState } from "react";
import PropTypes from "prop-types";
import { InputNumber } from "antd";

export default function FloatInputNumber(props) {
    const {
        id,
        value,
        label,
        placeholder,
        required,
        className,
        size = "large",
        ...rest
    } = props;

    const [focus, setFocus] = useState(false);

    let new_placeholder = placeholder ? placeholder : label;

    let isOccupied =
        focus ||
        (value !== undefined &&
            value !== null &&
            value !== "" &&
            value.length !== 0);

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
            <InputNumber
                value={value}
                size={size}
                autoComplete="off"
                {...rest}
            />
            <label className={`label ${size}${labelClass}`}>
                {isOccupied ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatInputNumber.propTypes = {
    id: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    className: PropTypes.string,
    size: PropTypes.oneOf(["small", "middle", "large"]),
};
