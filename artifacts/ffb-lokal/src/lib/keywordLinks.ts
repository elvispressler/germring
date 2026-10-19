export interface KeywordLink {
  label: string;
  url: string;
  title: string;
  external: boolean;
}

export const KEYWORD_LINKS: Record<string, KeywordLink> = {
  "BEG": {
    label: "BEG",
    url: "https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/Bundesfoerderung_Effiziente_Gebaeude/bundesfoerderung_effiziente_gebaeude_node.html",
    title: "Bundesförderung für effiziente Gebäude (BAFA)",
    external: true,
  },
  "Bundesförderung für effiziente Gebäude": {
    label: "Bundesförderung für effiziente Gebäude",
    url: "https://www.bafa.de/DE/Energie/Effiziente_Gebaeude/Bundesfoerderung_Effiziente_Gebaeude/bundesfoerderung_effiziente_gebaeude_node.html",
    title: "Bundesförderung für effiziente Gebäude (BAFA)",
    external: true,
  },
  "KfW": {
    label: "KfW",
    url: "https://www.kfw.de/inlandsfoerderung/Privatpersonen/Bestandsimmobilien/F%C3%B6rderprodukte/Bundesf%C3%B6rderung-f%C3%BCr-effiziente-Geb%C3%A4ude-Einzelma%C3%9Fnahmen-(458)/",
    title: "KfW-Förderung für energetische Sanierung",
    external: true,
  },
  "BAFA": {
    label: "BAFA",
    url: "https://www.bafa.de/",
    title: "Bundesamt für Wirtschaft und Ausfuhrkontrolle",
    external: true,
  },
  "Wärmepumpe": {
    label: "Wärmepumpe",
    url: "https://www.verbraucherzentrale.de/wissen/energie/heizen-und-warmwasser/waermepumpe-alles-was-sie-wissen-muessen-5439",
    title: "Wärmepumpe: Alles, was Sie wissen müssen (Verbraucherzentrale)",
    external: true,
  },
  "Wärmepumpen": {
    label: "Wärmepumpen",
    url: "https://www.verbraucherzentrale.de/wissen/energie/heizen-und-warmwasser/waermepumpe-alles-was-sie-wissen-muessen-5439",
    title: "Wärmepumpe: Alles, was Sie wissen müssen (Verbraucherzentrale)",
    external: true,
  },
  "Geothermie": {
    label: "Geothermie",
    url: "https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/geothermie",
    title: "Geothermie — Wärme aus der Erde (Umweltbundesamt)",
    external: true,
  },
  "Tiefengeothermie": {
    label: "Tiefengeothermie",
    url: "https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/geothermie#tiefengeothermie",
    title: "Tiefengeothermie (Umweltbundesamt)",
    external: true,
  },
  "Fernwärme": {
    label: "Fernwärme",
    url: "https://www.verbraucherzentrale.de/wissen/energie/heizen-und-warmwasser/fernwaerme-so-funktioniert-das-netz-15406",
    title: "Fernwärme: So funktioniert das Netz (Verbraucherzentrale)",
    external: true,
  },
  "kommunale Wärmeplanung": {
    label: "kommunale Wärmeplanung",
    url: "https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadt-wohnen/stadtentwicklung/kommunale-waermeplanung/kommunale-waermeplanung-node.html",
    title: "Kommunale Wärmeplanung (BMWSB)",
    external: true,
  },
  "Wärmeplanung": {
    label: "Wärmeplanung",
    url: "https://www.bmwsb.bund.de/Webs/BMWSB/DE/themen/stadt-wohnen/stadtentwicklung/kommunale-waermeplanung/kommunale-waermeplanung-node.html",
    title: "Kommunale Wärmeplanung (BMWSB)",
    external: true,
  },
  "Photovoltaik": {
    label: "Photovoltaik",
    url: "https://www.verbraucherzentrale.de/wissen/energie/strom-erzeugen-und-speichern/photovoltaik-das-sollten-sie-wissen-8214",
    title: "Photovoltaik: Erzeugung von Solarstrom (Verbraucherzentrale)",
    external: true,
  },
  "Balkonkraftwerk": {
    label: "Balkonkraftwerk",
    url: "https://www.verbraucherzentrale.de/wissen/energie/strom-erzeugen-und-speichern/balkonkraftwerke-steckersolar-was-sie-wissen-muessen-71209",
    title: "Balkonkraftwerk / Stecker-Solar (Verbraucherzentrale)",
    external: true,
  },
  "Balkonkraftwerke": {
    label: "Balkonkraftwerke",
    url: "https://www.verbraucherzentrale.de/wissen/energie/strom-erzeugen-und-speichern/balkonkraftwerke-steckersolar-was-sie-wissen-muessen-71209",
    title: "Balkonkraftwerke / Stecker-Solar (Verbraucherzentrale)",
    external: true,
  },
  "Agri-PV": {
    label: "Agri-PV",
    url: "https://www.ise.fraunhofer.de/de/forschungsprojekte/agri-pv.html",
    title: "Agri-Photovoltaik: Solarstrom und Landwirtschaft (Fraunhofer ISE)",
    external: true,
  },
  "Netzentgelte": {
    label: "Netzentgelte",
    url: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/Verbraucher/Netzentgelte/start.html",
    title: "Netzentgelte — Bundesnetzagentur",
    external: true,
  },
  "Einspeisevergütung": {
    label: "Einspeisevergütung",
    url: "https://www.bundesnetzagentur.de/DE/Fachthemen/ElektrizitaetundGas/ErneuerbareEnergien/Einspeiseverguetung/start.html",
    title: "Einspeisevergütung (Bundesnetzagentur)",
    external: true,
  },
  "EEG": {
    label: "EEG",
    url: "https://www.erneuerbare-energien.de/EE/Navigation/DE/Recht-Politik/Das_EEG/das_eeg.html",
    title: "Erneuerbare-Energien-Gesetz (EEG)",
    external: true,
  },
  "ÖPNV": {
    label: "ÖPNV",
    url: "https://www.mvv-muenchen.de/",
    title: "MVV — Öffentlicher Nahverkehr in der Region München / FFB",
    external: true,
  },
  "Emobilitätsprämie": {
    label: "Emobilitätsprämie",
    url: "https://www.bafa.de/DE/Energie/Verkehr/Elektromobilitaet/elektromobilitaet_node.html",
    title: "Elektromobilität — Förderung (BAFA)",
    external: true,
  },
  "CO₂-Bilanz": {
    label: "CO₂-Bilanz",
    url: "https://www.umweltbundesamt.de/daten/klima/treibhausgasemissionen-in-deutschland",
    title: "Treibhausgas-Emissionen in Deutschland (Umweltbundesamt)",
    external: true,
  },
  "Klimaschutzgesetz": {
    label: "Klimaschutzgesetz",
    url: "https://www.bmuv.de/themen/klimaschutz-anpassung/klimaschutz/nationale-klimapolitik/bundes-klimaschutzgesetz",
    title: "Bundes-Klimaschutzgesetz (BMUV)",
    external: true,
  },
  "Energiegemeinschaft": {
    label: "Energiegemeinschaft",
    url: "https://www.erneuerbare-energien.de/EE/Navigation/DE/Technologien/Buergerenergie/buergerenergie.html",
    title: "Bürgerenergiegemeinschaften — Erneuerbare Energien",
    external: true,
  },
  "Energiegemeinschaften": {
    label: "Energiegemeinschaften",
    url: "https://www.erneuerbare-energien.de/EE/Navigation/DE/Technologien/Buergerenergie/buergerenergie.html",
    title: "Bürgerenergiegemeinschaften — Erneuerbare Energien",
    external: true,
  },
};

