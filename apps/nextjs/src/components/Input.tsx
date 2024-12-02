import React from "react";

import { Flex } from "@radix-ui/themes";
import { cva } from "class-variance-authority";

import { Icon } from "./Icon";
import BoxEdges from "./SVGParts/BoxEdges";

const inputContainer = cva("relative w-full appearance-none ", {
  variants: {
    type: {
      textarea: "relative h-fit min-h-[120px] pb-4",
      dropdown: "cursor-pointer",
    },
    disabled: {
      true: "cursor-not-allowed",
      false: "",
    },
    error: {
      true: "border-red-500",
    },
    size: {
      sm: "p-6 px-8",
      md: "p-9 sm:p-10",
      lg: "p-12",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

const labelStyles = cva(
  "absolute -top-8 left-10 z-10 w-fit -rotate-2 bg-teachersYellow px-8 text-sm text-black sm:-top-10 sm:text-base",
);

export type InputProps = Readonly<{
  label: string;
  name: string;
  type: "text" | "dropdown" | "email" | "textarea"; // Added "textarea" type
  options?: string[] | number[]; // Required if type is 'dropdown'
  className?: string;
  onChange?: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >, // Update the type
  ) => void;
  defaultValue?: string;
  value?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  disabled?: boolean;
  resize?: boolean;
  size?: "sm" | "md" | "lg"; // Implement for all input types
}>;

const Input: React.FC<InputProps> = ({
  label,
  name,
  type,
  options,
  className,
  onChange,
  defaultValue,
  value,
  onKeyDown,
  onBlur,
  disabled,
  size,
  resize = true,
}) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    // Update the type
    if (onChange) onChange(e);
  };

  return (
    <Flex direction="column" my="5" className={`relative ${className}`}>
      <label htmlFor={name} className={labelStyles()}>
        {label}
      </label>
      <div className="relative w-[100%]">
        {type === "text" && (
          <input
            type="text"
            id={name}
            className={inputContainer({ disabled })}
            onChange={onChange}
            defaultValue={defaultValue}
            value={value}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            disabled={disabled}
          />
        )}

        {type === "email" && (
          <input
            type="text"
            id={name}
            className={inputContainer({ disabled })}
            onChange={onChange}
            defaultValue={value}
            onKeyDown={onKeyDown}
            disabled={disabled}
          />
        )}

        {type === "textarea" && (
          <textarea
            id={name}
            className={inputContainer({ type })}
            onChange={onChange}
            value={value}
            defaultValue={defaultValue}
            onBlur={onBlur}
            disabled={disabled}
            style={{
              resize: resize ? "vertical" : "none",
            }}
          />
        )}

        {type === "dropdown" && options && (
          <span className="relative flex">
            <span className="z-20">
              <Icon
                icon="chevron-down"
                className="pointer-events-none absolute right-9 top-9 sm:right-10 sm:top-10"
                size="sm"
              />
            </span>
            <select
              id={name}
              className={inputContainer({ type, size })}
              onChange={handleChange}
              value={value}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </span>
        )}
        <BoxEdges inputType={type} />
      </div>
    </Flex>
  );
};

export default Input;
