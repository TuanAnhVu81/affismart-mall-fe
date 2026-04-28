import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const siteName = "AffiSmart Mall";
const defaultDescription =
  "AffiSmart Mall connects curated ecommerce products with affiliate-powered growth, secure checkout, and smart recommendations.";
const defaultImage = "/logo.png";

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  image?: string | null;
  noIndex?: boolean;
}

export const metadataBase = new URL(siteUrl);

export const buildPageMetadata = ({
  title,
  description,
  path = "/",
  image,
  noIndex = false,
}: PageMetadataOptions): Metadata => {
  const resolvedTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  const resolvedImage = image || defaultImage;

  return {
    title: resolvedTitle,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: path,
      siteName,
      type: "website",
      images: [
        {
          url: resolvedImage,
          alt: `${siteName} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [resolvedImage],
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : undefined,
  };
};

export const rootMetadata: Metadata = {
  metadataBase,
  applicationName: siteName,
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: defaultDescription,
  icons: {
    icon: "/favicon.ico",
    apple: defaultImage,
  },
  openGraph: {
    title: siteName,
    description: defaultDescription,
    url: "/",
    siteName,
    type: "website",
    images: [
      {
        url: defaultImage,
        alt: `${siteName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: defaultDescription,
    images: [defaultImage],
  },
};