export interface GlossarySource {
  label: string;
  detail: string;
  url: string;
}

export interface GlossaryTerm {
  label: string;
  definition: string;
  sources: GlossarySource[];
}

export const GLOSSARY_TERMS: Record<string, GlossaryTerm> = {
  energiewende: {
    label: "Energiewende",
    definition:
      "Als Energiewende wird der Umbau der Energieversorgung weg von fossilen Brennstoffen und Kernenergie hin zu erneuerbaren Energien, höherer Energieeffizienz und geringerem Energieverbrauch bezeichnet. Sie betrifft insbesondere Strom, Wärme, Gebäude, Industrie und Verkehr.",
    sources: [
      {
        label: "Bundeswirtschaftsministerium",
        detail: "Dossier zur deutschen Energiewende",
        url: "https://www.bundeswirtschaftsministerium.de/Redaktion/DE/Dossier/energiewende.html",
      },
      {
        label: "Bundeszentrale für politische Bildung",
        detail: "Kurze Begriffsdefinition",
        url: "https://www.bpb.de/kurz-knapp/lexika/lexikon-der-wirtschaft/159947/energiewende",
      },
      {
        label: "Umweltbundesamt",
        detail: "Daten und Beiträge zur Energiewende",
        url: "https://www.umweltbundesamt.de/tags/energiewende",
      },
    ],
  },
  soleLuftkreislaufe: {
    label: "Sole- oder Luftkreisläufe",
    definition:
      "Bei Wärmepumpen beschreibt die Wärmequelle, wo die Umweltwärme aufgenommen wird: Ein Solekreislauf nutzt meist das Erdreich oder Grundwasser, ein Luftkreislauf die Außenluft. Die Wärmepumpe hebt diese Wärme anschließend auf ein für Heizung und Warmwasser nutzbares Temperaturniveau.",
    sources: [
      {
        label: "Verbraucherzentrale",
        detail: "Arten und Funktionsweise von Wärmepumpen",
        url: "https://www.verbraucherzentrale.de/wissen/energie/heizen-und-warmwasser/welche-arten-von-waermepumpen-gibt-es-und-wie-funktionieren-sie-114625",
      },
      {
        label: "Umweltbundesamt",
        detail: "Umgebungswärme und Wärmepumpen",
        url: "https://www.umweltbundesamt.de/themen/klima-energie/erneuerbare-energien/umgebungswaerme-waermepumpen",
      },
      {
        label: "Energiewechsel / BMWE",
        detail: "Antworten auf häufige Fragen zur Wärmepumpe",
        url: "https://www.energiewechsel.de/KAENEF/Redaktion/DE/FAQ/Waermepumpe/faq-waermepumpe.html",
      },
    ],
  },
  energieberatungFfb: {
    label: "Energieberatungsstellen im Landkreis FFB",
    definition:
      "Energieberatungsstellen unterstützen Bürgerinnen und Bürger bei Fragen zu Sanierung, Heizung, Energieverbrauch, erneuerbaren Energien und Fördermöglichkeiten. Im Landkreis Fürstenfeldbruck arbeiten dafür unter anderem die Energieagentur und die Verbraucherzentrale Bayern zusammen.",
    sources: [
      {
        label: "Landratsamt Fürstenfeldbruck",
        detail: "Gemeinsame Energieberatung im Landkreis",
        url: "https://www.lra-ffb.de/aktuelles/aktuelles/klima-und-energieagentur-und-verbraucherzentrale-bayern-bieten-gemeinsam-energieberatung-an",
      },
      {
        label: "Verbraucherzentrale Energieberatung",
        detail: "Beratungsstellen und Terminvereinbarung",
        url: "https://verbraucherzentrale-energieberatung.de/beratung/beratungsstellen",
      },
      {
        label: "Landratsamt Fürstenfeldbruck",
        detail: "Klimaschutz und Energiesparen im Alltag",
        url: "https://www.lra-ffb.de/bau-umwelt/klimaschutz/klimaschutz-im-alltag",
      },
    ],
  },
  windenergieerlass: {
    label: "bayerischen Windenergieerlasses",
    definition:
      "Der bayerische Windenergieerlass bündelt wichtige Hinweise für die Planung und Genehmigung von Windenergieanlagen. Er ordnet unter anderem bau-, immissionsschutz- und naturschutzrechtliche Fragen ein; verbindlich sind dabei die jeweils geltenden Gesetze und Verordnungen.",
    sources: [
      {
        label: "Bayerisches Wirtschaftsministerium",
        detail: "Windenergie in Bayern",
        url: "https://www.stmwi.bayern.de/energie/erneuerbare-energien/windenergie",
      },
      {
        label: "Bayerisches Bauministerium",
        detail: "Verfahrenshandbuch Erneuerbare Energien",
        url: "https://www.stmb.bayern.de/assets/stmi/buw/baurechtundtechnik/24_bay_verfahrenshandbuch_erneuerbare_energien.pdf",
      },
      {
        label: "Bayerisches Wirtschaftsministerium",
        detail: "Erneuerbare Energien und rechtliche Rahmenbedingungen",
        url: "https://www.stmwi.bayern.de/energie/erneuerbare-energien",
      },
    ],
  },
  zehnHRegelung: {
    label: "10-H-Regelung",
    definition:
      "Die 10-H-Regelung bezeichnet die bayerische Abstandsregel für bestimmte Windenergieanlagen: Als Grundsatz wird ein Abstand zur Wohnbebauung vom Zehnfachen der Anlagenhöhe verlangt. Art. 82 der Bayerischen Bauordnung enthält dazu Ausnahmen und weitere Voraussetzungen; die konkrete Rechtslage hängt deshalb vom Standort und der jeweiligen Gebietskulisse ab.",
    sources: [
      {
        label: "Bayerische Bauordnung",
        detail: "Art. 82 BayBO: Windenergie",
        url: "https://www.gesetze-bayern.de/Content/Document/BayBO-82",
      },
      {
        label: "Bayerische Bauordnung",
        detail: "Art. 82a BayBO: feste Abstandsvorschriften",
        url: "https://www.gesetze-bayern.de/Content/Document/BayBO-82a",
      },
      {
        label: "Bayerisches Bauministerium",
        detail: "Verfahrenshandbuch Erneuerbare Energien",
        url: "https://www.stmb.bayern.de/assets/stmi/buw/baurechtundtechnik/24_bay_verfahrenshandbuch_erneuerbare_energien.pdf",
      },
    ],
  },
  temperaturkoeffizienten: {
    label: "Temperaturkoeffizienten",
    definition:
      "Temperaturkoeffizienten beschreiben, wie sich die Leistung eines Photovoltaikmoduls mit seiner Zelltemperatur verändert. Bei den üblichen kristallinen Modulen sinkt die elektrische Leistung bei steigender Temperatur; der Koeffizient hilft dabei, den realen Ertrag unter warmen Betriebsbedingungen einzuschätzen.",
    sources: [
      {
        label: "Fraunhofer ISE",
        detail: "Technische Untersuchung von PV-Modulen",
        url: "https://www.ise.fraunhofer.de/content/dam/ise/de/documents/publications/conference-paper/36-eupvsec-2019/Mittag_4CO24.pdf",
      },
      {
        label: "PVsyst",
        detail: "Technische Dokumentation zu PV-Temperaturkoeffizienten",
        url: "https://www.pvsyst.com/help-pvsyst7/pvmodule_tempcoefficients.htm",
      },
      {
        label: "Priwatt",
        detail: "Verständliche Einführung in den Temperaturkoeffizienten",
        url: "https://priwatt.de/blog/temperaturkoeffizient-einfach-erklaert",
      },
    ],
  },
};

