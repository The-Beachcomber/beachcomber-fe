"use client";

import { SpecViewer } from "@/components/spec/SpecViewer";
import { Button } from "@/components/ui/button";
import { generateMeetingSpecs } from "@/lib/api";
import type { MeetingSpecsItem, SpecGenerationRole } from "@/lib/api/spec";
import { motion } from "framer-motion";
import { useCallback, useMemo, useState } from "react";
import { RoleSelectModal } from "./RoleSelectModal";

type PrototypeModalProps = {
  open: boolean;
  meetingId: string | null;
  prototypeUrl: string | null;
  isLoading: boolean;
  onClose: () => void;
};

export function PrototypeModal({
  open,
  meetingId,
  prototypeUrl,
  isLoading,
  onClose,
}: PrototypeModalProps) {
  const iframeSrc = useMemo(() => prototypeUrl?.trim() ?? "", [prototypeUrl]);
  const [isRoleSelectOpen, setIsRoleSelectOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<SpecGenerationRole[]>([]);
  const [isGeneratingSpecs, setIsGeneratingSpecs] = useState(false);
  const [specError, setSpecError] = useState<string | null>(null);
  const [specResults, setSpecResults] = useState<MeetingSpecsItem[]>([]);
  const [preferredSpecRole, setPreferredSpecRole] =
    useState<SpecGenerationRole | null>(null);
  const [specViewerSeed, setSpecViewerSeed] = useState(0);
  const specMap = useMemo(
    () =>
      specResults.reduce<Partial<Record<SpecGenerationRole, string>>>(
        (acc, item) => ({ ...acc, [item.role]: item.spec }),
        {},
      ),
    [specResults],
  );

  const handleToggleRole = useCallback((role: SpecGenerationRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((item) => item !== role)
        : [...prev, role],
    );
  }, []);

  const handleOpenRoleSelect = useCallback(() => {
    setSpecError(null);
    setIsRoleSelectOpen(true);
  }, []);

  const handleCloseRoleSelect = useCallback(() => {
    if (isGeneratingSpecs) {
      return;
    }
    setIsRoleSelectOpen(false);
  }, [isGeneratingSpecs]);

  const handleSubmitSpecs = useCallback(async () => {
    if (!selectedRoles.length) {
      return;
    }
    if (!meetingId) {
      setSpecError("meeting_id 無效，請先生成 Prototype 後再試一次。");
      return;
    }

    setIsGeneratingSpecs(true);
    setSpecError(null);
    try {
      const result = await generateMeetingSpecs(meetingId, {
        roles: selectedRoles,
      });
      setSpecResults(result.response ?? []);
      setPreferredSpecRole(result.response?.[0]?.role ?? null);
      setSpecViewerSeed((prev) => prev + 1);
      setSelectedRoles([]);
      setIsRoleSelectOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Spec 生成失敗";
      setSpecError(message);
    } finally {
      setIsGeneratingSpecs(false);
    }
  }, [meetingId, selectedRoles]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="glass-panel flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl"
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            Prototype Preview
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleOpenRoleSelect}
              className="py-1.5 text-xs"
            >
              生成 Spec
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="py-1.5 text-xs"
            >
              關閉
            </Button>
          </div>
        </header>

        <div className="relative flex-1 bg-slate-950/80 p-5">
          <div className="flex h-full flex-col gap-3">
            {iframeSrc ? (
              <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-white/10 bg-white">
                <iframe
                  title="Prototype HTML Preview"
                  src={iframeSrc}
                  className="h-full w-full"
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
            ) : (
              <div className="grid h-full place-items-center rounded-2xl border border-white/10 bg-slate-900/60 p-6 text-center">
                <p className="text-sm text-slate-300">
                  {isLoading
                    ? "Prototype 生成中，請稍候..."
                    : "尚未取得 Prototype 頁面，請先重新生成。"}
                </p>
              </div>
            )}

            {specResults.length > 0 && (
              <div className="h-[42vh] min-h-80">
                <SpecViewer
                  key={specViewerSeed}
                  specs={specMap}
                  initialRole={preferredSpecRole ?? "pm"}
                />
              </div>
            )}

            {specError && !isRoleSelectOpen && (
              <p className="text-xs text-rose-300">{specError}</p>
            )}
          </div>

          {isGeneratingSpecs && (
            <div className="absolute inset-0 z-10 grid place-items-center bg-slate-950/75 backdrop-blur-[1px]">
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-6 py-5">
                <span className="h-9 w-9 animate-spin rounded-full border-2 border-slate-500 border-t-emerald-400" />
                <p className="text-sm text-slate-200">Spec 生成中，請稍候...</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
      <RoleSelectModal
        open={isRoleSelectOpen}
        selectedRoles={selectedRoles}
        isSubmitting={isGeneratingSpecs}
        errorMessage={specError}
        onToggleRole={handleToggleRole}
        onClose={handleCloseRoleSelect}
        onSubmit={() => void handleSubmitSpecs()}
      />
    </div>
  );
}
