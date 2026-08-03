import type { CheckoutCustomer } from "@/types/checkout";

export class InvalidCheckoutCustomerError extends Error {}

function readText(
  record: Record<string, unknown>,
  key: keyof CheckoutCustomer,
  label: string,
  maxLength: number,
) {
  const value = String(record[key] ?? "").trim();
  if (!value || value.length > maxLength) {
    throw new InvalidCheckoutCustomerError(`${label}을(를) 확인해 주세요.`);
  }
  return value;
}

function normalizePhone(value: string, label: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) {
    throw new InvalidCheckoutCustomerError(`${label}을(를) 확인해 주세요.`);
  }
  return digits;
}

export function normalizeCheckoutCustomer(
  value: unknown,
  allowDeliveryMemo: boolean,
): CheckoutCustomer {
  if (!value || typeof value !== "object") {
    throw new InvalidCheckoutCustomerError("주문자 정보를 확인해 주세요.");
  }

  const record = value as Record<string, unknown>;
  const ordererEmail = readText(
    record,
    "ordererEmail",
    "주문자 이메일",
    100,
  ).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ordererEmail)) {
    throw new InvalidCheckoutCustomerError("주문자 이메일을 확인해 주세요.");
  }

  const deliveryMemo = String(record.deliveryMemo ?? "").trim();
  const addressLine2 = String(record.addressLine2 ?? "").trim();
  if (deliveryMemo.length > 200) {
    throw new InvalidCheckoutCustomerError(
      "배송메모는 200자 이하로 입력해 주세요.",
    );
  }

  if (addressLine2.length > 200) {
    throw new InvalidCheckoutCustomerError("상세 주소를 확인해 주세요.");
  }

  return {
    ordererName: readText(record, "ordererName", "주문자명", 50),
    ordererEmail,
    ordererPhone: normalizePhone(
      readText(record, "ordererPhone", "주문자 연락처", 30),
      "주문자 연락처",
    ),
    recipientName: readText(record, "recipientName", "수령인명", 50),
    recipientPhone: normalizePhone(
      readText(record, "recipientPhone", "수령인 연락처", 30),
      "수령인 연락처",
    ),
    postalCode: readText(record, "postalCode", "우편번호", 20),
    addressLine1: readText(record, "addressLine1", "주소", 200),
    addressLine2,
    deliveryMemo: allowDeliveryMemo ? deliveryMemo : "",
  };
}
