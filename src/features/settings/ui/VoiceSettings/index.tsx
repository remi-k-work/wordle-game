"use client";

// next
import dynamic from "next/dynamic";

export const VoiceSettings = dynamic(() => import("./VoiceSettings"), { ssr: false });
