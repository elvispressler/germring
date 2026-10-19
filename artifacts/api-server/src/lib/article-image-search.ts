import { articleImageIdentity } from "./article-image-uniqueness.ts";

export type ArticleImageSearchCandidate = {
  title: string;
  imageUrl: string;
  previewUrl: string;
  sourceUrl: string;
  license: string;
  credit: string;
};

type CommonsImageInfo = {
  url?: unknown;
  thumburl?: unknown;
  descriptionurl?: unknown;
  extmetadata?: Record<string, { value?: unknown } | undefined>;
};

type CommonsPage = {
  title?: unknown;
  imageinfo?: CommonsImageInfo[];
  categories?: Array<{ title?: unknown }>;
};

type CommonsSearchResponse = {
  query?: {
    pages?: CommonsPage[];
  };
};

type ImageSearchInput = { title: string; excerpt: string; categoryId: number };
type VisualTopic = { match: RegExp; queries: [string, string]; metadata: RegExp; generic?: boolean };

// Visual subjects come from the story, never from its broad editorial category.
const VISUAL_TOPICS: VisualTopic[] = [
  { match: /windkraft|windenergie|windrad|windrader|windpark|wind turbine/, queries: ["wind turbine Germany", "Windkraftanlage Bayern"], metadata: /wind.?turbine|wind.?farm|windkraft|windrad|windpark/ },
  { match: /warmepump|heat pump/, queries: ["heat pump residential", "Warmepumpe Heizung"], metadata: /heat.?pump|warmepump/ },
  { match: /biogas|biomasse/, queries: ["biogas plant Germany", "Biogasanlage"], metadata: /biogas|biomass|biomasse/ },
  { match: /batterie|speicher|battery/, queries: ["home battery energy storage", "Batteriespeicher"], metadata: /batter|energy.?storage|stromspeicher|energiespeicher|accumulator/ },
  { match: /solartherm|solarkollektor/, queries: ["solar thermal collector rooftop", "Solarthermie Kollektor"], metadata: /solar.?thermal|solar.?collector|solartherm|solarkollektor/ },
  { match: /photovolta|solar|pv-anlage|pv anlage/, queries: ["photovoltaic rooftop Germany", "Solaranlage Hausdach"], metadata: /photovolta|solar.?panel|solar.?cell|solar.?power|solaranlage|solarmodul|solardach/ },
  { match: /fernwarme|nahwarme|warmenetz|warmeplanung|district heating/, queries: ["district heating pipes Germany", "Fernwarme Rohrleitung"], metadata: /district.?heating|fernwarm|nahwarm|warmenetz|heating.?pipe/ },
  { match: /dammung|sanierung|gebaudehulle|insulation/, queries: ["building thermal insulation", "Fassadendammung"], metadata: /insulat|dammung|dammsystem|fassadensanierung|thermal.?renovation/ },
  { match: /ladestation|ladesaule|elektroauto|elektromobil|mobilitatswende|electric car/, queries: ["electric vehicle charging station Germany", "Elektroauto Ladesaule"], metadata: /charg|electric.?vehicle|electric.?car|elektroauto|ladesaul|ladestation|electromobil/ },
  { match: /stromnetz|netzausbau|stromleitung/, queries: ["electric power grid Germany", "Stromnetz Umspannwerk"], metadata: /power.?grid|power.?line|transmission|substation|stromnetz|stromleitung|umspannwerk/ },
  { match: /strompreis|stromkosten|energiepreis|stromverbrauch|stromsparen|stromzahler|stromtarif|smart meter/, queries: ["electricity meter Germany", "Stromzahler Haushalt"], metadata: /electric.*meter|stromzahler|smart.?meter|energy.?meter|kilowatt.?hour/ },
  { match: /geotherm/, queries: ["geothermal heating plant Germany", "Geothermie Anlage"], metadata: /geotherm/ },
  { match: /hitzeschutz|hitze|kuhlung|sommer/, queries: ["external window shading building", "Sonnenschutz Gebaude"], metadata: /shad|sun.?protection|sonnenschutz|jalous|awning|markise/ },
  { match: /heizung|heizen|heizkorper|heizungs/, queries: ["radiator thermostatic valve", "Heizkorper Thermostat"], metadata: /radiator|thermostat|heizkorper|heizungs|heating.?system/, generic: true },
  { match: /haushaltsplan|kommunalhaushalt|stadtrat|gemeinderat|kommunal|rathaus/, queries: ["Rathaus Furstenfeldbruck", "town hall Bavaria"], metadata: /rathaus|town.?hall|city.?hall|gemeindehaus|municipal/, generic: true },
];
const EXCLUSIONS = "-portrait -people -person -child -children -baby -family -students";
const STOP_WORDS = new Set("aber alle auch auf aus bei das dem den der des die diese dieser durch eine einem einen einer eines fur haben im in ist kein mit nach neue neuen nicht noch oder sich sind und von vor was werden wie wird zum zur landkreis ffb furstenfeldbruck germering bayern deutschland".split(" "));

