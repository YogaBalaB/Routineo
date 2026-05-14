import { cn } from "../lib/utils";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  isLoading?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export default function PrimaryButton({ 
  label, 
  onClick, 
  isLoading, 
  type = "button", 
  disabled,
  className 
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-[15px] text-white transition-colors duration-150 ease-in-out",
        "bg-[#7C3AED] hover:bg-[#6D28D9] active:bg-[#5B21B6]",
        "disabled:opacity-70 disabled:cursor-not-allowed",
        className
      )}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {isLoading ? "Creating..." : label}
    </button>
  );
}
