"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type DropzoneState = "idle" | "dragging" | "ready" | "uploading" | "success" | "error";

interface UploadDropzoneProps {
  userId: string;
  teamId: string;
  maxSizeMB?: number;
}

export default function UploadDropzone({ userId, teamId, maxSizeMB = 1 }: UploadDropzoneProps) {
  const router = useRouter();
  const [state, setState] = useState<DropzoneState>("idle");
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith(".py")) return "Only .py Python files are accepted.";
    if (file.size > maxSizeMB * 1024 * 1024) return `File must be under ${maxSizeMB}MB.`;
    return null;
  };

  const pickFile = (file: File) => {
    const err = validateFile(file);
    if (err) {
      setErrorMsg(err);
      setState("error");
      return;
    }
    setSelectedFile(file);
    setState("ready");
  };

  const submit = async () => {
    if (!selectedFile) return;

    setState("uploading");
    setProgress(30);

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("team_id", teamId);
    formData.append("file", selectedFile);

    try {
      setProgress(60);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/submissions/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.detail ?? `Server error (${res.status})`);
      }

      setProgress(100);
      setState("success");
      router.refresh();
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Upload failed.");
      setState("error");
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) pickFile(file);
    else setState("idle");
  };

  const reset = () => {
    setState("idle");
    setProgress(0);
    setSelectedFile(null);
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const isDroppable = state === "idle" || state === "dragging";

  const zoneClasses: Record<DropzoneState, string> = {
    idle:      "border-slate-700 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50",
    dragging:  "border-sky-500 bg-sky-500/5 scale-[1.01]",
    ready:     "border-emerald-500/30 bg-emerald-500/5",
    uploading: "border-slate-700 bg-slate-900/30",
    success:   "border-emerald-500/50 bg-emerald-500/5",
    error:     "border-rose-500/50 bg-rose-500/5",
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        onDragEnter={() => isDroppable && setState("dragging")}
        onDragLeave={() => state === "dragging" && setState("idle")}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => isDroppable && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${zoneClasses[state]} ${isDroppable ? "cursor-pointer" : "cursor-default"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".py"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) pickFile(file);
          }}
        />

        {state === "idle" && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <p className="text-slate-300 font-medium mb-1">Drop your strategy file here</p>
            <p className="text-slate-600 text-sm mb-3">or click to browse</p>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-500 font-mono">
              .py only · max {maxSizeMB}MB
            </span>
          </>
        )}

        {state === "dragging" && (
          <>
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-sky-300 font-medium">Release to select</p>
          </>
        )}

        {state === "ready" && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-300 font-medium font-mono text-sm">{selectedFile?.name}</p>
            <p className="text-slate-600 text-xs">
              {((selectedFile?.size ?? 0) / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="text-xs text-slate-600 hover:text-slate-400 underline transition-colors cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}

        {state === "uploading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div className="w-full max-w-xs">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-mono truncate max-w-45">{selectedFile?.name}</span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <p className="text-slate-500 text-sm">Uploading and validating...</p>
          </div>
        )}

        {state === "success" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-emerald-400 font-semibold">Submission received!</p>
            <p className="text-slate-500 text-sm font-mono">{selectedFile?.name}</p>
            <p className="text-slate-600 text-xs">Backtesting in progress — results in ~2 min</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="mt-1 text-xs text-slate-500 hover:text-slate-300 underline transition-colors cursor-pointer"
            >
              Submit another
            </button>
          </div>
        )}

        {state === "error" && (
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-rose-400 font-semibold">Upload failed</p>
            <p className="text-slate-500 text-sm">{errorMsg}</p>
            <button
              onClick={(e) => { e.stopPropagation(); reset(); }}
              className="mt-1 text-xs text-slate-500 hover:text-slate-300 underline transition-colors cursor-pointer"
            >
              Try again
            </button>
          </div>
        )}
      </div>

      {/* Submit button — only shown when a file is ready */}
      {state === "ready" && (
        <button
          onClick={submit}
          className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-semibold text-sm hover:bg-emerald-400 active:scale-[0.98] transition-all duration-150"
        >
          Submit Strategy
        </button>
      )}
    </div>
  );
}
