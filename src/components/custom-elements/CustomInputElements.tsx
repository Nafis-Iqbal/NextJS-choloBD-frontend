import React, { forwardRef, useEffect, useRef, useState } from "react";
import { FaInfoCircle } from "react-icons/fa";

type HelpInfoProps = {
    helpInfo?: string;
};

export const FieldHelpInfo = ({ helpInfo = "" }: HelpInfoProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen]);

    if (!helpInfo.trim()) {
        return null;
    }

    return (
        <div ref={containerRef} className="relative inline-flex items-center">
            <button
                type="button"
                aria-label="Show field help"
                aria-expanded={isOpen}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsOpen((prev) => !prev);
                }}
                className="inline-flex items-center justify-center rounded-full p-0.5 transition-opacity hover:opacity-80"
                style={{
                    backgroundColor: "transparent",
                    color: "var(--theme-teal)",
                    border: "none",
                }}
            >
                <FaInfoCircle className="w-4 h-4" />
            </button>

            {isOpen && (
                <div
                    role="tooltip"
                    className="absolute left-0 top-full mt-2 z-30 w-64 sm:w-72 rounded-md px-3 py-2 text-sm leading-relaxed"
                    style={{
                        backgroundColor: "var(--theme-card-bg)",
                        color: "var(--theme-text)",
                        border: "1px solid var(--theme-deep-green)",
                        boxShadow:
                            "0 10px 25px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.12)",
                    }}
                >
                    <p style={{ color: "var(--theme-text-muted)" }}>{helpInfo}</p>
                </div>
            )}
        </div>
    );
};

const FieldLabelRow = ({
    label,
    secondaryLabel,
    labelStyle,
    helpInfo = "",
}: {
    label?: string;
    secondaryLabel?: string;
    labelStyle?: string;
    helpInfo?: string;
}) => {
    if (!label && !secondaryLabel && !helpInfo?.trim()) {
        return null;
    }

    return (
        <div className="flex items-center space-x-2">
            {label && (
                <label
                    style={{ color: labelStyle ? undefined : "var(--theme-teal)" }}
                    className={labelStyle}
                >
                    {label}
                </label>
            )}
            {secondaryLabel && (
                <span style={{ color: "var(--theme-text-subtle)" }} className="text-sm">
                    {secondaryLabel}
                </span>
            )}
            <FieldHelpInfo helpInfo={helpInfo} />
        </div>
    );
};

