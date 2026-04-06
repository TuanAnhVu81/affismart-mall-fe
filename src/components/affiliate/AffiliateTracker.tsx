"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackAffiliateClick } from "@/services/affiliate.service";

const REF_QUERY_KEY = "ref";
const REF_COOKIE_KEY = "ref_code";
const REF_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

const setRefCookie = (refCode: string) => {
  document.cookie = `${REF_COOKIE_KEY}=${encodeURIComponent(
    refCode,
  )}; path=/; max-age=${REF_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
};

const cleanRefQueryParam = (pathname: string, queryString: string) => {
  const nextSearchParams = new URLSearchParams(queryString);
  nextSearchParams.delete(REF_QUERY_KEY);

  const cleanedQuery = nextSearchParams.toString();
  const nextUrl = cleanedQuery ? `${pathname}?${cleanedQuery}` : pathname;
  window.history.replaceState(window.history.state, "", nextUrl);
};

export function AffiliateTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const trackingLockRef = useRef<string | null>(null);

  useEffect(() => {
    const resolvedSearchParams = new URLSearchParams(searchParamsString);
    const refCode = resolvedSearchParams.get(REF_QUERY_KEY)?.trim();

    if (!refCode) {
      return;
    }

    const trackingKey = `${pathname}?${searchParamsString}`;
    if (trackingLockRef.current === trackingKey) {
      return;
    }

    trackingLockRef.current = trackingKey;

    let isCancelled = false;

    const runTracking = async () => {
      try {
        const response = await trackAffiliateClick(refCode);
        if (isCancelled || response.status !== 200) {
          return;
        }

        setRefCookie(refCode);
        cleanRefQueryParam(pathname, searchParamsString);
      } catch {
        // Silent fail: tracking should never block storefront rendering.
      }
    };

    void runTracking();

    return () => {
      isCancelled = true;
    };
  }, [pathname, searchParamsString]);

  return null;
}

