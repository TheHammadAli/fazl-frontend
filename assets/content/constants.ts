const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
/** Deployed frontend URL (used for WhatsApp/share links). */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

/** Legal docs served from files in `assets/content`. */
const PRIVACY_POLICY_URL = "/api/legal/privacy-policy";
const TERMS_AND_CONDITIONS_URL = "/api/legal/terms-and-conditions";

const SUPPORT_WHATSAPP_PHONE = "923263577712";
const SUPPORT_WHATSAPP_MESSAGE =
  "Hi, I need help with the Fazl app. Could you please assist me?";

function getSupportWhatsAppUrl() {
  return `https://api.whatsapp.com/send?phone=${SUPPORT_WHATSAPP_PHONE}&text=${encodeURIComponent(SUPPORT_WHATSAPP_MESSAGE)}`;
}

export {
  BASE_URL,
  APP_URL,
  PRIVACY_POLICY_URL,
  TERMS_AND_CONDITIONS_URL,
  SUPPORT_WHATSAPP_PHONE,
  getSupportWhatsAppUrl,
};
