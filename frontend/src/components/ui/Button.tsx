import React from "react";

export interface ButtonProps {
    variant: "primary" | "secondary";
    size: "sm" | "md" | "lg";
    text: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    loading?: boolean;
    type?: "button" | "submit" | "reset";
}

const variantStyles = {
    "primary": "bg-purple-600 hover:bg-purple-700 text-white shadow-sm",
    "secondary": "bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 dark:hover:bg-purple-900/80 border border-purple-200/80 dark:border-purple-900/50"
};

const sizeStyles = {
    "sm": "py-1 px-2.5 text-xs",
    "md": "py-2 px-4 text-sm",
    "lg": "py-2.5 px-5 text-sm sm:text-base"
};

const defaultStyles = "rounded-md font-medium flex items-center justify-center select-none transition-all duration-150 ease-out active:scale-[0.97]";

export const Button = (props: ButtonProps) => {
    return (
        <button
            type={props.type || "button"}
            onClick={props.onClick}
            disabled={props.loading}
            className={`${variantStyles[props.variant]} ${defaultStyles} ${sizeStyles[props.size]} ${props.loading ? "opacity-45 cursor-not-allowed" : "cursor-pointer"}`}
        >
            {props.startIcon ? <span className="mr-1.5 flex items-center">{props.startIcon}</span> : null}
            {props.text}
            {props.endIcon ? <span className="ml-1.5 flex items-center">{props.endIcon}</span> : null}
        </button>
    );
};
