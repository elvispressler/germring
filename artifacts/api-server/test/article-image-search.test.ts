import assert from "node:assert/strict";
import test from "node:test";
import {
  buildArticleImageSearchQuery,
  selectReviewedCommonsImages,
} from "../src/lib/article-image-search.ts";

const commonsImage = (overrides: Record<string, unknown> = {}) => ({
  title: "File:Solar panels in Bavaria.jpg",
  imageinfo: [{
    url: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Solar_panels_in_Bavaria.jpg",
    thumburl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Solar_panels_in_Bavaria.jpg/1000px-Solar_panels_in_Bavaria.jpg",
    descriptionurl: "https://commons.wikimedia.org/wiki/File:Solar_panels_in_Bavaria.jpg",
    extmetadata: {
      LicenseShortName: { value: "CC0 1.0" },
      ...(overrides.extmetadata as Record<string, unknown> | undefined),
    },
  }],
  categories: [],
  ...overrides,
});

const commonsImageWithFilename = (filename: string, previewFilename = filename) => commonsImage({
  title: `File:${filename}`,
  imageinfo: [{
    url: `https://upload.wikimedia.org/wikipedia/commons/a/a1/${filename}`,
    thumburl: `https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/${filename}/1000px-${previewFilename}`,
    descriptionurl: `https://commons.wikimedia.org/wiki/File:${filename}`,
    extmetadata: {
      LicenseShortName: { value: "CC0 1.0" },
    },
  }],
});

test("builds a topical Commons query with explicit people-focused exclusions", () => {
  const query = buildArticleImageSearchQuery({
    title: "Neue Solaranlage am Bürgerhaus",
    excerpt: "Die Anlage versorgt das Gebäude künftig mit Strom.",
    categoryId: 1,
  });
  assert.match(query, /photovoltaic rooftop/);
  assert.doesNotMatch(query, /public domain/);
  assert.match(query, /-children/);
});

test("takes the visual subject from the headline, not the category", () => {
  assert.match(buildArticleImageSearchQuery({
    title: "Windkraft im Landkreis",
    excerpt: "Solarstrom ist ebenfalls wichtig.",
    categoryId: 1,
  }), /wind turbine/);
  assert.match(buildArticleImageSearchQuery({
    title: "Wärmepumpen im Altbau",
    excerpt: "Aktuelle Zahlen zur Heizung",
    categoryId: 3,
  }), /heat pump/);
  assert.match(buildArticleImageSearchQuery({
    title: "Heizungsförderung für Wärmepumpen",
    excerpt: "",
    categoryId: 2,
  }), /heat pump/);
  assert.doesNotMatch(buildArticleImageSearchQuery({
    title: "Solarstrom für private Haushalte",
    excerpt: "",
    categoryId: 2,
  }), /town hall|Rathaus/);
  assert.doesNotMatch(buildArticleImageSearchQuery({
    title: "Unbekanntes Spezialthema",
    excerpt: "",
    categoryId: 1,
  }), /solar|photovoltaic/);
});

test("rejects off-topic photos and ranks headline-related candidates first", () => {
  const selected = selectReviewedCommonsImages({
    query: { pages: [
      commonsImageWithFilename("Solar_panels.jpg"),
      commonsImageWithFilename("Town_hall.jpg"),
      commonsImageWithFilename("Wind_turbine_Bavaria.jpg"),
    ] },
  }, [], {
    title: "Windkraft im Landkreis FFB",
    excerpt: "Windräder liefern Strom.",
    categoryId: 1,
  });
  assert.deepEqual(selected.map(candidate => candidate.title), ["Wind_turbine_Bavaria.jpg"]);
});

