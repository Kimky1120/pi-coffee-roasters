export type WholesaleBenefitIcon = "quality" | "supply" | "custom" | "support";

export interface WholesaleBenefit {
  icon: WholesaleBenefitIcon;
  title: string;
  description: string;
}

export interface WholesaleInfoItem {
  label: string;
  value: string;
}
