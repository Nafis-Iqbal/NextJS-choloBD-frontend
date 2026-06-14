import React, {forwardRef} from "react";

type CustomInputProps = {
  className?: string;
  placeholderText?: string;
  label?: string;
  secondaryLabel?: string;
  labelStyle?: string; 
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>

export const CustomMiniTextInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
    const {
      className,
      placeholderText,
      label,
      labelStyle,
      error,
      ...rest
    } = props;

    return (
      <input 
        className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`} 
        placeholder={placeholderText}
        style={{ 
          textIndent: '6px',
          backgroundColor: 'var(--theme-input-bg)',
          color: 'var(--theme-text)',
          borderWidth: '1px',
          borderColor: 'var(--theme-deep-green)',
          '--theme-focus-color': 'var(--theme-teal)',
        } as React.CSSProperties & { '--theme-focus-color': string }}
        ref={ref}
        { ...rest }
      />
    )
})

CustomMiniTextInput.displayName = "CustomMiniTextInput";


export const CustomTextInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
    const {
      className,
      placeholderText,
      label,
      secondaryLabel,
      labelStyle,
      error,
      ...rest
    } = props;

    return (
      <div className="relative flex flex-col space-y-1 group">
        <div className="flex items-center space-x-2">
          {label && <label style={{ color: labelStyle ? undefined : 'var(--theme-teal)' }} className={labelStyle}>{label}</label>}
          {secondaryLabel && <span style={{ color: 'var(--theme-text-subtle)' }} className="text-sm">{secondaryLabel}</span>}
        </div>
        
        <input 
          className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`} 
          placeholder={placeholderText}
          style={{
            textIndent: '6px',
            backgroundColor: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            borderWidth: '1px',
            borderColor: 'var(--theme-deep-green)',
            outlineColor: 'var(--theme-teal)',
          }}
          ref={ref}
          { ...rest }
        />

        {error && (
          <div 
            className="absolute right-0 mt-1 text-xs p-1 rounded shadow z-10"
            style={{
              backgroundColor: '#DC2626',
              color: 'white'
            }}
          >
            {error}
          </div>
        )}
      </div>
    )
})

CustomTextInput.displayName = "CustomTextInput";


export const CustomDateInput = forwardRef<HTMLInputElement, CustomInputProps>((props, ref) => {
    const {
      className,
      label,
      labelStyle,
      error,
      ...rest
    } = props;

    return (
      <div className="relative flex flex-col space-y-1 group">
        {label && <label style={{ color: labelStyle ? undefined : 'var(--theme-teal)' }} className={labelStyle}>{label}</label>}
        
        <style>{`
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.8);
            cursor: pointer;
          }
        `}</style>
        
        <input 
          type="date"
          className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`}
          style={{
            backgroundColor: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            borderWidth: '1px',
            borderColor: 'var(--theme-deep-green)',
            outlineColor: 'var(--theme-teal)',
          }}
          ref={ref}
          { ...rest }
        />

        {error && (
          <div 
            className="absolute right-0 mt-1 text-xs p-1 rounded shadow z-10"
            style={{
              backgroundColor: '#DC2626',
              color: 'white'
            }}
          >
            {error}
          </div>
        )}
      </div>
    )
})

CustomDateInput.displayName = "CustomDateInput";


type CustomTextAreaProps = {
  className?: string;
  placeholderText?: string;
  label?: string;
  labelStyle?: string; 
  error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>

export const CustomTextAreaInput = forwardRef<HTMLTextAreaElement, CustomTextAreaProps>((props, ref) => {
    const {
      className,
      placeholderText,
      label,
      labelStyle,
      error,
      ...rest
    } = props;

    return (
      <div className="relative flex flex-col space-y-1 group">
        {label && <label style={{ color: labelStyle ? undefined : 'var(--theme-teal)' }} className={labelStyle}>{label}</label>}

        <textarea 
          className={`p-1 rounded-sm focus:outline-none focus:ring-2 ${className}`} 
          placeholder={placeholderText}
          style={{
            textIndent: '6px',
            backgroundColor: 'var(--theme-input-bg)',
            color: 'var(--theme-text)',
            borderWidth: '1px',
            borderColor: 'var(--theme-deep-green)',
            outlineColor: 'var(--theme-teal)',
          }}
          ref={ref}
          { ...rest }
        />
        
        {error && (
          <div 
            className="absolute right-0 mt-1 text-xs p-1 rounded shadow z-10"
            style={{
              backgroundColor: '#DC2626',
              color: 'white'
            }}
          >
            {error}
          </div>
        )}
      </div>
    )
})

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
    ...rest
  } = props;

  return (
    <div className="relative flex flex-col space-y-1 group">
      {label && <label className={labelStyle ? labelStyle : "text-green-300"}>{label}</label>}

      <select
        className={`p-1 border border-gray-600 rounded-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${className}`}
        ref={ref}
        { ...rest }
      >
        {options.map((opt) => (
          <option className="bg-gray-700" key={opt.value} value={opt.value}>
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
})

CustomSelectInput.displayName = "CustomSelectInput";


interface CustomCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelStyle?: string;
    error?: string;
    className?: string;
}

export const CustomCheckboxInput = forwardRef<HTMLInputElement, CustomCheckboxProps>((props, ref) => {
    const {
        className,
        label,
        labelStyle,
        error,
        ...rest
    } = props;

    return (
        <div className={`relative flex flex-col space-y-2 group ${className}`}>
            <label className={`inline-flex items-center space-x-2 cursor-pointer ${labelStyle}`}>
                <input
                    type="checkbox"
                    className={`form-checkbox h-4 w-4 text-green-500 bg-gray-700 border-gray-600 rounded-sm focus:ring-green-500`}
                    ref={ref}
                    {...rest}
                />
                {label && <span className="text-white">{label}</span>}
            </label>

            {error && (
                <div className="absolute right-0 mt-1 text-xs text-white bg-red-500 p-1 rounded shadow z-10">
                    {error}
                </div>
            )}
        </div>
    );
});

CustomCheckboxInput.displayName = "CustomCheckboxInput";
