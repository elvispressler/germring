import {
  getFundingLinkCheckItems as getSharedFundingLinkCheckItems,
  type FundingLinkCheckItem,
} from "@workspace/foerderlink-sources";

export type { FundingLinkCheckItem } from "@workspace/foerderlink-sources";

export type FundingLinkKind = "Antrag" | "Erklärung" | "Beratung" | "Weiterer Schritt";

export type FundingLink = {
  kind: FundingLinkKind;
  label: string;
  note: string;
  href: string;
};

export type FundingProgram = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  audience: string;
  benefit: string;
  status: string;
  amount?: string;
  accent: string;
  steps: string[];
  links: FundingLink[];
};

export const foerderungenStand = {
  checkedAt: "2026-09-19",
  checkedLabel: "19. September 2026",
  methodology:
    "Priorität haben Primärquellen von Bund, Land, Landkreis, Stadt und neutralen Beratungsstellen. Beträge und Bedingungen bitte vor dem Antrag noch einmal im Original prüfen.",
};

export const foerderungen: FundingProgram[] = [
  {
    id: "heizung",
    eyebrow: "Für Eigentümer:innen",
    title: "Heizung tauschen",
    summary:
      "Für den Einbau einer klimafreundlichen Heizung in einem bestehenden Wohngebäude ist die KfW die zentrale erste Anlaufstelle.",
    audience: "Du besitzt ein bestehendes Wohngebäude und planst Wärmepumpe, Solarthermie, Biomasse oder einen Wärmenetzanschluss.",
    benefit: "Zuschuss von 30 bis 80 % der förderfähigen Kosten möglich",
    status: "Bundesprogramm · KfW 458",
    amount: "30–80 %",
    accent: "#047857",
    steps: [
      "Vorhaben und Heizungstyp klären – idealerweise mit einer unabhängigen Energieberatung.",
      "KfW-Vorab-Check und Antrag über das Kundenportal starten.",
      "Erst nach Förderzusage bzw. zulässigem Vorhabenbeginn den Auftrag auslösen.",
    ],
    links: [
      {
        kind: "Antrag",
        label: "KfW 458: Vorab-Check und Antrag",
        note: "Offizielle Produktseite für die Heizungsförderung",
        href: "https://www.kfw.de/458",
      },
      {
        kind: "Erklärung",
        label: "Förderprogramme der Verbraucherzentrale",
        note: "Neutrale Einordnung von Heizung, Sanierung und Förderlogik",
        href: "https://www.verbraucherzentrale.bayern/wissen/energie/foerderprogramme",
      },
      {
        kind: "Beratung",
        label: "Wärmepumpen-Angebot prüfen lassen",
        note: "Kostenfreie Prüfung von bis zu drei Angeboten bei der Verbraucherzentrale Bayern",
        href: "https://www.verbraucherzentrale.bayern/energie/waermepumpen-wir-checken-ihre-angebote-106706",
      },
      {
        kind: "Beratung",
        label: "Energieberatung im Landkreis FFB",
        note: "Klima- und Energieagentur KLIMA³ und Verbraucherzentrale",
        href: "https://klimahochdrei.bayern/buergerinnen",
      },
    ],
  },
  {
    id: "beratung",
    eyebrow: "Bevor du Geld ausgibst",
    title: "Energieberatung fördern lassen",
    summary:
      "Ein unabhängiger Blick auf Gebäude, Heizung und Sanierung kann teure Fehlentscheidungen verhindern. Für Wohngebäude gibt es dafür ein eigenes BAFA-Programm.",
    audience: "Du willst sanieren, eine Heizung planen oder erst belastbar herausfinden, welche Maßnahme zu deinem Gebäude passt.",
    benefit: "BAFA-Förderung für eine Energieberatung für Wohngebäude",
    status: "Bundesprogramm · BAFA",
    accent: "#b45309",
    steps: [
      "Energieeffizienz-Expert:in auswählen und Beratungsumfang klären.",
      "Förderantrag vor Beginn der Beratung über das BAFA-Portal stellen.",
      "Bericht und Empfehlungen als Grundlage für Angebote und weitere Anträge nutzen.",
    ],
    links: [
      {
        kind: "Antrag",
        label: "BAFA: Energieberatung für Wohngebäude",
        note: "Voraussetzungen und Online-Antrag",
        href: "https://www.bafa.de/DE/Energie/Energieberatung/Energieberatung_Wohngebaeude/energieberatung_wohngebaeude_node.html",
      },
      {
        kind: "Beratung",
        label: "Kostenlose Energieberatung vor Ort",
        note: "Anlaufstelle der Stadt Fürstenfeldbruck mit KLIMA³ und Verbraucherzentrale",
        href: "https://www.fuerstenfeldbruck.de/ffb/web.nsf/id/8E12187E538C6933C1258D8C00441CE4",
      },
      {
        kind: "Erklärung",
        label: "Energieberatung der Verbraucherzentrale Bayern",
        note: "Kostenfrei per Telefon, Video und in Beratungsstellen; ein Hausbesuch kostet 40 €.",
        href: "https://www.verbraucherzentrale.bayern/beratungsangebote/energieberatung-der-verbraucherzentrale-77976",
      },
      {
        kind: "Erklärung",
        label: "Landkreis-Ratgeber Sanieren, Energie, Klimaschutz",
        note: "Lokale Orientierung als PDF vom Landratsamt FFB",
        href: "https://www.lra-ffb.de/fileadmin/user_upload/lra-ffb/pdf/2/21/Energieratgeber_Landkreis_Fuerstenfeldbruck.pdf",
      },
    ],
  },
  {
    id: "photovoltaik",
    eyebrow: "Für Strom vom eigenen Dach",
    title: "Photovoltaik & Speicher",
    summary:
      "Für PV-Anlage, Speicher und erneuerbare Wärme gibt es neben steuerlichen Regeln vor allem Finanzierungshilfen. Die passende Kombination hängt von Eigentum, Größe und Vorhaben ab.",
    audience: "Du planst eine Dach- oder Fassaden-PV, einen Batteriespeicher oder willst die Finanzierung eines Projekts klären.",
    benefit: "KfW-Kredit 270 für Investitionen in erneuerbare Energien",
    status: "Finanzierung · KfW 270",
    accent: "#0369a1",
    steps: [
      "Dach, Verbrauch und Anlagengröße realistisch prüfen – nicht nur den maximalen Ertrag.",
      "Mehrere Angebote vergleichen und klären, welche Kosten finanziert werden sollen.",
      "KfW-Finanzierung vor Vorhabenbeginn über die Hausbank anfragen.",
    ],
    links: [
      {
        kind: "Antrag",
        label: "KfW 270: Erneuerbare Energien",
        note: "Kredit für PV, Speicher und weitere erneuerbare Anlagen",
        href: "https://www.kfw.de/270",
      },
      {
        kind: "Erklärung",
        label: "Verbraucherzentrale: Förderprogramme",
        note: "Einordnung von Kredit, Zuschuss, Steuer und Einspeisung",
        href: "https://www.verbraucherzentrale.bayern/wissen/energie/foerderprogramme",
      },
      {
        kind: "Weiterer Schritt",
        label: "PV-Potenzial für dein Dach berechnen",
        note: "Lokaler Rechner auf germring.de",
        href: "/pv-rechner",
      },
      {
        kind: "Weiterer Schritt",
        label: "Anlage im Marktstammdatenregister anmelden",
        note: "Offizielle Registrierung bei der Bundesnetzagentur",
        href: "https://www.marktstammdatenregister.de/MaStR",
      },
    ],
  },
  {
    id: "balkon",
    eyebrow: "Auch für Mieter:innen",
    title: "Balkonkraftwerk starten",
    summary:
      "Bei Mini-PV zählen weniger Förderversprechen als ein sauberer Check von Mietvertrag, Anschluss, Technik und Registrierung.",
    audience: "Du wohnst zur Miete oder im Eigentum und willst mit einer kleinen steckerfertigen Solaranlage selbst Strom erzeugen.",
    benefit: "Schneller Einstieg ohne eigenes Dach",
    status: "Praxis-Check · keine pauschale Landesförderung behaupten",
    accent: "#7c3aed",
    steps: [
      "Montageort, Befestigung und Zustimmungserfordernisse klären.",
      "Auf sichere, normgerechte Technik und einen geeigneten Anschluss achten.",
      "Nach der Inbetriebnahme die Anlage im Marktstammdatenregister anmelden.",
    ],
    links: [
      {
        kind: "Erklärung",
        label: "Verbraucherzentrale: Förderprogramme",
        note: "Aktuelle Einordnung rund um Mini-PV und Eigenverbrauch",
        href: "https://www.verbraucherzentrale.bayern/wissen/energie/foerderprogramme",
      },
      {
        kind: "Beratung",
        label: "Kostenlose Energieberatung im Landkreis",
        note: "Fragen zu Technik, Verbrauch und Umsetzung besprechen",
        href: "https://klimahochdrei.bayern/buergerinnen",
      },
      {
        kind: "Weiterer Schritt",
        label: "Marktstammdatenregister",
        note: "Offizielle Anmeldung der Anlage",
        href: "https://www.marktstammdatenregister.de/MaStR",
      },
      {
        kind: "Weiterer Schritt",
        label: "Online-Vorträge der Verbraucherzentrale",
        note: "Aktuelle Termine zu Energie, Heizung und Photovoltaik",
        href: "https://www.verbraucherzentrale.bayern/energie/veranstaltungen",
      },
    ],
  },
];

/**
 * Produces the complete, stable source list for the editorial link check.
 * Internal links are resolved against the current artifact URL; external
 * links remain unchanged so the API can check both kinds of source.
 */
export function getFundingLinkCheckItems(
  origin: string,
  basePath = "/",
): FundingLinkCheckItem[] {
  return getSharedFundingLinkCheckItems(origin, basePath);
}