const GLOSSARY_MATCHES: Record<string, string> = {
  Energiewende: "energiewende",
  "Sole- oder Luftkreisläufe": "soleLuftkreislaufe",
  Solekreisläufe: "soleLuftkreislaufe",
  Luftkreisläufe: "soleLuftkreislaufe",
  "Energieberatungsstellen im Landkreis FFB": "energieberatungFfb",
  "bayerischen Windenergieerlasses": "windenergieerlass",
  "bayerischer Windenergieerlass": "windenergieerlass",
  "10-H-Regelung": "zehnHRegelung",
  Temperaturkoeffizienten: "temperaturkoeffizienten",
  Temperaturkoeffizient: "temperaturkoeffizienten",
};

const GLOSSARY_ORDER = Object.keys(GLOSSARY_MATCHES).sort((a, b) => b.length - a.length);
const KEYWORD_ORDER = Object.keys(KEYWORD_LINKS).sort((a, b) => b.length - a.length);

export function linkifyContent(html: string): string {
  const linked = new Set<string>();
  const linkedGlossary = new Set<string>();

  let result = html;

  for (const phrase of GLOSSARY_ORDER) {
    const glossaryKey = GLOSSARY_MATCHES[phrase];
    if (linkedGlossary.has(glossaryKey)) continue;

    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<![\\w>"])${escaped}(?![\\w<"])`, "");
    if (!regex.test(result)) continue;

    const label = GLOSSARY_TERMS[glossaryKey].label;
    result = result.replace(
      regex,
      `<button type="button" data-glossary-term="${glossaryKey}" class="glossary-term" aria-label="${label} erklären">${phrase}</button>`,
    );
    linkedGlossary.add(glossaryKey);
  }

  for (const keyword of KEYWORD_ORDER) {
    if (linked.has(keyword)) continue;

    const info = KEYWORD_LINKS[keyword];
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<![\\w>"])${escaped}(?![\\w<"])`, "");

    if (!regex.test(result)) continue;

    const rel = info.external ? ' rel="noopener noreferrer"' : "";
    const target = info.external ? ' target="_blank"' : "";
    const link = `<a href="${info.url}"${target}${rel} title="${info.title}" class="keyword-link">${info.label}</a>`;

    result = result.replace(regex, link);
    linked.add(keyword);
  }

  return result;
}
