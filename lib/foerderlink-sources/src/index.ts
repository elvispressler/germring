export type FundingLinkCheckItem = {
  sourceId: string;
  programId: string;
  programTitle: string;
  label: string;
  href: string;
  url: string;
};

type FundingLinkSource = Omit<FundingLinkCheckItem, "sourceId" | "url">;

const fundingLinkSources: Array<
  FundingLinkSource & { programId: string; href: string }
> = [
  {
    programId: "heizung",
    programTitle: "Heizung tauschen",
    label: "KfW 458: Vorab-Check und Antrag",
    href: "https://www.kfw.de/458",
  },
  {
    programId: "heizung",
    programTitle: "Heizung tauschen",
    label: "Förderprogramme der Verbraucherzentrale",
    href: "https://www.verbraucherzentrale.bayern/wissen/energie/foerderprogramme",
  },
  {
    programId: "heizung",
    programTitle: "Heizung tauschen",
    label: "Wärmepumpen-Angebot prüfen lassen",
    href: "https://www.verbraucherzentrale.bayern/energie/waermepumpen-wir-checken-ihre-angebote-106706",
  },
  {
    programId: "heizung",
    programTitle: "Heizung tauschen",
    label: "Energieberatung im Landkreis FFB",
    href: "https://klimahochdrei.bayern/buergerinnen",
  },
  {
    programId: "beratung",
    programTitle: "Energieberatung fördern lassen",
    label: "BAFA: Energieberatung für Wohngebäude",
    href: "https://www.bafa.de/DE/Energie/Energieberatung/Energieberatung_Wohngebaeude/energieberatung_wohngebaeude_node.html",
  },
  {
    programId: "beratung",
    programTitle: "Energieberatung fördern lassen",
    label: "Kostenlose Energieberatung vor Ort",
    href: "https://www.fuerstenfeldbruck.de/ffb/web.nsf/id/8E12187E538C6933C1258D8C00441CE4",
  },
  {
    programId: "beratung",
    programTitle: "Energieberatung fördern lassen",
    label: "Energieberatung der Verbraucherzentrale Bayern",
    href: "https://www.verbraucherzentrale.bayern/beratungsangebote/energieberatung-der-verbraucherzentrale-77976",
  },
  {
    programId: "beratung",
    programTitle: "Energieberatung fördern lassen",
    label: "Landkreis-Ratgeber Sanieren, Energie, Klimaschutz",
    href: "https://www.lra-ffb.de/fileadmin/user_upload/lra-ffb/pdf/2/21/Energieratgeber_Landkreis_Fuerstenfeldbruck.pdf",
  },
  {
    programId: "photovoltaik",
    programTitle: "Photovoltaik & Speicher",
    label: "KfW 270: Erneuerbare Energien",
    href: "https://www.kfw.de/270",
  },
  {
    programId: "photovoltaik",
    programTitle: "Photovoltaik & Speicher",
    label: "Verbraucherzentrale: Förderprogramme",
    href: "https://www.verbraucherzentrale.bayern/wissen/energie/foerderprogramme",
  },
  {
    programId: "photovoltaik",
    programTitle: "Photovoltaik & Speicher",
    label: "PV-Potenzial für dein Dach berechnen",
    href: "/pv-rechner",
  },
  {
    programId: "photovoltaik",
    programTitle: "Photovoltaik & Speicher",
    label: "Anlage im Marktstammdatenregister anmelden",
    href: "https://www.marktstammdatenregister.de/MaStR",
  },
  {
    programId: "balkon",
    programTitle: "Balkonkraftwerk starten",
    label: "Verbraucherzentrale: Förderprogramme",
    href: "https://www.verbraucherzentrale.bayern/wissen/energie/foerderprogramme",
  },
  {
    programId: "balkon",
    programTitle: "Balkonkraftwerk starten",
    label: "Kostenlose Energieberatung im Landkreis",
    href: "https://klimahochdrei.bayern/buergerinnen",
  },
  {
    programId: "balkon",
    programTitle: "Balkonkraftwerk starten",
    label: "Marktstammdatenregister",
    href: "https://www.marktstammdatenregister.de/MaStR",
  },
  {
    programId: "balkon",
    programTitle: "Balkonkraftwerk starten",
    label: "Online-Vorträge der Verbraucherzentrale",
    href: "https://www.verbraucherzentrale.bayern/energie/veranstaltungen",
  },
];

/**
 * The frontend and the server scheduler use this single source of truth.
 * Relative links are resolved against the public site URL for server checks.
 */
export function getFundingLinkCheckItems(
  origin: string,
  basePath = "/",
): FundingLinkCheckItem[] {
  const normalizedOrigin = origin.replace(/\/+$/, "");
  const normalizedBase = `${basePath.replace(/\/+$/, "")}/`;

  return fundingLinkSources.map((source) => ({
    ...source,
    sourceId: `${source.programId}:${source.label}`,
    url: source.href.startsWith("/")
      ? new URL(
          `${normalizedBase}${source.href.replace(/^\/+/, "")}`,
          normalizedOrigin,
        ).toString()
      : source.href,
  }));
}