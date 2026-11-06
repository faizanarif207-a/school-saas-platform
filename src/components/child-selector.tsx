// src/components/child-selector.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Users } from "lucide-react";

export type ChildOption = {
  id: string;
  name: string;
  class: string;
  rollNo: number | null;
  admissionId: string | null;
};

export function ChildSelector({
  children,
  selectedId,
  onSelect,
}: {
  children: ChildOption[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selected = children.find(c => c.id === selectedId);

  if (children.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative inline-block"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center text-white text-sm font-bold">
          {selected?.name.charAt(0) || "?"}
        </div>
        <div className="text-left">
          <div className="text-sm font-semibold">{selected?.name || "Select Child"}</div>
          <div className="text-xs text-muted-foreground">{selected?.class}</div>
        </div>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full left-0 mt-2 w-72 rounded-xl border bg-card shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Switch Child ({children.length})
              </div>
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => { onSelect(child.id); setOpen(false); }}
                  className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                    child.id === selectedId
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                    child.id === selectedId
                      ? "bg-primary text-primary-foreground"
                      : "bg-gradient-to-br from-pink-500/20 to-pink-700/20 text-pink-600"
                  }`}>
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{child.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {child.class} · Roll #{child.rollNo || "—"}
                    </div>
                    {child.admissionId && (
                      <div className="text-xs font-mono text-primary">{child.admissionId}</div>
                    )}
                  </div>
                  {child.id === selectedId && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
