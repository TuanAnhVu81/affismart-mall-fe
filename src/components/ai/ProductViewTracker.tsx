"use client";

import { useEffect, useRef } from "react";
import { trackEventInBackground } from "@/services/ai.service";

interface ProductViewTrackerProps {
  productId: number;
}

export function ProductViewTracker({ productId }: ProductViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (!productId || hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;
    trackEventInBackground("VIEW", productId);
  }, [productId]);

  return null;
}
