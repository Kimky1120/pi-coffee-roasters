"use client";

import { useEffect } from "react";

function scrollHomeToTop() {
  if (window.location.hash) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

export function HomeScrollReset() {
  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";

    scrollHomeToTop();
    const frameId = window.requestAnimationFrame(scrollHomeToTop);

    // Chrome can restore a previous scroll position when returning from a
    // search result through the back-forward cache. Reset it on that entry too.
    window.addEventListener("pageshow", scrollHomeToTop);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pageshow", scrollHomeToTop);
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return null;
}
