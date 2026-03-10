"use client";

import { useState } from "react";
import { SongIdentifier } from "./song-identifier";
import { GuitarTuner } from "./guitar-tuner";

type AudioTab = "identifier" | "tuner";

export function AudioView() {
  const [activeTab, setActiveTab] = useState<AudioTab>("identifier");

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reconnaissance Audio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Identifie des morceaux ou accorde ta guitare
        </p>
      </div>

      {/* Tab switcher */}
      <div className="mb-6 flex gap-6 border-b border-border">
        <button
          onClick={() => setActiveTab("identifier")}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
            activeTab === "identifier"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">mic</span>
          Identifier
        </button>
        <button
          onClick={() => setActiveTab("tuner")}
          className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
            activeTab === "tuner"
              ? "border-accent-teal text-accent-teal"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">tune</span>
          Accordeur
        </button>
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-border bg-card">
        {activeTab === "identifier" ? <SongIdentifier /> : <GuitarTuner />}
      </div>
    </div>
  );
}
