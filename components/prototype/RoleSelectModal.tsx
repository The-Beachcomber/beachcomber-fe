/*
 * @Author: Fangyu Kung
 * @Date: 2026-09-06 01:58:05
 * @LastEditors: Do not edit
 * @LastEditTime: 2026-09-06 02:02:41
 * @FilePath: /beachcomber-fe/components/prototype/RoleSelectModal.tsx
 */
"use client";

import { Button } from "@/components/ui/button";
import type { SpecGenerationRole } from "@/lib/api/spec";

const ROLE_OPTIONS: Array<{ value: SpecGenerationRole; label: string }> = [
  { value: "pm", label: "PM" },
  { value: "eng", label: "ENG" },
  { value: "ui", label: "UI" },
  { value: "qa", label: "QA" },
];

type RoleSelectModalProps = {
  open: boolean;
  selectedRoles: SpecGenerationRole[];
  isSubmitting: boolean;
  errorMessage: string | null;
  onToggleRole: (role: SpecGenerationRole) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function RoleSelectModal({
  open,
  selectedRoles,
  isSubmitting,
  errorMessage,
  onToggleRole,
  onClose,
  onSubmit,
}: RoleSelectModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-70 grid place-items-center bg-slate-950/75 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl">
        <h2 className="text-base font-semibold text-slate-100">
          選擇 Spec 角色
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          勾選要生成的角色後，按下「生成 Spec」才會送出 API。
        </p>

        <div className="mt-4 space-y-2">
          {ROLE_OPTIONS.map((option) => {
            const checked = selectedRoles.includes(option.value);
            return (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleRole(option.value)}
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-emerald-400"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>

        {errorMessage && (
          <p className="mt-3 text-xs text-rose-300">{errorMessage}</p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-xs"
          >
            取消
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isSubmitting || selectedRoles.length === 0}
            className="text-xs font-medium"
          >
            {isSubmitting ? "生成中..." : "生成 Spec"}
          </Button>
        </div>
      </div>
    </div>
  );
}
