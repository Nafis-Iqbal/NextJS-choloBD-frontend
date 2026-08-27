import React, { forwardRef, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaInfoCircle } from "react-icons/fa";

/** Thin theme-aware field outline — keeps inputs visible against card/section backgrounds */
const themeFieldBorder = (hasError = false): React.CSSProperties => ({
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: hasError ? "#DC2626" : "var(--theme-deep-green)",
});

type HelpInfoProps = {
    helpInfo?: string;
    openOnHover?: boolean;
    children?: React.ReactNode;
};

export const FieldHelpInfo = ({ helpInfo = "", openOnHover = false, children }: HelpInfoProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const updatePosition = () => {
            const rect = buttonRef.current?.getBoundingClientRect();
            if (!rect) return;
            const tooltipWidth = 288;
            const gutter = 8;
            const left = Math.min(
                Math.max(gutter, rect.left),
                window.innerWidth - tooltipWidth - gutter
            );
            const estimatedHeight = 120;
            const showAbove = rect.bottom + gutter + estimatedHeight > window.innerHeight;
            const top = showAbove
                ? Math.max(gutter, rect.top - estimatedHeight - gutter)
                : rect.bottom + gutter;
            setCoords({ top, left });
        };

        updatePosition();

        const handleOutsideClick = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                containerRef.current?.contains(target) ||
                tooltipRef.current?.contains(target)
            ) {
                return;
            }
            setIsOpen(false);
        };

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        document.addEventListener("keydown", handleEscape);
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
            document.removeEventListener("keydown", handleEscape);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    if (!helpInfo.trim()) {
        return null;
    }

    return (
        <div
            ref={containerRef}
            className={`relative inline-flex items-center ${children ? "gap-1.5" : ""}`}
            onMouseEnter={openOnHover ? () => setIsOpen(true) : undefined}
            onMouseLeave={openOnHover ? () => setIsOpen(false) : undefined}
        >
            {children}
            <button
                type="button"
                ref={buttonRef}
                aria-label="Show field help"
                aria-expanded={isOpen}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (openOnHover) return;
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

            {isOpen && typeof document !== "undefined" && createPortal(
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    className="fixed z-[200] w-64 sm:w-72 rounded-md px-3 py-2 text-sm leading-relaxed"
                    style={{
                        top: coords.top,
                        left: coords.left,
                        backgroundColor: "var(--theme-card-bg)",
                        color: "var(--theme-text)",
                        border: "1px solid var(--theme-deep-green)",
                        boxShadow:
                            "0 10px 25px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0, 0, 0, 0.12)",
                    }}
                >
                    <p className="font-mono" style={{ color: "var(--theme-text-muted)" }}>{helpInfo}</p>
                </div>,
                document.body
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
        style,
        ...rest
    } = props;

    return (
        <div className="relative flex flex-col space-y-1">
            <FieldLabelRow label={label} labelStyle={labelStyle} helpInfo={helpInfo} />
            <input
                className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`}
                placeholder={placeholderText}
                ref={ref}
                {...rest}
                style={{
                    textIndent: "6px",
                    backgroundColor: "var(--theme-input-bg)",
                    color: "var(--theme-text)",
                    "--tw-ring-color": "var(--theme-teal)",
                    ...style,
                    ...themeFieldBorder(Boolean(error)),
                } as React.CSSProperties & { "--tw-ring-color": string }}
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
        style,
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
                ref={ref}
                {...rest}
                style={{
                    textIndent: "6px",
                    backgroundColor: "var(--theme-input-bg)",
                    color: "var(--theme-text)",
                    outlineColor: "var(--theme-teal)",
                    "--tw-ring-color": "var(--theme-teal)",
                    ...style,
                    ...themeFieldBorder(Boolean(error)),
                } as React.CSSProperties & { "--tw-ring-color": string }}
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
        style,
        ...rest
    } = props;

    return (
        <div className="relative flex flex-col space-y-1 group">
            <FieldLabelRow label={label} labelStyle={labelStyle} helpInfo={helpInfo} />

            <textarea
                className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`}
                placeholder={placeholderText}
                ref={ref}
                {...rest}
                style={{
                    textIndent: "6px",
                    backgroundColor: "var(--theme-input-bg)",
                    color: "var(--theme-text)",
                    outlineColor: "var(--theme-teal)",
                    "--tw-ring-color": "var(--theme-teal)",
                    ...style,
                    ...themeFieldBorder(Boolean(error)),
                } as React.CSSProperties & { "--tw-ring-color": string }}
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
        style,
        ...rest
    } = props;

    return (
        <div className="relative flex flex-col space-y-1 group">
            <FieldLabelRow label={label} labelStyle={labelStyle} helpInfo={helpInfo} />

            <select
                className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`}
                ref={ref}
                {...rest}
                style={{
                    backgroundColor: "var(--theme-input-bg)",
                    color: "var(--theme-text)",
                    outlineColor: "var(--theme-teal)",
                    "--tw-ring-color": "var(--theme-teal)",
                    ...style,
                    ...themeFieldBorder(Boolean(error)),
                } as React.CSSProperties & { "--tw-ring-color": string }}
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
                        ...themeFieldBorder(Boolean(error)),
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
                    className="w-full h-full px-2 py-2 rounded-lg flex items-center transition-all"
                    style={{
                        ...themeFieldBorder(Boolean(error)),
                        backgroundColor: disabled
                            ? "color-mix(in srgb, var(--theme-input-bg) 70%, var(--theme-card-bg))"
                            : "var(--theme-input-bg)",
                        color: "var(--theme-text)",
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
                                    <span className="text-sm" style={{ color: "var(--theme-text-subtle)" }}>
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
