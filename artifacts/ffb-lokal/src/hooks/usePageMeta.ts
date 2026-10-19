import { useEffect } from "react";

const SITE_NAME = "germring.de";
const BASE_URL = "https://germring.de";
const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph.jpg`;
const DEFAULT_DESCRIPTION =
  "Faktenbasiertes Lokalmedium für Erneuerbare Energien, Kommunalpolitik und die Zukunft des Landkreises Fürstenfeldbruck. Fakten vor Meinung, ohne Parolen.";
const DEFAULT_TITLE = `${SITE_NAME} | FFB Energie & Zukunft`;

function absoluteSiteUrl(value: string | undefined) {
  try {
    const url = new URL(value || DEFAULT_OG_IMAGE, BASE_URL);
    return url.protocol === "https:" ? url.href : DEFAULT_OG_IMAGE;
  } catch {
    return DEFAULT_OG_IMAGE;
  }
}

function setMeta(attr: string, val: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${val}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, val);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function removeMeta(attr: string, val: string) {
  document.querySelector(`meta[${attr}="${val}"]`)?.remove();
}

function setJsonLd(id: string, data: object) {
  let el = document.querySelector(`script[data-seo-id="${id}"]`) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.setAttribute("data-seo-id", id);
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd(id: string) {
  document.querySelector(`script[data-seo-id="${id}"]`)?.remove();
}

export interface PageMeta {
  title: string;
  description?: string;
  path?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  article?: {
    publishedAt: string;
    author: string;
    section?: string;
  };
  jsonLd?: object;
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const normalizedTitle = meta.title.replace(/\s+[—–-]\s+germring\.de$/i, "").trim();
    const fullTitle =
      normalizedTitle.toLowerCase() === SITE_NAME
        ? DEFAULT_TITLE
        : `${normalizedTitle} | ${SITE_NAME}`;

    document.title = fullTitle;
    setMeta("property", "og:title", fullTitle);
    setMeta("name", "twitter:title", fullTitle);

    const desc = meta.description ?? DEFAULT_DESCRIPTION;
    setMeta("name", "description", desc);
    setMeta("property", "og:description", desc);
    setMeta("name", "twitter:description", desc);

    const requestedPath = meta.path ?? window.location.pathname;
    const canonicalUrl = new URL(requestedPath, BASE_URL).href;
    setLink("canonical", canonicalUrl);
    setMeta("property", "og:url", canonicalUrl);

    setMeta("property", "og:type", meta.ogType ?? "website");
    const imageUrl = absoluteSiteUrl(meta.ogImage);
    setMeta("property", "og:image", imageUrl);
    setMeta("property", "og:image:alt", fullTitle);
    setMeta("name", "twitter:image", imageUrl);
    setMeta("property", "og:locale", "de_DE");
    setMeta("property", "og:site_name", SITE_NAME);
    setMeta("name", "robots", "index, follow");

    if (meta.article) {
      setMeta("property", "article:published_time", meta.article.publishedAt);
      setMeta("property", "article:author", meta.article.author);
      if (meta.article.section) setMeta("property", "article:section", meta.article.section);
      else removeMeta("property", "article:section");
    } else {
      removeMeta("property", "article:published_time");
      removeMeta("property", "article:author");
      removeMeta("property", "article:section");
    }

    if (meta.jsonLd) {
      setJsonLd("page", meta.jsonLd);
    } else {
      removeJsonLd("page");
    }

    return () => {
      document.title = DEFAULT_TITLE;
      setMeta("name", "description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:title", DEFAULT_TITLE);
      setMeta("property", "og:description", DEFAULT_DESCRIPTION);
      setMeta("property", "og:type", "website");
      setMeta("name", "twitter:title", DEFAULT_TITLE);
      setMeta("name", "twitter:description", DEFAULT_DESCRIPTION);
      setMeta("name", "twitter:image", DEFAULT_OG_IMAGE);
      setMeta("property", "og:image", DEFAULT_OG_IMAGE);
      setMeta("property", "og:image:alt", DEFAULT_TITLE);
      setMeta("property", "og:locale", "de_DE");
      setMeta("property", "og:site_name", SITE_NAME);
      setMeta("name", "robots", "index, follow");
      const currentPath = new URL(window.location.pathname, BASE_URL).href;
      setLink("canonical", currentPath);
      setMeta("property", "og:url", currentPath);
      removeMeta("property", "article:published_time");
      removeMeta("property", "article:author");
      removeMeta("property", "article:section");
      removeJsonLd("page");
    };
  }, [
    meta.title,
    meta.description,
    meta.path,
    meta.ogImage,
    meta.ogType,
    meta.article,
    meta.jsonLd,
  ]);
}
