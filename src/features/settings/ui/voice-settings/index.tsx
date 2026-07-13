"use client";

// next
import dynamic from "next/dynamic";

// components
import { VoiceSettingsSkeleton } from "./voice-settings";

export const VoiceSettings = dynamic(() => import("./voice-settings"), { ssr: false, loading: () => <VoiceSettingsSkeleton /> });
