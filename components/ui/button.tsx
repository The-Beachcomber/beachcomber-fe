/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-05 11:44:27
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-05 12:36:26
 * @FilePath: /beachcomber-fe/components/ui/button.tsx
 */
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "default" | "outline" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClassName: Record<ButtonVariant, string> = {
  default:
    "border border-indigo-400/40 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)]",
  outline:
    "border border-white/15 bg-transparent text-slate-100 hover:bg-white/5",
  ghost:
    "border border-transparent bg-transparent text-slate-200 hover:bg-white/5",
};

export function Button({
  className,
  variant = "default",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "rounded-xl px-4 py-2 text-sm font-medium transition duration-200 disabled:cursor-not-allowed disabled:opacity-50",
        variantClassName[variant],
        className,
      )}
      {...props}
    />
  );
}
