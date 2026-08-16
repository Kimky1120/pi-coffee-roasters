import type { Metadata } from "next";
import { PolicyPage, type PolicySection } from "@/components/legal/PolicyPage";

export const metadata: Metadata = {
  title: "이용약관",
  robots: { index: false, follow: false },
};

const SECTIONS: PolicySection[] = [
  {
    title: "1. 약관의 목적",
    paragraphs: [
      "이 약관은 파이커피로스터스가 운영하는 홈페이지에서 제공하는 회원 및 온라인 주문 관련 서비스의 이용 조건과 절차를 정하는 것을 목적으로 합니다.",
    ],
  },
  {
    title: "2. 회원가입과 계정 관리",
    items: [
      "이용자는 이메일 또는 제공되는 간편 로그인 방식으로 회원가입할 수 있습니다.",
      "회원은 가입 정보가 정확하도록 관리하고, 계정과 비밀번호를 다른 사람에게 공유하지 않아야 합니다.",
      "허위 정보 입력, 타인 정보 도용 또는 서비스 운영을 방해하는 이용은 제한될 수 있습니다.",
    ],
  },
  {
    title: "3. 서비스 제공",
    paragraphs: [
      "회사는 원두 및 매장 정보, 회원 정보 관리, 장바구니와 온라인 주문 서비스를 제공합니다. 온라인 주문과 결제는 준비가 완료된 기능부터 순차적으로 제공됩니다.",
    ],
  },
  {
    title: "4. 주문·결제·배송",
    items: [
      "상품 가격, 배송비, 무료배송 기준은 주문 화면에 표시된 내용을 따릅니다.",
      "주문은 결제가 정상 승인된 때 성립하며, 품절이나 가격 오류 등 부득이한 사유가 있으면 고객에게 안내 후 취소 또는 환불할 수 있습니다.",
      "배송 일정과 교환·반품 조건은 주문 시 고지되는 정책을 따릅니다.",
    ],
  },
  {
    title: "5. 청약철회와 환불",
    paragraphs: [
      "교환·반품·환불은 관련 법령과 주문 시 안내된 정책에 따라 처리합니다. 식품의 특성상 개봉 또는 소비로 상품 가치가 현저히 감소한 경우에는 청약철회가 제한될 수 있습니다.",
    ],
  },
  {
    title: "6. 회원 탈퇴",
    paragraphs: [
      "회원은 마이페이지에서 탈퇴를 요청할 수 있습니다. 관계 법령에 따라 보관해야 하는 거래 기록을 제외한 회원 정보는 탈퇴 처리 후 삭제됩니다.",
    ],
  },
  {
    title: "7. 책임과 분쟁 해결",
    paragraphs: [
      "회사는 안정적인 서비스 제공을 위해 노력하며, 분쟁이 발생하면 상호 협의를 우선합니다. 해결되지 않는 사항은 대한민국 관련 법령과 관할 법원의 절차를 따릅니다.",
    ],
  },
  {
    title: "8. 문의",
    paragraphs: [
      "이용약관 관련 문의: picoffeeroasters@naver.com · 010-8822-9428",
    ],
  },
];

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="TERMS OF SERVICE"
      title="이용약관"
      effectiveDate="2026. 08. 16."
      intro="파이커피로스터스 회원 서비스를 이용하기 전에 아래 내용을 확인해 주세요."
      sections={SECTIONS}
    />
  );
}