type CustomInputProps = {
    className?: string;
    placeholderText?: string;
    label?: string;
    secondaryLabel?: string;
    labelStyle?: string;
    helpInfo?: string;
    error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const CustomMiniTextInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
    const {
        className,
        placeholderText,
        label,
        labelStyle,
        helpInfo = "",
        error,
        ...rest
    } = props;

    return (
        <div className="relative flex flex-col space-y-1">
            <FieldLabelRow label={label} labelStyle={labelStyle} helpInfo={helpInfo} />
            <input
                className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`}
                placeholder={placeholderText}
                style={{
                    textIndent: "6px",
                    backgroundColor: "var(--theme-input-bg)",
                    color: "var(--theme-text)",
                    borderWidth: "1px",
                    borderColor: "var(--theme-deep-green)",
                    "--tw-ring-color": "var(--theme-teal)",
                } as React.CSSProperties & { "--tw-ring-color": string }}
                ref={ref}
                {...rest}
            />
        </div>
    );
});

CustomMiniTextInput.displayName = "CustomMiniTextInput";


export const CustomTextInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
    const {
        className,
        placeholderText,
        label,
        secondaryLabel,
        labelStyle,
        helpInfo = "",
        error,
        ...rest
    } = props;

    return (
        <div className="relative flex flex-col space-y-1 group">
            <FieldLabelRow
                label={label}
                secondaryLabel={secondaryLabel}
                labelStyle={labelStyle}
                helpInfo={helpInfo}
            />

            <input
                className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`}
                placeholder={placeholderText}
                style={{
                    textIndent: "6px",
                    backgroundColor: "var(--theme-input-bg)",
                    color: "var(--theme-text)",
                    borderWidth: "1px",
                    borderColor: "var(--theme-deep-green)",
                    outlineColor: "var(--theme-teal)",
                    "--tw-ring-color": "var(--theme-teal)",
                } as React.CSSProperties & { "--tw-ring-color": string }}
                ref={ref}
                {...rest}
            />

            {error && (
                <div
                    className="absolute right-0 mt-1 text-xs p-1 rounded shadow z-10"
                    style={{
                        backgroundColor: "#DC2626",
                        color: "white",
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
});

CustomTextInput.displayName = "CustomTextInput";

type CustomTextAreaProps = {
    className?: string;
    placeholderText?: string;
    label?: string;
    labelStyle?: string;
    helpInfo?: string;
    error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const CustomTextAreaInput = forwardRef<HTMLTextAreaElement, CustomTextAreaProps>((props, ref) => {
    const {
        className,
        placeholderText,
        label,
        labelStyle,
        helpInfo = "",
        error,
        ...rest
    } = props;

    return (
        <div className="relative flex flex-col space-y-1 group">
            <FieldLabelRow label={label} labelStyle={labelStyle} helpInfo={helpInfo} />

            <textarea
                className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`}
                placeholder={placeholderText}
                style={{
                    textIndent: "6px",
                    backgroundColor: "var(--theme-input-bg)",
                    color: "var(--theme-text)",
                    borderWidth: "1px",
                    borderColor: "var(--theme-deep-green)",
                    outlineColor: "var(--theme-teal)",
                    "--tw-ring-color": "var(--theme-teal)",
                } as React.CSSProperties & { "--tw-ring-color": string }}
                ref={ref}
                {...rest}
            />

            {error && (
                <div
                    className="absolute right-0 mt-1 text-xs p-1 rounded shadow z-10"
                    style={{
                        backgroundColor: "#DC2626",
                        color: "white",
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
});

CustomTextAreaInput.displayName = "CustomTextAreaInput";

type Option = {
    label: string;
    value: string;
};

type CustomSelectProps = {
    options: Option[];
    defaultSelectText?: string;
    className?: string;
    label?: string;
    labelStyle?: string;
    helpInfo?: string;
    error?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export const CustomSelectInput = forwardRef<HTMLSelectElement, CustomSelectProps>((props, ref) => {
    const {
        options,
        defaultSelectText = "-- Select an input --",
        className = "",
        label,
        error,
        labelStyle,
        helpInfo = "",
        ...rest
    } = props;

    return (
        <div className="relative flex flex-col space-y-1 group">
            <FieldLabelRow label={label} labelStyle={labelStyle} helpInfo={helpInfo} />

            <select
                className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`}
                style={{
                    borderWidth: "1px",
                    borderColor: "var(--theme-deep-green)",
                    backgroundColor: "var(--theme-input-bg)",
                    color: "var(--theme-text)",
                    outlineColor: "var(--theme-teal)",
                    "--tw-ring-color": "var(--theme-teal)",
                } as React.CSSProperties & { "--tw-ring-color": string }}
                ref={ref}
                {...rest}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {error && (
                <div className="absolute left-0 mt-1 text-xs text-white bg-red-500 p-1 rounded shadow z-10">
                    {error}
                </div>
            )}
        </div>
    );
});

CustomSelectInput.displayName = "CustomSelectInput";

interface CustomCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelStyle?: string;
    helpInfo?: string;
    error?: string;
    className?: string;
}

export const CustomCheckboxInput = forwardRef<HTMLInputElement, CustomCheckboxProps>((props, ref) => {
    const {
        className,
        label,
        labelStyle,
        helpInfo = "",
        error,
        ...rest
    } = props;

    return (
        <div className={`relative flex flex-col space-y-2 group ${className}`}>
            <div className="inline-flex items-center space-x-2">
                <label className={`inline-flex items-center space-x-2 cursor-pointer ${labelStyle}`}>
                    <input
                        type="checkbox"
                        className={`form-checkbox h-4 w-4 rounded-sm focus:ring-2`}
                        style={{
                            "--tw-ring-color": "var(--theme-teal)",
                            color: "var(--theme-teal)",
                            accentColor: "var(--theme-teal)",
                        } as React.CSSProperties & { "--tw-ring-color": string }}
                        ref={ref}
                        {...rest}
                    />
                    {label && <span style={{ color: "var(--theme-text)" }}>{label}</span>}
                </label>
                <FieldHelpInfo helpInfo={helpInfo} />
            </div>

            {error && (
                <div className="absolute right-0 mt-1 text-xs text-white bg-red-500 p-1 rounded shadow z-10">
                    {error}
                </div>
            )}
        </div>
    );
});

CustomCheckboxInput.displayName = "CustomCheckboxInput";

export const CustomDateInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
    const {
        className,
        label,
        labelStyle,
        helpInfo = "",
        error,
        value,
        onChange,
        ...rest
    } = props;

    const inputRef = useRef<HTMLInputElement>(null);

    const openPicker = () => {
        const input: HTMLInputElement | null = inputRef.current;
        if (!input) return;

        const inputElement = input as HTMLInputElement & { showPicker?: () => void };
        if (inputElement.showPicker) {
            inputElement.showPicker();
        } else {
            input.focus();
            input.click();
        }
    };

    return (
        <div className="relative flex flex-col space-y-1 group">
            <FieldLabelRow label={label} labelStyle={labelStyle} helpInfo={helpInfo} />

            <div
                className={`relative w-full h-[42px] cursor-pointer ${className}`}
                onClick={openPicker}
            >
                <input
                    ref={inputRef}
                    type="date"
                    value={value}
                    onChange={onChange}
                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                    {...rest}
                />

                <div
                    className="w-full h-full px-2 py-2 rounded-sm flex items-center transition-all"
                    style={{
                        borderWidth: "1px",
                        borderColor: error ? "#DC2626" : "var(--theme-deep-green)",
                        backgroundColor: "var(--theme-input-bg)",
                        color: "var(--theme-text)",
                    }}
                >
                    {value ? (
                        (() => {
                            const valueStr = typeof value === "string" ? value : String(value || "");
                            const formatted = formatDateDisplay(valueStr);

                            return (
                                <span className="text-sm leading-tight">
                                    <span className="font-semibold text-base">
                                        {formatted?.day}
                                    </span>{" "}
                                    <span>
                                        {formatted?.rest}
                                    </span>
                                </span>
                            );
                        })()
                    ) : (
                        <span className="text-sm" style={{ color: "var(--theme-text-subtle)" }}>
                            Select Date
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div
                    className="absolute right-0 mt-1 text-xs p-1 rounded shadow z-10"
                    style={{
                        backgroundColor: "#DC2626",
                        color: "white",
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
});

CustomDateInput.displayName = "CustomDateInput";

type CustomDatePickerProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabledText?: string;
    disabled?: boolean;
    label?: string;
    labelStyle?: string;
    helpInfo?: string;
    error?: string;
    className?: string;
};

export const CustomDatePicker = forwardRef<HTMLInputElement, CustomDatePickerProps>(({
    value,
    onChange,
    placeholder = "Select Date",
    disabledText,
    disabled = false,
    label,
    labelStyle,
    helpInfo = "",
    error,
    className,
}, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const openPicker = () => {
        if (disabled) return;

        const input: HTMLInputElement | null = inputRef.current;
        if (!input) return;

        const inputElement = input as HTMLInputElement & { showPicker?: () => void };
        if (inputElement.showPicker) {
            inputElement.showPicker();
        } else {
            input.focus();
            input.click();
        }
    };

    return (
        <div className="relative flex flex-col space-y-1 group">
            <FieldLabelRow label={label} labelStyle={labelStyle} helpInfo={helpInfo} />

            <div
                className={`relative w-full h-[42px] ${
                    disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                } ${className}`}
                onClick={openPicker}
            >
                <input
                    ref={inputRef}
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={disabled}
                    className="absolute w-0 h-0 opacity-0 pointer-events-none"
                />

                <div
                    className="w-full h-full px-2 py-2 border rounded-lg bg-white text-black flex items-center transition-all"
                    style={{
                        borderColor: error ? "#DC2626" : "var(--theme-deep-green)",
                        backgroundColor: disabled ? "#f3f4f6" : "white",
                    }}
                >
                    {disabled && disabledText ? (
                        <span className="text-xs font-medium" style={{ color: "var(--theme-teal)" }}>
                            {disabledText}
                        </span>
                    ) : (
                        <span className="text-sm leading-tight">
                            {
                                value ? (
                                    (() => {
                                        const formatted = formatDateDisplay(value);

                                        return (
                                            <span className="text-sm leading-tight">
                                                <span className="font-semibold text-base">
                                                    {formatted?.day}
                                                </span>{" "}
                                                <span>
                                                    {formatted?.rest}
                                                </span>
                                            </span>
                                        );
                                    })()
                                ) : (
                                    <span className="text-sm text-gray-500">
                                        {placeholder}
                                    </span>
                                )
                            }
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div
                    className="absolute right-0 mt-1 text-xs p-1 rounded shadow z-10"
                    style={{
                        backgroundColor: "#DC2626",
                        color: "white",
                    }}
                >
                    {error}
                </div>
            )}
        </div>
    );
});

CustomDatePicker.displayName = "CustomDatePicker";

const formatDateDisplay = (dateString: string): {
    day: string;
    rest: string;
} | null => {
    if (!dateString) return null;

    const date = new Date(dateString);

    const day = date.getDate();

    const suffix =
        day % 10 === 1 && day !== 11
            ? "st"
            : day % 10 === 2 && day !== 12
            ? "nd"
            : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";

    const month = date.toLocaleString("en-GB", {
        month: "short",
    });

    const year = date
        .getFullYear()
        .toString()
        .slice(-2);

    const weekday = date.toLocaleString("en-GB", {
        weekday: "short",
    });

    return {
        day: `${day}`,
        rest: `${month} '${year} ${weekday}`,
    };
};
