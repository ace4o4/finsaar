"use client";

import { useEffect } from "react";

export default function BackgroundWakeup() {
  useEffect(() => {
    // Only run this in the browser environment
    if (typeof window === "undefined") return;

    const handleLoad = () => {
      // requestIdleCallback ensures we only execute this when the main thread is completely idle
      const idleCallback = window.requestIdleCallback || ((cb) => setTimeout(cb, 3000));
      
      idleCallback(() => {
        // Ping our wakeup endpoint to warm up the Supabase instance peacefully
        fetch("/api/wakeup")
          .then((res) => res.json())
          .catch((err) => console.error("Wakeup ping failed:", err));
      });
    };

    if (document.readyState === "complete") {
      // If the window is already fully loaded, we can wait a moment and then fire
      setTimeout(handleLoad, 1000);
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);

  return null; // This is a logic-only component
}