test("returns only unused Commons images with CC0, public-domain, or attribution licenses", () => {
  const eligible = commonsImage();
  const publicDomain = commonsImage({
    title: "File:Wind turbines in Bavaria.jpg",
    imageinfo: [{
      url: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Wind_turbines_in_Bavaria.jpg",
      thumburl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Wind_turbines_in_Bavaria.jpg/1000px-Wind_turbines_in_Bavaria.jpg",
      descriptionurl: "https://commons.wikimedia.org/wiki/File:Wind_turbines_in_Bavaria.jpg",
      extmetadata: {
        LicenseShortName: { value: "Public domain" },
        Artist: { value: "<a href=\"https://example.com/artist\">Example Artist</a>" },
        Credit: { value: "Community archive" },
      },
    }],
  });
  const copyrighted = commonsImage({
    title: "File:Hydropower station.jpg",
    imageinfo: [{
      url: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Hydropower_station.jpg",
      thumburl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c3/Hydropower_station.jpg/1000px-Hydropower_station.jpg",
      descriptionurl: "https://commons.wikimedia.org/wiki/File:Hydropower_station.jpg",
      extmetadata: { LicenseShortName: { value: "All rights reserved" } },
    }],
  });
  const attributionLicensed = commonsImage({
    title: "File:District heating pipes.jpg",
    imageinfo: [{
      url: "https://upload.wikimedia.org/wikipedia/commons/d/d1/District_heating_pipes.jpg",
      thumburl: "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/District_heating_pipes.jpg/1000px-District_heating_pipes.jpg",
      descriptionurl: "https://commons.wikimedia.org/wiki/File:District_heating_pipes.jpg",
      extmetadata: {
        LicenseShortName: { value: "CC BY-SA 4.0" },
        Artist: { value: "Example Artist" },
      },
    }],
  });

  const selected = selectReviewedCommonsImages({
    query: { pages: [eligible, publicDomain, attributionLicensed, copyrighted] },
  }, ["https://upload.wikimedia.org/wikipedia/commons/a/a1/Solar_panels_in_Bavaria.jpg"]);

  assert.deepEqual(selected.map(candidate => candidate.title), ["Wind turbines in Bavaria.jpg", "District heating pipes.jpg"]);
  assert.equal(selected[0]?.sourceUrl, "https://commons.wikimedia.org/wiki/File:Wind_turbines_in_Bavaria.jpg");
  assert.equal(selected[0]?.license, "Public domain");
  assert.equal(selected[0]?.credit, "Example Artist · Community archive");
  assert.equal(selected[1]?.license, "CC BY-SA 4.0");
  assert.equal(selected[1]?.credit, "Example Artist");
});

test("keeps eligible Commons images when credit metadata is missing", () => {
  const selected = selectReviewedCommonsImages({
    query: { pages: [commonsImage()] },
  });

  assert.equal(selected.length, 1);
  assert.equal(selected[0]?.license, "CC0 1.0");
  assert.equal(selected[0]?.credit, "");
});

test("accepts only raster formats supported by article photo storage", () => {
  const supportedImages = ["jpg", "jpeg", "png", "webp", "gif", "avif"]
    .map(extension => commonsImageWithFilename(`Solar_panels.${extension}`));
  const svgWithRasterPreview = commonsImageWithFilename("Energy_chart.svg", "Energy_chart.svg.png");
  const pdfWithRasterPreview = commonsImageWithFilename("Energy_report.pdf", "Energy_report.pdf.jpg");

  const selected = selectReviewedCommonsImages({
    query: { pages: [...supportedImages, svgWithRasterPreview, pdfWithRasterPreview] },
  });

  assert.deepEqual(
    selected.map(candidate => candidate.title),
    ["Solar_panels.jpg", "Solar_panels.jpeg", "Solar_panels.png", "Solar_panels.webp", "Solar_panels.gif", "Solar_panels.avif"],
  );
  assert.deepEqual(
    selectReviewedCommonsImages({ query: { pages: [svgWithRasterPreview, pdfWithRasterPreview] } }),
    [],
  );
});

test("rejects people-focused imagery and non-Wikimedia image hosts", () => {
  const groupPhoto = commonsImage({
    categories: [{ title: "Category:School children in a classroom" }],
  });
  const remoteHost = commonsImage({
    title: "File:Wind farm.jpg",
    imageinfo: [{
      url: "https://example.com/wind-farm.jpg",
      thumburl: "https://example.com/wind-farm-thumb.jpg",
      descriptionurl: "https://commons.wikimedia.org/wiki/File:Wind_farm.jpg",
      extmetadata: { LicenseShortName: { value: "CC0 1.0" } },
    }],
  });

  assert.deepEqual(
    selectReviewedCommonsImages({ query: { pages: [groupPhoto, remoteHost] } }),
    [],
  );
});

test("treats transformed Wikimedia thumbnail URLs as the original photo", () => {
  const image = commonsImage();
  const candidates = selectReviewedCommonsImages({
    query: { pages: [image] },
  }, ["https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Solar_panels_in_Bavaria.jpg/640px-Solar_panels_in_Bavaria.jpg"]);

  assert.deepEqual(candidates, []);
});