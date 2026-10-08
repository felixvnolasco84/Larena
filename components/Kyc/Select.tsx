"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const EMPTY_VALUE = "__kyc_empty_value__";
type KycSelectProps = {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
  name?: string;
  disabled?: boolean;
  compact?: boolean;
  placeholder?: string;
  selectedLabel?: string;
  contentClassName?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

export default function KycSelect({
  id,
  value,
  onValueChange,
  options,
  name,
  disabled,
  compact,
  placeholder,
  selectedLabel,
  contentClassName,
  ...aria
}: KycSelectProps) {
  // Radix reserves an empty item value for clearing the selection. Keep the
  // existing empty filter/country values in application state, using a sentinel
  // only inside the component.
  const emptyOption = options.some((option) => option.value === "");
  const selectValue = value === "" && emptyOption ? EMPTY_VALUE : value;
  return (
    <Select
      name={name}
      value={selectValue}
      onValueChange={(next) => onValueChange(next === EMPTY_VALUE ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "kyc-select-trigger [&>span]:line-clamp-none focus:ring-0 focus:ring-offset-0",
          compact ? "kyc-select-compact" : "kyc-input",
        )}
        {...aria}
      >
        <SelectValue placeholder={placeholder}>
          {selectedLabel ?? options.find((option) => option.value === value)?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={4}
        collisionPadding={16}
        className={cn("kyc-select-content", contentClassName)}
      >
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value || EMPTY_VALUE}
            className="kyc-select-item"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
