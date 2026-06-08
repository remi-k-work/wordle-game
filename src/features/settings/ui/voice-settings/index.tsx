"use client";

// next
import dynamic from "next/dynamic";

export const VoiceSettings = dynamic(() => import("./voice-settings"), { ssr: false });
