export type ContactChannelKey =
  | "address"
  | "phone"
  | "email"
  | "instagramUrl"
  | "naverMapUrl"
  | "googleMapUrl";

export interface ContactChannel {
  key: ContactChannelKey;
  label: string;
}

export type ContactInfo = Record<ContactChannelKey, string>;