function normalizeTopic(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[_-]+/g, " ");
}

function visualTopic(input: ImageSearchInput): VisualTopic | undefined {
  for (const text of [input.title, input.excerpt]) {
    const normalized = normalizeTopic(text);
    const matches = VISUAL_TOPICS.map(topic => ({ topic, position: normalized.search(topic.match) }))
      .filter(match => match.position >= 0)
      .sort((a, b) => Number(Boolean(a.topic.generic)) - Number(Boolean(b.topic.generic)) || a.position - b.position);
    if (matches[0]) return matches[0].topic;
  }
  return undefined;
}

function headlineKeywords(input: ImageSearchInput): string[] {
  return [...new Set(normalizeTopic(input.title).match(/[a-z0-9]{4,}/g) ?? [])]
    .filter(word => !STOP_WORDS.has(word)).slice(0, 6);
}

function relevanceScore(page: CommonsPage, input: ImageSearchInput): number {
  const info = page.imageinfo?.[0];
  if (!info) return 0;
  const title = normalizeTopic(typeof page.title === "string" ? page.title : "");
  const details = normalizeTopic([
    metadataValue(info, "ObjectName"),
    metadataValue(info, "ImageDescription"),
    ...(page.categories ?? []).map(category => category.title ?? ""),
  ].join(" "));
  const topic = visualTopic(input);
  if (topic) return (topic.metadata.test(title) ? 4 : 0) + (topic.metadata.test(details) ? 1 : 0);
  return headlineKeywords(input).reduce((score, word) =>
    score + (title.includes(word) ? 4 : 0) + (details.includes(word) ? 1 : 0), 0);
}

const EXCLUDED_VISUAL_TERMS =
  /\b(?:portrait|people|person|children|child|baby|infant|school|kindergarten|classroom|family|team|group photo|crowd|woman|man|men|women|girl|boy|students?|politician|mayor|minister|protest|demonstration)\b/i;
const ALLOWED_LICENSE = /^(?:CC0(?:\s|$)|Public domain\b|CC BY(?:-SA)?(?:\s|$))/i;
const SUPPORTED_ARTICLE_PHOTO_EXTENSION = /\.(?:jpe?g|png|webp|gif|avif)$/i;
const MAX_CANDIDATES = 6;
const IMAGE_HOST = "upload.wikimedia.org";
const SOURCE_HOST = "commons.wikimedia.org";

function metadataValue(info: CommonsImageInfo, key: string): string {
  const value = info.extmetadata?.[key]?.value;
  return typeof value === "string" ? value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "";
}

function isAllowedHttpsUrl(value: unknown, hostnames: string | string[]): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    const allowedHostnames = Array.isArray(hostnames) ? hostnames : [hostnames];
    return url.protocol === "https:" && allowedHostnames.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function hasSupportedArticlePhotoExtension(value: string): boolean {
  try {
    return SUPPORTED_ARTICLE_PHOTO_EXTENSION.test(new URL(value).pathname);
  } catch {
    return false;
  }
}

