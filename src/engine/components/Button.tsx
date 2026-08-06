import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cx } from "../utils/resolve";

export interface ButtonProps {
  children?: ReactNode;
  label?: string;
  variant?: "primary" | "secondary" | "ghost" | "text";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}

/** Theme-driven button (shape/colors come from theme.json via CSS vars). */
export function Button({ children, label, variant = "primary", size = "md", onClick, className, ariaLabel }: ButtonProps) {
  return (
    <motion.button
      type="button"
      className={cx("tpl-btn", `tpl-btn--${variant}`, `tpl-btn--${size}`, className)}
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      {children ?? label}
    </motion.button>
  );
}