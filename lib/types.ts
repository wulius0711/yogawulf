export interface YogaConfig {
  company: {
    name: string;
    tagline: string;
    logo: string;
    email: string;
    phone: string;
    website: string;
    address: string;
    primaryColor: string;
  };
  formTitle: string;
  formTitleFont?: string;
  formBgColor?: string;
  verpflegungOptions: string[];
  zimmerwunschOptions: string[];
  abrechnungOptions: string[];
  notifyEmail: string;
}

export interface BlockedDateEntry {
  id: string;
  startDate: string;
  endDate: string;
  label: string;
  type: "blocked" | "event";
  color: string;
}

export interface InquiryFormData {
  artTitel: string;
  nameGruppenleitung: string;
  datumVon: string;
  datumBis: string;
  email: string;
  zeitVon: string;
  zeitBis: string;
  personenAnzahl: string;
  leiterinnen: string;
  bestuhlung: boolean | null;
  tische: boolean | null;
  sonstigesEquipment: string;
  verpflegung: string;
  zimmerwunsch: string;
  wuenscheRahmenprogramm: string;
  abrechnung: string;
}