function isEditoriallySuitableMetadata(page: CommonsPage, info: CommonsImageInfo): boolean {
  const metadataText = [
    page.title,
    metadataValue(info, "ObjectName"),
    metadataValue(info, "ImageDescription"),
    ...(page.categories ?? []).map(category => category.title),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
  return !EXCLUDED_VISUAL_TERMS.test(metadataText);
}

export function buildArticleImageSearchQuery(input: ImageSearchInput): string {
  const subject = visualTopic(input)?.queries[0] || headlineKeywords(input).join(" ") || input.title.slice(0, 100);
  return `${subject} ${EXCLUSIONS}`;
}

export function selectReviewedCommonsImages(
  response: CommonsSearchResponse,
  usedImageUrls: Iterable<string> = [],
  topicInput?: ImageSearchInput,
): ArticleImageSearchCandidate[] {
  const usedIdentities = new Set(
    Array.from(usedImageUrls, articleImageIdentity).filter((identity): identity is string => Boolean(identity)),
  );
  const seen = new Set<string>();
  const candidates: ArticleImageSearchCandidate[] = [];

  const pages = (response.query?.pages ?? [])
    .map(page => ({ page, score: topicInput ? relevanceScore(page, topicInput) : 1 }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(result => result.page);
  for (const page of pages) {
    const info = page.imageinfo?.[0];
    if (!info || !isEditoriallySuitableMetadata(page, info)) continue;

    const license = metadataValue(info, "LicenseShortName");
    if (!ALLOWED_LICENSE.test(license)) continue;

    if (
      !isAllowedHttpsUrl(info.url, IMAGE_HOST) ||
      !hasSupportedArticlePhotoExtension(info.url) ||
      !isAllowedHttpsUrl(info.thumburl, [IMAGE_HOST, "thumb.wikimedia.org"]) ||
      !isAllowedHttpsUrl(info.descriptionurl, SOURCE_HOST)
    ) {
      continue;
    }

    const identity = articleImageIdentity(info.url);
    if (!identity || usedIdentities.has(identity) || seen.has(identity)) continue;
    seen.add(identity);

    const title = typeof page.title === "string"
      ? page.title.replace(/^File:/i, "").trim()
      : "";
    if (!title) continue;
    const creditParts = [
      metadataValue(info, "Artist"),
      metadataValue(info, "Credit"),
    ].filter((value, index, values) => value.length > 0 && values.indexOf(value) === index);

    candidates.push({
      title,
      imageUrl: info.url,
      previewUrl: info.thumburl,
      sourceUrl: info.descriptionurl,
      license,
      credit: creditParts.join(" · "),
    });
    if (candidates.length >= MAX_CANDIDATES) break;
  }

  return candidates;
}

export async function searchReviewedCommonsImages(
  input: { title: string; excerpt: string; categoryId: number },
  usedImageUrls: Iterable<string>,
): Promise<ArticleImageSearchCandidate[]> {
  const topic = visualTopic(input);
  const queries = topic
    ? topic.queries.map(query => `${query} ${EXCLUSIONS}`)
    : [buildArticleImageSearchQuery(input)];
  const responses = await Promise.allSettled(queries.map(async queryText => {
    const url = new URL("https://commons.wikimedia.org/w/api.php");
    url.search = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: queryText,
      gsrnamespace: "6",
      gsrlimit: "40",
      prop: "imageinfo|categories",
      iiprop: "url|extmetadata",
      iiurlwidth: "1000",
      cllimit: "20",
      format: "json",
      formatversion: "2",
    }).toString();

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "germring.de article photo search (https://germring.de/)",
      },
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new Error(`Wikimedia image search returned HTTP ${response.status}`);

    const payload = await response.json() as CommonsSearchResponse;
    return payload.query?.pages ?? [];
  }));

  const successfulResponses = responses.filter(
    (result): result is PromiseFulfilledResult<CommonsPage[]> => result.status === "fulfilled",
  );
  if (successfulResponses.length === 0) {
    const failedResponse = responses.find(result => result.status === "rejected");
    throw failedResponse?.status === "rejected" ? failedResponse.reason : new Error("Wikimedia image search failed");
  }

  return selectReviewedCommonsImages(
    { query: { pages: successfulResponses.flatMap(result => result.value) } },
    usedImageUrls,
    input,
  );
}