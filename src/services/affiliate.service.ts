import axios from "axios";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

const affiliateClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const trackAffiliateClick = (refCode: string) =>
  affiliateClient.post<ApiResponse<unknown>>("/affiliate/track-click", {
    ref_code: refCode,
  });

