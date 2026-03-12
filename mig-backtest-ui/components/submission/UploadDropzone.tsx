"use client";

import { useState, useRef, useCallback } from "react";
import Button from "@/components/ui/Button";

type DropzoneState = "idle" | "dragging" | "uploading" | "success" | "error";

interface UploadDropzoneProps {
  maxSizeMB?: number;
}

export default function UploadDropzone({ maxSizeMB = 1 }: UploadDropzoneProps) {
  const [state, setState] = useState<DropzoneState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!file.name.endsWith(".py")) return "Only .py Python files are accepted.";
    if (file.size > maxSizeMB * 1024 * 1024) return `File must be under ${maxSizeMB}MB.`;
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setErrorMsg(err);
        setState("error");
        return;
      }
      if (!name.trim() || !school.trim()) {
        setErrorMsg("Please fill in your name and school before uploading.");
        setState("error");
        return;
      }

      setFileName(file.name);
      setState("uploading");
      setProgress(0);

      // Simulate upload progress
      let p = 0;
      const interval = setInterval(() => {
        p += Math.random() * 20;
        if (p >= 100) {
          p = 100;
          clearInterval(interval);
          setTimeout(() => {
            setState("success");
            setProgress(100);
          }, 300);
        }
        setProgress(Math.min(p, 100));
      }, 150);
    },
    [name, school, maxSizeMB]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setState("idle");
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setState("idle");
    setProgress(0);
    setFileName("");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const zoneClasses: Record<DropzoneState, string> = {
    idle:      "border-slate-700 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50",
    dragging:  "border-sky-500 bg-sky-500/5 scale-[1.01]",
    uploading: "border-slate-700 bg-slate-900/30",
    success:   "border-emerald-500/50 bg-emerald-500/5",
    error:     "border-rose-500/50 bg-rose-500/5",
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Name + school */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-slate-400 font-medium mb-1.5">Your Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            disabled={state === "uploading" || state === "success"}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 font-medium mb-1.5">School</label>
          <input
            type="text"
            value={school}
            onChange={e => setSchool(e.target.value)}
            placeholder="University name"
            disabled={state === "uploading" || state === "success"}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-50"
          />
        </div>
      </div>

      {/* Dropzone */}
      <div
        onDragEnter={() => state === "idle" && setState("dragging")}
        onDragLeave={() => state === "dragging" && setState("idle")}
        onDragOver={e => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => state === "idle" && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${zoneClasses[state]} ${state === "idle" ? "cursor-pointer" : "cursor-default"}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".py"
          className="hidden"
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
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
            <p className="text-sky-300 font-medium">Release to upload</p>
          </>
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
                <span className="font-mono truncate max-w-[180px]">{fileName}</span>
                <span className="font-mono">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800">
                <div
                  className="h-1.5 rounded-full bg-emerald-500 transition-all duration-150"
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
            <p className="text-slate-500 text-sm font-mono">{fileName}</p>
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
    </div>
  );
}
