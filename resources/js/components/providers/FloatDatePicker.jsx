import React, { useState } from "react";
import PropTypes from "prop-types";
import { DatePicker } from "antd";

export default function FloatDatePicker(props) {
    const {
        id,
        value,
        label,
        placeholder,
        required,
        format = "DD/MM/YYYY",
        picker = "date",
        className,
        size = "large",
        ...rest
    } = props;

    const [focus, setFocus] = useState(false);

    let new_placeholder = !placeholder ? label : placeholder;

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
            <DatePicker
                value={value ? value : null}
                size={size}
                placeholder={[""]}
                format={format}
                picker={picker}
                {...rest}
            />

            <label className={`label ${size}${labelClass}`}>
                {isOccupied ? label : new_placeholder} {requiredMark}
            </label>
        </div>
    );
}

FloatDatePicker.propTypes = {
    id: PropTypes.string,
    value: PropTypes.object,
    label: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    format: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    picker: PropTypes.oneOf(["date", "week", "month", "quarter", "year"]),
    className: PropTypes.string,
    size: PropTypes.oneOf(["small", "middle", "large"]),
};
