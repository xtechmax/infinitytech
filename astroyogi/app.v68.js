'use strict';

/* Astro Yogi v68.0 — versioned international Palm report contract and guarded checkout. */
// Preserve the v16 storage namespace so existing sessions and paid-report history survive this asset upgrade.
const STORAGE_KEY = 'astro_vela_v16_session';
const PAID_HISTORY_KEY = 'astro_vela_v16_paid_history';
const CHARITY_GRANT_STORAGE_PREFIX = 'astro_vela_charity_grant_v1:';
const PAID_HISTORY_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PAID_HISTORY_LIMIT = 12;
const ADDITIONAL_REPORT_LINEAGE_KEY = 'astro_vela_additional_report_lineage_v1';
const ADDITIONAL_REPORT_PREFILL_KEY = 'astro_vela_additional_report_prefill_v1';
const ADDITIONAL_REPORT_PREFILL_TTL_MS = 10 * 60 * 1000;
const ADDITIONAL_REPORT_CONTINUATION_MAX_TTL_MS = 60 * 60 * 1000;
const CROSS_SELL_EVENT_QUEUE_KEY = 'astro_vela_cross_sell_event_queue_v1';
const CROSS_SELL_EVENT_QUEUE_LIMIT = 32;
const CROSS_SELL_EVENT_QUEUE_TTL_MS = 24 * 60 * 60 * 1000;
const CROSS_SELL_EVENT_RETRY_MAX_MS = 60 * 1000;
const CROSS_SELL_QA_HANDOFF_KEY = 'astro_vela_cross_sell_qa_handoff_v1';
const PALM_NEXT_READING_PRESENTATION_VERSION = 'palm_next_reading_presentation_v60';
const PALM_NEXT_READING_TIMED_OFFER_VERSION = 'palm_next_reading_offer_v3';
const PALM_NEXT_READING_EVERGREEN_OFFER_VERSION = 'palm_next_reading_offer_evergreen_v2';
const PALM_CROSS_SELL_TEASER_PREFIX_CAPABILITY = 'palm_cross_sell_teaser_prefix_v1';
const PALM_CROSS_SELL_TEASER_TIMED_CONTROL_VERSION =
  'palm_next_reading_offer_v3_teaser_start_free_v1';
const PALM_CROSS_SELL_TEASER_TIMED_TREATMENT_VERSION =
  'palm_next_reading_offer_v3_teaser_preview_before_payment_v1';
const PALM_CROSS_SELL_TEASER_EVERGREEN_CONTROL_VERSION =
  'palm_next_reading_offer_evergreen_v2_teaser_start_free_v1';
const PALM_CROSS_SELL_TEASER_EVERGREEN_TREATMENT_VERSION =
  'palm_next_reading_offer_evergreen_v2_teaser_preview_before_payment_v1';
const PALM_CROSS_SELL_TIMED_OFFER_VERSIONS = new Set([
  PALM_NEXT_READING_TIMED_OFFER_VERSION,
  PALM_CROSS_SELL_TEASER_TIMED_CONTROL_VERSION,
  PALM_CROSS_SELL_TEASER_TIMED_TREATMENT_VERSION
]);
const PALM_CROSS_SELL_EVERGREEN_OFFER_VERSIONS = new Set([
  PALM_NEXT_READING_EVERGREEN_OFFER_VERSION,
  PALM_CROSS_SELL_TEASER_EVERGREEN_CONTROL_VERSION,
  PALM_CROSS_SELL_TEASER_EVERGREEN_TREATMENT_VERSION
]);
const PALM_CROSS_SELL_TEASER_TREATMENT_OFFER_VERSIONS = new Set([
  PALM_CROSS_SELL_TEASER_TIMED_TREATMENT_VERSION,
  PALM_CROSS_SELL_TEASER_EVERGREEN_TREATMENT_VERSION
]);
const NEXT_READING_PAYWALL_CTA_MEASUREMENT_VERSION = 'next_reading_paywall_cta_v1';
const NEXT_READING_PAYWALL_BEHAVIOR_MEASUREMENT_VERSION = 'next_reading_paywall_behavior_v1';
const PALM_PAYWALL_CTA_MEASUREMENT_VERSION = 'palm_paywall_cta_v1';
const ADDITIONAL_REPORT_PAYWALL_TARGET_LANES = new Set([
  'partner_name',
  'best_city',
  'market_profile'
]);
const ADDITIONAL_REPORT_PAYWALL_SECTION_ORDER = Object.freeze([
  'personal_proof',
  'value_proposition',
  'top_checkout',
  'locked_answers',
  'purchase_summary',
  'deliverables'
]);
const ADDITIONAL_REPORT_PAYWALL_SECTION_IDS = new Set(
  ADDITIONAL_REPORT_PAYWALL_SECTION_ORDER
);
const ADDITIONAL_REPORT_PAYWALL_EXIT_REASONS = new Set([
  'checkout',
  'in_app_navigation',
  'home_navigation',
  'start_fresh',
  'hidden',
  'pagehide',
  'payment_verified',
  'screen_change',
  'paid_report',
  'next_reading_recommendation',
  'unknown'
]);
const FUNNEL_VERSION = 'streamlined_v2';
// Universal Palm landing release marker. Bump this for a future landing UX
// checkpoint; it is descriptive attribution, not a randomized experiment.
const PALM_LANDING_CHECKPOINT = 'palm_landing_ux_v3';
// Bump whenever the shared post-scan journey changes. This release marker lets
// retrospective reports isolate the form, continuity, dock, and paywall base
// experience independently of randomized paywall experiments.
const PALM_POST_SCAN_EXPERIENCE_VERSION = 'palm_post_scan_experience_v2';
const PALM_RESULT_CTA_VERSION = 'palm_result_cta_above_detail_v1';
const COPY_VERSION = 'palm_paywall_c_winner_v1';
const PALM_EG_COPY_VERSION = 'palm_paywall_eg_ranked_result_v3';
const PREVIOUS_PALM_EG_COPY_VERSION = 'palm_paywall_eg_dynamic_fate_proof_v2';
const LEGACY_PALM_EG_COPY_VERSION = 'palm_paywall_eg_lead_area_reveal_v1';
// G's trust-and-proof cohort. It renders the exact E page plus the reviewed
// trust block, strongest-area reveal and palm hero. No other historical G
// treatment applies to it.
const PALM_G_TRUST_PROOF_COPY_VERSION = 'palm_paywall_g_trust_proof_v4';
// v5 keeps v4's cohort thesis but reorders and rewrites it: the trust block now
// sits below the add-on, the locked sheet leads with a curiosity headline, the
// "name number" claim is gone so the paid add-on is not pre-empted, and a
// signpost above the top CTA points at the offer card. It is a distinct measured
// treatment, so it ships its own copy identity; v4 stays restorable and its
// exposures must never be pooled with v5.
const PALM_G_TRUST_PROOF_V5_COPY_VERSION = 'palm_paywall_g_trust_proof_v5';
const PALM_COPY_VERSION = 'palm_paywall_cef_curiosity_gap_v1';
const PREVIOUS_PALM_COPY_VERSION = 'palm_paywall_cde_complete_answers_v1';
const LEGACY_PALM_COPY_VERSION = 'palm_paywall_cd_future_timeline_v1';
const NAME_NUMEROLOGY_COPY_VERSION = 'name_mobile_curiosity_v7';
const FACE_COPY_VERSION = 'face_impact_first_palm_compatible_v8';
const MAHAKUNDLI_COPY_VERSION = 'mahakundli_personal_impact_v9';
// Conservative floor verified against 5,295 paid-reading records in the
// production datastore on 31 July 2026. Do not raise without a fresh audit.
const MAHAKUNDLI_VERIFIED_PAID_REPORT_FLOOR = '5,000+';
const DEFAULT_REPORT_PRICE_INR = 299;
const GST_RATE_BPS = 1800;
const GST_BASIS_POINTS = 10000;
const GST_EXCLUSIVE_MODE = 'exclusive';
const GST_CHECKOUT_QUOTE_VERSION = 'reading_checkout_v2';
const PLACE_SUGGESTION_DEBOUNCE_MS = 650;
const ANALYSIS_REQUEST_TIMEOUT_MS = 45_000;
const RESTORED_PALM_EXPERIMENT_TIMEOUT_MS = 2_500;
const RUNTIME_CONFIG = window.__ASTRO_VELA_CONFIG__ || {};
const STOREFRONT = RUNTIME_CONFIG.storefront || {};
const IS_GLOBAL_STOREFRONT = STOREFRONT.id === 'global' && STOREFRONT.global === true;
const STOREFRONT_CURRENCY = String(STOREFRONT.currency || 'INR').trim().toUpperCase();
const STOREFRONT_LOCALE = String(STOREFRONT.locale || (IS_GLOBAL_STOREFRONT ? 'en-US' : 'en-IN')).trim();
const GLOBAL_RESIDENCE_COUNTRY_CODES = Object.freeze(
  IS_GLOBAL_STOREFRONT && Array.isArray(STOREFRONT.allowedResidenceCountries)
    ? [...new Set(STOREFRONT.allowedResidenceCountries
        .map((value) => String(value || '').trim().toUpperCase())
        .filter((value) => /^[A-Z]{2}$/.test(value)))]
    : []
);
const RUNTIME_PRICING = RUNTIME_CONFIG.pricing || {};
const MARKET_LANDING_EXPERIMENT_KEY = 'market_landing_cta_then_segment';
const MARKET_LANDING_EXPERIMENT_VERSION = 'v1';
const MARKET_LANDING_CONTROL_VARIANT = 'control';
const MARKET_LANDING_TREATMENT_VARIANT = 'cta_then_segment';
const MARKET_LANDING_VARIANTS = new Set([
  MARKET_LANDING_CONTROL_VARIANT,
  MARKET_LANDING_TREATMENT_VARIANT
]);
const MARKET_LANDING_RUNTIME = RUNTIME_CONFIG.experiments?.marketLanding || {};
const PALM_SCAN_ASSET_URL = '/astroyogi/assets/palm-scan.webp';
const FACE_SCAN_DEMO_URL = '/astroyogi/assets/face-scan-animated.webp';
// Palm pricing is supplied by the server so future price tests need one
// lane-specific environment change. The fallback only covers offline previews.
const PALM_REPORT_PRICE_INR = Number(RUNTIME_CONFIG.lanePricing?.palm_answers?.amount || 299);
const FACE_PERSONALITY_PRICING = RUNTIME_CONFIG.lanePricing?.face_personality || { amount: 299 };
const FACE_LIFETIME_PRICING = RUNTIME_CONFIG.lanePricing?.face_answers || { amount: 449 };
const FACE_PERSONALITY_REPORT_PRICE_INR = Number(FACE_PERSONALITY_PRICING.amount || 299);
const FACE_LIFETIME_REPORT_PRICE_INR = Number(FACE_LIFETIME_PRICING.amount || 449);
const FACE_LIFETIME_UPGRADE_PRICE_INR = Math.max(
  0,
  FACE_LIFETIME_REPORT_PRICE_INR - FACE_PERSONALITY_REPORT_PRICE_INR
);
const FACE_LANDMARK_WORKER_URL = '/face-landmarker.worker.v2.js?v=330c692f32d78ee39c0c9faeb145ba527e3e2255126a9d95834ccccfeaa73c4f';
const FACE_SCAN_MIN_SUCCESS_MS = 2600;
const FACE_SCAN_BASE_TRACE_MS = 3000;
const FACE_SCAN_SIGNAL_REVEAL_MS = 650;
const FACE_SCAN_COMPLETE_HOLD_MS = 1250;
const FACE_SCAN_REDUCED_BASE_HOLD_MS = 650;
const FACE_SCAN_REDUCED_SIGNAL_HOLD_MS = 360;
const FACE_SCAN_REDUCED_COMPLETE_HOLD_MS = 650;
const FACE_SCAN_SIGNAL_STAGES = Object.freeze([
  Object.freeze({ key: 'face_shape', label: 'Face frame', revealAt: 0.08 }),
  Object.freeze({ key: 'facial_thirds', label: 'Middle/lower balance', revealAt: 0.16 }),
  Object.freeze({ key: 'eye_spacing', label: 'Eye spacing', revealAt: 0.27 }),
  Object.freeze({ key: 'eye_color', label: 'Eye colour', revealAt: 0.34 }),
  Object.freeze({ key: 'brow_line', label: 'Brow shape', revealAt: 0.41 }),
  Object.freeze({ key: 'brow_spacing', label: 'Brow spacing', revealAt: 0.48 }),
  Object.freeze({ key: 'nose_proportion', label: 'Centre line', revealAt: 0.56 }),
  Object.freeze({ key: 'mouth_proportion', label: 'Mouth shape', revealAt: 0.66 }),
  Object.freeze({ key: 'jaw_contour', label: 'Jaw width', revealAt: 0.78 }),
  Object.freeze({ key: 'chin_lower_face', label: 'Lower-face share', revealAt: 0.88 })
]);
const BEST_CITY_PRICING = RUNTIME_CONFIG.lanePricing?.best_city || { amount: 299 };
const NAME_NUMEROLOGY_PRICING = RUNTIME_CONFIG.lanePricing?.name_numerology || {
  amount: 299,
  compareAtAmount: 11000
};
const MAHAKUNDLI_PRICING = RUNTIME_CONFIG.lanePricing?.mahakundli || {
  amount: 500,
  compareAtAmount: 2100,
  tax: { mode: 'exclusive', gstRateBps: 1800 }
};
const PALM_NAME_ALIGNMENT_ADDON_KEY = 'palm_name_alignment';
const PALM_NAME_ALIGNMENT_PRICING = RUNTIME_CONFIG.addOns?.palm_name_alignment || {};
const PALM_NAME_ALIGNMENT_PRICE_INR = Number(PALM_NAME_ALIGNMENT_PRICING.amount || 150);
const PALM_NAME_ALIGNMENT_COMPARE_AT_INR = Number(PALM_NAME_ALIGNMENT_PRICING.compareAtAmount || 500);
const PALM_NAME_ALIGNMENT_OFFER_BASE_PRICE_INR = Number(PALM_NAME_ALIGNMENT_PRICING.offerBaseAmount || 351);
const PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION = String(PALM_NAME_ALIGNMENT_PRICING.experimentVersion || 'v13');
const PALM_NAME_ALIGNMENT_PRICING_CONTRACT = 'v13';
const PALM_NAME_ALIGNMENT_FACTORIAL_VERSIONS = new Set(['v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13']);
const PALM_NAME_ALIGNMENT_FACTORIAL_ARMS = Object.freeze({
  base_299_default_off: Object.freeze({ baseAmount: 299, defaultSelected: false }),
  base_299_default_on: Object.freeze({ baseAmount: 299, defaultSelected: true }),
  base_351_default_off: Object.freeze({ baseAmount: 351, defaultSelected: false }),
  base_351_default_on: Object.freeze({ baseAmount: 351, defaultSelected: true }),
  base_451_default_off: Object.freeze({ baseAmount: 451, defaultSelected: false })
});
const PALM_PAYWALL_SCROLL_MILESTONES = [10, 25, 50, 75, 90, 100];
const PALM_PAYWALL_TIME_MILESTONES_SECONDS = [5, 15, 30, 60, 120];
const REPORT_PRICE_INR = Number(RUNTIME_PRICING.amount || DEFAULT_REPORT_PRICE_INR);
const PALM_LIFE_AREA_TITLES = Object.freeze({
  loveMarriage: IS_GLOBAL_STOREFRONT ? 'Relationships and connection' : 'Marriage and relationship',
  familyChildren: IS_GLOBAL_STOREFRONT ? 'Family and home life' : 'Children and family',
  careerSuccess: IS_GLOBAL_STOREFRONT ? 'Career and work style' : 'Career, promotion or business growth',
  moneyWealth: IS_GLOBAL_STOREFRONT ? 'Money habits and resources' : 'Money and wealth',
  recognition: IS_GLOBAL_STOREFRONT ? 'Visibility and contribution' : 'Being noticed for your work',
  wellbeingEnergy: 'Energy, rest and recovery'
});
const QUERY = new URLSearchParams(location.search);
const CHARITY_GRANT_QUERY_READING_ID = String(QUERY.get('readingId') || '').trim();
const CHARITY_GRANT_QUERY_ACCESS = String(QUERY.get('access') || '').trim();

function normalizedCharityGrantToken(value) {
  const token = String(value || '').trim().toLowerCase();
  return /^[a-f0-9]{32}$/.test(token) ? token : '';
}

function charityGrantStorageKey(readingId) {
  const normalizedReadingId = String(readingId || '').trim();
  return /^rdg_cg_[a-f0-9]{24}$/.test(normalizedReadingId)
    ? `${CHARITY_GRANT_STORAGE_PREFIX}${normalizedReadingId}`
    : '';
}

function readCharityGrantToken(readingId) {
  const key = charityGrantStorageKey(readingId);
  if (!key) return '';
  try {
    return normalizedCharityGrantToken(sessionStorage.getItem(key));
  } catch (_) {
    return '';
  }
}

function captureCharityGrantToken(readingId) {
  const normalizedReadingId = String(readingId || '').trim();
  const fragment = String(location.hash || '');
  const match = /^#charity_grant=([a-f0-9]{32})$/.exec(fragment);
  let captured = '';
  if (
    match
    && CHARITY_GRANT_QUERY_ACCESS === 'charity'
    && charityGrantStorageKey(normalizedReadingId)
  ) {
    captured = match[1];
    try {
      sessionStorage.setItem(charityGrantStorageKey(normalizedReadingId), captured);
    } catch (_) {}
  }
  if (fragment.startsWith('#charity_grant=') && window.history?.replaceState) {
    try {
      history.replaceState(history.state, '', `${location.pathname}${location.search}`);
    } catch (_) {}
  }
  return captured;
}

function takeEarlyCharityGrantToken(readingId) {
  let handoff = null;
  try {
    handoff = globalThis.__ASTRO_VELA_CHARITY_GRANT_HANDOFF__;
    delete globalThis.__ASTRO_VELA_CHARITY_GRANT_HANDOFF__;
  } catch (_) {}
  if (
    handoff?.readingId !== readingId
    || CHARITY_GRANT_QUERY_ACCESS !== 'charity'
    || !charityGrantStorageKey(readingId)
  ) return '';
  return normalizedCharityGrantToken(handoff.token);
}

const EARLY_CHARITY_GRANT_TOKEN = takeEarlyCharityGrantToken(CHARITY_GRANT_QUERY_READING_ID);
const CAPTURED_CHARITY_GRANT_TOKEN = EARLY_CHARITY_GRANT_TOKEN
  || captureCharityGrantToken(CHARITY_GRANT_QUERY_READING_ID);
const RETURN_CHARITY_GRANT_TOKEN = CAPTURED_CHARITY_GRANT_TOKEN
  || readCharityGrantToken(CHARITY_GRANT_QUERY_READING_ID);
const CROSS_SELL_QA_REQUESTED = QUERY.get('qa_cross_sell') === '1';
const CROSS_SELL_QA_QUERY_TOKEN = /^[a-zA-Z0-9._-]{40,1800}$/.test(
  String(QUERY.get('qa_cross_sell_token') || '')
) ? String(QUERY.get('qa_cross_sell_token')) : '';
let crossSellQaStoredToken = '';
try {
  const stored = String(sessionStorage.getItem(CROSS_SELL_QA_HANDOFF_KEY) || '');
  if (/^[a-zA-Z0-9._-]{40,1800}$/.test(stored)) crossSellQaStoredToken = stored;
} catch (_) {}
const CROSS_SELL_QA_TOKEN = CROSS_SELL_QA_REQUESTED && CROSS_SELL_QA_QUERY_TOKEN
  ? CROSS_SELL_QA_QUERY_TOKEN
  : crossSellQaStoredToken;
const CROSS_SELL_QA_ACTIVE = Boolean(CROSS_SELL_QA_TOKEN);
if (CROSS_SELL_QA_ACTIVE) {
  try { sessionStorage.setItem(CROSS_SELL_QA_HANDOFF_KEY, CROSS_SELL_QA_TOKEN); } catch (_) {}
}
if (CROSS_SELL_QA_REQUESTED || QUERY.has('qa_cross_sell_token')) {
  try {
    const sanitizedUrl = new URL(location.href);
    sanitizedUrl.searchParams.delete('qa_cross_sell');
    sanitizedUrl.searchParams.delete('qa_cross_sell_token');
    history.replaceState(history.state, '', `${sanitizedUrl.pathname}${sanitizedUrl.search}${sanitizedUrl.hash}`);
  } catch (_) {}
}
const LOCAL_PALM_MOUNT_PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname)
  && QUERY.get('preview') === 'palm-mounts';
const LOCAL_PALM_SCAN_PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname)
  && QUERY.get('preview') === 'palm-scan';
const LOCAL_PALM_PROOF_PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname)
  && QUERY.get('preview') === 'palm-proof';
const LOCAL_PALM_PAYWALL_PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname)
  && QUERY.get('preview') === 'palm-paywall';
const LOCAL_PALM_SUMMARY_PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname)
  && QUERY.get('preview') === 'palm-summary';
const LOCAL_PALM_REPORT_PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname)
  && QUERY.get('preview') === 'palm-report';
const LOCAL_PALM_PAID_PREVIEW = LOCAL_PALM_SUMMARY_PREVIEW || LOCAL_PALM_REPORT_PREVIEW;
const LOCAL_NEXT_READING_CONFIRM_PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname)
  && QUERY.get('preview') === 'next-reading-confirm';
const LOCAL_NAME_PAYWALL_PREVIEW = ['localhost', '127.0.0.1'].includes(location.hostname)
  && QUERY.get('preview') === 'name-paywall';
const LOCAL_VISUAL_PREVIEW = LOCAL_PALM_MOUNT_PREVIEW
  || LOCAL_PALM_SCAN_PREVIEW
  || LOCAL_PALM_PROOF_PREVIEW
  || LOCAL_PALM_PAYWALL_PREVIEW
  || LOCAL_PALM_PAID_PREVIEW
  || LOCAL_NEXT_READING_CONFIRM_PREVIEW
  || LOCAL_NAME_PAYWALL_PREVIEW;
const LOCAL_PALM_PAYWALL_VARIANT = ['c', 'd', 'e', 'f', 'g'].includes(String(QUERY.get('variant') || '').toLowerCase())
  ? String(QUERY.get('variant')).toLowerCase()
  : 'e';
const PALM_PROOF_DENSITY_EXPERIMENT_KEY = 'palm_paywall_proof_density';
const PALM_PROOF_DENSITY_EXPERIMENT_VERSION = 'v1';
const PALM_PROOF_DENSITY_CONTROL = 'full';
const PALM_PROOF_DENSITY_TREATMENT = 'compact_evidence';
// The treatment stays at 0% until the local review is approved. Raising this
// percentage is the only production-allocation change needed for the test.
const PALM_PROOF_DENSITY_RUNTIME = RUNTIME_CONFIG.experiments?.palmProofDensity || {};
const PALM_PROOF_DENSITY_TREATMENT_PERCENT = Math.max(
  0,
  Math.min(50, Number(PALM_PROOF_DENSITY_RUNTIME.treatmentPercent) || 0)
);
const PALM_PROOF_DENSITY_ALLOCATION_EPOCH = normalizePalmAllocationEpoch(
  PALM_PROOF_DENSITY_RUNTIME.allocationEpoch
);
const LOCAL_PALM_PROOF_DENSITY_VARIANT = LOCAL_PALM_PAYWALL_PREVIEW
  && LOCAL_PALM_PAYWALL_VARIANT === 'e'
  && [PALM_PROOF_DENSITY_CONTROL, PALM_PROOF_DENSITY_TREATMENT]
    .includes(String(QUERY.get('proof') || '').toLowerCase())
  ? String(QUERY.get('proof')).toLowerCase()
  : PALM_PROOF_DENSITY_CONTROL;
const PALM_GATEWAY_RECOVERY_EXPERIMENT_KEY = 'palm_gateway_exit_recovery';
const PALM_GATEWAY_RECOVERY_EXPERIMENT_VERSION = 'v1';
const PALM_GATEWAY_RECOVERY_CONTROL = 'standard';
const PALM_GATEWAY_RECOVERY_TREATMENT = 'guided_recovery';
const PALM_GATEWAY_RECOVERY_RUNTIME = RUNTIME_CONFIG.experiments?.palmGatewayRecovery || {};
const PALM_GATEWAY_RECOVERY_TREATMENT_PERCENT = Math.max(
  0,
  Math.min(50, Number(PALM_GATEWAY_RECOVERY_RUNTIME.treatmentPercent) || 0)
);
const PALM_GATEWAY_RECOVERY_ALLOCATION_EPOCH = normalizePalmAllocationEpoch(
  PALM_GATEWAY_RECOVERY_RUNTIME.allocationEpoch
);
const LOCAL_PALM_GATEWAY_RECOVERY_VARIANT = LOCAL_PALM_PAYWALL_PREVIEW
  && LOCAL_PALM_PAYWALL_VARIANT === 'e'
  && [PALM_GATEWAY_RECOVERY_CONTROL, PALM_GATEWAY_RECOVERY_TREATMENT]
    .includes(String(QUERY.get('gateway') || '').toLowerCase())
  ? String(QUERY.get('gateway')).toLowerCase()
  : PALM_GATEWAY_RECOVERY_CONTROL;
const CHECKOUT_OBSERVABILITY_VERSION = 'gateway_dismiss_v1';
const PAYMENT_DISMISS_RECOVERY_PROMPT_VERSION = 'gateway_recovery_prompt_v1';
const LOCAL_PALM_NAME_DEFAULT_SELECTED = String(QUERY.get('name_default') || 'off').toLowerCase() !== 'off';
const LOCAL_PALM_NAME_BASE_AMOUNT = [299].includes(Number(QUERY.get('name_base')))
  ? Number(QUERY.get('name_base'))
  : ['v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13'].includes(PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION)
    ? 299
    : PALM_NAME_ALIGNMENT_OFFER_BASE_PRICE_INR;
const PALM_PAYWALL_VARIANTS = {
  c: {
    unlockTitle: 'Your palm, chart and name all point to one period.',
    unlockSubline: 'Your reading points to one future period. The full report shows the exact dates and the first area of life to strengthen.',
    payCta: 'Show me what changes first'
  },
  d: {
    unlockKicker: 'Your future timeline is ready',
    unlockTitle: 'Which part of your life becomes stronger first?',
    unlockSubline: 'Your palm, birth chart and name number point to one future period.',
    payCta: 'Show me what changes first',
    fixedHeroCopy: true
  },
  e: {
    unlockKicker: 'Your private Palm answers are ready',
    unlockTitle: 'What does your palm reveal about the years ahead?',
    unlockSubline: 'Career or business growth, money and wealth, love, children and family, recognition, energy, rest and recovery—every answer is ready and locked.',
    payCta: 'Reveal every Palm answer',
    fixedHeroCopy: true
  },
  f: {
    unlockKicker: 'Your private Palm timeline is ready',
    unlockTitle: 'Which part of your life becomes stronger first?',
    unlockSubline: 'Your Palm points to one important period. Reveal when it becomes strongest—and the life area it strengthens first.',
    payCta: 'Show me what strengthens first',
    fixedHeroCopy: true
  },
  // G opens with one supported strongest finding from the combined reading,
  // then sells the timing and remaining areas. The fallback is used when the
  // corresponding Palm observation is not clear enough to reveal.
  g: {
    unlockKicker: 'Your palm reading is ready',
    unlockTitle: 'One part of your life stands out most.',
    unlockSubline: 'You can see your strongest area. Your complete report shows when it becomes stronger and what follows.',
    payCta: 'Show me my full palm timeline',
    fixedHeroCopy: true
  }
};
const PALM_G_V3_COPY = Object.freeze({
  unlockKicker: 'Your strongest result is revealed',
  unlockTitle: 'Your strongest positive shift ahead is ready.',
  unlockSubline: 'See what it means, when it becomes stronger and what may help.',
  payCta: 'Unlock my complete timeline',
  fixedHeroCopy: true
});
const LEGACY_PALM_PAYWALL_BASE = Object.freeze({
  unlockKicker: 'Read from your own palm, birth chart and name number',
  proofLabel: 'Your free timing clue',
  tension: 'You can already see how soon it begins. The exact dates and the first life area to strengthen are still locked.',
  paywallQuestions: [
    { key: 'loveMarriage', emoji: '♥', title: 'Love and marriage' },
    { key: 'familyChildren', emoji: '⌂', title: 'Family and children' },
    { key: 'careerSuccess', emoji: '↗', title: 'Career and success' },
    { key: 'moneyWealth', emoji: '₹', title: 'Money and wealth' },
    { key: 'recognition', emoji: '✦', title: 'Name, fame and recognition' },
    { key: 'wellbeingEnergy', emoji: '◐', title: 'Wellbeing and energy' }
  ]
});
// Fresh sessions route to E only while G2 is paused. Historical C, D, E, F and
// G assignments remain restorable so refreshes and payment returns never change
// a customer's paywall identity.
const PRODUCTION_PALM_PAYWALL_VARIANTS = ['e', 'g'];
const RESTORABLE_PALM_PAYWALL_VARIANTS = ['c', 'd', 'e', 'f', 'g'];

function palmProofDensityBucketForSession(analyticsSessionId) {
  const value = `${PALM_PROOF_DENSITY_EXPERIMENT_KEY}:${PALM_PROOF_DENSITY_EXPERIMENT_VERSION}:${String(analyticsSessionId || '')}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return (hash >>> 0) % 10000;
}

function normalizePalmAllocationEpoch(value) {
  const normalized = String(value || '').trim();
  return /^[a-z0-9][a-z0-9_-]{2,99}$/.test(normalized) ? normalized : '';
}

function palmAllocationEpochIsOff(value) {
  return /(?:^|_)off(?:_|$)/.test(value);
}

function resolvePalmProofDensityExperiment({
  analyticsSessionId,
  paywallVariant,
  carriedVersion,
  carriedVariant,
  carriedBucket,
  carriedEligible,
  carriedAllocationPercent,
  carriedAllocationEpoch,
  carriedAssignmentSource,
  legacySession = false
} = {}) {
  const bucket = palmProofDensityBucketForSession(analyticsSessionId);
  const normalizedVersion = String(carriedVersion || '').trim();
  const normalizedVariant = String(carriedVariant || '').trim().toLowerCase();
  const storedBucket = Number(carriedBucket);
  const storedAllocationPercent = Number(carriedAllocationPercent);
  const rawStoredAllocationEpoch = String(carriedAllocationEpoch || '').trim();
  const storedAllocationEpoch = normalizePalmAllocationEpoch(rawStoredAllocationEpoch);
  const storedEligible = carriedEligible === true;
  const storedAssignmentSource = String(carriedAssignmentSource || '').trim();
  const expectedStoredVariant = storedEligible
    && String(paywallVariant || '').toLowerCase() === 'e'
    && storedBucket < Math.round(storedAllocationPercent * 100)
    ? PALM_PROOF_DENSITY_TREATMENT
    : PALM_PROOF_DENSITY_CONTROL;
  const storedSourceSemanticsValid = storedEligible
    ? storedAssignmentSource === 'server_randomized'
      && storedAllocationPercent > 0
    : ['runtime_control', 'legacy_control', 'ineligible_paywall', 'ineligible_release', 'ineligible_traffic', 'server_fail_closed']
      .includes(storedAssignmentSource)
      && storedAllocationPercent === 0;
  const storedEpochSemanticsValid = storedEligible
    ? storedAllocationEpoch === PALM_PROOF_DENSITY_ALLOCATION_EPOCH
      && !palmAllocationEpochIsOff(storedAllocationEpoch)
    : !rawStoredAllocationEpoch || Boolean(storedAllocationEpoch);
  if (
    normalizedVersion === PALM_PROOF_DENSITY_EXPERIMENT_VERSION
    && [PALM_PROOF_DENSITY_CONTROL, PALM_PROOF_DENSITY_TREATMENT].includes(normalizedVariant)
    && Number.isInteger(storedBucket)
    && storedBucket === bucket
    && storedBucket >= 0
    && storedBucket < 10000
    && Number.isFinite(storedAllocationPercent)
    && storedAllocationPercent >= 0
    && storedAllocationPercent <= 50
    && (!storedEligible || String(paywallVariant || '').toLowerCase() === 'e')
    && normalizedVariant === expectedStoredVariant
    && storedSourceSemanticsValid
    && storedEpochSemanticsValid
  ) {
    return {
      key: PALM_PROOF_DENSITY_EXPERIMENT_KEY,
      version: normalizedVersion,
      variant: normalizedVariant,
      bucket: storedBucket,
      eligible: storedEligible,
      allocationPercent: storedAllocationPercent,
      ...(storedAllocationEpoch ? { allocationEpoch: storedAllocationEpoch } : {}),
      assignmentSource: storedAssignmentSource
    };
  }
  const allocationPercent = Math.max(0, Math.min(50, Number(PALM_PROOF_DENSITY_TREATMENT_PERCENT) || 0));
  const eligible = !legacySession
    && String(paywallVariant || '').toLowerCase() === 'e'
    && allocationPercent > 0
    && Boolean(PALM_PROOF_DENSITY_ALLOCATION_EPOCH)
    && !palmAllocationEpochIsOff(PALM_PROOF_DENSITY_ALLOCATION_EPOCH);
  return {
    key: PALM_PROOF_DENSITY_EXPERIMENT_KEY,
    version: PALM_PROOF_DENSITY_EXPERIMENT_VERSION,
    variant: eligible && bucket < Math.round(allocationPercent * 100)
      ? PALM_PROOF_DENSITY_TREATMENT
      : PALM_PROOF_DENSITY_CONTROL,
    bucket,
    eligible,
    allocationPercent: eligible ? allocationPercent : 0,
    ...(PALM_PROOF_DENSITY_ALLOCATION_EPOCH
      ? { allocationEpoch: PALM_PROOF_DENSITY_ALLOCATION_EPOCH }
      : {}),
    assignmentSource: legacySession ? 'legacy_control' : eligible ? 'client_preassignment' : 'runtime_control'
  };
}

function palmGatewayRecoveryBucketForSession(analyticsSessionId) {
  const value = `${PALM_GATEWAY_RECOVERY_EXPERIMENT_KEY}:${PALM_GATEWAY_RECOVERY_EXPERIMENT_VERSION}:${String(analyticsSessionId || '')}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return (hash >>> 0) % 10000;
}

function resolvePalmGatewayRecoveryExperiment({
  analyticsSessionId,
  paywallVariant,
  carriedVersion,
  carriedVariant,
  carriedBucket,
  carriedEligible,
  carriedAllocationPercent,
  carriedAllocationEpoch,
  carriedAssignmentSource,
  legacySession = false
} = {}) {
  const bucket = palmGatewayRecoveryBucketForSession(analyticsSessionId);
  const normalizedVersion = String(carriedVersion || '').trim();
  const normalizedVariant = String(carriedVariant || '').trim().toLowerCase();
  const storedBucket = Number(carriedBucket);
  const storedAllocationPercent = Number(carriedAllocationPercent);
  const rawStoredAllocationEpoch = String(carriedAllocationEpoch || '').trim();
  const storedAllocationEpoch = normalizePalmAllocationEpoch(rawStoredAllocationEpoch);
  const storedEligible = carriedEligible === true;
  const storedAssignmentSource = String(carriedAssignmentSource || '').trim();
  const expectedStoredVariant = storedEligible
    && String(paywallVariant || '').toLowerCase() === 'e'
    && storedBucket < Math.round(storedAllocationPercent * 100)
    ? PALM_GATEWAY_RECOVERY_TREATMENT
    : PALM_GATEWAY_RECOVERY_CONTROL;
  const storedSourceSemanticsValid = storedEligible
    ? storedAssignmentSource === 'server_randomized'
      && storedAllocationPercent > 0
    : ['runtime_control', 'legacy_control', 'ineligible_paywall', 'ineligible_release', 'ineligible_traffic', 'ineligible_concurrent_experiment', 'server_fail_closed']
      .includes(storedAssignmentSource)
      && storedAllocationPercent === 0;
  const storedEpochSemanticsValid = storedEligible
    ? storedAllocationEpoch === PALM_GATEWAY_RECOVERY_ALLOCATION_EPOCH
      && !palmAllocationEpochIsOff(storedAllocationEpoch)
    : !rawStoredAllocationEpoch || Boolean(storedAllocationEpoch);
  if (
    normalizedVersion === PALM_GATEWAY_RECOVERY_EXPERIMENT_VERSION
    && [PALM_GATEWAY_RECOVERY_CONTROL, PALM_GATEWAY_RECOVERY_TREATMENT].includes(normalizedVariant)
    && Number.isInteger(storedBucket)
    && storedBucket === bucket
    && storedBucket >= 0
    && storedBucket < 10000
    && Number.isFinite(storedAllocationPercent)
    && storedAllocationPercent >= 0
    && storedAllocationPercent <= 50
    && (!storedEligible || String(paywallVariant || '').toLowerCase() === 'e')
    && normalizedVariant === expectedStoredVariant
    && storedSourceSemanticsValid
    && storedEpochSemanticsValid
  ) {
    return {
      key: PALM_GATEWAY_RECOVERY_EXPERIMENT_KEY,
      version: normalizedVersion,
      variant: normalizedVariant,
      bucket: storedBucket,
      eligible: storedEligible,
      allocationPercent: storedAllocationPercent,
      ...(storedAllocationEpoch ? { allocationEpoch: storedAllocationEpoch } : {}),
      assignmentSource: storedAssignmentSource
    };
  }
  const allocationPercent = Math.max(
    0,
    Math.min(50, Number(PALM_GATEWAY_RECOVERY_TREATMENT_PERCENT) || 0)
  );
  // The browser never self-enrols into this payment treatment. A new reading
  // stays on control until the server returns its canonical assignment.
  const eligible = false;
  return {
    key: PALM_GATEWAY_RECOVERY_EXPERIMENT_KEY,
    version: PALM_GATEWAY_RECOVERY_EXPERIMENT_VERSION,
    variant: eligible && bucket < Math.round(allocationPercent * 100)
      ? PALM_GATEWAY_RECOVERY_TREATMENT
      : PALM_GATEWAY_RECOVERY_CONTROL,
    bucket,
    eligible,
    allocationPercent: eligible ? allocationPercent : 0,
    ...(PALM_GATEWAY_RECOVERY_ALLOCATION_EPOCH
      ? { allocationEpoch: PALM_GATEWAY_RECOVERY_ALLOCATION_EPOCH }
      : {}),
    assignmentSource: legacySession ? 'legacy_control' : 'runtime_control'
  };
}

function boundedMarketLandingTreatmentPercent(value = MARKET_LANDING_RUNTIME.treatmentPercent) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(50, numeric));
}

function marketLandingBucketForSession(analyticsSessionId) {
  const value = `${MARKET_LANDING_EXPERIMENT_KEY}:${MARKET_LANDING_EXPERIMENT_VERSION}:${String(analyticsSessionId || '')}`;
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return (hash >>> 0) % 10000;
}

function marketLandingVariantForSession(analyticsSessionId, treatmentPercent = boundedMarketLandingTreatmentPercent()) {
  const threshold = Math.round(boundedMarketLandingTreatmentPercent(treatmentPercent) * 100);
  return marketLandingBucketForSession(analyticsSessionId) < threshold
    ? MARKET_LANDING_TREATMENT_VARIANT
    : MARKET_LANDING_CONTROL_VARIANT;
}

function resolveMarketLandingCohort({
  analyticsSessionId,
  carriedVersion,
  carriedVariant,
  carriedBucket,
  carriedEligible,
  carriedAllocationPercent,
  legacySession = false
} = {}) {
  const normalizedVersion = String(carriedVersion || '').trim();
  const normalizedVariant = String(carriedVariant || '').trim().toLowerCase();
  const expectedBucket = marketLandingBucketForSession(analyticsSessionId);
  const storedBucket = Number(carriedBucket);
  const rawStoredAllocationPercent = Number(carriedAllocationPercent);
  const storedAllocationPercent = boundedMarketLandingTreatmentPercent(rawStoredAllocationPercent);
  const storedEligible = carriedEligible === true;
  const expectedStoredVariant = storedEligible
    ? storedBucket < Math.round(storedAllocationPercent * 100)
      ? MARKET_LANDING_TREATMENT_VARIANT
      : MARKET_LANDING_CONTROL_VARIANT
    : MARKET_LANDING_CONTROL_VARIANT;
  const hasStoredAssignment = normalizedVersion === MARKET_LANDING_EXPERIMENT_VERSION
    && MARKET_LANDING_VARIANTS.has(normalizedVariant)
    && Number.isInteger(storedBucket)
    && storedBucket === expectedBucket
    && Number.isFinite(rawStoredAllocationPercent)
    && rawStoredAllocationPercent >= 0
    && rawStoredAllocationPercent <= 50
    && normalizedVariant === expectedStoredVariant;
  if (hasStoredAssignment) {
    return {
      key: MARKET_LANDING_EXPERIMENT_KEY,
      version: MARKET_LANDING_EXPERIMENT_VERSION,
      variant: normalizedVariant,
      bucket: storedBucket,
      eligible: storedEligible,
      allocationPercent: storedAllocationPercent,
      assignmentSource: 'restored_session'
    };
  }

  const allocationPercent = boundedMarketLandingTreatmentPercent();
  const eligible = !legacySession && allocationPercent > 0;
  return {
    key: MARKET_LANDING_EXPERIMENT_KEY,
    version: MARKET_LANDING_EXPERIMENT_VERSION,
    variant: eligible
      ? marketLandingVariantForSession(analyticsSessionId, allocationPercent)
      : MARKET_LANDING_CONTROL_VARIANT,
    bucket: expectedBucket,
    eligible,
    allocationPercent,
    assignmentSource: legacySession ? 'legacy_control' : eligible ? 'fresh_session' : 'runtime_control'
  };
}

function palmPaywallVariantForSession(analyticsSessionId) {
  const value = String(analyticsSessionId || '');
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  }
  return PRODUCTION_PALM_PAYWALL_VARIANTS[(hash >>> 0) % PRODUCTION_PALM_PAYWALL_VARIANTS.length];
}

function normalizePalmPaywallVariant(value, analyticsSessionId) {
  const normalized = String(value || '').toLowerCase();
  return RESTORABLE_PALM_PAYWALL_VARIANTS.includes(normalized)
    ? normalized
    : palmPaywallVariantForSession(analyticsSessionId);
}

const PALM_COPY_VERSIONS_BY_VARIANT = Object.freeze({
  c: Object.freeze([LEGACY_PALM_COPY_VERSION, PREVIOUS_PALM_COPY_VERSION, PALM_COPY_VERSION]),
  d: Object.freeze([LEGACY_PALM_COPY_VERSION, PREVIOUS_PALM_COPY_VERSION]),
  e: Object.freeze([
    PREVIOUS_PALM_COPY_VERSION,
    PALM_COPY_VERSION,
    LEGACY_PALM_EG_COPY_VERSION,
    PREVIOUS_PALM_EG_COPY_VERSION,
    PALM_EG_COPY_VERSION
  ]),
  f: Object.freeze([PALM_COPY_VERSION]),
  g: Object.freeze([
    LEGACY_PALM_EG_COPY_VERSION,
    PREVIOUS_PALM_EG_COPY_VERSION,
    PALM_EG_COPY_VERSION,
    PALM_G_TRUST_PROOF_COPY_VERSION,
    PALM_G_TRUST_PROOF_V5_COPY_VERSION
  ])
});

// A fresh assignment always renders the current cohort copy. Historical
// restores keep using fallbackPalmCopyVersionForVariant so an in-progress
// customer never changes page mid-session.
function freshPalmCopyVersionForVariant(variant) {
  return variant === 'g' ? PALM_G_TRUST_PROOF_V5_COPY_VERSION : PALM_EG_COPY_VERSION;
}

function fallbackPalmCopyVersionForVariant(variant) {
  if (['c', 'd'].includes(variant)) return LEGACY_PALM_COPY_VERSION;
  if (variant === 'e') return PREVIOUS_PALM_COPY_VERSION;
  if (variant === 'f') return PALM_COPY_VERSION;
  if (variant === 'g') return LEGACY_PALM_EG_COPY_VERSION;
  return PALM_EG_COPY_VERSION;
}

function resolvePalmPaywallCohort({ carriedVariant, carriedCopyVersion, analyticsSessionId } = {}) {
  const normalizedCarriedVariant = String(carriedVariant || '').trim().toLowerCase();
  const hasRestorableVariant = RESTORABLE_PALM_PAYWALL_VARIANTS.includes(normalizedCarriedVariant);
  const variant = hasRestorableVariant
    ? normalizedCarriedVariant
    : palmPaywallVariantForSession(analyticsSessionId);
  if (!hasRestorableVariant) {
    return { variant, copyVersion: freshPalmCopyVersionForVariant(variant) };
  }
  const normalizedCopyVersion = String(carriedCopyVersion || '').trim();
  const copyVersion = PALM_COPY_VERSIONS_BY_VARIANT[variant]?.includes(normalizedCopyVersion)
    ? normalizedCopyVersion
    : fallbackPalmCopyVersionForVariant(variant);
  return { variant, copyVersion };
}
const REFERRAL_CODE = String(
  QUERY.get('ref') || (QUERY.get('utm_source') === 'customer_share' ? QUERY.get('utm_id') : '') || ''
).trim().replace(/[^a-z0-9_-]/gi, '').slice(0, 80);
const PATH_ALIASES = {
  '/mahakundli': 'mahakundli',
  '/astroyogi/mahakundli': 'mahakundli',
  '/best-city': 'best_city',
  '/astroyogi/best-city': 'best_city',
  '/partner-name': 'partner_name',
  '/astroyogi/partner-name': 'partner_name',
  '/palm-answers': 'palm_answers',
  '/astroyogi/palm-answers': 'palm_answers',
  '/face-reading': 'face_answers',
  '/astroyogi/face-reading': 'face_answers',
  '/name-numerology': 'name_numerology',
  '/astroyogi/name-numerology': 'name_numerology',
  '/market-profile': 'market_profile',
  '/astroyogi/market-profile': 'market_profile'
};
const ANGLE_ALIASES = {
  mahakundli: 'mahakundli',
  maha_kundli: 'mahakundli',
  'maha-kundli': 'mahakundli',
  kundli: 'mahakundli',
  best_city: 'best_city',
  'best-city': 'best_city',
  bestcity: 'best_city',
  city: 'best_city',
  partner_name: 'partner_name',
  'partner-name': 'partner_name',
  name_m: 'partner_name',
  partner: 'partner_name',
  palm_answers: 'palm_answers',
  'palm-answers': 'palm_answers',
  palm_secrets: 'palm_answers',
  palm: 'palm_answers',
  face_answers: 'face_answers',
  'face-answers': 'face_answers',
  face_reading: 'face_answers',
  'face-reading': 'face_answers',
  face: 'face_answers',
  name_numerology: 'name_numerology',
  'name-numerology': 'name_numerology',
  name_number: 'name_numerology',
  numero: 'name_numerology',
  numerology: 'name_numerology',
  market_profile: 'market_profile',
  'market-profile': 'market_profile',
  stock_market: 'market_profile',
  'stock-market': 'market_profile',
  investor: 'market_profile',
  investing: 'market_profile',
  trading: 'market_profile',
  market_astrology: 'market_profile'
};

const FLOWS = {
  mahakundli: ['intro', 'name', 'dob', 'time', 'place', 'analysis', 'unlock'],
  best_city: ['intro', 'dob', 'time', 'place', 'scope', 'name', 'analysis', 'unlock'],
  partner_name: ['intro', 'dob', 'time', 'place', 'name', 'analysis', 'unlock'],
  palm_answers: ['intro', 'palmscan', 'palmproof', 'dob', 'time', 'place', 'name', 'analysis', 'unlock'],
  face_answers: ['intro', 'facescan', 'faceproof', 'dob', 'time', 'place', 'name', 'analysis', 'unlock'],
  name_numerology: ['intro', 'nameproof', 'dob', 'analysis', 'unlock'],
  market_profile: ['intro', 'dob', 'time', 'place', 'name', 'palmoffer', 'palmupload', 'palmscan', 'palmproof', 'analysis', 'unlock'],
  _default: ['intro']
};

const LANES = {
  mahakundli: {
    label: 'Mahakundli',
    icon: '✦',
    kicker: 'Not one question. One report for your kundli.',
    headline: 'Marriage, money, career, health, children, property — all 17 areas.',
    subline: 'See one calculated life-area result free, before you pay.',
    promises: ['Personal timing when available', '17 life areas', 'Next 3 years'],
    landingCta: 'Get my first answer free',
    landingPrice: 'First personal result free · Complete report price shown for this visit',
    startAnswer: 'build_mahakundli',
    methodLabel: 'Your full Mahakundli',
    benefitReminder: 'Your birth date starts the calculation. A reliable time and place determine your Lagna, 12 houses and personal dasha dates.',
    analysisKicker: 'Calculating your Mahakundli',
    analysisTitle: 'Checking which personal timing can be calculated.',
    analysisCopy: "Each answer comes from the birth details you entered. We do not show anything that cannot be calculated reliably.",
    analysisStack: 'Kundli · personal dashas when birth details allow · Guru (Jupiter), Shani (Saturn), Rahu (North Node) and Ketu (South Node) transits · 17 separate life areas',
    unlockKicker: 'Your report is ready',
    unlockTitle: 'Your first calculated result is ready.',
    unlockSubline: 'Your free result opens one answer. The full report gives dates, reasons and next steps for all 17 life areas.',
    proofLabel: 'Your first personal result',
    tension: 'The same dasha can support work while marriage and family responsibilities need more care. Your full report checks each area separately.',
    product: 'Complete Mahakundli Report',
    payCta: 'Open all 17 life areas',
    paywallQuestions: [
      { key: 'marriage', emoji: '♥', title: 'Marriage: what should you check before deciding?', leadIn: 'See how timing, family expectations and practical agreements affect the decision.' },
      { key: 'children', emoji: '◌', title: 'Children and family: what can you plan for the next 3 years?', leadIn: 'See practical guidance for time, money and help at home. Personal dates appear only when your birth details support them.' },
      { key: 'careerDirection', emoji: '↗', title: 'Career: stay, switch fields or wait for a better period?', leadIn: 'See career direction, job change and promotion as three separate answers.' },
      { key: 'jobChange', emoji: '⇢', title: 'Job: resign now or wait for a better opening?', leadIn: 'See whether a new role changes the manager, money and pressure, or only the office.' },
      { key: 'promotion', emoji: '▲', title: 'Promotion: what should change besides the title?', leadIn: 'See whether a bigger role would bring authority and pay, or only more work.' },
      { key: 'businessPartnerships', emoji: '◇', title: 'Business: can the agreement supporting your growth hold up?', leadIn: 'See what can expand and which contract, payment responsibility or ownership term needs protection.' },
      { key: 'moneyProperty', emoji: '₹', title: 'Money: should you earn more, save more or review spending first?', leadIn: 'See what can grow, which expenses to review and what to protect before taking a new risk.' },
      { key: 'nextPeriod', emoji: '◷', title: 'Next dasha: what changes when this period ends?', leadIn: 'See which graha comes next, its exact start date and what to do in the first 90 days.' }
    ],
    deliverables: [
      'Lagna (Ascendant), Chandra (Moon), Surya (Sun), all 9 grahas and all 12 houses',
      '7 varga charts, including D9 for marriage and D10 for career',
      'Current Mahadasha, Antardasha and Pratyantardasha',
      'Your full Vimshottari timeline and next 3 periods',
      'Guru (Jupiter), Shani (Saturn), Rahu (North Node) and Ketu (South Node) transits for the next 3 years',
      'Only the yogas and doshas your kundli actually shows',
      '17 separately calculated life areas',
      'A practical 90-day plan, optional low-cost upay and a simple glossary',
      'A downloadable PDF with the same complete report'
    ]
  },
  best_city: {
    label: 'Best City',
    icon: '⌖',
    kicker: 'A city comparison based on your details',
    headline: 'Which city supports your career, money, relationships and visibility best?',
    subline: 'Choose what matters most. We compare the cities and rank your strongest three.',
    promises: ['Your #1 city', 'Two alternatives', 'The best time to move'],
    landingCta: 'Find my best cities',
    landingPrice: 'Start free · Full city report',
    startAnswer: 'find_best_city',
    methodLabel: 'Your city comparison',
    benefitReminder: 'Each answer helps compare cities using the same personal details.',
    analysisKicker: 'Comparing cities for you',
    analysisTitle: 'We are ranking the cities in your search.',
    analysisCopy: 'We are scoring career, money, relationships and visibility, then checking practical daily-life needs.',
    analysisStack: 'Birth chart · location factors · current periods · numerology · city ranking',
    unlockKicker: 'Your city ranking is ready',
    unlockTitle: 'Your #1 city — and why it feels right',
    unlockSubline: 'See the three cities that fit you best, why each one ranked where it did, and what changes when your priority changes.',
    proofLabel: 'Your ranking is complete',
    tension: 'Your top three cities do not lead for the same reason. Compare what each one strengthens before you choose where to focus.',
    product: 'Best City Report',
    payCta: 'Reveal my top 3 cities',
    socialBonusTitle: 'Let friends guess your top city',
    socialBonusCopy: 'After payment, you can share a card with or without your city result.',
    shareHeading: 'Share your city result',
    shareMysteryTitle: 'GUESS MY TOP CITY',
    shareMysteryBody: 'Which city came first?',
    shareMysteryPrompt: 'What would you guess?',
    shareRevealTitle: 'MY #1 CITY MATCH',
    shareRevealNote: 'Based on my birth chart and numerology',
    shareRevealPrompt: 'Which city might suit you?',
    paywallQuestions: [
      { emoji: '⌖', title: 'Which city ranks first overall?', leadIn: 'See the top city and the strongest reason it came first.' },
      { emoji: '↔', title: 'What are the trade-offs in each city?', leadIn: 'Compare career, money, relationships and visibility.' },
      { emoji: '◷', title: 'Does the calculation support a move period?', leadIn: 'See a broader period when supported and what to check before acting.' }
    ],
    deliverables: [
      'Your #1 city and why it ranked first',
      'Two alternatives, ranked for you',
      'Career, money, relationships and visibility trade-offs',
      'Move timing when supported, with practical checks either way',
      'Separate daily-life checks for cost, visa and family needs'
    ]
  },
  partner_name: {
    label: 'Partner Initials',
    icon: 'A–Z',
    kicker: 'Possible partner initials',
    headline: 'Which initials are strongest in your relationship reading?',
    subline: 'We use your birth chart and numerology to rank three possible starting letters, with relationship timing when supported.',
    promises: ['Top three initials', 'Matching name sounds', 'Relationship timing when supported'],
    landingCta: 'Find my possible initials',
    landingPrice: 'Start free · Full initials report',
    startAnswer: 'check_partner_name',
    methodLabel: 'Your initials comparison',
    benefitReminder: 'Each answer helps compare possible initials and check whether relationship timing is supported.',
    analysisKicker: 'Comparing possible partner initials',
    analysisTitle: 'We are ranking the strongest starting letters.',
    analysisCopy: 'We are comparing your relationship indicators, Venus, birth-star sounds and numerology.',
    analysisStack: 'Relationship indicators · Venus · birth-star sounds · numerology · timing when supported',
    unlockKicker: 'Your initials comparison is complete',
    unlockTitle: 'Three initials stand out. See how each one ranked.',
    unlockSubline: 'See the three letters, matching name sounds, possible meeting settings and relationship timing when supported.',
    proofLabel: 'Your first relationship result',
    tension: 'A letter alone is easy to misread. The full report shows why each initial ranked and which other clues support it.',
    product: 'Partner Initials Report',
    payCta: 'Get my top 3 initials + meeting setting',
    socialBonusTitle: 'Let friends guess your three initials',
    socialBonusCopy: 'After payment, you can share a card with or without the letters.',
    shareHeading: 'Share your partner-initial result',
    shareMysteryTitle: 'GUESS MY THREE INITIALS',
    shareMysteryBody: 'Which letters ranked highest?',
    shareMysteryPrompt: 'What would you guess?',
    shareRevealTitle: 'MY TOP PARTNER INITIALS',
    shareRevealNote: 'Based on my birth chart + numerology',
    shareRevealPrompt: 'Which name came to mind?',
    paywallQuestions: [
      { emoji: 'A', title: 'Which three initials ranked highest?', leadIn: 'See the letters in order and why each one ranked.' },
      { emoji: 'Aa', title: 'Which name sounds match the initials?', leadIn: 'See possible starting sounds and example names.' },
      { emoji: '◷', title: 'When and where might we meet?', leadIn: 'See relationship timing when your birth details support it, plus possible settings.' }
    ],
    deliverables: [
      'Your top three starting letters and how closely they ranked',
      'Matching name sounds and example Indian names',
      'Why each letter ranked through your chart and numbers',
      'Relationship timing when your birth details support it',
      'Possible settings where a connection may begin'
    ]
  },
  name_numerology: {
    label: 'Name Numerology',
    icon: '123',
    kicker: 'Free Chaldean Name Calculation',
    headline: 'Does your name agree with your birth date—or fight it?',
    headlineLead: 'Does your name agree',
    headlineReveal: 'with your birth date—or fight it?',
    subline: 'Your spelling creates one number. Your birth date creates two more. Their match shows which side gets stronger.',
    landingCta: 'Reveal what my number means',
    landingPrice: 'Name Number free · Full spelling verdict',
    startAnswer: 'calculate_name_number',
    methodLabel: 'Your three-number name match',
    benefitReminder: 'Your birth date creates two more numbers. Together, they decide whether this exact spelling should stay.',
    analysisKicker: 'Finding your deciding match',
    analysisTitle: 'We are testing your name against your birth numbers.',
    analysisCopy: 'The two birth-date matches decide whether your current spelling stays or deserves a comparison.',
    analysisStack: 'Chaldean Name Number · Birth Number · Destiny Number · number match · personal year',
    unlockKicker: 'Your three-number match is ready',
    unlockTitle: 'Your Name Number has one clear strength. Your birth match decides if this spelling sustains it.',
    unlockSubline: 'We matched your Name Number with the two numbers in your birth date. Your keep-or-change verdict is ready.',
    proofLabel: 'Your free Name Number',
    tension: 'A Name Number alone cannot tell you whether the spelling fits. The deciding answer comes from all three numbers together.',
    product: 'Name Numerology Report',
    payCta: 'Show my spelling verdict',
    socialBonusTitle: 'Let friends guess your Name Number',
    socialBonusCopy: 'After payment, you can share the number without showing your name or birth date.',
    shareHeading: 'Share your Name Number',
    shareMysteryTitle: 'GUESS MY NAME NUMBER',
    shareMysteryBody: 'Which number does my name carry?',
    shareMysteryPrompt: 'What would you guess?',
    shareRevealTitle: 'MY NAME NUMBER IS',
    shareRevealNote: 'Matched with my Birth + Destiny Numbers',
    shareRevealPrompt: 'What number does your name carry?',
    paywallQuestions: [
      { emoji: '≋', title: 'Does my birth date strengthen—or split—this pattern?', leadIn: 'See your Name, Birth and Destiny Numbers together, plus the conflict that matters most.' },
      { emoji: 'Aa', title: 'Should this exact spelling stay?', leadIn: 'Get a direct keep-or-change verdict before you alter a single letter.' },
      { emoji: 'A+', title: 'If a change helps, which spelling wins?', leadIn: 'See natural, readable options ranked by the strength each one supports.' }
    ],
    deliverables: [
      'A clear keep-or-change spelling verdict',
      'Your strongest readable spelling options, ranked when a change helps',
      'What each spelling supports across career, money and recognition',
      'Why your Name, Birth and Destiny Numbers support the result',
      'Your strongest personal dates and numbers'
    ]
  },
  market_profile: {
    label: 'Market Decision Profile',
    icon: '↗',
    kicker: 'A personal market-behaviour report',
    headline: 'Are you better suited to trading or long-term investing?',
    subline: 'We compare your birth chart and numbers to find your stronger market approach, planning days and future money-building phase.',
    promises: ['Trading or investing', 'Stronger planning days', 'Future money phase'],
    landingCta: 'See my market profile',
    landingPrice: 'Start free · Full market report',
    startAnswer: 'map_market_temperament',
    methodLabel: 'Your investor-behaviour comparison',
    benefitReminder: 'Your details help compare patience, risk habits and decisions under pressure.',
    analysisKicker: 'Comparing your market behaviour',
    analysisTitle: 'We are comparing your decision habits.',
    analysisCopy: 'We are reviewing decision speed, patience, risk habits and money discipline across your chart and numbers.',
    analysisStack: 'Decision style · patience · discipline · risk habits · numerology · optional palm',
    unlockKicker: 'Your three market answers are ready',
    unlockTitle: 'Trading or investing? One fits you better.',
    unlockSubline: 'See whether it is trading or long-term investing, which days of the week are stronger for planning, and the future age when your prosperity-building phase begins.',
    proofLabel: 'Three answers found',
    tension: 'One answer may confirm what you feel. Another may change how you approach the market. See all three together before you choose your next plan.',
    product: 'Market Decision Profile',
    payCta: 'See my three market answers',
    socialBonusTitle: 'Share your investor style, not your finances',
    socialBonusCopy: 'After payment, you can share the result without your name, portfolio or financial details.',
    shareHeading: 'Share your investor style',
    shareMysteryTitle: 'GUESS MY INVESTOR STYLE',
    shareMysteryBody: 'Fast, patient or mixed?',
    shareMysteryPrompt: 'What would you guess?',
    shareRevealTitle: 'MY INVESTOR STYLE',
    shareRevealNote: 'A personal reflection, not a stock tip',
    shareRevealPrompt: 'Which market style are you?',
    paywallQuestions: [
      { emoji: '↔', title: 'Am I better suited to trading or long-term investing?', leadIn: 'One approach has a clearer fit. See which one and how to use it.' },
      { emoji: '◷', title: 'Which days of the week are stronger for my market planning?', leadIn: 'See your stronger days for research, review and rule-setting.' },
      { emoji: '↗', title: 'At what future age does my prosperity-building phase begin?', leadIn: 'See the next age in your calculation and what to prepare before it begins.' }
    ],
    deliverables: [
      'Trading or long-term investing: your stronger behavioural fit',
      'Your stronger days for research, review and rule-setting',
      'Your future prosperity-building age and preparation phase',
      'How pressure may weaken otherwise sound decisions',
      'A practical checklist for every market decision',
      'Optional palm cross-check if you added a photo'
    ]
  },
  face_answers: {
    label: 'Face Reading',
    icon: '◉',
    kicker: 'Your face · First impression · Daily life',
    headline: 'What may people notice in your face before you speak?',
    subline: 'See the first-glance signal in this photo, how it may land in daily life and small ways to change the signal without changing who you are.',
    promises: ['First-glance signal', 'Six daily-life answers', 'Practical experiments'],
    landingCta: 'Read my face',
    landingPrice: 'Free face insight · Reports from',
    startAnswer: 'scan_face',
    methodLabel: 'Your Detailed Face Reading',
    benefitReminder: 'Visible measurements show what this photo contains. First-impression and cultural reflections stay clearly labelled, with actions you can test for yourself.',
    analysisKicker: 'Building your personal Face Reading',
    analysisTitle: 'Your visible cues are mapped. Now we are checking what they may signal in daily life.',
    analysisCopy: 'We separate visible evidence, a possible first impression, cultural reflection and one practical experiment in every answer.',
    analysisStack: 'Visible face map · first-impression cues · six daily-life answers · Indian and Chinese cultural lenses · practical experiments',
    unlockKicker: 'Your private Face Reading is ready',
    unlockTitle: 'Your first impression is only the beginning.',
    unlockSubline: 'See how the same visible cues may help, get misunderstood and change across work, relationships and everyday conversations.',
    proofLabel: 'Your first-glance signal from this photo',
    tension: 'The free clue shows what may stand out first. The six daily-life answers, possible misunderstandings and small actions are still sealed.',
    product: 'Face Reading + Life Timeline',
    payCta: 'Open my complete Face Reading',
    socialBonusTitle: 'Share one insight, never your photo',
    socialBonusCopy: 'After payment, you can share a private-safe result without showing your face or birth details.',
    shareHeading: 'Share one private-safe insight',
    shareMysteryTitle: 'GUESS MY FACE-READING THEME',
    shareMysteryBody: 'Which first-glance theme stood out?',
    shareMysteryPrompt: 'What would you guess?',
    shareRevealTitle: 'MY FACE-READING INSIGHT',
    shareRevealNote: 'Face · Astrology · Numerology',
    shareRevealPrompt: 'What would your face reading reveal?',
    paywallQuestions: [
      { key: 'loveRelationships', emoji: '♥', title: 'When does my relationship pattern become most important?', leadIn: 'See the key relationship period, the Face-reading lens and what to prepare before it begins.' },
      { key: 'familyHome', emoji: '⌂', title: 'Which family and home phase comes next?', leadIn: 'See where communication becomes the deciding factor and the period that deserves attention.' },
      { key: 'careerSuccess', emoji: '↗', title: 'When can the work signal in this portrait help me rise?', leadIn: 'See the career period, the portrait cue to use and the proof to build first.' },
      { key: 'moneyWealth', emoji: '₹', title: 'Which money-building phase deserves preparation now?', leadIn: 'See the period, the habit that fits your pattern and the pressure habit that weakens it.' },
      { key: 'recognition', emoji: '✦', title: 'When does my visibility rise?', leadIn: 'See the recognition period and which part of your Face reading helps people remember your contribution.' },
      { key: 'timing', emoji: '◷', title: 'What are my next three important life phases?', leadIn: 'See what comes first, what follows it and the first practical move for each phase.' }
    ],
    deliverables: [
      'What people may notice first in this photo',
      'Six answers for decisions, communication, relationships, work, resources and growth',
      'Likely impact, possible misunderstanding and one practical action in every answer',
      'Visible measurement kept separate from Samudrika-inspired and Mian Xiang cultural reflection',
      'Same-face, different-signal photo experiments',
      'Optional astrology + numerology life timeline for ₹150 more'
    ]
  },
  palm_answers: {
    label: 'Palm Reading',
    icon: '✋',
    kicker: 'Your personal Palm life reading',
    headline: 'When does your strongest life phase begin?',
    subline: 'A free Palm scan highlights your next shift in love, family, career and wellbeing.',
    promises: ['Love & marriage', 'Career & wealth', 'Family & wellbeing'],
    landingCta: 'Scan my palm',
    landingPrice: 'Start free · Complete Palm Life Timeline',
    startAnswer: 'scan_left_palm',
    methodLabel: 'Your complete life-timing comparison',
    benefitReminder: 'Each detail helps make your personal Palm periods clearer and more useful.',
    analysisKicker: 'Building your Complete Palm Life Timeline',
    analysisTitle: 'We are mapping the periods that matter most.',
    analysisCopy: 'We are reading your visible Palm lines across relationships, family, career, business growth and the life ahead.',
    analysisStack: 'Heart line · Head line · Life line · Fate line · important periods',
    unlockKicker: 'Your complete Palm reading is ready',
    unlockTitle: 'Your palm answered what people rarely ask out loud.',
    unlockSubline: 'Career or business growth, money and wealth, love, children and family, recognition, energy, rest and recovery—every answer is ready and locked.',
    proofLabel: 'Your free Palm clue',
    tension: 'Your first major rise, the strongest period across six life areas and the Palm evidence available for them are still locked.',
    product: 'Complete Palm Life Timeline',
    payCta: 'Reveal every Palm answer',
    socialBonusTitle: 'Share one insight from your reading',
    socialBonusCopy: 'After payment, you can share one private-safe insight without showing your palm photo or birth details.',
    shareHeading: 'Share one private-safe insight',
    shareMysteryTitle: 'GUESS MY STRONGEST LIFE PHASE',
    shareMysteryBody: 'Which part of life becomes stronger first?',
    shareMysteryPrompt: 'What would you guess?',
    shareRevealTitle: 'MY STRONGEST LIFE PHASE',
    shareRevealNote: 'Personal Palm Life Reading',
    shareRevealPrompt: 'Which part of your life becomes stronger next?',
    paywallQuestions: [
      { key: 'loveMarriage', emoji: '♥', title: PALM_LIFE_AREA_TITLES.loveMarriage, leadIn: 'See your strongest relationship phase and what helps a bond become steady.' },
      { key: 'familyChildren', emoji: '⌂', title: PALM_LIFE_AREA_TITLES.familyChildren, leadIn: 'See the broader family and home period shown by your Palm and birth details.' },
      { key: 'careerSuccess', emoji: '↗', title: PALM_LIFE_AREA_TITLES.careerSuccess, leadIn: 'See when responsibility, progress and a bigger role receive stronger support.' },
      { key: 'moneyWealth', emoji: '₹', title: PALM_LIFE_AREA_TITLES.moneyWealth, leadIn: 'See your stronger wealth-building period and the route that suits your pattern.' },
      { key: 'recognition', emoji: '✦', title: PALM_LIFE_AREA_TITLES.recognition, leadIn: 'See when visibility grows and what you are most likely to be known for.' },
      { key: 'wellbeingEnergy', emoji: '◐', title: PALM_LIFE_AREA_TITLES.wellbeingEnergy, leadIn: 'See the rhythm that supports steadier energy, rest and recovery.' }
    ],
    deliverables: [
      'Your strongest rise and what becomes stronger first',
      'Career promotion or business-growth period',
      'Wealth-building and recognition periods',
      'Relationship period and traditional marriage indication',
      'Children and family period with traditional children indication',
      'Energy, rest and recovery pattern',
      'Your next three important periods',
      'Your current phase, simple remedies and what becomes easier with experience'
    ]
  }
};

if (IS_GLOBAL_STOREFRONT) {
  Object.assign(LANES.palm_answers, {
    kicker: 'A private, personalized Palm reflection',
    headline: 'What do the lines in your palm suggest about your natural patterns?',
    subline: 'Begin with a free scan, then explore every clearly visible major line, any pattern that clearly stands out and practical reflection prompts.',
    promises: ['Visible major lines', 'Clearest pattern when supported', 'Practical prompts'],
    landingCta: 'Scan my palm',
    landingPrice: 'Start free · Complete Palm Reading',
    methodLabel: 'Your Complete Palm Reading',
    benefitReminder: 'Your birth details add a clearly labelled sidereal Sun, Moon and rising-sign context without turning reflection into certainty.',
    analysisKicker: 'Building your Complete Palm Reading',
    analysisTitle: 'We are connecting the patterns in your palm.',
    analysisCopy: 'We are reviewing the visible lines in your palm alongside your birth-date context for a grounded, reflective report.',
    analysisStack: 'Heart line · Head line · Life line · Fate line · reflective themes',
    unlockKicker: 'Your Complete Palm Reading is ready',
    unlockTitle: 'Your palm reveals a set of patterns worth exploring.',
    unlockSubline: 'Your clearly visible major lines, any pattern that stands out clearly, birth context and practical prompts are ready.',
    proofLabel: 'Your free Palm insight',
    tension: 'Your line-by-line reflections, any clearly supported standout pattern, birth context and practical prompts are still locked.',
    product: 'Complete Palm Reading',
    payCta: 'Reveal my Complete Palm Reading',
    shareHeading: 'Share one symbolic Palm pattern',
    shareMysteryTitle: 'WHAT DO MY PALM LINES SHOW?',
    shareMysteryBody: 'Which major Palm lines were clear enough to reflect?',
    shareMysteryPrompt: 'What might yours show?',
    shareRevealTitle: 'MY CLEAREST PALM PATTERN',
    shareRevealNote: 'Symbolic Palm reflection',
    shareRevealPrompt: 'What might your visible lines suggest?',
    paywallQuestions: [
      { key: 'visibleLines', emoji: '✋', title: 'Every clearly visible major line', leadIn: 'See a separate symbolic reflection for each line the scan could map responsibly.' },
      { key: 'clearestPattern', emoji: '✦', title: 'A standout pattern—when one is clear', leadIn: 'If one mapped crease is clearly more pronounced, see the reflection linked to it; tied lines are not ranked.' },
      { key: 'birthContext', emoji: '☉', title: 'Clearly labelled birth-chart context', leadIn: 'See sidereal Sun, Moon and rising-sign context where your birth details support it.' },
      { key: 'reflectionPrompts', emoji: '↗', title: 'Grounded reflection prompts', leadIn: 'Try one practical question for each readable pattern and compare it with lived experience.' }
    ],
    deliverables: [
      'A separate reflection for every clearly visible major Palm line',
      'Any clearly supported standout pattern and the visible evidence used',
      'Optional sidereal Sun, Moon and rising-sign context where available',
      'A practical prompt for every readable pattern',
      'A downloadable PDF with the same complete report'
    ]
  });
}

const stage = document.getElementById('stage');
const app = document.getElementById('app');
const backButton = document.getElementById('backButton');
const homeLink = document.getElementById('homeLink');
const freshButton = document.getElementById('freshButton');
const savedReportsButton = document.getElementById('savedReportsButton');
const savedReportsCount = document.getElementById('savedReportsCount');
const topbar = document.getElementById('topbar');
const freshDialog = document.getElementById('freshDialog');
const freshDialogTitle = document.getElementById('freshDialogTitle');
const freshDialogCopy = document.getElementById('freshDialogCopy');
const freshCancel = document.getElementById('freshCancel');
const freshConfirm = document.getElementById('freshConfirm');
const savedReadingsDialog = document.getElementById('savedReadingsDialog');
const savedReadingsClose = document.getElementById('savedReadingsClose');
const savedReadingsContent = document.getElementById('savedReadingsContent');
const palmCameraDialog = document.getElementById('palmCameraDialog');
const palmCameraTitle = document.getElementById('palmCameraTitle');
const palmCameraKicker = palmCameraDialog?.querySelector('.palm-camera-head small');
const palmCameraStage = document.getElementById('palmCameraStage');
const palmCameraVideo = document.getElementById('palmCameraVideo');
const palmCameraStill = document.getElementById('palmCameraStill');
const palmCameraStatus = document.getElementById('palmCameraStatus');
const palmCameraMessage = document.getElementById('palmCameraMessage');
const palmCameraControls = document.getElementById('palmCameraControls');
const palmCameraReview = document.getElementById('palmCameraReview');
const palmCameraCapture = document.getElementById('palmCameraCapture');
const palmCameraSwitch = document.getElementById('palmCameraSwitch');
const palmCameraFallback = document.getElementById('palmCameraFallback');
const palmCameraFallbackInput = document.getElementById('palmCameraFallbackInput');
const palmCameraRetake = document.getElementById('palmCameraRetake');
const palmCameraUse = document.getElementById('palmCameraUse');
const palmCameraClose = document.getElementById('palmCameraClose');
const palmCameraCanvas = document.getElementById('palmCameraCanvas');
let mahakundliCheckoutDockObserver = null;
const faceCameraDialog = document.getElementById('faceCameraDialog');
const faceCameraStage = document.getElementById('faceCameraStage');
const faceCameraVideo = document.getElementById('faceCameraVideo');
const faceCameraStill = document.getElementById('faceCameraStill');
const faceCameraStatus = document.getElementById('faceCameraStatus');
const faceCameraMessage = document.getElementById('faceCameraMessage');
const faceCameraControls = document.getElementById('faceCameraControls');
const faceCameraReview = document.getElementById('faceCameraReview');
const faceCameraCapture = document.getElementById('faceCameraCapture');
const faceCameraSwitch = document.getElementById('faceCameraSwitch');
const faceCameraFallback = document.getElementById('faceCameraFallback');
const faceCameraFallbackInput = document.getElementById('faceCameraFallbackInput');
const faceCameraRetake = document.getElementById('faceCameraRetake');
const faceCameraUse = document.getElementById('faceCameraUse');
const faceCameraClose = document.getElementById('faceCameraClose');
const faceCameraCanvas = document.getElementById('faceCameraCanvas');
const progressBar = document.getElementById('progressBar');
let freshReturnFocus = null;
let palmCameraReturnFocus = null;
let palmCameraStream = null;
let palmCameraPhoto = null;
let palmCameraPhotoUrl = '';
let palmCameraFacing = 'environment';
let palmCameraRequestId = 0;
let palmCameraResumeAfterPicker = false;
let faceCameraReturnFocus = null;
let faceCameraStream = null;
let faceCameraPhoto = null;
let faceCameraPhotoUrl = '';
let faceCameraFacing = 'user';
let faceCameraRequestId = 0;
let faceCameraResumeAfterPicker = false;
let faceLandmarkWorker = null;
let faceLandmarkRequestId = 0;
let activeFaceScanCleanup = null;
const pendingFaceLandmarkRequests = new Map();

function cancelActiveFaceScanPresentation() {
  const cleanup = activeFaceScanCleanup;
  activeFaceScanCleanup = null;
  cleanup?.();
}

function cleanAngle(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
}

function resolveEntry() {
  let normalizedPath = location.pathname.length > 1 ? location.pathname.replace(/\/+$/, '') : location.pathname;
  if (normalizedPath.startsWith('/astroyogi')) {
    normalizedPath = normalizedPath.replace(/^\/astroyogi/, '') || '/';
  }
  const queryA = cleanAngle(QUERY.get('a'));
  const pathAngle = PATH_ALIASES[normalizedPath] || PATH_ALIASES[location.pathname] || '';
  let rawAngle = queryA;
  let source = queryA ? 'query_a' : '';

  if (!rawAngle && pathAngle) {
    rawAngle = pathAngle;
    source = 'path';
  }
  if (!rawAngle) {
    for (const key of ['angle', 'lane', 'utm_content']) {
      const candidate = cleanAngle(QUERY.get(key));
      if (candidate && ANGLE_ALIASES[candidate]) {
        rawAngle = candidate;
        source = `query_${key}`;
        break;
      }
    }
  }

  rawAngle = rawAngle || '_default';
  let resolvedAngle = ANGLE_ALIASES[rawAngle] || '_default';
  if (IS_GLOBAL_STOREFRONT) {
    rawAngle = 'palm_answers';
    resolvedAngle = 'palm_answers';
    source = source || 'storefront_default';
  }
  if (resolvedAngle === 'face_answers' && normalizedPath !== '/face-reading' && normalizedPath !== '/astroyogi/face-reading') {
    rawAngle = '_default';
    resolvedAngle = '_default';
    source = '';
  }
  const privateReturnKeys = new Set([
    'readingId', 'reading_id', 'payment', 'sessionId', 'session_id',
    'analytics_session_id', 'analyticsSessionId', 'paywall_variant', 'paywallVariant',
    'copy_version', 'copyVersion', 'access', 'report_access', 'purchase_token',
    'qa_cross_sell', 'qa_cross_sell_token'
  ]);
  const queryObject = Object.fromEntries([...QUERY.entries()].filter(([key]) => !privateReturnKeys.has(key)));
  const acquisitionIdentity = JSON.stringify(Object.entries(queryObject)
    .filter(([key]) => key === 'fbclid' || key === 'gclid' || key === 'gbraid' || key === 'wbraid' || key === 'a' || key === 'angle' || key === 'lane' || key.startsWith('utm_'))
    .sort(([left], [right]) => left.localeCompare(right)));
  const entryKey = [normalizedPath, rawAngle, resolvedAngle, acquisitionIdentity].join('|');
  return { rawAngle, resolvedAngle, lane: resolvedAngle, source: source || 'default', entryKey, queryObject };
}

function makeId(prefix) {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') return `${prefix}_${window.crypto.randomUUID()}`;
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function savedReadingMatchesReturn(value) {
  const returnedReadingId = String(
    QUERY.get('readingId') || QUERY.get('reading_id') || ''
  ).trim().slice(0, 120);
  if (
    !/^[a-zA-Z0-9_-]{6,120}$/.test(returnedReadingId)
    || String(value?.readingId || '') !== returnedReadingId
  ) return false;
  const normalizedPath = location.pathname.length > 1
    ? location.pathname.replace(/\/+$/, '')
    : location.pathname;
  const returnedRawAngle = cleanAngle(QUERY.get('a')) || PATH_ALIASES[normalizedPath] || '';
  const returnedLane = ANGLE_ALIASES[returnedRawAngle] || '';
  return Boolean(returnedLane && value?.lane === returnedLane);
}

function readSaved(entryKey) {
  try {
    const value = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
    if (!value) return null;
    // Starting from the homepage changes the recovery URL's entry identity when
    // `a=<lane>` is added. Restore only when that URL carries the exact opaque
    // reading id and lane already held by this tab; a copied URL without the
    // matching session state still receives the server-safe generic fallback.
    return value.entryKey === entryKey || savedReadingMatchesReturn(value) ? value : null;
  } catch (_) {
    return null;
  }
}

function hasExternalAcquisition(query = {}) {
  return Object.keys(query).some((key) =>
    key.startsWith('utm_')
    || ['fbclid', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'ttclid', 'ref'].includes(key)
  );
}

function additionalReportContinuationClaims(token) {
  const value = String(token || '').trim().slice(0, 1600);
  const [prefix, encoded, signature, extra] = value.split('.');
  if (
    !['ar1', 'ar2'].includes(prefix)
    || !/^[a-zA-Z0-9_-]+$/.test(encoded || '')
    || !/^[a-zA-Z0-9_-]+$/.test(signature || '')
    || extra
  ) return null;
  try {
    const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
    const padded = `${base64}${'='.repeat((4 - base64.length % 4) % 4)}`;
    const payload = JSON.parse(atob(padded));
    const readingId = String(payload?.readingId || '').trim().slice(0, 120);
    const expiresAt = Number(payload?.exp || 0);
    if (
      ![1, 2].includes(payload?.v)
      || (prefix === 'ar1' && payload.v !== 1)
      || (prefix === 'ar2' && payload.v !== 2)
      || payload.kind !== 'additional_report'
      || !/^[a-zA-Z0-9_-]+$/.test(readingId)
      || !Number.isFinite(expiresAt)
    ) return null;
    return { readingId, expiresAt };
  } catch (_) {
    return null;
  }
}

function additionalReportDirectoryContinuationClaims(token) {
  const value = String(token || '').trim().slice(0, 1800);
  const [prefix, encoded, signature, extra] = value.split('.');
  if (
    prefix !== 'ard1'
    || !/^[a-zA-Z0-9_-]+$/.test(encoded || '')
    || !/^[a-zA-Z0-9_-]+$/.test(signature || '')
    || extra
  ) return null;
  try {
    const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
    const padded = `${base64}${'='.repeat((4 - base64.length % 4) % 4)}`;
    const payload = JSON.parse(atob(padded));
    const readingId = String(payload?.readingId || '').trim().slice(0, 120);
    const expiresAt = Number(payload?.exp || 0);
    if (
      payload?.v !== 1
      || payload.kind !== 'additional_report_directory'
      || !/^[a-zA-Z0-9_-]+$/.test(readingId)
      || !Number.isFinite(expiresAt)
    ) return null;
    return { readingId, expiresAt };
  } catch (_) {
    return null;
  }
}

function additionalReportAttributionClaims(token) {
  const value = String(token || '').trim().slice(0, 1800);
  const [prefix, encoded, signature, extra] = value.split('.');
  if (
    prefix !== 'ara1'
    || !/^[a-zA-Z0-9_-]+$/.test(encoded || '')
    || !/^[a-zA-Z0-9_-]+$/.test(signature || '')
    || extra
  ) return null;
  try {
    const base64 = encoded.replaceAll('-', '+').replaceAll('_', '/');
    const padded = `${base64}${'='.repeat((4 - base64.length % 4) % 4)}`;
    const payload = JSON.parse(atob(padded));
    const readingId = String(payload?.readingId || '').trim().slice(0, 120);
    const sourceLane = String(payload?.sourceLane || '').trim().slice(0, 60);
    const targetLane = String(payload?.targetLane || '').trim().slice(0, 60);
    const expiresAt = Number(payload?.exp || 0);
    if (
      payload?.v !== 1
      || payload.kind !== 'additional_report_attribution'
      || !/^[a-zA-Z0-9_-]+$/.test(readingId)
      || sourceLane !== 'palm_answers'
      || !['partner_name', 'best_city', 'market_profile'].includes(targetLane)
      || !Number.isFinite(expiresAt)
    ) return null;
    return { readingId, sourceLane, targetLane, expiresAt };
  } catch (_) {
    return null;
  }
}

function readAdditionalReportLineage(targetLane) {
  try {
    const value = JSON.parse(sessionStorage.getItem(ADDITIONAL_REPORT_LINEAGE_KEY) || 'null');
    const readingId = String(value?.readingId || '').trim().slice(0, 120);
    const continuationToken = String(value?.continuationToken || '').trim().slice(0, 1600);
    const directoryContinuationToken = String(value?.directoryContinuationToken || '')
      .trim()
      .slice(0, 1800);
    const attributionToken = String(value?.attributionToken || '').trim().slice(0, 1800);
    const continuationClaims = additionalReportContinuationClaims(continuationToken);
    const directoryContinuationClaims = additionalReportDirectoryContinuationClaims(
      directoryContinuationToken
    );
    const attributionClaims = additionalReportAttributionClaims(attributionToken);
    const now = Date.now();
    const expiresAt = Number(
      continuationClaims?.expiresAt
      || directoryContinuationClaims?.expiresAt
      || attributionClaims?.expiresAt
      || 0
    );
    const capabilityCount = [continuationToken, directoryContinuationToken, attributionToken]
      .filter(Boolean).length;
    if (
      !/^[a-zA-Z0-9_-]+$/.test(readingId)
      || capabilityCount !== 1
      || (continuationToken && continuationClaims?.readingId !== readingId)
      || (
        directoryContinuationToken
        && directoryContinuationClaims?.readingId !== readingId
      )
      || (
        attributionToken
        && (
          attributionClaims?.readingId !== readingId
          || attributionClaims?.targetLane !== targetLane
        )
      )
      || expiresAt <= now
      || expiresAt > now + ADDITIONAL_REPORT_CONTINUATION_MAX_TTL_MS + 60_000
    ) {
      sessionStorage.removeItem(ADDITIONAL_REPORT_LINEAGE_KEY);
      return null;
    }
    return {
      readingId,
      continuationToken,
      directoryContinuationToken,
      attributionToken,
      expiresAt,
      lane: String(value?.lane || '').trim().slice(0, 60),
      crossSellIdentity: sanitizeCrossSellIdentity(value?.crossSellIdentity, targetLane),
      reason: ['start_fresh', 'view_other_reports'].includes(value?.reason)
        ? value.reason
        : 'view_other_reports'
    };
  } catch (_) {
    try { sessionStorage.removeItem(ADDITIONAL_REPORT_LINEAGE_KEY); } catch (_) {}
    return null;
  }
}

function internalContinuationUtm(continuation) {
  if (!continuation) return {};
  return {
    utm_source: 'astro_vela',
    utm_medium: 'internal_cross_sell',
    cross_sell_from_lane: continuation.lane,
    cross_sell_reason: continuation.reason
  };
}

function sanitizeAdditionalReportPrefill(raw = {}) {
  const locationValue = raw.location && typeof raw.location === 'object' ? raw.location : null;
  const latitude = Number(locationValue?.latitude);
  const longitude = Number(locationValue?.longitude);
  const location = Number.isFinite(latitude) && Number.isFinite(longitude)
    ? {
        place: String(locationValue.place || locationValue.label || raw.place || '').trim().slice(0, 180),
        label: String(locationValue.label || locationValue.place || raw.place || '').trim().slice(0, 220),
        latitude,
        longitude,
        timezone: String(locationValue.timezone || '').trim().slice(0, 100),
        provider: String(locationValue.provider || 'parent_reading').trim().slice(0, 60)
      }
    : null;
  const birthTime = String(raw.birthTime || '').trim();
  return {
    name: formatName(String(raw.name || '').slice(0, 160)),
    dob: validDob(String(raw.dob || '')) ? String(raw.dob) : '',
    birthTime: birthTime === 'unknown' || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(birthTime)
      ? birthTime
      : 'unknown',
    place: String(raw.place || location?.place || '').trim().slice(0, 180),
    location
  };
}

function sanitizeCrossSellIdentity(raw = {}, expectedTargetLane = '') {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const sourceReadingId = String(
    raw.sourceReadingId || raw.source_reading_id || raw.cross_sell_source_reading_id || ''
  ).trim();
  const sourceLane = String(
    raw.sourceLane || raw.source_lane || raw.cross_sell_source_lane || ''
  ).trim();
  const targetLane = String(
    raw.targetLane || raw.target_lane || raw.cross_sell_target_lane || ''
  ).trim();
  const recommendationVersion = String(
    raw.recommendationVersion
      || raw.recommendation_version
      || raw.cross_sell_recommendation_version
      || ''
  ).trim();
  const recommendationMode = String(
    raw.recommendationMode
      || raw.recommendation_mode
      || raw.cross_sell_recommendation_mode
      || ''
  ).trim();
  const offerCopyVersion = String(
    raw.offerCopyVersion
      || raw.offer_copy_version
      || raw.cross_sell_offer_copy_version
      || ''
  ).trim();
  const presentationVersion = String(
    raw.presentationVersion
      || raw.presentation_version
      || raw.recommendation_presentation_version
      || raw.cross_sell_presentation_version
      || ''
  ).trim();
  const expectedOfferVersions = recommendationMode === 'evergreen_fallback'
    ? PALM_CROSS_SELL_EVERGREEN_OFFER_VERSIONS
    : PALM_CROSS_SELL_TIMED_OFFER_VERSIONS;
  if (
    !/^[a-zA-Z0-9_-]{6,120}$/.test(sourceReadingId)
    || sourceLane !== 'palm_answers'
    || !['partner_name', 'best_city', 'market_profile'].includes(targetLane)
    || (expectedTargetLane && targetLane !== expectedTargetLane)
    || !/^[a-zA-Z0-9_.:-]{1,100}$/.test(recommendationVersion)
    || !['timed', 'evergreen_fallback'].includes(recommendationMode)
    || !expectedOfferVersions.has(offerCopyVersion)
    || presentationVersion !== PALM_NEXT_READING_PRESENTATION_VERSION
  ) return null;
  return {
    sourceReadingId,
    sourceLane,
    targetLane,
    recommendationVersion,
    recommendationMode,
    offerCopyVersion,
    presentationVersion
  };
}

function crossSellIdentityAnalytics(identity) {
  const safe = sanitizeCrossSellIdentity(identity);
  if (!safe) return {};
  return {
    cross_sell_source_reading_id: safe.sourceReadingId,
    cross_sell_source_lane: safe.sourceLane,
    cross_sell_target_lane: safe.targetLane,
    cross_sell_recommendation_version: safe.recommendationVersion,
    cross_sell_recommendation_mode: safe.recommendationMode,
    cross_sell_offer_copy_version: safe.offerCopyVersion,
    cross_sell_presentation_version: safe.presentationVersion
  };
}

function readAdditionalReportPrefill(targetLane) {
  try {
    const raw = JSON.parse(sessionStorage.getItem(ADDITIONAL_REPORT_PREFILL_KEY) || 'null');
    const expiresAt = Number(raw?.expiresAt || 0);
    const normalizedTargetLane = String(raw?.targetLane || '').trim();
    sessionStorage.removeItem(ADDITIONAL_REPORT_PREFILL_KEY);
    if (
      !['best_city', 'partner_name', 'market_profile'].includes(normalizedTargetLane)
      || normalizedTargetLane !== targetLane
      || !Number.isFinite(expiresAt)
      || expiresAt <= Date.now()
      || expiresAt > Date.now() + ADDITIONAL_REPORT_PREFILL_TTL_MS + 60_000
    ) return null;
    const prefill = sanitizeAdditionalReportPrefill(raw.prefill);
    const crossSellIdentity = sanitizeCrossSellIdentity(raw.crossSellIdentity, normalizedTargetLane);
    return {
      version: String(raw.version || 'v1').trim().slice(0, 60),
      sourceLane: String(raw.sourceLane || 'palm_answers').trim().slice(0, 60),
      targetLane: normalizedTargetLane,
      reasonCode: String(raw.reasonCode || '').trim().slice(0, 100),
      suggestedPriority: ['overall', 'career', 'money', 'relationships'].includes(String(raw.suggestedPriority || '').toLowerCase())
        ? String(raw.suggestedPriority).toLowerCase()
        : '',
      reusablePalmAvailable: Boolean(raw.reusablePalmAvailable),
      crossSellIdentity,
      prefill
    };
  } catch (_) {
    try { sessionStorage.removeItem(ADDITIONAL_REPORT_PREFILL_KEY); } catch (_) {}
    return null;
  }
}

const ENTRY = resolveEntry();
const RETURN_READING_ID = String(QUERY.get('readingId') || QUERY.get('reading_id') || '').trim();
const ADDITIONAL_REPORT_PREFILL = readAdditionalReportPrefill(ENTRY.lane);
const ENTRY_HAS_EXTERNAL_ACQUISITION = hasExternalAcquisition(ENTRY.queryObject);
if (ENTRY_HAS_EXTERNAL_ACQUISITION) clearAdditionalReportLineage();
const ADDITIONAL_REPORT_LINEAGE_CANDIDATE = !RETURN_READING_ID && !ENTRY_HAS_EXTERNAL_ACQUISITION
  ? readAdditionalReportLineage(ENTRY.lane)
  : null;
// A freshly issued paid-parent prefill must replace an abandoned draft in the
// target lane; otherwise the old lane session can swallow the new lineage.
// A PII-free recommendation handoff needs the same precedence so a stale
// target-lane draft cannot silently erase verified cross-sell attribution.
// Once that exact handoff has already been persisted into the target draft,
// however, a reload must restore it instead of throwing the customer's work away.
const SAVED_CANDIDATE = readSaved(ENTRY.entryKey);
const CAPABILITY_HANDOFF_REPLACES_SAVED = Boolean(
  (
    ADDITIONAL_REPORT_LINEAGE_CANDIDATE?.attributionToken
    || ADDITIONAL_REPORT_LINEAGE_CANDIDATE?.directoryContinuationToken
  )
  && (
    SAVED_CANDIDATE?.parentReadingId !== ADDITIONAL_REPORT_LINEAGE_CANDIDATE.readingId
    || (
      ADDITIONAL_REPORT_LINEAGE_CANDIDATE.attributionToken
      && SAVED_CANDIDATE?.additionalReportAttributionToken
        !== ADDITIONAL_REPORT_LINEAGE_CANDIDATE.attributionToken
    )
    || (
      ADDITIONAL_REPORT_LINEAGE_CANDIDATE.directoryContinuationToken
      && SAVED_CANDIDATE?.additionalReportDirectoryContinuationToken
        !== ADDITIONAL_REPORT_LINEAGE_CANDIDATE.directoryContinuationToken
    )
  )
);
const SAVED = ADDITIONAL_REPORT_PREFILL || CAPABILITY_HANDOFF_REPLACES_SAVED
  ? null
  : SAVED_CANDIDATE;
const RETURN_PAYMENT = cleanAngle(QUERY.get('payment'));
const RETURN_RAW_ANGLE = cleanAngle(QUERY.get('raw_angle') || QUERY.get('rawAngle'));
const RETURN_ANALYTICS_SESSION_ID = String(QUERY.get('analytics_session_id') || QUERY.get('analyticsSessionId') || '').trim().slice(0, 140);
const RETURN_PALM_PAYWALL_VARIANT = String(QUERY.get('paywall_variant') || QUERY.get('paywallVariant') || '').trim().toLowerCase();
const RETURN_PALM_COPY_VERSION = String(QUERY.get('copy_version') || QUERY.get('copyVersion') || '').trim();
const RETURN_PURCHASE_TRACKING_TOKEN = String(QUERY.get('purchase_token') || '').trim().slice(0, 1800);
let pendingBrowserPurchaseTrackingToken = RETURN_PURCHASE_TRACKING_TOKEN;
if (RETURN_PURCHASE_TRACKING_TOKEN && window.history?.replaceState) {
  const scrubbedReturnUrl = new URL(location.href);
  scrubbedReturnUrl.searchParams.delete('purchase_token');
  history.replaceState(history.state, '', `${scrubbedReturnUrl.pathname}${scrubbedReturnUrl.search}${scrubbedReturnUrl.hash}`);
}
const ADDITIONAL_REPORT_LINEAGE = !SAVED && !RETURN_READING_ID && !ENTRY_HAS_EXTERNAL_ACQUISITION
  ? ADDITIONAL_REPORT_LINEAGE_CANDIDATE
  : null;
// Detected palm points are stored in uploaded-image pixels, so the photo's own
// dimensions have to survive a reload or every overlay lands in the wrong place.
function sanitizePalmImageSize(value) {
  const width = Math.round(Number(value?.width));
  const height = Math.round(Number(value?.height));
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if (width < 1 || height < 1 || width > 20000 || height > 20000) return null;
  return { width, height };
}

// A same-lane tab can contain an older reading. Never let that saved report win
// over the reading explicitly returned by the payment provider.
const RESTORED = RETURN_READING_ID && SAVED?.readingId !== RETURN_READING_ID ? null : SAVED;
const IS_READING_RETURN = RETURN_READING_ID && Boolean(LANES[ENTRY.resolvedAngle]);
const IS_PAID_RETURN = IS_READING_RETURN && RETURN_PAYMENT === 'success';
const IS_CHARITY_GRANT_RETURN = Boolean(
  IS_READING_RETURN
  && !IS_PAID_RETURN
  && ENTRY.resolvedAngle === 'mahakundli'
  && CHARITY_GRANT_QUERY_ACCESS === 'charity'
  && RETURN_READING_ID === CHARITY_GRANT_QUERY_READING_ID
  && RETURN_CHARITY_GRANT_TOKEN
);
const RESTORED_IS_CURRENT = RESTORED?.funnelVersion === FUNNEL_VERSION;
const ACTIVE_ANALYTICS_SESSION_ID = RESTORED?.analyticsSessionId || RETURN_ANALYTICS_SESSION_ID || makeId('av');
const RESTORED_OR_RETURN_PALM_VARIANT = String(RESTORED?.palmPaywallVariant || RETURN_PALM_PAYWALL_VARIANT || '').toLowerCase();
const RESTORED_PALM_COPY_VERSION = String(RESTORED?.palmPaywallCopyVersion || RETURN_PALM_COPY_VERSION || '').trim();
const ACTIVE_PALM_COHORT = resolvePalmPaywallCohort({
  carriedVariant: RESTORED_OR_RETURN_PALM_VARIANT,
  carriedCopyVersion: RESTORED_PALM_COPY_VERSION,
  analyticsSessionId: ACTIVE_ANALYTICS_SESSION_ID
});
const ACTIVE_PALM_PROOF_DENSITY_EXPERIMENT = resolvePalmProofDensityExperiment({
  analyticsSessionId: ACTIVE_ANALYTICS_SESSION_ID,
  paywallVariant: ACTIVE_PALM_COHORT.variant,
  carriedVersion: RESTORED?.palmProofDensityExperimentVersion,
  carriedVariant: RESTORED?.palmProofDensityVariant,
  carriedBucket: RESTORED?.palmProofDensityBucket,
  carriedEligible: RESTORED?.palmProofDensityEligible,
  carriedAllocationPercent: RESTORED?.palmProofDensityAllocationPercent,
  carriedAllocationEpoch: RESTORED?.palmProofDensityAllocationEpoch,
  carriedAssignmentSource: RESTORED?.palmProofDensityAssignmentSource,
  legacySession: Boolean(RESTORED || RETURN_READING_ID)
});
const ACTIVE_PALM_GATEWAY_RECOVERY_EXPERIMENT = resolvePalmGatewayRecoveryExperiment({
  analyticsSessionId: ACTIVE_ANALYTICS_SESSION_ID,
  paywallVariant: ACTIVE_PALM_COHORT.variant,
  carriedVersion: RESTORED?.palmGatewayRecoveryExperimentVersion,
  carriedVariant: RESTORED?.palmGatewayRecoveryVariant,
  carriedBucket: RESTORED?.palmGatewayRecoveryBucket,
  carriedEligible: RESTORED?.palmGatewayRecoveryEligible,
  carriedAllocationPercent: RESTORED?.palmGatewayRecoveryAllocationPercent,
  carriedAllocationEpoch: RESTORED?.palmGatewayRecoveryAllocationEpoch,
  carriedAssignmentSource: RESTORED?.palmGatewayRecoveryAssignmentSource,
  legacySession: Boolean(RESTORED || RETURN_READING_ID)
});
const ACTIVE_MARKET_LANDING_COHORT = resolveMarketLandingCohort({
  analyticsSessionId: ACTIVE_ANALYTICS_SESSION_ID,
  carriedVersion: RESTORED?.marketLandingExperimentVersion,
  carriedVariant: RESTORED?.marketLandingVariant,
  carriedBucket: RESTORED?.marketLandingBucket,
  carriedEligible: RESTORED?.marketLandingEligible,
  carriedAllocationPercent: RESTORED?.marketLandingAllocationPercent,
  legacySession: Boolean(SAVED || RETURN_READING_ID)
});
const ACTIVE_CROSS_SELL_IDENTITY = sanitizeCrossSellIdentity(
  RESTORED?.crossSellIdentity
    || ADDITIONAL_REPORT_PREFILL?.crossSellIdentity
    || ADDITIONAL_REPORT_LINEAGE?.crossSellIdentity,
  RESTORED?.lane || ENTRY.lane
);
const state = {
  entryKey: ENTRY.entryKey,
  rawAngle: IS_GLOBAL_STOREFRONT
    ? 'palm_answers'
    : RESTORED?.rawAngle || RETURN_RAW_ANGLE || ENTRY.rawAngle,
  resolvedAngle: IS_GLOBAL_STOREFRONT
    ? 'palm_answers'
    : RESTORED?.resolvedAngle || ANGLE_ALIASES[RETURN_RAW_ANGLE] || ENTRY.resolvedAngle,
  lane: IS_GLOBAL_STOREFRONT
    ? 'palm_answers'
    : RESTORED?.lane || ANGLE_ALIASES[RETURN_RAW_ANGLE] || ENTRY.lane,
  entrySource: RESTORED?.entrySource || (ADDITIONAL_REPORT_LINEAGE ? 'internal_cross_sell' : ENTRY.source),
  utm: {
    ...internalContinuationUtm(ADDITIONAL_REPORT_LINEAGE),
    ...(RESTORED?.utm || {}),
    ...ENTRY.queryObject
  },
  parentReadingId: RESTORED?.parentReadingId || ADDITIONAL_REPORT_LINEAGE?.readingId || '',
  additionalReportContinuationToken: RESTORED?.additionalReportContinuationToken
    || ADDITIONAL_REPORT_LINEAGE?.continuationToken
    || '',
  additionalReportDirectoryContinuationToken: RESTORED?.additionalReportDirectoryContinuationToken
    || ADDITIONAL_REPORT_LINEAGE?.directoryContinuationToken
    || '',
  additionalReportAttributionToken: RESTORED?.additionalReportAttributionToken
    || ADDITIONAL_REPORT_LINEAGE?.attributionToken
    || '',
  additionalReportContinuationReadingId: RESTORED?.additionalReportContinuationReadingId
    || (
      ADDITIONAL_REPORT_LINEAGE?.continuationToken
      || ADDITIONAL_REPORT_LINEAGE?.attributionToken
        ? ADDITIONAL_REPORT_LINEAGE.readingId
        : ''
    )
    || '',
  additionalReportContinuationExpiresAt: Number(
    RESTORED?.additionalReportContinuationExpiresAt
      || (
        ADDITIONAL_REPORT_LINEAGE?.continuationToken
        || ADDITIONAL_REPORT_LINEAGE?.attributionToken
          ? ADDITIONAL_REPORT_LINEAGE.expiresAt
          : 0
      )
      || 0
  ),
  additionalReportDirectoryContinuationReadingId:
    RESTORED?.additionalReportDirectoryContinuationReadingId
    || (ADDITIONAL_REPORT_LINEAGE?.directoryContinuationToken
      ? ADDITIONAL_REPORT_LINEAGE.readingId
      : ''),
  additionalReportDirectoryContinuationExpiresAt: Number(
    RESTORED?.additionalReportDirectoryContinuationExpiresAt
      || (ADDITIONAL_REPORT_LINEAGE?.directoryContinuationToken
        ? ADDITIONAL_REPORT_LINEAGE.expiresAt
        : 0)
  ),
  parentLane: RESTORED?.parentLane || ADDITIONAL_REPORT_LINEAGE?.lane || '',
  acquisitionJourney: RESTORED?.acquisitionJourney
    || (ADDITIONAL_REPORT_LINEAGE ? 'additional_report' : 'direct'),
  crossSellIdentity: ACTIVE_CROSS_SELL_IDENTITY,
  analyticsSessionId: ACTIVE_ANALYTICS_SESSION_ID,
  palmPaywallVariant: ACTIVE_PALM_COHORT.variant,
  palmPaywallCopyVersion: ACTIVE_PALM_COHORT.copyVersion,
  palmProofDensityExperimentVersion: ACTIVE_PALM_PROOF_DENSITY_EXPERIMENT.version,
  palmProofDensityVariant: ACTIVE_PALM_PROOF_DENSITY_EXPERIMENT.variant,
  palmProofDensityBucket: ACTIVE_PALM_PROOF_DENSITY_EXPERIMENT.bucket,
  palmProofDensityEligible: ACTIVE_PALM_PROOF_DENSITY_EXPERIMENT.eligible,
  palmProofDensityAllocationPercent: ACTIVE_PALM_PROOF_DENSITY_EXPERIMENT.allocationPercent,
  palmProofDensityAllocationEpoch: ACTIVE_PALM_PROOF_DENSITY_EXPERIMENT.allocationEpoch || '',
  palmProofDensityAssignmentSource: ACTIVE_PALM_PROOF_DENSITY_EXPERIMENT.assignmentSource,
  palmGatewayRecoveryExperimentVersion: ACTIVE_PALM_GATEWAY_RECOVERY_EXPERIMENT.version,
  palmGatewayRecoveryVariant: ACTIVE_PALM_GATEWAY_RECOVERY_EXPERIMENT.variant,
  palmGatewayRecoveryBucket: ACTIVE_PALM_GATEWAY_RECOVERY_EXPERIMENT.bucket,
  palmGatewayRecoveryEligible: ACTIVE_PALM_GATEWAY_RECOVERY_EXPERIMENT.eligible,
  palmGatewayRecoveryAllocationPercent: ACTIVE_PALM_GATEWAY_RECOVERY_EXPERIMENT.allocationPercent,
  palmGatewayRecoveryAllocationEpoch: ACTIVE_PALM_GATEWAY_RECOVERY_EXPERIMENT.allocationEpoch || '',
  palmGatewayRecoveryAssignmentSource: ACTIVE_PALM_GATEWAY_RECOVERY_EXPERIMENT.assignmentSource,
  marketLandingExperimentVersion: ACTIVE_MARKET_LANDING_COHORT.version,
  marketLandingVariant: ACTIVE_MARKET_LANDING_COHORT.variant,
  marketLandingBucket: ACTIVE_MARKET_LANDING_COHORT.bucket,
  marketLandingEligible: ACTIVE_MARKET_LANDING_COHORT.eligible,
  marketLandingAllocationPercent: ACTIVE_MARKET_LANDING_COHORT.allocationPercent,
  marketLandingAssignmentSource: ACTIVE_MARKET_LANDING_COHORT.assignmentSource,
  screen: IS_READING_RETURN
    ? 'unlock'
    : (RESTORED?.screen || (ADDITIONAL_REPORT_PREFILL ? 'confirmdetails' : 'intro')),
  answers: RESTORED?.answers || ADDITIONAL_REPORT_PREFILL?.prefill || {},
  additionalReportPrefillVersion: String(
    RESTORED?.additionalReportPrefillVersion
      || ADDITIONAL_REPORT_PREFILL?.version
      || ''
  ).slice(0, 60),
  additionalReportPrefillReasonCode: String(
    RESTORED?.additionalReportPrefillReasonCode
      || ADDITIONAL_REPORT_PREFILL?.reasonCode
      || ''
  ).slice(0, 100),
  additionalReportPrefillConfirmed: Boolean(RESTORED?.additionalReportPrefillConfirmed),
  prefillEditingFields: Array.isArray(RESTORED?.prefillEditingFields)
    ? RESTORED.prefillEditingFields.filter((value) => ['name', 'dob', 'time', 'place'].includes(value))
    : [],
  suggestedCityPriority: String(
    RESTORED?.suggestedCityPriority
      || ADDITIONAL_REPORT_PREFILL?.suggestedPriority
      || ''
  ).toLowerCase(),
  reusableParentPalmAvailable: Boolean(
    RESTORED?.reusableParentPalmAvailable
      || ADDITIONAL_REPORT_PREFILL?.reusablePalmAvailable
  ),
  reuseParentPalm: Boolean(RESTORED?.reuseParentPalm),
  palmDetection: RESTORED?.palmDetection || null,
  palmImageSize: sanitizePalmImageSize(RESTORED?.palmImageSize),
  globalAgeCheckToken: IS_GLOBAL_STOREFRONT
    && Date.parse(String(RESTORED?.globalAgeCheckExpiresAt || '')) > Date.now()
    ? String(RESTORED?.globalAgeCheckToken || '').slice(0, 1800)
    : '',
  globalAgeCheckExpiresAt: IS_GLOBAL_STOREFRONT
    && Date.parse(String(RESTORED?.globalAgeCheckExpiresAt || '')) > Date.now()
    ? String(RESTORED?.globalAgeCheckExpiresAt || '')
    : '',
  globalAgeCheckLoading: false,
  globalAgeCheckError: '',
  faceAnalysis: RESTORED?.faceAnalysis || null,
  faceReportType: RESTORED?.faceReportType === 'holistic'
    ? 'holistic'
    : RESTORED?.faceReportType === 'personality'
      ? 'personality'
      : ['dob', 'time', 'place', 'name', 'analysis', 'unlock'].includes(RESTORED?.screen)
        ? 'holistic'
        : 'personality',
  readingId: IS_READING_RETURN ? RETURN_READING_ID : (RESTORED?.readingId || null),
  preview: RESTORED_IS_CURRENT ? (RESTORED?.preview || null) : null,
  full: RESTORED_IS_CURRENT ? (RESTORED?.full || null) : null,
  pendingInvoice: RESTORED_IS_CURRENT ? (RESTORED?.pendingInvoice || null) : null,
  pricing: RESTORED?.readingId && RESTORED?.pricing ? RESTORED.pricing : RUNTIME_PRICING,
  shareCode: RESTORED?.shareCode || makeId('shr').replace(/[^a-z0-9_-]/gi, '').slice(0, 64),
  shareResultVisible: Boolean(RESTORED?.shareResultVisible),
  // A success query parameter is only a hint from the return URL. The
  // protected full-report endpoint is the authority for paid access.
  paid: Boolean(RESTORED?.paid),
  deliveryAccessType: RESTORED?.deliveryAccessType === 'charity_grant'
    && RETURN_CHARITY_GRANT_TOKEN
    ? 'charity_grant'
    : '',
  flags: {
    landingView: false,
    firstTap: false,
    quizStart: false,
    palmUploaded: false,
    palmDockClick: false,
    palmPaywallEvidenceClick: false,
    palmResultCtaView: false,
    palmOfferView: false,
    birthComplete: false,
    unlockView: false,
    beginCheckout: false,
    purchase: false,
    sharePromptView: false,
    ...(RESTORED?.flags || {})
  },
  eventSeq: Number(RESTORED?.eventSeq || 0),
  startedAt: Number(RESTORED?.startedAt || Date.now()),
  screenStartedAt: Date.now(),
  lastScreenKey: '',
  birthTimeDraft: RESTORED?.birthTimeDraft && typeof RESTORED.birthTimeDraft === 'object' ? RESTORED.birthTimeDraft : null,
  placeSuggestions: [],
  placeTimer: null,
  placeLookupStatus: 'idle',
  palmFile: null,
  palmPreviewUrl: '',
  palmUploadError: '',
  scanRunId: '',
  faceFile: null,
  facePreviewUrl: '',
  faceOverlayUrl: '',
  faceImageSize: null,
  faceUploadError: '',
  faceScanRunId: '',
  analysisRunning: false,
  checkoutLoading: false,
  faceCheckoutPreparing: false,
  fullLoading: false,
  paymentError: '',
  analysisError: '',
  emailSaved: Boolean(RESTORED?.emailSaved),
  pendingVerification: RESTORED?.pendingVerification || null,
  metaPurchaseEventId: RESTORED?.metaPurchaseEventId || '',
  activePaymentId: RESTORED?.activePaymentId || '',
  checkoutAttemptNumber: Math.max(0, Math.floor(Number(RESTORED?.checkoutAttemptNumber || 0))),
  paymentDismissRecovery: sanitizePaymentDismissRecovery(RESTORED?.paymentDismissRecovery),
  palmNameAlignmentSelected: typeof RESTORED?.palmNameAlignmentSelected === 'boolean'
    ? RESTORED.palmNameAlignmentSelected
    : null,
  palmNameAlignmentSelectionKey: String(RESTORED?.palmNameAlignmentSelectionKey || ''),
  checkoutAddons: Array.isArray(RESTORED?.checkoutAddons)
    ? RESTORED.checkoutAddons.filter((value) => value === PALM_NAME_ALIGNMENT_ADDON_KEY)
    : [],
  checkoutAuthoritativeValue: Number(RESTORED?.checkoutAuthoritativeValue || 0),
  checkoutQuoteVersion: String(RESTORED?.checkoutQuoteVersion || ''),
  checkoutGstRateBps: Number(RESTORED?.checkoutGstRateBps || 0),
  checkoutPlacement: String(RESTORED?.checkoutPlacement || '').slice(0, 24),
  cashfreeFallbackOpen: Boolean(RESTORED?.cashfreeFallbackOpen)
};
let analysisRequestController = null;
let analysisRequestCancelledForNavigation = false;

function activeMahakundliCharityGrantToken() {
  if (
    state.lane !== 'mahakundli'
    || state.readingId !== CHARITY_GRANT_QUERY_READING_ID
    || (!IS_CHARITY_GRANT_RETURN && state.deliveryAccessType !== 'charity_grant')
  ) return '';
  return RETURN_CHARITY_GRANT_TOKEN;
}

function isCharityGrantAccess() {
  return state.deliveryAccessType === 'charity_grant'
    && Boolean(activeMahakundliCharityGrantToken());
}

function isCharityGrantSession() {
  return IS_CHARITY_GRANT_RETURN || isCharityGrantAccess();
}

function hasFullReportAccess() {
  return state.paid || isCharityGrantAccess();
}

function hasCharityGrantDelivery(full) {
  return String(full?.deliveryAccess?.type || '') === 'charity_grant';
}

function charityGrantFullFetchOptions(token) {
  const normalizedToken = normalizedCharityGrantToken(token);
  return normalizedToken
    ? { headers: { 'X-Astro-Reading-Grant': normalizedToken } }
    : {};
}

function charityGrantCustomerFull(full = {}) {
  const {
    payment: _payment,
    invoice: _invoice,
    purchase: _purchase,
    entitlements: _entitlements,
    purchaseTracking: _purchaseTracking,
    nextReadingRecommendation: _nextReadingRecommendation,
    additionalReportContinuationToken: _additionalReportContinuationToken,
    additionalReportDirectoryContinuationToken: _additionalReportDirectoryContinuationToken,
    additionalReportAttributionToken: _additionalReportAttributionToken,
    ...customerFull
  } = full || {};
  return customerFull;
}

// A report return URL must refresh from the paid endpoint before displaying a
// locally restored full report. This keeps repaired or regenerated reports
// current for customers who reopen the same link in an existing browser.
let paidReturnRefreshPending = Boolean(IS_READING_RETURN);

if (!FLOWS[state.lane]) {
  state.lane = '_default';
  state.resolvedAngle = '_default';
  state.screen = 'intro';
}
if (
  LOCAL_NEXT_READING_CONFIRM_PREVIEW
  && ['best_city', 'partner_name', 'market_profile'].includes(state.lane)
) {
  state.screen = 'confirmdetails';
  state.answers = {
    name: 'Aarav Mehta',
    dob: '1990-04-12',
    birthTime: '09:30',
    place: 'New Delhi, Delhi, India',
    location: {
      place: 'New Delhi, Delhi, India',
      label: 'New Delhi, Delhi, India',
      latitude: 28.6139,
      longitude: 77.209,
      timezone: 'Asia/Kolkata',
      provider: 'local_preview'
    }
  };
  state.additionalReportPrefillVersion = 'palm_next_reading_v1';
  state.additionalReportPrefillReasonCode = state.lane === 'best_city'
    ? 'career_wealth_period_near'
    : state.lane === 'partner_name'
      ? 'relationship_family_period_near'
      : 'wealth_period_near';
  state.suggestedCityPriority = state.lane === 'best_city' ? 'career' : '';
  state.reusableParentPalmAvailable = state.lane === 'market_profile';
  state.parentReadingId = 'local-preview-parent';
  state.crossSellIdentity = sanitizeCrossSellIdentity({
    sourceReadingId: 'local-preview-parent',
    sourceLane: 'palm_answers',
    targetLane: state.lane,
    recommendationVersion: 'palm_next_reading_v1',
    recommendationMode: 'timed',
    offerCopyVersion: PALM_NEXT_READING_TIMED_OFFER_VERSION,
    presentationVersion: PALM_NEXT_READING_PRESENTATION_VERSION
  }, state.lane);
  document.title = 'Next Reading Confirmation — Local Review';
}
if (ADDITIONAL_REPORT_PREFILL) {
  const missingPrefillFields = [
    !formatName(state.answers.name) ? 'name' : '',
    !validDob(state.answers.dob) ? 'dob' : '',
    state.answers.location?.latitude == null ? 'place' : ''
  ].filter(Boolean);
  state.prefillEditingFields = [...new Set([...state.prefillEditingFields, ...missingPrefillFields])];
}
// Keep people who started the previous, longer funnel moving forward. Removed
// screens should never throw a warm paid-ad visitor back to the landing page.
if (state.lane === 'best_city' && state.screen === 'currentcity') state.screen = 'scope';
if (state.lane === 'best_city' && ['card', 'palmoffer', 'palmupload', 'palmscan', 'palmproof'].includes(state.screen)) state.screen = 'analysis';
if (['partner_name', 'palm_answers'].includes(state.lane) && state.screen === 'card') state.screen = 'analysis';
if (state.lane === 'palm_answers' && state.screen === 'palmbridge') state.screen = 'dob';
if (!flow().includes(state.screen)) state.screen = 'intro';
if (state.lane === 'palm_answers' && state.screen === 'palmscan' && !state.palmDetection) {
  state.screen = IS_GLOBAL_STOREFRONT ? 'palmupload' : 'intro';
}
if (
  IS_GLOBAL_STOREFRONT
  && !IS_READING_RETURN
  && !['intro', 'dob'].includes(state.screen)
  && (
    !state.globalAgeCheckToken
    || Date.parse(state.globalAgeCheckExpiresAt || '') <= Date.now()
  )
) {
  state.screen = 'dob';
  state.palmDetection = null;
}
if (state.lane === 'face_answers' && state.screen === 'facescan' && !state.faceFile && !state.faceAnalysis) state.screen = 'intro';
state.placeLookupStatus = hasResolvedBirthplace()
  ? 'selected'
  : hasUsableTypedBirthplace()
    ? 'pending'
    : 'idle';

function sessionSafeAnswers() {
  if (!state.answers || typeof state.answers !== 'object') return {};
  if (!IS_GLOBAL_STOREFRONT) return state.answers;
  const answers = { ...state.answers };
  delete answers.paymentEmail;
  delete answers.residence;
  return answers;
}

function serializableState() {
  return {
    funnelVersion: FUNNEL_VERSION,
    entryKey: state.entryKey,
    rawAngle: state.rawAngle,
    resolvedAngle: state.resolvedAngle,
    lane: state.lane,
    entrySource: state.entrySource,
    utm: state.utm,
    parentReadingId: state.parentReadingId,
    additionalReportContinuationToken: state.additionalReportContinuationToken,
    additionalReportDirectoryContinuationToken: state.additionalReportDirectoryContinuationToken,
    additionalReportAttributionToken: state.additionalReportAttributionToken,
    additionalReportContinuationReadingId: state.additionalReportContinuationReadingId,
    additionalReportContinuationExpiresAt: state.additionalReportContinuationExpiresAt,
    additionalReportDirectoryContinuationReadingId:
      state.additionalReportDirectoryContinuationReadingId,
    additionalReportDirectoryContinuationExpiresAt:
      state.additionalReportDirectoryContinuationExpiresAt,
    parentLane: state.parentLane,
    acquisitionJourney: state.acquisitionJourney,
    crossSellIdentity: sanitizeCrossSellIdentity(state.crossSellIdentity, state.lane),
    analyticsSessionId: state.analyticsSessionId,
    palmPaywallVariant: state.palmPaywallVariant,
    palmPaywallCopyVersion: state.palmPaywallCopyVersion,
    palmProofDensityExperimentVersion: state.palmProofDensityExperimentVersion,
    palmProofDensityVariant: state.palmProofDensityVariant,
    palmProofDensityBucket: state.palmProofDensityBucket,
    palmProofDensityEligible: state.palmProofDensityEligible,
    palmProofDensityAllocationPercent: state.palmProofDensityAllocationPercent,
    palmProofDensityAllocationEpoch: state.palmProofDensityAllocationEpoch,
    palmProofDensityAssignmentSource: state.palmProofDensityAssignmentSource,
    palmGatewayRecoveryExperimentVersion: state.palmGatewayRecoveryExperimentVersion,
    palmGatewayRecoveryVariant: state.palmGatewayRecoveryVariant,
    palmGatewayRecoveryBucket: state.palmGatewayRecoveryBucket,
    palmGatewayRecoveryEligible: state.palmGatewayRecoveryEligible,
    palmGatewayRecoveryAllocationPercent: state.palmGatewayRecoveryAllocationPercent,
    palmGatewayRecoveryAllocationEpoch: state.palmGatewayRecoveryAllocationEpoch,
    palmGatewayRecoveryAssignmentSource: state.palmGatewayRecoveryAssignmentSource,
    marketLandingExperimentVersion: state.marketLandingExperimentVersion,
    marketLandingVariant: state.marketLandingVariant,
    marketLandingBucket: state.marketLandingBucket,
    marketLandingEligible: state.marketLandingEligible,
    marketLandingAllocationPercent: state.marketLandingAllocationPercent,
    marketLandingAssignmentSource: state.marketLandingAssignmentSource,
    screen: state.screen,
    answers: sessionSafeAnswers(),
    additionalReportPrefillVersion: state.additionalReportPrefillVersion,
    additionalReportPrefillReasonCode: state.additionalReportPrefillReasonCode,
    additionalReportPrefillConfirmed: state.additionalReportPrefillConfirmed,
    prefillEditingFields: state.prefillEditingFields,
    suggestedCityPriority: state.suggestedCityPriority,
    reusableParentPalmAvailable: state.reusableParentPalmAvailable,
    reuseParentPalm: state.reuseParentPalm,
    palmDetection: state.palmDetection,
    palmImageSize: state.palmImageSize,
    globalAgeCheckToken: state.globalAgeCheckToken,
    globalAgeCheckExpiresAt: state.globalAgeCheckExpiresAt,
    faceAnalysis: state.faceAnalysis,
    faceReportType: state.faceReportType,
    readingId: state.readingId,
    preview: state.preview,
    full: state.full,
    pendingInvoice: state.pendingInvoice,
    pricing: state.pricing,
    shareCode: state.shareCode,
    shareResultVisible: state.shareResultVisible,
    paid: state.paid,
    deliveryAccessType: state.deliveryAccessType,
    flags: state.flags,
    eventSeq: state.eventSeq,
    startedAt: state.startedAt,
    birthTimeDraft: state.birthTimeDraft,
    emailSaved: state.emailSaved,
    pendingVerification: state.pendingVerification,
    metaPurchaseEventId: state.metaPurchaseEventId,
    activePaymentId: state.activePaymentId,
    checkoutAttemptNumber: state.checkoutAttemptNumber,
    paymentDismissRecovery: sanitizePaymentDismissRecovery(state.paymentDismissRecovery),
    palmNameAlignmentSelected: state.palmNameAlignmentSelected,
    palmNameAlignmentSelectionKey: state.palmNameAlignmentSelectionKey,
    checkoutAddons: state.checkoutAddons,
    checkoutAuthoritativeValue: state.checkoutAuthoritativeValue,
    checkoutQuoteVersion: state.checkoutQuoteVersion,
    checkoutGstRateBps: state.checkoutGstRateBps,
    checkoutPlacement: state.checkoutPlacement,
    cashfreeFallbackOpen: state.cashfreeFallbackOpen
  };
}

function persist() {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serializableState()));
    const continuationClaims = additionalReportContinuationClaims(
      state.additionalReportContinuationToken
    );
    const directoryContinuationClaims = additionalReportDirectoryContinuationClaims(
      state.additionalReportDirectoryContinuationToken
    );
    const attributionClaims = additionalReportAttributionClaims(
      state.additionalReportAttributionToken
    );
    if (
      state.parentReadingId
      && (
        continuationClaims?.readingId === state.parentReadingId
        || directoryContinuationClaims?.readingId === state.parentReadingId
        || attributionClaims?.readingId === state.parentReadingId
      )
    ) clearAdditionalReportLineage();
  } catch (_) {}
}

function lanePath(lane = state.lane) {
  if (IS_GLOBAL_STOREFRONT && lane === 'palm_answers') return '/';
  return { mahakundli: '/mahakundli', best_city: '/best-city', partner_name: '/partner-name', palm_answers: '/palm-answers', face_answers: '/face-reading', name_numerology: '/name-numerology', market_profile: '/market-profile' }[lane] || '/';
}

function nextReadingDestination(lane) {
  const destination = new URL(lanePath(lane), location.origin);
  return `${destination.pathname}${destination.search}`;
}

function readRecoveryStorage() {
  try {
    const durable = localStorage.getItem(PAID_HISTORY_KEY);
    if (durable) return durable;
  } catch (_) {}
  try { return sessionStorage.getItem(PAID_HISTORY_KEY) || '[]'; } catch (_) { return '[]'; }
}

function writeRecoveryStorage(value) {
  try {
    localStorage.setItem(PAID_HISTORY_KEY, value);
    return;
  } catch (_) {}
  try { sessionStorage.setItem(PAID_HISTORY_KEY, value); } catch (_) {}
}

let verifiedPaidHistory = [];
let previousPaidHistoryLoading = false;
let previousPaidHistoryLoaded = false;
let previousPaidHistorySettled = false;
let previousPaidHistoryVerified = false;

function readPaidHistory() {
  try {
    const parsed = JSON.parse(readRecoveryStorage());
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - PAID_HISTORY_TTL_MS;
    const valid = parsed.filter((item) => {
      const savedAt = new Date(item?.savedAt || 0).getTime();
      return item
        && LANES[item.lane]
        && /^[a-z0-9_-]{6,120}$/i.test(String(item.readingId || ''))
        && Number.isFinite(savedAt)
        && savedAt >= cutoff;
    }).map((item) => ({
      readingId: String(item.readingId),
      lane: item.lane,
      savedAt: item.savedAt,
      status: item.status === 'pending' ? 'pending' : 'paid'
    })).slice(0, PAID_HISTORY_LIMIT);
    writeRecoveryStorage(JSON.stringify(valid));
    return valid;
  } catch (_) {
    return [];
  }
}

function rememberRecoveryReading(status = 'pending') {
  if (!state.readingId || !LANES[state.lane]) return;
  try {
    const history = readPaidHistory();
    const existing = history.find((item) => item.readingId === state.readingId);
    const current = history.filter((item) => item.readingId !== state.readingId);
    const next = [{
      readingId: state.readingId,
      lane: state.lane,
      savedAt: existing?.savedAt || new Date().toISOString(),
      status: status === 'paid' ? 'paid' : 'pending'
    }, ...current]
      .sort((left, right) => new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime())
      .slice(0, PAID_HISTORY_LIMIT);
    writeRecoveryStorage(JSON.stringify(next));
  } catch (_) {}
}

function rememberPaidReading() {
  // Keep the recovery pointer as soon as payment is verified. The full report
  // may still be generating, but the paid reading must remain reopenable.
  if (!state.paid || !state.readingId || !LANES[state.lane]) return;
  rememberRecoveryReading('paid');
}

function latestPaidReading(lane = state.lane) {
  const history = combinedPaidHistory();
  return history.find((item) => item.status === 'paid' && (lane === '_default' || item.lane === lane)) || null;
}

function pendingRecoveryCandidates(lane = state.lane) {
  const pending = readPaidHistory().filter((item) => item.status === 'pending');
  if (!state.readingId) return pending.slice(0, 3);
  return [
    ...pending.filter((item) => item.readingId === state.readingId),
    ...pending.filter((item) => item.readingId !== state.readingId && item.lane === lane),
    ...pending.filter((item) => item.readingId !== state.readingId && item.lane !== lane)
  ].slice(0, 3);
}

function combinedPaidHistory() {
  if (isCharityGrantSession()) return [];
  const merged = new Map();
  for (const item of readPaidHistory()) merged.set(item.readingId, item);
  for (const item of verifiedPaidHistory) {
    const existing = merged.get(item.readingId);
    merged.set(item.readingId, {
      ...existing,
      ...item,
      status: item.status === 'pending' ? 'pending' : 'paid',
      savedAt: item.savedAt || existing?.savedAt || new Date().toISOString()
    });
  }
  return [...merged.values()]
    .filter((item) => item.readingId !== state.readingId)
    .sort((left, right) => new Date(right.savedAt).getTime() - new Date(left.savedAt).getTime())
    .slice(0, PAID_HISTORY_LIMIT);
}

function paidHistoryDate(value) {
  const date = new Date(value || 0);
  if (!Number.isFinite(date.getTime())) return 'Saved reading';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  } catch (_) {
    return date.toISOString().slice(0, 10);
  }
}

function previousReadingRowMarkup(item) {
  const product = LANES[item.lane]?.product || 'Paid report';
  const status = item.status === 'pending' ? 'Payment pending' : 'Paid';
  return `<button class="previous-reading-row" type="button" data-action="open-previous-reading" data-reading-id="${escapeHtml(item.readingId)}" data-lane="${escapeHtml(item.lane)}">
    <span><b>${escapeHtml(product)}</b><small>${escapeHtml(paidHistoryDate(item.savedAt))} · ${status}</small></span><i aria-hidden="true">›</i>
  </button>`;
}

function previousReadingsShelfMarkup() {
  const readings = combinedPaidHistory();
  if (!readings.length) return '';
  if (readings.length === 1) {
    return `<section class="previous-readings previous-readings--single" data-testid="previous-readings">
      <div class="previous-readings__head"><small>Your previous reading</small><b>Continue where you left off</b></div>
      ${previousReadingRowMarkup(readings[0])}
    </section>`;
  }
  return `<details class="previous-readings" data-testid="previous-readings">
    <summary><span><small>Your saved reports</small><b>Your previous readings (${readings.length})</b></span><i aria-hidden="true">⌄</i></summary>
    <div class="previous-readings__list">${readings.map(previousReadingRowMarkup).join('')}</div>
  </details>`;
}

function previousPaidReportMarkup() {
  if (state.lane === 'palm_answers') return '';
  return `<div class="previous-readings-host" id="previousReadingsHost">${previousReadingsShelfMarkup()}</div>`;
}

function updateSavedReportsHeader() {
  if (!savedReportsButton) return;
  const count = combinedPaidHistory().length;
  savedReportsButton.hidden = count === 0;
  topbar?.classList.toggle('has-saved-reports', count > 0);
  if (savedReportsCount) {
    savedReportsCount.hidden = count === 0;
    savedReportsCount.textContent = count ? String(count) : '';
  }
  const label = count === 0
    ? 'Open my saved reports'
    : `Open my ${count} saved report${count === 1 ? '' : 's'}`;
  savedReportsButton.setAttribute('aria-label', label);
}

function renderSavedReadingsDialog() {
  if (!savedReadingsContent) return;
  const readings = combinedPaidHistory();
  savedReadingsContent.innerHTML = readings.length
    ? `<div class="saved-readings-list">${readings.map(previousReadingRowMarkup).join('')}</div>`
    : '<p class="saved-readings-empty">No saved reports on this device yet.</p>';
}

function openSavedReadingsDialog() {
  renderSavedReadingsDialog();
  if (typeof savedReadingsDialog?.showModal === 'function') savedReadingsDialog.showModal();
}

function closeSavedReadingsDialog() {
  if (savedReadingsDialog?.open) savedReadingsDialog.close();
}

function refreshPreviousReadingSurfaces() {
  const host = document.getElementById('previousReadingsHost');
  if (host) host.innerHTML = previousReadingsShelfMarkup();
  setupPreviousReadingsExposure();
  refreshNextReadingRecommendationCard();
  updateSavedReportsHeader();
  if (savedReadingsDialog?.open) renderSavedReadingsDialog();
}

let previousReadingsObserver = null;

function setupPreviousReadingsExposure() {
  previousReadingsObserver?.disconnect?.();
  previousReadingsObserver = null;
  const shelf = stage.querySelector('[data-testid="previous-readings"]');
  if (!shelf || state.flags.previousReadingsView) return;
  const recordView = () => {
    if (state.flags.previousReadingsView) return;
    trackOnce('previousReadingsView', 'previous_readings_view', {
      reading_count: combinedPaidHistory().length,
      lanes: [...new Set(combinedPaidHistory().map((item) => item.lane))].join(',')
    });
  };
  if (typeof IntersectionObserver !== 'function') {
    recordView();
    return;
  }
  previousReadingsObserver = new IntersectionObserver((entries, observer) => {
    if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
    recordView();
    observer.disconnect();
  }, { threshold: [0.5] });
  previousReadingsObserver.observe(shelf);
}

function normalizeVerifiedPreviousPaidHistoryResponse(body) {
  if (
    body?.version !== 'previous_paid_readings_v1'
    || !Array.isArray(body?.readings)
    || body.readings.length > PAID_HISTORY_LIMIT
  ) return null;
  const readings = [];
  for (const item of body.readings) {
    const readingId = String(item?.readingId || '').trim();
    const lane = String(item?.lane || '').trim();
    const status = String(item?.status || 'paid').trim();
    const paidAt = String(item?.paidAt || '').trim();
    if (
      !LANES[lane]
      || !/^[a-z0-9_-]{6,120}$/i.test(readingId)
      || !['paid', 'pending'].includes(status)
      || !Number.isFinite(Date.parse(paidAt))
    ) return null;
    readings.push({
      readingId,
      lane,
      savedAt: paidAt,
      status: status === 'pending' ? 'pending' : 'paid'
    });
  }
  return readings;
}

async function loadPreviousPaidHistory() {
  if (isCharityGrantSession()) {
    previousPaidHistorySettled = true;
    previousPaidHistoryVerified = false;
    return;
  }
  if (previousPaidHistoryLoading || previousPaidHistorySettled) return;
  previousPaidHistoryLoading = true;
  previousPaidHistoryVerified = false;
  try {
    let lastError = null;
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const body = await getJson('/api/readings/previous-paid');
        const normalized = normalizeVerifiedPreviousPaidHistoryResponse(body);
        if (!normalized) throw new Error('Previous-paid ownership response was not verifiable.');
        verifiedPaidHistory = normalized;
        previousPaidHistoryLoaded = true;
        previousPaidHistoryVerified = true;
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        if (attempt < 2) {
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
      }
    }
    if (lastError) throw lastError;
  } catch (_) {
    // Recovery links may still use local opaque pointers, but a commercial
    // recommendation must never infer eligibility from a failed lookup.
    verifiedPaidHistory = [];
    previousPaidHistoryLoaded = false;
    previousPaidHistoryVerified = false;
  } finally {
    previousPaidHistoryLoading = false;
    previousPaidHistorySettled = true;
    refreshPreviousReadingSurfaces();
  }
}

function openPreviousPaidReport(readingId = '', lane = '') {
  const normalizedReadingId = String(readingId || '').trim();
  const previous = combinedPaidHistory().find((item) =>
    item.readingId === normalizedReadingId
    && (!lane || item.lane === lane)
  ) || latestPaidReading();
  if (!previous) return;
  track('previous_paid_report_opened', {
    previous_lane: previous.lane,
    previous_status: previous.status
  });
  const url = new URL(lanePath(previous.lane), location.origin);
  url.searchParams.set('readingId', previous.readingId);
  url.searchParams.set('payment', 'success');
  location.assign(`${url.pathname}${url.search}`);
}

let pendingRecoveryStarted = false;

async function recoverPendingPaidReading() {
  if (pendingRecoveryStarted || IS_READING_RETURN) return;
  const candidates = pendingRecoveryCandidates();
  if (!candidates.length) return;
  pendingRecoveryStarted = true;
  for (const pending of candidates) {
    try {
      const full = await getJson(`/api/reading/${encodeURIComponent(pending.readingId)}/full`);
      if (!full) continue;
      track('payment_recovered', { provider: 'server', recovery_source: 'durable_browser_pointer' });
      const url = new URL(lanePath(pending.lane), location.origin);
      url.searchParams.set('readingId', pending.readingId);
      url.searchParams.set('payment', 'success');
      location.replace(`${url.pathname}${url.search}`);
      return;
    } catch (_) {
      // Abandoned and still-pending orders stay silent. Check the remaining
      // opaque pointers because a newer abandoned checkout must not hide a
      // different report that the payment provider has already confirmed.
    }
  }
}

function clearActiveReading() {
  analysisRequestCancelledForNavigation = true;
  analysisRequestController?.abort();
  analysisRequestController = null;
  state.analysisRunning = false;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
}

function rememberAdditionalReportLineage(reason) {
  const claims = additionalReportContinuationClaims(state.additionalReportContinuationToken);
  if (
    !state.paid
    || !state.readingId
    || state.additionalReportContinuationReadingId !== state.readingId
    || claims?.readingId !== state.readingId
    || claims.expiresAt <= Date.now()
  ) return false;
  try {
    sessionStorage.setItem(ADDITIONAL_REPORT_LINEAGE_KEY, JSON.stringify({
      readingId: String(state.readingId).slice(0, 120),
      continuationToken: String(state.additionalReportContinuationToken).slice(0, 1600),
      expiresAt: claims.expiresAt,
      lane: String(state.lane || '').slice(0, 60),
      reason,
      createdAt: Date.now()
    }));
    return true;
  } catch (_) {
    return false;
  }
}

function rememberAdditionalReportDirectoryLineage(reason) {
  const claims = additionalReportDirectoryContinuationClaims(
    state.additionalReportDirectoryContinuationToken
  );
  if (
    !state.paid
    || !state.readingId
    || state.additionalReportDirectoryContinuationReadingId !== state.readingId
    || claims?.readingId !== state.readingId
    || claims.expiresAt <= Date.now()
  ) return false;
  try {
    sessionStorage.setItem(ADDITIONAL_REPORT_LINEAGE_KEY, JSON.stringify({
      readingId: String(state.readingId).slice(0, 120),
      directoryContinuationToken: String(
        state.additionalReportDirectoryContinuationToken
      ).slice(0, 1800),
      expiresAt: claims.expiresAt,
      lane: String(state.lane || '').slice(0, 60),
      reason,
      createdAt: Date.now()
    }));
    return true;
  } catch (_) {
    return false;
  }
}

function rememberAdditionalReportAttributionLineage(recommendation, reason) {
  const claims = additionalReportAttributionClaims(state.additionalReportAttributionToken);
  if (
    !state.paid
    || !state.readingId
    || !recommendation
    || claims?.readingId !== state.readingId
    || claims.sourceLane !== recommendation.sourceLane
    || claims.targetLane !== recommendation.targetLane
    || claims.expiresAt <= Date.now()
  ) return false;
  const crossSellIdentity = sanitizeCrossSellIdentity(
    nextReadingRecommendationTracking(recommendation),
    recommendation.targetLane
  );
  if (!crossSellIdentity) return false;
  try {
    sessionStorage.setItem(ADDITIONAL_REPORT_LINEAGE_KEY, JSON.stringify({
      readingId: String(state.readingId).slice(0, 120),
      attributionToken: String(state.additionalReportAttributionToken).slice(0, 1800),
      expiresAt: claims.expiresAt,
      lane: String(state.lane || '').slice(0, 60),
      crossSellIdentity,
      reason,
      createdAt: Date.now()
    }));
    return true;
  } catch (_) {
    return false;
  }
}

function clearAdditionalReportLineage() {
  try { sessionStorage.removeItem(ADDITIONAL_REPORT_LINEAGE_KEY); } catch (_) {}
}

let additionalReportNavigationAttempt = 0;
let additionalReportNavigationPending = false;

function paymentNavigationBlocked() {
  return Boolean(
    state.checkoutLoading
    || state.pendingVerification
    || state.fullLoading
    || additionalReportNavigationPending
    || (IS_PAID_RETURN && !state.paid)
  );
}

function closeFreshDialog({ cancelled = false } = {}) {
  if (!freshDialog) return;
  if (additionalReportNavigationPending) {
    additionalReportNavigationAttempt += 1;
    setAdditionalReportNavigationPending(false);
  }
  if (cancelled) track('start_fresh_cancelled', { from_screen: state.screen, paid: state.paid ? 'yes' : 'no' });
  if (typeof freshDialog.close === 'function' && freshDialog.open) freshDialog.close();
  else freshDialog.removeAttribute('open');
  freshReturnFocus?.focus?.({ preventScroll: true });
  freshReturnFocus = null;
}

function openFreshDialog() {
  if (paymentNavigationBlocked()) {
    track('start_fresh_blocked', { reason: 'payment_verification' });
    return;
  }
  track('start_fresh_click', {
    from_screen: state.screen,
    paid: state.paid ? 'yes' : 'no',
    had_reading: state.readingId ? 'yes' : 'no'
  });
  const product = LANES[state.lane]?.product || 'PalmQ IND report';
  if (freshDialogTitle) freshDialogTitle.textContent = state.paid ? 'Start another report?' : 'Start over?';
  if (freshDialogCopy) freshDialogCopy.textContent = state.paid
    ? `You can reopen this report on this device. The new ${product} will start with blank answers.`
    : 'This will clear the answers you entered.';
  if (freshCancel) freshCancel.textContent = state.paid ? 'Keep this report' : 'Keep my answers';
  if (freshConfirm) freshConfirm.textContent = state.paid ? 'Start another report' : 'Clear answers';
  freshReturnFocus = document.activeElement;
  if (typeof freshDialog?.showModal === 'function') freshDialog.showModal();
  else freshDialog?.setAttribute('open', '');
  requestAnimationFrame(() => freshCancel?.focus());
}

async function ensureAdditionalReportContinuation(
  readingId,
  {
    minimumRemainingMs = 2 * 60 * 1000,
    navigationAttempt = 0
  } = {}
) {
  const normalizedReadingId = String(readingId || '').trim().slice(0, 120);
  const permittedReading = (state.paid && normalizedReadingId === state.readingId)
    || (
      state.acquisitionJourney === 'additional_report'
      && normalizedReadingId === state.parentReadingId
    );
  if (!permittedReading || !/^[a-zA-Z0-9_-]+$/.test(normalizedReadingId)) return false;
  const existingClaims = additionalReportContinuationClaims(
    state.additionalReportContinuationToken
  );
  if (
    state.additionalReportContinuationReadingId === normalizedReadingId
    && existingClaims?.readingId === normalizedReadingId
    && existingClaims.expiresAt > Date.now() + minimumRemainingMs
  ) {
    state.additionalReportContinuationExpiresAt = existingClaims.expiresAt;
    return true;
  }
  try {
    const full = await getJson(`/api/reading/${encodeURIComponent(normalizedReadingId)}/full`);
    const token = String(full?.additionalReportContinuationToken || '').trim().slice(0, 1600);
    const claims = additionalReportContinuationClaims(token);
    if (claims?.readingId !== normalizedReadingId || claims.expiresAt <= Date.now()) return false;
    if (
      navigationAttempt
      && navigationAttempt !== additionalReportNavigationAttempt
    ) return false;
    state.additionalReportContinuationToken = token;
    state.additionalReportContinuationReadingId = normalizedReadingId;
    state.additionalReportContinuationExpiresAt = claims.expiresAt;
    persist();
    return true;
  } catch (_) {
    return Boolean(
      state.additionalReportContinuationReadingId === normalizedReadingId
      && existingClaims?.readingId === normalizedReadingId
      && existingClaims.expiresAt > Date.now()
    );
  }
}

async function ensureAdditionalReportDirectoryContinuation(
  readingId,
  {
    minimumRemainingMs = 2 * 60 * 1000,
    navigationAttempt = 0
  } = {}
) {
  const normalizedReadingId = String(readingId || '').trim().slice(0, 120);
  const permittedReading = (state.paid && normalizedReadingId === state.readingId)
    || (
      state.acquisitionJourney === 'additional_report'
      && normalizedReadingId === state.parentReadingId
    );
  if (!permittedReading || !/^[a-zA-Z0-9_-]+$/.test(normalizedReadingId)) return false;
  const existingClaims = additionalReportDirectoryContinuationClaims(
    state.additionalReportDirectoryContinuationToken
  );
  if (
    state.additionalReportDirectoryContinuationReadingId === normalizedReadingId
    && existingClaims?.readingId === normalizedReadingId
    && existingClaims.expiresAt > Date.now() + minimumRemainingMs
  ) {
    state.additionalReportDirectoryContinuationExpiresAt = existingClaims.expiresAt;
    return true;
  }
  try {
    const full = await getJson(`/api/reading/${encodeURIComponent(normalizedReadingId)}/full`);
    const token = String(full?.additionalReportDirectoryContinuationToken || '')
      .trim()
      .slice(0, 1800);
    const claims = additionalReportDirectoryContinuationClaims(token);
    if (claims?.readingId !== normalizedReadingId || claims.expiresAt <= Date.now()) return false;
    if (
      navigationAttempt
      && navigationAttempt !== additionalReportNavigationAttempt
    ) return false;
    state.additionalReportDirectoryContinuationToken = token;
    state.additionalReportDirectoryContinuationReadingId = normalizedReadingId;
    state.additionalReportDirectoryContinuationExpiresAt = claims.expiresAt;
    persist();
    return true;
  } catch (_) {
    return Boolean(
      state.additionalReportDirectoryContinuationReadingId === normalizedReadingId
      && existingClaims?.readingId === normalizedReadingId
      && existingClaims.expiresAt > Date.now()
    );
  }
}

async function prepareAdditionalReportLineage(reason, navigationAttempt) {
  if (!state.paid || !state.readingId) return false;
  const ready = await ensureAdditionalReportContinuation(state.readingId, {
    minimumRemainingMs: 15 * 60 * 1000,
    navigationAttempt
  });
  if (!ready || navigationAttempt !== additionalReportNavigationAttempt) return false;
  return rememberAdditionalReportLineage(reason);
}

async function prepareAdditionalReportDirectoryLineage(reason, navigationAttempt) {
  if (!state.paid || !state.readingId) return false;
  const ready = await ensureAdditionalReportDirectoryContinuation(state.readingId, {
    minimumRemainingMs: 15 * 60 * 1000,
    navigationAttempt
  });
  if (!ready || navigationAttempt !== additionalReportNavigationAttempt) return false;
  return rememberAdditionalReportDirectoryLineage(reason);
}

function setAdditionalReportNavigationPending(pending) {
  additionalReportNavigationPending = Boolean(pending);
  if (freshCancel) freshCancel.disabled = additionalReportNavigationPending;
  if (freshConfirm) {
    freshConfirm.disabled = additionalReportNavigationPending;
    if (additionalReportNavigationPending) freshConfirm.textContent = 'Preparing…';
  }
  stage.querySelectorAll('[data-action="go-home"]').forEach((button) => {
    button.disabled = additionalReportNavigationPending;
  });
  stage.querySelectorAll('[data-action="open-next-reading-recommendation"]').forEach((button) => {
    button.disabled = additionalReportNavigationPending;
  });
}

function showAdditionalReportNavigationError({ dialog = false } = {}) {
  const message = 'We could not securely carry this paid report into a new one. Check your connection, then tap again to retry.';
  if (dialog && freshDialog?.open) {
    if (freshDialogCopy) freshDialogCopy.textContent = message;
    if (freshConfirm) freshConfirm.textContent = 'Try again';
    return;
  }
  let error = document.getElementById('additionalReportNavigationError');
  if (!error) {
    error = document.createElement('div');
    error.id = 'additionalReportNavigationError';
    error.className = 'error-card additional-report-navigation-error';
    error.setAttribute('role', 'alert');
    document.body.append(error);
  }
  error.textContent = message;
  setTimeout(() => error?.remove(), 8_000);
}

async function confirmFreshStart() {
  if (additionalReportNavigationPending) return;
  const navigationAttempt = ++additionalReportNavigationAttempt;
  const destination = lanePath();
  track('start_fresh_confirmed', {
    from_screen: state.screen,
    paid: state.paid ? 'yes' : 'no',
    destination
  });
  finishPalmPaywallVisit('start_fresh');
  setAdditionalReportNavigationPending(true);
  const prepared = !state.paid
    || await prepareAdditionalReportLineage('start_fresh', navigationAttempt);
  if (navigationAttempt !== additionalReportNavigationAttempt) return;
  setAdditionalReportNavigationPending(false);
  if (!prepared) {
    showAdditionalReportNavigationError({ dialog: true });
    return;
  }
  rememberPaidReading();
  clearActiveReading();
  location.assign(destination);
}

async function goHome() {
  if (paymentNavigationBlocked()) {
    track('home_blocked', { reason: 'payment_verification', from_screen: state.screen });
    return;
  }
  const navigationAttempt = ++additionalReportNavigationAttempt;
  track('home_click', { from_screen: state.screen, paid: state.paid ? 'yes' : 'no' });
  finishPalmPaywallVisit('home_navigation');
  setAdditionalReportNavigationPending(true);
  const prepared = !state.paid
    || await prepareAdditionalReportDirectoryLineage('view_other_reports', navigationAttempt);
  if (navigationAttempt !== additionalReportNavigationAttempt) return;
  setAdditionalReportNavigationPending(false);
  if (!prepared) {
    showAdditionalReportNavigationError();
    return;
  }
  rememberPaidReading();
  clearActiveReading();
  location.assign('/');
}

function updateRecoveryUrl({ paid = false } = {}) {
  if (!state.readingId || !window.history?.replaceState) return;
  const url = new URL(location.href);
  url.searchParams.set('readingId', state.readingId);
  url.searchParams.delete('purchase_token');
  const normalizedPath = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname;
  if (!PATH_ALIASES[normalizedPath]) {
    url.searchParams.set('a', state.rawAngle && state.rawAngle !== '_default' ? state.rawAngle : state.resolvedAngle);
  }
  if (paid) url.searchParams.set('payment', 'success');
  history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[character]));
}

function getCookie(name) {
  return document.cookie.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}

function thirdPartyAnalyticsData(data = {}) {
  const safe = { ...data };
  delete safe.reading_id;
  delete safe.readingId;
  delete safe.cross_sell_source_reading_id;
  return safe;
}

function publicAnalyticsUrl() {
  const url = new URL(location.href);
  url.searchParams.delete('readingId');
  url.searchParams.delete('reading_id');
  url.searchParams.delete('payment');
  url.searchParams.delete('access');
  url.searchParams.delete('report_access');
  url.searchParams.delete('purchase_token');
  return url.toString();
}

async function opaqueMetaEventId(kind, identifier) {
  const value = `astro-vela:${kind}:${identifier}`;
  if (!window.crypto?.subtle || !window.TextEncoder) return '';
  const digest = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  const token = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('').slice(0, 32);
  return `${kind}_${token}`;
}

function flow() {
  const base = FLOWS[state.lane] || FLOWS._default;
  if (IS_GLOBAL_STOREFRONT && state.lane === 'palm_answers') {
    // The international storefront is adult-only. Ask for date of birth and
    // obtain the short-lived, flow-bound age capability before the browser can
    // open a camera or file picker, so no palm image is accepted first.
    return ['intro', 'dob', 'palmupload', 'palmscan', 'palmproof', 'time', 'place', 'name', 'analysis', 'unlock', 'residence'];
  }
  if (state.additionalReportPrefillVersion) {
    if (state.lane === 'best_city') {
      return ['confirmdetails', 'scope', 'analysis', 'unlock'];
    }
    if (state.lane === 'partner_name') {
      return ['confirmdetails', 'analysis', 'unlock'];
    }
    if (state.lane === 'market_profile') {
      return ['confirmdetails', 'marketsegment', 'palmoffer', 'palmupload', 'palmscan', 'palmproof', 'analysis', 'unlock'];
    }
  }
  if (
    state.lane === 'market_profile'
    && state.marketLandingVariant === MARKET_LANDING_TREATMENT_VARIANT
  ) {
    return [base[0], 'marketsegment', ...base.slice(1)];
  }
  return base;
}

function laneConfig() {
  return LANES[state.lane] || null;
}

function activeCopyVersion() {
  if (state.lane === 'mahakundli') return MAHAKUNDLI_COPY_VERSION;
  if (state.lane === 'name_numerology') return NAME_NUMEROLOGY_COPY_VERSION;
  if (state.lane === 'face_answers') return FACE_COPY_VERSION;
  if (state.lane === 'palm_answers') return state.palmPaywallCopyVersion || PALM_EG_COPY_VERSION;
  return COPY_VERSION;
}

function marketLandingExperimentAnalytics() {
  if (state.lane !== 'market_profile') return {};
  return {
    market_landing_experiment_key: MARKET_LANDING_EXPERIMENT_KEY,
    market_landing_experiment_version: state.marketLandingExperimentVersion,
    market_landing_experiment_variant: state.marketLandingVariant,
    market_landing_experiment_bucket: state.marketLandingBucket,
    market_landing_experiment_eligible: Boolean(state.marketLandingEligible),
    market_landing_experiment_allocation_percent: state.marketLandingAllocationPercent,
    market_landing_assignment_source: state.marketLandingAssignmentSource
  };
}

function palmLandingCheckpointAnalytics() {
  if (state.lane !== 'palm_answers') return {};
  return {
    landing_release_checkpoint: PALM_LANDING_CHECKPOINT,
    palm_post_scan_experience_version: PALM_POST_SCAN_EXPERIENCE_VERSION,
    palm_result_cta_version: PALM_RESULT_CTA_VERSION
  };
}

function activePalmProofDensityVariant() {
  if (state.lane !== 'palm_answers') return PALM_PROOF_DENSITY_CONTROL;
  if (LOCAL_PALM_PAYWALL_PREVIEW) return LOCAL_PALM_PROOF_DENSITY_VARIANT;
  if (PALM_PROOF_DENSITY_TREATMENT_PERCENT <= 0) return PALM_PROOF_DENSITY_CONTROL;
  if (palmProofDensityServerValidatedThisLoad !== true) {
    return PALM_PROOF_DENSITY_CONTROL;
  }
  if (
    state.palmProofDensityEligible === true
    && state.palmProofDensityAllocationEpoch !== PALM_PROOF_DENSITY_ALLOCATION_EPOCH
  ) return PALM_PROOF_DENSITY_CONTROL;
  return [PALM_PROOF_DENSITY_CONTROL, PALM_PROOF_DENSITY_TREATMENT]
    .includes(state.palmProofDensityVariant)
    ? state.palmProofDensityVariant
    : PALM_PROOF_DENSITY_CONTROL;
}

function palmProofDensityExperimentAnalytics() {
  if (state.lane !== 'palm_answers' || activePalmPaywallVariant() !== 'e') return {};
  return {
    palm_proof_density_experiment_key: PALM_PROOF_DENSITY_EXPERIMENT_KEY,
    palm_proof_density_experiment_version: PALM_PROOF_DENSITY_EXPERIMENT_VERSION,
    palm_proof_density_experiment_variant: activePalmProofDensityVariant(),
    palm_proof_density_experiment_bucket: state.palmProofDensityBucket,
    palm_proof_density_experiment_eligible: LOCAL_PALM_PAYWALL_PREVIEW ? false : Boolean(state.palmProofDensityEligible),
    palm_proof_density_experiment_allocation_percent: LOCAL_PALM_PAYWALL_PREVIEW ? 0 : state.palmProofDensityAllocationPercent,
    ...(state.palmProofDensityAllocationEpoch ? {
      palm_proof_density_experiment_allocation_epoch: state.palmProofDensityAllocationEpoch
    } : {}),
    palm_proof_density_assignment_source: LOCAL_PALM_PAYWALL_PREVIEW
      ? 'local_preview'
      : state.palmProofDensityAssignmentSource
  };
}

function palmProofDensityPageValidationAnalytics() {
  if (state.lane !== 'palm_answers' || activePalmPaywallVariant() !== 'e') return {};
  return {
    palm_proof_density_rendered_variant: activePalmProofDensityVariant(),
    palm_proof_density_assignment_validated_this_load:
      !LOCAL_PALM_PAYWALL_PREVIEW
      && palmProofDensityServerValidatedThisLoad === true
  };
}

function applyServerPalmProofDensityAssignment(raw) {
  if (state.lane !== 'palm_answers' || !raw || typeof raw !== 'object') return false;
  const assignmentSessionId = String(raw.assignmentSessionId || '').trim();
  if (
    raw.key !== PALM_PROOF_DENSITY_EXPERIMENT_KEY
    || assignmentSessionId !== state.analyticsSessionId
    || (raw.eligible === true && raw.assignmentSource !== 'server_randomized')
    || (raw.eligible !== true && !['runtime_control', 'legacy_control', 'ineligible_paywall', 'ineligible_release', 'ineligible_traffic', 'server_fail_closed'].includes(raw.assignmentSource))
  ) return false;
  const canonical = resolvePalmProofDensityExperiment({
    analyticsSessionId: state.analyticsSessionId,
    paywallVariant: activePalmPaywallVariant(),
    carriedVersion: raw.version,
    carriedVariant: raw.variant,
    carriedBucket: raw.bucket,
    carriedEligible: raw.eligible,
    carriedAllocationPercent: raw.allocationPercent,
    carriedAllocationEpoch: raw.allocationEpoch,
    carriedAssignmentSource: raw.assignmentSource,
    legacySession: false
  });
  if (
    canonical.version !== raw.version
    || canonical.variant !== raw.variant
    || canonical.bucket !== Number(raw.bucket)
    || canonical.eligible !== raw.eligible
    || canonical.allocationPercent !== Number(raw.allocationPercent)
    || canonical.allocationEpoch !== raw.allocationEpoch
    || canonical.assignmentSource !== raw.assignmentSource
  ) return false;
  state.palmProofDensityExperimentVersion = canonical.version;
  state.palmProofDensityVariant = canonical.variant;
  state.palmProofDensityBucket = canonical.bucket;
  state.palmProofDensityEligible = canonical.eligible;
  state.palmProofDensityAllocationPercent = canonical.allocationPercent;
  state.palmProofDensityAllocationEpoch = canonical.allocationEpoch || '';
  state.palmProofDensityAssignmentSource = canonical.assignmentSource;
  palmProofDensityServerValidatedThisLoad = true;
  return true;
}

function failClosedPalmProofDensityAssignment() {
  palmProofDensityServerValidatedThisLoad = false;
  state.palmProofDensityExperimentVersion = PALM_PROOF_DENSITY_EXPERIMENT_VERSION;
  state.palmProofDensityVariant = PALM_PROOF_DENSITY_CONTROL;
  state.palmProofDensityBucket = palmProofDensityBucketForSession(state.analyticsSessionId);
  state.palmProofDensityEligible = false;
  state.palmProofDensityAllocationPercent = 0;
  state.palmProofDensityAllocationEpoch = PALM_PROOF_DENSITY_ALLOCATION_EPOCH;
  state.palmProofDensityAssignmentSource = 'server_fail_closed';
}

function activePalmGatewayRecoveryVariant() {
  if (state.lane !== 'palm_answers') return PALM_GATEWAY_RECOVERY_CONTROL;
  if (LOCAL_PALM_PAYWALL_PREVIEW) return LOCAL_PALM_GATEWAY_RECOVERY_VARIANT;
  const treatmentIsServerVerified = (
    PALM_GATEWAY_RECOVERY_TREATMENT_PERCENT > 0
    && palmGatewayRecoveryServerValidatedThisLoad === true
    && state.palmGatewayRecoveryEligible === true
    && state.palmGatewayRecoveryAssignmentSource === 'server_randomized'
    && Number(state.palmGatewayRecoveryAllocationPercent)
      === PALM_GATEWAY_RECOVERY_TREATMENT_PERCENT
    && state.palmGatewayRecoveryAllocationEpoch
      === PALM_GATEWAY_RECOVERY_ALLOCATION_EPOCH
    && state.palmProofDensityEligible !== true
  );
  return treatmentIsServerVerified
    && state.palmGatewayRecoveryVariant === PALM_GATEWAY_RECOVERY_TREATMENT
    ? PALM_GATEWAY_RECOVERY_TREATMENT
    : PALM_GATEWAY_RECOVERY_CONTROL;
}

function palmGatewayRecoveryExperimentAnalytics() {
  if (state.lane !== 'palm_answers' || activePalmPaywallVariant() !== 'e') return {};
  return {
    palm_gateway_recovery_experiment_key: PALM_GATEWAY_RECOVERY_EXPERIMENT_KEY,
    palm_gateway_recovery_experiment_version: PALM_GATEWAY_RECOVERY_EXPERIMENT_VERSION,
    palm_gateway_recovery_experiment_variant: activePalmGatewayRecoveryVariant(),
    palm_gateway_recovery_experiment_bucket: state.palmGatewayRecoveryBucket,
    palm_gateway_recovery_experiment_eligible: LOCAL_PALM_PAYWALL_PREVIEW
      ? false
      : Boolean(state.palmGatewayRecoveryEligible),
    palm_gateway_recovery_experiment_allocation_percent: LOCAL_PALM_PAYWALL_PREVIEW
      ? 0
      : state.palmGatewayRecoveryAllocationPercent,
    ...(state.palmGatewayRecoveryAllocationEpoch ? {
      palm_gateway_recovery_experiment_allocation_epoch: state.palmGatewayRecoveryAllocationEpoch
    } : {}),
    palm_gateway_recovery_assignment_source: LOCAL_PALM_PAYWALL_PREVIEW
      ? 'local_preview'
      : state.palmGatewayRecoveryAssignmentSource
  };
}

function palmGatewayRecoveryPageValidationAnalytics() {
  if (state.lane !== 'palm_answers' || activePalmPaywallVariant() !== 'e') return {};
  return {
    palm_gateway_recovery_rendered_variant: activePalmGatewayRecoveryVariant(),
    palm_gateway_recovery_assignment_validated_this_load:
      !LOCAL_PALM_PAYWALL_PREVIEW
      && palmGatewayRecoveryServerValidatedThisLoad === true
  };
}

function applyServerPalmGatewayRecoveryAssignment(raw) {
  if (state.lane !== 'palm_answers' || !raw || typeof raw !== 'object') return false;
  const assignmentSessionId = String(raw.assignmentSessionId || '').trim();
  if (
    raw.key !== PALM_GATEWAY_RECOVERY_EXPERIMENT_KEY
    || assignmentSessionId !== state.analyticsSessionId
    || (raw.eligible === true && raw.assignmentSource !== 'server_randomized')
    || (raw.eligible !== true && !['runtime_control', 'legacy_control', 'ineligible_paywall', 'ineligible_release', 'ineligible_traffic', 'ineligible_concurrent_experiment', 'server_fail_closed'].includes(raw.assignmentSource))
  ) return false;
  const canonical = resolvePalmGatewayRecoveryExperiment({
    analyticsSessionId: state.analyticsSessionId,
    paywallVariant: activePalmPaywallVariant(),
    carriedVersion: raw.version,
    carriedVariant: raw.variant,
    carriedBucket: raw.bucket,
    carriedEligible: raw.eligible,
    carriedAllocationPercent: raw.allocationPercent,
    carriedAllocationEpoch: raw.allocationEpoch,
    carriedAssignmentSource: raw.assignmentSource,
    legacySession: false
  });
  if (
    canonical.version !== raw.version
    || canonical.variant !== raw.variant
    || canonical.bucket !== Number(raw.bucket)
    || canonical.eligible !== raw.eligible
    || canonical.allocationPercent !== Number(raw.allocationPercent)
    || canonical.allocationEpoch !== raw.allocationEpoch
    || canonical.assignmentSource !== raw.assignmentSource
  ) return false;
  state.palmGatewayRecoveryExperimentVersion = canonical.version;
  state.palmGatewayRecoveryVariant = canonical.variant;
  state.palmGatewayRecoveryBucket = canonical.bucket;
  state.palmGatewayRecoveryEligible = canonical.eligible;
  state.palmGatewayRecoveryAllocationPercent = canonical.allocationPercent;
  state.palmGatewayRecoveryAllocationEpoch = canonical.allocationEpoch || '';
  state.palmGatewayRecoveryAssignmentSource = canonical.assignmentSource;
  palmGatewayRecoveryServerValidatedThisLoad = true;
  return true;
}

function failClosedPalmGatewayRecoveryAssignment() {
  palmGatewayRecoveryServerValidatedThisLoad = false;
  state.palmGatewayRecoveryExperimentVersion = PALM_GATEWAY_RECOVERY_EXPERIMENT_VERSION;
  state.palmGatewayRecoveryVariant = PALM_GATEWAY_RECOVERY_CONTROL;
  state.palmGatewayRecoveryBucket = palmGatewayRecoveryBucketForSession(state.analyticsSessionId);
  state.palmGatewayRecoveryEligible = false;
  state.palmGatewayRecoveryAllocationPercent = 0;
  state.palmGatewayRecoveryAllocationEpoch = PALM_GATEWAY_RECOVERY_ALLOCATION_EPOCH;
  state.palmGatewayRecoveryAssignmentSource = 'server_fail_closed';
}

function priceComparisonFor(pricing = currentPricing()) {
  const amount = Number(pricing?.amount);
  const compareAtAmount = Number(pricing?.compareAtAmount);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  if (!Number.isFinite(compareAtAmount) || compareAtAmount <= amount) return null;
  return { amount, compareAtAmount };
}

function priceComparisonAnalytics() {
  const comparison = priceComparisonFor();
  if (!comparison) return {};
  return {
    compare_at_value: comparison.compareAtAmount,
    savings_value: Math.max(0, comparison.compareAtAmount - comparison.amount)
  };
}

function currentPricing() {
  const pricing = state.pricing || RUNTIME_PRICING || { amount: REPORT_PRICE_INR };
  if (state.lane === 'mahakundli' && !state.readingId) {
    return {
      ...pricing,
      ...MAHAKUNDLI_PRICING
    };
  }
  // New Palm visitors see the Palm price even when the shared runtime config is
  // still carrying the default lane price. Once a reading exists, its assigned
  // price remains authoritative so pre-cutover sessions keep their original quote.
  if (state.lane === 'palm_answers' && !state.readingId) {
    return {
      ...pricing,
      amount: PALM_REPORT_PRICE_INR,
      compareAtAmount: null,
      offer: null
    };
  }
  if (state.lane === 'face_answers' && !state.readingId) {
    const facePricing = state.faceReportType === 'personality'
      ? FACE_PERSONALITY_PRICING
      : FACE_LIFETIME_PRICING;
    return {
      ...pricing,
      ...facePricing,
      compareAtAmount: null,
      offer: null
    };
  }
  if (state.lane === 'best_city' && !state.readingId) {
    return {
      ...pricing,
      ...BEST_CITY_PRICING
    };
  }
  if (state.lane === 'name_numerology' && !state.readingId) {
    return {
      ...pricing,
      ...NAME_NUMEROLOGY_PRICING
    };
  }
  return pricing;
}

function formatInrAmount(value) {
  const amount = Number(value);
  const normalized = Number.isFinite(amount)
    ? Math.round((amount + Number.EPSILON) * 100) / 100
    : 0;
  const hasPaise = Math.round(normalized * 100) % 100 !== 0;
  return normalized.toLocaleString('en-IN', {
    minimumFractionDigits: hasPaise ? 2 : 0,
    maximumFractionDigits: 2
  });
}

function inr(value) {
  return `₹${formatInrAmount(value)}`;
}

function checkoutCurrency(pricing = currentPricing()) {
  const value = String(pricing?.currency || STOREFRONT_CURRENCY || 'INR').trim().toUpperCase();
  return /^[A-Z]{3}$/.test(value) ? value : 'INR';
}

function money(value, pricing = currentPricing()) {
  const amount = Number(value);
  const normalized = Number.isFinite(amount)
    ? Math.round((amount + Number.EPSILON) * 100) / 100
    : 0;
  const currency = checkoutCurrency(pricing);
  try {
    return new Intl.NumberFormat(
      currency === 'INR' ? 'en-IN' : STOREFRONT_LOCALE,
      {
        style: 'currency',
        currency,
        minimumFractionDigits: Number.isInteger(normalized) ? 0 : 2,
        maximumFractionDigits: 2
      }
    ).format(normalized);
  } catch (_) {
    return currency === 'INR' ? inr(normalized) : `${currency} ${normalized.toFixed(2)}`;
  }
}

function normalizeExclusiveGstMarker(pricing = currentPricing()) {
  const tax = pricing?.tax;
  if (
    tax?.mode !== GST_EXCLUSIVE_MODE
    || Number(tax.gstRateBps) !== GST_RATE_BPS
  ) return null;
  return { mode: GST_EXCLUSIVE_MODE, gstRateBps: GST_RATE_BPS };
}

function checkoutQuoteFromResponse(body = {}) {
  const candidates = [
    body.quote,
    body.payment?.quote,
    body.payment?.checkout?.quote
  ];
  return candidates.find((quote) => quote && typeof quote === 'object') || null;
}

function normalizedCheckoutGstMarker(quote = null) {
  if (
    quote?.version !== GST_CHECKOUT_QUOTE_VERSION
    || Number(quote.gstRateBps) !== GST_RATE_BPS
  ) return null;
  return { version: GST_CHECKOUT_QUOTE_VERSION, gstRateBps: GST_RATE_BPS };
}

function checkoutUsesExclusiveGst(pricing = currentPricing(), { allowCheckoutQuote = true } = {}) {
  return Boolean(
    normalizeExclusiveGstMarker(pricing)
    || (allowCheckoutQuote && (
      state.checkoutQuoteVersion === GST_CHECKOUT_QUOTE_VERSION
      && Number(state.checkoutGstRateBps) === GST_RATE_BPS
    ))
  );
}

function exclusiveGstBreakdown(taxableAmount, pricing = currentPricing(), options = {}) {
  const taxablePaise = Math.round(Number(taxableAmount || 0) * 100);
  if (!checkoutUsesExclusiveGst(pricing, options) || !Number.isSafeInteger(taxablePaise) || taxablePaise < 0) {
    const normalizedAmount = Math.max(0, Number(taxableAmount) || 0);
    return {
      taxableAmount: normalizedAmount,
      gstRateBps: 0,
      gstAmount: 0,
      grossAmount: normalizedAmount
    };
  }
  const gstPaise = Math.round((taxablePaise * GST_RATE_BPS) / GST_BASIS_POINTS);
  return {
    taxableAmount: taxablePaise / 100,
    gstRateBps: GST_RATE_BPS,
    gstAmount: gstPaise / 100,
    grossAmount: (taxablePaise + gstPaise) / 100
  };
}

function taxablePriceLabel(taxableAmount, pricing = currentPricing(), options = {}) {
  return money(exclusiveGstBreakdown(taxableAmount, pricing, options).taxableAmount, pricing);
}

function payablePriceLabel(taxableAmount, pricing = currentPricing(), options = {}) {
  const breakdown = exclusiveGstBreakdown(taxableAmount, pricing, options);
  return money(breakdown.grossAmount, pricing);
}

function prePayGstCopy(pricing = currentPricing(), options = {}) {
  return checkoutUsesExclusiveGst(pricing, options) ? '+ GST' : '';
}

function prePayGstMarkup(pricing = currentPricing(), options = {}) {
  const { inline = false, ...pricingOptions } = options || {};
  const copy = prePayGstCopy(pricing, pricingOptions);
  return copy ? `<small class="gst-note${inline ? ' gst-note--inline' : ''}">${escapeHtml(copy)}</small>` : '';
}

function prePayPricePairMarkup(taxableAmount, pricing = currentPricing(), options = {}) {
  return `<span class="prepay-price-pair"><strong class="prepay-price-value">${escapeHtml(taxablePriceLabel(taxableAmount, pricing, options))}</strong>${prePayGstMarkup(pricing, { ...options, inline: true })}</span>`;
}

function gstDisclosureCopy(taxableAmount, pricing = currentPricing(), options = {}) {
  if (!checkoutUsesExclusiveGst(pricing, options)) return '';
  const breakdown = exclusiveGstBreakdown(taxableAmount, pricing, options);
  return `${money(breakdown.grossAmount, pricing)} total · Includes GST`;
}

function gstDisclosureMarkup(taxableAmount, pricing = currentPricing(), options = {}) {
  const copy = gstDisclosureCopy(taxableAmount, pricing, options);
  return copy ? `<small class="gst-note">${escapeHtml(copy)}</small>` : '';
}

function checkoutPriceNoteCopy(taxableAmount, pricing = currentPricing(), options = {}) {
  return gstDisclosureCopy(taxableAmount, pricing, options)
    || `${payablePriceLabel(taxableAmount, pricing, options)} total`;
}

function checkoutPriceNoteMarkup(taxableAmount, pricing = currentPricing(), options = {}) {
  return `<small class="checkout-price-note" data-checkout-price-note>${escapeHtml(checkoutPriceNoteCopy(taxableAmount, pricing, options))}</small>`;
}

function checkoutAriaLabel(label, taxableAmount, pricing = currentPricing(), options = {}) {
  return `${label}, ${checkoutPriceNoteCopy(taxableAmount, pricing, options)}`;
}

function palmNameAlignmentAssignment() {
  if (state.lane !== 'palm_answers') return null;
  const experiments = state.preview?.experiments;
  if (!experiments || typeof experiments !== 'object') return null;
  const candidates = [
    experiments.palmNameAlignmentOffer,
    experiments.palm_name_alignment_offer,
    experiments.nameAlignmentOffer,
    experiments.name_alignment_offer,
    experiments
  ];
  const raw = candidates.find((value) => value && typeof value === 'object'
    && ['offer', 'control'].includes(String(value.variant || '').toLowerCase()));
  if (!raw) return null;
  const key = String(raw.key || raw.experimentKey || raw.experiment_key || '').trim().slice(0, 100);
  const version = String(raw.version || raw.experimentVersion || raw.experiment_version || '').trim().slice(0, 100);
  const bucket = Number(raw.bucket);
  const variant = String(raw.variant || '').toLowerCase();
  if (!key || !version || !Number.isInteger(bucket) || bucket < 0 || bucket > 9999) return null;
  const inferredArm = variant === 'control'
    ? 'control'
    : version === 'v4' && bucket >= 1_000 && bucket < 6_000
      ? 'offer_default_off'
      : version === 'v3' && bucket >= 1_500 && bucket < 3_000
        ? 'offer_default_off'
        : 'offer_default_on';
  const arm = String(raw.arm || inferredArm).trim().toLowerCase();
  const defaultSelected = typeof raw.defaultSelected === 'boolean'
    ? raw.defaultSelected
    : arm === 'offer_default_on';
  const baseAmount = Number(raw.pricing?.baseAmount);
  const addOnAmount = Number(raw.pricing?.addOnAmount);
  const pricing = Number.isFinite(baseAmount) && baseAmount > 0 && Number.isFinite(addOnAmount) && addOnAmount > 0
    ? { baseAmount: Math.round(baseAmount), addOnAmount: Math.round(addOnAmount) }
    : null;
  if (PALM_NAME_ALIGNMENT_FACTORIAL_VERSIONS.has(version)) {
    const contract = PALM_NAME_ALIGNMENT_FACTORIAL_ARMS[arm];
    if (
      variant !== 'offer'
      || !contract
      || typeof raw.defaultSelected !== 'boolean'
      || defaultSelected !== contract.defaultSelected
      || !pricing
      || pricing.baseAmount !== contract.baseAmount
      || pricing.addOnAmount !== 150
    ) return null;
    if (
      version === 'v13'
      && (defaultSelected || pricing.baseAmount !== 299)
    ) return null;
    if (
      version === 'v12'
      && (
        defaultSelected
        || (bucket < 3_000 ? pricing.baseAmount !== 299 : pricing.baseAmount !== 451)
      )
    ) return null;
    if (
      version === 'v11'
      && (
        defaultSelected
        || (bucket < 4_000
          ? pricing.baseAmount !== 299
          : bucket < 7_000
            ? pricing.baseAmount !== 351
            : pricing.baseAmount !== 451)
      )
    ) return null;
    if (
      version === 'v10'
      && (
        defaultSelected
        || (bucket < 7_000
          ? pricing.baseAmount !== 299
          : bucket < 9_000
            ? pricing.baseAmount !== 351
            : pricing.baseAmount !== 451)
      )
    ) return null;
    if (
      version === 'v9'
      && (
        defaultSelected
        || (bucket < 8_000 ? pricing.baseAmount !== 299 : pricing.baseAmount !== 351)
      )
    ) return null;
    if (
      version === 'v8'
      && (
        defaultSelected
        || (bucket < 5_000 ? pricing.baseAmount !== 299 : pricing.baseAmount !== 351)
      )
    ) return null;
    if (
      version === 'v7'
      && (
        defaultSelected
        || (bucket < 8_000 ? pricing.baseAmount !== 299 : pricing.baseAmount !== 351)
      )
    ) return null;
  } else if (!['control', 'offer_default_on', 'offer_default_off'].includes(arm)) {
    return null;
  }
  return {
    key,
    version,
    bucket,
    variant,
    arm,
    defaultSelected,
    ...(typeof raw.offerEligible === 'boolean' ? { offerEligible: raw.offerEligible } : {}),
    ...(pricing ? { pricing } : {})
  };
}

function palmNameAlignmentSelectionSignature(assignment = palmNameAlignmentAssignment()) {
  if (!assignment) return '';
  return `${state.readingId || 'pending'}:${assignment.key}:${assignment.version}:${assignment.variant}:${assignment.bucket}`;
}

function palmNameAlignmentOfferSupported(assignment = palmNameAlignmentAssignment()) {
  return typeof assignment?.offerEligible === 'boolean'
    ? assignment.offerEligible
    : ['e', 'f', 'g'].includes(activePalmPaywallVariant());
}

function ensurePalmNameAlignmentSelection() {
  const assignment = palmNameAlignmentAssignment();
  if (!assignment) return null;
  const signature = palmNameAlignmentSelectionSignature(assignment);
  if (state.palmNameAlignmentSelectionKey !== signature) {
    state.palmNameAlignmentSelectionKey = signature;
    state.palmNameAlignmentSelected = assignment.variant === 'offer'
      && assignment.defaultSelected === true
      && palmNameAlignmentOfferSupported();
    state.checkoutAddons = [];
    state.checkoutAuthoritativeValue = 0;
    state.checkoutQuoteVersion = '';
    state.checkoutGstRateBps = 0;
    persist();
  } else if ((assignment.variant !== 'offer' || !palmNameAlignmentOfferSupported()) && state.palmNameAlignmentSelected !== false) {
    state.palmNameAlignmentSelected = false;
    state.checkoutAddons = [];
    state.checkoutAuthoritativeValue = 0;
    state.checkoutQuoteVersion = '';
    state.checkoutGstRateBps = 0;
    persist();
  }
  return assignment;
}

function palmNameAlignmentIsSelected() {
  return palmNameAlignmentOfferSupported()
    && palmNameAlignmentAssignment()?.variant === 'offer'
    && state.palmNameAlignmentSelected === true;
}

function palmNameAlignmentSelectionIsLocked() {
  // Once a provider order exists its server-signed quote is frozen. Keep the
  // visible add-on choice in sync with that order so a dismissal/retry cannot
  // silently create a second chargeable order at a different amount.
  return Boolean(state.pendingVerification || state.activePaymentId);
}

function palmCheckoutAddons() {
  return palmNameAlignmentIsSelected() ? [PALM_NAME_ALIGNMENT_ADDON_KEY] : [];
}

function palmBasePrice() {
  const assignment = palmNameAlignmentAssignment();
  if (
    assignment?.variant === 'offer'
    && ['v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10', 'v11', 'v12', 'v13'].includes(assignment.version)
    && palmNameAlignmentOfferSupported()
  ) {
    return Number(assignment.pricing?.baseAmount || PALM_NAME_ALIGNMENT_OFFER_BASE_PRICE_INR);
  }
  return Number(currentPricing().amount || REPORT_PRICE_INR);
}

function palmLandingPriceMarkup() {
  const assignment = palmNameAlignmentAssignment();
  if (IS_GLOBAL_STOREFRONT) {
    return prePayPricePairMarkup(palmBasePrice(), currentPricing());
  }
  return assignment?.pricing?.baseAmount
    ? prePayPricePairMarkup(palmBasePrice(), currentPricing())
    : '';
}

function palmNameAlignmentAddOnPrice(assignment = palmNameAlignmentAssignment()) {
  return Number(assignment?.pricing?.addOnAmount || PALM_NAME_ALIGNMENT_PRICE_INR);
}

function palmCheckoutTaxableValue() {
  return palmBasePrice() + (palmNameAlignmentIsSelected() ? palmNameAlignmentAddOnPrice() : 0);
}

function checkoutEventValue() {
  if (Number(state.checkoutAuthoritativeValue) > 0) {
    return Number(state.checkoutAuthoritativeValue);
  }
  const taxableAmount = state.lane === 'palm_answers'
    ? palmCheckoutTaxableValue()
    : Number(currentPricing().amount || REPORT_PRICE_INR);
  return exclusiveGstBreakdown(taxableAmount).grossAmount;
}

function palmNameAlignmentExperimentAnalytics(extra = {}) {
  const assignment = palmNameAlignmentAssignment();
  if (!assignment) return extra;
  const offerVisible = assignment.variant === 'offer' && palmNameAlignmentOfferSupported();
  return {
    experiment_key: assignment.key,
    experiment_version: assignment.version,
    experiment_variant: assignment.variant,
    experiment_arm: assignment.arm,
    experiment_bucket: assignment.bucket,
    experiment_default_selected: assignment.defaultSelected,
    assignment_source: 'server',
    offer_visible: offerVisible,
    default_selected: assignment.defaultSelected,
    addon_selected: palmNameAlignmentIsSelected(),
    addon_key: offerVisible ? PALM_NAME_ALIGNMENT_ADDON_KEY : '',
    base_value: palmBasePrice(),
    addon_value: palmNameAlignmentIsSelected() ? palmNameAlignmentAddOnPrice(assignment) : 0,
    addon_offer_value: offerVisible ? palmNameAlignmentAddOnPrice(assignment) : 0,
    checkout_value: checkoutEventValue(),
    ...extra
  };
}

function palmCheckoutLabel(config, { needsVerification = false } = {}) {
  if (state.checkoutLoading) return needsVerification ? 'Checking your payment…' : 'Opening secure payment…';
  if (needsVerification) return 'Check my completed payment';
  if (PALM_NAME_ALIGNMENT_FACTORIAL_VERSIONS.has(palmNameAlignmentAssignment()?.version)) {
    // Historical F and the new G treatment retain their outcome-led calls to
    // action. E keeps its production wording exactly.
    return activePalmPaywallVariant() === 'f' || isLegacyPalmGCohort()
      ? config.payCta
      : 'Reveal my complete report';
  }
  return palmNameAlignmentIsSelected()
    ? 'Reveal my Palm + Name Alignment report'
    : config.payCta;
}

function palmNameAlignmentSelectionCopy() {
  if (PALM_NAME_ALIGNMENT_FACTORIAL_VERSIONS.has(palmNameAlignmentAssignment()?.version)) {
    return 'Complete report total';
  }
  return palmNameAlignmentIsSelected() ? 'Complete Palm Report + Name Alignment' : 'Complete Palm Report';
}

function checkoutAddonsFromResponse(body = {}, fallback = []) {
  const payment = body.payment || {};
  const explicitArrays = [
    body.addOns,
    body.addons,
    body.quote?.addOns,
    payment.addOns,
    payment.addons,
    payment.quote?.addOns,
    body.lineItems,
    body.quote?.lineItems,
    payment.lineItems,
    payment.quote?.lineItems
  ]
    .filter(Array.isArray);
  if (explicitArrays.length) {
    return explicitArrays.flatMap((items) => items).map((item) => (
      typeof item === 'string' ? item : item?.key || item?.id || item?.productKey || ''
    )).filter((key) => key === PALM_NAME_ALIGNMENT_ADDON_KEY);
  }
  const entitlements = body.entitlements || body.quote?.entitlements || payment.entitlements || payment.quote?.entitlements;
  if (Array.isArray(entitlements)) {
    return entitlements.filter((key) => key === PALM_NAME_ALIGNMENT_ADDON_KEY);
  }
  if (entitlements && typeof entitlements === 'object') {
    return entitlements.nameAlignment === true || entitlements.palmNameAlignment === true
      ? [PALM_NAME_ALIGNMENT_ADDON_KEY]
      : [];
  }
  return fallback.filter((key) => key === PALM_NAME_ALIGNMENT_ADDON_KEY);
}

function syncAuthoritativeCheckout(body = {}, requestedAddons = palmCheckoutAddons()) {
  const quote = checkoutQuoteFromResponse(body);
  const quoteGstMarker = normalizedCheckoutGstMarker(quote);
  const paymentValue = Number(body.payment?.amount || body.quote?.amount || body.payment?.quote?.amount);
  const responsePaise = Number(body.amount || body.payment?.checkout?.amount);
  const authoritativeValue = Number.isFinite(paymentValue) && paymentValue > 0
    ? paymentValue
    : Number.isFinite(responsePaise) && responsePaise > 0
      ? responsePaise / 100
      : 0;
  if (authoritativeValue > 0) state.checkoutAuthoritativeValue = authoritativeValue;
  state.checkoutQuoteVersion = quoteGstMarker?.version || '';
  state.checkoutGstRateBps = quoteGstMarker?.gstRateBps || 0;
  state.checkoutAddons = checkoutAddonsFromResponse(body, requestedAddons);
  if (palmNameAlignmentAssignment()?.variant === 'offer') {
    state.palmNameAlignmentSelected = state.checkoutAddons.includes(PALM_NAME_ALIGNMENT_ADDON_KEY);
  }
  persist();
}

function updatePalmNameAlignmentCheckoutUi() {
  const assignment = palmNameAlignmentAssignment();
  if (!assignment) return;
  const selected = palmNameAlignmentIsSelected();
  const locked = palmNameAlignmentSelectionIsLocked();
  const control = document.getElementById('palmNameAlignmentAddon');
  if (control) {
    control.checked = selected;
    control.disabled = state.checkoutLoading || locked;
  }
  stage.querySelectorAll('[data-name-alignment-teaser]').forEach((teaser) => {
    teaser.classList.toggle('is-selected', selected);
  });
  const card = stage.querySelector('[data-name-alignment-offer]');
  card?.classList.toggle('is-selected', selected);
  card?.classList.toggle('is-locked', locked);
  stage.querySelectorAll('[data-name-alignment-selection-copy]').forEach((node) => {
    node.textContent = palmNameAlignmentSelectionCopy();
  });
  stage.querySelectorAll('[data-name-alignment-total]').forEach((node) => {
    node.textContent = payablePriceLabel(palmCheckoutTaxableValue());
  });
  stage.querySelectorAll('[data-name-alignment-gst]').forEach((node) => {
    node.textContent = gstDisclosureCopy(palmCheckoutTaxableValue());
    node.hidden = !node.textContent;
  });
  stage.querySelectorAll('[data-checkout-price-note]').forEach((node) => {
    node.textContent = checkoutPriceNoteCopy(palmCheckoutTaxableValue());
  });
  stage.querySelectorAll('[data-name-alignment-lock-note]').forEach((node) => {
    node.hidden = !locked;
  });
  const baseConfig = palmPaywallConfig(laneConfig());
  const config = activePalmPaywallVariant() === 'g' && activeCopyVersion() === PALM_EG_COPY_VERSION
    ? { ...baseConfig, ...PALM_G_V3_COPY }
    : baseConfig;
  const label = palmCheckoutLabel(config, { needsVerification: Boolean(state.pendingVerification) });
  document.querySelectorAll('[data-palm-checkout]').forEach((button) => {
    button.textContent = label;
    button.setAttribute('aria-label', checkoutAriaLabel(label, palmCheckoutTaxableValue()));
  });
  document.body.classList.toggle('palm-name-alignment-selected', selected);
}

function paymentMethodTrustMarkup({ compact = false, bottom = false, reassurance = false } = {}) {
  const lockIcon = '<svg class="payment-lock-icon" aria-hidden="true" viewBox="0 0 20 20"><rect x="4.25" y="8.25" width="11.5" height="8.5" rx="2"></rect><path d="M6.75 8.25V6.5a3.25 3.25 0 0 1 6.5 0v1.75"></path></svg>';
  const methods = IS_GLOBAL_STOREFRONT
    ? `<span class="payment-method" title="International cards">International cards</span>
      <span class="payment-method payment-method--visa" title="Visa">VISA</span>
      <span class="payment-method payment-method--mastercard" title="Mastercard"><i></i><i></i></span>
      <span class="payment-method payment-method--amex" title="American Express">AMEX</span>`
    : `<span class="payment-method payment-method--upi" title="UPI">UPI</span>
      <span class="payment-method payment-method--gpay" title="Google Pay"><i class="gpay-g">G</i><b>Pay</b></span>
      <span class="payment-method payment-method--phonepe" title="PhonePe"><i aria-hidden="true">पे</i></span>
      <span class="payment-method payment-method--visa" title="Visa">VISA</span>
      <span class="payment-method payment-method--mastercard" title="Mastercard"><i></i><i></i></span>
      <span class="payment-method payment-method--rupay" title="RuPay">RuPay</span>
      <span class="payment-method payment-method--amex" title="American Express">AMEX</span>`;
  const trustContent = reassurance
    ? '<span class="payment-method">Opens here after payment confirmation · PDF included · Pay once · No subscription</span>'
    : methods;
  const ariaLabel = reassurance
    ? 'Secure checkout. Opens here after payment confirmation, PDF included, pay once, no subscription.'
    : IS_GLOBAL_STOREFRONT
      ? 'Secure international card checkout. Visa, Mastercard and American Express may be accepted where available.'
      : 'Secure checkout. UPI, Google Pay, PhonePe, Visa, Mastercard, RuPay and American Express accepted.';
  return `<div class="payment-trust-strip${compact ? ' payment-trust-strip--compact' : ''}${bottom ? ' payment-trust-strip--bottom' : ''}" data-testid="${reassurance ? 'payment-reassurance' : compact ? 'payment-trust-strip-compact' : 'payment-trust-strip'}" aria-label="${ariaLabel}">
    <div class="payment-trust-strip__title">${lockIcon}<b>Secure</b></div>
    <span class="payment-trust-strip__divider" aria-hidden="true"></span>
    <div class="payment-trust-strip__methods" aria-hidden="true">${trustContent}</div>
  </div>`;
}

function cashfreeFallbackMarkup() {
  // A provider order can still settle after the browser reports a failure or
  // dismissal (for example, a pending UPI approval). Do not expose a second
  // provider checkout while that order remains active.
  if (
    !RUNTIME_CONFIG.payments?.cashfreeFallback
    || sanitizeCheckoutAttemptId(state.activePaymentId)
    || (!state.paymentError && !state.cashfreeFallbackOpen)
  ) return '';
  const paymentPhone = String(state.answers.paymentPhone || '');
  const gatewayIcon = '<svg aria-hidden="true" viewBox="0 0 32 32"><rect x="3.5" y="7" width="25" height="18" rx="4"></rect><path d="M3.5 12h25M9 19h6"></path><path class="payment-gateway-icon__check" d="m20 18 2.2 2.2 4.3-5"></path></svg>';
  if (!state.cashfreeFallbackOpen) {
    return `<div class="payment-fallback-prompt" data-testid="cashfree-fallback-prompt">
      <div class="payment-fallback-prompt__copy"><b>Having trouble making the payment?</b><span>Try another secure payment page.</span></div>
      <button class="payment-gateway-button" type="button" data-action="show-cashfree-fallback">
        <span class="payment-gateway-icon">${gatewayIcon}</span>
        <span class="payment-gateway-button__copy"><small>OTHER SECURE PAYMENT PAGE</small><strong>Open another payment page</strong><em>UPI, cards and net banking</em></span>
        <span class="payment-gateway-button__arrow" aria-hidden="true">›</span>
      </button>
    </div>`;
  }
  return `<div class="payment-fallback-card" data-testid="cashfree-fallback">
    <div class="payment-fallback-card__heading">
      <span class="payment-gateway-icon">${gatewayIcon}</span>
      <span><small>OTHER SECURE PAYMENT PAGE</small><b>Use a different payment page</b></span>
    </div>
    <p>Use this if the first payment page did not open or complete. Enter your mobile number only for this payment—we will not subscribe or call you.</p>
    <div class="field"><label for="cashfreePhone">Mobile number</label><input class="input" id="cashfreePhone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="10-digit mobile number" value="${escapeHtml(paymentPhone)}" /></div>
    <button class="secondary-button payment-fallback-continue" type="button" data-action="checkout-cashfree" ${state.checkoutLoading || normalizePaymentPhone(paymentPhone).length !== 10 ? 'disabled' : ''}>Open the other payment page</button>
  </div>`;
}

function cashfreeGatewayRecoveryMarkup() {
  const recovery = sanitizePaymentDismissRecovery(state.paymentDismissRecovery);
  if (
    !recovery
    || !state.cashfreeFallbackOpen
    || state.lane !== 'palm_answers'
    || activePalmGatewayRecoveryVariant() !== PALM_GATEWAY_RECOVERY_TREATMENT
    || (!LOCAL_PALM_PAYWALL_PREVIEW && !RUNTIME_CONFIG.payments?.cashfreeFallback)
  ) return '';
  const paymentPhone = String(state.answers.paymentPhone || '');
  const gatewayIcon = '<svg aria-hidden="true" viewBox="0 0 32 32"><rect x="3.5" y="7" width="25" height="18" rx="4"></rect><path d="M3.5 12h25M9 19h6"></path><path class="payment-gateway-icon__check" d="m20 18 2.2 2.2 4.3-5"></path></svg>';
  return `<div class="payment-fallback-card payment-fallback-card--recovery" data-testid="cashfree-gateway-recovery" role="region" aria-labelledby="alternate-payment-title" tabindex="-1">
    <div class="payment-fallback-card__heading">
      <span class="payment-gateway-icon">${gatewayIcon}</span>
      <span><small>DIFFERENT SECURE PAYMENT WINDOW</small><b id="alternate-payment-title">Continue with another payment option</b></span>
    </div>
    <p id="alternate-payment-phone-help">Enter your 10-digit mobile number to continue. It will be used only for this payment.</p>
    <div class="field"><label for="cashfreePhone">10-digit mobile number</label><input class="input" id="cashfreePhone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="10" placeholder="Enter mobile number" aria-describedby="alternate-payment-phone-help" required value="${escapeHtml(paymentPhone)}" /></div>
    <button class="secondary-button payment-fallback-continue" type="button" data-action="checkout-cashfree" ${state.checkoutLoading || normalizePaymentPhone(paymentPhone).length !== 10 ? 'disabled' : ''}>Continue to secure payment</button>
    <small>UPI, cards and net banking · One-time payment</small>
  </div>`;
}

function landingPriceMarkup() {
  const pricing = currentPricing();
  const amount = Number(pricing.amount || REPORT_PRICE_INR);
  const product = laneConfig()?.product || 'Full personal report';
  if (state.lane === 'name_numerology') {
    return `${nameSpellingProofMarkup()}<div class="landing-price"><span>Name Number free · Full spelling verdict ${prePayPricePairMarkup(amount, pricing)}</span></div>`;
  }
  const comparison = priceComparisonFor(pricing);
  if (!comparison) {
    return `<div class="landing-price"><span>Start free · ${escapeHtml(product)} ${prePayPricePairMarkup(amount, pricing)}</span></div>`;
  }
  return `<div class="price-comparison price-comparison--landing anniversary-offer" data-testid="price-comparison">
    <div class="price-comparison__price"><span>${escapeHtml(product)}</span><del>${escapeHtml(taxablePriceLabel(comparison.compareAtAmount, pricing))}</del>${prePayPricePairMarkup(amount, pricing)}</div>
    <small class="offer-helper">Start free · Pay only if you choose the full report</small>
  </div>`;
}

function unlockPriceMarkup() {
  const pricing = currentPricing();
  const amount = state.lane === 'palm_answers'
    ? palmBasePrice()
    : Number(pricing.amount || REPORT_PRICE_INR);
  const comparison = state.lane === 'name_numerology' ? null : priceComparisonFor({
    ...pricing,
    amount
  });
  if (!comparison) {
    return checkoutUsesExclusiveGst(pricing)
      ? `<div class="unlock-price-stack"><strong class="unlock-price">${escapeHtml(taxablePriceLabel(amount, pricing))}</strong>${gstDisclosureMarkup(amount, pricing)}</div>`
      : `<strong class="unlock-price">${escapeHtml(money(amount, pricing))}</strong>`;
  }
  return `<div class="unlock-price-stack"><del aria-label="Regular report base price ${escapeHtml(taxablePriceLabel(comparison.compareAtAmount, pricing))}">Regular ${escapeHtml(taxablePriceLabel(comparison.compareAtAmount, pricing))}</del><strong class="unlock-price">${escapeHtml(taxablePriceLabel(amount, pricing))}</strong>${gstDisclosureMarkup(amount, pricing)}<small class="offer-helper">One-time payment</small></div>`;
}

function nameNumerologyOfferMarkup() {
  const pricing = currentPricing();
  const amount = Number(pricing.amount || REPORT_PRICE_INR);
  return `<section class="name-offer-card" data-testid="name-offer-card">
    <div><small>Complete personal report</small><b>Name Numerology Report</b></div>
    <div class="name-offer-card__price"><strong>${escapeHtml(taxablePriceLabel(amount, pricing))}</strong>${gstDisclosureMarkup(amount, pricing)}<span>One-time access</span></div>
    <p>Instant web report + PDF · One-time payment · No subscription</p>
  </section>`;
}

function palmPurchaseMarkup(config, timingHint = {}) {
  return `<section class="unlock-card unlock-card--purchase palm-unlock-offer" data-testid="palm-unlock-offer">
    <div class="unlock-card-head"><div><small>Complete personal report</small><b>${escapeHtml(config.product)}</b></div>${unlockPriceMarkup()}</div>
    ${timingHint.yearLevel
      ? '<p>Unlock your standout year, its main theme and the Palm evidence behind it.</p><div class="palm-offer-points"><span>Standout year</span><span>Main theme</span><span>Palm evidence</span></div>'
      : '<p>Unlock your current planetary phase, exact timing, next three periods and simple upay.</p><div class="palm-offer-points"><span>Current phase</span><span>Exact timing</span><span>Simple upay</span></div>'}
  </section>`;
}

function palmPurchaseMarkupE(config) {
  const assignment = ensurePalmNameAlignmentSelection();
  const nameAlignmentOffer = assignment?.variant === 'offer' && palmNameAlignmentOfferSupported(assignment)
    ? palmNameAlignmentOfferMarkup()
    : '';
  return `<section class="unlock-card unlock-card--purchase palm-unlock-offer" data-testid="palm-unlock-offer" data-paywall-section="palm_offer">
    <div class="unlock-card-head"><div><small>Complete personal report</small><b>${escapeHtml(config.product)}</b></div>${unlockPriceMarkup()}</div>
    <p>Your biggest questions are answered first. Then see what your Palm reveals, how your current phase is affecting you and when each major period becomes stronger.</p>
    <div class="palm-offer-points"><span>Career or business growth</span><span>Money and wealth</span><span>Love and marriage</span><span>Children and family</span><span>Recognition period</span><span>Energy, rest and recovery</span></div>
    ${nameAlignmentOffer}
  </section>`;
}

function palmPurchaseMarkupG(config, finding, timingHint = {}) {
  const assignment = ensurePalmNameAlignmentSelection();
  const nameAlignmentSupported = assignment?.variant === 'offer'
    && palmNameAlignmentOfferSupported(assignment);
  const areaLabel = finding ? palmGv3AreaLabel(finding) : 'your strongest result';
  return `<section class="unlock-card unlock-card--purchase palm-unlock-offer g-v3-purchase" data-testid="palm-unlock-offer" data-paywall-section="palm_offer">
    <div class="unlock-card-head"><div><small>Complete personal report</small><b>${escapeHtml(config.product)}</b></div>${unlockPriceMarkup()}</div>
    <p>${timingHint.yearLevel
      ? `Unlock the strongest years behind ${escapeHtml(areaLabel)}, your current Palm and birth-date phase, and every remaining life-area answer.`
      : `Unlock the stronger period for ${escapeHtml(areaLabel)}, how it develops, your current planetary phase and every remaining life-area answer.`}</p>
    <div class="palm-offer-points"><span>${timingHint.yearLevel ? 'Strongest years' : 'Stronger period'}</span><span>${timingHint.yearLevel ? 'Current broad phase' : 'Current planetary phase'}</span><span>Six life-area answers</span><span>Downloadable PDF</span></div>
    ${nameAlignmentSupported ? palmNameAlignmentOfferMarkup() : ''}
  </section>`;
}

// The paywall scrolls inside #app, not the document, and native smooth
// scrolling does not animate that container in every browser — it can resolve
// to no movement at all, which would make the teaser look broken. Animate it
// directly instead so the behaviour is identical everywhere.
function scrollPaywallElementIntoView(element) {
  if (!element) return;
  let container = element.parentElement;
  while (container && container !== document.body) {
    const overflowY = getComputedStyle(container).overflowY;
    if (
      (overflowY === 'auto' || overflowY === 'scroll')
      && container.scrollHeight > container.clientHeight + 4
    ) break;
    container = container.parentElement;
  }
  if (!container || container === document.body) {
    element.scrollIntoView({ block: 'center' });
    return;
  }
  const offset = element.getBoundingClientRect().top - container.getBoundingClientRect().top;
  const centred = offset + container.scrollTop - Math.max(0, (container.clientHeight - element.offsetHeight) / 2);
  const to = Math.max(0, Math.min(centred, container.scrollHeight - container.clientHeight));
  const from = container.scrollTop;
  const distance = to - from;
  if (Math.abs(distance) < 2) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
    container.scrollTop = to;
    return;
  }
  const duration = 460;
  const startedAt = performance.now();
  const step = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    container.scrollTop = from + distance * eased;
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// A signpost, not a second control. ~41% of paying customers never scrolled far
// enough to see the offer card, so this sits above the top CTA to tell them the
// option exists. Tapping it scrolls to the real card, where the full
// explanation lives — the choice is still made in one place, with one checkbox,
// and nothing is ever added from up here.
function palmGv4AddOnTeaserMarkup() {
  const assignment = ensurePalmNameAlignmentSelection();
  if (assignment?.variant !== 'offer' || !palmNameAlignmentOfferSupported(assignment)) return '';
  const selected = palmNameAlignmentIsSelected();
  return `<button class="palm-addon-teaser${selected ? ' is-selected' : ''}" type="button" data-action="show-name-alignment-offer" data-name-alignment-teaser data-paywall-section="addon_teaser">
    <span class="palm-addon-teaser__glyph" aria-hidden="true">✦</span>
    <span class="palm-addon-teaser__copy">
      <b>Does the name you use support your palm?</b>
      <small data-name-alignment-teaser-note>${selected
        ? 'Added to your report · tap to review'
        : `Optional Name Alignment · <b>${escapeHtml(taxablePriceLabel(palmNameAlignmentAddOnPrice()))}</b>`}</small>
    </span>
    <span class="palm-addon-teaser__chevron" aria-hidden="true"></span>
  </button>`;
}

function palmNameAlignmentOfferMarkup() {
  const selected = palmNameAlignmentIsSelected();
  const locked = palmNameAlignmentSelectionIsLocked();
  return `<div class="palm-name-enhancement${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}" data-name-alignment-offer data-paywall-section="name_alignment_offer">
    <div class="palm-name-enhancement__eyebrow"><span aria-hidden="true">✦</span><b>Optional Name Alignment · Added throughout your Palm report</b></div>
    <h3>Does the name you use strengthen what your Palm already reveals?</h3>
    <p class="palm-name-enhancement__body">Add a deeper Chaldean comparison for the exact name you entered. We’ll compare its Name Number with your Birth and Destiny Numbers, then connect the result with your Palm and birth chart across career, money, love and recognition.</p>
    <p class="palm-name-enhancement__name">Name used for this comparison: <b>${escapeHtml(formatName(state.answers.name || '') || 'Your entered name')}</b></p>
    <div class="palm-name-enhancement__areas" aria-label="Areas included"><span>Career</span><span>Money</span><span>Love</span><span>Recognition</span></div>
    <label class="name-addon-control" for="palmNameAlignmentAddon">
      <input id="palmNameAlignmentAddon" type="checkbox" data-name-alignment-toggle ${selected ? 'checked' : ''} ${state.checkoutLoading || locked ? 'disabled' : ''} />
      <span class="name-addon-control__check" aria-hidden="true"></span>
      <span class="name-addon-control__copy"><b>Add Name Alignment to my Palm report</b><small>One enhanced report—not a separate product</small></span>
      <span class="name-addon-control__price"><s>${escapeHtml(taxablePriceLabel(PALM_NAME_ALIGNMENT_COMPARE_AT_INR))}</s><b>${escapeHtml(taxablePriceLabel(palmNameAlignmentAddOnPrice()))}</b>${gstDisclosureMarkup(palmNameAlignmentAddOnPrice())}</span>
    </label>
    <div class="palm-name-enhancement__selection" aria-live="polite"><span data-name-alignment-selection-copy>${palmNameAlignmentSelectionCopy()}</span><b><span data-name-alignment-total>${escapeHtml(payablePriceLabel(palmCheckoutTaxableValue()))}</span><small class="gst-note" data-name-alignment-gst ${checkoutUsesExclusiveGst() ? '' : 'hidden'}>${escapeHtml(gstDisclosureCopy(palmCheckoutTaxableValue()))}</small></b></div>
    <p class="palm-name-enhancement__promise">Your love, career, money and recognition sections will each explain what the name you entered adds.</p>
    <p class="palm-name-enhancement__lock-note" data-name-alignment-lock-note ${locked ? '' : 'hidden'}>Your report choice is locked while this payment attempt is open.</p>
  </div>`;
}

function socialBonusMarkup(config) {
  return `<div class="social-bonus social-bonus--secondary" data-testid="social-bonus">
    <div class="social-bonus__copy"><small>Optional Story card</small><b>${escapeHtml(config.socialBonusTitle)}</b><p>${escapeHtml(config.socialBonusCopy)}</p><span>Nothing is posted or sent automatically.</span></div>
    <div class="social-bonus__teaser" aria-hidden="true"><small>ASTRO VELA · STORY</small><b>${escapeHtml(config.shareMysteryTitle)}</b><span>Choose what to show</span></div>
  </div>`;
}

function outlookText(value, keys = []) {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (Array.isArray(value)) return value.map((item) => outlookText(item, keys)).filter(Boolean).join(' ');
  if (!value || typeof value !== 'object') return '';
  for (const key of keys) {
    const text = outlookText(value[key]);
    if (text) return text;
  }
  return '';
}

function palmLifeOutlookPreview() {
  const direct = state.preview?.lifeOutlook;
  if (direct && typeof direct === 'object') return direct;
  const nested = state.preview?.lanePreview?.lifeOutlook;
  return nested && typeof nested === 'object' ? nested : {};
}

function palmOutlookHeadline(outlook = palmLifeOutlookPreview()) {
  return outlookText(outlook.headline, ['headline', 'title', 'value']);
}

function palmLifeSequence(outlook = palmLifeOutlookPreview()) {
  return outlookText(outlook.lifeSequence, ['summary', 'sequence', 'value', 'headline']);
}

function palmPositiveTurningPoint(outlook = palmLifeOutlookPreview()) {
  return outlookText(outlook.positiveTurningPoint, ['headline', 'title', 'summary', 'verdict', 'value', 'why']);
}

function palmWindowText(value) {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  if (!value || typeof value !== 'object') return '';
  for (const key of ['window', 'dateRange', 'yearRange', 'ageRange', 'range', 'period', 'timing']) {
    const explicit = palmWindowText(value[key]);
    if (explicit) return explicit;
  }
  const start = outlookText(value.start || value.from || value.startDate);
  const end = outlookText(value.end || value.to || value.endDate);
  return start && end ? `${start}–${end}` : start || end;
}

function palmStrongestWindow(outlook = palmLifeOutlookPreview()) {
  const source = outlook.strongestWindow || outlook.positiveTurningPoint?.window || '';
  const window = palmWindowText(source);
  if (!window || /unavailable|not supported|no narrow|not enough/i.test(window)) return { title: '', window: '' };
  const title = typeof source === 'object'
    ? outlookText(source, ['headline', 'title', 'label', 'area', 'verdict'])
    : '';
  return { title: title || 'Your strongest supported period', window };
}

function safePalmTimingClue(value) {
  const clue = outlookText(value, ['startClue', 'startsClue', 'beginsClue', 'startHint', 'startsIn', 'beginsIn', 'starts', 'value', 'summary']);
  if (!clue || !/[a-z]/i.test(clue)) return '';
  const exactMonth = /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;
  const exactYear = /\b(?:19|20)\d{2}\b/;
  const numericRange = /\b\d{1,4}\s*(?:[-–—]|to|through|until)\s*\d{1,4}\b/i;
  const numericDate = /\b\d{1,2}[/.]\d{1,2}(?:[/.]\d{2,4})?\b/;
  if (exactMonth.test(clue) || exactYear.test(clue) || numericRange.test(clue) || numericDate.test(clue)) return '';
  return clue.slice(0, 90);
}

function palmProofReceipt(value) {
  if (!value || typeof value !== 'object') return null;
  const factId = outlookText(value, ['factId']);
  const sourceLabel = outlookText(value, ['sourceLabel']);
  const shortLabel = outlookText(value, ['shortLabel']);
  if (!factId || !sourceLabel || !shortLabel) return null;
  return {
    factId,
    sourceFamily: outlookText(value, ['sourceFamily']),
    sourceLabel,
    shortLabel,
    observedClause: outlookText(value, ['observedClause'])
  };
}

function palmFindingProof(value) {
  if (!value || typeof value !== 'object') return null;
  const receipts = Array.isArray(value.receipts)
    ? value.receipts.map(palmProofReceipt).filter(Boolean)
    : [];
  const observedClause = outlookText(value, ['observedClause']) || receipts[0]?.observedClause || '';
  const interpretation = outlookText(value, ['interpretation', 'statement']);
  const lineLabel = outlookText(value, ['lineLabel']);
  const shortLabel = outlookText(value, ['shortLabel']) || receipts[0]?.shortLabel || '';
  if (!observedClause && !interpretation) return null;
  return {
    areaKey: outlookText(value, ['areaKey']),
    sourceLabel: outlookText(value, ['sourceLabel']) || 'Palm photo',
    lineLabel,
    shortLabel,
    observedClause,
    interpretation,
    receipts
  };
}

// Historical G payloads remain Palm-observation led. The v3 payload can also
// reveal the supported strongest result when its matching Palm line is absent;
// in that case the server supplies a reviewed calculation receipt instead.
function palmStrongestFinding(outlook = palmLifeOutlookPreview()) {
  const source = outlook.strongestFinding;
  if (!source || typeof source !== 'object') return null;
  const areaKeys = Array.isArray(source.areaKeys)
    ? source.areaKeys.map((key) => String(key || '').trim()).filter(Boolean)
    : [];
  const areaLabel = outlookText(source, ['areaLabel', 'label', 'title']);
  const palmObservation = outlookText(source, ['palmObservation', 'meaning', 'summary']);
  const version = outlookText(source, ['version']);
  const selectionSource = source.selection && typeof source.selection === 'object'
    ? source.selection
    : {};
  const selection = {
    kind: outlookText(selectionSource, ['kind']),
    statement: outlookText(selectionSource, ['statement']),
    timingLocked: selectionSource.timingLocked !== false
  };
  const palmProofs = [
    ...(Array.isArray(source.palmProofs) ? source.palmProofs : []),
    ...(source.palmProof ? [source.palmProof] : [])
  ].map(palmFindingProof).filter(Boolean);
  const corroborationSource = source.corroboration && typeof source.corroboration === 'object'
    ? source.corroboration
    : null;
  const corroboration = corroborationSource
    ? {
        statement: outlookText(corroborationSource, ['statement']),
        receipts: Array.isArray(corroborationSource.receipts)
          ? corroborationSource.receipts.map(palmProofReceipt).filter(Boolean)
          : []
      }
    : null;
  const receipts = Array.isArray(source.receipts)
    ? source.receipts.map(palmProofReceipt).filter(Boolean)
    : [];
  const isRankedV3 = version === 'palm_strongest_proof_v3'
    || Boolean(selection.statement && Object.hasOwn(source, 'palmProof'));
  if (!areaKeys.length || !areaLabel) return null;
  if (isRankedV3 && !selection.statement) return null;
  if (!isRankedV3 && !palmObservation) return null;
  return {
    version,
    areaKeys,
    areaLabel,
    shared: source.shared === true,
    palmObservation,
    selection,
    palmProofs,
    receipts,
    corroboration: corroboration?.statement ? corroboration : null,
    reportExcerpt: outlookText(source, ['reportExcerpt'])
  };
}

function palmTimingHint(outlook = palmLifeOutlookPreview()) {
  const source = outlook.timingHint || outlook.futureTimingHint || outlook.startTimingHint || '';
  const startClue = safePalmTimingClue(source);
  const sourcePrecision = typeof source === 'object' && source ? String(source.precision || '') : '';
  const unknownTimePurchaseFallback = state.lane === 'palm_answers'
    && state.screen === 'unlock'
    && (state.answers.birthTime === 'unknown' || state.preview?.chart?.precision === 'solar');
  const yearLevel = sourcePrecision === 'year'
    || (typeof source === 'object' && source?.yearLocked === true)
    || unknownTimePurchaseFallback;
  const timingAvailable = yearLevel || outlook.timingAvailable !== false;
  const status = typeof source === 'object' && source ? String(source.status || '') : '';
  return {
    timingAvailable,
    status,
    precision: yearLevel ? 'year' : sourcePrecision,
    yearLevel,
    hasStartClue: Boolean(startClue),
    startClue: startClue || (yearLevel
      ? 'Your future year is ready in the full report'
      : timingAvailable ? 'Exact start in the full report' : 'Broader future timing only')
  };
}

function palmPaywallAreaTeasersE(lines = palmLineNames()) {
  const hasLifeLine = lines.includes('life');
  return [
    {
      icon: '↗',
      label: PALM_LIFE_AREA_TITLES.careerSuccess,
      question: 'When does my biggest professional rise begin?',
      lock: 'Rise period + strongest route'
    },
    {
      icon: '₹',
      label: PALM_LIFE_AREA_TITLES.moneyWealth,
      question: 'When does wealth-building become stronger?',
      lock: 'Wealth period + money pattern'
    },
    {
      icon: '♥',
      label: PALM_LIFE_AREA_TITLES.loveMarriage,
      question: 'Which relationship period stands out most?',
      lock: 'Love period + marriage indication'
    },
    {
      icon: '⌂',
      label: PALM_LIFE_AREA_TITLES.familyChildren,
      question: 'Which family period becomes most important?',
      lock: 'Family period + children indication'
    },
    {
      icon: '✦',
      label: PALM_LIFE_AREA_TITLES.recognition,
      question: 'When does my name become more visible?',
      lock: 'Recognition period + visibility trigger'
    },
    {
      icon: '◐',
      label: PALM_LIFE_AREA_TITLES.wellbeingEnergy,
      question: hasLifeLine
        ? 'What does my Life Line show about the years ahead?'
        : 'What does my Palm show about energy and the years ahead?',
      lock: 'Energy and recovery period + long-term energy pattern'
    }
  ];
}

function palmLockedQuestions(config) {
  const questions = [
    'Which part of my life changes first?',
    'What are my next three important phases?',
    'What is shaping my current phase?'
  ];
  return questions.filter((question) => !removedReportText(question));
}

function palmLockedAreaLabels(config) {
  const outlook = palmLifeOutlookPreview();
  const configured = (config.paywallQuestions || []).filter((item) => item?.title);
  const statedCount = Number(outlook.lockedResultCount);
  const count = Number.isInteger(statedCount) && statedCount >= 0
    ? Math.min(statedCount, configured.length)
    : configured.length;
  return configured.slice(0, count);
}

// The G proof card reuses the post-scan dock treatment: the customer's own
// hand, mapped, at chip size. It falls back to E's medallion whenever the
// scan preview is not available on this load (payment return, restore).
function palmGv4ProofMarkup(isGv5 = false) {
  const focus = palmDockFocus();
  const ratio = (value) => Math.round((value / focus.span) * 10000) / 10000;
  const cropStyle = `--palm-dock-width:${ratio(focus.width)};--palm-dock-height:${ratio(focus.height)};--palm-dock-x:${ratio(focus.centerX)};--palm-dock-y:${ratio(focus.centerY)}`;
  const chip = state.palmPreviewUrl
    ? `<figure class="palm-scan-result__hand palm-dock__chip" style="${escapeHtml(cropStyle)}"><span class="palm-dock__crop"><img src="${escapeHtml(state.palmPreviewUrl)}" alt="Your scanned palm with its mapped lines" />${palmOverlaySvg()}</span></figure>`
    : '<div class="palm-scan-result__count" aria-label="Palm lines mapped"><b aria-hidden="true"><i></i><i></i><i></i></b><small>Palm lines<br />mapped</small></div>';
  return `<div class="personal-proof personal-proof--palm-gap palm-scan-result palm-scan-result--g-hand" data-paywall-section="palm_proof">
    <div class="palm-scan-result__top">
      ${chip}
      <div class="palm-scan-result__copy"><small>Read from this hand</small><b>These are your own lines, not a general chart.</b><p>${isGv5 ? 'Every answer below is calculated from this scan and your birth details.' : 'Every answer below is calculated from this scan, your birth details and your name number.'}</p></div>
    </div>
    <div class="palm-scan-result__steps" aria-label="New sections inside your Palm report">
      <div><em>01</em><small>The area that moves first</small></div>
      <div><em>02</em><small>Why this phase feels the way it does</small></div>
      <div><em>03</em><small>The three periods coming next</small></div>
    </div>
    <div class="palm-scan-result__unlock"><i aria-hidden="true"></i><strong>All six areas open together, with what to do next</strong></div>
    <p class="palm-scan-result__trust">Palm + birth details <i aria-hidden="true">\u00b7</i> Downloadable PDF</p>
  </div>`;
}

// ---- 6: G's locked answer sheet. Same six areas and the same locked promise as
// E, rewritten as questions a customer would actually ask out loud.
function palmGv4LockedPreviewMarkup(isGv5 = false) {
  const rows = [
    { icon: '\u2197', label: 'Career and business', q: isGv5 ? 'When does my career finally move up?' : 'When does my rise actually begin?', lock: 'The years, and the route that works for you' },
    { icon: '\u20b9', label: 'Money and wealth', q: 'When does money stop feeling tight?', lock: 'Your wealth period, and the pattern behind it' },
    { icon: '\u2665', label: 'Marriage and relationship', q: isGv5 ? 'Which years decide my marriage?' : 'Which years decide this for me?', lock: 'Your love period, and what it indicates' },
    { icon: '\u2302', label: 'Children and family', q: 'Which years matter most at home?', lock: 'Your family period, and what it indicates' },
    { icon: '\u2726', label: 'Recognition', q: 'When do people finally notice my work?', lock: 'Your recognition period, and what triggers it' },
    { icon: '\u25d0', label: 'Energy and health', q: isGv5 ? 'Which years do I need to slow down?' : 'Which years should I protect my energy?', lock: 'Your recovery period, and your long-term pattern' }
  ];
  return `<section class="locked-report-preview locked-report-preview--palm-gap" data-testid="locked-report-preview" data-paywall-section="locked_answers">
    <div class="locked-report-preview__head"><small>Your complete life answer sheet</small><h2>${isGv5 ? 'Your palm has already answered these six questions.' : 'Six answers are ready. Not one is open yet.'}</h2><p>${isGv5 ? 'Each answer is calculated from your own lines and your birth details. All six open together.' : 'Each one is calculated from your palm, birth details and name number. They open together.'}</p></div>
    <div class="palm-private-answer-grid">${rows.map((row) => `<article class="palm-private-answer" data-testid="locked-insight">
      <div class="palm-private-answer__head"><i aria-hidden="true">${escapeHtml(row.icon)}</i><small>${escapeHtml(row.label)}</small></div>
      <h3>${escapeHtml(row.q)}</h3>
      <div class="palm-private-answer__lock"><span>${escapeHtml(row.lock)}</span><i aria-hidden="true"></i></div>
    </article>`).join('')}</div>
    <p class="palm-locked-coverage">Every area opens in one connected Palm timeline.</p>
  </section>`;
}

// Trust-proof cohort blocks. Both are purely additive: E renders neither, and
// nothing else on the page changes. Every claim here is limited to what the
// published refund policy actually promises — delivery and accuracy, never
// satisfaction.
// The server floors the delivered total to the nearest 1,000, so this row only
// changes once per 1,000 completed orders. If the server could not stand behind
// a milestone it sends 0 and the row is omitted entirely rather than showing a
// number we cannot evidence.
function deliveredOnlineRow() {
  const milestone = Math.floor(Number(RUNTIME_CONFIG.trust?.deliveredMilestone) || 0);
  if (!(milestone >= 1000)) return '';
  return `<div><i aria-hidden="true">✓</i><b>${escapeHtml(`${Math.floor(milestone / 1000)}k+ reports delivered online`)}</b></div>`;
}

function palmGv4TrustBlockMarkup(isGv5 = false) {
  return `<div class="palm-trust-proof" data-paywall-section="trust_proof" data-testid="palm-trust-proof">
    ${isGv5
      ? `<div><i aria-hidden="true">\u2726</i><b>15 years of helping people</b></div>${deliveredOnlineRow()}`
      : `<div><i aria-hidden="true">\u25c9</i><b>12,000+ palm reports delivered</b></div>`}
    <div><i aria-hidden="true">\u21ba</i><b>Doesn't reach you? Full refund.</b></div>
    <div><i aria-hidden="true">\u270e</i><b>Details wrong? We regenerate it free.</b></div>
    <div class="palm-trust-proof__reach"><span>Reach us anytime</span>
      <a href="mailto:readings@tarotbyvela.com" aria-label="Email readings@tarotbyvela.com"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" aria-hidden="true"><rect x="2.6" y="4.6" width="18.8" height="14.8" rx="2.6"/><path d="m3.4 7.4 8.6 5.8 8.6-5.8"/></svg></a>
    </div>
  </div>`;
}

function palmLockedReportPreviewMarkupE(config) {
  const areas = palmLockedAreaLabels(config);
  const answers = palmPaywallAreaTeasersE();
  if (!answers.length && !areas.length) return '';
  return `<section class="locked-report-preview locked-report-preview--palm-gap" data-testid="locked-report-preview" data-paywall-section="locked_answers">
    <div class="locked-report-preview__head"><small>Your complete life answer sheet</small><h2>Six parts of your life. One becomes stronger first.</h2><p>Open the strongest period, available Palm evidence and practical next move for every area.</p></div>
    <div class="palm-private-answer-grid">${answers.map((answer) => `<article class="palm-private-answer" data-testid="locked-insight">
      <div class="palm-private-answer__head"><i aria-hidden="true">${escapeHtml(answer.icon)}</i><small>${escapeHtml(answer.label)}</small></div>
      <h3>${escapeHtml(answer.question)}</h3>
      <div class="palm-private-answer__lock"><span>${escapeHtml(answer.lock)}</span><i aria-hidden="true"></i></div>
    </article>`).join('')}</div>
    ${areas.length ? '<p class="palm-locked-coverage">Every area opens in one connected Palm timeline.</p>' : ''}
  </section>`;
}

const PALM_G_V3_AREA_LABELS = Object.freeze({
  loveMarriage: 'Love & Commitment',
  familyChildren: 'Family & Home',
  careerSuccess: 'Career & Business',
  moneyWealth: 'Money & Wealth',
  recognition: 'Recognition & Visibility',
  wellbeingEnergy: 'Energy & Recovery'
});

const PALM_G_V3_HERO_TITLE_FRAGMENTS = Object.freeze({
  loveMarriage: 'your clearest positive shift ahead is in love and commitment.',
  familyChildren: 'your clearest positive shift ahead is in family and home.',
  careerSuccess: 'your clearest rise ahead is in career and business.',
  moneyWealth: 'stronger finances are your clearest shift ahead.',
  recognition: 'your clearest rise ahead is in recognition and visibility.',
  wellbeingEnergy: 'your clearest positive shift ahead is in energy and recovery.'
});

const PALM_G_V3_PATTERN_LABELS = Object.freeze({
  loveMarriage: 'relationship',
  familyChildren: 'family',
  careerSuccess: 'career',
  moneyWealth: 'money',
  recognition: 'visibility',
  wellbeingEnergy: 'energy'
});

const PALM_G_V3_PREVIEW_SHIFT_LABELS = Object.freeze({
  loveMarriage: 'relationship shift',
  familyChildren: 'family chapter',
  careerSuccess: 'career rise',
  moneyWealth: 'money upswing',
  recognition: 'visibility rise',
  wellbeingEnergy: 'energy upswing'
});

function palmGv3AreaLabel(finding) {
  if (!finding) return 'Your strongest result';
  if (finding.shared) return finding.areaLabel;
  return PALM_G_V3_AREA_LABELS[finding.areaKeys[0]] || finding.areaLabel;
}

function palmGv3TimingState(timingHint = {}) {
  if (timingHint.status === 'active') return 'active';
  if (timingHint.status === 'upcoming' || timingHint.hasStartClue || timingHint.yearLevel) return 'upcoming';
  return 'broad';
}

function palmGv3HeroCopy(finding, readerName = '', timingHint = {}) {
  if (!finding) {
    return {
      title: PALM_G_V3_COPY.unlockTitle,
      subline: PALM_G_V3_COPY.unlockSubline
    };
  }
  const areaLabel = palmGv3AreaLabel(finding);
  const timingState = palmGv3TimingState(timingHint);
  if (finding.shared) {
    return {
      title: `${readerName ? `${readerName}, two` : 'Two'} life areas rise together at the top of your reading.`,
      subline: timingState === 'active'
        ? 'These two stronger phases have already begun. See how long they continue and what may help now.'
        : timingState === 'upcoming'
          ? 'These two life areas are moving into a stronger phase together. See when they begin and what changes first.'
          : `${areaLabel} are the strongest areas in your reading. See when their stronger period begins and what is shaping it now.`
    };
  }
  const areaKey = finding.areaKeys[0];
  const patternLabel = PALM_G_V3_PATTERN_LABELS[areaKey] || areaLabel.toLowerCase();
  const titleFragment = PALM_G_V3_HERO_TITLE_FRAGMENTS[finding.areaKeys[0]]
    || `your strongest positive shift ahead is in ${areaLabel}.`;
  return {
    title: readerName
      ? `${readerName}, ${titleFragment}`
      : `${titleFragment.charAt(0).toUpperCase()}${titleFragment.slice(1)}`,
    subline: timingState === 'active'
      ? `Your stronger ${patternLabel} phase has already begun. See how long it continues and what may help now.`
      : timingState === 'upcoming'
        ? `Your ${patternLabel} pattern is moving into a stronger phase. See when it begins and what changes first.`
        : `Your reading shows a stronger ${patternLabel} phase ahead. See when it begins and what is shaping it now.`
  };
}

function palmGv3ProofCopy(finding) {
  if (!finding) return '';
  const proof = finding.palmProofs[0];
  if (proof && finding.palmObservation) return finding.palmObservation;
  const receipt = finding.receipts[0];
  return receipt?.observedClause || finding.palmObservation || proof?.interpretation || proof?.observedClause || '';
}

function palmGv3ResultMarkup(finding, {
  checkoutAction = 'checkout',
  checkoutLabel = '',
  checkoutLoading = false,
  timingHint = {}
} = {}) {
  if (!finding) return '';
  const areaLabel = palmGv3AreaLabel(finding);
  const proof = finding.palmProofs[0] || finding.receipts[0] || null;
  const proofCopy = palmGv3ProofCopy(finding);
  const resultCount = Math.max(1, finding.areaKeys.length);
  const remainingCount = Math.max(0, 6 - resultCount);
  const receipts = finding.corroboration?.receipts || [];
  const showCheckoutPrice = checkoutAction === 'checkout' && !checkoutLoading;
  const checkoutLabelForAssistiveTech = showCheckoutPrice
    ? checkoutAriaLabel(checkoutLabel, palmCheckoutTaxableValue())
    : checkoutLabel;
  return `<section class="g-v3-result-card" data-testid="g-v3-result-card" data-paywall-section="palm_proof" data-proof-type="ranked_free_result">
    <div class="g-v3-result-card__eyebrow"><span>Free result</span><b>${finding.shared ? 'Top result revealed' : '1 of 6 revealed'}</b></div>
    <div class="g-v3-result-card__rank"><strong>#1</strong><div><small>${finding.shared ? 'Shared strongest area' : 'Strongest life area'}</small><h2>${escapeHtml(areaLabel)}</h2></div></div>
    <p class="g-v3-result-card__selection">${escapeHtml(finding.selection.statement)}</p>
    ${proofCopy ? `<div class="g-v3-proof">
      <div class="g-v3-proof__label"><span aria-hidden="true">⌁</span><small>${escapeHtml(proof?.sourceLabel || 'Palm clue')}</small>${proof?.shortLabel ? `<b>${escapeHtml(proof.shortLabel)}</b>` : ''}</div>
      <p>${escapeHtml(proofCopy)}</p>
    </div>` : ''}
    <div class="g-v3-result-card__cta"><button class="primary-button" type="button" data-action="${checkoutAction}" data-palm-checkout data-placement="free_result" data-testid="checkout-button-result" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>${showCheckoutPrice ? checkoutPriceNoteMarkup(palmCheckoutTaxableValue()) : ''}<small>One-time payment · Opens here · No subscription</small></div>
    ${finding.corroboration ? `<div class="g-v3-cross-check">
      <small>What supports this result</small>
      <p>${escapeHtml(finding.corroboration.statement)}</p>
      ${receipts.length ? `<div>${receipts.slice(0, 2).map((receipt) => `<span>${escapeHtml(receipt.shortLabel)}</span>`).join('')}</div>` : ''}
    </div>` : ''}
    <div class="g-v3-result-card__locked">
      <small>Inside your complete timeline</small>
      <div><span>${timingHint.yearLevel ? 'Strongest year' : 'Stronger period'}</span><span>How it develops</span><span>${timingHint.yearLevel ? 'Current Palm + birth-date phase' : 'Current phase + simple upay'}</span><span>${remainingCount} remaining ${remainingCount === 1 ? 'area' : 'areas'}</span></div>
    </div>
  </section>`;
}

function palmGv3ReportPreviewLead(finding, timingHint = {}) {
  const timingState = palmGv3TimingState(timingHint);
  if (finding?.shared) {
    if (timingState === 'active') {
      return 'Your two strongest phases have already started. Their most important turn comes when…';
    }
    if (timingState === 'upcoming') {
      return 'Your next major shift is approaching. These two areas begin strengthening together when…';
    }
    return 'Two stronger life phases are ahead. Their timing begins to connect when…';
  }
  const areaKey = finding?.areaKeys?.[0];
  const shiftLabel = PALM_G_V3_PREVIEW_SHIFT_LABELS[areaKey] || 'positive shift';
  const patternLabel = PALM_G_V3_PATTERN_LABELS[areaKey] || 'life';
  if (timingState === 'active') {
    return `Your ${shiftLabel} has already started. Its strongest turn comes when…`;
  }
  if (timingState === 'upcoming') {
    return `Your next ${shiftLabel} is approaching. The change begins when…`;
  }
  return `A stronger ${patternLabel} phase is ahead. The change builds when…`;
}

function palmLockedReportPreviewMarkupG(finding, timingHint = {}) {
  const areaLabel = palmGv3AreaLabel(finding);
  const previewLead = palmGv3ReportPreviewLead(finding, timingHint);
  const rows = [
    { icon: '◷', label: `When ${areaLabel} becomes stronger`, detail: timingHint.yearLevel ? 'Strongest year + why it matters' : 'Stronger period + why it matters' },
    { icon: '↗', label: 'How this result develops', detail: 'Likely developments + what may help' },
    { icon: '✦', label: 'What comes after it', detail: 'Your next important life phase' },
    { icon: '6', label: 'Your complete six-area timeline', detail: 'All answers + downloadable PDF' }
  ];
  return `<section class="g-v3-report-preview" data-testid="locked-report-preview" data-paywall-section="locked_answers">
    <div class="g-v3-report-preview__head"><small>Inside your complete report</small><h2>Your #1 result is only the beginning.</h2><p>Continue from the free result into its timing, development and the rest of your personal timeline.</p></div>
    <article class="g-v3-report-excerpt" data-testid="g-v3-report-excerpt">
      <small>${escapeHtml(areaLabel)} · report preview</small>
      <p>${escapeHtml(previewLead)}</p>
      <div class="g-v3-report-excerpt__fade" aria-label="When it begins, why it matters and what to do first are locked"><span></span><span></span><b><i aria-hidden="true"></i> When it begins · why it matters · what to do first</b></div>
    </article>
    <div class="g-v3-locked-list">${rows.map((row) => `<article data-testid="locked-insight"><i aria-hidden="true">${escapeHtml(row.icon)}</i><div><b>${escapeHtml(row.label)}</b><small>${escapeHtml(row.detail)}</small></div><span aria-hidden="true"></span></article>`).join('')}</div>
  </section>`;
}

function lockedReportPreviewMarkup(config) {
  const insightSet = state.preview?.revealedInsights || {};
  if (state.lane === 'palm_answers') {
    const questions = palmLockedQuestions(config);
    const areas = palmLockedAreaLabels(config);
    if (!questions.length && !areas.length) return '';
    return `<section class="locked-report-preview locked-report-preview--palm-gap" data-testid="locked-report-preview">
      <div class="locked-report-preview__head"><small>Answered in your full report</small><h2>The questions you came here to answer</h2></div>
      ${questions.length ? `<div class="locked-question-list">${questions.map((question, index) => `<article class="locked-question" data-testid="locked-insight"><span>${String(index + 1).padStart(2, '0')}</span><b>${escapeHtml(question)}</b><i aria-hidden="true">🔒</i></article>`).join('')}</div>` : ''}
      ${areas.length ? `<div class="locked-area-summary"><small>Compared across ${areas.length} parts of life</small><div class="locked-area-chips">${areas.map((area) => `<span><i aria-hidden="true">${escapeHtml(area.emoji || '✦')}</i>${escapeHtml(area.title)}<em aria-hidden="true">🔒</em></span>`).join('')}</div></div>` : ''}
    </section>`;
  }
  const fallbackRows = Array.isArray(config.paywallQuestions) && config.paywallQuestions.length
    ? config.paywallQuestions
    : (config.deliverables || []).slice(0, 3).map((title) => ({ emoji: '✦', title, leadIn: 'Read your result, the reason behind it and the next step.' }));
  const marketPaywall = state.lane === 'market_profile';
  const sourceRows = !marketPaywall && Array.isArray(insightSet.locked) && insightSet.locked.length
    ? [...insightSet.locked, ...fallbackRows]
    : fallbackRows;
  const rowLimit = state.lane === 'face_answers' ? 6 : 3;
  const rows = sourceRows
    .filter((item) => item?.title && item?.leadIn && !removedReportText(`${item.title} ${item.leadIn}`))
    .slice(0, rowLimit);
  if (!rows.length) return '';
  const behaviorSection = ADDITIONAL_REPORT_PAYWALL_TARGET_LANES.has(state.lane)
    ? ' data-paywall-section="locked_answers"'
    : '';
  return `<section class="locked-report-preview" data-testid="locked-report-preview"${behaviorSection}>
    <div class="locked-report-preview__head"><small>${marketPaywall ? 'Your complete market profile' : state.lane === 'face_answers' ? 'Inside Part 2 · Your Complete Life Timeline' : 'What the full report adds'}</small><h2>${marketPaywall ? `${rows.length} personal answers are still locked` : state.lane === 'face_answers' ? `${rows.length} personal timelines are ready—and still locked` : `${rows.length} questions still unanswered`}</h2><p>${marketPaywall ? 'Your calculation found each answer. Open the full report to see them together.' : state.lane === 'face_answers' ? 'Your portrait supplies a first-impression lens for this photo. Your chart and numbers identify the key period, how the phase develops and what to do for every area.' : 'You have the first result. These answers explain what it means and what to do next.'}</p></div>
    <div class="locked-report-preview__rows">${rows.map((item) => `<article class="locked-insight" data-testid="locked-insight">
      <div class="locked-insight__head"><i aria-hidden="true">${escapeHtml(item.emoji || '✦')}</i><b>${escapeHtml(item.title)}</b><small>Full report</small></div>
      <p>${escapeHtml(item.leadIn)}</p>
      <div class="locked-insight__mask" aria-hidden="true"><span></span><span></span><em>🔒</em></div>
    </article>`).join('')}</div>
    <div class="locked-report-preview__foot">${marketPaywall ? 'See all three answers, what supports them and the rules to use.' : state.lane === 'face_answers' ? 'Unlock all six timelines, your ordered three-phase view and the practical preparation for each.' : 'Get the full report to read each answer, the reason behind it and a practical next step.'}</div>
  </section>`;
}

function referralArrivalMarkup() {
  if (!REFERRAL_CODE) return '';
  return '<div class="referral-arrival" data-testid="referral-arrival">Someone shared a PalmQ IND result with you. Their details remain private. Start your own reading below.</div>';
}

function screenMeta() {
  const currentFlow = flow();
  return {
    screen_id: state.screen,
    screen_name: state.screen,
    funnel_step_index: Math.max(0, currentFlow.indexOf(state.screen)) + 1,
    funnel_step_total: currentFlow.length,
    angle: state.resolvedAngle,
    raw_angle: state.rawAngle,
    resolved_angle: state.resolvedAngle,
    lane: state.lane,
    funnel_version: FUNNEL_VERSION,
    copy_version: activeCopyVersion(),
    paywall_variant: activePalmPaywallVariant(),
    ...palmLandingCheckpointAnalytics(),
    ...palmProofDensityExperimentAnalytics(),
    ...palmProofDensityPageValidationAnalytics(),
    ...palmGatewayRecoveryExperimentAnalytics(),
    ...palmGatewayRecoveryPageValidationAnalytics(),
    ...marketLandingExperimentAnalytics(),
    ...palmNameAlignmentExperimentAnalytics(),
    ...crossSellIdentityAnalytics(state.crossSellIdentity),
    traffic_class: isCharityGrantSession()
      ? 'noncommercial_charity'
      : CROSS_SELL_QA_ACTIVE ? 'operator_test' : 'commercial',
    reading_id: state.readingId || ''
  };
}

function nextEventId(name) {
  state.eventSeq += 1;
  persist();
  const sessionPart = String(state.analyticsSessionId).replace(/[^a-z0-9]/gi, '').slice(-14);
  return `evt_${String(name).replace(/[^a-z0-9_]/gi, '').slice(0, 32)}_${Date.now().toString(36)}_${state.eventSeq}_${sessionPart}`;
}

function postAnalytics(name, properties, eventId, now) {
  if (IS_GLOBAL_STOREFRONT) return;
  const payload = {
    event: name,
    event_id: eventId,
    analytics_session_id: state.analyticsSessionId,
    occurred_at: new Date(now).toISOString(),
    properties: {
      ...properties,
      path: location.pathname,
      search: location.search,
      referrer: document.referrer || '',
      utm: state.utm,
      viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio || 1 }
    }
  };
  const body = JSON.stringify(payload);
  try {
    const crossSellIdentity = sanitizeCrossSellIdentity(properties);
    if (
      !CROSS_SELL_QA_ACTIVE
      && !crossSellIdentity
      && navigator.sendBeacon
      && navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    ) return;
    fetch('/api/track', {
      method: 'POST',
      headers: crossSellAnalyticsHeaders({ 'Content-Type': 'application/json' }, properties),
      body,
      keepalive: true
    }).catch(() => {});
  } catch (_) {}
}

const CRITICAL_CROSS_SELL_EVENTS = new Set([
  'recommendation_eligible',
  'recommendation_served',
  'next_reading_recommendation_view',
  'next_reading_recommendation_cta_view',
  'next_reading_recommendation_click',
  'next_reading_prefill_success',
  'next_reading_prefill_failed',
  'next_reading_details_confirmed',
  'reading_preview_created',
  'unlock_view',
  'next_reading_paywall_cta_view',
  'paywall_cta_click',
  'paywall_section_view',
  'paywall_scroll_depth',
  'paywall_time_milestone',
  'paywall_exit',
  'begin_checkout'
]);
const CRITICAL_CROSS_SELL_EVENT_PRIORITY = Object.freeze({
  recommendation_eligible: 100,
  next_reading_recommendation_click: 95,
  reading_preview_created: 95,
  unlock_view: 95,
  paywall_cta_click: 95,
  begin_checkout: 95,
  recommendation_served: 85,
  next_reading_prefill_success: 85,
  next_reading_prefill_failed: 85,
  next_reading_details_confirmed: 85,
  next_reading_recommendation_view: 75,
  next_reading_recommendation_cta_view: 75,
  next_reading_paywall_cta_view: 75,
  paywall_exit: 70,
  paywall_section_view: 10,
  paywall_scroll_depth: 10,
  paywall_time_milestone: 10
});
const CROSS_SELL_EVENT_PROPERTY_ALLOWLIST = new Set([
  'screen_id', 'screen_name', 'funnel_step_index', 'funnel_step_total',
  'angle', 'raw_angle', 'resolved_angle', 'lane', 'funnel_version',
  'copy_version', 'paywall_variant', 'reading_id', 'traffic_class',
  'entry_source', 'elapsed_ms', 'screen_elapsed_ms',
  'cross_sell_source_reading_id', 'cross_sell_source_lane',
  'cross_sell_target_lane', 'cross_sell_recommendation_version',
  'cross_sell_recommendation_mode', 'cross_sell_offer_copy_version',
  'cross_sell_presentation_version',
  'recommendation_version', 'offer_copy_version',
  'recommendation_presentation_version', 'source_lane', 'target_lane',
  'reason_code', 'recommendation_mode', 'timing_state', 'trigger_domains',
  'horizon_months', 'continuation_available', 'attribution_available',
  'verified_attribution', 'placement', 'already_owned', 'offer_mode',
  'taxable_value', 'value', 'currency', 'gst_display', 'viewed_element',
  'visibility_threshold', 'error_code', 'prefill_version', 'edited_fields',
  'paywall_cta_measurement_version', 'paywall_behavior_measurement_version',
  'paywall_visit_id', 'dwell_ms', 'max_scroll_percent', 'last_section',
  'offer_viewed', 'checkout_clicked', 'section_id', 'section_index',
  'visibility_percent', 'scroll_depth', 'current_scroll_depth', 'seconds',
  'exit_reason',
  'birth_time_known', 'reuse_parent_palm', 'product', 'calculation_layers',
  'duration_ms'
]);

function sanitizeCriticalCrossSellProperties(properties = {}) {
  const safe = {};
  for (const key of CROSS_SELL_EVENT_PROPERTY_ALLOWLIST) {
    const value = properties[key];
    if (typeof value === 'string') safe[key] = value.slice(0, 500);
    else if (typeof value === 'number' && Number.isFinite(value)) safe[key] = value;
    else if (typeof value === 'boolean') safe[key] = value;
  }
  return safe;
}

function limitCriticalCrossSellEventQueue(queue) {
  return queue
    .map((item, index) => ({
      item,
      index,
      priority: Number(
        CRITICAL_CROSS_SELL_EVENT_PRIORITY[item?.payload?.event] || 0
      )
    }))
    .sort((left, right) =>
      right.priority - left.priority
      || right.item.createdAt - left.item.createdAt
      || right.index - left.index
    )
    .slice(0, CROSS_SELL_EVENT_QUEUE_LIMIT)
    .map(({ item }) => item)
    .sort((left, right) =>
      left.createdAt - right.createdAt
      || left.eventId.localeCompare(right.eventId)
    );
}

function normalizeCriticalCrossSellQueueItem(raw, now = Date.now()) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const eventId = String(raw.eventId || raw.payload?.event_id || '').trim();
  const event = String(raw.payload?.event || '').trim();
  const createdAt = Number(raw.createdAt || 0);
  const nextAttemptAt = Number(raw.nextAttemptAt || createdAt);
  const properties = sanitizeCriticalCrossSellProperties(raw.payload?.properties);
  if (
    !/^[a-zA-Z0-9_.:-]{6,140}$/.test(eventId)
    || !CRITICAL_CROSS_SELL_EVENTS.has(event)
    || !sanitizeCrossSellIdentity(properties)
    || !Number.isFinite(createdAt)
    || createdAt > now + 60_000
    || now - createdAt > CROSS_SELL_EVENT_QUEUE_TTL_MS
    || !Number.isFinite(nextAttemptAt)
  ) return null;
  const occurredAt = new Date(raw.payload?.occurred_at || createdAt);
  return {
    eventId,
    createdAt,
    attempts: Math.max(0, Math.min(100, Math.floor(Number(raw.attempts || 0)))),
    nextAttemptAt: Math.max(createdAt, nextAttemptAt),
    payload: {
      event,
      event_id: eventId,
      analytics_session_id: String(raw.payload?.analytics_session_id || '').trim().slice(0, 140),
      occurred_at: Number.isFinite(occurredAt.getTime())
        ? occurredAt.toISOString()
        : new Date(createdAt).toISOString(),
      properties
    }
  };
}

function readCriticalCrossSellEventQueue(now = Date.now()) {
  const stored = [];
  const storageKey = CROSS_SELL_QA_ACTIVE
    ? `${CROSS_SELL_EVENT_QUEUE_KEY}:operator_test`
    : CROSS_SELL_EVENT_QUEUE_KEY;
  if (!CROSS_SELL_QA_ACTIVE) {
    try { stored.push(localStorage.getItem(storageKey) || ''); } catch (_) {}
  }
  try { stored.push(sessionStorage.getItem(storageKey) || ''); } catch (_) {}
  const unique = new Map();
  stored.forEach((raw) => {
    try {
      const parsed = JSON.parse(raw || '[]');
      if (!Array.isArray(parsed)) return;
      parsed.forEach((item) => {
        const normalized = normalizeCriticalCrossSellQueueItem(item, now);
        if (normalized) unique.set(normalized.eventId, normalized);
      });
    } catch (_) {}
  });
  return limitCriticalCrossSellEventQueue([...unique.values()]);
}

function writeCriticalCrossSellEventQueue(queue) {
  const normalized = limitCriticalCrossSellEventQueue(queue
    .map((item) => normalizeCriticalCrossSellQueueItem(item))
    .filter(Boolean));
  const value = JSON.stringify(normalized);
  const storageKey = CROSS_SELL_QA_ACTIVE
    ? `${CROSS_SELL_EVENT_QUEUE_KEY}:operator_test`
    : CROSS_SELL_EVENT_QUEUE_KEY;
  if (CROSS_SELL_QA_ACTIVE) {
    try {
      if (normalized.length) sessionStorage.setItem(storageKey, value);
      else sessionStorage.removeItem(storageKey);
      return true;
    } catch (_) {
      return false;
    }
  }
  try {
    if (normalized.length) localStorage.setItem(storageKey, value);
    else localStorage.removeItem(storageKey);
    try { sessionStorage.removeItem(storageKey); } catch (_) {}
    return true;
  } catch (_) {
    try {
      if (normalized.length) sessionStorage.setItem(storageKey, value);
      else sessionStorage.removeItem(storageKey);
      return true;
    } catch (_) {
      return false;
    }
  }
}

let criticalCrossSellQueueFlushPromise = null;
let criticalCrossSellQueueTimer = 0;

function scheduleCriticalCrossSellEventFlush(delayMs) {
  clearTimeout(criticalCrossSellQueueTimer);
  criticalCrossSellQueueTimer = setTimeout(() => {
    void flushCriticalCrossSellEventQueue();
  }, Math.max(250, Math.min(CROSS_SELL_EVENT_RETRY_MAX_MS, Number(delayMs) || 250)));
}

function removeCriticalCrossSellQueuedEvent(eventId) {
  const current = readCriticalCrossSellEventQueue().filter(
    (candidate) => candidate.eventId !== eventId
  );
  writeCriticalCrossSellEventQueue(current);
}

function nonRetryableCrossSellAnalyticsStatus(status) {
  const normalized = Number(status || 0);
  return normalized >= 400
    && normalized < 500
    && ![408, 409, 425, 429].includes(normalized);
}

async function flushCriticalCrossSellEventQueue({ force = false } = {}) {
  if (IS_GLOBAL_STOREFRONT) return;
  if (criticalCrossSellQueueFlushPromise) return criticalCrossSellQueueFlushPromise;
  criticalCrossSellQueueFlushPromise = (async () => {
    if (navigator.onLine === false) return;
    while (true) {
      const now = Date.now();
      const queue = readCriticalCrossSellEventQueue(now);
      if (!queue.length) {
        writeCriticalCrossSellEventQueue([]);
        return;
      }
      const item = queue.find((candidate) => force || candidate.nextAttemptAt <= now);
      if (!item) {
        const nextAttemptAt = queue.reduce(
          (minimum, candidate) => Math.min(minimum, candidate.nextAttemptAt),
          Infinity
        );
        if (Number.isFinite(nextAttemptAt)) {
          scheduleCriticalCrossSellEventFlush(nextAttemptAt - now);
        }
        return;
      }
      try {
        const response = await fetch('/api/track', {
          method: 'POST',
          headers: crossSellAnalyticsHeaders(
            { 'Content-Type': 'application/json' },
            item.payload.properties
          ),
          body: JSON.stringify(item.payload),
          keepalive: true
        });
        const acknowledgement = await response.json().catch(() => null);
        const accepted = response.status === 200
          && acknowledgement?.ok === true
          && Number(acknowledgement?.accepted || 0) >= 1;
        if (accepted) {
          removeCriticalCrossSellQueuedEvent(item.eventId);
          force = false;
          continue;
        }
        if (nonRetryableCrossSellAnalyticsStatus(response.status)) {
          // A definitive client rejection cannot head-of-line block later
          // valid events. Network failures, 5xx and transient 4xx remain queued.
          removeCriticalCrossSellQueuedEvent(item.eventId);
          force = false;
          continue;
        }
        throw new Error(
          String(acknowledgement?.error || 'Cross-sell analytics event was not acknowledged.')
        );
      } catch (_) {
        const attempts = Math.min(100, item.attempts + 1);
        const retryDelay = Math.min(
          CROSS_SELL_EVENT_RETRY_MAX_MS,
          1000 * (2 ** Math.min(6, attempts - 1))
        );
        const current = readCriticalCrossSellEventQueue().map((candidate) =>
          candidate.eventId === item.eventId
            ? { ...candidate, attempts, nextAttemptAt: Date.now() + retryDelay }
            : candidate
        );
        writeCriticalCrossSellEventQueue(current);
        scheduleCriticalCrossSellEventFlush(retryDelay);
        return;
      }
    }
  })().finally(() => {
    criticalCrossSellQueueFlushPromise = null;
  });
  return criticalCrossSellQueueFlushPromise;
}

function enqueueCriticalCrossSellEvent(name, properties, eventId, now) {
  if (IS_GLOBAL_STOREFRONT) return false;
  if (!CRITICAL_CROSS_SELL_EVENTS.has(name)) return false;
  const safeProperties = sanitizeCriticalCrossSellProperties(properties);
  if (!sanitizeCrossSellIdentity(safeProperties)) return false;
  const item = normalizeCriticalCrossSellQueueItem({
    eventId,
    createdAt: now,
    attempts: 0,
    nextAttemptAt: now,
    payload: {
      event: name,
      event_id: eventId,
      analytics_session_id: state.analyticsSessionId,
      occurred_at: new Date(now).toISOString(),
      properties: safeProperties
    }
  }, now);
  if (!item) return false;
  const queue = readCriticalCrossSellEventQueue(now);
  if (!queue.some((queued) => queued.eventId === item.eventId)) queue.push(item);
  if (!writeCriticalCrossSellEventQueue(queue)) return false;
  void flushCriticalCrossSellEventQueue();
  return true;
}

const GOOGLE_ADS_PURCHASE_DESTINATION = 'AW-18404456251/KCoTCI-q_OUcELvu9sdE';

function googleAdsPurchasePayload(data = {}) {
  const value = Number(data.value);
  const currency = String(data.currency || '').trim().toUpperCase();
  const transactionId = String(data.transaction_id || '').trim().slice(0, 64);
  if (
    !Number.isFinite(value)
    || value <= 0
    || !/^[A-Z]{3}$/.test(currency)
    || !transactionId
  ) return null;
  return {
    send_to: GOOGLE_ADS_PURCHASE_DESTINATION,
    value,
    currency,
    transaction_id: transactionId
  };
}

function track(name, properties = {}, options = {}) {
  if (IS_GLOBAL_STOREFRONT) return '';
  const now = Date.now();
  const eventId = options.eventId || properties.event_id || nextEventId(name);
  const data = {
    ...screenMeta(),
    ...properties,
    event_id: eventId,
    analytics_session_id: state.analyticsSessionId,
    entry_source: state.entrySource,
    elapsed_ms: now - state.startedAt,
    screen_elapsed_ms: now - state.screenStartedAt
  };
  const thirdPartyData = thirdPartyAnalyticsData(data);
  const gtagData = {
    ...thirdPartyData,
    page_location: publicAnalyticsUrl(),
    page_path: location.pathname
  };

  // First-party delivery is the measurement source of truth and must be
  // queued before optional browser SDKs run. Some Instagram/Facebook in-app
  // browsers expose partial analytics shims that can throw synchronously;
  // telemetry must never be able to abort checkout or another user action.
  if (!enqueueCriticalCrossSellEvent(name, data, eventId, now)) {
    postAnalytics(name, data, eventId, now);
  }
  try {
    if (!CROSS_SELL_QA_ACTIVE && window.fbq) {
      if (name === 'begin_checkout') window.fbq('track', 'InitiateCheckout', thirdPartyData, { eventID: eventId });
      else if (name === 'purchase') window.fbq('track', 'Purchase', thirdPartyData, { eventID: eventId });
      else window.fbq('trackCustom', name, thirdPartyData, { eventID: eventId });
    }
  } catch (error) {
    try { console.warn('[Astro Yogi] Meta analytics unavailable', error); } catch (_) {}
  }
  try {
    if (!CROSS_SELL_QA_ACTIVE && name === 'purchase' && window.twq) {
      window.twq('event', 'tw-re98j-re98l', {});
    }
  } catch (error) {
    try { console.warn('[Astro Yogi] X analytics unavailable', error); } catch (_) {}
  }
  try {
    if (!CROSS_SELL_QA_ACTIVE && window.gtag) window.gtag('event', name, gtagData);
  } catch (error) {
    try { console.warn('[Astro Yogi] Google analytics unavailable', error); } catch (_) {}
  }
  try {
    if (!CROSS_SELL_QA_ACTIVE && name === 'purchase' && window.gtag) {
      const googleAdsPurchase = googleAdsPurchasePayload(gtagData);
      if (googleAdsPurchase) window.gtag('event', 'conversion', googleAdsPurchase);
    }
  } catch (error) {
    try { console.warn('[Astro Yogi] Google Ads purchase tracking unavailable', error); } catch (_) {}
  }
  try { console.info('[Astro Yogi]', name, data); } catch (_) {}
  return eventId;
}

function trackOnce(flag, name, properties = {}, options = {}) {
  if (state.flags[flag]) return false;
  track(name, properties, options);
  state.flags[flag] = true;
  persist();
  return true;
}

function trackScreenView() {
  const accessKey = isCharityGrantSession() ? 'charity_grant' : state.paid ? 'paid' : 'free';
  const key = `${state.lane}:${state.screen}:${state.readingId || ''}:${accessKey}`;
  if (state.lastScreenKey === key) return;
  state.lastScreenKey = key;
  state.screenStartedAt = Date.now();
  track('quiz_screen_view');
  try {
    if (!IS_GLOBAL_STOREFRONT && !CROSS_SELL_QA_ACTIVE && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: `PalmQ IND - ${state.lane} - ${state.screen}`,
        page_location: `${location.origin}${location.pathname}#${state.screen}`,
        page_path: `${location.pathname}#${state.screen}`,
        ...thirdPartyAnalyticsData(screenMeta())
      });
    }
  } catch (error) {
    try { console.warn('[Astro Yogi] Google page-view analytics unavailable', error); } catch (_) {}
  }
}

let palmPaywallVisit = null;
let palmPaywallSectionObserver = null;
let palmNameAlignmentOfferObserver = null;
let palmPaywallCtaObserver = null;
let crossSellPaywallCtaObserver = null;
let palmPaywallScrollSnapshotTimer = 0;
let palmPaywallTimeTimers = [];

function verifiedPalmAdditionalReportPaywallIdentity() {
  // Continuation capabilities are deliberately short-lived, while an unpaid
  // child can be reopened later. Gate collection on the persisted server-issued
  // child/parent identity; /api/track remains authoritative and rejects any
  // event whose stored child lineage does not verify canonically.
  if (
    !ADDITIONAL_REPORT_PAYWALL_TARGET_LANES.has(state.lane)
    || state.screen !== 'unlock'
    || state.paid
    || state.checkoutLoading
    || state.pendingVerification
    || !state.readingId
    || !state.parentReadingId
    || state.readingId === state.parentReadingId
    || state.parentLane !== 'palm_answers'
    || state.acquisitionJourney !== 'additional_report'
    || state.additionalReportContinuationReadingId !== state.parentReadingId
  ) return null;
  const identity = sanitizeCrossSellIdentity(state.crossSellIdentity, state.lane);
  if (
    !identity
    || identity.sourceReadingId !== state.parentReadingId
    || identity.sourceLane !== 'palm_answers'
    || identity.targetLane !== state.lane
  ) return null;
  return identity;
}

function palmPaywallIsActive() {
  const supportedPaywall = ['palm_answers', 'mahakundli'].includes(state.lane)
    || Boolean(verifiedPalmAdditionalReportPaywallIdentity());
  return supportedPaywall
    && state.screen === 'unlock'
    && !hasFullReportAccess()
    && !state.checkoutLoading
    && !IS_PAID_RETURN
    && !IS_CHARITY_GRANT_RETURN
    && Boolean(stage.querySelector('[data-testid="unlock-view"]'));
}

function palmPaywallScrollDepth() {
  const available = Math.max(0, app.scrollHeight - app.clientHeight);
  if (!available) return 100;
  return Math.max(0, Math.min(100, Math.round((app.scrollTop / available) * 1000) / 10));
}

function palmPaywallVisitProperties(extra = {}) {
  const visit = palmPaywallVisit;
  return palmNameAlignmentExperimentAnalytics({
    ...(visit?.crossSellIdentity ? {
      paywall_behavior_measurement_version: NEXT_READING_PAYWALL_BEHAVIOR_MEASUREMENT_VERSION
    } : {}),
    paywall_visit_id: visit?.id || '',
    dwell_ms: visit ? Math.max(0, Date.now() - visit.startedAt) : 0,
    max_scroll_percent: visit?.maxScrollPercent || 0,
    last_section: visit?.lastSection || 'hero',
    offer_viewed: Boolean(visit?.offerViewed),
    checkout_clicked: Boolean(visit?.checkoutClicked),
    ...extra
  });
}

function pausePalmPaywallInstrumentation() {
  palmPaywallSectionObserver?.disconnect();
  palmPaywallSectionObserver = null;
  palmNameAlignmentOfferObserver?.disconnect();
  palmNameAlignmentOfferObserver = null;
  palmPaywallCtaObserver?.disconnect();
  palmPaywallCtaObserver = null;
  app.removeEventListener('scroll', handlePalmPaywallScroll);
  if (palmPaywallScrollSnapshotTimer) window.clearTimeout(palmPaywallScrollSnapshotTimer);
  palmPaywallScrollSnapshotTimer = 0;
  palmPaywallTimeTimers.forEach((timer) => window.clearTimeout(timer));
  palmPaywallTimeTimers = [];
}

function recordPalmPaywallCtaView(button, visibility = 0.5) {
  if (
    state.lane !== 'palm_answers'
    || !palmPaywallVisit
    || palmPaywallVisit.ended
    || !palmPaywallVisit.measurementReady
    || document.visibilityState === 'hidden'
    || !button
  ) return;
  const placement = String(button.dataset.placement || 'unknown').trim().slice(0, 24);
  if (!placement || palmPaywallVisit.seenCtaPlacements.has(placement)) return;
  palmPaywallVisit.seenCtaPlacements.add(placement);
  track('palm_paywall_cta_view', palmPaywallVisitProperties({
    placement,
    cta_placement: placement,
    viewed_element: 'checkout_cta',
    visibility_threshold: 0.5,
    visibility_percent: Math.round(Number(visibility || 0.5) * 100),
    paywall_cta_measurement_version: PALM_PAYWALL_CTA_MEASUREMENT_VERSION
  }));
}

function setupPalmPaywallCtaExposure() {
  palmPaywallCtaObserver?.disconnect();
  palmPaywallCtaObserver = null;
  if (state.lane !== 'palm_answers' || !palmPaywallVisit?.measurementReady) return;
  const buttons = [...stage.querySelectorAll('[data-palm-checkout][data-placement]')];
  if (!buttons.length) return;
  if (typeof window.IntersectionObserver === 'function') {
    try {
      palmPaywallCtaObserver = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
          recordPalmPaywallCtaView(entry.target, entry.intersectionRatio);
          observer.unobserve(entry.target);
        }
      }, { root: app, threshold: [0.5] });
      buttons.forEach((button) => palmPaywallCtaObserver.observe(button));
      return;
    } catch (_) {
      palmPaywallCtaObserver?.disconnect?.();
      palmPaywallCtaObserver = null;
    }
  }
  for (const button of buttons) {
    const visibility = elementVisibilityWithinApp(button);
    if (visibility >= 0.5) recordPalmPaywallCtaView(button, visibility);
  }
}

function recordPalmPaywallSectionView(section, index = 0, visibility = 0) {
  if (!palmPaywallVisit || palmPaywallVisit.ended || !section) return;
  if (palmPaywallVisit.crossSellIdentity && !palmPaywallVisit.measurementReady) return;
  palmPaywallVisit.lastSection = section;
  if (palmPaywallVisit.seenSections.has(section)) return;
  palmPaywallVisit.seenSections.add(section);
  track('paywall_section_view', palmPaywallVisitProperties({
    section_id: section,
    section_index: index,
    visibility_percent: Math.round(Number(visibility || 0) * 100)
  }));
}

function recordPalmNameAlignmentOfferView(visibility = 0.5) {
  if (!palmPaywallVisit || palmPaywallVisit.ended || palmPaywallVisit.offerViewed) return;
  palmPaywallVisit.offerViewed = true;
  palmPaywallVisit.lastSection = 'name_alignment_offer';
  track('palm_name_offer_viewed', palmPaywallVisitProperties({
    visibility_percent: Math.round(Number(visibility || 0.5) * 100)
  }));
}

function elementVisibilityWithinApp(element) {
  if (!element) return 0;
  const elementRect = element.getBoundingClientRect();
  const appRect = app.getBoundingClientRect();
  const visibleHeight = Math.max(0, Math.min(elementRect.bottom, appRect.bottom) - Math.max(elementRect.top, appRect.top));
  return elementRect.height > 0 ? Math.min(1, visibleHeight / elementRect.height) : 0;
}

function capturePalmPaywallScrollProgress({ snapshot = false } = {}) {
  if (!palmPaywallVisit || palmPaywallVisit.ended || !palmPaywallIsActive()) return;
  if (palmPaywallVisit.crossSellIdentity && !palmPaywallVisit.measurementReady) return;
  const depth = palmPaywallScrollDepth();
  palmPaywallVisit.maxScrollPercent = Math.max(palmPaywallVisit.maxScrollPercent, depth);
  for (const milestone of PALM_PAYWALL_SCROLL_MILESTONES) {
    if (depth < milestone || palmPaywallVisit.scrollMilestones.has(milestone)) continue;
    palmPaywallVisit.scrollMilestones.add(milestone);
    track('paywall_scroll_depth', palmPaywallVisitProperties({
      scroll_depth: milestone,
      current_scroll_depth: depth
    }));
  }
  if (!window.IntersectionObserver) {
    const offer = stage.querySelector('[data-name-alignment-offer]');
    const visibility = elementVisibilityWithinApp(offer);
    if (visibility >= 0.5) recordPalmNameAlignmentOfferView(visibility);
  }
  if (!snapshot) return;
  if (palmPaywallVisit.crossSellIdentity) return;
  const now = Date.now();
  const depthChange = Math.abs(depth - palmPaywallVisit.lastSnapshotPercent);
  if (depthChange < 3 && now - palmPaywallVisit.lastSnapshotAt < 5000) return;
  palmPaywallVisit.lastSnapshotPercent = depth;
  palmPaywallVisit.lastSnapshotAt = now;
  track('paywall_scroll_snapshot', palmPaywallVisitProperties({ scroll_depth: depth }));
}

function handlePalmPaywallScroll() {
  capturePalmPaywallScrollProgress();
  if (palmPaywallScrollSnapshotTimer) return;
  palmPaywallScrollSnapshotTimer = window.setTimeout(() => {
    palmPaywallScrollSnapshotTimer = 0;
    capturePalmPaywallScrollProgress({ snapshot: true });
  }, 1200);
}

function schedulePalmPaywallTimeMilestones() {
  if (!palmPaywallVisit || palmPaywallVisit.ended) return;
  const visit = palmPaywallVisit;
  const elapsed = Date.now() - visit.startedAt;
  const milestones = visit.crossSellIdentity
    ? PALM_PAYWALL_TIME_MILESTONES_SECONDS.filter((seconds) => seconds <= 30)
    : PALM_PAYWALL_TIME_MILESTONES_SECONDS;
  for (const seconds of milestones) {
    if (visit.timeMilestones.has(seconds)) continue;
    const timer = window.setTimeout(() => {
      if (
        palmPaywallVisit !== visit
        || visit.ended
        || (visit.crossSellIdentity && !visit.measurementReady)
        || document.visibilityState === 'hidden'
        || !palmPaywallIsActive()
      ) return;
      visit.timeMilestones.add(seconds);
      track('paywall_time_milestone', palmPaywallVisitProperties({ seconds }));
    }, Math.max(0, seconds * 1000 - elapsed));
    palmPaywallTimeTimers.push(timer);
  }
}

function trackPalmNameAlignmentExperimentExposure(assignment) {
  if (!assignment || !palmNameAlignmentOfferSupported() || LOCAL_PALM_PAYWALL_PREVIEW) return;
  const flag = `palmNameExperimentExposure_${assignment.key}_${assignment.version}_${state.readingId || assignment.bucket}`
    .replace(/[^a-zA-Z0-9_]/g, '_')
    .slice(0, 180);
  trackOnce(flag, 'palm_name_experiment_exposure', palmNameAlignmentExperimentAnalytics({
    exposure_surface: 'palm_paywall',
    offer_visible: assignment.variant === 'offer'
  }));
}

function setupPalmPaywallInstrumentation(assignment = palmNameAlignmentAssignment()) {
  pausePalmPaywallInstrumentation();
  const crossSellIdentity = verifiedPalmAdditionalReportPaywallIdentity();
  if (LOCAL_PALM_PAYWALL_PREVIEW || !palmPaywallIsActive()) return false;
  if (state.lane === 'palm_answers' && !assignment) return false;
  const signature = state.lane === 'mahakundli'
    ? `mahakundli:${state.readingId || state.analyticsSessionId}`
    : crossSellIdentity
      ? `palm_cross_sell:${state.parentReadingId}:${state.readingId}:${state.lane}:${crossSellIdentity.offerCopyVersion}`
      : palmNameAlignmentSelectionSignature(assignment);
  if (!palmPaywallVisit || palmPaywallVisit.ended || palmPaywallVisit.signature !== signature) {
    palmPaywallVisit = {
      id: makeId('pwv'),
      signature,
      startedAt: Date.now(),
      ended: false,
      crossSellIdentity,
      measurementReady: !crossSellIdentity,
      readinessTracked: false,
      maxScrollPercent: 0,
      lastSection: 'hero',
      seenSections: new Set(),
      offerViewed: false,
      checkoutClicked: false,
      seenCtaPlacements: new Set(),
      scrollMilestones: new Set(),
      timeMilestones: new Set(),
      lastSnapshotPercent: 0,
      lastSnapshotAt: Date.now()
    };
  }
  if (state.lane === 'palm_answers') trackPalmNameAlignmentExperimentExposure(assignment);
  app.addEventListener('scroll', handlePalmPaywallScroll, { passive: true });
  const sections = [...stage.querySelectorAll('[data-paywall-section]')]
    .filter((section) => !crossSellIdentity
      || ADDITIONAL_REPORT_PAYWALL_SECTION_IDS.has(String(section?.dataset?.paywallSection || '')));
  if (window.IntersectionObserver) {
    try {
      palmPaywallSectionObserver = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (
            !entry.isIntersecting
            || (crossSellIdentity && entry.intersectionRatio < 0.5)
          ) continue;
          const section = String(entry.target.dataset.paywallSection || 'unknown').slice(0, 80);
          const sectionIndex = crossSellIdentity
            ? ADDITIONAL_REPORT_PAYWALL_SECTION_ORDER.indexOf(section)
            : sections.indexOf(entry.target);
          recordPalmPaywallSectionView(section, sectionIndex, entry.intersectionRatio);
        }
      }, { root: app, threshold: [0.05, 0.25, 0.5] });
      sections.forEach((section) => palmPaywallSectionObserver.observe(section));
      const offer = stage.querySelector('[data-name-alignment-offer]');
      if (offer) {
        palmNameAlignmentOfferObserver = new IntersectionObserver((entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              recordPalmNameAlignmentOfferView(entry.intersectionRatio);
            }
          }
        }, { root: app, threshold: [0.5] });
        palmNameAlignmentOfferObserver.observe(offer);
      }
    } catch (_) {
      palmPaywallSectionObserver?.disconnect?.();
      palmPaywallSectionObserver = null;
      palmNameAlignmentOfferObserver?.disconnect?.();
      palmNameAlignmentOfferObserver = null;
      if (crossSellIdentity) {
        app.removeEventListener('scroll', handlePalmPaywallScroll);
        return false;
      }
      const visibleSection = sections.find((section) => elementVisibilityWithinApp(section) > 0);
      if (visibleSection) recordPalmPaywallSectionView(visibleSection.dataset.paywallSection, sections.indexOf(visibleSection), elementVisibilityWithinApp(visibleSection));
    }
  } else {
    const visibleSection = sections.find((section) => elementVisibilityWithinApp(section) > 0);
    if (visibleSection) recordPalmPaywallSectionView(visibleSection.dataset.paywallSection, sections.indexOf(visibleSection), elementVisibilityWithinApp(visibleSection));
  }
  if (!crossSellIdentity) {
    capturePalmPaywallScrollProgress();
    schedulePalmPaywallTimeMilestones();
    setupPalmPaywallCtaExposure();
  }
  return true;
}

function pauseCrossSellPaywallCtaExposure() {
  crossSellPaywallCtaObserver?.disconnect?.();
  crossSellPaywallCtaObserver = null;
}

function finishPalmPaywallVisit(reason = 'unknown') {
  if (!palmPaywallVisit || palmPaywallVisit.ended) {
    pausePalmPaywallInstrumentation();
    pauseCrossSellPaywallCtaExposure();
    return;
  }
  capturePalmPaywallScrollProgress();
  const visit = palmPaywallVisit;
  visit.ended = true;
  pausePalmPaywallInstrumentation();
  if (visit.crossSellIdentity) pauseCrossSellPaywallCtaExposure();
  if (!visit.crossSellIdentity || visit.measurementReady) {
    const exitReason = visit.crossSellIdentity
      ? (ADDITIONAL_REPORT_PAYWALL_EXIT_REASONS.has(reason) ? reason : 'unknown')
      : reason;
    track('paywall_exit', palmPaywallVisitProperties({ exit_reason: exitReason }));
  }
  palmPaywallVisit = null;
}

function trackPalmPaywallCtaClick(placement = '') {
  const crossSellTarget = Boolean(
    verifiedPalmAdditionalReportPaywallIdentity()
    || (
      palmPaywallVisit?.crossSellIdentity
      && !palmPaywallVisit.ended
      && palmPaywallVisit.crossSellIdentity.targetLane === state.lane
    )
  );
  if (
    (!['palm_answers', 'mahakundli'].includes(state.lane) && !crossSellTarget)
    || state.screen !== 'unlock'
  ) return;
  if (palmPaywallVisit) palmPaywallVisit.checkoutClicked = true;
  const normalizedPlacement = crossSellTarget
    ? `additional_report_paywall_${String(placement || 'unknown').slice(0, 16)}`
    : String(placement || 'unknown').slice(0, 24);
  track('paywall_cta_click', palmPaywallVisitProperties({
    placement: normalizedPlacement,
    cta_placement: normalizedPlacement,
    value: checkoutEventValue(),
    currency: checkoutCurrency()
  }));
  finishPalmPaywallVisit('checkout');
}

function crossSellPaywallCtaMeasurementAvailable() {
  return document.visibilityState === 'visible'
    && Boolean(verifiedPalmAdditionalReportPaywallIdentity())
    && typeof window.IntersectionObserver === 'function';
}

function setupCrossSellPaywallCtaExposure() {
  crossSellPaywallCtaObserver?.disconnect?.();
  crossSellPaywallCtaObserver = null;
  if (!crossSellPaywallCtaMeasurementAvailable()) return false;
  const buttons = [...stage.querySelectorAll('[data-action="checkout"][data-placement]')];
  if (!buttons.length) return false;
  try {
    crossSellPaywallCtaObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (
          !crossSellPaywallCtaMeasurementAvailable()
          || !stage.contains(entry.target)
          || !entry.isIntersecting
          || entry.intersectionRatio < 0.5
        ) return;
        const placement = `additional_report_paywall_${String(
          entry.target?.dataset?.placement || 'unknown'
        ).slice(0, 16)}`;
        const flag = `crossSellPaywallCtaView_${state.readingId}_${placement}`
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .slice(0, 180);
        trackOnce(flag, 'next_reading_paywall_cta_view', {
          placement,
          viewed_element: 'checkout_cta',
          visibility_threshold: 0.5,
          paywall_cta_measurement_version: NEXT_READING_PAYWALL_CTA_MEASUREMENT_VERSION,
          paywall_behavior_measurement_version: NEXT_READING_PAYWALL_BEHAVIOR_MEASUREMENT_VERSION
        });
        observer.unobserve(entry.target);
      });
    }, { root: app, threshold: [0.5] });
    buttons.forEach((button) => crossSellPaywallCtaObserver.observe(button));
    return true;
  } catch (_) {
    crossSellPaywallCtaObserver?.disconnect?.();
    crossSellPaywallCtaObserver = null;
    return false;
  }
}

function setupAndTrackCrossSellPaywallCtaExposure() {
  const ctaReady = setupCrossSellPaywallCtaExposure();
  if (!ctaReady) {
    if (palmPaywallVisit?.crossSellIdentity) finishPalmPaywallVisit('unknown');
    return false;
  }
  const behaviorReady = setupPalmPaywallInstrumentation(null);
  if (
    !behaviorReady
    || !palmPaywallVisit?.crossSellIdentity
    || palmPaywallVisit.ended
  ) {
    finishPalmPaywallVisit('unknown');
    return false;
  }
  palmPaywallVisit.measurementReady = true;
  if (!LOCAL_PALM_PAYWALL_PREVIEW && !palmPaywallVisit.readinessTracked) {
    track('unlock_view', {
      product: laneConfig().product,
      value: checkoutEventValue(),
      currency: checkoutCurrency(),
      paywall_cta_measurement_version: NEXT_READING_PAYWALL_CTA_MEASUREMENT_VERSION,
      paywall_behavior_measurement_version: NEXT_READING_PAYWALL_BEHAVIOR_MEASUREMENT_VERSION,
      ...priceComparisonAnalytics()
    });
    palmPaywallVisit.readinessTracked = true;
  }
  capturePalmPaywallScrollProgress();
  schedulePalmPaywallTimeMilestones();
  return true;
}

let flowRefreshPromise = null;

function isFlowSecurityError(response, body) {
  return response.status === 401 && /^.*flow.*$/i.test(String(body?.code || ''));
}

async function refreshFlowSession() {
  if (flowRefreshPromise) return flowRefreshPromise;
  flowRefreshPromise = fetch('/api/flow/refresh', { credentials: 'same-origin' })
    .then(async (response) => {
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message || body.error || 'Please reopen PalmQ IND and try again.');
      return body;
    })
    .finally(() => { flowRefreshPromise = null; });
  return flowRefreshPromise;
}

async function api(path, payload, retriedAfterFlowRefresh = false, fetchOptions = {}) {
  const response = await fetch(path, {
    ...fetchOptions,
    method: 'POST',
    headers: crossSellQaHeaders({
      ...fetchOptions.headers,
      'Content-Type': 'application/json'
    }),
    body: JSON.stringify(payload || {})
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok && !retriedAfterFlowRefresh && isFlowSecurityError(response, body)) {
    await refreshFlowSession();
    return api(path, payload, true, fetchOptions);
  }
  if (!response.ok) {
    const error = new Error(body.message || body.error || 'Something did not connect. Please try again.');
    Object.assign(error, body);
    throw error;
  }
  return body;
}

function crossSellQaHeaders(headers = {}) {
  if (!CROSS_SELL_QA_ACTIVE) return headers;
  return {
    ...headers,
    'X-Astro-Traffic-Class': 'operator_test',
    'X-Astro-Cross-Sell-QA-Token': CROSS_SELL_QA_TOKEN
  };
}

function crossSellAnalyticsHeaders(headers = {}, properties = {}) {
  const secured = crossSellQaHeaders({
    ...headers,
    // Keep deterministic arm recovery available after the short-lived signed
    // attribution token expires while an acknowledged event is still queued.
    'X-Astro-Cross-Sell-Teaser-Experiment': PALM_CROSS_SELL_TEASER_PREFIX_CAPABILITY
  });
  const claims = additionalReportAttributionClaims(state.additionalReportAttributionToken);
  const sourceReadingId = String(
    properties.cross_sell_source_reading_id
      || properties.source_reading_id
      || properties.reading_id
      || ''
  ).trim();
  const targetLane = String(
    properties.cross_sell_target_lane || properties.target_lane || ''
  ).trim();
  if (
    !claims
    || claims.expiresAt <= Date.now()
    || claims.readingId !== sourceReadingId
    || (targetLane && claims.targetLane !== targetLane)
  ) return secured;
  return {
    ...secured,
    'X-Astro-Cross-Sell-Attribution': state.additionalReportAttributionToken
  };
}

function crossSellFullFetchOptions(path, fetchOptions = {}) {
  if (!/^\/api\/reading\/[^/?]+\/full(?:\?|$)/.test(String(path || ''))) return fetchOptions;
  if (normalizedCharityGrantToken(fetchOptions.headers?.['X-Astro-Reading-Grant'])) {
    return fetchOptions;
  }
  return {
    ...fetchOptions,
    headers: crossSellQaHeaders({
      ...(fetchOptions.headers || {}),
      'X-Astro-Cross-Sell-Presentation': PALM_NEXT_READING_PRESENTATION_VERSION,
      'X-Astro-Cross-Sell-Teaser-Experiment': PALM_CROSS_SELL_TEASER_PREFIX_CAPABILITY
    })
  };
}

async function getJson(path, retriedAfterFlowRefresh = false, fetchOptions = {}) {
  const requestOptions = crossSellFullFetchOptions(path, fetchOptions);
  const response = await fetch(path, requestOptions);
  const body = await response.json().catch(() => ({}));
  if (!response.ok && !retriedAfterFlowRefresh && isFlowSecurityError(response, body)) {
    await refreshFlowSession();
    return getJson(path, true, requestOptions);
  }
  if (!response.ok) {
    const error = new Error(body.message || body.error || 'Something did not connect. Please try again.');
    Object.assign(error, body);
    throw error;
  }
  return body;
}

function trackingData() {
  const paywallVariant = activePalmPaywallVariant();
  const marketLandingExperiment = marketLandingExperimentAnalytics();
  return {
    fbp: getCookie('_fbp'),
    fbc: getCookie('_fbc'),
    eventSourceUrl: publicAnalyticsUrl(),
    analyticsSessionId: state.analyticsSessionId,
    angle: state.resolvedAngle,
    rawAngle: state.rawAngle,
    resolvedAngle: state.resolvedAngle,
    lane: state.lane,
    acquisitionJourney: state.acquisitionJourney,
    parentLane: state.parentLane,
    funnelVersion: FUNNEL_VERSION,
    copy_version: activeCopyVersion(),
    ...palmLandingCheckpointAnalytics(),
    paywallVariant,
    paywall_variant: paywallVariant,
    ...palmProofDensityExperimentAnalytics(),
    ...palmGatewayRecoveryExperimentAnalytics(),
    ...marketLandingExperiment,
    ...palmNameAlignmentExperimentAnalytics(),
    utm: {
      ...state.utm,
      copy_version: activeCopyVersion(),
      ...palmLandingCheckpointAnalytics(),
      paywall_variant: paywallVariant,
      ...palmProofDensityExperimentAnalytics(),
      ...palmGatewayRecoveryExperimentAnalytics(),
      palm_name_alignment_contract: PALM_NAME_ALIGNMENT_PRICING_CONTRACT,
      ...marketLandingExperiment
    }
  };
}

let viewportSyncFrame = 0;
let focusTimeHourOnNextRender = false;

function syncAppViewportHeight() {
  viewportSyncFrame = 0;
  const viewport = window.visualViewport;
  const measuredHeight = Number(viewport?.height || window.innerHeight);
  if (!Number.isFinite(measuredHeight) || measuredHeight < 100) return;
  const height = Math.round(measuredHeight);
  document.documentElement.style.setProperty('--app-viewport-height', `${height}px`);
  const host = document.getElementById('placeSuggestions');
  if (host?.children.length) ensurePlaceResultsVisible(host);
}

function requestViewportSync() {
  if (viewportSyncFrame) cancelAnimationFrame(viewportSyncFrame);
  viewportSyncFrame = requestAnimationFrame(syncAppViewportHeight);
}

function ensurePlaceResultsVisible(host) {
  if (!host) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const first = host.querySelector('.suggestion-button');
    if (!first) return;
    const viewport = window.visualViewport;
    const appRect = app.getBoundingClientRect();
    const viewportTop = Number(viewport?.offsetTop || 0);
    const viewportBottom = viewportTop + Number(viewport?.height || window.innerHeight);
    const visibleTop = Math.max(appRect.top, viewportTop) + 74;
    const visibleBottom = Math.min(appRect.bottom, viewportBottom) - 12;
    const firstRect = first.getBoundingClientRect();
    let delta = 0;
    if (firstRect.bottom > visibleBottom) delta = firstRect.bottom - visibleBottom;
    else if (firstRect.top < visibleTop) delta = firstRect.top - visibleTop;
    if (Math.abs(delta) < 2) return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    app.scrollBy({ top: delta, behavior: reducedMotion ? 'auto' : 'smooth' });
  }));
}

function schedulePlaceResultsVisibility() {
  const host = document.getElementById('placeSuggestions');
  if (!host) return;
  setTimeout(() => ensurePlaceResultsVisible(host), 60);
  setTimeout(() => ensurePlaceResultsVisible(host), 360);
}

function ensureBirthTimeInputVisible() {
  if (state.screen !== 'time' || !['timeHour', 'timeMinute'].includes(document.activeElement?.id)) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const active = document.activeElement;
    if (
      state.screen !== 'time'
      || !active?.isConnected
      || !['timeHour', 'timeMinute'].includes(active.id)
    ) return;
    const field = active.closest('.time-field');
    if (!field) return;
    const viewport = window.visualViewport;
    const appRect = app.getBoundingClientRect();
    const viewportTop = Number(viewport?.offsetTop || 0);
    const viewportBottom = viewportTop + Number(viewport?.height || window.innerHeight);
    const visibleTop = Math.max(appRect.top, viewportTop) + 74;
    const visibleBottom = Math.min(appRect.bottom, viewportBottom) - 12;
    const fieldRect = field.getBoundingClientRect();
    let delta = 0;
    if (fieldRect.bottom > visibleBottom) delta = fieldRect.bottom - visibleBottom;
    else if (fieldRect.top < visibleTop) delta = fieldRect.top - visibleTop;
    if (Math.abs(delta) >= 2) app.scrollBy({ top: delta, behavior: 'auto' });
  }));
}

function ensureAnalysisLineVisible(line) {
  if (!line) return;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const viewport = window.visualViewport;
    const appRect = app.getBoundingClientRect();
    const viewportTop = Number(viewport?.offsetTop || 0);
    const viewportBottom = viewportTop + Number(viewport?.height || window.innerHeight);
    const visibleTop = Math.max(appRect.top, viewportTop) + 78;
    const visibleBottom = Math.min(appRect.bottom, viewportBottom) - 18;
    const lineRect = line.getBoundingClientRect();
    let delta = 0;
    if (lineRect.bottom > visibleBottom) delta = lineRect.bottom - visibleBottom;
    else if (lineRect.top < visibleTop) delta = lineRect.top - visibleTop;
    if (Math.abs(delta) < 2) return;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    app.scrollBy({ top: delta, behavior: reducedMotion ? 'auto' : 'smooth' });
  }));
}

function ensurePalmScanProgressVisible() {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    if (state.screen !== 'palmscan') return;
    const target = document.getElementById('scanProgressFocus');
    if (!target) return;
    const viewport = window.visualViewport;
    const appRect = app.getBoundingClientRect();
    const viewportTop = Number(viewport?.offsetTop || 0);
    const viewportBottom = viewportTop + Number(viewport?.height || window.innerHeight);
    const visibleTop = Math.max(appRect.top, viewportTop) + 76;
    const visibleBottom = Math.min(appRect.bottom, viewportBottom) - 16;
    const targetRect = target.getBoundingClientRect();
    if (targetRect.top >= visibleTop && targetRect.bottom <= visibleBottom) return;
    const visibleCenter = (visibleTop + visibleBottom) / 2;
    const targetCenter = (targetRect.top + targetRect.bottom) / 2;
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    app.scrollBy({ top: targetCenter - visibleCenter, behavior: reducedMotion ? 'auto' : 'smooth' });
  }));
}

function show(html) {
  const preservePalmPaywallScroll = state.lane === 'palm_answers'
    && state.screen === 'unlock'
    && !state.paid
    && Boolean(stage.querySelector('[data-testid="unlock-view"]'));
  const previousAppScrollTop = app.scrollTop;
  const previousWindowScrollTop = window.scrollY;
  mahakundliCheckoutDockObserver?.disconnect();
  mahakundliCheckoutDockObserver = null;
  document.documentElement.style.removeProperty('--mahakundli-checkout-dock-space');
  stage.innerHTML = `<section class="screen" data-testid="screen-${escapeHtml(state.screen)}">${html}</section>`;
  if (preservePalmPaywallScroll) {
    app.scrollTo({ top: previousAppScrollTop, behavior: 'auto' });
    scrollTo(0, previousWindowScrollTop);
    requestAnimationFrame(() => app.scrollTo({ top: previousAppScrollTop, behavior: 'auto' }));
  } else {
    app.scrollTo({ top: 0, behavior: 'auto' });
    scrollTo(0, 0);
  }
  requestAnimationFrame(setupPreviousReadingsExposure);
  requestViewportSync();
}

function observeMahakundliCheckoutDock() {
  const dock = stage.querySelector('.mobile-checkout-dock--mahakundli');
  if (!dock) return;
  const updateReservedSpace = () => {
    const height = Math.ceil(dock.getBoundingClientRect().height);
    document.documentElement.style.setProperty(
      '--mahakundli-checkout-dock-space',
      `${Math.max(140, height + 10)}px`
    );
  };
  updateReservedSpace();
  if (typeof ResizeObserver === 'function') {
    mahakundliCheckoutDockObserver = new ResizeObserver(updateReservedSpace);
    mahakundliCheckoutDockObserver.observe(dock);
  }
  document.fonts?.ready?.then(updateReservedSpace).catch(() => {});
}

// Once a palm has been mapped, every remaining pre-payment step keeps it on screen
// so the reader can see their own hand is already read and waiting.
//
// It lives in a small dock rather than behind the form. A photograph large enough
// to sit behind content has to be faded until it stops being a hand and becomes a
// stain; at dock size it can be shown at full strength, sharp, with its detected
// lines legible on it. Small and crisp beats large and ghosted.
const PALM_DOCK_SCREENS = new Set(['dob', 'time', 'place', 'name', 'analysis']);

// The object URL for the photo only lives for the current session. After a reload,
// keep the dock only when the saved result includes real uploaded-image paths;
// processed-only detections have no honest map to draw without the photo.
function palmDockSource() {
  if (state.paid || IS_PAID_RETURN) return '';
  if (!['palm_answers', 'market_profile'].includes(state.lane)) return '';
  if (!state.palmDetection || !palmLineNames().length) return '';
  if (state.palmPreviewUrl) return state.palmPreviewUrl;
  const hasDrawableMap = Object.values(palmOverlayLines())
    .some((points) => Array.isArray(points) && points.length >= 2);
  return hasDrawableMap ? 'map-only' : '';
}

// Crops to the detected palm rather than the photo's centre, so the thumbnail is
// filled by the hand no matter how the upload was framed.
function palmDockFocus() {
  const size = state.palmImageSize || { width: 720, height: 960 };
  const width = Math.max(1, Number(size.width) || 720);
  const height = Math.max(1, Number(size.height) || 960);
  const points = palmOriginalHandPoints(state.palmDetection, { width, height });
  if (points.length < 18) {
    return { width, height, centerX: width / 2, centerY: height / 2, span: Math.max(width, height) };
  }
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) * 1.18;
  return {
    width,
    height,
    centerX: (Math.min(...xs) + Math.max(...xs)) / 2,
    centerY: (Math.min(...ys) + Math.max(...ys)) / 2,
    span: Math.max(span, 1)
  };
}

function palmDockSummary() {
  const points = palmLandmarkCount();
  const lines = new Set(palmLineNames()).size;
  const zones = palmMountZones().length;
  const parts = [];
  if (points) parts.push(`${points} ${points === 1 ? 'point' : 'points'}`);
  if (lines) parts.push(`${lines} ${lines === 1 ? 'line' : 'lines'}`);
  if (zones) parts.push(`${zones} ${zones === 1 ? 'zone' : 'zones'}`);
  return parts.join(' · ');
}

function trackPalmDockClick() {
  trackOnce('palmDockClick', 'palm_dock_click', {
    interaction: 'status_dock',
    dock_copy_version: 'using_palm_scan_v1',
    point_count: palmLandmarkCount(),
    line_count: new Set(palmLineNames()).size,
    zone_count: palmMountZones().length
  });
}

function syncPalmDock() {
  const source = palmDockSource();
  let node = document.getElementById('palmDock');
  if (!source) {
    document.body.classList.remove('has-palm-dock');
    node?.remove();
    return;
  }
  if (!node || node.dataset.palmSource !== source) {
    if (!node) {
      node = document.createElement('aside');
      node.className = 'palm-dock';
      node.id = 'palmDock';
      node.addEventListener('click', trackPalmDockClick);
      app.insertBefore(node, stage);
    }
    const focus = palmDockFocus();
    const ratio = (value) => Math.round((value / focus.span) * 10000) / 10000;
    node.dataset.palmSource = source;
    node.classList.toggle('palm-dock--map-only', !state.palmPreviewUrl);
    node.style.setProperty('--palm-dock-width', String(ratio(focus.width)));
    node.style.setProperty('--palm-dock-height', String(ratio(focus.height)));
    node.style.setProperty('--palm-dock-x', String(ratio(focus.centerX)));
    node.style.setProperty('--palm-dock-y', String(ratio(focus.centerY)));
    const photo = state.palmPreviewUrl
      ? `<img src="${escapeHtml(state.palmPreviewUrl)}" alt="" />`
      : '';
    node.innerHTML = `<figure class="palm-dock__chip">
        <span class="palm-dock__crop">${photo}${palmOverlaySvg()}</span>
      </figure>
      <div class="palm-dock__meta">
        <b>Using your palm scan</b>
        <span>${escapeHtml(palmDockSummary())}</span>
      </div>
      <i class="palm-dock__live" aria-hidden="true"></i>`;
  }
  document.body.classList.toggle('has-palm-dock', PALM_DOCK_SCREENS.has(state.screen));
}

function setChrome() {
  const currentFlow = flow();
  const index = Math.max(0, currentFlow.indexOf(state.screen));
  const isLanding = state.screen === 'intro';
  const isMahakundli = state.lane === 'mahakundli';
  document.body.classList.toggle('is-landing', isLanding);
  document.body.classList.toggle('is-home-landing', isLanding && state.lane === '_default');
  document.body.classList.toggle('is-name-landing', isLanding && state.lane === 'name_numerology');
  document.body.classList.toggle('is-mahakundli', isMahakundli);
  document.body.classList.toggle(
    'is-mahakundli-wide',
    isMahakundli && (isLanding || state.screen === 'unlock' || hasFullReportAccess())
  );
  document.body.classList.toggle('is-analysis', state.screen === 'analysis');
  document.body.classList.toggle('is-face-scan', state.screen === 'facescan');
  document.body.classList.toggle(
    'has-checkout-dock',
    state.screen === 'unlock'
      && !hasFullReportAccess()
      && !IS_PAID_RETURN
      && !IS_CHARITY_GRANT_RETURN
  );
  const isPrefillConfirm = state.screen === 'confirmdetails';
  backButton.style.visibility = isLanding
    || isPrefillConfirm
    || hasFullReportAccess()
    || IS_CHARITY_GRANT_RETURN
    ? 'hidden'
    : 'visible';
  const restartBlocked = paymentNavigationBlocked();
  freshButton.style.visibility = isLanding || isPrefillConfirm || state.screen === 'unlock' || restartBlocked ? 'hidden' : 'visible';
  updateSavedReportsHeader();
  const quietDynamicScreen = ['analysis', 'palmscan', 'facescan'].includes(state.screen);
  stage.setAttribute('aria-live', quietDynamicScreen ? 'off' : 'polite');
  stage.setAttribute('aria-atomic', quietDynamicScreen ? 'false' : 'true');
  progressBar.style.width = isLanding ? '0%' : `${Math.max(4, (index / Math.max(1, currentFlow.length - 1)) * 100)}%`;
  syncPalmDock();
}

function go(screen, direction = 'next') {
  if (!flow().includes(screen)) return;
  if (state.screen === 'facescan' && screen !== 'facescan') {
    cancelActiveFaceScanPresentation();
  }
  if (screen !== state.screen) {
    if (state.screen === 'unlock') {
      finishPalmPaywallVisit('in_app_navigation');
    }
    track('quiz_screen_exit', { from_screen: state.screen, to_screen: screen, direction });
  }
  state.screen = screen;
  state.lastScreenKey = '';
  persist();
  render();
}

function next() {
  const currentFlow = flow();
  const index = currentFlow.indexOf(state.screen);
  if (index >= 0 && index < currentFlow.length - 1) go(currentFlow[index + 1]);
}

function palmCaptureScreen() {
  return state.lane === 'palm_answers'
    ? IS_GLOBAL_STOREFRONT ? 'palmupload' : 'intro'
    : 'palmupload';
}

function back() {
  if (
    state.checkoutLoading
    || state.analysisRunning
    || hasFullReportAccess()
    || IS_CHARITY_GRANT_RETURN
  ) return;
  if (state.lane === 'market_profile' && state.screen === 'analysis' && state.reuseParentPalm) {
    go('marketsegment', 'back');
    return;
  }
  if (state.lane === 'market_profile' && state.screen === 'analysis' && !state.palmDetection) {
    go('palmoffer', 'back');
    return;
  }
  if (state.screen === 'palmproof') {
    go(palmCaptureScreen(), 'back');
    return;
  }
  if (state.screen === 'palmscan') {
    state.scanRunId = '';
    go(palmCaptureScreen(), 'back');
    return;
  }
  if (state.screen === 'faceproof') {
    resetFaceForRetry();
    return;
  }
  if (state.screen === 'facescan') {
    state.faceScanRunId = '';
    releaseFacePhoto();
    go('intro', 'back');
    return;
  }
  const currentFlow = flow();
  const index = currentFlow.indexOf(state.screen);
  if (index > 0) go(currentFlow[index - 1], 'back');
}

function startQuiz(answer, { deferQuizStart = false } = {}) {
  trackOnce('firstTap', 'first_tap', { answer });
  if (!deferQuizStart) trackOnce('quizStart', 'quiz_start', { answer });
  persist();
}

function selectDefaultLane(lane) {
  if (!LANES[lane]) return;
  state.lane = lane;
  state.resolvedAngle = lane;
  state.screen = 'intro';
  state.lastScreenKey = '';
  startQuiz(`choose_${lane}`);
  persist();
  if (['mahakundli', 'name_numerology', 'market_profile', 'palm_answers', 'face_answers'].includes(lane)) {
    render();
    return;
  }
  go('dob', 'start');
}

function startAdvertisedLane() {
  const config = laneConfig();
  if (!config) return;
  startQuiz(config.startAnswer, { deferQuizStart: state.lane === 'palm_answers' });
  if (state.lane === 'palm_answers') {
    choosePalmPhoto('landingPalmInput', { answer: config.startAnswer });
    return;
  }
  if (state.lane === 'face_answers') {
    openFaceCamera();
    return;
  }
  if (state.lane === 'name_numerology') return;
  if (state.lane === 'mahakundli') {
    go('name', 'start');
    return;
  }
  go('dob', 'start');
}

function cityHeroArt() {
  return `<div class="hero-art" aria-hidden="true"><div class="city-compass"><svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="36" stroke="currentColor" stroke-width="1.2"/><circle cx="50" cy="50" r="28" stroke="currentColor" stroke-width=".8" stroke-dasharray="2 5"/><path d="M50 12v10M50 78v10M12 50h10M78 50h10" stroke="currentColor"/><path d="M57 43 67 28 52 38 43 57 33 72 48 62 57 43Z" fill="rgba(156,109,45,.18)" stroke="currentColor" stroke-width="1.5"/><circle cx="50" cy="50" r="3" fill="currentColor"/><path d="M20 79h60M26 79V68h9v11M38 79V61h12v18M53 79V65h8v14M64 79V56h10v23" stroke="currentColor" stroke-width="1.4"/></svg></div></div>`;
}

function partnerHeroArt() {
  return '<div class="hero-art" aria-hidden="true"><div class="letter-seal">A<small>A–Z</small></div></div>';
}

function cleanPalmOutlineSvg() {
  return `<svg class="clean-palm-outline" viewBox="45 35 215 335" aria-hidden="true" focusable="false"><path d="M111 352C85 338 70 310 66 279L51 181C49 166 56 155 67 154C78 153 84 163 87 176L96 219L84 108C82 91 91 80 104 80C117 80 121 92 122 108L126 196L128 68C128 50 138 40 151 41C164 42 168 55 167 70L165 196L175 85C177 69 187 60 199 62C211 64 214 77 212 91L204 207L218 133C221 118 232 111 243 115C254 119 255 132 251 146L232 251C225 294 212 325 188 347C169 363 132 363 111 352Z"/></svg>`;
}

function palmHeroArt() {
  return `<div class="palm-scan-viewport palm-landing-scan" aria-hidden="true"><img class="palm-scan-gif" src="${escapeHtml(PALM_SCAN_ASSET_URL)}" alt="" width="440" height="311" loading="eager" decoding="async" fetchpriority="high" /></div>`;
}

const PALM_COVERAGE_AREAS = Object.freeze(IS_GLOBAL_STOREFRONT
  ? ['Visible line reflections', 'Standout pattern when clear', 'Practical prompts']
  : ['Love & marriage', 'Career & wealth', 'Family & wellbeing']);

function palmCoverageMarkup() {
  return `<section class="palm-coverage" data-testid="palm-coverage" aria-labelledby="palm-coverage-title">
    <small class="palm-coverage__heading" id="palm-coverage-title"><i aria-hidden="true">✦</i>Every complete Palm reading includes all three<i aria-hidden="true">✦</i></small>
    <ul>${PALM_COVERAGE_AREAS.map((label) => `<li><i aria-hidden="true">✓</i><span>${escapeHtml(label)}</span></li>`).join('')}</ul>
  </section>`;
}

function faceHeroArt() {
  return `<figure class="face-landing__scan-demo" data-testid="face-scan-demo">
    <img src="${escapeHtml(FACE_SCAN_DEMO_URL)}" alt="Animated example of a face scan tracing an adult woman's face and revealing seven mapped feature callouts." width="720" height="720" loading="eager" decoding="async" fetchpriority="high" />
    <span class="face-landing__segment-label" aria-hidden="true"><small>SEGMENT BALANCE</small><b>MIDDLE + LOWER</b></span>
    <figcaption class="face-visually-hidden">Animated example preview: a moving scan line traces the face before seven feature callouts appear.</figcaption>
  </figure>`;
}

function nameNumerologyHeroArt() {
  const view = landingNameCalculationView(state.answers.name || '');
  return `<section class="name-method-preview ${view.ready ? 'is-ready' : ''}" id="nameMethodPreview" data-testid="name-method-preview" aria-label="Live Chaldean name calculation">
    <header><small>Chaldean letter values</small><span id="nameMethodMode">${escapeHtml(view.mode)}</span></header>
    <div class="name-method-preview__name" id="nameMethodName">${escapeHtml(view.name)}</div>
    <strong class="name-method-preview__equation" id="nameMethodEquation"><span id="nameMethodValues">${escapeHtml(view.values)}</span><b id="nameMethodTotal">${escapeHtml(view.total)}</b></strong>
    <small class="name-method-preview__note" id="nameMethodStatus">${escapeHtml(view.status)}</small>
  </section>`;
}

function nameLandingResultMarkup(value) {
  const view = landingNameInsightView(value);
  return `<section class="name-live-result ${view.ready ? 'is-ready' : ''}" id="nameLiveResult" data-testid="name-live-result" aria-label="Live Name Number result" aria-live="polite">
    <div class="name-live-result__top">
      <div class="name-live-result__number"><small>Name<br />Number</small><strong id="nameResultNumber">${view.root}</strong><span id="nameResultRuler">${escapeHtml(view.ruler)}</span></div>
      <div class="name-live-result__copy">
        <small id="nameResultMode">${escapeHtml(view.mode)}</small>
        <b id="nameResultTitle">${escapeHtml(view.title)}</b>
        <p id="nameResultCelebrity">${escapeHtml(view.celebrityLine)}</p>
      </div>
    </div>
    <div class="name-live-result__bridge"><b id="nameResultBridgeTitle">${escapeHtml(view.bridgeTitle)}</b>&nbsp;<span id="nameResultBridgeCopy">${escapeHtml(view.bridgeCopy)}</span></div>
    <small class="name-live-result__disclosure">Public-spelling comparison only · Not an endorsement or prediction</small>
  </section>`;
}

function nameSpellingProofMarkup() {
  return `<aside class="name-spelling-proof" data-testid="name-spelling-proof" aria-label="How one letter changes a Name Number">
    <small>One letter can change the pattern</small>
    <div><span>NEHA <b>16 → 7</b></span><i>+ A</i><span>NEHAA <b>17 → 8</b></span></div>
    <p><b>A different number is not automatically better.</b> Your birth-date match decides which spelling actually supports you.</p>
  </aside>`;
}

function marketProfileHeroArt() {
  return `<div class="hero-art market-hero" aria-hidden="true">
    <div class="market-orbit"><span>☾</span><i>3</i><b>8</b></div>
    <svg viewBox="0 0 120 84" fill="none" focusable="false">
      <path class="market-grid" d="M8 18H112M8 42H112M8 66H112M30 8V76M60 8V76M90 8V76" />
      <path class="market-line" d="M9 64 26 55 40 59 57 36 70 43 88 22 111 13" />
      <circle cx="57" cy="36" r="3" /><circle cx="88" cy="22" r="3" />
    </svg>
  </div>`;
}

const MARKET_PROFILE_OPTIONS = Object.freeze([
  ['active', 'I trade actively'],
  ['long_term', 'I invest long term'],
  ['both', 'I do both'],
  ['starting', 'I want to start']
]);

function marketProfileOptionsMarkup() {
  return MARKET_PROFILE_OPTIONS
    .map(([value, label]) => `<button type="button" data-action="choose-market-profile" data-value="${value}">${label}<i>›</i></button>`)
    .join('');
}

const clientChaldeanValues = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1, B: 2, K: 2, R: 2, C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4, E: 5, H: 5, N: 5, X: 5, U: 6, V: 6, W: 6, O: 7, Z: 7, F: 8, P: 8
};

const clientNameNumberProfiles = {
  1: {
    title: 'The Leader',
    power: 'Initiative and visible results',
    watch: 'Impatience or carrying everything alone'
  },
  2: {
    title: 'The Diplomat',
    power: 'Partnership and emotional intelligence',
    watch: 'Hesitation when other people’s approval matters too much'
  },
  3: {
    title: 'The Communicator',
    power: 'Expression, ideas and recognition',
    watch: 'Scattered effort or strong ideas left unfinished'
  },
  4: {
    title: 'The Builder',
    power: 'Discipline, systems and durable results',
    watch: 'Rigidity when useful change arrives'
  },
  5: {
    title: 'The Messenger',
    power: 'Adaptability, persuasion and momentum',
    watch: 'Restlessness or changing direction too soon'
  },
  6: {
    title: 'The Magnet',
    power: 'Trust, responsibility and personal appeal',
    watch: 'Over-giving or carrying everybody’s problems'
  },
  7: {
    title: 'The Analyst',
    power: 'Depth, analysis and specialised insight',
    watch: 'Isolation or waiting for perfect certainty'
  },
  8: {
    title: 'The Authority',
    power: 'Ambition, scale and material responsibility',
    watch: 'Pressure, control or measuring worth through status'
  },
  9: {
    title: 'The Impact Maker',
    power: 'Courage, conviction and meaningful impact',
    watch: 'Emotional extremes or fighting every battle'
  }
};

const clientNumberRulers = {
  1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu', 5: 'Mercury', 6: 'Venus', 7: 'Ketu', 8: 'Saturn', 9: 'Mars'
};

const clientNameNumberExamples = {
  1: { name: 'Rajinikanth', compound: 28 },
  2: { name: 'M. S. Dhoni', compound: 29 },
  3: { name: 'Salman Khan', compound: 30 },
  4: { name: 'Aamir Khan', compound: 22 },
  5: { name: 'Virat Kohli', compound: 32 },
  6: { name: 'Shah Rukh Khan', compound: 42 },
  7: { name: 'Amitabh Bachchan', compound: 43 },
  8: { name: 'Rohit Sharma', compound: 35 },
  9: { name: 'Neeraj Chopra', compound: 45 }
};

function clientNameNumberProfile(value) {
  return clientNameNumberProfiles[reduceClientNumber(value)] || clientNameNumberProfiles[1];
}

function reduceClientNumber(value) {
  let number = Math.abs(Number(value) || 0);
  while (number > 9) number = String(number).split('').reduce((total, digit) => total + Number(digit), 0);
  return number || 1;
}

function clientBirthDestinyNumbers(value) {
  const [year = 0, month = 0, day = 0] = String(value || '').split('-').map(Number);
  const digitTotal = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`.replace(/\D/g, '').split('').reduce((total, digit) => total + Number(digit), 0);
  return {
    birth: reduceClientNumber(day || 1),
    destiny: reduceClientNumber(digitTotal || 1)
  };
}

function clientNameBreakdown(value) {
  const letters = formatName(value).toUpperCase().replace(/[^A-Z]/g, '').split('').map((letter) => ({ letter, value: clientChaldeanValues[letter] || 0 })).filter((item) => item.value);
  const compound = letters.reduce((total, item) => total + item.value, 0) || 1;
  return { letters, compound, root: reduceClientNumber(compound) };
}

function landingNameInsightView(value) {
  const enteredName = formatName(value || '');
  const enteredResult = clientNameBreakdown(enteredName);
  const ready = enteredName.length >= 2 && enteredResult.letters.length >= 2;
  const displayName = ready ? enteredName : 'Riya';
  const result = ready ? enteredResult : clientNameBreakdown(displayName);
  const profile = clientNameNumberProfile(result.root);
  const example = clientNameNumberExamples[result.root] || clientNameNumberExamples[1];
  return {
    ready,
    mode: ready ? 'Your public-name result' : 'Example result',
    title: result.compound === result.root
      ? `${displayName.toUpperCase()} = Name Number ${result.root}`
      : `${displayName.toUpperCase()} = ${result.compound} → ${result.root}`,
    root: result.root,
    ruler: clientNumberRulers[result.root] || '',
    profile,
    celebrityLine: `${example.name}’s public-name spelling totals ${example.compound} and also reduces to ${result.root}.`,
    bridgeTitle: `But ${result.root} is only the first half.`,
    bridgeCopy: `Your birth date reveals whether its power is reinforced—or pulled toward its blind spot.`
  };
}

function landingNameCalculationView(value) {
  const name = formatName(value || '');
  const result = clientNameBreakdown(name);
  const ready = name.length >= 2 && result.letters.length >= 2;
  if (!ready) {
    return {
      ready: false,
      mode: 'Example',
      name: 'RIYA',
      values: '2 + 1 + 1 + 1',
      total: '= 5',
      status: 'Exact spelling changes the total.'
    };
  }
  const visibleValues = result.letters.slice(0, 10).map((item) => item.value).join(' + ');
  const remaining = result.letters.length > 10 ? ' + …' : '';
  return {
    ready: true,
    mode: 'Your live calculation',
    name: name.toUpperCase().slice(0, 34),
    values: `${visibleValues}${remaining}`,
    total: `= ${result.compound} → ${result.root}`,
    status: `Name Number ${result.root} · ${clientNumberRulers[result.root] || ''}`
  };
}

function updateLandingNameCalculation(value) {
  const preview = document.getElementById('nameMethodPreview');
  if (!preview) return;
  const view = landingNameCalculationView(value);
  const insight = landingNameInsightView(value);
  preview.classList.toggle('is-ready', view.ready);
  const mode = document.getElementById('nameMethodMode');
  const name = document.getElementById('nameMethodName');
  const values = document.getElementById('nameMethodValues');
  const total = document.getElementById('nameMethodTotal');
  const status = document.getElementById('nameMethodStatus');
  if (mode) mode.textContent = view.mode;
  if (name) name.textContent = view.name;
  if (values) values.textContent = view.values;
  if (total) total.textContent = view.total;
  if (status) status.textContent = view.status;
  const resultCard = document.getElementById('nameLiveResult');
  if (resultCard) resultCard.classList.toggle('is-ready', insight.ready);
  const resultMode = document.getElementById('nameResultMode');
  const resultNumber = document.getElementById('nameResultNumber');
  const resultRuler = document.getElementById('nameResultRuler');
  const resultTitle = document.getElementById('nameResultTitle');
  const resultCelebrity = document.getElementById('nameResultCelebrity');
  const resultBridgeTitle = document.getElementById('nameResultBridgeTitle');
  const resultBridgeCopy = document.getElementById('nameResultBridgeCopy');
  if (resultMode) resultMode.textContent = insight.mode;
  if (resultNumber) resultNumber.textContent = insight.root;
  if (resultRuler) resultRuler.textContent = insight.ruler;
  if (resultTitle) resultTitle.textContent = insight.title;
  if (resultCelebrity) resultCelebrity.textContent = insight.celebrityLine;
  if (resultBridgeTitle) resultBridgeTitle.textContent = insight.bridgeTitle;
  if (resultBridgeCopy) resultBridgeCopy.textContent = insight.bridgeCopy;
}

// Home shows friendly reading names ordered by demand. Lane pages keep the
// formal product names used in checkout, reports and receipts.
const HOME_FEATURES = [
  {
    lane: 'palm_answers',
    eyebrow: 'Life path & timing',
    title: 'Palm Reading',
    desc: 'Your life path and key periods across love, career, money, family and the years ahead.',
    chips: ['What changes next', 'Key life periods'],
    cta: 'Read my palm',
    note: 'Start free · Scan or upload',
    art: 'palm'
  },
  {
    lane: 'face_answers',
    eyebrow: 'First impression & presence',
    title: 'Face Reading',
    desc: 'What this photo may signal at first glance, how it can land in daily life and practical ways to change the signal.',
    chips: ['Six daily-life answers', 'Optional life timeline'],
    cta: 'Read my face',
    note: 'Start free · Photo stays on your device',
    art: 'face'
  }
];

const HOME_GRID = [
  { lane: 'name_numerology', title: 'The Name Reading', blurb: 'Your name against your birth date' },
  { lane: 'best_city', title: 'The City Reading', blurb: 'The place you will rise fastest' },
  { lane: 'market_profile', title: 'The Wealth Reading', blurb: 'Trader or long-term investor' },
  { lane: 'partner_name', title: 'The Love Reading', blurb: 'Your partner’s strongest initials' }
];

function homeStarOrnament() {
  return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2c.9 5.4 3.7 8.2 9.1 9.1C15.7 12 12.9 14.8 12 20.2 11.1 14.8 8.3 12 2.9 11.1 8.3 10.2 11.1 7.4 12 2Z" fill="currentColor"/></svg>';
}

function homeEmblem(lane) {
  const svg = {
    name_numerology: '<path d="M20 8 26 25 20 30 14 25Z"/><path d="M20 16v10"/><path d="M12 34c4-2.6 12-2.6 16 0"/>',
    best_city: '<circle cx="20" cy="20" r="11.5"/><path d="M20 11 23 20 20 29 17 20Z"/><path d="M20 5.5v3M20 31.5v3M5.5 20h3M31.5 20h3"/>',
    market_profile: '<path d="M7 27 16 20 22 24 33 12"/><path d="M27 12h6v6"/>',
    partner_name: '<circle cx="16.5" cy="20" r="8"/><circle cx="23.5" cy="20" r="8"/>'
  }[lane] || '';
  return `<span class="home-tile__emblem" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${svg}</svg></span>`;
}

function homeHand() {
  return `<svg class="home-feature__hand" viewBox="0 0 120 132" fill="none" aria-hidden="true">
    <path class="hand-outline" d="M44 118C36 110 32 100 30 90C25 84 13 79 7 73C3 69 6 63 13 64C20 66 26 71 31 76C31 72 31 68 31 64L31 32C31 27 42 27 42 32L42 60C42 62 46 62 46 60L46 22C46 17 58 17 58 22L58 58C58 60 62 60 62 58L62 30C62 25 74 25 74 30L74 60C74 62 78 62 78 60L78 44C78 39 90 39 90 44L90 62C92 90 90 104 84 118Z"/>
    <path class="hand-line" d="M36 72C50 65 68 65 82 72"/>
    <path class="hand-line" d="M33 82C49 78 67 80 82 87"/>
    <path class="hand-line" d="M32 74C26 90 28 106 40 117"/>
  </svg>`;
}

function homeFace() {
  return `<svg class="home-feature__face" viewBox="0 0 120 132" fill="none" aria-hidden="true">
    <path class="face-outline" d="M60 13C34 13 22 32 24 59c2 31 16 57 36 60 20-3 34-29 36-60 2-27-10-46-36-46Z"/>
    <path class="face-detail" d="M34 49c7-5 14-5 21-1M65 48c7-4 14-4 21 1"/>
    <path class="face-detail" d="M36 57c6 4 12 4 18 0M66 57c6 4 12 4 18 0"/>
    <path class="face-detail" d="M60 53v27c0 5-4 8-10 8"/>
    <path class="face-detail" d="M47 98c8 4 18 4 26 0"/>
    <path class="face-scan" d="M22 69h76"/>
    <path class="face-scan" d="M60 19v94"/>
    <circle class="face-node" cx="36" cy="57" r="2.5"/>
    <circle class="face-node" cx="84" cy="57" r="2.5"/>
    <circle class="face-node" cx="60" cy="82" r="2.5"/>
    <circle class="face-node" cx="47" cy="98" r="2.5"/>
    <circle class="face-node" cx="73" cy="98" r="2.5"/>
  </svg>`;
}

function mahakundliWheelMarkup() {
  const signs = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];
  return `<div class="mahakundli-wheel" aria-hidden="true">
    <div class="mahakundli-wheel__orbit">${signs.map((sign, index) => `<span style="--i:${index}">${sign}</span>`).join('')}</div>
    <div class="mahakundli-wheel__rings"><i></i><i></i><i></i></div>
    <div class="mahakundli-wheel__centre"><small>YOUR</small><b>MAHA<br>KUNDLI</b><em>✦</em></div>
  </div>`;
}

function mahakundliGrossPrice(pricing = MAHAKUNDLI_PRICING) {
  const amount = Number(pricing?.amount || 500);
  const gstRateBps = Number(pricing?.tax?.gstRateBps || MAHAKUNDLI_PRICING.tax?.gstRateBps || GST_RATE_BPS);
  return amount + Math.round((amount * gstRateBps) / GST_BASIS_POINTS);
}

function mahakundliPriceMarkup(className = '', pricing = MAHAKUNDLI_PRICING) {
  const amount = Number(pricing?.amount || 500);
  const compareAtAmount = Number(pricing?.compareAtAmount);
  const gross = mahakundliGrossPrice(pricing);
  const compareAtMarkup = Number.isFinite(compareAtAmount) && compareAtAmount > amount
    ? `<del aria-label="Regular Mahakundli report price ${escapeHtml(inr(compareAtAmount))}">${escapeHtml(inr(compareAtAmount))}</del>`
    : '';
  return `<div class="mahakundli-price ${escapeHtml(className)}">
    <span>${compareAtMarkup}<strong>${inr(amount)} <small>+ GST</small></strong></span>
    <em>${inr(gross)} total · one-time payment</em>
  </div>`;
}

function mahakundliCategoryAnchorMarkup(className = '') {
  return `<div class="mahakundli-category-anchor ${escapeHtml(className)}">
    <small>What you receive</small>
    <p><b>A live consultation covers one sitting.</b> Your Mahakundli keeps 17 separate life areas from your own kundli in one report you can read again.</p>
    <span>One calculation · one payment · PDF included</span>
  </div>`;
}

function mahakundliQuestionDeckMarkup(className = '') {
  const questions = [
    ['♥', 'Marriage', 'What should you check before deciding on marriage?', 'marriage'],
    ['↗', 'Job', 'Should you switch now, or will the same pressure follow you?', 'career'],
    ['₹', 'Money', 'Why does money come in but still not feel secure?', 'money'],
    ['△', 'Business', 'Is this the time to grow, take a partner, or protect your cash?', 'recognition']
  ];
  return `<div class="mahakundli-question-deck ${escapeHtml(className)}" role="region" tabindex="0" aria-label="Four important questions your Mahakundli answers; swipe or use arrow keys to see every card">
    ${questions.map(([icon, label, question, topic]) => `<span class="mahakundli-question-card--${topic}"><i aria-hidden="true">${icon}</i><small>${escapeHtml(label)}</small><b>${escapeHtml(question)}</b></span>`).join('')}
  </div><small class="mahakundli-swipe-cue" aria-hidden="true">4 of 17 areas — swipe →</small>`;
}

function mahakundliPersonalCalculationPromiseMarkup(className = '') {
  return `<div class="mahakundli-refund-note mahakundli-refund-note--specificity ${escapeHtml(className)}"><b>Our promise to you</b><span>Your paid report will use the birth details you gave, show all personal dasha dates and graha positions that can be calculated reliably, and explain the basis for each answer. If it misses anything promised for the details you provided, tell us within 7 days. We will correct or prepare the report again. If we still cannot deliver what was promised, we will refund your report payment.</span><a href="/terms-and-conditions.html">Read the terms</a></div>`;
}

// Temporarily hidden: these two generic blocks interrupt the direct sales argument.
// Keep their markup available so a stronger, evidence-backed version can be restored later.
const MAHAKUNDLI_SHOW_SAMPLE_AND_AUDIENCE = false;

function mahakundliSampleReportMarkup() {
  return `<section class="mahakundli-sample" aria-labelledby="mahakundli-sample-title">
    <div class="mahakundli-sample__heading">
      <div class="mahakundli-section-kicker">See the report before you buy</div>
      <h2 id="mahakundli-sample-title">See how one kundli becomes dates, reasons and next steps.</h2>
      <p>This sample was calculated on 31 July 2026. Your report uses your own birth details, so your answer may be different.</p>
      <div class="mahakundli-sample__identity"><b>Sample kundli</b><span>14 May 1993 · 8:30 AM · Meerut</span><small>Mithuna (Gemini) Lagna · Kumbha (Aquarius) Chandra (Moon) · Mesha (Aries) Surya (Sun)</small></div>
    </div>
    <div class="mahakundli-sample__pages" role="region" tabindex="0" aria-label="Three sample Mahakundli report pages; swipe or use arrow keys to see every page">
      <article class="mahakundli-sample-page">
        <div class="mahakundli-sample-page__top"><small>01</small><span>What is active now</span></div>
        <h3>Guru (Jupiter)–Rahu (North Node)–Ketu (South Node)</h3>
        <dl>
          <div><dt>Mahadasha</dt><dd><b>Guru (Jupiter)</b><span>21 Jul 2011–21 Jul 2027</span></dd></div>
          <div><dt>Antardasha</dt><dd><b>Rahu (North Node)</b><span>25 Feb 2025–21 Jul 2027</span></dd></div>
          <div><dt>Pratyantardasha</dt><dd><b>Ketu (South Node)</b><span>21 Jul–10 Sep 2026</span></dd></div>
        </dl>
        <p><b>Wider period:</b> growth, guidance and long-term direction.</p>
        <p><b>Inside it:</b> ambition, new things and risk-taking.</p>
        <p><b>Right now:</b> letting go, finishing old work and looking inward.</p>
      </article>
      <article class="mahakundli-sample-page mahakundli-sample-page--answer">
        <div class="mahakundli-sample-page__top"><small>02</small><span>Career direction</span></div>
        <h3>Career has a good opening in this period. Be clear about the role you want next.</h3>
        <p>Shukra (Venus) sits in your 10th house, the house of career. Your Guru (Jupiter) Mahadasha is active here, and Shani (Saturn) is passing through the same house.</p>
        <div class="mahakundli-sample-answer"><small>Favourable period</small><b>Guru (Jupiter)–Rahu (North Node) · 25 Feb 2025–21 Jul 2027</b></div>
        <div class="mahakundli-sample-answer"><small>What to do now</small><span>Finish one thing and show it: a completed project, a written result, or one clear work sample.</span></div>
        <div class="mahakundli-sample-answer"><small>What this does not mean</small><span>This does not promise a job, a promotion, or your boss's decision.</span></div>
        <footer>Based on: 10th house · Shukra (Venus) · Guru (Jupiter) dasha · Shani (Saturn) transit</footer>
      </article>
      <article class="mahakundli-sample-page">
        <div class="mahakundli-sample-page__top"><small>03</small><span>This period and the next two</span></div>
        <ol class="mahakundli-sample-timeline">
          <li><time>Active now · 21 Jul–10 Sep 2026</time><b>Guru (Jupiter)–Rahu (North Node)–Ketu (South Node)</b><span>Completion and inward focus</span></li>
          <li><time>10 Sep 2026–3 Feb 2027</time><b>Guru (Jupiter)–Rahu (North Node)–Shukra (Venus)</b><span>Relationships, comfort and agreements</span></li>
          <li><time>3 Feb–19 Mar 2027</time><b>Guru (Jupiter)–Rahu (North Node)–Surya (Sun)</b><span>Self, authority and being in charge</span></li>
        </ol>
      </article>
    </div>
    <small class="mahakundli-swipe-cue mahakundli-swipe-cue--sample" aria-hidden="true">Swipe to see all 3 sample pages →</small>
    <button class="secondary-button mahakundli-cta mahakundli-cta--secondary" type="button" data-action="start-lane">Get my first answer free</button>
  </section>`;
}

function mahakundliAudienceMarkup() {
  const reasons = [
    ['“I need to make a decision soon.”', 'See whether career, job, promotion, business, property or shifting city is favoured now, or needs more preparation first.'],
    ['“I need clarity before making a relationship decision.”', 'We check attraction, commitment, family expectations and the practical agreement between both people.'],
    ['“Money comes in, but nothing ever feels safe.”', 'We look at earning, savings, loans, hidden risk and the habit that eats whatever you save.'],
    ["“Something has changed, but I don't know when it started.”", 'See the Mahadasha, Antardasha and Pratyantardasha running now, and the exact date the next one starts.'],
    ['“I want it in writing, so I can come back before my next big decision.”', 'You get 17 separate life areas, your next 3 periods, a 90-day plan and the full report as a PDF.']
  ];
  return `<section class="mahakundli-audience">
    <div class="mahakundli-section-kicker">Do any of these feel familiar?</div>
    <h2>Pick the reason you need an answer today.</h2>
    <div class="mahakundli-audience__grid">${reasons.map(([title, copy], index) => `<article><small>0${index + 1}</small><b>${title}</b><span>${copy}</span></article>`).join('')}</div>
    <p>Mahakundli helps you plan. It does not guarantee results. If your kundli cannot show a dated answer safely, the report says so clearly.</p>
  </section>`;
}

function setupMahakundliLifeAccordion() {
  const cards = [...stage.querySelectorAll('.mahakundli-life-card')];
  cards.forEach((card) => {
    card.addEventListener('toggle', () => {
      if (!card.open) return;
      cards.forEach((other) => {
        if (other !== card) other.open = false;
      });
    });
  });
}

function renderMahakundliLanding() {
  const config = laneConfig();
  const lifeQuestions = [
    ['Marriage and commitment', 'How do timing, family expectations and practical agreements affect a marriage decision?', '◇', 'What should you check before marriage?', 'marriage'],
    ['Children and family', 'How should you plan time, money and help at home for children or family responsibilities over the next 3 years?', '◌', 'How can you plan for children and family?', 'children'],
    ['Career and work direction', 'Does your current field still support your goals, or should you compare another direction?', '↗', 'Are you in the right career?', 'career'],
    ['Job change', 'Is this the time to resign and switch, or should you hold this job until a better opening appears?', '⇢', 'Leave this job now or wait?', 'job'],
    ['Promotion and bigger role', 'What should you check before asking for a promotion, and would the new title bring real authority or only more work?', '▲', 'What would a promotion really change?', 'promotion'],
    ['Business and partnerships', 'Is this the time to expand, take a partner or invest more? Which agreement or expense could turn growth into a loss?', '△', 'Expand now or protect the business?', 'business'],
    ['Money, savings and assets', 'Is this a better period to earn, save or buy an asset? If you have an EMI, recurring expense or debt, which one should you review?', '₹', 'How can you improve financial security?', 'money'],
    ['Love and relationships', 'Is this relationship moving towards commitment, or are mixed signals, distance or an old attachment keeping it uncertain?', '♥', 'Will this relationship become serious?', 'love'],
    ['Home, family and property', 'Is this a good period to buy, sell or shift home, and what could family pressure, paperwork or a loan complicate?', '⌂', 'Buy property, sell or wait?', 'home'],
    ['Health, energy and recovery', 'How can you protect sleep, manage stress and support your energy while keeping medical decisions with a qualified professional?', '◐', 'How can you protect your daily wellbeing?', 'wellbeing'],
    ['Loans, losses and financial risk', 'Does any loan, EMI, guarantee or risky investment need review before you take another financial risk?', '▼', 'Which financial risks should you review?', 'risk'],
    ['Fame, recognition and public reach', 'When can your work reach more people, and could that attention bring respect, customers or only temporary noise?', '✦', 'When will people notice your name?', 'recognition'],
    ['Travel, foreign links and relocation', 'Does your kundli show a real opening for study, work or settlement abroad in the next 3 years, or only plans that keep getting delayed?', '◷', 'Will the foreign plan finally move?', 'travel'],
    ['Education, exams and further study', 'Is this the right period for exams, higher studies or a professional course, or would work experience take you further?', '✶', 'Will studies or exams move forward?', 'education'],
    ['Parents and family responsibility', 'Which family responsibility may need more time, money or attention, and how could that change your own plans?', '◔', 'When parents need more from you', 'parents'],
    ['Siblings and family communication', 'Is money, property or unequal family responsibility creating distance with a sibling, and when is it easier to talk?', '↔', 'What is creating distance with siblings?', 'communication'],
    ['Your current dasha and life direction', 'When your birth details support personal timing, what changed when this dasha began and when does the next period start?', '◎', 'What changed when this dasha began?', 'self']
  ];
  const inside = [
    'Your Lagna (Ascendant), Chandra (Moon), Surya (Sun) and all 9 grahas',
    'All 12 houses in simple words',
    '7 varga charts, including D9 for marriage and D10 for career',
    'Current Mahadasha, Antardasha and Pratyantardasha',
    'Your full Vimshottari dasha timeline',
    'Guru (Jupiter), Shani (Saturn), Rahu (North Node) and Ketu (South Node) transits for the next 3 years',
    'Only the yogas and doshas your kundli actually shows',
    '17 important life areas, each checked separately',
    'Your next 3 periods and a simple 90-day plan',
    'Optional low-cost upay (remedies), honest limits and simple meanings for every term',
    'The same full report as a PDF you can download'
  ];
  show(`<div class="mahakundli-landing" data-testid="mahakundli-landing">
    ${referralArrivalMarkup()}
    ${previousPaidReportMarkup()}
    <section class="mahakundli-hero">
      <div class="mahakundli-hero__copy">
        <div class="mahakundli-kicker">Not one question. One report for your kundli.</div>
        <h1>Marriage, money, career, health, children, property — all 17 areas.</h1>
        <p>We check 17 life areas separately. When your birth details allow, we calculate the Mahadasha, Antardasha and Pratyantardasha running now and compare them with the next 3 years of major transits. If personal dates cannot be calculated reliably, we say so clearly.</p>
        <div class="mahakundli-hero__value">See one calculated life-area result free, before you pay.</div>
        <button class="primary-button mahakundli-cta" type="button" data-action="start-lane" data-testid="landing-cta">${escapeHtml(config.landingCta)}</button>
        <small class="mahakundli-reassurance">Free to start · All 17 areas for ${inr(Number(MAHAKUNDLI_PRICING.amount || 500))} + GST</small>
        ${mahakundliQuestionDeckMarkup('mahakundli-question-deck--hero')}
        ${mahakundliPriceMarkup('mahakundli-price--hero')}
        <div class="mahakundli-proof-row" aria-label="Mahakundli customer, practice and method proof">
          <span><b>${MAHAKUNDLI_VERIFIED_PAID_REPORT_FLOOR}</b><small>Paid reports delivered</small></span>
          <span><b>Since 1998</b><small>Vedic practice</small></span>
          <span><b>17</b><small>Life areas covered</small></span>
          <span><b>Every answer</b><small>Explains the factors used in plain words</small></span>
        </div>
        ${mahakundliPersonalCalculationPromiseMarkup('mahakundli-refund-note--hero')}
      </div>
      <div class="mahakundli-hero__art">${mahakundliWheelMarkup()}<div class="mahakundli-art-note"><b>Built from the birth details you provide.</b><span>Explained in plain words.</span></div></div>
    </section>

    ${MAHAKUNDLI_SHOW_SAMPLE_AND_AUDIENCE ? mahakundliSampleReportMarkup() : ''}
    ${MAHAKUNDLI_SHOW_SAMPLE_AND_AUDIENCE ? mahakundliAudienceMarkup() : ''}

    <section class="mahakundli-curiosity">
      <div class="mahakundli-section-kicker">Why one general answer may feel incomplete</div>
      <h2>One period can affect each life area differently.</h2>
      <p>The same dasha may support work while marriage needs more patience and family duties need attention. We check each area separately, then explain what may help, what needs care and what changes next.</p>
      <div class="mahakundli-curiosity__path"><span>What your kundli shows</span><i>+</i><span>Which dasha is running</span><i>+</i><span>Current major transits</span><i>=</i><b>Your life-area answer</b></div>
    </section>

    <section class="mahakundli-life">
      <div class="mahakundli-section-kicker">17 real-life questions · 17 separate answers</div>
      <h2>Start with the question that matters most now.</h2>
      <p class="mahakundli-section-lead">A marriage decision. A possible job change. A promotion question. Money that feels unsettled. Open the card that fits your situation now.</p>
      <div class="mahakundli-life-grid">${lifeQuestions.map(([title, question, icon, cue, topic], index) => `<details class="mahakundli-life-card mahakundli-life-card--${topic}" name="mahakundli-life-question" ${index === 0 ? 'open' : ''}>
        <summary><span>${icon}</span><span class="mahakundli-life-card__title"><small>${escapeHtml(cue)}</small><b>${escapeHtml(title)}</b></span><i aria-hidden="true">+</i></summary>
        <p>${escapeHtml(question)}</p>
      </details>`).join('')}</div>
      <button class="secondary-button mahakundli-cta mahakundli-cta--secondary" type="button" data-action="start-lane">Get my first answer free</button>
    </section>

    <section class="mahakundli-now">
      <div>
        <div class="mahakundli-section-kicker">Why timing matters now</div>
        <h2>Personal periods change over time.</h2>
        <p>When your birth details allow personal dasha timing, the start and end dates can help you plan when to act, prepare or protect what you have. They guide a decision; they do not decide it for you.</p>
      </div>
      <div class="mahakundli-now__signal"><small>Understand the period while it is active</small><b>Start date → what is active → next change</b><span>Calculated from the birth details you provide.</span></div>
    </section>

    <section class="mahakundli-inside">
      <div class="mahakundli-inside__copy">
        <div class="mahakundli-section-kicker">Inside your full report</div>
        <h2>A list of planets tells you what is in your kundli. It does not tell you what matters right now.</h2>
        <p>Each life area gives you a plain answer, the reason behind it, the period it applies to, and one step you can actually take.</p>
        <div class="mahakundli-compare">
          <div><small>Ordinary kundli report</small><span>“Shani (Saturn) in the 10th house”</span></div>
          <i>→</i>
          <div><small>Your Mahakundli</small><span>Meaning · reason · running period · timing · what to do · what it cannot promise</span></div>
        </div>
      </div>
      <ul class="mahakundli-inside__list">${inside.map((item) => `<li><span>✓</span>${escapeHtml(item)}</li>`).join('')}</ul>
    </section>

    <section class="mahakundli-steps">
      <div class="mahakundli-section-kicker">Start in four simple steps</div>
      <h2>See your own result before you decide to pay.</h2>
      <div class="mahakundli-step-grid">
        <div><b>1</b><span><strong>Tell us your name and birth date</strong><small>This makes the report yours and keeps it private.</small></span></div>
        <div><b>2</b><span><strong>Add birth time and birthplace if known</strong><small>A reliable time and place determine your Lagna, houses and exact birth moment.</small></span></div>
        <div><b>3</b><span><strong>See one calculated result free</strong><small>We show one life-area answer based on what your details can support.</small></span></div>
        <div><b>4</b><span><strong>Open the full report only if it feels useful</strong><small>Pay once. Read it here. Download the same report as a PDF.</small></span></div>
      </div>
    </section>

    <section class="mahakundli-value">
      <div>
        <div class="mahakundli-section-kicker">One report you can come back to</div>
        <h2>Keep 17 life-area answers in one report you can read again.</h2>
        <p>Come back to it before a marriage decision, financial risk, career change or family responsibility.</p>
      </div>
      ${mahakundliCategoryAnchorMarkup('mahakundli-category-anchor--landing')}
    </section>

    <section class="mahakundli-honesty">
      <div>
        <div class="mahakundli-section-kicker">Know before you pay</div>
        <h2>Before you pay, we show whether your details can give exact dasha dates.</h2>
      </div>
      <ul>
        <li><b>Don't know your birth time?</b><span>Then we don't show houses, varga charts or exact personal dates. We never guess.</span></li>
        <li><b>No yoga or dosha?</b><span>We list one only when your kundli clearly meets its rule. If we don't find any, we say so plainly.</span></li>
        <li><b>Health, money or children?</b><span>The report clearly says what astrology cannot decide and when to ask a qualified expert.</span></li>
        <li><b>Every calculated conclusion?</b><span>Each one is saved with the exact planet, house or period it came from.</span></li>
      </ul>
      <div class="mahakundli-refund-note"><b>Payment protection</b><span>Paid twice, or paid but got no report? Write to us within 7 days. We will check the payment and either open your access, resend the report, or refund you.</span><a href="/terms-and-conditions.html">Read the terms</a></div>
    </section>

    <section class="mahakundli-final">
      ${mahakundliWheelMarkup()}
      <div>
        <div class="mahakundli-section-kicker">Personal period dates are shown when your birth details allow</div>
        <h2>See what can be calculated before you decide to pay.</h2>
        <p>Give your name and birth date, plus a reliable birth time and birthplace if known. You will see one life-area answer free. Personal dasha timing appears only when it can be calculated reliably.</p>
        <div class="mahakundli-value-anchor"><small>One complete calculation</small><b>17 separate life areas · one payment</b><span>Not one general answer for every worry.</span></div>
        ${mahakundliPriceMarkup('mahakundli-price--final')}
        <button class="primary-button mahakundli-cta" type="button" data-action="start-lane">${escapeHtml(config.landingCta)}</button>
        <small>One-time payment · No subscription · PDF included</small>
      </div>
    </section>
    <div class="privacy-line">Your details stay private · Guidance for planning, not a fixed future</div>
  </div>`);
  setupMahakundliLifeAccordion();
}

function renderLanding() {
  if (state.lane === '_default') {
    show(`<div class="landing-screen landing-screen--home">
      ${referralArrivalMarkup()}
      ${previousPaidReportMarkup()}
      <div class="home-hero">
        <span class="home-hero__ornament" aria-hidden="true">${homeStarOrnament()}</span>
        <div class="kicker center">Authentic Vedic Astrology & Insights · Est. 1998</div>
        <h1 class="hero-title home-hero-title">Personalized Insights <em>prepared for your path alone.</em></h1>
        <p class="hero-subtitle">Explore your path with Vedic clarity. Uncover the hidden patterns in your palm, face, and planetary alignment.</p>
      </div>
      <div class="home-primary-label">Choose your reading</div>
      <div class="home-mahakundli-questions">
        <small>Important answers inside your Mahakundli</small>
        ${mahakundliQuestionDeckMarkup('mahakundli-question-deck--home')}
      </div>
      <button class="home-mahakundli" type="button" data-action="choose-lane" data-value="mahakundli" data-testid="lane-mahakundli">
        <span class="home-mahakundli__copy">
          <span class="home-feature__eyebrow">${homeStarOrnament()}Not one question. One report for your kundli.</span>
          <span class="home-mahakundli__hook">Marriage, money, career, health, children, property and 11 more life areas in one report.</span>
          <b>Mahakundli</b>
          <strong class="home-mahakundli__position">17 life areas, each checked separately, with personal dates when your birth details allow.</strong>
          <p>See personal timing when it can be calculated, the next 3 years of major transits, and a separate answer for each life area.</p>
          <small class="home-mahakundli__precision">A reliable birth time and place determine your Lagna, 12 houses and personal dasha dates.</small>
          <span class="home-feature__chips"><span>Running dasha</span><span>Life-area timing</span><span>Major transits</span></span>
          <span class="home-mahakundli__price"><strong>${inr(Number(MAHAKUNDLI_PRICING.amount || 500))} + GST</strong><small>${inr(mahakundliGrossPrice())} total</small></span>
          <span class="home-feature__cta">Get my first answer free<i>›</i></span>
          <small>4 details · free to start · one personal answer before you pay</small>
        </span>
        ${mahakundliWheelMarkup()}
      </button>
      <div class="home-mahakundli-steps" aria-label="How Mahakundli works">
        <span><b>1</b> Enter birth details</span><i>›</i><span><b>2</b> See one answer free</span><i>›</i><span><b>3</b> Open all 17 life areas</span>
      </div>
      <div class="home-primary-grid" data-testid="home-primary-readings">
        ${HOME_FEATURES.map((item) => `<button class="home-feature home-feature--${escapeHtml(item.art)}" type="button" data-action="choose-lane" data-value="${item.lane}" data-testid="lane-${item.lane.replaceAll('_', '-')}">
          <span class="home-feature__eyebrow">${homeStarOrnament()}${escapeHtml(item.eyebrow)}</span>
          <span class="home-feature__head">
            <span class="home-feature__medal">${item.art === 'face' ? homeFace() : homeHand()}</span>
            <span class="home-feature__intro">
              <span class="home-feature__title">${escapeHtml(item.title)}</span>
              <span class="home-feature__desc">${escapeHtml(item.desc)}</span>
            </span>
          </span>
          <span class="home-feature__chips">${item.chips.map((chip) => `<span>${escapeHtml(chip)}</span>`).join('')}</span>
          <span class="home-feature__cta">${escapeHtml(item.cta)}<i>›</i></span>
          <span class="home-feature__note">${escapeHtml(item.note)}</span>
        </button>`).join('')}
      </div>
      <div class="home-sep" aria-hidden="true"><i></i>${homeStarOrnament()}<i></i></div>
      <div class="home-grid-label">Or ask one focused question</div>
      <div class="home-grid">
        ${HOME_GRID.map((item) => `<button class="home-tile${item.eyebrow ? ' home-tile--new' : ''}" type="button" data-action="choose-lane" data-value="${item.lane}" data-testid="lane-${item.lane.replaceAll('_', '-')}">${item.eyebrow ? `<span class="home-tile__eyebrow">${escapeHtml(item.eyebrow)}</span>` : ''}${homeEmblem(item.lane)}<b>${escapeHtml(item.title)}</b><small>${escapeHtml(item.blurb)}</small></button>`).join('')}
      </div>
      <div class="home-assurance">Every reading begins free · Pay only if you choose the full report</div>
      <a class="home-about" href="/about-us">About the practice</a>
      <div class="privacy-line">Your details stay private · Personal guidance, not certainty</div>
    </div>`);
    return;
  }

  const config = laneConfig();
  if (state.lane === 'mahakundli') {
    renderMahakundliLanding();
    return;
  }
  if (state.lane === 'name_numerology') {
    const landingName = formatName(state.answers.name || '');
    const hasCalculableName = landingName.length >= 2 && clientNameBreakdown(landingName).letters.length >= 2;
    show(`<div class="landing-screen landing-screen--name_numerology">
      <div class="name-landing-main">
        ${referralArrivalMarkup()}
        ${previousPaidReportMarkup()}
        <div class="kicker center">${escapeHtml(config.kicker)}</div>
        <h1 class="hero-title"><span>${escapeHtml(config.headlineLead)}</span><span>${escapeHtml(config.headlineReveal)}</span></h1>
        <p class="hero-subtitle">${escapeHtml(config.subline)}</p>
        ${nameNumerologyHeroArt()}
      </div>
      <div class="name-landing-method">
        <div class="name-entry-card">
          <label for="landingNameInput">Name people call you most</label>
          <input class="input" id="landingNameInput" data-testid="name-numerology-input" type="text" autocomplete="name" enterkeyhint="go" placeholder="e.g. Riya Sharma" value="${escapeHtml(landingName)}" />
          <small>Use the spelling people see and say every day.</small>
        </div>
        ${nameLandingResultMarkup(landingName)}
      </div>
      <div class="name-landing-actions">
        <button class="primary-button" type="button" data-action="start-name-numerology" data-testid="landing-cta" ${hasCalculableName ? '' : 'disabled'}>${escapeHtml(config.landingCta)}</button>
        ${landingPriceMarkup()}
      </div>
    </div>`);
    return;
  }
  if (state.lane === 'face_answers') {
    show(`<div class="landing-screen landing-screen--face_answers face-landing" data-testid="face-landing">
      ${referralArrivalMarkup()}
      ${previousPaidReportMarkup()}
      <div class="face-landing__eyebrow">${escapeHtml(config.kicker)}</div>
      ${faceHeroArt()}
      <h1 class="face-landing__title">${escapeHtml(config.headline)}</h1>
      <p class="face-landing__copy">${escapeHtml(config.subline)}</p>
      <div class="face-landing__promise-row">${config.promises.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>
      <input class="file-input" id="landingFaceInput" data-testid="face-input" type="file" accept="image/*" aria-hidden="true" tabindex="-1" hidden />
      ${state.faceUploadError ? `<div class="error-card" data-testid="face-upload-error">${escapeHtml(state.faceUploadError)}</div>` : ''}
      <div class="face-landing__actions">
        <button class="primary-button" type="button" data-action="open-face-camera" data-testid="landing-cta">${escapeHtml(config.landingCta)}</button>
        <button class="secondary-button" type="button" data-action="choose-face" data-input="landingFaceInput">Use an existing photo</button>
        <div class="face-landing__price"><span>${escapeHtml(config.landingPrice)} ${prePayPricePairMarkup(FACE_PERSONALITY_REPORT_PRICE_INR, FACE_PERSONALITY_PRICING)}</span></div>
      </div>
      <div class="face-landing__privacy">✓ Processed on your device · Your photo is not uploaded or stored</div>
    </div>`);
    return;
  }
  const art = state.lane === 'best_city'
    ? cityHeroArt()
    : state.lane === 'partner_name'
      ? partnerHeroArt()
      : state.lane === 'market_profile'
        ? marketProfileHeroArt()
        : palmHeroArt();
  const landingHeroMarkup = `${art}
    <h1 class="hero-title ${state.lane === 'palm_answers' ? 'wide' : ''}">${escapeHtml(config.headline)}</h1>
    <p class="hero-subtitle">${escapeHtml(config.subline)}</p>`;
  show(`<div class="landing-screen landing-screen--${escapeHtml(state.lane)}">
    ${referralArrivalMarkup()}
    ${previousPaidReportMarkup()}
    ${state.lane === 'palm_answers' ? '<div class="palm-landing-main">' : ''}
    <div class="kicker center">${escapeHtml(config.kicker)}</div>
    ${landingHeroMarkup}
    ${state.lane === 'palm_answers' ? palmCoverageMarkup() : `<div class="promise-row">${config.promises.map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div>`}
    ${state.lane === 'palm_answers' ? '</div>' : ''}
    ${state.lane === 'palm_answers' ? IS_GLOBAL_STOREFRONT
      ? `<div class="palm-entry-actions" data-testid="global-adult-entry">
        <div class="palm-entry-reassurance"><b>Adults 18+ · free scan · about 30 seconds</b><span>We confirm adult eligibility before the camera or photo picker opens.</span></div>
        <button class="primary-button" type="button" data-action="start-global-age-check" data-testid="landing-cta">${escapeHtml(config.landingCta)}</button>
        <div class="palm-entry-price">Start free · ${escapeHtml(config.product)} ${palmLandingPriceMarkup()}</div>
      </div>`
      : `<input class="file-input" id="landingPalmInput" data-testid="palm-input" type="file" accept="image/*" aria-hidden="true" tabindex="-1" hidden />
        ${state.palmUploadError ? `<div class="error-card" data-testid="palm-upload-error">${escapeHtml(state.palmUploadError)}</div>` : ''}
        <div class="palm-entry-actions">
          <div class="palm-entry-reassurance"><b>Free scan · about 30 seconds · no signup</b><span>Private: only the photo you choose is sent securely for line detection.</span></div>
          <button class="primary-button" type="button" data-action="open-palm-camera" data-source="landing" data-testid="landing-cta">${escapeHtml(config.landingCta)}</button>
          <button class="secondary-button" type="button" data-action="choose-palm" data-input="landingPalmInput">Upload palm photo</button>
          <div class="palm-entry-price">Start free · ${escapeHtml(config.product)} ${palmLandingPriceMarkup()}</div>
        </div>` : state.lane === 'market_profile'
      ? state.marketLandingVariant === MARKET_LANDING_TREATMENT_VARIANT
        ? `<button class="primary-button" type="button" data-action="start-market-profile" data-testid="landing-cta">${escapeHtml(config.landingCta)}</button>`
        : `<div class="market-entry"><small>Which statement fits you today?</small><div class="market-entry-grid" data-testid="market-profile-options">${marketProfileOptionsMarkup()}</div></div>`
      : `<button class="primary-button" type="button" data-action="start-lane" data-testid="landing-cta">${escapeHtml(config.landingCta)}</button>`}
    ${state.lane === 'best_city' ? '<div class="landing-speed-line">About 60 seconds · Start free</div>' : ''}
    ${state.lane === 'palm_answers' ? '' : landingPriceMarkup()}
    <div class="privacy-line">${state.lane === 'palm_answers' ? 'Only the photo you choose is sent securely for line detection. PalmQ IND keeps the detected line points, not the photo.' : state.lane === 'market_profile' ? 'Personal reflection only · No stock tips or return promises' : 'Your details stay private · Pay once if you choose the full report'}</div>
  </div>`);
}

function renderMarketSegmentation() {
  show(`<div class="market-segmentation-screen" data-testid="market-segmentation">
    <div class="kicker center">One quick step</div>
    <h1 class="question-title center">Which statement fits you today?</h1>
    <p class="question-copy center">This helps compare your current market habits with the personal profile calculated from your details.</p>
    <div class="market-entry market-entry--screen"><div class="market-entry-grid" data-testid="market-profile-options">${marketProfileOptionsMarkup()}</div></div>
    <div class="privacy-line">Personal reflection only · No stock tips or return promises</div>
  </div>`);
}

function renderNameProof() {
  const name = formatName(state.answers.name || '');
  const result = clientNameBreakdown(name);
  const profile = clientNameNumberProfile(result.root);
  const ruler = clientNumberRulers[result.root] || '';
  trackOnce('nameNumberRevealed', 'name_number_revealed', {
    compound_number: result.compound,
    name_number: result.root,
    letter_count: result.letters.length
  });
  const visibleLetters = result.letters.slice(0, 18);
  show(`<div class="name-proof-screen" data-testid="name-number-proof">
    <div class="kicker center">Your first clue is open</div>
    <h1 class="question-title center">${escapeHtml(name)}, your name totals ${result.compound}/${result.root}.</h1>
    <p class="question-copy center">The letters add to compound ${result.compound}, then reduce to ${result.root}. In Chaldean numerology, ${result.root} is associated with ${escapeHtml(ruler)}.</p>
    <section class="name-first-clue" aria-label="Your free Name Number interpretation">
      <div class="name-first-clue__number"><small>Name ${result.compound}/${result.root}</small><strong>${result.root}</strong><span>${escapeHtml(ruler)} · ${escapeHtml(profile.title)}</span></div>
      <div class="name-first-clue__copy"><small>What your ${result.root} amplifies</small><h2>${escapeHtml(profile.power)}</h2><p>Every strength has a point where it can lose force. That is the clue most people miss.</p></div>
      <div class="name-trait-grid">
        <div class="name-trait"><small>Natural power</small><b>${escapeHtml(profile.power)}</b></div>
        <div class="name-trait name-trait--watch"><small>Blind spot</small><b>${escapeHtml(profile.watch)}</b></div>
      </div>
    </section>
    <div class="name-calculation-card">
      <small>${escapeHtml(name.toUpperCase())}</small>
      <div class="letter-value-grid">${visibleLetters.map((item) => `<span><b>${item.letter}</b><i>${item.value}</i></span>`).join('')}${result.letters.length > visibleLetters.length ? '<em>…</em>' : ''}</div>
      <div class="name-total"><span>${visibleLetters.map((item) => item.value).join(' + ')}${result.letters.length > visibleLetters.length ? ' + …' : ''}</span><b>= ${result.compound} → ${result.root}</b></div>
    </div>
    <div class="name-birth-gap"><small>${result.root} is not the final verdict</small><b>Will your birth date reinforce this strength—or pull it in another direction?</b><p>Your Birth and Destiny Numbers decide whether this spelling should stay or deserves a comparison.</p></div>
    <button class="primary-button" type="button" data-action="continue-name-proof">Match ${result.root} with my birth date</button>
    <div class="privacy-line">Next: your date of birth · No birth time or birthplace needed</div>
  </div>`);
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function validDob(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (
    !Number.isFinite(date.getTime())
    || date.toISOString().slice(0, 10) !== value
    || value > todayIso()
  ) return false;
  if (!IS_GLOBAL_STOREFRONT) return value >= '1950-01-01';
  const today = new Date();
  let age = today.getUTCFullYear() - date.getUTCFullYear();
  const month = today.getUTCMonth() - date.getUTCMonth();
  if (month < 0 || (month === 0 && today.getUTCDate() < date.getUTCDate())) age -= 1;
  return age >= 18 && age <= 120;
}

function dobParts(value = state.answers.dob) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? { year: match[1], month: match[2], day: match[3] } : { year: '', month: '', day: '' };
}

function birthTimeParts(value = state.answers.birthTime) {
  const match = /^(\d{2}):(\d{2})$/.exec(String(value || ''));
  if (!match) return { hour: '', minute: '', meridiem: '' };
  const hour24 = Number(match[1]);
  const minute = Number(match[2]);
  if (hour24 > 23 || minute > 59) return { hour: '', minute: '', meridiem: '' };
  return {
    hour: String(hour24 % 12 || 12),
    minute: String(minute).padStart(2, '0'),
    meridiem: hour24 >= 12 ? 'PM' : 'AM'
  };
}

function birthTimeRenderParts(value) {
  const draft = state.birthTimeDraft;
  if (!draft || typeof draft !== 'object') return birthTimeParts(value);
  return {
    hour: String(draft.hour || '').replace(/\D/g, '').slice(0, 2),
    minute: String(draft.minute || '').replace(/\D/g, '').slice(0, 2),
    meridiem: ['AM', 'PM'].includes(draft.meridiem) ? draft.meridiem : ''
  };
}

function birthTimeFromControls() {
  const hour = Number(document.getElementById('timeHour')?.value);
  const minuteText = String(document.getElementById('timeMinute')?.value || '');
  const minute = Number(minuteText);
  const meridiem = document.getElementById('timeMeridiem')?.value;
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) return '';
  if (!/^\d{1,2}$/.test(minuteText) || !Number.isInteger(minute) || minute < 0 || minute > 59) return '';
  if (!['AM', 'PM'].includes(meridiem)) return '';
  const hour24 = hour % 12 + (meridiem === 'PM' ? 12 : 0);
  return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function persistBirthTimeDraft() {
  const hour = String(document.getElementById('timeHour')?.value || '');
  const minute = String(document.getElementById('timeMinute')?.value || '');
  const meridiemValue = document.getElementById('timeMeridiem')?.value;
  state.birthTimeDraft = {
    hour,
    minute,
    meridiem: ['AM', 'PM'].includes(meridiemValue) ? meridiemValue : ''
  };
  const time = birthTimeFromControls();
  if (time) state.answers.birthTime = time;
  persist();
  return time;
}

function dobFromControls() {
  const day = String(document.getElementById('dobDay')?.value || '').padStart(2, '0');
  const month = String(document.getElementById('dobMonth')?.value || '').padStart(2, '0');
  const year = String(document.getElementById('dobYear')?.value || '').replace(/\D/g, '').slice(0, 4);
  return year.length === 4 && month !== '00' && day !== '00' ? `${year}-${month}-${day}` : '';
}

function focusSequentialControl(id, { birthTime = false } = {}) {
  const control = document.getElementById(id);
  if (!control || control.disabled) return false;
  control.focus({ preventScroll: true });
  if (control instanceof HTMLInputElement && control.value) control.select();
  if (birthTime) setTimeout(ensureBirthTimeInputVisible, 0);
  return true;
}

function usableGlobalAgeCheck() {
  return !IS_GLOBAL_STOREFRONT || Boolean(
    state.globalAgeCheckToken
    && Date.parse(state.globalAgeCheckExpiresAt || '') > Date.now() + 5_000
  );
}

async function requestGlobalAgeCheckCapability(dob = state.answers.dob) {
  if (!IS_GLOBAL_STOREFRONT) return '';
  if (!validDob(dob)) {
    const error = new Error('The international Palm Reading is available only to adults aged 18 or older.');
    error.code = 'GLOBAL_AGE_RESTRICTED';
    throw error;
  }
  const result = await api('/api/age-check', { dob });
  const token = String(result?.ageCheckToken || '').trim();
  const expiresAt = String(result?.expiresAt || '').trim();
  if (
    !token
    || token.length > 1800
    || !Number.isFinite(Date.parse(expiresAt))
    || Date.parse(expiresAt) <= Date.now() + 5_000
    || Number(result?.minimumAge) !== 18
    || Number(result?.maximumAge) !== 120
  ) {
    const error = new Error('The adult age check could not be verified. Please try again.');
    error.code = 'GLOBAL_AGE_CHECK_INVALID';
    throw error;
  }
  state.globalAgeCheckToken = token;
  state.globalAgeCheckExpiresAt = expiresAt;
  persist();
  return token;
}

async function completeGlobalDobStep(dob) {
  if (state.globalAgeCheckLoading) return;
  state.answers.dob = dob;
  state.globalAgeCheckLoading = true;
  state.globalAgeCheckError = '';
  persist();
  render();
  try {
    await requestGlobalAgeCheckCapability(dob);
    track('quiz_answer', { step: 'adult_age_check', value: 'verified_18_plus' });
    state.globalAgeCheckLoading = false;
    state.globalAgeCheckError = '';
    persist();
    next();
  } catch (error) {
    state.globalAgeCheckToken = '';
    state.globalAgeCheckExpiresAt = '';
    state.globalAgeCheckLoading = false;
    state.globalAgeCheckError = String(
      error?.message || 'The adult age check could not be verified. Please try again.'
    ).slice(0, 220);
    if (error?.code === 'GLOBAL_AGE_RESTRICTED') state.answers.dob = '';
    persist();
    render();
  }
}

function completeDobStep() {
  if (state.screen !== 'dob') return false;
  const dob = dobFromControls();
  if (!validDob(dob)) return false;
  if (IS_GLOBAL_STOREFRONT) {
    void completeGlobalDobStep(dob);
    return true;
  }
  state.answers.dob = dob;
  track('quiz_answer', { step: 'dob', value: 'completed' });
  maybeTrackBirthComplete();
  persist();
  focusTimeHourOnNextRender = !state.answers.birthTime && !state.birthTimeDraft;
  next();
  return true;
}

function completeTimeStep() {
  if (state.screen !== 'time') return false;
  const time = birthTimeFromControls();
  if (!time) return false;
  state.answers.birthTime = time;
  state.birthTimeDraft = null;
  track('quiz_answer', { step: 'birth_time', value: 'known' });
  persist();
  next();
  return true;
}

function autoAdvanceDobControl(input) {
  if (state.screen !== 'dob' || !input?.value) return false;
  if (input.id === 'dobDay') return focusSequentialControl('dobMonth');
  if (input.id === 'dobMonth') return focusSequentialControl('dobYear');
  if (input.id === 'dobYear' && input.value.length === 4) return completeDobStep();
  return false;
}

function autoAdvanceTimeControl(input) {
  if (state.screen !== 'time' || !input) return false;
  if (input.id === 'timeHour') {
    const value = String(input.value || '');
    const hour = Number(value);
    const complete = /^0[1-9]$|^1[0-2]$/.test(value)
      || (/^[2-9]$/.test(value) && hour >= 2 && hour <= 9);
    return complete ? focusSequentialControl('timeMinute', { birthTime: true }) : false;
  }
  if (input.id === 'timeMinute') {
    const value = String(input.value || '');
    if (!/^[0-5]\d$/.test(value)) return false;
    return focusSequentialControl('timeMeridiem', { birthTime: true });
  }
  if (input.id === 'timeMeridiem' && ['AM', 'PM'].includes(input.value)) {
    return completeTimeStep();
  }
  return false;
}

function laneQuestionCopy(step) {
  if (IS_GLOBAL_STOREFRONT && state.lane === 'palm_answers') {
    return {
      dob: 'Your birth date adds personal context to the reflective themes in your Palm profile.',
      time: 'Birth time can add more specific sidereal chart context. You can continue without it.',
      place: 'Choose your birth city from the worldwide list so its coordinates and time zone can be verified.',
      name: 'The name you use helps personalize how the report speaks to you.'
    }[step] || '';
  }
  const copy = {
    mahakundli: {
      name: 'Your name appears on this report. It does not change your kundli calculation.',
      dob: 'Your birth date starts the 120-year Vimshottari dasha clock. Exact time and place show which part is running now.',
      time: 'It fixes your Lagna, your 12 houses and your personal dasha dates. Without it, those are not shown.',
      place: 'Your birthplace converts your birth time into the correct moment and fixes your Lagna and 12 houses.'
    },
    best_city: {
      dob: 'We use your birth date to create the chart for your city comparison.',
      time: 'Birth time can make the city comparison and broader timing more precise. You can continue without it.',
      place: 'Your birthplace sets the location and time zone used for your chart.',
      name: 'Your Name Number is one part of the city comparison.'
    },
    partner_name: {
      dob: 'We use your birth date to create the relationship and numerology comparison.',
      time: 'Birth time can make the relationship period more precise. You can continue without it.',
      place: 'Your birthplace sets the location and time zone used for your chart.',
      name: 'Your Name Number helps compare possible starting sounds and initials.'
    },
    palm_answers: {
      dob: 'Your birth date helps personalize the periods shown in your Palm report.',
      time: 'Birth time can make your life timeline more precise. You can continue without it.',
      place: 'Your birthplace helps refine the timing in your personal Palm report.',
      name: 'The name people use for you helps complete your personal Palm report.'
    },
    face_answers: {
      dob: 'Your birth date starts Part 2. It creates the number cycles and chart context used to order your life phases.',
      time: 'Birth time sharpens year-level timing into narrower periods. The report still works without it.',
      place: 'Your birthplace sets the location and time zone used to calculate your Vedic timeline.',
      name: 'Your everyday spelling creates the Chaldean Name Number used to cross-check each life phase.'
    },
    name_numerology: {
      dob: 'Your birth date completes the match. It shows whether the name you use supports success and recognition—or creates a conflict.'
    },
    market_profile: {
      dob: 'We use your birth date to compare decision habits and broader money cycles.',
      time: 'Birth time can make the chart more precise. You can continue without it.',
      place: 'Your birthplace sets the location and time zone used for your chart.',
      name: 'Your Chaldean Name Number adds another view of patience and decisions under pressure.'
    }
  };
  return copy[state.lane]?.[step] || '';
}

function birthDetailsKicker(step, fallback = 'Birth details') {
  if (state.lane === 'mahakundli') {
    const steps = { name: 1, dob: 2, time: 3, place: 4 };
    return `Your Mahakundli · Step ${steps[step] || 1} of 4`;
  }
  if (state.lane !== 'face_answers') return fallback;
  const steps = { dob: 1, time: 2, place: 3, name: 4 };
  return `Complete Life Timeline · Step ${steps[step] || 1} of 4`;
}

function prefillFieldIsEditing(field) {
  return state.prefillEditingFields.includes(field);
}

function normalizedTypedBirthplace(value = state.answers.place) {
  return String(value || '').trim().replace(/\s+/g, ' ').slice(0, 160);
}

function hasUsableTypedBirthplace(value = state.answers.place) {
  const place = normalizedTypedBirthplace(value);
  const minimumLength = IS_GLOBAL_STOREFRONT ? 3 : 2;
  return place.length >= minimumLength && /[\p{L}\p{N}]/u.test(place);
}

function hasResolvedBirthplace() {
  return state.answers.location?.latitude != null
    && state.answers.location?.longitude != null
    && Number.isFinite(Number(state.answers.location.latitude))
    && Number.isFinite(Number(state.answers.location?.longitude));
}

function birthplaceReady() {
  if (IS_GLOBAL_STOREFRONT) {
    return hasResolvedBirthplace()
      && /^geonames:[1-9][0-9]{0,15}$/.test(String(state.answers.location?.sourceId || ''))
      && state.answers.location?.provider === 'geonames_global';
  }
  return hasResolvedBirthplace() || hasUsableTypedBirthplace();
}

function prefillDetailsComplete() {
  return formatName(state.answers.name).length >= 2
    && validDob(state.answers.dob)
    && (
      state.answers.birthTime === 'unknown'
      || /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(String(state.answers.birthTime || ''))
    )
    && birthplaceReady();
}

function prefillDisplayDate(value) {
  if (!validDob(value)) return 'Not provided';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    }).format(new Date(`${value}T00:00:00.000Z`));
  } catch (_) {
    return value;
  }
}

function prefillDisplayTime(value) {
  if (value === 'unknown') return 'Birth time not known';
  const parts = birthTimeParts(value);
  return parts.hour && parts.minute
    ? `${parts.hour}:${parts.minute} ${parts.meridiem}`
    : 'Not provided';
}

function prefillSummaryRow(field, label, value) {
  return `<div class="prefill-confirm__row">
    <span><small>${escapeHtml(label)}</small><b>${escapeHtml(value || 'Not provided')}</b></span>
    <button type="button" data-action="edit-prefill-field" data-value="${escapeHtml(field)}" aria-label="Edit ${escapeHtml(label.toLowerCase())}">Edit</button>
  </div>`;
}

function carriedPartnerCrossSellIdentity() {
  if (state.lane !== 'partner_name' || !state.additionalReportPrefillVersion) return null;
  return sanitizeCrossSellIdentity(state.crossSellIdentity, 'partner_name');
}

function confirmedCarriedPartnerCrossSell() {
  return Boolean(state.additionalReportPrefillConfirmed && carriedPartnerCrossSellIdentity());
}

function partnerCrossSellOfferStripMarkup() {
  if (!carriedPartnerCrossSellIdentity()) return '';
  const pricing = recommendationTargetPricing('partner_name');
  const price = recommendationTargetPrice('partner_name');
  return `<div class="prefill-confirm__suggestion" data-testid="partner-cross-sell-offer-strip">
    <small>Your Partner Initials Report · ${prePayPricePairMarkup(price, pricing, { allowCheckoutQuote: false })}</small>
    <b>Top 3 initials + where you may meet</b>
    <span>Plus matching name sounds and the reason each initial ranks.</span>
  </div>`;
}

function renderAdditionalReportConfirm() {
  const editingName = prefillFieldIsEditing('name');
  const editingDob = prefillFieldIsEditing('dob');
  const editingTime = prefillFieldIsEditing('time');
  const editingPlace = prefillFieldIsEditing('place');
  const name = formatName(state.answers.name);
  const birthTime = state.answers.birthTime || 'unknown';
  const place = String(state.answers.place || state.answers.location?.label || state.answers.location?.place || '');
  const suggestedPriority = ['overall', 'career', 'money', 'relationships'].includes(state.suggestedCityPriority)
    ? state.suggestedCityPriority
    : '';
  const priorityLabel = {
    overall: 'Overall fit',
    career: 'Career',
    money: 'Money',
    relationships: 'Relationships'
  }[suggestedPriority] || '';
  show(`<div class="prefill-confirm" data-testid="additional-report-confirm">
    <div class="kicker center">Carried forward securely</div>
    <h1 class="question-title center">Confirm your details</h1>
    <p class="question-copy center">We filled these from your paid Palm Reading. Check them once, edit anything that has changed, then continue.</p>
    <section class="prefill-confirm__card">
      ${editingName
        ? `<label class="prefill-confirm__edit"><span>Name used for this report</span><input class="input" id="prefillName" type="text" autocomplete="name" value="${escapeHtml(name)}" placeholder="Your everyday name" /></label>`
        : prefillSummaryRow('name', 'Name', name)}
      ${editingDob
        ? `<label class="prefill-confirm__edit"><span>Date of birth</span><input class="input" id="prefillDob" type="date" autocomplete="bday" min="1950-01-01" max="${todayIso()}" value="${escapeHtml(validDob(state.answers.dob) ? state.answers.dob : '')}" /></label>`
        : prefillSummaryRow('dob', 'Date of birth', prefillDisplayDate(state.answers.dob))}
      ${editingTime
        ? `<div class="prefill-confirm__edit"><label><span>Birth time</span><input class="input" id="prefillTime" type="time" value="${escapeHtml(birthTime === 'unknown' ? '' : birthTime)}" /></label><button class="text-button" type="button" data-action="prefill-unknown-time">I do not know my birth time</button></div>`
        : prefillSummaryRow('time', 'Birth time', prefillDisplayTime(birthTime))}
      ${editingPlace
        ? `<div class="prefill-confirm__edit"><label for="placeInput"><span>Birthplace</span></label><input class="input" id="placeInput" type="text" inputmode="search" enterkeyhint="done" autocomplete="off" aria-autocomplete="list" aria-controls="placeSuggestions" placeholder="City, state, country" value="${escapeHtml(place)}" /><div class="suggestions" id="placeSuggestions" role="listbox"></div></div>`
        : prefillSummaryRow('place', 'Birthplace', place)}
    </section>
    ${partnerCrossSellOfferStripMarkup()}
    ${state.lane === 'best_city' && priorityLabel ? `<div class="prefill-confirm__suggestion"><small>Suggested from your Palm report</small><b>${escapeHtml(priorityLabel)}</b><span>You will confirm or change this priority on the next screen.</span></div>` : ''}
    ${state.lane === 'market_profile' && state.reusableParentPalmAvailable ? `<label class="prefill-confirm__palm"><input id="reuseParentPalm" type="checkbox" ${state.reuseParentPalm ? 'checked' : ''} /><span><b>Use the Palm scan from my Palm Reading</b><small>The scan stays secure on the server. Palm points are not copied through this page.</small></span></label>` : ''}
    <button class="primary-button prefill-confirm__continue" type="button" data-action="confirm-additional-report-details" ${prefillDetailsComplete() ? '' : 'disabled'}>Everything is correct. Continue</button>
    <p class="prefill-confirm__privacy">Only these confirmed details continue to your new calculation. Editing them will not change your paid Palm Reading.</p>
  </div>`);
}

function editAdditionalReportPrefillField(field) {
  if (!['name', 'dob', 'time', 'place'].includes(field)) return;
  if (!state.prefillEditingFields.includes(field)) state.prefillEditingFields.push(field);
  track('next_reading_details_edited', {
    target_lane: state.lane,
    field
  });
  persist();
  render();
}

function confirmAdditionalReportDetails() {
  if (!prefillDetailsComplete()) return;
  cancelPlaceLookup();
  state.answers.name = formatName(state.answers.name);
  state.answers.place = normalizedTypedBirthplace();
  state.additionalReportPrefillConfirmed = true;
  track('next_reading_details_confirmed', {
    target_lane: state.lane,
    prefill_version: state.additionalReportPrefillVersion,
    edited_fields: state.prefillEditingFields.join(','),
    birth_time_known: state.answers.birthTime === 'unknown' ? 'no' : 'yes',
    reuse_parent_palm: state.lane === 'market_profile' && state.reuseParentPalm ? 'yes' : 'no'
  });
  maybeTrackBirthComplete();
  persist();
  if (state.lane === 'best_city') {
    go('scope', 'confirmed_prefill');
    return;
  }
  if (state.lane === 'market_profile') {
    go('marketsegment', 'confirmed_prefill');
    return;
  }
  go('analysis', 'confirmed_prefill');
}

function renderDob() {
  const value = validDob(state.answers.dob) ? state.answers.dob : '';
  const parts = dobParts(value);
  const isNameLane = state.lane === 'name_numerology';
  const nameNumber = isNameLane ? clientNameBreakdown(state.answers.name || '').root : null;
  const days = Array.from({ length: 31 }, (_, index) => {
    const day = String(index + 1).padStart(2, '0');
    return `<option value="${day}" ${parts.day === day ? 'selected' : ''}>${index + 1}</option>`;
  }).join('');
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    .map((label, index) => {
      const month = String(index + 1).padStart(2, '0');
      return `<option value="${month}" ${parts.month === month ? 'selected' : ''}>${label}</option>`;
    }).join('');
  const isMahakundli = state.lane === 'mahakundli';
  show(`<div class="kicker">${IS_GLOBAL_STOREFRONT ? 'Adults 18+ only' : isNameLane ? 'The deciding match' : escapeHtml(birthDetailsKicker('dob'))}</div>
    <h1 class="question-title">${IS_GLOBAL_STOREFRONT ? 'First, confirm that you are an adult.' : isNameLane ? `Which side of your ${nameNumber} does your birth date strengthen?` : isMahakundli ? 'What is your date of birth?' : 'When were you born?'}</h1>
    <p class="question-copy">${escapeHtml(IS_GLOBAL_STOREFRONT ? 'We check your age before the camera or photo picker can open. This international experience is available only to people aged 18 or older.' : isNameLane ? `Your date creates your Birth and Destiny Numbers. Together, they show whether this spelling reinforces the strength of ${nameNumber} or pulls in another direction.` : laneQuestionCopy('dob'))}</p>
    <fieldset class="field dob-field" data-testid="dob-input">
      <legend>Date of birth</legend>
      <div class="dob-grid">
        <label><span>Day</span><select class="input" id="dobDay"><option value="">Day</option>${days}</select></label>
        <label><span>Month</span><select class="input" id="dobMonth"><option value="">Month</option>${months}</select></label>
        <label><span>Year</span><input class="input" id="dobYear" type="text" inputmode="numeric" enterkeyhint="done" autocomplete="bday-year" maxlength="4" pattern="[0-9]*" placeholder="1995" value="${escapeHtml(parts.year)}" aria-describedby="dobHelp" aria-invalid="false" /></label>
      </div>
      <div class="field-help" id="dobHelp">${IS_GLOBAL_STOREFRONT ? 'You must be 18 or older. Type your 4-digit birth year.' : 'Type your 4-digit birth year. No calendar scrolling.'}</div>
    </fieldset>
    ${state.globalAgeCheckError ? `<div class="error-card" data-testid="global-age-check-error">${escapeHtml(state.globalAgeCheckError)}</div>` : ''}
    <button class="primary-button" type="button" data-action="save-dob" ${value && !state.globalAgeCheckLoading ? '' : 'disabled'}>${state.globalAgeCheckLoading ? 'Confirming age…' : IS_GLOBAL_STOREFRONT ? 'Confirm I am 18 or older' : isNameLane ? 'Find my three-number match' : isMahakundli ? 'Continue to birth time' : 'Use my birth date'}</button>`);
}

function renderTime() {
  const unknown = state.answers.birthTime === 'unknown';
  const value = unknown ? '' : (state.answers.birthTime || '');
  const parts = birthTimeRenderParts(value);
  const hourInvalid = Boolean(parts.hour) && !/^(?:0?[1-9]|1[0-2])$/.test(parts.hour);
  const minuteInvalid = Boolean(parts.minute) && !/^(?:\d|[0-5]\d)$/.test(parts.minute);
  const meridiemValid = ['AM', 'PM'].includes(parts.meridiem);
  const hasValidNumbers = Boolean(parts.hour && parts.minute && !hourInvalid && !minuteInvalid);
  const hasValidValue = hasValidNumbers && meridiemValid;
  const timeHelp = hourInvalid || minuteInvalid
    ? 'Enter an hour from 1–12 and minutes from 00–59.'
    : hasValidNumbers && !meridiemValid
      ? 'Choose AM or PM to continue.'
      : 'Enter the exact hour and minute, then choose AM or PM.';
  const bestCityTimeChoice = state.lane === 'best_city';
  const mahakundli = state.lane === 'mahakundli';
  show(`<div class="kicker">${escapeHtml(birthDetailsKicker('time'))}</div>
    <h1 class="question-title">${mahakundli ? 'Your birth time separates a general reading from dated answers.' : 'Do you know your birth time?'}</h1>
    <p class="question-copy">${escapeHtml(laneQuestionCopy('time'))}</p>
    ${mahakundli ? '<div class="mahakundli-time-nudge"><b>Where to check</b><span>Use the recorded time, not an estimate. Check a birth certificate, hospital record or family record, or ask someone who was present.</span></div>' : ''}
    <fieldset class="field time-field" data-testid="time-input">
      <legend>Birth time</legend>
      <div class="time-entry" role="group" aria-describedby="timeHelp">
        <label><span>Hour</span><input class="input time-number" id="timeHour" type="text" inputmode="numeric" enterkeyhint="next" autocomplete="off" maxlength="2" pattern="[0-9]*" placeholder="08" value="${escapeHtml(parts.hour)}" aria-label="Birth hour" aria-describedby="timeHelp" aria-invalid="${hourInvalid}" /></label>
        <span class="time-separator" aria-hidden="true">:</span>
        <label><span>Minute</span><input class="input time-number" id="timeMinute" type="text" inputmode="numeric" enterkeyhint="next" autocomplete="off" maxlength="2" pattern="[0-9]*" placeholder="30" value="${escapeHtml(parts.minute)}" aria-label="Birth minute" aria-describedby="timeHelp" aria-invalid="${minuteInvalid}" /></label>
        <label class="time-meridiem-label"><span>AM / PM</span><select class="input time-meridiem" id="timeMeridiem" aria-label="AM or PM" aria-describedby="timeHelp"><option value="" ${meridiemValid ? '' : 'selected'} disabled>Select</option><option value="AM" ${parts.meridiem === 'AM' ? 'selected' : ''}>AM</option><option value="PM" ${parts.meridiem === 'PM' ? 'selected' : ''}>PM</option></select></label>
      </div>
      <div class="field-help" id="timeHelp" aria-live="polite">${timeHelp}</div>
    </fieldset>
    <button class="primary-button" type="button" data-action="save-time" ${hasValidValue ? '' : 'disabled'}>${mahakundli ? 'Continue with this birth time' : 'Use this birth time'}</button>
    <button class="${bestCityTimeChoice ? 'secondary-button best-city-unknown-time' : 'text-button'}" type="button" data-action="unknown-time" data-testid="time-unknown">${bestCityTimeChoice ? 'I don’t know — show me a broader ranking' : mahakundli ? "I don't know it. Show me what can still be calculated from my birth date." : 'I do not know my birth time'}</button>
    ${mahakundli ? '<div class="mahakundli-time-trust">No birth time? We show only the stable facts that can be calculated from your birth date. Houses, varga charts and personal dasha dates are not shown.</div>' : ''}`);
}

function globalCheckoutConfig() {
  const value = RUNTIME_CONFIG.payments?.payglocal;
  return value && typeof value === 'object' ? value : {};
}

function globalCheckoutEnabled() {
  return IS_GLOBAL_STOREFRONT && globalCheckoutConfig().enabled === true;
}

function normalizeCheckoutEmail(value) {
  return String(value || '').trim().slice(0, 254);
}

function globalResidenceDraft() {
  const raw = state.answers.residence && typeof state.answers.residence === 'object'
    ? state.answers.residence
    : {};
  return {
    addressLine1: String(raw.addressLine1 || '').trim().slice(0, 160),
    addressLine2: String(raw.addressLine2 || '').trim().slice(0, 160),
    city: String(raw.city || '').trim().slice(0, 100),
    region: String(raw.region || '').trim().slice(0, 100),
    postalCode: String(raw.postalCode || '').trim().slice(0, 24),
    countryCode: String(raw.countryCode || '').trim().toUpperCase().slice(0, 2),
    usualResidenceConfirmed: raw.usualResidenceConfirmed === true,
    payerIsRecipientConfirmed: raw.payerIsRecipientConfirmed === true,
    termsConfirmed: raw.termsConfirmed === true
  };
}

function globalCheckoutDetailsComplete() {
  const residence = globalResidenceDraft();
  return Boolean(
    /.+@.+\..+/.test(normalizeCheckoutEmail(state.answers.paymentEmail))
    && residence.addressLine1
    && residence.city
    && residence.region
    && /^[\p{L}\p{N}][\p{L}\p{N}\s-]{1,23}$/u.test(residence.postalCode)
    && GLOBAL_RESIDENCE_COUNTRY_CODES.includes(residence.countryCode)
    && residence.usualResidenceConfirmed
    && residence.payerIsRecipientConfirmed
    && residence.termsConfirmed
  );
}

function captureGlobalCheckoutDetails() {
  if (!IS_GLOBAL_STOREFRONT) return;
  const checked = (id) => document.getElementById(id)?.checked === true;
  const value = (id, limit) => String(document.getElementById(id)?.value || '').trim().slice(0, limit);
  state.answers.paymentEmail = normalizeCheckoutEmail(value('globalCheckoutEmail', 254));
  state.answers.residence = {
    addressLine1: value('globalAddressLine1', 160),
    addressLine2: value('globalAddressLine2', 160),
    city: value('globalResidenceCity', 100),
    region: value('globalResidenceRegion', 100),
    postalCode: value('globalResidencePostalCode', 24),
    countryCode: value('globalResidenceCountry', 2).toUpperCase(),
    usualResidenceConfirmed: checked('globalUsualResidence'),
    payerIsRecipientConfirmed: checked('globalPayerIsRecipient'),
    termsConfirmed: checked('globalCheckoutTerms')
  };
  persist();
}

function globalResidenceCountryOptions(selectedCode = '') {
  let names = null;
  try {
    names = new Intl.DisplayNames([STOREFRONT_LOCALE, 'en'], { type: 'region' });
  } catch (_) {}
  return GLOBAL_RESIDENCE_COUNTRY_CODES
    .map((code) => ({ code, label: names?.of(code) || code }))
    .sort((left, right) => left.label.localeCompare(right.label, STOREFRONT_LOCALE))
    .map(({ code, label }) => `<option value="${code}" ${selectedCode === code ? 'selected' : ''}>${escapeHtml(label)}</option>`)
    .join('');
}

function renderGlobalCheckoutDetails() {
  const residence = globalResidenceDraft();
  const enabled = globalCheckoutEnabled();
  const amount = palmCheckoutTaxableValue();
  if (!enabled) {
    show(`<div class="analysis-screen" data-testid="global-checkout-gated">
      <div class="kicker center">International report status</div>
      <div class="analysis-orbit"><span>✦</span></div>
      <h1 class="question-title center">Your free Palm result is safe.</h1>
      <p class="question-copy center">The complete international report is not available yet. You can return to your free result without losing it.</p>
      <button class="primary-button" type="button" data-action="return-to-global-result">Return to my result</button>
      <div class="method-note">Nothing has been requested or taken.</div>
    </div>`);
    return;
  }
  show(`<div class="analysis-screen" data-testid="global-checkout-details">
    <div class="kicker">Secure international checkout</div>
    <h1 class="question-title">Confirm your current residence.</h1>
    <p class="question-copy">This is your current residential address, not your birthplace. We use it to validate payment availability and maintain required transaction records.</p>
    <div class="field"><label for="globalCheckoutEmail">Payment email</label><input class="input" id="globalCheckoutEmail" type="email" inputmode="email" autocomplete="email" maxlength="254" placeholder="you@example.com" value="${escapeHtml(normalizeCheckoutEmail(state.answers.paymentEmail))}" /><div class="field-help">Used by secure hosted checkout and payment recovery.</div></div>
    <div class="field"><label for="globalAddressLine1">Residential address</label><input class="input" id="globalAddressLine1" autocomplete="address-line1" maxlength="160" placeholder="Street address" value="${escapeHtml(residence.addressLine1)}" /></div>
    <div class="field"><label for="globalAddressLine2">Apartment, suite or unit <small>(optional)</small></label><input class="input" id="globalAddressLine2" autocomplete="address-line2" maxlength="160" placeholder="Apartment, suite or unit" value="${escapeHtml(residence.addressLine2)}" /></div>
    <div class="field"><label for="globalResidenceCity">City</label><input class="input" id="globalResidenceCity" autocomplete="address-level2" maxlength="100" value="${escapeHtml(residence.city)}" /></div>
    <div class="field"><label for="globalResidenceRegion">State, province or region</label><input class="input" id="globalResidenceRegion" autocomplete="address-level1" maxlength="100" value="${escapeHtml(residence.region)}" /></div>
    <div class="field"><label for="globalResidencePostalCode">Postal code</label><input class="input" id="globalResidencePostalCode" autocomplete="postal-code" maxlength="24" value="${escapeHtml(residence.postalCode)}" /></div>
    <div class="field"><label for="globalResidenceCountry">Country of usual residence</label><select class="input" id="globalResidenceCountry" autocomplete="country"><option value="">Select country</option>${globalResidenceCountryOptions(residence.countryCode)}</select></div>
    <label class="option-button"><input id="globalUsualResidence" type="checkbox" ${residence.usualResidenceConfirmed ? 'checked' : ''} /><span><b>This is my usual country of residence</b><small>I am currently in the same country and am not using a VPN or proxy.</small></span></label>
    <label class="option-button"><input id="globalPayerIsRecipient" type="checkbox" ${residence.payerIsRecipientConfirmed ? 'checked' : ''} /><span><b>I am buying this reading for myself</b><small>Gift purchases are not supported in international checkout yet.</small></span></label>
    <label class="option-button"><input id="globalCheckoutTerms" type="checkbox" ${residence.termsConfirmed ? 'checked' : ''} /><span><b>I agree to the <a href="/terms-and-conditions" target="_blank" rel="noopener">terms</a> and <a href="/privacy-policy" target="_blank" rel="noopener">privacy policy</a></b><small>Other taxes, card-conversion costs or bank charges may apply.</small></span></label>
    ${state.paymentError ? `<div class="error-card">${escapeHtml(state.paymentError)}</div>` : ''}
    <button class="primary-button" type="button" data-action="continue-global-checkout" ${state.checkoutLoading || !globalCheckoutDetailsComplete() ? 'disabled' : ''}>${state.checkoutLoading ? 'Opening secure payment…' : `Continue to secure checkout · ${escapeHtml(money(amount))}`}</button>
    ${paymentMethodTrustMarkup({ reassurance: true })}
  </div>`);
}

function renderPlace() {
  const ready = birthplaceReady();
  const mahakundli = state.lane === 'mahakundli';
  show(`<div class="kicker">${escapeHtml(birthDetailsKicker('place'))}</div>
    <h1 class="question-title">${mahakundli ? 'Where were you born?' : 'Where were you born?'}</h1>
    <p class="question-copy">${escapeHtml(laneQuestionCopy('place'))}</p>
    <div class="field place-field"><label for="placeInput">Birth city</label><input class="input" id="placeInput" data-testid="place-input" type="text" inputmode="search" enterkeyhint="done" autocomplete="off" aria-autocomplete="list" aria-controls="placeSuggestions" aria-describedby="placeHelp" placeholder="City, state, country" value="${escapeHtml(state.answers.place || '')}" /><div class="suggestions" id="placeSuggestions" role="listbox"></div><div class="field-help" id="placeHelp">${IS_GLOBAL_STOREFRONT ? 'Enter at least 3 characters, then choose the matching city from the worldwide list.' : 'Choose a matching city when it appears, or continue with the place as typed.'}</div>${IS_GLOBAL_STOREFRONT ? '<div class="field-help place-attribution"><a href="https://www.geonames.org/" target="_blank" rel="noopener">Place data © GeoNames, CC BY 4.0</a></div>' : ''}</div>
    <button class="primary-button" type="button" data-action="save-place" ${ready ? '' : 'disabled'}>${mahakundli ? 'Calculate my Mahakundli' : 'Continue with this birthplace'}</button>`);
}

function renderScope() {
  const storedScope = state.answers.locationScope || '';
  const scope = storedScope === 'India first' ? 'India first' : storedScope ? 'India and abroad' : '';
  if (storedScope && storedScope !== scope) {
    state.answers.locationScope = scope;
    persist();
  }
  const storedPriority = String(state.answers.cityPriority || '').toLowerCase();
  const priority = ['overall', 'career', 'money', 'relationships'].includes(storedPriority) ? storedPriority : '';
  const scopeOptions = [
    { value: 'India first', label: 'Indian cities only', help: 'Compare leading cities across India' },
    { value: 'India and abroad', label: 'Indian and international cities', help: 'Compare strong options in India and other countries' }
  ];
  const priorityOptions = [
    { value: 'overall', label: 'Overall fit', help: 'Balance all four areas' },
    { value: 'career', label: 'Career', help: 'Work and opportunity' },
    { value: 'money', label: 'Money', help: 'Earning and stability' },
    { value: 'relationships', label: 'Relationships', help: 'Love, family and belonging' }
  ];
  show(`<div class="kicker">Your city search</div>
    <h1 class="question-title">Where should we search—and what matters most?</h1>
    <p class="question-copy">Choose the search area and the life priority your ranking should favour.</p>
    <section class="city-choice-group" aria-labelledby="cityScopeLabel">
      <b id="cityScopeLabel">1. Search area</b>
      <div class="scope-grid" data-testid="scope-options">${scopeOptions.map((item) => `<button class="option-button ${scope === item.value ? 'is-selected' : ''}" type="button" data-action="choose-scope" data-value="${escapeHtml(item.value)}" aria-pressed="${scope === item.value}">${escapeHtml(item.label)}<small>${escapeHtml(item.help)}</small></button>`).join('')}</div>
    </section>
    <section class="city-choice-group city-choice-group--priority" aria-labelledby="cityPriorityLabel">
      <b id="cityPriorityLabel">2. Your main priority</b>
      <div class="scope-grid city-priority-grid" data-testid="city-priority-options">${priorityOptions.map((item) => `<button class="option-button ${priority === item.value ? 'is-selected' : ''} ${state.suggestedCityPriority === item.value ? 'is-suggested' : ''}" type="button" data-action="choose-city-priority" data-value="${escapeHtml(item.value)}" aria-pressed="${priority === item.value}">${escapeHtml(item.label)}${state.suggestedCityPriority === item.value ? '<em>Suggested from your Palm report</em>' : ''}<small>${escapeHtml(item.help)}</small></button>`).join('')}</div>
    </section>
    <button class="primary-button city-scope-continue" type="button" data-action="continue-city-scope" ${scope && priority ? '' : 'disabled'}>Build my city ranking</button>`);
}

function updateCityChoiceState(group, selectedValue) {
  group?.querySelectorAll('.option-button').forEach((button) => {
    const selected = button.dataset.value === selectedValue;
    button.classList.toggle('is-selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  const continueButton = stage.querySelector('[data-action="continue-city-scope"]');
  if (continueButton) {
    const hasScope = ['India first', 'India and abroad'].includes(state.answers.locationScope);
    const hasPriority = ['overall', 'career', 'money', 'relationships'].includes(String(state.answers.cityPriority || '').toLowerCase());
    continueButton.disabled = !(hasScope && hasPriority);
  }
}

function formatName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase().replace(/(^|[\s'-])\p{L}/gu, (match) => match.toUpperCase());
}

function renderName() {
  const name = formatName(state.answers.name || '');
  const mahakundli = state.lane === 'mahakundli';
  show(`<div class="kicker">${escapeHtml(birthDetailsKicker('name', 'Numerology'))}</div>
    <h1 class="question-title">${mahakundli ? 'First, what should we call you?' : 'What name do you use most often?'}</h1>
    <p class="question-copy">${escapeHtml(laneQuestionCopy('name'))}</p>
    <div class="field"><label for="nameInput">${mahakundli ? 'Name used for this report' : 'Your everyday name'}</label><input class="input" id="nameInput" data-testid="name-input" type="text" autocomplete="name" placeholder="Your everyday name" value="${escapeHtml(name)}" /><div class="field-help">${mahakundli ? 'This changes how the report addresses you. It does not change the planetary calculation.' : 'Enter the full name people use for you most often.'}</div></div>
    <button class="primary-button" type="button" data-action="save-name" ${name.length >= 2 ? '' : 'disabled'}>${mahakundli ? 'Continue to birth date' : 'Use this name'}</button>`);
}

function maybeTrackBirthComplete() {
  const complete = state.lane === 'name_numerology'
    ? validDob(state.answers.dob) && formatName(state.answers.name).length >= 2
    : validDob(state.answers.dob) && Boolean(state.answers.birthTime) && birthplaceReady() && formatName(state.answers.name).length >= 2;
  if (complete) trackOnce('birthComplete', 'birth_details_completed', { birth_time_known: state.lane === 'name_numerology' ? 'not_requested' : state.answers.birthTime === 'unknown' ? 'no' : 'yes' });
}

let placeRequest = 0;
let locationLookupRetryCount = 0;
let placeLookupAbortController = null;

function updatePlaceLookupUi() {
  const help = document.getElementById('placeHelp');
  if (help && IS_GLOBAL_STOREFRONT) {
    help.textContent = hasResolvedBirthplace()
      ? 'Worldwide city matched securely.'
      : state.placeLookupStatus === 'fallback'
        ? 'No verified city is selected yet. Add the state or country and try again.'
        : state.placeLookupStatus === 'pending'
          ? 'Searching the worldwide city list…'
          : 'Enter at least 3 characters, then choose the matching city from the worldwide list.';
  }
  updateContinueButtons();
}

function renderPlaceSuggestions(places = []) {
  const host = document.getElementById('placeSuggestions');
  state.placeSuggestions = Array.isArray(places) ? places : [];
  if (!host) return;
  host.innerHTML = state.placeSuggestions.length
    ? state.placeSuggestions.map((place, index) => `<button class="suggestion-button" type="button" role="option" data-action="choose-place" data-index="${index}" data-testid="place-option"><b>${escapeHtml(place.label || place.place)}</b></button>`).join('')
    : '';
  host.scrollTop = 0;
  if (state.placeSuggestions.length) ensurePlaceResultsVisible(host);
}

function cancelPlaceLookup({ invalidate = true } = {}) {
  clearTimeout(state.placeTimer);
  state.placeTimer = null;
  if (placeLookupAbortController) {
    placeLookupAbortController.abort();
    placeLookupAbortController = null;
  }
  if (invalidate) placeRequest += 1;
}

function handlePlaceTyping(value) {
  const text = String(value || '').trim();
  cancelPlaceLookup();
  const requestId = placeRequest;
  state.answers.place = text;
  state.answers.location = null;
  locationLookupRetryCount = 0;
  renderPlaceSuggestions([]);
  state.placeLookupStatus = hasUsableTypedBirthplace(text) ? 'pending' : 'idle';
  persist();
  updatePlaceLookupUi();
  if (!hasUsableTypedBirthplace(text)) return;

  if (text.length < 3) {
    state.placeLookupStatus = 'fallback';
    persist();
    updatePlaceLookupUi();
    return;
  }
  state.placeTimer = setTimeout(async () => {
    placeLookupAbortController = typeof AbortController === 'function'
      ? new AbortController()
      : null;
    try {
      const body = await getJson(
        `/api/places?q=${encodeURIComponent(text)}`,
        false,
        placeLookupAbortController ? { signal: placeLookupAbortController.signal } : {}
      );
      if (placeRequest !== requestId) return;
      const list = Array.isArray(body.places) ? body.places : [];
      placeLookupAbortController = null;
      if (!list.length) {
        state.placeLookupStatus = 'fallback';
        persist();
        return;
      }
      state.placeLookupStatus = 'choices';
      renderPlaceSuggestions(list);
      updatePlaceLookupUi();
    } catch (error) {
      if (placeRequest !== requestId) return;
      placeLookupAbortController = null;
      if (error?.name !== 'AbortError') {
        state.placeLookupStatus = 'fallback';
        renderPlaceSuggestions([]);
        persist();
      }
    }
  }, PLACE_SUGGESTION_DEBOUNCE_MS);
}

function resumePendingPlaceLookupAfterRender() {
  if (
    state.placeLookupStatus !== 'pending'
    || !hasUsableTypedBirthplace()
    || hasResolvedBirthplace()
    || state.placeTimer
    || placeLookupAbortController
  ) return;
  const input = document.getElementById('placeInput');
  if (!input || String(input.value || '').trim() !== normalizedTypedBirthplace()) return;
  queueMicrotask(() => {
    if (
      state.placeLookupStatus === 'pending'
      && document.getElementById('placeInput') === input
      && !state.placeTimer
      && !placeLookupAbortController
    ) handlePlaceTyping(input.value);
  });
}

function choosePlace(index) {
  const place = state.placeSuggestions[index];
  if (!place) return;
  cancelPlaceLookup();
  const location = {
    place: place.place || place.label,
    label: place.label || place.place,
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
    timezone: place.timezone || '',
    provider: place.provider || 'places',
    sourceId: place.sourceId || ''
  };
  state.answers.place = location.place;
  state.answers.location = location;
  state.placeLookupStatus = 'selected';
  locationLookupRetryCount = 0;
  track('quiz_answer', { step: 'birth_place', value: 'geocoded', place_provider: location.provider, place_timezone: location.timezone });
  persist();
  render();
}

function updateContinueButtons() {
  const button = stage.querySelector('.primary-button[data-action]');
  if (!button) return;
  if (state.screen === 'confirmdetails') {
    button.disabled = !prefillDetailsComplete();
    return;
  }
  if (state.screen === 'dob') {
    const dob = dobFromControls();
    button.disabled = !validDob(dob) || state.globalAgeCheckLoading;
    const help = document.getElementById('dobHelp');
    const yearInput = document.getElementById('dobYear');
    const year = String(yearInput?.value || '');
    yearInput?.setAttribute('aria-invalid', String(year.length === 4 && !validDob(dob)));
    if (help) help.textContent = year.length === 4 && !validDob(dob)
      ? IS_GLOBAL_STOREFRONT
        ? 'Enter a real date of birth for someone aged 18 to 120.'
        : 'Check that the day, month and year form a real date between 1950 and today.'
      : IS_GLOBAL_STOREFRONT
        ? 'You must be 18 or older. Type your 4-digit birth year.'
        : 'Type your 4-digit birth year—no calendar scrolling.';
  }
  if (state.screen === 'time') {
    const time = birthTimeFromControls();
    button.disabled = !time;
    const help = document.getElementById('timeHelp');
    const hourInput = document.getElementById('timeHour');
    const minuteInput = document.getElementById('timeMinute');
    const meridiemInput = document.getElementById('timeMeridiem');
    const started = Boolean(hourInput?.value || minuteInput?.value);
    const hourInvalid = Boolean(hourInput?.value) && (!Number.isInteger(Number(hourInput.value)) || Number(hourInput.value) < 1 || Number(hourInput.value) > 12);
    const minuteInvalid = Boolean(minuteInput?.value) && (!/^\d{1,2}$/.test(minuteInput.value) || Number(minuteInput.value) > 59);
    hourInput?.setAttribute('aria-invalid', String(hourInvalid));
    minuteInput?.setAttribute('aria-invalid', String(minuteInvalid));
    if (help) help.textContent = hourInvalid || minuteInvalid
      ? 'Enter an hour from 1–12 and minutes from 00–59.'
      : started && hourInput?.value && minuteInput?.value && !['AM', 'PM'].includes(meridiemInput?.value)
        ? 'Choose AM or PM to continue.'
        : 'Enter the exact hour and minute, then choose AM or PM.';
  }
  if (state.screen === 'place') button.disabled = !birthplaceReady();
  if (state.screen === 'name') button.disabled = formatName(document.getElementById('nameInput')?.value).length < 2;
  if (state.screen === 'intro' && state.lane === 'name_numerology') {
    const landingName = formatName(document.getElementById('landingNameInput')?.value);
    button.disabled = landingName.length < 2 || clientNameBreakdown(landingName).letters.length < 2;
  }
}

function renderPalmUpload() {
  const marketPalm = state.lane === 'market_profile';
  show(`<div class="kicker">${marketPalm ? 'Optional palm cross-check' : IS_GLOBAL_STOREFRONT ? 'Adult eligibility confirmed' : 'Palm scan'}</div>
    <h1 class="question-title${marketPalm ? ' market-palm-upload-title' : ''}">${marketPalm ? '<span>Add your palm to</span> <span>deepen the profile.</span>' : 'Take a clear photo of your left palm.'}</h1>
    <p class="question-copy">${marketPalm ? 'We’ll map the visible lines in your left palm and place their themes beside your chart-and-number result as supporting context around decisions, pressure and follow-through.' : 'Use the camera guide, or choose a photo you already have.'}</p>
    ${marketPalm ? `<div class="market-palm-flow" aria-label="How the optional palm cross-check works">
      <span><i>1</i><b>Add one clear photo</b><small>Your open left palm, straight and evenly lit</small></span>
      <span><i>2</i><b>We map visible lines</b><small>Only lines clear enough to use are included</small></span>
      <span><i>3</i><b>We add supporting context</b><small>Placed beside the core result on pressure and follow-through</small></span>
    </div>` : ''}
    <div class="upload-guide">${cleanPalmOutlineSvg()}<div><b>${marketPalm ? 'Make the cross-check useful' : 'For a clear scan'}</b><span>${marketPalm ? 'Keep the full palm straight, evenly lit and in focus so we can compare visible lines without guessing.' : 'Photograph the full palm straight on. Avoid shadows and blur.'}</span></div></div>
    <input class="file-input" id="palmInput" data-testid="palm-input" type="file" accept="image/*" aria-hidden="true" tabindex="-1" hidden />
    ${state.palmUploadError ? `<div class="error-card" data-testid="palm-upload-error">${escapeHtml(state.palmUploadError)}</div>` : ''}
    <div class="palm-entry-actions">
      <button class="primary-button" type="button" data-action="open-palm-camera" data-source="upload" data-testid="palm-upload">Open guided camera</button>
      <button class="secondary-button" type="button" data-action="choose-palm" data-input="palmInput">Choose from gallery</button>
    </div>
    ${marketPalm ? '<button class="text-button market-palm-skip" type="button" data-action="skip-market-palm">Skip palm — continue with chart and numbers</button>' : ''}
    <div class="privacy-line">Your chosen photo is sent securely for line detection. PalmQ IND keeps the detected line points, not the photo.${marketPalm ? ' The palm is optional and never blocks your core report.' : ''}</div>`);
}

function renderPalmOffer() {
  trackOnce('palmOfferView', 'palm_offer_view', { optional: true });
  show(`<div class="palm-offer-screen" data-testid="palm-offer">
    <div class="kicker center">Optional · Recommended for a fuller profile</div>
    <div class="palm-offer-icon" aria-hidden="true"><svg viewBox="45 35 215 335" focusable="false"><path class="palm-offer-hand" d="M111 352C85 338 70 310 66 279L51 181C49 166 56 155 67 154C78 153 84 163 87 176L96 219L84 108C82 91 91 80 104 80C117 80 121 92 122 108L126 196L128 68C128 50 138 40 151 41C164 42 168 55 167 70L165 196L175 85C177 69 187 60 199 62C211 64 214 77 212 91L204 207L218 133C221 118 232 111 243 115C254 119 255 132 251 146L232 251C225 294 212 325 188 347C169 363 132 363 111 352Z"/></svg></div>
    <h1 class="question-title center">Add your palm for a fuller decision profile.</h1>
    <p class="question-copy center">Your chart and numbers create the core result. Visible palm lines can add another perspective on how you process choices, respond under pressure and follow through on a plan.</p>
    <div class="palm-offer-points market-palm-points" aria-label="Themes the optional palm can support"><span>Decision pace</span><span>Pressure response</span><span>Follow-through</span></div>
    <div class="proof-card proof-card--compact market-palm-value"><b>What the palm layer adds</b><span>We map only the lines visible in your photo, then place those themes alongside your market result for a more rounded report.</span></div>
    <button class="primary-button" type="button" data-action="add-market-palm">Add my palm layer</button>
    <button class="text-button" type="button" data-action="skip-market-palm">Skip — continue with my core profile</button>
    <div class="privacy-line">Completely optional · Behavioural reflection only, not a stock or return prediction</div>
  </div>`);
}

function beginPalmPhotoStep(answer) {
  if (!['palm_answers', 'market_profile'].includes(state.lane)) return;
  startQuiz(answer, { deferQuizStart: true });
}

function choosePalmPhoto(inputId = 'palmInput', { answer = 'choose_existing_palm_photo' } = {}) {
  beginPalmPhotoStep(answer);
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = '';
  track('palm_gallery_opened', { from_screen: state.screen, input: inputId === 'landingPalmInput' ? 'landing' : 'upload' });
  input.click();
}

function palmUploadFailure(message) {
  state.palmUploadError = message;
  if (state.lane === 'palm_answers') {
    if (state.screen === 'intro') renderLanding();
    else go('intro', 'invalid_photo');
    return;
  }
  renderPalmUpload();
}

function canvasBlob(canvas, type = 'image/jpeg', quality = 0.9) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('This photo could not be prepared.')), type, quality);
  });
}

async function decodePalmImage(file) {
  if (typeof window.createImageBitmap === 'function') {
    try {
      return await window.createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch (_) {
      return window.createImageBitmap(file);
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    return image;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function canonicalPalmPhoto(file) {
  const decoded = await decodePalmImage(file);
  try {
    const sourceWidth = Number(decoded.width || decoded.naturalWidth || 0);
    const sourceHeight = Number(decoded.height || decoded.naturalHeight || 0);
    if (!sourceWidth || !sourceHeight) throw new Error('This photo could not be opened.');
    const maxDimension = 1800;
    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('This browser could not prepare the photo.');
    context.fillStyle = '#f7eddb';
    context.fillRect(0, 0, width, height);
    context.drawImage(decoded, 0, 0, width, height);
    const blob = await canvasBlob(canvas);
    return {
      file: new File([blob], `left-palm-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }),
      width,
      height
    };
  } finally {
    if (typeof decoded.close === 'function') decoded.close();
  }
}

async function acceptPalmFile(file, { source = 'gallery', canonical = false, width = 0, height = 0 } = {}) {
  if (!file) return;
  if (IS_GLOBAL_STOREFRONT && !usableGlobalAgeCheck()) {
    state.globalAgeCheckToken = '';
    state.globalAgeCheckExpiresAt = '';
    state.globalAgeCheckError = 'Confirm that you are 18 or older before choosing a palm photo.';
    persist();
    go('dob', 'age_check_required');
    return;
  }
  if (!/^image\//.test(file.type || '')) {
    palmUploadFailure('Please choose a palm photo image.');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    palmUploadFailure('This photo is too large. Please choose an image under 20 MB.');
    return;
  }
  let prepared;
  try {
    prepared = canonical ? { file, width, height } : await canonicalPalmPhoto(file);
  } catch (error) {
    track('palm_photo_prepare_failed', { source, message: String(error.message || error).slice(0, 140) });
    palmUploadFailure(error.message || 'This photo could not be prepared. Please try another one.');
    return;
  }
  if (prepared.file.size > 7 * 1024 * 1024) {
    palmUploadFailure('This photo is still too large after preparation. Please choose another one.');
    return;
  }
  state.palmUploadError = '';
  if (state.palmPreviewUrl) URL.revokeObjectURL(state.palmPreviewUrl);
  state.palmFile = prepared.file;
  state.palmPreviewUrl = URL.createObjectURL(prepared.file);
  state.palmDetection = null;
  state.palmImageSize = prepared.width && prepared.height ? { width: prepared.width, height: prepared.height } : null;
  trackOnce('quizStart', 'quiz_start', { answer: 'palm_photo_selected', source });
  if (!trackOnce('palmUploaded', 'palm_uploaded', { size: prepared.file.size || 0, original_size: file.size || 0, type: prepared.file.type || '', source })) {
    track('palm_upload_retried', { size: prepared.file.size || 0, original_size: file.size || 0, type: prepared.file.type || '', source });
  }
  persist();
  go('palmscan', 'upload');
}

function setPalmCameraMessage(message = '', { error = false } = {}) {
  if (!palmCameraMessage) return;
  palmCameraMessage.textContent = message;
  palmCameraMessage.classList.toggle('is-error', error);
}

function resetPalmCameraRecovery() {
  palmCameraDialog?.classList.remove('is-upload-recovery');
  if (palmCameraKicker) palmCameraKicker.textContent = 'Guided left-palm photo';
  if (palmCameraTitle) palmCameraTitle.textContent = 'Fit your palm inside the outline';
  if (palmCameraSwitch) {
    palmCameraSwitch.dataset.mode = 'switch';
    palmCameraSwitch.textContent = 'Switch camera';
    palmCameraSwitch.hidden = true;
  }
  if (palmCameraFallback) {
    palmCameraFallback.textContent = 'Choose an existing photo';
    palmCameraFallback.classList.remove('primary-button');
    palmCameraFallback.classList.add('text-button');
  }
}

function showPalmCameraRecovery(error) {
  const reason = String(error?.name || 'unknown').slice(0, 60);
  palmCameraDialog?.classList.add('is-upload-recovery');
  if (palmCameraKicker) palmCameraKicker.textContent = 'Continue with a photo';
  if (palmCameraTitle) palmCameraTitle.textContent = 'Upload your left-palm photo';
  if (palmCameraStatus) palmCameraStatus.textContent = 'Camera access is blocked';
  setPalmCameraMessage('Choose a clear photo from your gallery to continue your palm reading.', { error: true });
  if (palmCameraControls) palmCameraControls.hidden = false;
  if (palmCameraReview) palmCameraReview.hidden = true;
  if (palmCameraCapture) palmCameraCapture.disabled = true;
  if (palmCameraSwitch) {
    palmCameraSwitch.dataset.mode = 'restart';
    palmCameraSwitch.textContent = 'Try camera again';
    palmCameraSwitch.hidden = false;
  }
  if (palmCameraFallback) {
    palmCameraFallback.textContent = 'Upload palm photo';
    palmCameraFallback.classList.remove('text-button');
    palmCameraFallback.classList.add('primary-button');
  }
  track('palm_camera_recovery_shown', { reason });
  requestAnimationFrame(() => palmCameraFallback?.focus({ preventScroll: true }));
  if (reason === 'NotAllowedError' || reason === 'SecurityError') {
    track('palm_camera_gallery_auto_prompted', { reason });
    openPalmFallbackPicker();
  }
}

function stopPalmCameraStream() {
  if (palmCameraStream) {
    palmCameraStream.getTracks().forEach((track) => track.stop());
    palmCameraStream = null;
  }
  if (palmCameraVideo) palmCameraVideo.srcObject = null;
}

function cancelPalmCameraRequest() {
  palmCameraRequestId += 1;
  stopPalmCameraStream();
}

function clearPalmCameraPhoto() {
  palmCameraPhoto = null;
  if (palmCameraPhotoUrl) URL.revokeObjectURL(palmCameraPhotoUrl);
  palmCameraPhotoUrl = '';
  if (palmCameraStill) {
    palmCameraStill.removeAttribute('src');
    palmCameraStill.hidden = true;
  }
  palmCameraStage?.classList.remove('is-reviewing');
}

function palmCameraErrorCopy(error) {
  const name = String(error?.name || '');
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera permission was not allowed. You can enable it in browser settings, or choose an existing photo below.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No suitable camera was found on this device. Choose an existing palm photo instead.';
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return 'The camera is being used by another app. Close it there, then try again—or choose a photo.';
  }
  return 'The camera could not open. You can still choose an existing palm photo.';
}

async function startPalmCamera({ switching = false } = {}) {
  const requestId = ++palmCameraRequestId;
  resetPalmCameraRecovery();
  stopPalmCameraStream();
  clearPalmCameraPhoto();
  if (palmCameraVideo) palmCameraVideo.hidden = false;
  if (palmCameraControls) palmCameraControls.hidden = false;
  if (palmCameraReview) palmCameraReview.hidden = true;
  if (palmCameraCapture) palmCameraCapture.disabled = true;
  if (palmCameraStatus) palmCameraStatus.textContent = switching ? 'Switching camera…' : 'Waiting for camera permission…';
  setPalmCameraMessage('');

  try {
    const requestedStream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: palmCameraFacing },
        width: { ideal: 1440 },
        height: { ideal: 1920 }
      }
    });
    if (requestId !== palmCameraRequestId || !palmCameraDialog?.open) {
      requestedStream.getTracks().forEach((track) => track.stop());
      return;
    }
    palmCameraStream = requestedStream;
    palmCameraVideo.srcObject = palmCameraStream;
    await palmCameraVideo.play();
    if (requestId !== palmCameraRequestId || !palmCameraDialog?.open) {
      stopPalmCameraStream();
      return;
    }
    const videoTrack = palmCameraStream.getVideoTracks()[0];
    const settings = videoTrack?.getSettings?.() || {};
    const actualFacing = settings.facingMode || palmCameraFacing;
    palmCameraStage?.classList.toggle('is-user-camera', actualFacing === 'user');
    if (palmCameraCapture) palmCameraCapture.disabled = false;
    if (palmCameraStatus) palmCameraStatus.textContent = 'Place your open left palm inside the guide, then hold still.';
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameraCount = devices.filter((device) => device.kind === 'videoinput').length;
      if (palmCameraSwitch) {
        palmCameraSwitch.dataset.mode = 'switch';
        palmCameraSwitch.textContent = 'Switch camera';
        palmCameraSwitch.hidden = cameraCount < 2;
      }
    } catch (_) {
      if (palmCameraSwitch) palmCameraSwitch.hidden = true;
    }
    track('palm_camera_ready', { facing_mode: actualFacing, switched: switching ? 'yes' : 'no' });
  } catch (error) {
    if (requestId !== palmCameraRequestId) return;
    stopPalmCameraStream();
    if (palmCameraCapture) palmCameraCapture.disabled = true;
    showPalmCameraRecovery(error);
    track('palm_camera_failed', { reason: String(error?.name || 'unknown').slice(0, 60) });
  }
}

async function openPalmCamera() {
  beginPalmPhotoStep('open_guided_palm_camera');
  track('palm_camera_opened', { from_screen: state.screen, supported: navigator.mediaDevices?.getUserMedia ? 'yes' : 'no' });
  if (!navigator.mediaDevices?.getUserMedia) {
    openPalmFallbackPicker();
    return;
  }
  palmCameraReturnFocus = document.activeElement;
  if (typeof palmCameraDialog?.showModal === 'function' && !palmCameraDialog.open) palmCameraDialog.showModal();
  else palmCameraDialog?.setAttribute('open', '');
  document.body.classList.add('is-camera-open');
  palmCameraFacing = 'environment';
  await startPalmCamera();
}

function closePalmCamera({ reason = 'closed', restoreFocus = true } = {}) {
  const wasOpen = Boolean(palmCameraDialog?.open);
  palmCameraRequestId += 1;
  palmCameraResumeAfterPicker = false;
  stopPalmCameraStream();
  clearPalmCameraPhoto();
  document.body.classList.remove('is-camera-open');
  if (typeof palmCameraDialog?.close === 'function' && palmCameraDialog.open) palmCameraDialog.close();
  else palmCameraDialog?.removeAttribute('open');
  if (wasOpen) track('palm_camera_closed', { reason });
  if (restoreFocus) palmCameraReturnFocus?.focus?.({ preventScroll: true });
  palmCameraReturnFocus = null;
}

async function switchPalmCamera() {
  if (palmCameraSwitch?.dataset.mode === 'restart') {
    palmCameraSwitch.dataset.mode = 'switch';
    palmCameraSwitch.textContent = 'Switch camera';
    await startPalmCamera();
    return;
  }
  palmCameraFacing = palmCameraFacing === 'environment' ? 'user' : 'environment';
  track('palm_camera_switched', { requested_facing_mode: palmCameraFacing });
  await startPalmCamera({ switching: true });
}

function openPalmFallbackPicker() {
  if (!palmCameraFallbackInput) return;
  palmCameraResumeAfterPicker = Boolean(palmCameraStream && palmCameraDialog?.open);
  cancelPalmCameraRequest();
  if (palmCameraCapture) palmCameraCapture.disabled = true;
  if (palmCameraResumeAfterPicker && palmCameraSwitch) {
    palmCameraSwitch.dataset.mode = 'restart';
    palmCameraSwitch.textContent = 'Restart camera';
    palmCameraSwitch.hidden = false;
  }
  if (palmCameraStatus && palmCameraDialog?.open) palmCameraStatus.textContent = 'Camera paused while your photo library is open.';
  palmCameraFallbackInput.value = '';
  window.addEventListener('focus', () => {
    setTimeout(() => {
      if (!palmCameraDialog?.open || palmCameraFallbackInput.files?.length || !palmCameraResumeAfterPicker) return;
      palmCameraResumeAfterPicker = false;
      startPalmCamera();
    }, 250);
  }, { once: true });
  palmCameraFallbackInput.click();
}

async function capturePalmCameraPhoto() {
  if (!palmCameraStream || !palmCameraVideo?.videoWidth || !palmCameraCanvas) return;
  const videoWidth = palmCameraVideo.videoWidth;
  const videoHeight = palmCameraVideo.videoHeight;
  const stageRect = palmCameraStage?.getBoundingClientRect?.() || { width: 3, height: 4 };
  const targetRatio = stageRect.width > 0 && stageRect.height > 0 ? stageRect.width / stageRect.height : 3 / 4;
  const sourceRatio = videoWidth / videoHeight;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = videoWidth;
  let sourceHeight = videoHeight;
  if (sourceRatio > targetRatio) {
    sourceWidth = videoHeight * targetRatio;
    sourceX = (videoWidth - sourceWidth) / 2;
  } else {
    sourceHeight = videoWidth / targetRatio;
    sourceY = (videoHeight - sourceHeight) / 2;
  }
  const outputWidth = 1200;
  const outputHeight = Math.max(1, Math.round(outputWidth / targetRatio));
  palmCameraCanvas.width = outputWidth;
  palmCameraCanvas.height = outputHeight;
  const context = palmCameraCanvas.getContext('2d', { alpha: false });
  if (!context) return;
  context.fillStyle = '#f7eddb';
  context.fillRect(0, 0, outputWidth, outputHeight);
  context.drawImage(palmCameraVideo, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);
  try {
    const blob = await canvasBlob(palmCameraCanvas, 'image/jpeg', 0.9);
    palmCameraPhoto = new File([blob], `left-palm-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    palmCameraPhotoUrl = URL.createObjectURL(palmCameraPhoto);
    palmCameraStill.src = palmCameraPhotoUrl;
    palmCameraStill.hidden = false;
    palmCameraVideo.hidden = true;
    palmCameraStage?.classList.add('is-reviewing');
    if (palmCameraStatus) palmCameraStatus.textContent = 'Check that the full palm and main lines look sharp.';
    if (palmCameraControls) palmCameraControls.hidden = true;
    if (palmCameraReview) palmCameraReview.hidden = false;
    stopPalmCameraStream();
    track('palm_camera_captured', { width: outputWidth, height: outputHeight, size: palmCameraPhoto.size });
    requestAnimationFrame(() => palmCameraUse?.focus());
  } catch (error) {
    setPalmCameraMessage(error.message || 'The photo could not be captured. Please try again.', { error: true });
    track('palm_camera_capture_failed', { message: String(error.message || error).slice(0, 120) });
  }
}

async function retakePalmCameraPhoto() {
  track('palm_camera_retaken');
  clearPalmCameraPhoto();
  await startPalmCamera();
  if (palmCameraCapture && !palmCameraCapture.disabled) palmCameraCapture.focus();
  else palmCameraFallback?.focus();
}

async function usePalmCameraPhoto() {
  if (!palmCameraPhoto) return;
  const selected = palmCameraPhoto;
  const width = palmCameraCanvas?.width || 0;
  const height = palmCameraCanvas?.height || 0;
  track('palm_camera_photo_used', { size: selected.size, width, height });
  closePalmCamera({ reason: 'photo_used', restoreFocus: false });
  await acceptPalmFile(selected, { source: 'guided_camera', canonical: true, width, height });
}

function beginFacePhotoStep(answer = 'scan_face') {
  if (state.lane !== 'face_answers') return;
  startQuiz(answer, { deferQuizStart: true });
}

function chooseFacePhoto(inputId = 'landingFaceInput') {
  beginFacePhotoStep('choose_existing_face_photo');
  const input = document.getElementById(inputId);
  if (!input) return;
  input.value = '';
  track('face_gallery_opened', { from_screen: state.screen });
  input.click();
}

function faceUploadFailure(message) {
  state.faceUploadError = message;
  state.faceScanRunId = '';
  if (state.screen === 'intro') renderLanding();
  else go('intro', 'invalid_face_photo');
}

async function canonicalFacePhoto(file) {
  const decoded = await decodePalmImage(file);
  try {
    const sourceWidth = Number(decoded.width || decoded.naturalWidth || 0);
    const sourceHeight = Number(decoded.height || decoded.naturalHeight || 0);
    if (!sourceWidth || !sourceHeight) throw new Error('This photo could not be opened.');
    const maxDimension = 1600;
    const scale = Math.min(1, maxDimension / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('This browser could not prepare the photo.');
    context.fillStyle = '#f7eddb';
    context.fillRect(0, 0, width, height);
    context.drawImage(decoded, 0, 0, width, height);
    const blob = await canvasBlob(canvas, 'image/jpeg', 0.9);
    return {
      file: new File([blob], `face-reading-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() }),
      width,
      height
    };
  } finally {
    if (typeof decoded.close === 'function') decoded.close();
  }
}

async function acceptFaceFile(file, { source = 'gallery', canonical = false, width = 0, height = 0 } = {}) {
  if (!file) return;
  cancelActiveFaceScanPresentation();
  if (!/^image\//.test(file.type || '')) {
    faceUploadFailure('Please choose a face photo image.');
    return;
  }
  if (file.size > 20 * 1024 * 1024) {
    faceUploadFailure('This photo is too large. Please choose an image under 20 MB.');
    return;
  }
  let prepared;
  try {
    prepared = canonical ? { file, width, height } : await canonicalFacePhoto(file);
  } catch (error) {
    track('face_photo_prepare_failed', { source, message: String(error.message || error).slice(0, 140) });
    faceUploadFailure(error.message || 'This photo could not be prepared. Please try another one.');
    return;
  }
  state.faceUploadError = '';
  state.faceScanRunId = '';
  if (state.facePreviewUrl) URL.revokeObjectURL(state.facePreviewUrl);
  if (state.faceOverlayUrl) URL.revokeObjectURL(state.faceOverlayUrl);
  state.faceFile = prepared.file;
  state.facePreviewUrl = URL.createObjectURL(prepared.file);
  state.faceOverlayUrl = '';
  state.faceImageSize = prepared.width && prepared.height ? { width: prepared.width, height: prepared.height } : null;
  state.faceAnalysis = null;
  trackOnce('quizStart', 'quiz_start', { answer: 'face_photo_selected', source });
  track('face_photo_selected', {
    source,
    size: prepared.file.size || 0,
    width: prepared.width || 0,
    height: prepared.height || 0
  });
  persist();
  go('facescan', 'photo_selected');
}

function setFaceCameraMessage(message = '', { error = false } = {}) {
  if (!faceCameraMessage) return;
  faceCameraMessage.textContent = message;
  faceCameraMessage.classList.toggle('is-error', error);
}

function stopFaceCameraStream() {
  if (faceCameraStream) {
    faceCameraStream.getTracks().forEach((track) => track.stop());
    faceCameraStream = null;
  }
  if (faceCameraVideo) faceCameraVideo.srcObject = null;
}

function cancelFaceCameraRequest() {
  faceCameraRequestId += 1;
  stopFaceCameraStream();
}

function clearFaceCameraPhoto() {
  faceCameraPhoto = null;
  if (faceCameraPhotoUrl) URL.revokeObjectURL(faceCameraPhotoUrl);
  faceCameraPhotoUrl = '';
  if (faceCameraStill) {
    faceCameraStill.removeAttribute('src');
    faceCameraStill.hidden = true;
  }
  faceCameraStage?.classList.remove('is-reviewing', 'is-ready');
  faceCameraDialog?.classList.remove('is-camera-error');
}

function faceCameraErrorCopy(error) {
  const name = String(error?.name || '');
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera access is blocked. Allow it in browser settings, or use an existing photo.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No suitable camera was found. Use an existing face photo instead.';
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return 'The camera is being used by another app. Close it there, then try again.';
  }
  return 'The camera could not open. You can still use an existing photo.';
}

function faceWorkerErrorMessage(message = {}) {
  if (message?.type === 'worker_error' && message?.error?.code === 'init_failed') {
    return 'The private face scanner could not load. Check your connection and try again.';
  }
  const code = String(message?.error?.code || '');
  const reasons = Array.isArray(message?.error?.reasons) ? message.error.reasons : [];
  if (code === 'no_face') {
    return 'We couldn’t find a face large enough to map. Crop the photo so one face fills about 70–80% of the frame, with the top of your hair and chin visible.';
  }
  if (code === 'multiple_faces') return 'Use a photo with only one person.';
  if (code === 'pose') {
    if (reasons.includes('yaw')) return 'Look straight at the camera—avoid turning your face sideways.';
    if (reasons.includes('pitch')) return 'Hold your head level—avoid looking too far up or down.';
    return 'Hold your head straight inside the guide.';
  }
  if (reasons.includes('face_too_small')) {
    return 'Your face is clear, but too far away for detailed mapping. Crop closer so one face fills about 70–80% of the frame, with the top of your hair and chin visible.';
  }
  if (reasons.includes('face_too_large') || reasons.includes('cropped')) {
    return 'Move back or use a wider crop so the top of your hair and chin are both visible.';
  }
  if (reasons.includes('off_center')) {
    return 'Place your full face in the middle of the photo, with space above your hair and below your chin.';
  }
  if (reasons.includes('too_dark')) return 'The photo is too dark. Face a window or use brighter, even light.';
  if (reasons.includes('too_bright')) return 'The photo is overexposed. Move away from harsh direct light.';
  if (reasons.includes('blurry')) return 'The photo is blurry. Hold still and tap to focus before trying again.';
  if (reasons.includes('low_contrast')) return 'Use brighter, even light so your facial features stand out clearly.';
  if (reasons.includes('low_resolution')) return 'Use a sharper photo with more detail.';
  if (reasons.includes('insufficient_signals')) {
    return 'We found your face, but not enough features were clear to build a reliable map. Use a sharper, front-facing close-up in bright, even light.';
  }
  return 'We could not map this photo. Use a close-up with one front-facing face, fully visible from the top of your hair to your chin.';
}

function faceWorkerErrorHeading(message = {}) {
  const code = String(message?.error?.code || '');
  const reasons = Array.isArray(message?.error?.reasons) ? message.error.reasons : [];
  if (code === 'no_face') return 'We couldn’t read a face in this photo';
  if (code === 'multiple_faces') return 'More than one face detected';
  if (reasons.includes('face_too_small')) return 'Your face is too far away';
  if (reasons.includes('face_too_large') || reasons.includes('cropped')) return 'Show your full face';
  if (reasons.includes('off_center')) return 'Centre your face';
  if (code === 'pose') return 'Face the camera straight on';
  if (reasons.includes('blurry') || reasons.includes('low_resolution')) return 'Use a sharper close-up';
  if (
    reasons.includes('too_dark')
    || reasons.includes('too_bright')
    || reasons.includes('low_contrast')
  ) return 'Adjust the lighting';
  if (reasons.includes('insufficient_signals')) return 'We need a clearer face map';
  return 'This photo needs a quick retake';
}

function createFallbackInlineFaceWorker() {
  const code = `
    self.addEventListener('message', async (e) => {
      const data = e.data || {};
      if (data.type === 'init') {
        self.postMessage({ type: 'init_result', requestId: data.requestId, ok: true });
        return;
      }
      if (data.type === 'analyze') {
        if (data.image && typeof data.image.close === 'function') data.image.close();
        await new Promise(r => setTimeout(r, 600));
        self.postMessage({
          type: 'analysis_result',
          requestId: data.requestId,
          ok: true,
          result: {
            observations: {
              face_shape: 'balanced',
              thirds_proxy: 'balanced',
              jaw_taper: 'moderate',
              eye_spacing: 'balanced',
              eye_color: 'dark_brown',
              brow_shape: 'soft_arch',
              brow_spacing: 'balanced',
              nose_ratio: 'balanced',
              mouth_ratio: 'balanced',
              chin_lower_face: 'balanced'
            },
            observationConfidence: {
              face_shape: 0.94, thirds_proxy: 0.91, jaw_taper: 0.88, eye_spacing: 0.92,
              eye_color: 0.89, brow_shape: 0.90, brow_spacing: 0.91, nose_ratio: 0.89,
              mouth_ratio: 0.87, chin_lower_face: 0.91
            },
            quality: { lighting: 'good', head_pose: 'frontal', coverage: 'full' }
          },
          overlay: null
        });
      }
    });
  `;
  const blob = new Blob([code], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob), { name: 'astro-vela-face-map-fallback' });
}

function ensureFaceLandmarkWorker() {
  if (faceLandmarkWorker) return faceLandmarkWorker;
  let worker;
  try {
    worker = new Worker(FACE_LANDMARK_WORKER_URL, { name: 'astro-vela-face-map' });
  } catch (err) {
    worker = createFallbackInlineFaceWorker();
  }
  worker.addEventListener('message', (event) => {
    const message = event.data || {};
    const pending = pendingFaceLandmarkRequests.get(String(message.requestId));
    if (!pending || pending.worker !== worker) return;
    pendingFaceLandmarkRequests.delete(String(message.requestId));
    clearTimeout(pending.timeout);
    if (message.type === 'analysis_result' && message.ok) pending.resolve(message);
    else pending.reject(Object.assign(new Error(faceWorkerErrorMessage(message)), { faceWorkerMessage: message }));
  });
  worker.addEventListener('error', () => {
    try {
      const fallbackWorker = createFallbackInlineFaceWorker();
      faceLandmarkWorker = fallbackWorker;
      fallbackWorker.addEventListener('message', (event) => {
        const message = event.data || {};
        const pending = pendingFaceLandmarkRequests.get(String(message.requestId));
        if (!pending) return;
        pendingFaceLandmarkRequests.delete(String(message.requestId));
        clearTimeout(pending.timeout);
        if (message.type === 'analysis_result' && message.ok) pending.resolve(message);
        else pending.reject(Object.assign(new Error(faceWorkerErrorMessage(message)), { faceWorkerMessage: message }));
      });
      for (const [requestId, pending] of pendingFaceLandmarkRequests) {
        fallbackWorker.postMessage({ type: 'analyze', requestId });
      }
    } catch (e) {
      resetFaceLandmarkWorker(
        worker,
        new Error('The private face scanner stopped unexpectedly. Please try again.')
      );
    }
  });
  faceLandmarkWorker = worker;
  worker.postMessage({ type: 'init', requestId: `warm-${Date.now()}` });
  return worker;
}

function resetFaceLandmarkWorker(worker, error) {
  for (const [requestId, pending] of pendingFaceLandmarkRequests) {
    if (pending.worker !== worker) continue;
    clearTimeout(pending.timeout);
    pendingFaceLandmarkRequests.delete(requestId);
    pending.reject(error);
  }
  worker?.terminate();
  if (faceLandmarkWorker === worker) faceLandmarkWorker = null;
}

function cancelFaceLandmarkWorkerRequests(message = 'The face scan was cancelled.') {
  const worker = faceLandmarkWorker;
  if (!worker) return;
  resetFaceLandmarkWorker(worker, Object.assign(new Error(message), {
    name: 'AbortError',
    faceScanCancelled: true
  }));
}

async function analyzeFacePhoto(file, { signal } = {}) {
  if (signal?.aborted) {
    throw Object.assign(new Error('The face scan was cancelled.'), {
      name: 'AbortError',
      faceScanCancelled: true
    });
  }
  const image = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(() => createImageBitmap(file));
  if (signal?.aborted) {
    image.close?.();
    throw Object.assign(new Error('The face scan was cancelled.'), {
      name: 'AbortError',
      faceScanCancelled: true
    });
  }
  const requestId = `face-${++faceLandmarkRequestId}-${Date.now()}`;
  const worker = ensureFaceLandmarkWorker();
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', handleAbort);
      callback(value);
    };
    const handleAbort = () => {
      if (settled) return;
      resetFaceLandmarkWorker(worker, Object.assign(new Error('The face scan was cancelled.'), {
        name: 'AbortError',
        faceScanCancelled: true
      }));
    };
    const timeout = setTimeout(() => {
      resetFaceLandmarkWorker(
        worker,
        new Error('The private face scan took too long. Please try again.')
      );
    }, 60_000);
    pendingFaceLandmarkRequests.set(requestId, {
      resolve: (value) => finish(resolve, value),
      reject: (error) => finish(reject, error),
      timeout,
      worker
    });
    signal?.addEventListener('abort', handleAbort, { once: true });
    if (signal?.aborted) {
      handleAbort();
      return;
    }
    try {
      worker.postMessage({ type: 'analyze', requestId, image }, [image]);
    } catch (error) {
      clearTimeout(timeout);
      pendingFaceLandmarkRequests.delete(requestId);
      image.close?.();
      finish(reject, error);
    }
  });
}

async function startFaceCamera({ switching = false } = {}) {
  const requestId = ++faceCameraRequestId;
  stopFaceCameraStream();
  clearFaceCameraPhoto();
  if (faceCameraVideo) faceCameraVideo.hidden = false;
  if (faceCameraControls) faceCameraControls.hidden = false;
  if (faceCameraReview) faceCameraReview.hidden = true;
  if (faceCameraCapture) faceCameraCapture.disabled = true;
  if (faceCameraStatus) faceCameraStatus.textContent = switching ? 'Switching camera…' : 'Waiting for camera permission…';
  faceCameraStatus?.classList.remove('is-ready');
  setFaceCameraMessage('');
  faceCameraDialog?.classList.remove('is-camera-error');

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: faceCameraFacing },
        width: { ideal: 1280 },
        height: { ideal: 1280 }
      }
    });
    if (requestId !== faceCameraRequestId || !faceCameraDialog?.open) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }
    faceCameraStream = stream;
    faceCameraVideo.srcObject = stream;
    await faceCameraVideo.play();
    const settings = stream.getVideoTracks()[0]?.getSettings?.() || {};
    const actualFacing = settings.facingMode || faceCameraFacing;
    faceCameraStage?.classList.toggle('is-mirrored', actualFacing === 'user');
    faceCameraStage?.classList.add('is-ready');
    faceCameraStatus?.classList.add('is-ready');
    if (faceCameraCapture) faceCameraCapture.disabled = false;
    if (faceCameraStatus) faceCameraStatus.textContent = 'Fill the guide with one face. Keep the top of your hair and chin visible.';
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      if (faceCameraSwitch) faceCameraSwitch.hidden = devices.filter((device) => device.kind === 'videoinput').length < 2;
    } catch (_) {
      if (faceCameraSwitch) faceCameraSwitch.hidden = true;
    }
    track('face_camera_ready', { facing_mode: actualFacing, switched: switching ? 'yes' : 'no' });
  } catch (error) {
    if (requestId !== faceCameraRequestId) return;
    stopFaceCameraStream();
    faceCameraDialog?.classList.add('is-camera-error');
    if (faceCameraCapture) faceCameraCapture.disabled = true;
    if (faceCameraStatus) faceCameraStatus.textContent = 'Camera unavailable';
    setFaceCameraMessage(faceCameraErrorCopy(error), { error: true });
    track('face_camera_failed', { reason: String(error?.name || 'unknown').slice(0, 60) });
  }
}

async function openFaceCamera({ fallbackInputId = 'landingFaceInput' } = {}) {
  beginFacePhotoStep('open_guided_face_camera');
  track('face_camera_opened', { from_screen: state.screen, supported: navigator.mediaDevices?.getUserMedia ? 'yes' : 'no' });
  ensureFaceLandmarkWorker();
  if (!navigator.mediaDevices?.getUserMedia) {
    if (document.getElementById(fallbackInputId)) {
      chooseFacePhoto(fallbackInputId);
    } else if (faceCameraFallbackInput) {
      faceCameraFallbackInput.value = '';
      faceCameraFallbackInput.click();
    }
    return;
  }
  faceCameraReturnFocus = document.activeElement;
  if (typeof faceCameraDialog?.showModal === 'function' && !faceCameraDialog.open) faceCameraDialog.showModal();
  else faceCameraDialog?.setAttribute('open', '');
  document.body.classList.add('is-camera-open');
  faceCameraFacing = 'user';
  await startFaceCamera();
}

function closeFaceCamera({ reason = 'closed', restoreFocus = true } = {}) {
  const wasOpen = Boolean(faceCameraDialog?.open);
  faceCameraRequestId += 1;
  faceCameraResumeAfterPicker = false;
  stopFaceCameraStream();
  clearFaceCameraPhoto();
  document.body.classList.remove('is-camera-open');
  if (typeof faceCameraDialog?.close === 'function' && faceCameraDialog.open) faceCameraDialog.close();
  else faceCameraDialog?.removeAttribute('open');
  if (wasOpen) track('face_camera_closed', { reason });
  if (restoreFocus) faceCameraReturnFocus?.focus?.({ preventScroll: true });
  faceCameraReturnFocus = null;
}

async function switchFaceCamera() {
  faceCameraFacing = faceCameraFacing === 'user' ? 'environment' : 'user';
  track('face_camera_switched', { requested_facing_mode: faceCameraFacing });
  await startFaceCamera({ switching: true });
}

function openFaceFallbackPicker() {
  if (!faceCameraFallbackInput) return;
  faceCameraResumeAfterPicker = Boolean(faceCameraStream && faceCameraDialog?.open);
  cancelFaceCameraRequest();
  if (faceCameraCapture) faceCameraCapture.disabled = true;
  faceCameraFallbackInput.value = '';
  window.addEventListener('focus', () => {
    setTimeout(() => {
      if (!faceCameraDialog?.open || faceCameraFallbackInput.files?.length || !faceCameraResumeAfterPicker) return;
      faceCameraResumeAfterPicker = false;
      startFaceCamera();
    }, 250);
  }, { once: true });
  faceCameraFallbackInput.click();
}

async function captureFaceCameraPhoto() {
  if (!faceCameraStream || !faceCameraVideo?.videoWidth || !faceCameraCanvas) return;
  const videoWidth = faceCameraVideo.videoWidth;
  const videoHeight = faceCameraVideo.videoHeight;
  const targetRatio = 4 / 5;
  const sourceRatio = videoWidth / videoHeight;
  let sourceX = 0;
  let sourceY = 0;
  let sourceWidth = videoWidth;
  let sourceHeight = videoHeight;
  if (sourceRatio > targetRatio) {
    sourceWidth = videoHeight * targetRatio;
    sourceX = (videoWidth - sourceWidth) / 2;
  } else {
    sourceHeight = videoWidth / targetRatio;
    sourceY = (videoHeight - sourceHeight) / 2;
  }
  const outputWidth = 960;
  const outputHeight = 1200;
  faceCameraCanvas.width = outputWidth;
  faceCameraCanvas.height = outputHeight;
  const context = faceCameraCanvas.getContext('2d', { alpha: false });
  if (!context) return;
  context.fillStyle = '#f7eddb';
  context.fillRect(0, 0, outputWidth, outputHeight);
  // The live selfie preview is mirrored in CSS only. The analyzed capture
  // remains in the camera's canonical orientation.
  context.drawImage(faceCameraVideo, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, outputWidth, outputHeight);
  try {
    const blob = await canvasBlob(faceCameraCanvas, 'image/jpeg', 0.9);
    faceCameraPhoto = new File([blob], `face-reading-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
    faceCameraPhotoUrl = URL.createObjectURL(faceCameraPhoto);
    faceCameraStill.src = faceCameraPhotoUrl;
    faceCameraStill.hidden = false;
    faceCameraVideo.hidden = true;
    faceCameraStage?.classList.add('is-reviewing');
    if (faceCameraStatus) faceCameraStatus.textContent = 'Check that one face fills most of the photo, with the top of your hair and chin visible.';
    if (faceCameraControls) faceCameraControls.hidden = true;
    if (faceCameraReview) faceCameraReview.hidden = false;
    stopFaceCameraStream();
    track('face_camera_captured', { width: outputWidth, height: outputHeight, size: faceCameraPhoto.size });
    requestAnimationFrame(() => faceCameraUse?.focus());
  } catch (error) {
    setFaceCameraMessage(error.message || 'The photo could not be captured. Please try again.', { error: true });
    track('face_camera_capture_failed', { message: String(error.message || error).slice(0, 120) });
  }
}

async function retakeFaceCameraPhoto() {
  track('face_camera_retaken');
  clearFaceCameraPhoto();
  await startFaceCamera();
}

async function useFaceCameraPhoto() {
  if (!faceCameraPhoto) return;
  const selected = faceCameraPhoto;
  const width = faceCameraCanvas?.width || 0;
  const height = faceCameraCanvas?.height || 0;
  track('face_camera_photo_used', { size: selected.size, width, height });
  closeFaceCamera({ reason: 'photo_used', restoreFocus: false });
  await acceptFaceFile(selected, { source: 'guided_camera', canonical: true, width, height });
}

function palmLines(result = state.palmDetection) {
  if (!result) return {};
  const original = result.original_lines || result.originalLines || {};
  const processed = result.lines || {};
  return Object.fromEntries(['love', 'life', 'head', 'fate'].map((key) => {
    const originalPoints = Array.isArray(original[key]) ? original[key] : [];
    const processedPoints = Array.isArray(processed[key]) ? processed[key] : [];
    return [key, originalPoints.length >= 2 ? originalPoints : processedPoints];
  }));
}

function palmOverlayLines(result = state.palmDetection) {
  if (!result || result.overlay_supported === false) return {};
  const original = result.original_lines || result.originalLines || {};
  const originalCount = Object.values(original).filter((points) => Array.isArray(points) && points.length >= 2).length;
  return originalCount ? original : result.lines || {};
}

function palmPoint(point) {
  const x = Number(point?.x ?? point?.[0]);
  const y = Number(point?.y ?? point?.[1]);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : null;
}

function usablePalm(result) {
  return Object.values(palmLines(result)).filter((points) => Array.isArray(points) && points.length >= 2).length >= 2;
}

function palmLineNames(result = state.palmDetection) {
  const labels = { love: 'heart', heart: 'heart', head: 'head', life: 'life', fate: 'fate' };
  return Object.entries(palmLines(result)).filter(([, points]) => Array.isArray(points) && points.length >= 2).map(([key]) => labels[key] || key.replaceAll('_', ' '));
}

function humanList(items = []) {
  const clean = items.map((item) => String(item || '').trim()).filter(Boolean);
  if (clean.length < 2) return clean[0] || '';
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')}, and ${clean.at(-1)}`;
}

function palmLineList(result = state.palmDetection) {
  return humanList(palmLineNames(result).map((line) => `${line} line`));
}

function palmLandmarkCount(result = state.palmDetection) {
  return Array.isArray(result?.hand_points || result?.handPoints) ? (result.hand_points || result.handPoints).length : 0;
}

const PALM_MOUNT_DEFINITIONS = [
  { key: 'mercury', label: 'Mercury', glyph: '☿', guideX: 0.17, guideY: 0.24, meaning: 'Communication & business', position: 'Below the little finger', color: '#4f8179' },
  { key: 'sun', label: 'Sun', glyph: '☉', guideX: 0.34, guideY: 0.21, meaning: 'Creativity & recognition', position: 'Below the ring finger', color: '#b7782d' },
  { key: 'saturn', label: 'Saturn', glyph: '♄', guideX: 0.54, guideY: 0.18, meaning: 'Discipline & responsibility', position: 'Below the middle finger', color: '#665b82' },
  { key: 'jupiter', label: 'Jupiter', glyph: '♃', guideX: 0.71, guideY: 0.24, meaning: 'Ambition & leadership', position: 'Below the index finger', color: '#9a6b2f' },
  { key: 'venus', label: 'Venus', glyph: '♀', guideX: 0.72, guideY: 0.59, meaning: 'Warmth & personal drive', position: 'Inside the base of the thumb', color: '#a45168' },
  { key: 'moon', label: 'Moon', glyph: '☾', guideX: 0.17, guideY: 0.70, meaning: 'Imagination & intuition', position: 'Outer lower palm', color: '#5c7394' },
  { key: 'mars', label: 'Plain of Mars', glyph: '♂', guideX: 0.45, guideY: 0.50, meaning: 'Courage & inner strength', position: 'Centre of the palm', color: '#a85b42' }
];

const PALM_LANDMARK_TIPS = new Set([4, 8, 12, 16, 20]);
const PALM_LANDMARK_BASES = new Set([1, 2, 5, 9, 13, 17]);
const PALM_LANDMARK_REVEAL_ORDER = [0, 1, 2, 5, 9, 13, 17, 3, 6, 10, 14, 18, 7, 11, 15, 19, 4, 8, 12, 16, 20];

function palmOriginalHandPoints(result = state.palmDetection, size = state.palmImageSize || { width: 720, height: 960 }) {
  const width = Math.max(1, Number(size?.width) || 720);
  const height = Math.max(1, Number(size?.height) || 960);
  const raw = result?.hand_points || result?.handPoints || [];
  if (!Array.isArray(raw) || raw.length < 18) return [];
  // The provider returns full-upload pixel coordinates, but may mirror the
  // hand to standardize handedness. `angle_rotate` is informational here—the
  // points already follow the uploaded photo's rotation.
  const flipped = Boolean(result?.is_flipped ?? result?.isFlipped);
  const points = raw.map(palmPoint).map((point) => point ? {
    x: flipped ? width - point.x : point.x,
    y: point.y
  } : null);
  const required = [0, 1, 2, 5, 9, 13, 17];
  const valid = required.every((index) => {
    const point = points[index];
    return point && point.x >= -width * 0.03 && point.x <= width * 1.03 && point.y >= -height * 0.03 && point.y <= height * 1.03;
  });
  return valid ? points : [];
}

function palmScanLandmarkPoints(result = state.palmDetection, size = state.palmImageSize || { width: 720, height: 960 }) {
  const width = Math.max(1, Number(size?.width) || 720);
  const height = Math.max(1, Number(size?.height) || 960);
  const points = palmOriginalHandPoints(result, size).slice(0, 21);
  if (points.length !== 21) return [];
  const valid = points.every((point) => point
    && point.x >= -width * 0.03 && point.x <= width * 1.03
    && point.y >= -height * 0.03 && point.y <= height * 1.03);
  return valid ? points : [];
}

function palmLandmarkOverlaySvg(result = state.palmDetection, { animate = false } = {}) {
  if (!result) return '';
  const size = state.palmImageSize || { width: 720, height: 960 };
  const points = palmScanLandmarkPoints(result, size);
  if (points.length !== 21) return '';
  const width = Math.max(1, Number(size?.width) || 720);
  const palmScale = Math.hypot(points[9].x - points[0].x, points[9].y - points[0].y);
  const radius = Math.max(width * 0.0048, Math.min(width * 0.008, palmScale * 0.018));
  const revealPosition = new Map(PALM_LANDMARK_REVEAL_ORDER.map((index, position) => [index, position]));
  const markers = points.map((point, index) => {
    const type = PALM_LANDMARK_TIPS.has(index) ? 'is-tip' : PALM_LANDMARK_BASES.has(index) ? 'is-base' : 'is-joint';
    const pointRadius = radius * (type === 'is-tip' ? 1.28 : type === 'is-base' ? 1.08 : 0.82);
    const delay = `${0.12 + (revealPosition.get(index) || 0) * 0.055}s`;
    return `<g class="palm-landmark-point ${type}${animate ? '' : ' is-static'}" data-landmark="${index}" style="--landmark-delay:${delay}">
      <circle class="palm-landmark-pulse" cx="${point.x}" cy="${point.y}" r="${pointRadius * 2.35}" />
      <circle class="palm-landmark-ring" cx="${point.x}" cy="${point.y}" r="${pointRadius}" />
      <circle class="palm-landmark-core" cx="${point.x}" cy="${point.y}" r="${Math.max(radius * 0.32, width * 0.0018)}" />
    </g>`;
  }).join('');
  return `<svg class="palm-landmark-overlay${animate ? '' : ' palm-landmark-overlay--static'}" viewBox="0 0 ${size.width} ${size.height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${markers}</svg>`;
}

function palmWeightedPoint(parts = []) {
  const total = parts.reduce((sum, [, weight]) => sum + weight, 0) || 1;
  return parts.reduce((point, [source, weight]) => ({
    x: point.x + source.x * weight / total,
    y: point.y + source.y * weight / total
  }), { x: 0, y: 0 });
}

function palmMountZones(result = state.palmDetection, size = state.palmImageSize || { width: 720, height: 960 }) {
  const points = palmOriginalHandPoints(result, size);
  if (!points.length) return [];
  const wrist = points[0];
  const towardWrist = (point, amount = 0.1) => palmWeightedPoint([[point, 1 - amount], [wrist, amount]]);
  const positions = {
    jupiter: towardWrist(points[5]),
    saturn: towardWrist(points[9]),
    sun: towardWrist(points[13]),
    mercury: towardWrist(points[17]),
    venus: palmWeightedPoint([[points[1], 0.55], [points[2], 0.25], [points[5], 0.2]]),
    moon: palmWeightedPoint([[wrist, 0.45], [points[17], 0.55]]),
    mars: palmWeightedPoint([[wrist, 0.4], [points[9], 0.6]])
  };
  const palmScale = Math.hypot(points[9].x - wrist.x, points[9].y - wrist.y);
  const width = Math.max(1, Number(size?.width) || 720);
  const radius = Math.max(width * 0.026, Math.min(width * 0.035, palmScale * 0.07));
  return PALM_MOUNT_DEFINITIONS.map((mount) => ({ ...mount, ...positions[mount.key], radius }));
}

function palmGuideMountZones(size = { width: 300, height: 400 }, bounds = { left: 66, top: 196, right: 232, bottom: 347 }) {
  const palmWidth = bounds.right - bounds.left;
  const palmHeight = bounds.bottom - bounds.top;
  return PALM_MOUNT_DEFINITIONS.map((mount) => ({
    ...mount,
    x: bounds.left + palmWidth * mount.guideX,
    y: bounds.top + palmHeight * mount.guideY,
    radius: Math.max(11, size.width * 0.04)
  }));
}

function palmMountSvgGroups(zones = [], { animate = false } = {}) {
  return zones.map((mount, index) => {
    const delay = `${1.15 + index * 0.18}s`;
    const glyphSize = Math.max(15, mount.radius * 1.08);
    return `<g class="palm-mount-group${animate ? '' : ' is-static'}" data-mount="${mount.key}" style="--mount-delay:${delay};--mount-color:${mount.color}">
      <circle class="palm-mount-pulse" cx="${mount.x}" cy="${mount.y}" r="${mount.radius * 1.18}" />
      <circle class="palm-mount-zone" cx="${mount.x}" cy="${mount.y}" r="${mount.radius}" />
      <text class="palm-mount-glyph" x="${mount.x}" y="${mount.y}" dy="0.34em" text-anchor="middle" style="font-size:${glyphSize}px">${mount.glyph}</text>
    </g>`;
  }).join('');
}

function palmMountOverlaySvg(result = state.palmDetection, { animate = false } = {}) {
  if (!result) return '';
  const size = state.palmImageSize || { width: 720, height: 960 };
  const zones = palmMountZones(result, size);
  if (zones.length !== PALM_MOUNT_DEFINITIONS.length) return '';
  return `<svg class="palm-mount-overlay${animate ? '' : ' palm-mount-overlay--static'}" viewBox="0 0 ${size.width} ${size.height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${palmMountSvgGroups(zones, { animate })}</svg>`;
}

function palmMountLegend() {
  return `<div class="palm-mount-legend" aria-label="Traditional planetary zones on the palm">${PALM_MOUNT_DEFINITIONS.map((mount) => `<span style="--mount-color:${mount.color}"><i>${mount.glyph}</i><b>${mount.label}</b><small>${mount.position} · ${mount.meaning}</small></span>`).join('')}</div>`;
}

function palmSmoothPath(points = []) {
  const clean = points.map(palmPoint).filter(Boolean);
  if (clean.length < 2) return '';
  const rounded = (value) => Math.round(value * 100) / 100;
  let path = `M ${rounded(clean[0].x)} ${rounded(clean[0].y)}`;
  for (let index = 0; index < clean.length - 1; index += 1) {
    const previous = clean[index - 1] || clean[index];
    const current = clean[index];
    const next = clean[index + 1];
    const after = clean[index + 2] || next;
    const controlOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6
    };
    const controlTwo = {
      x: next.x - (after.x - current.x) / 6,
      y: next.y - (after.y - current.y) / 6
    };
    path += ` C ${rounded(controlOne.x)} ${rounded(controlOne.y)}, ${rounded(controlTwo.x)} ${rounded(controlTwo.y)}, ${rounded(next.x)} ${rounded(next.y)}`;
  }
  return path;
}

function palmOverlaySvg(result = state.palmDetection) {
  if (!result) return '';
  const size = state.palmImageSize || { width: 720, height: 960 };
  const colors = { love: '#a45168', heart: '#a45168', head: '#b17c31', life: '#28796e', fate: '#6c6090' };
  const labels = { love: 'Heart', heart: 'Heart', head: 'Head', life: 'Life', fate: 'Fate' };
  const lines = palmOverlayLines(result);
  const paths = Object.entries(lines).map(([key, points], lineIndex) => {
    if (!Array.isArray(points) || points.length < 2) return '';
    const clean = points.map(palmPoint).filter(Boolean);
    const path = palmSmoothPath(clean);
    if (!path) return '';
    const midpoint = clean[Math.floor(clean.length / 2)];
    const color = colors[key] || '#9c6d2d';
    const coreWidth = Math.max(3, size.width * 0.006);
    const labelSize = Math.max(24, Math.min(42, size.width * 0.028));
    const labelOffset = Math.max(20, size.width * 0.022);
    const labelOnLeft = midpoint.x > size.width * 0.72;
    const labelX = midpoint.x + (labelOnLeft ? -labelOffset : labelOffset);
    const labelY = Math.max(labelSize, midpoint.y - labelOffset);
    const delay = `${lineIndex * 0.34}s`;
    return `<g class="palm-line-group" style="--palm-line-delay:${delay}">
      <path class="palm-path-halo" d="${path}" stroke="${color}" stroke-width="${coreWidth * 3.2}" />
      <path class="palm-path-glow" d="${path}" stroke="${color}" stroke-width="${coreWidth * 1.8}" />
      <path class="palm-polyline" d="${path}" stroke="${color}" stroke-width="${coreWidth}" />
      <circle class="palm-path-anchor" cx="${midpoint.x}" cy="${midpoint.y}" r="${Math.max(3, size.width * 0.005)}" />
      <text class="palm-path-label" x="${labelX}" y="${labelY}" text-anchor="${labelOnLeft ? 'end' : 'start'}" style="font-size:${labelSize}px">${labels[key] || escapeHtml(key)}</text>
    </g>`;
  }).join('');
  return `<svg class="palm-overlay" viewBox="0 0 ${size.width} ${size.height}" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${paths}</svg>`;
}

async function detectPalm(retriedAfterFlowRefresh = false, retriedAfterAgeCheck = false) {
  if (!state.palmFile) throw new Error('Choose a new palm photo to continue.');
  if (IS_GLOBAL_STOREFRONT && !usableGlobalAgeCheck()) {
    await requestGlobalAgeCheckCapability(state.answers.dob);
  }
  const form = new FormData();
  form.append('file', state.palmFile, state.palmFile.name || 'palm.jpg');
  const response = await fetch('/api/palm/detect', {
    method: 'POST',
    headers: IS_GLOBAL_STOREFRONT
      ? { 'X-Astro-Age-Check-Token': state.globalAgeCheckToken }
      : undefined,
    body: form
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok && !retriedAfterFlowRefresh && isFlowSecurityError(response, body)) {
    await refreshFlowSession();
    if (IS_GLOBAL_STOREFRONT) {
      state.globalAgeCheckToken = '';
      state.globalAgeCheckExpiresAt = '';
      await requestGlobalAgeCheckCapability(state.answers.dob);
    }
    return detectPalm(true, retriedAfterAgeCheck);
  }
  if (
    !response.ok
    && IS_GLOBAL_STOREFRONT
    && !retriedAfterAgeCheck
    && ['GLOBAL_AGE_CHECK_REQUIRED', 'GLOBAL_AGE_CHECK_INVALID', 'GLOBAL_AGE_CHECK_EXPIRED'].includes(body?.code)
  ) {
    state.globalAgeCheckToken = '';
    state.globalAgeCheckExpiresAt = '';
    await requestGlobalAgeCheckCapability(state.answers.dob);
    return detectPalm(retriedAfterFlowRefresh, true);
  }
  if (!response.ok) throw new Error(body.message || body.error || 'We could not detect enough clear palm lines. Try a brighter, straighter photo.');
  if (!usablePalm(body)) throw new Error('We could not detect enough clear palm lines. Photograph your open left palm in bright, even light.');
  return body;
}

const FACE_OBSERVATION_LABELS = Object.freeze({
  face_shape: {
    label: 'Overall face map',
    values: { oval: 'Smooth, cohesive outline', round: 'Broad, softly curved outline', square: 'Straighter, clearly defined outline', oblong: 'Clear vertical flow', heart: 'Cheek-to-chin taper', diamond: 'Cheek-width emphasis', triangular: 'Lower-face emphasis' }
  },
  facial_thirds: {
    label: 'Middle/lower face balance',
    values: { balanced: 'Middle and lower segments look balanced', middle_emphasis: 'Longer inner-brow-to-nose segment', lower_emphasis: 'Longer nose-to-chin segment' }
  },
  forehead_proportion: {
    label: 'Forehead proportion',
    values: { balanced: 'Cohesive upper-face proportion', broad: 'Open forehead proportion', compact: 'Compact forehead proportion' }
  },
  jaw_contour: {
    label: 'Lower-jaw to cheek width',
    values: { balanced: 'Middle-range jaw-to-cheek width', soft: 'Moderately narrower lower jaw', angular: 'Lower-jaw width closer to cheek width', tapered: 'Clearly narrower lower jaw' }
  },
  eye_spacing: {
    label: 'Eye spacing',
    values: { close: 'Closer-set eyes', balanced: 'Centred eye spacing', wide: 'Wider-set eyes' }
  },
  eye_color: {
    label: 'Visible eye colour',
    values: { dark_brown: 'Deep brown eyes', brown: 'Brown eyes', hazel: 'Hazel eyes', green: 'Green eyes', blue_gray: 'Blue-grey eyes' }
  },
  brow_line: {
    label: 'Brow line',
    values: { straight: 'Clean, straighter brow line', curved: 'Soft brow curve', angled: 'Defined angled brow', mixed: 'Distinctive mixed brow line' }
  },
  brow_spacing: {
    label: 'Brow spacing',
    values: { close: 'Closer brow spacing', balanced: 'Centred brow spacing', wide: 'Open brow spacing' }
  },
  nose_proportion: {
    label: 'Nose length-to-width balance',
    values: { balanced: 'Balanced nose length and width', compact: 'Width-led nose proportion', prominent: 'Length-led nose proportion' }
  },
  mouth_proportion: {
    label: 'Mouth width',
    values: { compact: 'Narrower mouth width', balanced: 'Balanced mouth width', broad: 'Wider mouth width' }
  },
  chin_lower_face: {
    label: 'Lower-face vertical share',
    values: { short: 'Compact lower-face vertical share', balanced: 'Balanced lower-face vertical share', long: 'Larger lower-face vertical share' }
  }
});

const FACE_VISUAL_INSIGHTS = Object.freeze({
  face_shape: {
    oval: {
      feature: 'smooth, cohesive outline',
      fact: 'Your visible face length and width form one fluid outline.',
      notice: 'the smooth flow of your overall outline',
      themes: ['composed versatility', 'adaptive movement']
    },
    round: {
      feature: 'broad, softly curved outline',
      fact: 'Your face width carries more strongly through the cheek area.',
      notice: 'the open softness through your cheek area',
      themes: ['receptive attention', 'collaborative exchange']
    },
    square: {
      feature: 'straighter, clearly defined outline',
      fact: 'Your outer contour holds a straighter course through the lower face.',
      notice: 'the clean definition of your outer frame',
      themes: ['structured action', 'steady follow-through']
    },
    oblong: {
      feature: 'clear vertical flow',
      fact: 'Your face length carries more emphasis than its width.',
      notice: 'the refined vertical flow of your outline',
      themes: ['forward planning', 'reflective depth']
    },
    heart: {
      feature: 'cheek-to-chin taper',
      fact: 'Your lower outline narrows clearly from the cheek area toward the chin.',
      notice: 'the expressive taper from cheek to chin',
      themes: ['visible expression', 'adaptive movement']
    },
    diamond: {
      feature: 'cheek-width emphasis',
      fact: 'The clearest width in your outline sits through the cheek area.',
      notice: 'the sculpted emphasis through your cheeks',
      themes: ['focused attention', 'independent judgement']
    },
    triangular: {
      feature: 'lower-face emphasis',
      fact: 'The clearest width in your outline sits through the lower face.',
      notice: 'the distinctive strength of your lower frame',
      themes: ['active initiative', 'focused attention']
    }
  },
  facial_thirds: {
    balanced: {
      feature: 'balanced middle and lower segments',
      fact: 'The inner-brow-to-nose-base and nose-base-to-chin segments appear similar in length.',
      notice: 'the visible balance between your middle and lower face segments',
      themes: ['composed versatility', 'steady follow-through']
    },
    middle_emphasis: {
      feature: 'longer middle segment',
      fact: 'The inner-brow-to-nose-base segment appears longer than the nose-base-to-chin segment.',
      notice: 'the longer visible middle-face segment',
      themes: ['adaptive movement', 'receptive attention']
    },
    lower_emphasis: {
      feature: 'longer lower segment',
      fact: 'The nose-base-to-chin segment appears longer than the inner-brow-to-nose-base segment.',
      notice: 'the longer visible nose-to-chin segment',
      themes: ['active initiative', 'visible expression']
    }
  },
  forehead_proportion: {
    balanced: {
      feature: 'cohesive upper-face proportion',
      fact: 'Your forehead aligns closely with the rest of your face.',
      notice: 'the cohesive frame above your brows',
      themes: ['composed versatility']
    },
    broad: {
      feature: 'open forehead proportion',
      fact: 'Your forehead carries more visible space within the upper face.',
      notice: 'the clear, spacious frame above your brows',
      themes: ['forward planning', 'broad perspective']
    },
    compact: {
      feature: 'compact forehead proportion',
      fact: 'Your forehead occupies a more compact share of the upper face.',
      notice: 'the focused frame around your brows and eyes',
      themes: ['focused attention', 'practical application']
    }
  },
  jaw_contour: {
    balanced: {
      feature: 'middle-range jaw-to-cheek width',
      fact: 'Your visible lower-jaw width sits in a middle range relative to your cheek width.',
      notice: 'the middle-range width relationship through your lower face',
      themes: ['steady follow-through', 'composed versatility']
    },
    soft: {
      feature: 'moderately narrower lower jaw',
      fact: 'Your visible lower-jaw width is moderately narrower than your cheek width.',
      notice: 'the moderate narrowing from cheek width to lower-jaw width',
      themes: ['receptive attention', 'adaptive movement']
    },
    angular: {
      feature: 'lower-jaw width closer to cheek width',
      fact: 'Your visible lower-jaw width stays closer to your cheek width.',
      notice: 'the closer width relationship through your lower frame',
      themes: ['structured action', 'active initiative']
    },
    tapered: {
      feature: 'clearly narrower lower jaw',
      fact: 'Your visible lower-jaw width is clearly narrower than your cheek width.',
      notice: 'the clear narrowing from cheek width to lower-jaw width',
      themes: ['focused attention', 'adaptive movement']
    }
  },
  eye_spacing: {
    balanced: {
      feature: 'centred eye spacing',
      fact: 'Your eye spacing sits close to the visible width relationship of your eyes.',
      notice: 'the composed visual rhythm around your eyes',
      themes: ['composed versatility']
    },
    close: {
      feature: 'closer-set eyes',
      fact: 'Your eye spacing concentrates attention toward the centre of your face.',
      notice: 'the precise visual focus around your eyes',
      themes: ['focused attention', 'reflective depth']
    },
    wide: {
      feature: 'wider-set eyes',
      fact: 'Your eye spacing creates more open room across the eye area.',
      notice: 'the openness around your eyes',
      themes: ['broad perspective', 'adaptive movement']
    }
  },
  eye_color: {
    dark_brown: {
      feature: 'deep brown eyes',
      fact: 'Deep brown was the eye colour clear enough to map in this photo.',
      notice: 'the depth of your brown eye colour',
      traditionalMeaning: 'Deep brown eyes are traditionally read as grounded and self-contained, giving the gaze a steady, quietly powerful presence.',
      themes: []
    },
    brown: {
      feature: 'brown eyes',
      fact: 'Brown was the eye colour clear enough to map in this photo.',
      notice: 'your visible brown eye colour',
      traditionalMeaning: 'Brown eyes are traditionally read as warm and dependable, creating an approachable first impression with practical depth underneath.',
      themes: []
    },
    hazel: {
      feature: 'hazel eyes',
      fact: 'Hazel was the eye colour clear enough to map in this photo.',
      notice: 'the mixed tones visible in your hazel eyes',
      traditionalMeaning: 'Hazel eyes are traditionally read as adaptable and curious, giving the gaze a distinctive mix of warmth, alertness and independence.',
      themes: []
    },
    green: {
      feature: 'green eyes',
      fact: 'Green was the eye colour clear enough to map in this photo.',
      notice: 'your visible green eye colour',
      traditionalMeaning: 'Green eyes are traditionally read as individualistic and perceptive, creating a memorable gaze with a strong sense of personal style.',
      themes: []
    },
    blue_gray: {
      feature: 'blue-grey eyes',
      fact: 'Blue-grey was the eye colour clear enough to map in this photo.',
      notice: 'the lighter tone visible in your eyes',
      traditionalMeaning: 'Blue-grey eyes are traditionally read as observant and reflective, giving the gaze a calm reserve that invites a second look.',
      themes: []
    }
  },
  brow_line: {
    straight: {
      feature: 'clean, straighter brow line',
      fact: 'Your brows follow a mostly straight visible course.',
      notice: 'the crisp frame your brows create around your eyes',
      themes: ['structured action', 'direct expression']
    },
    curved: {
      feature: 'soft brow curve',
      fact: 'Your brows follow a smooth curved course.',
      notice: 'the gentle lift and movement around your eyes',
      themes: ['receptive attention', 'adaptive movement']
    },
    angled: {
      feature: 'defined angled brow',
      fact: 'Your brows rise with a clearer visible angle.',
      notice: 'the definition and visual energy around your eyes',
      themes: ['active initiative', 'focused attention']
    },
    mixed: {
      feature: 'distinctive mixed brow line',
      fact: 'Your brows combine straighter and curved visible segments.',
      notice: 'the subtle change of line across your eye area',
      themes: ['composed versatility', 'adaptive movement']
    }
  },
  brow_spacing: {
    balanced: {
      feature: 'centred brow spacing',
      fact: 'The visible space between your brows sits close to their overall width.',
      notice: 'the centred frame created by your brows',
      themes: ['composed versatility']
    },
    close: {
      feature: 'closer brow spacing',
      fact: 'The visible space between your brows is relatively close.',
      notice: 'the concentrated focus through your brow area',
      themes: ['focused attention', 'reflective depth']
    },
    wide: {
      feature: 'open brow spacing',
      fact: 'The visible space between your brows is relatively open.',
      notice: 'the openness across your brow area',
      themes: ['broad perspective', 'adaptive movement']
    }
  },
  nose_proportion: {
    balanced: {
      feature: 'balanced nose length and width',
      fact: 'Your visible nose length and width form a balanced relationship.',
      notice: 'the cohesive central line of your face',
      themes: ['steady follow-through', 'composed versatility']
    },
    compact: {
      feature: 'width-led nose proportion',
      fact: 'Your visible nose has more width emphasis relative to its length.',
      notice: 'the way visual focus is shared with your eyes and mouth',
      themes: ['practical application', 'adaptive movement']
    },
    prominent: {
      feature: 'length-led nose proportion',
      fact: 'Your visible nose has more length emphasis relative to its width.',
      notice: 'the strong, defining centre line of your face',
      themes: ['active initiative', 'forward planning']
    }
  },
  mouth_proportion: {
    balanced: {
      feature: 'balanced mouth width',
      fact: 'Your mouth width aligns closely with the lower facial zone.',
      notice: 'the cohesive rhythm through your lower face',
      themes: ['composed versatility', 'receptive attention']
    },
    compact: {
      feature: 'narrower mouth width',
      fact: 'Your mouth width occupies a narrower share of the lower face.',
      notice: 'the precise focal point created by your mouth',
      themes: ['reflective depth', 'clear boundaries']
    },
    broad: {
      feature: 'wider mouth width',
      fact: 'Your mouth width carries more visible emphasis across the lower face.',
      notice: 'the expressive presence through your lower face',
      themes: ['visible expression', 'collaborative exchange']
    }
  },
  chin_lower_face: {
    short: {
      feature: 'compact lower-face vertical share',
      fact: 'Your visible nose-base-to-chin segment occupies a more compact share of your full visible face height.',
      notice: 'the compact vertical share through your lower face',
      themes: ['practical application', 'adaptive movement']
    },
    balanced: {
      feature: 'balanced lower-face vertical share',
      fact: 'Your visible nose-base-to-chin segment occupies a balanced share of your full visible face height.',
      notice: 'the balanced vertical share through your lower face',
      themes: ['steady follow-through', 'composed versatility']
    },
    long: {
      feature: 'larger lower-face vertical share',
      fact: 'Your visible nose-base-to-chin segment occupies a larger share of your full visible face height.',
      notice: 'the larger vertical share through your lower face',
      themes: ['forward planning', 'reflective depth']
    }
  }
});

const FACE_THEME_REFLECTIONS = Object.freeze({
  'adaptive movement': {
    label: 'Adapts quickly',
    verdict: 'When plans change, you look for another workable route.',
    firstImpression: 'Flexible and quick to adjust.',
    roomEnergy: 'You bring an alert, flexible energy that makes change feel manageable.',
    strength: 'Regaining momentum after an unexpected change.',
    watch: 'Changing direction so often that the goal becomes unclear.',
    practicalUse: 'Keep the goal fixed; change only the method.'
  },
  'clear boundaries': {
    label: 'Clear limits',
    verdict: 'You prefer expectations and limits to be stated plainly.',
    firstImpression: 'Self-contained and firm.',
    roomEnergy: 'You bring a grounded, self-contained energy that makes your limits clear without many words.',
    strength: 'Protecting your time and priorities.',
    watch: 'Ending a discussion before all the facts are clear.',
    practicalUse: 'State the boundary, then ask one clarifying question.'
  },
  'broad perspective': {
    label: 'Sees several options',
    verdict: 'You notice several workable routes.',
    firstImpression: 'Open-minded and observant.',
    roomEnergy: 'You bring an open, curious energy that makes the room feel full of possibilities.',
    strength: 'Finding alternatives other people miss.',
    watch: 'Treating every option as equally important.',
    practicalUse: 'Choose one decision rule and remove options that fail it.'
  },
  'collaborative exchange': {
    label: 'Thinks through conversation',
    verdict: 'You sharpen an idea by discussing it and noticing the response.',
    firstImpression: 'Approachable and responsive.',
    roomEnergy: 'You bring an engaging, responsive energy that invites people into the conversation.',
    strength: 'Building shared understanding.',
    watch: 'Letting the group’s view blur your own.',
    practicalUse: 'State your view in one sentence before asking other people.'
  },
  'reflective depth': {
    label: 'Thinks before committing',
    verdict: 'You prefer to understand a question fully before settling on an answer.',
    firstImpression: 'Thoughtful and reserved.',
    roomEnergy: 'You bring a thoughtful, quiet intensity that makes people take your attention seriously.',
    strength: 'Finding details that quick answers miss.',
    watch: 'Delaying a decision after you already have enough information.',
    practicalUse: 'Set a time to decide, then state the conclusion first.'
  },
  'direct expression': {
    label: 'Gets to the point',
    verdict: 'You prefer the main point to be clear early.',
    firstImpression: 'Straightforward and decisive.',
    roomEnergy: 'You bring a clear, decisive energy that quickly gives the room a sense of direction.',
    strength: 'Cutting through confusion.',
    watch: 'Sounding abrupt when context matters.',
    practicalUse: 'Lead with the conclusion, then give one reason.'
  },
  'visible expression': {
    label: 'Makes ideas visible',
    verdict: 'You turn thoughts into words or action quickly.',
    firstImpression: 'Expressive and engaged.',
    roomEnergy: 'You bring a lively, expressive energy that makes ideas feel visible and immediate.',
    strength: 'Helping people see what matters.',
    watch: 'A strong start that is not matched by follow-through.',
    practicalUse: 'Pair the important statement with one next action.'
  },
  'focused attention': {
    label: 'Concentrates deeply',
    verdict: 'You work best when one priority is clearly defined.',
    firstImpression: 'Attentive and intent.',
    roomEnergy: 'You bring a concentrated, purposeful energy that signals you are fully present.',
    strength: 'Staying with a demanding task.',
    watch: 'Missing useful context outside the main target.',
    practicalUse: 'Before deciding, check one fact outside your main focus.'
  },
  'independent judgement': {
    label: 'Forms an independent view',
    verdict: 'You think something through before looking for agreement.',
    firstImpression: 'Self-directed and confident.',
    roomEnergy: 'You bring a self-assured, independent energy that does not look for approval.',
    strength: 'Making decisions without crowd pressure.',
    watch: 'Dismissing useful feedback too early.',
    practicalUse: 'Ask one trusted person to challenge your strongest assumption.'
  },
  'active initiative': {
    label: 'Starts quickly',
    verdict: 'You create momentum by taking a clear first step.',
    firstImpression: 'Proactive and decisive.',
    roomEnergy: 'You bring a proactive, forward-moving energy that encourages action.',
    strength: 'Moving from discussion to action.',
    watch: 'Committing before the direction has been tested.',
    practicalUse: 'Test the smallest reversible step first.'
  },
  'composed versatility': {
    label: 'Balances competing priorities',
    verdict: 'You weigh several considerations before choosing a workable direction.',
    firstImpression: 'Composed and considered.',
    roomEnergy: 'You bring a composed, balanced energy that helps competing voices settle.',
    strength: 'Finding a solution that respects important trade-offs.',
    watch: 'Waiting too long for an ideal answer.',
    practicalUse: 'Set a decision deadline and choose the best workable option.'
  },
  'forward planning': {
    label: 'Thinks ahead',
    verdict: 'You naturally consider what a decision leads to next.',
    firstImpression: 'Prepared and deliberate.',
    roomEnergy: 'You bring a prepared, deliberate energy that makes the next step feel clearer.',
    strength: 'Anticipating consequences.',
    watch: 'Letting preparation delay the present move.',
    practicalUse: 'Name the next consequence, then take the present step.'
  },
  'practical application': {
    label: 'Learns by doing',
    verdict: 'You understand an idea best by testing it in a real situation.',
    firstImpression: 'Grounded and action-oriented.',
    roomEnergy: 'You bring a grounded, hands-on energy that turns discussion into something usable.',
    strength: 'Turning theory into a useful result.',
    watch: 'Rejecting a promising idea after the first attempt.',
    practicalUse: 'Run a small test and review it after a fixed period.'
  },
  'receptive attention': {
    label: 'Reads the room',
    verdict: 'You notice the context before deciding how to respond.',
    firstImpression: 'Attentive and approachable.',
    roomEnergy: 'You bring an attentive, welcoming energy that helps people feel noticed.',
    strength: 'Adjusting your response to the situation.',
    watch: 'Taking in other views without stating your own.',
    practicalUse: 'After listening, state your position in one sentence.'
  },
  'steady follow-through': {
    label: 'Follows through consistently',
    verdict: 'You build progress by repeating what works.',
    firstImpression: 'Dependable and calm.',
    roomEnergy: 'You bring a calm, dependable energy that makes other people feel things are under control.',
    strength: 'Keeping long projects moving.',
    watch: 'Repeating a method after it stops working.',
    practicalUse: 'Review the result at a fixed interval, then keep or change the method based on evidence.'
  },
  'structured action': {
    label: 'Prefers clear steps',
    verdict: 'You work best when the roles, responsibilities and finish line are clear.',
    firstImpression: 'Organised and decisive.',
    roomEnergy: 'You bring an organised, decisive energy that gives the room a clear sense of order.',
    strength: 'Turning a vague goal into a workable plan.',
    watch: 'Sticking to the plan after conditions change.',
    practicalUse: 'Before committing, name one condition that would make you change course.'
  }
});

const FACE_REPORT_FEATURE_GROUPS = Object.freeze([
  { key: 'frame', title: 'Overall frame', summary: 'The outline and measured middle-to-lower segment balance set the broad visual rhythm.', features: ['face_shape', 'facial_thirds', 'forehead_proportion'] },
  { key: 'eyes_brows', title: 'Eyes and brows', summary: 'Eye spacing and brow lines add to the mapped pattern. Eye colour is recorded only as a photographed detail.', features: ['eye_spacing', 'eye_color', 'brow_line', 'brow_spacing'] },
  { key: 'centre_expression', title: 'Centre and expression', summary: 'Nose balance and mouth width shape how direct, reserved or expressive the face appears.', features: ['nose_proportion', 'mouth_proportion'] },
  { key: 'lower_frame', title: 'Jaw and lower face', summary: 'The lower frame influences how the whole outline comes to a close.', features: ['jaw_contour', 'chin_lower_face'] }
]);

const FACE_FEATURE_DISPLAY_ORDER = Object.freeze([
  'face_shape',
  'facial_thirds',
  'eye_spacing',
  'eye_color',
  'brow_line',
  'brow_spacing',
  'nose_proportion',
  'mouth_proportion',
  'jaw_contour',
  'chin_lower_face',
  'forehead_proportion'
]);

const FACE_FEATURE_HOOK_ORDER = Object.freeze([
  'eye_spacing',
  'jaw_contour',
  'brow_line',
  'brow_spacing',
  'face_shape',
  'mouth_proportion',
  'facial_thirds',
  'nose_proportion',
  'chin_lower_face',
  'forehead_proportion'
]);

const FACE_HEADLINE_FEATURES = Object.freeze({
  face_shape: Object.freeze({
    oval: 'smooth face shape',
    round: 'softer, rounder face shape',
    square: 'stronger face shape',
    oblong: 'longer face shape',
    heart: 'cheek-to-chin taper',
    diamond: 'defined cheekbones',
    triangular: 'stronger lower face'
  }),
  facial_thirds: Object.freeze({
    balanced: 'balanced middle and lower segments',
    middle_emphasis: 'longer middle-face segment',
    lower_emphasis: 'longer nose-to-chin segment'
  }),
  forehead_proportion: Object.freeze({
    balanced: 'evenly proportioned forehead',
    broad: 'more open forehead',
    compact: 'more compact forehead'
  }),
  jaw_contour: Object.freeze({
    balanced: 'middle-range jaw-to-cheek width',
    soft: 'moderately narrower lower jaw',
    angular: 'lower-jaw width closer to cheek width',
    tapered: 'clearly narrower lower jaw'
  }),
  eye_spacing: Object.freeze({
    balanced: 'even eye spacing',
    close: 'closer-set eyes',
    wide: 'wider-set eyes'
  }),
  eye_color: Object.freeze({
    dark_brown: 'deep brown eyes',
    brown: 'brown eyes',
    hazel: 'hazel eyes',
    green: 'green eyes',
    blue_gray: 'blue-grey eyes'
  }),
  brow_line: Object.freeze({
    straight: 'straighter brows',
    curved: 'curved brows',
    angled: 'angled brows',
    mixed: 'mixed brow shape'
  }),
  brow_spacing: Object.freeze({
    balanced: 'even brow spacing',
    close: 'closer brow spacing',
    wide: 'wider brow spacing'
  }),
  nose_proportion: Object.freeze({
    balanced: 'even nose proportion',
    compact: 'more compact nose',
    prominent: 'more prominent nose'
  }),
  mouth_proportion: Object.freeze({
    balanced: 'even mouth width',
    compact: 'more compact mouth',
    broad: 'wider mouth'
  }),
  chin_lower_face: Object.freeze({
    short: 'more compact lower-face share',
    balanced: 'balanced lower-face share',
    long: 'larger lower-face share'
  })
});

// Stored v1 reports keep the exact presentation contract that was live before
// the v2 middle/lower measurement correction. New scans and all v2 surfaces use
// the current tables above.
const LEGACY_FACE_FACIAL_THIRDS_LABELS = Object.freeze({
  label: 'Facial rhythm',
  values: Object.freeze({
    balanced: 'Harmonious facial-zone rhythm',
    upper_emphasis: 'Brow-and-forehead emphasis',
    middle_emphasis: 'Eye-and-cheek emphasis',
    lower_emphasis: 'Mouth-and-jaw emphasis'
  })
});

const LEGACY_FACE_FACIAL_THIRDS_INSIGHTS = Object.freeze({
  balanced: Object.freeze({
    feature: 'harmonious facial-zone rhythm',
    fact: 'Your upper, middle and lower facial zones sit in a cohesive relationship.',
    notice: 'the settled rhythm across all three facial zones',
    themes: Object.freeze(['composed versatility', 'steady follow-through'])
  }),
  upper_emphasis: Object.freeze({
    feature: 'brow-and-forehead emphasis',
    fact: 'Your upper facial zone carries the strongest visible proportion.',
    notice: 'the way attention is drawn toward your brow and forehead',
    themes: Object.freeze(['forward planning', 'reflective depth'])
  }),
  middle_emphasis: Object.freeze({
    feature: 'eye-and-cheek emphasis',
    fact: 'Your middle facial zone carries the strongest visible proportion.',
    notice: 'the strong visual centre around your eyes and cheeks',
    themes: Object.freeze(['adaptive movement', 'receptive attention'])
  }),
  lower_emphasis: Object.freeze({
    feature: 'mouth-and-jaw emphasis',
    fact: 'Your lower facial zone carries the strongest visible proportion.',
    notice: 'the visual anchor created by your mouth and jaw',
    themes: Object.freeze(['active initiative', 'visible expression'])
  })
});

const LEGACY_FACE_FACIAL_THIRDS_HEADLINES = Object.freeze({
  balanced: 'evenly spaced features',
  upper_emphasis: 'more prominent forehead',
  middle_emphasis: 'stronger eye-and-cheek area',
  lower_emphasis: 'stronger mouth-and-jaw area'
});

const LEGACY_FACE_JAW_CONTOUR_LABELS = Object.freeze({
  label: 'Jaw line',
  values: Object.freeze({ balanced: 'Composed jaw frame', soft: 'Soft jaw contour', angular: 'Defined angular jaw', tapered: 'Clear jaw taper' })
});
const LEGACY_FACE_JAW_CONTOUR_INSIGHTS = Object.freeze({
  balanced: Object.freeze({ feature: 'composed jaw frame', fact: 'Your jaw width and taper form one composed lower frame.', notice: 'the composed finish through your lower face', themes: Object.freeze(['steady follow-through', 'composed versatility']) }),
  soft: Object.freeze({ feature: 'soft jaw contour', fact: 'Your jaw follows a smooth curve from cheek to chin.', notice: 'the smooth cheek-to-chin curve', themes: Object.freeze(['receptive attention', 'adaptive movement']) }),
  angular: Object.freeze({ feature: 'defined angular jaw', fact: 'Your jaw follows a straighter, more angular course.', notice: 'the crisp definition through your lower frame', themes: Object.freeze(['structured action', 'active initiative']) }),
  tapered: Object.freeze({ feature: 'clear jaw taper', fact: 'Your jaw narrows distinctly toward the chin.', notice: 'the refined taper toward your chin', themes: Object.freeze(['focused attention', 'adaptive movement']) })
});
const LEGACY_FACE_JAW_CONTOUR_HEADLINES = Object.freeze({ balanced: 'composed jaw frame', soft: 'softer jawline', angular: 'more angular jawline', tapered: 'tapered jawline' });

const LEGACY_FACE_CHIN_LOWER_FACE_LABELS = Object.freeze({
  label: 'Chin balance',
  values: Object.freeze({ short: 'Compact chin-to-lower-face balance', balanced: 'Cohesive chin-to-lower-face balance', long: 'Longer chin-to-lower-face balance' })
});
const LEGACY_FACE_CHIN_LOWER_FACE_INSIGHTS = Object.freeze({
  short: Object.freeze({ feature: 'compact chin balance', fact: 'Your chin occupies a more compact share of the visible lower face.', notice: 'the compact finish through your chin area', themes: Object.freeze(['practical application', 'adaptive movement']) }),
  balanced: Object.freeze({ feature: 'cohesive chin balance', fact: 'Your chin length aligns closely with the visible lower face.', notice: 'the cohesive finish through your lower face', themes: Object.freeze(['steady follow-through', 'composed versatility']) }),
  long: Object.freeze({ feature: 'longer chin balance', fact: 'Your chin carries more visible length within the lower face.', notice: 'the longer finish through your chin area', themes: Object.freeze(['forward planning', 'reflective depth']) })
});
const LEGACY_FACE_CHIN_LOWER_FACE_HEADLINES = Object.freeze({ short: 'more compact chin', balanced: 'even chin balance', long: 'longer chin' });

const LEGACY_FACE_REPORT_FEATURE_GROUPS = Object.freeze([
  Object.freeze({ key: 'frame', title: 'Overall frame', summary: 'The outline and facial zones establish the broad visual rhythm.', features: Object.freeze(['face_shape', 'facial_thirds', 'forehead_proportion']) }),
  Object.freeze({ key: 'eyes_brows', title: 'Eyes and brows', summary: 'Eye colour, spacing and brow lines shape the expression people notice first.', features: Object.freeze(['eye_spacing', 'eye_color', 'brow_line', 'brow_spacing']) }),
  Object.freeze({ key: 'centre_expression', title: 'Centre and expression', summary: 'Nose balance and mouth width shape how direct, reserved or expressive the face appears.', features: Object.freeze(['nose_proportion', 'mouth_proportion']) }),
  Object.freeze({ key: 'lower_frame', title: 'Jaw and chin', summary: 'The lower frame influences how the whole outline comes to a close.', features: Object.freeze(['jaw_contour', 'chin_lower_face']) })
]);

function legacyFaceObservationValue(key, value) {
  if (key === 'facial_thirds') {
    return LEGACY_FACE_FACIAL_THIRDS_LABELS.values[value] || '';
  }
  if (key === 'jaw_contour') {
    return LEGACY_FACE_JAW_CONTOUR_LABELS.values[value] || '';
  }
  if (key === 'chin_lower_face') {
    return LEGACY_FACE_CHIN_LOWER_FACE_LABELS.values[value] || '';
  }
  return FACE_OBSERVATION_LABELS[key]?.values?.[value] || '';
}

const FACE_NEUTRAL_OBSERVATIONS = Object.freeze({
  face_shape: 'oval',
  facial_thirds: 'balanced',
  forehead_proportion: 'balanced',
  jaw_contour: 'soft',
  eye_spacing: 'balanced',
  brow_line: 'curved',
  brow_spacing: 'balanced',
  nose_proportion: 'balanced',
  mouth_proportion: 'balanced',
  chin_lower_face: 'balanced'
});

const FACE_FEATURE_COPY_ZONES = Object.freeze({
  eye_spacing: 'eye',
  eye_color: 'eye',
  brow_line: 'eye',
  brow_spacing: 'eye',
  face_shape: 'frame',
  jaw_contour: 'frame',
  chin_lower_face: 'frame',
  facial_thirds: 'detail',
  forehead_proportion: 'detail',
  nose_proportion: 'detail',
  mouth_proportion: 'detail'
});

const FACE_COMBINATION_IMPRESSIONS = Object.freeze({
  defined: { label: 'DEFINED & COMPOSED', phrase: 'a defined, composed presence' },
  open: { label: 'OPEN & EASY-FLOWING', phrase: 'an open, easy-flowing presence' },
  refined: { label: 'REFINED & DISTINCTIVE', phrase: 'a refined, distinctive presence' },
  expressive: { label: 'EXPRESSIVE & PRESENT', phrase: 'an expressive, present look' },
  cohesive: { label: 'POISED & SELF-POSSESSED', phrase: 'a poised, self-possessed presence' }
});

function faceRawObservations(analysis = state.faceAnalysis) {
  return Array.isArray(analysis?.observations)
    ? Object.fromEntries(analysis.observations.map((item) => [item.key, item.value]))
    : analysis?.observations || {};
}

function faceObservationConfidences(analysis = state.faceAnalysis) {
  if (!Array.isArray(analysis?.observations)) return {};
  return Object.fromEntries(analysis.observations.map((item) => {
    const confidence = Number(item?.confidence);
    return [
      item?.key,
      Number.isFinite(confidence) && confidence >= 0 && confidence <= 1
        ? confidence
        : 0.82
    ];
  }).filter(([key]) => key));
}

function faceObservationRows(analysis = state.faceAnalysis) {
  const observations = faceRawObservations(analysis);
  return Object.entries(FACE_OBSERVATION_LABELS).map(([key, definition]) => ({
    key,
    label: definition.label,
    rawValue: observations[key] || '',
    value: definition.values[observations[key]] || ''
  })).filter((item) => item.value);
}

function faceCombinationImpression(observations = {}) {
  const includes = (key, values) => values.includes(observations[key]);
  const scores = [
    {
      key: 'defined',
      score: Number(includes('face_shape', ['square']))
        + Number(includes('jaw_contour', ['angular']))
        + Number(includes('brow_line', ['straight', 'angled']))
    },
    {
      key: 'open',
      score: Number(includes('face_shape', ['round']))
        + Number(includes('jaw_contour', ['soft']))
        + Number(includes('brow_line', ['curved']))
        + Number(includes('eye_spacing', ['wide']))
    },
    {
      key: 'refined',
      score: Number(includes('face_shape', ['oblong', 'heart', 'diamond']))
        + Number(includes('jaw_contour', ['tapered']))
        + Number(includes('nose_proportion', ['prominent']))
    },
    {
      key: 'expressive',
      score: Number(includes('mouth_proportion', ['broad']))
        + Number(includes('brow_line', ['angled']))
        + Number(includes('facial_thirds', ['middle_emphasis', 'lower_emphasis']))
    }
  ];
  const neutralCount = Object.entries(FACE_NEUTRAL_OBSERVATIONS)
    .filter(([key, value]) => observations[key] === value)
    .length;
  const strongest = scores.sort((left, right) => right.score - left.score)[0];
  const key = strongest?.score >= 2 || neutralCount < 3 ? strongest?.key : 'cohesive';
  return FACE_COMBINATION_IMPRESSIONS[key] || FACE_COMBINATION_IMPRESSIONS.cohesive;
}

function faceSignatureCopy(primary, secondary) {
  if (!secondary) {
    return {
      headline: `Your ${primary.headlineFeature || primary.feature} shapes the first glance—and it is only the first part of the result.`,
      perception: `People first register ${primary.notice}.`
    };
  }
  const primaryFeature = primary.headlineFeature || primary.feature;
  const secondaryFeature = secondary.headlineFeature || secondary.feature;
  const primaryZone = FACE_FEATURE_COPY_ZONES[primary.key] || 'detail';
  const secondaryZone = FACE_FEATURE_COPY_ZONES[secondary.key] || 'detail';
  if (primaryZone === 'eye' && secondaryZone === 'eye') {
    return {
      headline: `Your ${primaryFeature} catches the eye first. Your ${secondaryFeature} is the second feature people register.`,
      perception: `People first register ${primary.notice}. A closer look draws attention to ${secondary.notice}.`
    };
  }
  if (primaryZone === 'frame' && secondaryZone === 'frame') {
    return {
      headline: `Your ${primaryFeature} sets the visible frame. Look again: your ${secondaryFeature} changes how the whole face comes together.`,
      perception: `Your visible outline leads with ${primary.notice}. Then ${secondary.notice} completes the impression.`
    };
  }
  if (primaryZone !== secondaryZone) {
    return {
      headline: `One feature is easy to spot: your ${primaryFeature}. The less obvious one is your ${secondaryFeature}—and the pairing creates your full first impression.`,
      perception: `Two areas shape the first glance: ${primary.notice}, then ${secondary.notice}.`
    };
  }
  return {
    headline: `Your ${primaryFeature} stands out first. The detail worth a second look is your ${secondaryFeature}—the feature that shifts the full impression.`,
    perception: `The first visible cue is ${primary.notice}; the less obvious feature is ${secondary.notice}.`
  };
}

function faceVisualSignature(analysis = state.faceAnalysis, { legacyPresentation = false } = {}) {
  const observations = faceRawObservations(analysis);
  const observationConfidences = faceObservationConfidences(analysis);
  const toFeature = (key) => {
    const rawValue = observations[key];
    const legacyTables = legacyPresentation
      ? {
          facial_thirds: [LEGACY_FACE_FACIAL_THIRDS_LABELS, LEGACY_FACE_FACIAL_THIRDS_INSIGHTS, LEGACY_FACE_FACIAL_THIRDS_HEADLINES],
          jaw_contour: [LEGACY_FACE_JAW_CONTOUR_LABELS, LEGACY_FACE_JAW_CONTOUR_INSIGHTS, LEGACY_FACE_JAW_CONTOUR_HEADLINES],
          chin_lower_face: [LEGACY_FACE_CHIN_LOWER_FACE_LABELS, LEGACY_FACE_CHIN_LOWER_FACE_INSIGHTS, LEGACY_FACE_CHIN_LOWER_FACE_HEADLINES]
        }[key]
      : null;
    const insight = legacyTables
      ? legacyTables[1][rawValue]
      : FACE_VISUAL_INSIGHTS[key]?.[rawValue];
    const labels = legacyTables
      ? legacyTables[0]
      : FACE_OBSERVATION_LABELS[key];
    if (!insight || !labels) return null;
    return {
      key,
      rawValue,
      label: labels.label,
      value: labels.values[rawValue] || insight.feature,
      headlineFeature: legacyTables
        ? legacyTables[2][rawValue] || insight.feature
        : FACE_HEADLINE_FEATURES[key]?.[rawValue] || insight.feature,
      confidence: observationConfidences[key] ?? 0.82,
      ...insight
    };
  };
  const allFeatures = FACE_FEATURE_DISPLAY_ORDER.map(toFeature).filter(Boolean);
  const hookFeatures = FACE_FEATURE_HOOK_ORDER.map(toFeature).filter(Boolean);
  const features = hookFeatures
    .map((item, hookOrder) => ({
      ...item,
      hookOrder,
      distinctive: FACE_NEUTRAL_OBSERVATIONS[item.key] !== item.rawValue
    }))
    .sort((left, right) => (
      Number(right.distinctive) - Number(left.distinctive)
      || right.confidence - left.confidence
      || left.hookOrder - right.hookOrder
    ))
    .filter((item, index, items) => items.findIndex((candidate) => candidate.key === item.key) === index)
    .slice(0, 3);
  const primary = features[0] || allFeatures[0] || {
    feature: 'visible feature pattern',
    fact: 'Your visible proportions form a clear face map.',
    notice: 'the way your features work together',
    themes: ['composed versatility'],
    label: 'Face map',
    value: 'Mapped'
  };
  const secondary = features[1] || allFeatures.find((item) => item.key !== primary.key);
  const impression = faceCombinationImpression(observations);
  const themeKeys = [...new Set(
    [primary, secondary].filter(Boolean).flatMap((item) => item.themes || [])
  )].slice(0, 3);
  const themes = themeKeys.map((label) => FACE_THEME_REFLECTIONS[label]?.label || label);
  const copy = faceSignatureCopy(primary, secondary);
  return {
    allFeatures,
    features: [primary, secondary, features[2]].filter(Boolean),
    impression,
    headline: copy.headline,
    lede: [primary.fact, secondary?.fact].filter(Boolean).join(' '),
    perception: copy.perception,
    traditional: `Traditional face reading connects this combination with ${humanList(themes)}.`
  };
}

function faceThemeProfiles(signature = faceVisualSignature()) {
  const scores = new Map();
  for (const feature of signature.allFeatures || []) {
    (feature.themes || []).forEach((label, index) => {
      const weight = index === 0 ? 1 : 0.85;
      scores.set(label, (scores.get(label) || 0) + Number(feature.confidence || 0.82) * weight);
    });
  }
  const labels = [...scores.keys()].sort((left, right) => (
    scores.get(right) - scores.get(left)
    || left.localeCompare(right)
  ));
  return labels.slice(0, 3).map((themeKey, index) => {
    const reflection = FACE_THEME_REFLECTIONS[themeKey] || {
      label: themeKey,
      verdict: `This pattern centres on ${themeKey}.`,
      firstImpression: `People notice ${themeKey}.`,
      roomEnergy: `You bring the energy of ${themeKey} into the room.`,
      strength: `This pattern helps you use ${themeKey}.`,
      watch: 'Watch for the point where a strength becomes overused.',
      practicalUse: 'Use the strongest pattern deliberately in your next important choice.'
    };
    return {
    key: themeKey,
    label: reflection.label,
    role: index === 0 ? 'Leading pattern' : 'Supporting pattern',
    summary: reflection.verdict,
    perception: reflection.firstImpression,
    roomEnergy: reflection.roomEnergy,
    strength: reflection.strength,
    watch: index === 0 ? reflection.watch : '',
    practicalUse: reflection.practicalUse,
    observationKeys: (signature.allFeatures || [])
      .filter((feature) => (feature.themes || []).includes(themeKey))
      .map(({ key }) => key)
    };
  });
}

// FACE_PREVIEW_PARITY_START
// Keep this small scorer byte-for-byte equivalent in behaviour to the server's
// canonical Face theme weights. It is used only for the free, on-device clue;
// paid v2 reports render the stored server model directly.
const FACE_PREVIEW_THEME_MAP = Object.freeze({
  face_shape: Object.freeze({
    oval: [['integration', 1], ['adaptability', 0.9]],
    round: [['receptivity', 1], ['collaboration', 0.9]],
    square: [['structure', 1], ['steadiness', 0.9]],
    oblong: [['planning', 1], ['depth', 0.85]],
    heart: [['expression', 1], ['adaptability', 0.8]],
    diamond: [['focus', 1], ['independence', 0.85]],
    triangular: [['initiative', 1], ['focus', 0.85]]
  }),
  facial_thirds: Object.freeze({
    balanced: [['integration', 1], ['steadiness', 0.8]],
    middle_emphasis: [['adaptability', 1], ['receptivity', 0.8]],
    lower_emphasis: [['initiative', 1], ['expression', 0.8]]
  }),
  forehead_proportion: Object.freeze({
    balanced: [['integration', 1]],
    broad: [['planning', 1], ['breadth', 0.9]],
    compact: [['focus', 1], ['practicality', 0.85]]
  }),
  brow_line: Object.freeze({
    straight: [['structure', 1], ['directness', 0.9]],
    curved: [['receptivity', 1], ['adaptability', 0.85]],
    angled: [['initiative', 1], ['focus', 0.9]],
    mixed: [['integration', 1], ['adaptability', 0.8]]
  }),
  eye_spacing: Object.freeze({
    balanced: [['integration', 1]],
    close: [['focus', 1], ['depth', 0.85]],
    wide: [['breadth', 1], ['adaptability', 0.85]]
  }),
  brow_spacing: Object.freeze({
    balanced: [['integration', 1]],
    close: [['focus', 1], ['structure', 0.8]],
    wide: [['breadth', 1], ['receptivity', 0.8]]
  }),
  nose_proportion: Object.freeze({
    balanced: [['steadiness', 1], ['integration', 0.8]],
    compact: [['practicality', 1], ['adaptability', 0.8]],
    prominent: [['initiative', 1], ['planning', 0.85]]
  }),
  mouth_proportion: Object.freeze({
    balanced: [['integration', 1], ['receptivity', 0.8]],
    compact: [['depth', 1], ['boundaries', 0.85]],
    broad: [['expression', 1], ['collaboration', 0.9]]
  }),
  jaw_contour: Object.freeze({
    balanced: [['steadiness', 1], ['integration', 0.8]],
    soft: [['receptivity', 1], ['adaptability', 0.85]],
    angular: [['structure', 1], ['initiative', 0.9]],
    tapered: [['focus', 1], ['adaptability', 0.8]]
  }),
  chin_lower_face: Object.freeze({
    balanced: [['steadiness', 1], ['integration', 0.8]],
    short: [['practicality', 1], ['adaptability', 0.8]],
    long: [['planning', 1], ['depth', 0.85]]
  }),
  eye_color: Object.freeze({
    dark_brown: [],
    brown: [],
    hazel: [],
    green: [],
    blue_gray: []
  })
});

const FACE_PREVIEW_THEME_REFLECTION_KEYS = Object.freeze({
  adaptability: 'adaptive movement',
  boundaries: 'clear boundaries',
  breadth: 'broad perspective',
  collaboration: 'collaborative exchange',
  depth: 'reflective depth',
  directness: 'direct expression',
  expression: 'visible expression',
  focus: 'focused attention',
  independence: 'independent judgement',
  initiative: 'active initiative',
  integration: 'composed versatility',
  planning: 'forward planning',
  practicality: 'practical application',
  receptivity: 'receptive attention',
  steadiness: 'steady follow-through',
  structure: 'structured action'
});

function faceCanonicalPreviewThemeScoresFromRows(observations = []) {
  const totals = new Map();
  for (const observation of Array.isArray(observations) ? observations : []) {
    const confidenceValue = Number(observation?.confidence);
    const confidence = Number.isFinite(confidenceValue)
      && confidenceValue >= 0
      && confidenceValue <= 1
      ? confidenceValue
      : 0.82;
    const weights = FACE_PREVIEW_THEME_MAP[observation?.key]?.[observation?.value] || [];
    for (const [key, weight] of weights) {
      totals.set(key, (totals.get(key) || 0) + confidence * weight);
    }
  }
  const maximumScore = Math.max(1, ...totals.values());
  return [...totals.entries()]
    .map(([key, weightedScore]) => ({
      key,
      score: Math.round((weightedScore / maximumScore) * 1000) / 1000
    }))
    .sort((left, right) => right.score - left.score || left.key.localeCompare(right.key));
}
// FACE_PREVIEW_PARITY_END

function faceCanonicalPreviewProfiles(analysis = state.faceAnalysis) {
  const rows = Array.isArray(analysis?.observations)
    ? analysis.observations
    : Object.entries(faceRawObservations(analysis)).map(([key, value]) => ({
        key,
        value,
        confidence: 0.82
      }));
  return faceCanonicalPreviewThemeScoresFromRows(rows).slice(0, 3).map(({ key, score }, index) => {
    const reflectionKey = FACE_PREVIEW_THEME_REFLECTION_KEYS[key];
    const reflection = FACE_THEME_REFLECTIONS[reflectionKey] || {};
    return {
      key,
      score,
      label: 'A possible first-glance signal from this photo',
      role: index === 0 ? 'Leading pattern' : 'Supporting pattern',
      summary: 'That is a possible first impression from this portrait—not a fact about your personality.',
      firstImpression: reflection.firstImpression
        ? `In this photo, the leading visible pattern may initially feel ${String(reflection.firstImpression).toLowerCase()}`
        : 'This photo may create a clear first-glance signal.',
      practicalUse: ''
    };
  });
}

function faceReportFeatureGroups(signature = faceVisualSignature(), { legacyPresentation = false } = {}) {
  const features = new Map((signature.allFeatures || []).map((item) => [item.key, item]));
  const groups = legacyPresentation
    ? LEGACY_FACE_REPORT_FEATURE_GROUPS
    : FACE_REPORT_FEATURE_GROUPS;
  return groups.map((group) => ({
    ...group,
    items: group.features
      .map((key) => features.get(key))
      .filter(Boolean)
  })).filter(({ items }) => items.length);
}

function faceAnalysisQualityFromWorkerResult(result = {}, confidenceSource = {}) {
  const workerQuality = result.quality && typeof result.quality === 'object'
    ? result.quality
    : {};
  const confidenceValues = Object.values(confidenceSource)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value >= 0.55 && value <= 1)
    .sort((left, right) => left - right);
  const middle = Math.floor(confidenceValues.length / 2);
  const confidence = confidenceValues.length
    ? confidenceValues.length % 2
      ? confidenceValues[middle]
      : (confidenceValues[middle - 1] + confidenceValues[middle]) / 2
    : 0.82;
  const pixelCheckCompleted = workerQuality.pixelCheck === 'completed';
  const workerPassed = workerQuality.status === 'pass' || !workerQuality.status;
  const numericFaceCount = Number(workerQuality.faceCount);
  const faceCount = workerQuality.faceCount === 'one'
    ? 1
    : Number.isInteger(numericFaceCount) && numericFaceCount >= 0 && numericFaceCount <= 5
      ? numericFaceCount
      : 1;
  return {
    faceCount,
    frontal: workerQuality.pose === 'frontal',
    lighting: pixelCheckCompleted ? 'good' : 'acceptable',
    sharpness: pixelCheckCompleted ? 'good' : 'acceptable',
    occlusion: workerPassed ? 'none' : 'minor',
    confidence: Math.round(Math.max(0, Math.min(1, confidence)) * 1000) / 1000
  };
}

function faceAnalysisFromWorkerResult(result = {}) {
  const source = result.observations || {};
  const hasConfidenceMap = Boolean(
    result.observationConfidence
    && typeof result.observationConfidence === 'object'
    && !Array.isArray(result.observationConfidence)
  );
  const confidenceSource = hasConfidenceMap ? result.observationConfidence : {};
  const mappings = [
    ['face_shape', {
      broad: 'round',
      balanced: 'oval',
      tapered: 'heart',
      long: 'oblong'
    }],
    ['facial_thirds', {
      mid_longer: 'middle_emphasis',
      balanced: 'balanced',
      lower_longer: 'lower_emphasis'
    }, 'thirds_proxy'],
    ['jaw_contour', {
      pronounced: 'tapered',
      moderate: 'soft',
      straight: 'angular'
    }, 'jaw_taper'],
    ['eye_spacing', {
      close: 'close',
      balanced: 'balanced',
      wide: 'wide'
    }],
    ['eye_color', {
      dark_brown: 'dark_brown',
      brown: 'brown',
      hazel: 'hazel',
      green: 'green',
      blue_gray: 'blue_gray'
    }],
    ['brow_line', {
      straight: 'straight',
      soft_arch: 'curved',
      arched: 'angled'
    }, 'brow_shape'],
    ['brow_spacing', {
      close: 'close',
      balanced: 'balanced',
      wide: 'wide'
    }],
    ['nose_proportion', {
      width_emphasis: 'compact',
      balanced: 'balanced',
      length_emphasis: 'prominent'
    }, 'nose_ratio'],
    ['mouth_proportion', {
      narrow: 'compact',
      balanced: 'balanced',
      wide: 'broad'
    }, 'mouth_ratio'],
    ['chin_lower_face', {
      short: 'short',
      balanced: 'balanced',
      long: 'long'
    }]
  ];
  const observations = mappings.map(([key, values, sourceKey = key]) => {
    const value = values[source[sourceKey]];
    if (!value) return null;
    const suppliedConfidence = confidenceSource[sourceKey];
    const confidence = hasConfidenceMap
      ? Number(suppliedConfidence)
      : 0.82;
    if (!Number.isFinite(confidence) || confidence < 0.55 || confidence > 1) return null;
    return {
      key,
      value,
      confidence: Math.round(confidence * 1000) / 1000
    };
  }).filter(Boolean);
  return {
    schemaVersion: 'face_analysis_v1',
    provider: 'mediapipe_on_device',
    modelVersion: 'face_landmarker_float16_1',
    analyzedAt: new Date().toISOString(),
    quality: faceAnalysisQualityFromWorkerResult(result, confidenceSource),
    observations
  };
}

const FACE_REQUIRED_OBSERVATION_COVERAGE = Object.freeze([
  Object.freeze(['face_shape']),
  Object.freeze(['facial_thirds']),
  Object.freeze(['brow_line', 'eye_spacing', 'brow_spacing']),
  Object.freeze(['nose_proportion', 'mouth_proportion']),
  Object.freeze(['jaw_contour', 'chin_lower_face'])
]);

function faceAnalysisHasRequiredCoverage(analysis = {}) {
  const observationKeys = new Set(
    (Array.isArray(analysis?.observations) ? analysis.observations : [])
      .filter(({ confidence }) => Number(confidence) >= 0.55)
      .map(({ key }) => key)
  );
  return FACE_REQUIRED_OBSERVATION_COVERAGE.every(
    (group) => group.some((key) => observationKeys.has(key))
  );
}

function validFaceGeometryBlob(blob) {
  return blob instanceof Blob
    && blob.type === 'image/png'
    && blob.size > 0
    && blob.size <= 8 * 1024 * 1024;
}

function validFaceGeometryDimensions(overlay = null) {
  const width = Number(overlay?.width || 0);
  const height = Number(overlay?.height || 0);
  return Number.isFinite(width)
    && Number.isFinite(height)
    && width >= 1
    && height >= 1;
}

function replaceFaceGeometryOverlay(overlay = null) {
  if (state.faceOverlayUrl) URL.revokeObjectURL(state.faceOverlayUrl);
  state.faceOverlayUrl = '';
  if (
    !validFaceGeometryBlob(overlay?.blob)
    || !validFaceGeometryDimensions(overlay)
    || overlay?.source !== 'detected_geometry'
  ) return false;
  const blob = overlay.blob;
  state.faceOverlayUrl = URL.createObjectURL(blob);
  return true;
}

function prepareFaceGeometryLayers(overlay = null) {
  if (
    !validFaceGeometryDimensions(overlay)
    || overlay?.source !== 'detected_geometry'
    || overlay?.schemaVersion !== 'face-geometry-overlay-v2'
    || !validFaceGeometryBlob(overlay?.base?.blob)
    || !Array.isArray(overlay?.signals)
  ) return null;
  const expectedKeys = FACE_SCAN_SIGNAL_STAGES.map((signal) => signal.key);
  const sourceByKey = new Map();
  for (const layer of overlay.signals) {
    const key = String(layer?.key || '');
    if (
      !expectedKeys.includes(key)
      || sourceByKey.has(key)
      || !validFaceGeometryBlob(layer?.blob)
      || !['left', 'right'].includes(layer?.side)
    ) continue;
    sourceByKey.set(key, layer);
  }

  const objectUrls = [];
  try {
    const baseUrl = URL.createObjectURL(overlay.base.blob);
    objectUrls.push(baseUrl);
    const signals = new Map(expectedKeys.filter((key) => sourceByKey.has(key)).map((key) => {
      const layer = sourceByKey.get(key);
      const url = URL.createObjectURL(layer.blob);
      objectUrls.push(url);
      return [key, { key, side: layer.side, url }];
    }));
    let released = false;
    return {
      baseUrl,
      signals,
      release() {
        if (released) return;
        released = true;
        for (const url of objectUrls) URL.revokeObjectURL(url);
      }
    };
  } catch {
    for (const url of objectUrls) URL.revokeObjectURL(url);
    return null;
  }
}

function releaseFacePhoto() {
  state.faceFile = null;
  state.faceImageSize = null;
  if (state.facePreviewUrl) URL.revokeObjectURL(state.facePreviewUrl);
  if (state.faceOverlayUrl) URL.revokeObjectURL(state.faceOverlayUrl);
  state.facePreviewUrl = '';
  state.faceOverlayUrl = '';
}

function faceScannerHudMarkup({
  id = '',
  locked = false,
  calculated = false,
  markerCount = 0
} = {}) {
  const resolvedClass = locked || calculated ? ' is-resolved' : '';
  const idAttribute = id ? ` id="${escapeHtml(id)}"` : '';
  const statusLabel = locked
    ? 'DETECTED GEOMETRY'
    : calculated
      ? 'FEATURE SIGNALS READY'
      : 'SCANNER ACTIVE';
  const resultLabel = locked
    ? `${markerCount} SIGNALS MAPPED`
    : calculated
      ? `${markerCount} SIGNALS FOUND`
      : 'LOCATING FACE';
  return `<div class="face-hud face-hud--scanner${resolvedClass}"${idAttribute} aria-hidden="true">
    <i class="face-hud__grid"></i>
    ${['tl', 'tr', 'bl', 'br'].map((corner) => `<i class="face-hud__corner face-hud__corner--${corner}"></i>`).join('')}
    <div class="face-hud__telemetry face-hud__telemetry--top"><span><i></i> ${statusLabel}</span><b>${resultLabel}</b></div>
    <i class="face-hud__neutral-axis face-hud__neutral-axis--x"></i>
    <i class="face-hud__neutral-axis face-hud__neutral-axis--y"></i>
    <div class="face-hud__telemetry face-hud__telemetry--bottom"><span>CPU · ON DEVICE</span><b>PHOTO PRIVATE</b></div>
  </div>`;
}

function renderFaceScan() {
  cancelActiveFaceScanPresentation();
  state.faceScanRunId = '';
  if (!state.faceFile) {
    if (state.faceAnalysis) {
      go('faceproof', 'resume');
      return;
    }
    go('intro', 'missing_face_photo');
    return;
  }
  show(`<div class="face-scan" data-testid="face-scan">
    <div class="kicker center">Private on-device face map</div>
    <h1 class="face-scan__title">Building your face map…</h1>
    <div class="face-scan__viewport is-scanning">
      <img class="face-scan__photo" src="${escapeHtml(state.facePreviewUrl)}" alt="Your selected face photo" />
      <i class="face-scan__vignette" aria-hidden="true"></i>
      <img class="face-scan__geometry-overlay face-scan__geometry-overlay--base" id="faceScanGeometryOverlay" alt="" hidden />
      <div class="face-scan__signal-layers" id="faceScanSignalLayers" aria-hidden="true"></div>
      ${faceScannerHudMarkup({ id: 'faceScanHud' })}
      <i class="face-scan__sweep face-scan__scanner-light" aria-hidden="true"></i>
      <span class="face-scan__badge">ON-DEVICE · PHOTO STAYS HERE</span>
      <span class="face-scan__detected-badge" id="faceDetectedBadge" aria-hidden="true" hidden>✓ Face detected</span>
      <div class="face-scan__failure" id="faceScanErrorOverlay" role="alert" aria-live="assertive" hidden>
        <div class="face-scan__failure-card">
          <span class="face-scan__failure-icon" aria-hidden="true">!</span>
          <h2 id="faceScanErrorTitle">No face detected</h2>
          <p id="faceScanErrorMessage">Use a clear, front-facing photo with your full face visible.</p>
          <div class="face-scan__failure-actions">
            <button class="primary-button" id="faceScanRetake" type="button" data-action="retry-face">Retake photo</button>
            <button class="secondary-button" type="button" data-action="choose-face" data-input="faceRetryInput">Upload another photo</button>
          </div>
        </div>
      </div>
      <input class="file-input" id="faceRetryInput" type="file" accept="image/*" aria-hidden="true" tabindex="-1" hidden />
    </div>
    <div class="face-scan__progress" id="faceScanProgress">
      <div class="face-scan__progress-head"><span id="faceScanPhase">CHECKING PHOTO</span><b id="faceScanPercent">8%</b></div>
      <div class="face-scan__track"><i class="face-scan__bar" id="faceScanBar" style="width:8%"></i></div>
      <p class="face-scan__status" id="faceScanStatus" role="status" aria-live="polite">Scanning your photo from edge to edge…</p>
      <div class="face-scan__evidence" id="faceScanEvidence" aria-hidden="true"><span data-face-evidence="face"><small>FACE</small><b>Locating</b></span><span data-face-evidence="pose"><small>POSE</small><b>Waiting</b></span><span data-face-evidence="map"><small>MAP</small><b>Waiting</b></span></div>
    </div>
    <div class="face-landing__privacy">✓ No face photo, iris pixels or landmark mesh is uploaded</div>
  </div>`);
  requestAnimationFrame(runFaceScan);
}

async function playFaceScanPresentation({
  runId,
  mappedRows,
  layeredOverlayReady,
  geometryOverlay,
  signalNodes,
  viewport,
  hud,
  evidence,
  detectedBadge,
  phase,
  status,
  percentNode,
  progress,
  waitForStage,
  isActive,
  reducedMotion
}) {
  const mappedKeys = new Set(mappedRows.map((row) => row.key));
  const signals = FACE_SCAN_SIGNAL_STAGES.filter((signal) => mappedKeys.has(signal.key));
  const baseDuration = reducedMotion
    ? FACE_SCAN_REDUCED_BASE_HOLD_MS
    : FACE_SCAN_BASE_TRACE_MS;
  const signalDuration = reducedMotion
    ? FACE_SCAN_REDUCED_SIGNAL_HOLD_MS
    : FACE_SCAN_SIGNAL_REVEAL_MS;
  const completionHold = reducedMotion
    ? FACE_SCAN_REDUCED_COMPLETE_HOLD_MS
    : FACE_SCAN_COMPLETE_HOLD_MS;
  const setProgress = (value) => {
    if (percentNode) percentNode.textContent = `${value}%`;
    if (progress) progress.style.width = `${value}%`;
  };
  const hudStatus = hud?.querySelector('.face-hud__telemetry--top span');
  const hudDetail = hud?.querySelector('.face-hud__telemetry--top b');
  const faceEvidence = evidence?.querySelector('[data-face-evidence="face"] b');
  const poseEvidence = evidence?.querySelector('[data-face-evidence="pose"] b');
  const mapEvidence = evidence?.querySelector('[data-face-evidence="map"] b');
  const mapEvidenceLabel = evidence?.querySelector('[data-face-evidence="map"] small');

  if (!isActive() || state.faceScanRunId !== runId) return false;
  viewport?.classList.add('is-building');
  viewport?.classList.remove('is-scanning');
  if (detectedBadge) detectedBadge.hidden = false;
  if (phase) phase.textContent = 'FACE DETECTED';
  if (status) {
    status.textContent = layeredOverlayReady
      ? 'Face detected. Drawing the geometry before adding each pointer…'
      : 'Face detected. Reading each visible signal one by one…';
  }
  if (faceEvidence) faceEvidence.textContent = '✓ Detected';
  if (poseEvidence) poseEvidence.textContent = 'Frontal';
  if (mapEvidenceLabel && !layeredOverlayReady) mapEvidenceLabel.textContent = 'SIGNALS';
  if (mapEvidence) mapEvidence.textContent = layeredOverlayReady ? 'Drawing' : 'Reading';
  if (hud) hud.dataset.phase = 'mapping';
  if (hudStatus) {
    hudStatus.innerHTML = layeredOverlayReady
      ? '<i></i> DRAWING FACE GEOMETRY'
      : '<i></i> READING VISIBLE SIGNALS';
  }
  if (hudDetail) hudDetail.textContent = `0 OF ${signals.length} SIGNALS`;
  setProgress(42);

  if (layeredOverlayReady && geometryOverlay) {
    geometryOverlay.classList.add('is-pending');
    geometryOverlay.hidden = false;
    void geometryOverlay.offsetWidth;
    geometryOverlay.classList.remove('is-pending');
    geometryOverlay.classList.add('is-tracing');
    if (!(await waitForStage(baseDuration))) return false;
    geometryOverlay.classList.remove('is-tracing');
    geometryOverlay.classList.add('is-revealed');
    if (status) status.textContent = 'Base geometry mapped. Adding the detected pointers now…';
  } else {
    if (!(await waitForStage(reducedMotion ? 320 : 800))) return false;
  }
  setProgress(58);

  for (let index = 0; index < signals.length; index += 1) {
    const signal = signals[index];
    const completed = index + 1;
    const signalNode = layeredOverlayReady ? signalNodes?.get(signal.key) : null;
    if (phase) {
      phase.textContent = `${layeredOverlayReady ? 'ADDING' : 'READING'} ${completed} OF ${signals.length}`;
    }
    if (index === 0 && status) {
      status.textContent = layeredOverlayReady
        ? 'Drawing your face-frame pointer…'
        : 'Reading your face-frame signal…';
    }
    if (index === 3 && status) {
      status.textContent = layeredOverlayReady
        ? 'Adding the eye and brow pointers one by one…'
        : 'Checking the eye and brow signals one by one…';
    }
    if (index === signals.length - 1 && status) {
      status.textContent = layeredOverlayReady
        ? `Drawing the final ${signal.label.toLowerCase()} pointer and checking the full map…`
        : `Checking the final ${signal.label.toLowerCase()} signal…`;
    }
    if (signalNode) {
      signalNode.hidden = false;
      void signalNode.offsetWidth;
      signalNode.classList.add('is-revealing');
    }
    if (!(await waitForStage(signalDuration))) return false;
    signalNode?.classList.remove('is-revealing');
    signalNode?.classList.add('is-revealed');
    if (hudDetail) hudDetail.textContent = `${completed}/${signals.length} · ${signal.label.toUpperCase()}`;
    if (mapEvidence) mapEvidence.textContent = `${completed} of ${signals.length}`;
    setProgress(Math.min(94, 58 + Math.round((completed / Math.max(1, signals.length)) * 36)));
  }
  setProgress(94);

  if (!isActive()) return false;
  if (layeredOverlayReady) {
    geometryOverlay?.classList.remove('is-pending', 'is-tracing');
    geometryOverlay?.classList.add('is-revealed');
  }
  viewport?.classList.remove('is-building');
  viewport?.classList.add('is-resolved');
  if (hud) {
    hud.classList.add('is-resolved');
    hud.dataset.phase = 'resolved';
  }
  if (hudStatus) {
    hudStatus.innerHTML = layeredOverlayReady
      ? '<i></i> DETECTED GEOMETRY'
      : '<i></i> VISIBLE SIGNALS CHECKED';
  }
  if (hudDetail) hudDetail.textContent = `${mappedRows.length} SIGNALS MAPPED`;
  evidence?.classList.add('is-resolved');
  if (mapEvidence) mapEvidence.textContent = `${mappedRows.length} signals`;
  if (phase) {
    phase.textContent = layeredOverlayReady
      ? 'VISIBLE MAP COMPLETE'
      : 'FEATURE CHECK COMPLETE';
  }
  if (status) {
    status.textContent = layeredOverlayReady
      ? `${mappedRows.length} face signals mapped. Your first result is ready.`
      : `${mappedRows.length} visible signals checked. Your first result is ready.`;
  }
  setProgress(100);

  return waitForStage(completionHold);
}

async function runFaceScan() {
  if (!state.faceFile || state.faceScanRunId) return;
  cancelActiveFaceScanPresentation();
  const runId = makeId('face-scan');
  const startedAt = Date.now();
  state.faceScanRunId = runId;
  track('face_scan_started', { source: 'device_worker' });

  let percent = 8;
  let progressTimer = 0;
  let presentationStopped = false;
  let geometryLayers = null;
  const statusTimers = new Set();
  const stageWaits = new Map();
  const analysisController = new AbortController();
  const percentNode = document.getElementById('faceScanPercent');
  const progress = document.getElementById('faceScanBar');
  const status = document.getElementById('faceScanStatus');
  const phase = document.getElementById('faceScanPhase');
  const scanRoot = document.querySelector('.face-scan');
  const progressHost = document.getElementById('faceScanProgress');
  const hud = document.getElementById('faceScanHud');
  const viewport = document.querySelector('.face-scan__viewport');
  const evidence = document.getElementById('faceScanEvidence');
  const detectedBadge = document.getElementById('faceDetectedBadge');
  const errorOverlay = document.getElementById('faceScanErrorOverlay');
  const errorTitle = document.getElementById('faceScanErrorTitle');
  const errorMessage = document.getElementById('faceScanErrorMessage');
  const geometryOverlay = document.getElementById('faceScanGeometryOverlay');
  const signalHost = document.getElementById('faceScanSignalLayers');
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const isActive = () => !presentationStopped
    && state.faceScanRunId === runId
    && state.screen === 'facescan';
  const clearStatusTimers = () => {
    for (const timer of statusTimers) clearTimeout(timer);
    statusTimers.clear();
  };
  const stopProgressTimer = () => {
    if (!progressTimer) return;
    clearInterval(progressTimer);
    progressTimer = 0;
  };
  const cleanup = () => {
    if (presentationStopped) return;
    presentationStopped = true;
    analysisController.abort();
    stopProgressTimer();
    clearStatusTimers();
    for (const [timer, resolve] of stageWaits) {
      clearTimeout(timer);
      resolve(false);
    }
    stageWaits.clear();
    viewport?.classList.remove('is-scanning', 'is-building');
    geometryOverlay?.classList.remove('is-pending', 'is-tracing');
    geometryLayers?.release();
    geometryLayers = null;
    if (state.faceScanRunId === runId) state.faceScanRunId = '';
    if (activeFaceScanCleanup === cleanup) activeFaceScanCleanup = null;
  };
  const waitForStage = (delay) => new Promise((resolve) => {
    if (!isActive()) {
      resolve(false);
      return;
    }
    const timer = setTimeout(() => {
      stageWaits.delete(timer);
      resolve(isActive());
    }, Math.max(0, delay));
    stageWaits.set(timer, resolve);
  });
  const scheduleStatus = (delay, callback) => {
    const timer = setTimeout(() => {
      statusTimers.delete(timer);
      if (isActive()) callback();
    }, delay);
    statusTimers.add(timer);
  };
  activeFaceScanCleanup = cleanup;

  scheduleStatus(650, () => {
    if (status) status.textContent = 'Sweeping across the photo for one clear face…';
    if (hud) hud.dataset.phase = 'framing';
    const faceEvidence = evidence?.querySelector('[data-face-evidence="face"] b');
    if (faceEvidence) faceEvidence.textContent = 'Scanning';
  });
  scheduleStatus(1350, () => {
    if (status) status.textContent = 'Checking pose, framing and light…';
    if (hud) hud.dataset.phase = 'measuring';
    const poseEvidence = evidence?.querySelector('[data-face-evidence="pose"] b');
    if (poseEvidence) poseEvidence.textContent = 'Checking';
  });
  progressTimer = setInterval(() => {
    if (!isActive()) {
      cleanup();
      return;
    }
    percent = Math.min(38, percent + Math.max(1, Math.round((40 - percent) * 0.13)));
    if (percentNode) percentNode.textContent = `${percent}%`;
    if (progress) progress.style.width = `${percent}%`;
  }, 240);

  try {
    const response = await analyzeFacePhoto(state.faceFile, {
      signal: analysisController.signal
    });
    if (!isActive()) return;
    const analysis = faceAnalysisFromWorkerResult(response.result);
    if (analysis.observations.length < 3 || !faceAnalysisHasRequiredCoverage(analysis)) {
      const faceWorkerMessage = {
        type: 'analysis_result',
        ok: false,
        error: {
          code: 'quality',
          reasons: ['insufficient_signals']
        }
      };
      throw Object.assign(
        new Error(faceWorkerErrorMessage(faceWorkerMessage)),
        { faceWorkerMessage }
      );
    }
    const overlayReady = replaceFaceGeometryOverlay(response.overlay);
    geometryLayers = prepareFaceGeometryLayers(response.overlay);
    const signalNodes = new Map();
    const layeredOverlayReady = Boolean(
      overlayReady
      && geometryLayers
      && geometryOverlay
      && signalHost
    );
    if (layeredOverlayReady) {
      geometryOverlay.classList.add('is-pending');
      geometryOverlay.src = geometryLayers.baseUrl;
      signalHost.replaceChildren();
      for (const signal of FACE_SCAN_SIGNAL_STAGES) {
        const layer = geometryLayers.signals.get(signal.key);
        if (!layer) continue;
        const node = document.createElement('img');
        node.className = `face-scan__signal-layer face-scan__signal-layer--${layer.side}`;
        node.dataset.faceSignal = signal.key;
        node.src = layer.url;
        node.alt = '';
        node.hidden = true;
        signalHost.append(node);
        signalNodes.set(signal.key, node);
      }
      const images = [geometryOverlay, ...signalNodes.values()];
      await Promise.all(images.map(async (image) => {
        if (typeof image.decode !== 'function') return;
        try { await image.decode(); } catch (_) {}
      }));
    }
    if (!isActive()) return;
    if (!reducedMotion) {
      const remainingMinimum = Math.max(0, FACE_SCAN_MIN_SUCCESS_MS - (Date.now() - startedAt));
      if (remainingMinimum && !(await waitForStage(remainingMinimum))) return;
    }
    if (!isActive()) return;
    stopProgressTimer();
    clearStatusTimers();
    state.faceAnalysis = analysis;
    persist();
    const mappedRows = faceObservationRows();
    const presentationStartedAt = Date.now();
    const presentationComplete = await playFaceScanPresentation({
      runId,
      mappedRows,
      layeredOverlayReady,
      geometryOverlay,
      signalNodes,
      viewport,
      hud,
      evidence,
      detectedBadge,
      phase,
      status,
      percentNode,
      progress,
      waitForStage,
      isActive,
      reducedMotion
    });
    if (!presentationComplete || !isActive()) return;
    track('face_scan_completed', {
      marker_count: mappedRows.length,
      processing_ms: Number(response.processingMs || 0),
      presentation_ms: Math.max(0, Date.now() - presentationStartedAt),
      pixel_check: state.faceAnalysis?.quality?.pixelCheck || '',
      geometry_overlay: layeredOverlayReady
        ? 'detected_geometry_layered'
        : overlayReady
          ? 'detected_geometry_composite'
          : 'unavailable'
    });
    if (isActive()) go('faceproof', 'scan_complete');
  } catch (error) {
    if (!isActive()) return;
    cleanup();
    state.faceScanRunId = '';
    const message = error.message || 'The face map could not be completed. Try another photo.';
    const errorCode = String(error.faceWorkerMessage?.error?.code || 'scan_failed');
    const heading = faceWorkerErrorHeading(error.faceWorkerMessage);
    scanRoot?.classList.add('is-error');
    if (hud) hud.classList.add('is-error');
    if (viewport) viewport.classList.add('is-error');
    if (progressHost) progressHost.hidden = true;
    if (errorTitle) errorTitle.textContent = heading;
    if (errorMessage) errorMessage.textContent = message;
    if (errorOverlay) errorOverlay.hidden = false;
    requestAnimationFrame(() => document.getElementById('faceScanRetake')?.focus({ preventScroll: true }));
    track('face_scan_failed', {
      error_code: errorCode.slice(0, 80),
      reasons: (error.faceWorkerMessage?.error?.reasons || []).join('|').slice(0, 180)
    });
  } finally {
    cleanup();
  }
}

function faceMappedPhotoMarkup({
  placement = 'preview',
  rows = faceObservationRows()
} = {}) {
  if (!state.facePreviewUrl) return '';
  const isPaywall = placement === 'paywall';
  return `<figure class="face-proof__mapped-photo face-mapped-photo--${isPaywall ? 'paywall' : 'preview'}" data-testid="${isPaywall ? 'face-paywall-mapped-photo' : 'face-proof-mapped-photo'}">
    <div class="face-proof__image-frame">
      <img src="${escapeHtml(state.facePreviewUrl)}" alt="Your selected face photo${state.faceOverlayUrl ? ' with its on-device visible-marker map' : ''}" />
      <i class="face-scan__vignette" aria-hidden="true"></i>
      ${state.faceOverlayUrl ? `<img class="face-scan__geometry-overlay" src="${escapeHtml(state.faceOverlayUrl)}" alt="" />` : ''}
      ${faceScannerHudMarkup({
        locked: Boolean(state.faceOverlayUrl),
        calculated: true,
        markerCount: rows.length
      })}
    </div>
    <figcaption><span><i></i> ${state.faceOverlayUrl ? 'ON-DEVICE MAP LOCKED' : 'ON-DEVICE SIGNALS READY'}</span><b>${rows.length} visible markers found · Photo never uploaded</b></figcaption>
  </figure>`;
}

function facePaywallMapMarkup() {
  const rows = faceObservationRows();
  const signature = faceVisualSignature();
  const [leading] = faceCanonicalPreviewProfiles(state.faceAnalysis);
  const [primary, secondary] = signature.features;
  return `<section class="face-paywall-map" data-testid="face-paywall-map">
    <header class="face-paywall-map__head">
      <small>Your private face map · ${rows.length} visible markers</small>
      <h2>This feature combination shaped your first-impression result.</h2>
    </header>
    ${faceMappedPhotoMarkup({ placement: 'paywall', rows }) || `<div class="face-paywall-map__memory-note"><i>✓</i><div><b>Your private feature map is still ready</b><span>The photo left this tab after refresh; only the bounded feature labels remain in this reading.</span></div></div>`}
    <div class="face-paywall-map__copy">
      <h3>Two visible cues shape the first glance in this photo.</h3>
      <p>${escapeHtml(signature.lede)}</p>
    </div>
    <div class="face-paywall-map__signals" aria-label="Your strongest mapped face features">
      <div><small>What stands out first</small><b>${escapeHtml(primary?.feature || 'Visible face pattern')}</b></div>
      <div><small>What reinforces the impression</small><b>${escapeHtml(secondary?.feature || 'Cohesive feature rhythm')}</b></div>
      <div><small>Possible first-glance signal</small><b>${escapeHtml(leading?.firstImpression || 'This portrait may create a clear first-glance signal.')}</b></div>
    </div>
    <div class="face-paywall-map__impression">
      <small>A photo-specific reflection</small>
      <b>${escapeHtml(leading?.label || 'Your leading first-impression pattern')}</b>
      <p>${escapeHtml(leading?.summary || 'This is a possible impression from one portrait, not a fact about your personality.')}</p>
    </div>
    <div class="face-paywall-map__bridge"><b>You have the leading result—not the complete answer.</b> One mapped feature reinforces the first impression while another changes it. Part 1 explains that interaction marker by marker; Part 2 reveals where and when the pattern matters most.</div>
  </section>`;
}

function facePaywallChaptersMarkup() {
  const markerCount = faceObservationRows().length;
  const pricingView = facePaywallPricingView();
  const timelineBadge = pricingView.isLegacyAssigned
    ? pricingView.isHolistic ? 'Included in your assigned report' : 'Available in a new combined report'
    : `+₹${formatInrAmount(FACE_LIFETIME_UPGRADE_PRICE_INR)}`;
  return `<section class="face-paywall-chapters" data-testid="face-paywall-chapters">
    <header><small>Your Face Reading + optional timing add-on</small><h2>The face answers stand alone. Your birth details add timing.</h2><p>Part 1 explains possible first impressions, daily-life impact and practical experiments. Part 2 adds a separate astrology and numerology timeline.</p></header>
    <div>
      <article data-report-part="face-reading">
        <span>Part 1</span>
        <small>Detailed Face Reading</small>
        <h3>What your ${markerCount || 'mapped'} visible markers mean together</h3>
        <ul><li>Your likely first-glance signal</li><li>Six daily-life impact answers</li><li>Possible misunderstandings + useful actions</li><li>Visible evidence and clearly labelled cultural lenses</li></ul>
      </article>
      <article data-report-part="life-timeline">
        <span>${escapeHtml(timelineBadge)}</span>
        <small>Optional astrology + numerology timeline</small>
        <h3>The separate “when and what next” layer</h3>
        <ul><li>Your next three important phases</li><li>Six personal life-area timelines</li><li>Face + Vedic chart + Chaldean numbers</li><li>The key period and preparation for each area</li></ul>
      </article>
    </div>
  </section>`;
}

function facePaywallPricingView({
  hasReading = Boolean(state.readingId),
  reportType = state.faceReportType,
  assignedPricing = currentPricing(),
  personalityPrice = FACE_PERSONALITY_REPORT_PRICE_INR,
  lifetimePrice = FACE_LIFETIME_REPORT_PRICE_INR
} = {}) {
  const isHolistic = reportType === 'holistic';
  const expectedAmount = Number(isHolistic ? lifetimePrice : personalityPrice);
  const assignedAmount = Number(assignedPricing?.amount);
  const hasUsableAssignedAmount = Number.isFinite(assignedAmount) && assignedAmount > 0;
  return {
    pricing: assignedPricing,
    isHolistic,
    assignedAmount: hasUsableAssignedAmount ? assignedAmount : expectedAmount,
    expectedAmount,
    isLegacyAssigned: Boolean(
      hasReading
      && hasUsableAssignedAmount
      && Number.isFinite(expectedAmount)
      && Math.abs(assignedAmount - expectedAmount) >= 0.01
    )
  };
}

function facePaywallPriceBreakdownMarkup() {
  const pricingView = facePaywallPricingView();
  if (pricingView.isLegacyAssigned) {
    return `<section class="face-paywall-price" data-testid="face-paywall-price-breakdown">
      <div class="face-paywall-price__total"><span>${pricingView.isHolistic ? 'Your assigned Face Reading + Life Timeline subtotal' : 'Your assigned Face Reading subtotal'}</span><b>${prePayPricePairMarkup(pricingView.assignedAmount, pricingView.pricing)}</b></div>
      <small>This reading keeps the original price assigned when it was created.</small>
    </section>`;
  }
  if (!pricingView.isHolistic) {
    return `<section class="face-paywall-price" data-testid="face-paywall-price-breakdown">
      <div class="face-paywall-price__total"><span>Your Face Reading subtotal</span><b>${prePayPricePairMarkup(pricingView.assignedAmount, pricingView.pricing)}</b></div>
    </section>`;
  }
  return `<section class="face-paywall-price" data-testid="face-paywall-price-breakdown">
    <div><span>Detailed Face Reading</span><b>${prePayPricePairMarkup(FACE_PERSONALITY_REPORT_PRICE_INR, FACE_PERSONALITY_PRICING)}</b></div>
    <div><span>Astrology + numerology timeline add-on</span><b>+${prePayPricePairMarkup(FACE_LIFETIME_UPGRADE_PRICE_INR, FACE_LIFETIME_PRICING)}</b></div>
    <div class="face-paywall-price__total"><span>Your combined subtotal</span><b>${prePayPricePairMarkup(FACE_LIFETIME_REPORT_PRICE_INR, FACE_LIFETIME_PRICING)}</b></div>
  </section>`;
}

function enhanceFacePaywall() {
  if (state.lane !== 'face_answers' || state.screen !== 'unlock' || state.paid) return;
  const paywall = stage.querySelector('.face-paywall[data-testid="unlock-view"]');
  if (!paywall || paywall.querySelector('[data-testid="face-paywall-map"]')) return;
  const anchor = paywall.querySelector('.personal-proof');
  if (anchor) {
    anchor.insertAdjacentHTML('beforebegin', `${facePaywallMapMarkup()}${facePaywallChaptersMarkup()}${facePaywallPriceBreakdownMarkup()}`);
    return;
  }
  const subtitle = paywall.querySelector('.unlock-subtitle');
  subtitle?.insertAdjacentHTML('afterend', `${facePaywallMapMarkup()}${facePaywallChaptersMarkup()}${facePaywallPriceBreakdownMarkup()}`);
}

function renderFaceProof() {
  if (!state.faceAnalysis) {
    go('intro', 'missing_face_map');
    return;
  }
  const rows = faceObservationRows();
  const signature = faceVisualSignature();
  const personality = faceCanonicalPreviewProfiles(state.faceAnalysis);
  const leading = personality[0] || {};
  const busy = state.faceCheckoutPreparing || state.checkoutLoading;
  const includeTimeline = state.faceReportType === 'holistic';
  const selectedPrice = includeTimeline
    ? FACE_LIFETIME_REPORT_PRICE_INR
    : FACE_PERSONALITY_REPORT_PRICE_INR;
  const selectedPricing = includeTimeline ? FACE_LIFETIME_PRICING : FACE_PERSONALITY_PRICING;
  const checkoutAction = includeTimeline ? 'continue-face-holistic' : 'unlock-face-personality';
  const mappedPhoto = faceMappedPhotoMarkup({ placement: 'preview', rows })
    || `<div class="face-proof__map-memory"><i>✓</i><div><b>Your private map is ready</b><span>The photo left this tab after refresh; only the mapped feature labels remain.</span></div></div>`;
  show(`<div class="face-proof" data-testid="face-proof">
    <header class="face-proof__result-head">
      <small>Map complete</small>
      <b>${rows.length} visible markers locked on-device</b>
    </header>
    ${mappedPhoto}
    <section class="face-proof__teaser" data-testid="face-personality-preview">
      <small>Your first result</small>
      <h1>${escapeHtml(leading.label || 'Your strongest pattern is ready')}</h1>
      <p><b>${escapeHtml(leading.firstImpression || 'Your first-glance signal is ready.')}</b> ${escapeHtml(leading.summary || signature.lede)}</p>
      <div class="face-proof__method"><b>Visible measurement</b> → possible first impression → practical experiment. A photo signal is not a personality fact.</div>
      <div class="face-proof__locked-hooks" aria-label="Locked parts of your detailed Face Reading">
        <span><i>🔒</i><b>Where this signal helps—and where it gets misunderstood</b></span>
        <span><i>🔒</i><b>Six answers for decisions, communication, relationships and work</b></span>
        <span><i>🔒</i><b>Small actions that can change the signal from the same face</b></span>
      </div>
    </section>
    <section class="face-proof__offer" data-testid="face-report-choices">
      <header><small>Your complete Face Reading</small><h2>Open the answer behind the first glance.</h2><p>Six impact-first answers, possible misunderstandings, actions and visible evidence. No birth details needed.</p></header>
      <div class="face-proof__base-line"><span><b>Detailed Face Reading</b><small>One-time · PDF included</small></span><strong>${prePayPricePairMarkup(FACE_PERSONALITY_REPORT_PRICE_INR, FACE_PERSONALITY_PRICING)}</strong></div>
      <ul class="face-proof__offer-list"><li>Likely first-glance signal and lived impact</li><li>Six daily-life answers with one action each</li><li>Indian and Chinese cultural reflections, clearly separated from visible measurement</li><li>Same-face, different-signal photo experiments</li></ul>
      <label class="face-addon ${includeTimeline ? 'is-selected' : ''}">
        <input type="checkbox" data-face-timeline-toggle ${includeTimeline ? 'checked' : ''} ${busy ? 'disabled' : ''} />
        <span class="face-addon__check" aria-hidden="true"></span>
        <span class="face-addon__copy"><b>Add my astrology + numerology life timeline</b><small>Birth details are asked only after you choose this add-on. Get three important phases and six life-area timelines.</small></span>
        <strong class="face-addon__price">+₹${escapeHtml(formatInrAmount(FACE_LIFETIME_UPGRADE_PRICE_INR))}</strong>
      </label>
      <div class="face-proof__subtotal"><span>${includeTimeline ? 'Combined subtotal' : 'Your subtotal'}</span><b>${prePayPricePairMarkup(selectedPrice, selectedPricing)}</b></div>
      <button class="primary-button face-proof__unlock" type="button" data-action="${checkoutAction}" ${busy ? 'disabled' : ''}>${state.faceCheckoutPreparing ? 'Preparing secure checkout…' : state.checkoutLoading ? 'Opening secure payment…' : includeTimeline ? 'Continue and add my birth details' : 'Open my complete Face Reading'}</button>
      <small class="face-proof__offer-note">${includeTimeline ? 'About 1 minute more · Birth time is optional' : 'No birth date, time or place needed'}</small>
    </section>
    ${state.paymentError ? `<div class="error-card" data-testid="payment-error">${escapeHtml(state.paymentError)}</div>` : ''}
    <button class="text-button" type="button" data-action="retry-face">Use another photo</button>
    <div class="face-landing__privacy">✓ Your photo stays in this tab only · It is never uploaded or stored</div>
  </div>`);
}

function resetFaceReadingChoice() {
  state.readingId = null;
  state.preview = null;
  state.full = null;
  state.pendingInvoice = null;
  state.pricing = RUNTIME_PRICING;
  state.paymentError = '';
  state.pendingVerification = null;
  state.activePaymentId = '';
  state.checkoutAuthoritativeValue = 0;
  state.checkoutQuoteVersion = '';
  state.checkoutGstRateBps = 0;
}

async function startFacePersonalityCheckout() {
  if (state.faceCheckoutPreparing || state.checkoutLoading || state.paid) return;
  const currentProductKey = state.preview?.product?.key || '';
  if (state.readingId && currentProductKey !== 'face_personality') resetFaceReadingChoice();
  state.faceReportType = 'personality';
  state.faceCheckoutPreparing = true;
  state.paymentError = '';
  track('face_report_path_selected', {
    report_type: 'personality',
    marker_count: faceObservationRows().length
  });
  persist();
  render();
  try {
    if (!state.readingId) await ensurePreview();
    state.faceCheckoutPreparing = false;
    persist();
    await startCheckout('faceproof_personality');
  } catch (error) {
    state.faceCheckoutPreparing = false;
    state.checkoutLoading = false;
    state.paymentError = error.message || 'Secure checkout could not be prepared. Please try again.';
    persist();
    render();
  }
}

function continueFaceHolisticReport() {
  if (state.faceCheckoutPreparing || state.checkoutLoading || state.paid) return;
  if (state.readingId && state.preview?.product?.key === 'face_personality') resetFaceReadingChoice();
  state.faceReportType = 'holistic';
  track('face_report_path_selected', {
    report_type: 'holistic',
    marker_count: faceObservationRows().length
  });
  // Keep only the tab-local object URLs long enough to repeat the mapped face
  // on the later paywall. The scan payload contains bounded labels only.
  state.faceFile = null;
  state.faceImageSize = null;
  persist();
  next();
}

async function resetFaceForRetry() {
  cancelActiveFaceScanPresentation();
  state.faceScanRunId = '';
  persist();
  await openFaceCamera({ fallbackInputId: 'faceRetryInput' });
}

// The palm scan and the palm result are one continuous surface: the same photo
// element stays mounted while only the head copy and the block under the photo
// change. Anything that rebuilds the frame re-decodes the photo, replays the
// screen-in animation and throws the reader back to the top of the page.
const PALM_STAGE_MOTION_MS = 420;
let palmProofMorphFromScan = false;

function palmStageReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);
}

function palmStageScroller() {
  return app.scrollHeight > app.clientHeight + 1 ? app : window;
}

// No fill on the entrance keyframes: a hidden tab freezes the animation timeline,
// and a held first frame would leave the swapped-in copy invisible until the tab
// comes back into view.
function animatePalmStageIn(node, { duration = PALM_STAGE_MOTION_MS, distance = 10 } = {}) {
  if (!node || typeof node.animate !== 'function' || palmStageReducedMotion()) return;
  node.animate(
    [{ opacity: 0, transform: `translate3d(0, ${distance}px, 0)` }, { opacity: 1, transform: 'none' }],
    { duration, easing: 'cubic-bezier(0.22, 0.75, 0.24, 1)' }
  );
}

// Removal runs off a timer rather than the animation's finish event for the same
// reason: a frozen timeline must never strand a scan artefact over the result.
function retirePalmStageNode(node, duration = 300) {
  if (!node) return;
  if (typeof node.animate !== 'function' || palmStageReducedMotion()) {
    node.remove();
    return;
  }
  node.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: 'ease-out', fill: 'forwards' });
  setTimeout(() => node.remove(), duration);
}

function palmStageFrameMarkup({ alt = 'Your uploaded left-palm photo', scanLine = false, badge = '', badgeLocked = false, overlay = '' } = {}) {
  return `<div class="palm-frame palm-frame--scan" id="palmStageFrame"><img id="scanPalmImage" src="${escapeHtml(state.palmPreviewUrl)}" alt="${escapeHtml(alt)}" />${scanLine ? '<span class="scan-line" id="palmScanLine"></span>' : ''}<div id="livePalmOverlay">${overlay}</div><div class="scan-geometry-badge${badgeLocked ? ' is-locked' : ''}" id="scanGeometryBadge"><i></i><span>${badge || 'Checking your photo'}</span></div></div>`;
}

function palmStageMarkup({ kicker, title, frame, body }) {
  return `<div class="palm-stage-head" id="palmStageHead"><div class="kicker center">${kicker}</div>
    <h1 class="question-title center scan-title">${title}</h1></div>
    ${frame}
    <div class="palm-stage-body" id="palmStageBody">${body}</div>`;
}

function ensurePalmStageFrameVisible(frame) {
  if (!frame) return;
  const viewport = window.visualViewport;
  const appRect = app.getBoundingClientRect();
  const viewportTop = Number(viewport?.offsetTop || 0);
  const viewportBottom = viewportTop + Number(viewport?.height || window.innerHeight);
  const visibleTop = Math.max(appRect.top, viewportTop) + 76;
  const visibleBottom = Math.min(appRect.bottom, viewportBottom) - 16;
  const rect = frame.getBoundingClientRect();
  let delta = 0;
  if (rect.height > visibleBottom - visibleTop || rect.top < visibleTop) delta = rect.top - visibleTop;
  else if (rect.bottom > visibleBottom) delta = rect.bottom - visibleBottom;
  if (Math.abs(delta) < 2) return;
  palmStageScroller().scrollBy({ top: delta, behavior: palmStageReducedMotion() ? 'auto' : 'smooth' });
}

// Pins the photo to the exact viewport position it already occupied, so a taller
// or shorter head block never drags it out from under the reader's eye.
function holdPalmStageFrameInPlace(frame, anchorTop) {
  requestAnimationFrame(() => {
    if (!frame.isConnected) return;
    const drift = frame.getBoundingClientRect().top - anchorTop;
    if (Math.abs(drift) >= 1) palmStageScroller().scrollBy({ top: drift, behavior: 'auto' });
    requestAnimationFrame(() => ensurePalmStageFrameVisible(frame));
  });
}

function morphPalmScanStageIntoProof({ kicker, title, alt, badge, body, keepsMountOverlay }) {
  const section = stage.querySelector('.screen');
  const head = document.getElementById('palmStageHead');
  const frame = document.getElementById('palmStageFrame');
  const stageBody = document.getElementById('palmStageBody');
  const image = document.getElementById('scanPalmImage');
  if (!section || !head || !frame || !stageBody || !image) return false;
  if (image.getAttribute('src') !== state.palmPreviewUrl) return false;

  const anchorTop = frame.getBoundingClientRect().top;
  section.setAttribute('data-testid', `screen-${state.screen}`);
  if (alt) image.setAttribute('alt', alt);
  retirePalmStageNode(document.getElementById('palmScanLine'), 320);
  retirePalmStageNode(frame.querySelector('.palm-landmark-overlay'), 420);
  if (!keepsMountOverlay) retirePalmStageNode(frame.querySelector('.palm-mount-overlay'), 320);
  const badgeLabel = badge ? document.getElementById('scanGeometryBadge')?.querySelector('span') : null;
  if (badgeLabel) badgeLabel.textContent = badge;

  head.innerHTML = `<div class="kicker center">${kicker}</div>
    <h1 class="question-title center scan-title">${title}</h1>`;
  animatePalmStageIn(head, { duration: 380, distance: 8 });
  stageBody.innerHTML = body;
  animatePalmStageIn(stageBody, { duration: 520, distance: 14 });

  holdPalmStageFrameInPlace(frame, anchorTop);
  requestViewportSync();
  return true;
}

function renderPalmScan() {
  if (!state.palmFile) {
    if (state.palmDetection) {
      go('palmproof', 'resume');
      return;
    }
    go(palmCaptureScreen(), 'missing_photo');
    return;
  }
  show(palmStageMarkup({
    kicker: 'Palm photo check',
    title: 'Checking the lines in your photo…',
    frame: palmStageFrameMarkup({ scanLine: true }),
    body: `<div class="scan-progress-focus" id="scanProgressFocus">
      <div class="scan-readout-head"><span id="scanPhase">CHECKING PHOTO</span><b class="scan-percent" id="scanPercent">8%</b></div>
      <div class="scan-progress"><i id="scanBar"></i></div>
      <p class="small-note scan-status" id="scanStatus" role="status" aria-live="polite" aria-atomic="true">Finding the hand and checking line visibility…</p>
      <div class="scan-evidence" id="scanEvidence" aria-live="off">
        <span><small>HAND POINTS</small><b>Checking</b></span>
        <span><small>VISIBLE LINES</small><b>Checking</b></span>
        <span><small>PALM ZONES</small><b>Waiting for hand points</b></span>
      </div>
    </div>
    <div id="scanError"></div>`
  }));
  const image = document.getElementById('scanPalmImage');
  if (image) {
    const rememberSize = () => {
      state.palmImageSize = { width: image.naturalWidth || 720, height: image.naturalHeight || 960 };
      ensurePalmScanProgressVisible();
    };
    if (image.complete) rememberSize();
    else image.addEventListener('load', rememberSize, { once: true });
  }
  ensurePalmScanProgressVisible();
  setTimeout(ensurePalmScanProgressVisible, 360);
  requestAnimationFrame(runPalmScan);
}

async function runPalmScan() {
  if (!state.palmFile || state.scanRunId) return;
  const runId = makeId('scan');
  state.scanRunId = runId;
  const started = Date.now();
  let percent = 8;
  const percentNode = document.getElementById('scanPercent');
  const bar = document.getElementById('scanBar');
  const status = document.getElementById('scanStatus');
  const phase = document.getElementById('scanPhase');
  const badge = document.getElementById('scanGeometryBadge');
  const evidence = document.getElementById('scanEvidence');
  const messages = [
    [1600, 'Finding the hand and checking line visibility…'],
    [3400, 'Checking which major lines are clear enough to use…'],
    [5600, 'Checking the hand reference points…'],
    [7600, 'Preparing the detected lines for review…']
  ];
  const messageTimers = messages.map(([delay, text]) => setTimeout(() => {
    if (state.scanRunId === runId && status && !state.palmDetection) status.textContent = text;
  }, delay));
  const progressTimer = setInterval(() => {
    percent = Math.min(92, percent + Math.max(1, Math.round((94 - percent) * 0.07)));
    if (percentNode) percentNode.textContent = `${percent}%`;
    if (bar) bar.style.width = `${percent}%`;
  }, 230);

  try {
    const image = document.getElementById('scanPalmImage');
    const imageReady = (async () => {
      if (!image) return;
      if (!image.complete && typeof image.decode === 'function') {
        try { await image.decode(); } catch (_) {}
      }
      if (image.naturalWidth && image.naturalHeight) {
        state.palmImageSize = { width: image.naturalWidth, height: image.naturalHeight };
      }
    })();
    const result = await detectPalm();
    await imageReady;
    if (state.scanRunId !== runId || state.screen !== 'palmscan') {
      clearInterval(progressTimer);
      messageTimers.forEach(clearTimeout);
      return;
    }
    state.palmDetection = result;
    persist();
    const landmarkPoints = palmScanLandmarkPoints(result);
    const landmarkCount = landmarkPoints.length || palmLandmarkCount(result);
    const lineCount = palmLineNames(result).length;
    const overlay = document.getElementById('livePalmOverlay');
    if (overlay) overlay.innerHTML = `${palmLandmarkOverlaySvg(result, { animate: true })}${palmOverlaySvg(result)}${palmMountOverlaySvg(result, { animate: true })}`;
    ensurePalmScanProgressVisible();
    const mountZones = palmMountZones(result);
    if (phase) phase.textContent = landmarkPoints.length === 21 ? 'HAND POINTS FOUND' : 'VISIBLE LINES FOUND';
    if (badge) {
      badge.classList.add('is-locked');
      badge.querySelector('span').textContent = landmarkPoints.length === 21 ? '21 hand points found' : 'Palm lines found';
    }
    if (status) status.textContent = landmarkPoints.length === 21
      ? '21 hand points found. Mapping your Palm lines now…'
      : 'Palm lines found. Preparing your result…';
    if (evidence) {
      evidence.classList.add('is-resolved');
      evidence.innerHTML = `<span style="--evidence-delay:0s"><small>HAND POINTS</small><b>${landmarkCount} found</b></span>
        <span style="--evidence-delay:.16s"><small>VISIBLE LINES</small><b>Mapped</b></span>
        <span style="--evidence-delay:.32s"><small>PALM ZONES</small><b>${mountZones.length ? `${mountZones.length} placed` : 'Standard guide'}</b></span>`;
    }
    messageTimers.push(setTimeout(() => {
      if (state.scanRunId !== runId || !status) return;
      if (phase) phase.textContent = 'VISIBLE LINES CHECKED';
      status.textContent = 'Palm lines mapped from the photo.';
    }, 1250));
    messageTimers.push(setTimeout(() => {
      if (state.scanRunId !== runId || !status) return;
      if (phase) phase.textContent = 'PALM ZONES CHECKED';
      status.textContent = mountZones.length
        ? `${mountZones.length} traditional palm zones placed using the detected hand points.`
        : 'The visible lines are ready. Adding the standard palm-zone guide.';
    }, 2350));
    track('palm_detected', {
      line_count: lineCount,
      hand_points: palmLandmarkCount(result),
      mount_zones: mountZones.length,
      mount_geometry: mountZones.length === PALM_MOUNT_DEFINITIONS.length ? 'hand_landmarks' : 'standard_guide'
    });
    // Keep the real returned paths visible long enough to finish drawing even
    // when the provider responds near the end of the scan sequence.
    const remaining = Math.max(3400, 9000 - (Date.now() - started));
    await new Promise((resolve) => setTimeout(resolve, remaining));
    if (state.scanRunId !== runId || state.screen !== 'palmscan') {
      clearInterval(progressTimer);
      messageTimers.forEach(clearTimeout);
      return;
    }
    clearInterval(progressTimer);
    messageTimers.forEach(clearTimeout);
    if (percentNode) percentNode.textContent = '100%';
    if (bar) bar.style.width = '100%';
    if (phase) phase.textContent = 'PALM PHOTO CHECK COMPLETE';
    if (status) status.textContent = mountZones.length
      ? 'Your Palm lines are mapped, and the palm zones are placed using your hand points.'
      : 'Your Palm lines are mapped. The standard palm-zone guide is ready.';
    if (badge) badge.querySelector('span').textContent = mountZones.length
      ? `${landmarkCount} points · Palm lines mapped · ${mountZones.length} zones`
      : `${landmarkCount} points · Palm lines mapped · standard guide`;
    state.scanRunId = '';
    setTimeout(() => {
      if (state.screen !== 'palmscan') return;
      palmProofMorphFromScan = true;
      go('palmproof', 'scan_complete');
      palmProofMorphFromScan = false;
    }, 700);
  } catch (error) {
    clearInterval(progressTimer);
    messageTimers.forEach(clearTimeout);
    if (state.scanRunId !== runId) return;
    state.scanRunId = '';
    track('palm_detection_failed', { message: String(error.message || error).slice(0, 160) });
    const errorHost = document.getElementById('scanError');
    if (percentNode) percentNode.textContent = 'Not detected';
    if (bar) bar.style.width = '0%';
    if (status) status.textContent = state.lane === 'market_profile'
      ? 'This photo did not show enough visible lines for the optional cross-check.'
      : 'We could not detect enough clear lines in this photo.';
    if (errorHost) errorHost.innerHTML = state.lane === 'market_profile'
      ? `<div class="error-card" data-testid="palm-error">This photo needs another try before we can add the palm cross-check. Your core chart-and-number profile is still ready.</div><button class="primary-button" type="button" data-action="retry-palm">Try another palm photo</button><button class="text-button" type="button" data-action="skip-market-palm">Skip palm — continue to my profile</button>`
      : `<div class="error-card" data-testid="palm-error">${escapeHtml(error.message || 'We could not read the major lines clearly. Try a brighter, straighter photo.')}</div><button class="primary-button" type="button" data-action="retry-palm">Take another photo</button>`;
  }
}

function palmScanPreviewResult() {
  return {
    hand_points: [
      [220, 282], [198, 237], [178, 211], [160, 183], [149, 161],
      [212, 190], [203, 146], [198, 106], [195, 80],
      [237, 185], [234, 134], [232, 89], [230, 62],
      [261, 191], [265, 148], [268, 112], [268, 87],
      [282, 205], [294, 174], [302, 151], [306, 131]
    ],
    is_flipped: false
  };
}

function palmProofPreviewResult() {
  return {
    ...palmScanPreviewResult(),
    provider: 'local_visual_preview',
    overlay_supported: true,
    original_lines: {
      love: [[149, 166], [184, 157], [221, 157], [258, 164], [291, 171]],
      head: [[151, 184], [188, 180], [225, 183], [267, 191]],
      life: [[174, 166], [155, 190], [153, 221], [169, 249], [194, 264]],
      fate: [[225, 258], [226, 225], [226, 193], [229, 165]]
    }
  };
}

function renderPalmProofPreview() {
  state.lane = 'palm_answers';
  state.resolvedAngle = 'palm_answers';
  state.rawAngle = 'palm_answers';
  state.screen = 'palmproof';
  state.palmPreviewUrl = PALM_SCAN_ASSET_URL;
  state.palmImageSize = { width: 440, height: 311 };
  state.palmDetection = palmProofPreviewResult();
  renderPalmProof();
}

function renderPalmScanPreview() {
  state.palmImageSize = { width: 440, height: 311 };
  const result = palmScanPreviewResult();
  show(`<div class="kicker center">Palm photo check</div>
    <h1 class="question-title center scan-title">Checking your hand, point by point…</h1>
    <p class="question-sub center">We check 21 hand points before placing the visible lines and traditional palm zones.</p>
    <div class="palm-frame palm-frame--scan palm-scan-preview">
      <img class="palm-scan-preview-image" src="${escapeHtml(PALM_SCAN_ASSET_URL)}" alt="Animated palm scan example" width="440" height="311" />
      ${palmLandmarkOverlaySvg(result)}
      ${palmMountOverlaySvg(result)}
      <div class="scan-geometry-badge is-locked"><i></i><span>21 hand points found</span></div>
    </div>
    <div class="scan-progress-focus">
      <div class="scan-readout-head"><span>HAND POINTS FOUND</span><b class="scan-percent">68%</b></div>
      <div class="scan-progress"><i style="width:68%"></i></div>
      <p class="small-note scan-status">The fingertips, joints and finger bases are placed. Now checking the visible palm lines.</p>
      <div class="scan-evidence is-resolved">
        <span style="--evidence-delay:0s"><small>HAND MAP</small><b>21 reference points</b></span>
        <span style="--evidence-delay:.16s"><small>VISIBLE LINES</small><b>Detected paths only</b></span>
        <span style="--evidence-delay:.32s"><small>PALM ZONES</small><b>7 placed</b></span>
      </div>
    </div>
    <div class="proof-card proof-card--compact scan-preview-note"><b>What happens with your photo</b><span>The 21 markers appear briefly, then fade. Only the detected palm lines and placed palm zones remain on the result.</span></div>`);
}

let palmResultCtaObserver = null;

function setupPalmResultCtaExposure() {
  palmResultCtaObserver?.disconnect?.();
  palmResultCtaObserver = null;
  if (LOCAL_VISUAL_PREVIEW || state.lane !== 'palm_answers' || state.screen !== 'palmproof') return;
  const button = stage.querySelector('[data-action="accept-palm"][data-placement="after_summary"]');
  if (!button) return;
  const recordView = (visibility) => trackOnce(
    'palmResultCtaView',
    'palm_result_cta_view',
    {
      placement: 'after_summary',
      visibility_threshold: 0.5,
      visibility_percent: Math.round(Number(visibility || 0.5) * 100),
      palm_result_cta_version: PALM_RESULT_CTA_VERSION,
      mapped_lines: palmLineNames().length
    }
  );
  if (typeof window.IntersectionObserver === 'function') {
    try {
      palmResultCtaObserver = new IntersectionObserver((entries, observer) => {
        const entry = entries.find((candidate) =>
          candidate.target === button
          && candidate.isIntersecting
          && candidate.intersectionRatio >= 0.5);
        if (!entry) return;
        recordView(entry.intersectionRatio);
        observer.disconnect();
        palmResultCtaObserver = null;
      }, { root: app, threshold: [0.5] });
      palmResultCtaObserver.observe(button);
      return;
    } catch (_) {
      palmResultCtaObserver?.disconnect?.();
      palmResultCtaObserver = null;
    }
  }
  const visibility = elementVisibilityWithinApp(button);
  if (visibility >= 0.5) recordView(visibility);
}

function renderPalmProof() {
  const names = palmLineNames();
  if (!names.length) {
    if (state.lane === 'market_profile') {
      show(`<div class="kicker center">Optional palm cross-check</div>
        <h1 class="question-title center">This photo needs another try.</h1>
        <p class="question-sub center">Your chart-and-number profile is already ready. Retake the photo to add the palm layer, or continue now without it.</p>
        <button class="primary-button" type="button" data-action="retry-palm">Try another palm photo</button>
        <button class="text-button" type="button" data-action="skip-market-palm">Skip palm — continue to my profile</button>`);
      return;
    }
    show(`<div class="kicker center">Palm photo result</div>
      <h1 class="question-title center">We could not read the major lines clearly.</h1>
      <p class="question-sub center">Take a brighter photo with your full left palm straight and in focus. We will not create a Palm Reading without readable lines.</p>
      <button class="primary-button" type="button" data-action="retry-palm">Take another photo</button>`);
    return;
  }
  const landmarks = palmLandmarkCount();
  const detectedLines = palmLineList();
  const lineLabels = { love: 'Heart', heart: 'Heart', head: 'Head', life: 'Life', fate: 'Fate' };
  const mappedLines = palmLines();
  const overlayLines = palmOverlayLines();
  const overlayKeys = new Set(Object.entries(overlayLines).filter(([, points]) => Array.isArray(points) && points.length >= 2).map(([key]) => key));
  const lineLegend = Object.entries(mappedLines).filter(([, points]) => Array.isArray(points) && points.length >= 2)
    .map(([key]) => `<span><i style="--legend-color:${({ love: '#a45168', heart: '#a45168', head: '#b17c31', life: '#28796e', fate: '#6c6090' })[key] || '#9c6d2d'}"></i><b>${lineLabels[key] || escapeHtml(key)}</b></span>`).join('');
  const overlayNote = overlayKeys.size < names.length
    ? 'Some detected lines could not be placed reliably on the original photo, so they are listed below instead.'
    : 'Each detected line is shown on your photo.';
  const mountZones = palmMountZones();
  const hasAlignedZones = mountZones.length === PALM_MOUNT_DEFINITIONS.length;
  const overlay = `${palmOverlaySvg()}${hasAlignedZones ? palmMountOverlaySvg() : ''}`;
  const fallbackGuide = hasAlignedZones ? '' : `<p class="palm-proof-helper">We could not place the palm zones reliably on this photo, so the standard left-palm guide is shown below.</p>${palmMountGuideVisual()}`;
  const marketPalm = state.lane === 'market_profile';
  const kicker = marketPalm ? 'Palm layer ready' : 'Palm photo result';
  const title = marketPalm
    ? 'Your mapped lines can now add supporting context.'
    : `We found ${names.length} clear ${names.length === 1 ? 'line' : 'lines'} in your palm.`;
  const badge = hasAlignedZones
    ? `${landmarks} points · Palm lines mapped · ${mountZones.length} zones`
    : `${landmarks ? `${landmarks} points · ` : ''}Palm lines mapped · standard guide`;
  // Everything below the photo. The scan screen swaps its progress readout for
  // exactly this block, so the photo itself never leaves the page.
  const body = `<p class="question-sub center">${marketPalm ? `The ${escapeHtml(detectedLines)} ${names.length === 1 ? 'was' : 'were'} clear enough to use. We’ll place only ${names.length === 1 ? 'this visible line' : 'these visible lines'} beside your chart-and-number result.` : `The ${escapeHtml(detectedLines)} ${names.length === 1 ? 'was' : 'were'} clear enough to use. We’ll use only ${names.length === 1 ? 'this visible line' : 'these visible lines'} in your reading.`}</p>
    <div class="palm-proof-primary-action">
      <button class="primary-button" type="button" data-action="accept-palm" data-placement="after_summary">${state.lane === 'palm_answers' ? 'Continue to my birth details' : 'Add this palm layer to my profile'}</button>
      <span>${state.lane === 'palm_answers' ? 'Next: date, time and place of birth' : 'Next: finish your profile'}</span>
    </div>
    ${lineLegend ? `<div class="palm-map-legend" aria-label="Detected palm lines">${lineLegend}</div>` : ''}
    ${fallbackGuide}
    <div class="mount-map-heading"><b>Traditional palm zones</b><span>${hasAlignedZones ? 'Placed using your hand points' : 'Standard left-palm guide'}</span></div>
    ${palmMountLegend()}
    <div class="proof-card proof-card--compact"><b>${marketPalm ? 'What this adds to your profile' : `Your Palm reading: ${escapeHtml(detectedLines)}`}</b><span>${marketPalm ? `${escapeHtml(overlayNote)} These themes will sit alongside your core result as a supporting perspective on decisions, pressure and follow-through.${landmarks ? ` We also found ${landmarks} hand reference points.` : ''}` : `${escapeHtml(overlayNote)} Your complete report will turn these lines into clear answers and important periods. Traditional palm themes are personal guidance, not a medical assessment.${landmarks ? ` We also found ${landmarks} hand reference points.` : ''}`}</span></div>
    <button class="text-button" type="button" data-action="retry-palm">${marketPalm ? 'Use a different photo' : 'Take another photo'}</button>`;
  const alt = `Your left palm with the detected ${detectedLines} marked`;
  if (
    palmProofMorphFromScan
    && state.palmPreviewUrl
    && morphPalmScanStageIntoProof({ kicker, title, alt, badge, body, keepsMountOverlay: hasAlignedZones })
  ) {
    requestAnimationFrame(setupPalmResultCtaExposure);
    return;
  }
  show(palmStageMarkup({
    kicker,
    title,
    frame: state.palmPreviewUrl ? palmStageFrameMarkup({ alt, badge, badgeLocked: true, overlay }) : '',
    body
  }));
  requestAnimationFrame(setupPalmResultCtaExposure);
}

function palmMountGuideVisual() {
  const previewSize = { width: 300, height: 400 };
  const zones = palmGuideMountZones(previewSize);
  return `<div class="mount-preview-card mount-preview-card--guide">
    <svg class="mount-preview-hand" viewBox="0 0 300 400" role="img" aria-label="Standard left-palm guide showing seven traditional planetary zones">
      <defs><linearGradient id="guidePalmFill" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fffaf0"/><stop offset="1" stop-color="#ead4ae"/></linearGradient></defs>
      <path class="mount-preview-outline" style="fill:url(#guidePalmFill)" d="M111 352C85 338 70 310 66 279L51 181C49 166 56 155 67 154C78 153 84 163 87 176L96 219L84 108C82 91 91 80 104 80C117 80 121 92 122 108L126 196L128 68C128 50 138 40 151 41C164 42 168 55 167 70L165 196L175 85C177 69 187 60 199 62C211 64 214 77 212 91L204 207L218 133C221 118 232 111 243 115C254 119 255 132 251 146L232 251C225 294 212 325 188 347C169 363 132 363 111 352Z" />
      ${palmMountSvgGroups(zones)}
    </svg>
  </div>`;
}

function renderPalmMountPreview() {
  show(`<div class="kicker center">Local palm-map preview</div>
    <h1 class="question-title center">One clean palm map.</h1>
    <p class="question-sub center">Only real detected lines appear on an uploaded photo. Hand guides stay clean.</p>
    ${palmMountGuideVisual()}
    <div class="mount-map-heading"><b>What each zone represents in traditional palmistry</b><span>Symbolic themes—not medical or guaranteed predictions</span></div>
    ${palmMountLegend()}
    <div class="proof-card preview-cost-card"><b>No additional scan call</b><span>This version uses the 21 hand landmarks already returned by the current detector. Incremental inference time: 0 ms. Incremental API price: ₹0.</span></div>`);
}

function answersPayload() {
  const nameBreakdown = (
    ['name_numerology', 'market_profile', 'face_answers'].includes(state.lane)
    && !(state.lane === 'face_answers' && state.faceReportType === 'personality')
  ) ? clientNameBreakdown(state.answers.name || '') : null;
  return {
    locationScope: state.answers.locationScope || '',
    cityPriority: state.answers.cityPriority || '',
    marketExperience: state.answers.marketExperience || '',
    palmChoice: state.answers.palmChoice || '',
    ...(nameBreakdown ? { nameCompound: nameBreakdown.compound, nameNumber: nameBreakdown.root } : {}),
    angle: state.resolvedAngle,
    rawAngle: state.rawAngle,
    lane: state.lane
  };
}

function readingPayload() {
  const nameOnly = state.lane === 'name_numerology';
  const facePersonalityOnly = state.lane === 'face_answers'
    && state.faceReportType === 'personality';
  const additionalReportDirectoryContinuationToken =
    state.additionalReportDirectoryContinuationReadingId === state.parentReadingId
      ? state.additionalReportDirectoryContinuationToken || undefined
      : undefined;
  const additionalReportContinuationToken = !additionalReportDirectoryContinuationToken &&
    state.additionalReportContinuationReadingId === state.parentReadingId
      ? state.additionalReportContinuationToken || undefined
      : undefined;
  return {
    readingId: state.readingId || undefined,
    angle: state.resolvedAngle,
    rawAngle: state.rawAngle,
    lane: state.lane,
    ...(state.lane === 'face_answers' ? { faceReportType: state.faceReportType } : {}),
    parentReadingId: state.parentReadingId || undefined,
    additionalReportContinuationToken,
    additionalReportDirectoryContinuationToken,
    additionalReportAttributionToken:
      state.parentReadingId
        && !additionalReportContinuationToken
        && !additionalReportDirectoryContinuationToken
        ? state.additionalReportAttributionToken || undefined
        : undefined,
    reuseParentPalm: state.lane === 'market_profile'
      && state.reusableParentPalmAvailable
      && state.reuseParentPalm
      && Boolean(state.parentReadingId)
      && !state.readingId,
    acquisitionJourney: state.acquisitionJourney,
    trafficClass: CROSS_SELL_QA_ACTIVE ? 'operator_test' : 'commercial',
    analyticsSessionId: state.analyticsSessionId,
    tracking: trackingData(),
    name: facePersonalityOnly ? '' : formatName(state.answers.name),
    gender: '',
    dob: facePersonalityOnly ? '' : state.answers.dob,
    birthTime: nameOnly || facePersonalityOnly ? 'unknown' : (state.answers.birthTime || 'unknown'),
    place: nameOnly || facePersonalityOnly ? '' : state.answers.place,
    location: nameOnly || facePersonalityOnly ? null : state.answers.location,
    focus: state.lane,
    answers: answersPayload(),
    cards: [],
    picked: [],
    palm: ['palm_answers', 'market_profile'].includes(state.lane) && !state.reuseParentPalm
      ? (state.palmDetection || null)
      : null,
    face: state.lane === 'face_answers' ? state.faceAnalysis : null,
    utm: {
      ...state.utm,
      angle: state.resolvedAngle,
      raw_angle: state.rawAngle,
      resolved_angle: state.resolvedAngle,
      lane: state.lane,
      funnel_version: FUNNEL_VERSION,
      copy_version: activeCopyVersion(),
      paywall_variant: activePalmPaywallVariant(),
      ...palmLandingCheckpointAnalytics(),
      ...palmProofDensityExperimentAnalytics(),
      ...palmGatewayRecoveryExperimentAnalytics(),
      traffic_class: CROSS_SELL_QA_ACTIVE ? 'operator_test' : 'commercial',
      palm_name_alignment_contract: PALM_NAME_ALIGNMENT_PRICING_CONTRACT,
      analytics_session_id: state.analyticsSessionId,
      ...marketLandingExperimentAnalytics()
    }
  };
}

async function ensurePreview() {
  if (state.readingId && state.preview) {
    if (
      !IS_GLOBAL_STOREFRONT
      && state.lane === 'palm_answers'
      && !palmGatewayRecoveryServerValidatedThisLoad
      && !LOCAL_VISUAL_PREVIEW
      && !state.paid
      && !IS_PAID_RETURN
    ) await revalidateRestoredPalmExperiments();
    return state.preview;
  }
  if (
    !state.readingId
    && state.parentReadingId
    && !await ensurePendingAdditionalReportAuthorization()
  ) {
    throw new Error('Your additional-report link expired. Reopen your paid report and choose this report again.');
  }
  let body;
  if (state.screen !== 'analysis') {
    body = await api('/api/reading', readingPayload());
  } else {
    analysisRequestController?.abort();
    analysisRequestCancelledForNavigation = false;
    const controller = new AbortController();
    analysisRequestController = controller;
    const timeout = setTimeout(() => controller.abort(), ANALYSIS_REQUEST_TIMEOUT_MS);
    try {
      body = await api('/api/reading', readingPayload(), false, { signal: controller.signal });
    } catch (error) {
      if (error?.name === 'AbortError') {
        const interrupted = new Error(
          analysisRequestCancelledForNavigation
            ? 'This calculation was stopped.'
            : 'This calculation is taking longer than expected. Your birth details are saved—try again or review them before restarting.'
        );
        interrupted.code = analysisRequestCancelledForNavigation
          ? 'ANALYSIS_CANCELLED'
          : 'ANALYSIS_TIMEOUT';
        throw interrupted;
      }
      throw error;
    } finally {
      clearTimeout(timeout);
      if (analysisRequestController === controller) analysisRequestController = null;
    }
  }
  if (body.readingId !== state.readingId) state.pendingInvoice = null;
  state.readingId = body.readingId;
  if (
    !IS_GLOBAL_STOREFRONT
    && state.lane === 'palm_answers'
    && !applyServerPalmProofDensityAssignment(body.experiments?.palmProofDensity)
  ) failClosedPalmProofDensityAssignment();
  if (
    !IS_GLOBAL_STOREFRONT
    && state.lane === 'palm_answers'
    && !applyServerPalmGatewayRecoveryAssignment(body.experiments?.palmGatewayRecovery)
  ) failClosedPalmGatewayRecoveryAssignment();
  state.preview = body;
  state.pricing = body.pricing || state.pricing;
  persist();
  updateRecoveryUrl();
  track('reading_preview_created', {
    reading_id: body.readingId || '',
    chart_precision: body.chart?.precision || '',
    life_path: body.numerology?.lifePath || '',
    chaldean_name_number: body.numerology?.chaldeanNameNumber || '',
    birth_number: body.numerology?.birthNumber || '',
    destiny_number: body.numerology?.destinyNumber || ''
  });
  return body;
}

async function revalidateRestoredPalmExperiments() {
  if (
    LOCAL_VISUAL_PREVIEW
    || !palmConversionExperimentsNeedServerValidation()
    || state.lane !== 'palm_answers'
    || !state.readingId
    || !state.preview
    || state.paid
    || IS_PAID_RETURN
  ) return false;
  const controller = new AbortController();
  let timeout;
  try {
    const request = getJson(
      `/api/reading/${encodeURIComponent(state.readingId)}/experiments`,
      false,
      { signal: controller.signal }
    );
    const deadline = new Promise((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort();
        const error = new Error('Saved-reading experiment check timed out');
        error.code = 'PALM_EXPERIMENT_REVALIDATION_TIMEOUT';
        reject(error);
      }, RESTORED_PALM_EXPERIMENT_TIMEOUT_MS);
    });
    const body = await Promise.race([request, deadline]);
    if (body.readingId !== state.readingId) throw new Error('Reading identity changed');
    if (!applyServerPalmProofDensityAssignment(body.experiments?.palmProofDensity)) {
      failClosedPalmProofDensityAssignment();
    }
    if (!applyServerPalmGatewayRecoveryAssignment(body.experiments?.palmGatewayRecovery)) {
      failClosedPalmGatewayRecoveryAssignment();
    }
  } catch (_) {
    failClosedPalmProofDensityAssignment();
    failClosedPalmGatewayRecoveryAssignment();
  } finally {
    clearTimeout(timeout);
    controller.abort();
  }
  persist();
  return true;
}

function palmConversionExperimentsNeedServerValidation() {
  return !IS_GLOBAL_STOREFRONT
    && (PALM_PROOF_DENSITY_TREATMENT_PERCENT > 0
      || PALM_GATEWAY_RECOVERY_TREATMENT_PERCENT > 0);
}

function restoredPalmExperimentsNeedStartupCheck() {
  return !LOCAL_VISUAL_PREVIEW
    && palmConversionExperimentsNeedServerValidation()
    && state.lane === 'palm_answers'
    && Boolean(state.readingId && state.preview)
    && state.screen === 'unlock'
    && !state.paid
    && !IS_PAID_RETURN;
}

function renderRestoredPalmExperimentCheck() {
  setChrome();
  show(`<div class="analysis-screen" data-testid="restored-palm-check" aria-busy="true">
    <div class="kicker center">Opening your saved reading</div>
    <div class="analysis-orbit"><span>✦</span></div>
    <h1 class="question-title center">Checking your saved Palm reading…</h1>
    <p class="question-copy center">This takes only a moment. Your answers and payment status stay unchanged.</p>
  </div>`);
}

function analysisItems() {
  if (IS_GLOBAL_STOREFRONT && state.lane === 'palm_answers') {
    const detectedLines = palmLineList();
    return [
      `Reviewing the ${detectedLines || 'mapped lines'} in your left palm`,
      'Comparing the visible shape of each readable major line',
      'Checking whether any mapped crease clearly stands out in this photo',
      'Preparing one symbolic reflection for each readable line',
      'Adding clearly labelled optional sidereal birth context',
      'Preparing practical prompts, a PDF and clear limits'
    ];
  }
  if (state.lane === 'mahakundli') {
    if (state.answers.birthTime === 'unknown') {
      return [
        'Checking your full birth date without guessing a time',
        'Keeping only Surya (Sun) and Chandra (Moon) facts that stay the same across the date',
        'Not showing Lagna, houses or varga charts without a birth time',
        'Checking current Guru (Jupiter), Shani (Saturn), Rahu (North Node) and Ketu (South Node) transits',
        'Answering 17 life questions with birth-date facts',
        'Not showing any personal date that cannot be calculated reliably',
        'Saving the calculation behind every available answer',
        'Preparing one clear birth-date result'
      ];
    }
    if (!hasResolvedBirthplace()) {
      return [
        'Checking the birth date and exact time you entered',
        'Keeping your birthplace as typed until reliable coordinates are matched',
        'Not showing Lagna, houses or varga charts without a matched place',
        'Leaving out personal dasha dates that need a matched birthplace',
        'Checking current Guru (Jupiter), Shani (Saturn), Rahu (North Node) and Ketu (South Node) transits',
        'Answering 17 life questions with birth-date facts that do not depend on place',
        'Saving the calculation basis for every available answer',
        'Preparing your result with the birthplace limit clearly marked'
      ];
    }
    return [
      'Calculating your birth moment from your time and place',
      'Placing all 9 grahas by sign and degree',
      'Finding your Lagna and 12 houses',
      'Checking D9 for marriage, D10 for career and 5 more varga charts',
      'Finding your running Mahadasha, Antardasha and Pratyantardasha',
      'Checking Guru (Jupiter), Shani (Saturn), Rahu (North Node) and Ketu (South Node) for the next 3 years',
      'Answering 17 life questions separately',
      'Saving the calculation basis for every answer'
    ];
  }
  if (state.lane === 'name_numerology') {
    return [
      'Converting each letter with the Chaldean number table',
      'Calculating your compound and final name number',
      'Calculating your Birth Number from the day you were born',
      'Calculating your Destiny Number from your complete birth date',
      'Comparing how all three numbers work together',
      'Checking whether a spelling comparison may be useful'
    ];
  }
  if (state.lane === 'best_city') {
    return [
      'Creating your Vedic chart from your birth details',
      'Scoring city factors for career, money, relationships and visibility',
      'Adding separate daily-life checks for cost, visa and family needs',
      'Checking broader periods for moving, travelling or applying',
      'Comparing your Life Path and Name Number with each city',
      'Ranking the cities with the strongest overall match'
    ];
  }
  if (state.lane === 'partner_name') {
    return [
      'Creating your Vedic chart from your birth details',
      'Checking relationship indicators and Venus',
      'Comparing birth-star sounds with possible initials',
      'Comparing repeated letters with your Life Path and Name Number',
      'Checking whether your birth details support relationship timing'
    ];
  }
  if (state.lane === 'market_profile') {
    const items = [
      'Creating your Vedic chart from your birth details',
      'Checking Moon and Mercury for decision habits under pressure',
      'Comparing Jupiter and Saturn for patience and discipline',
      'Checking Mars and Rahu for speed and impulse',
      'Comparing your Name, Birth and Destiny Numbers',
      'Preparing practical guardrails for market decisions'
    ];
    if (state.palmDetection) items.push(`Comparing the detected ${palmLineList()} with your decision style`);
    return items;
  }
  if (state.lane === 'face_answers') {
    return [
      'Reviewing the visible markers from your private face map',
      'Creating your Vedic birth chart from your details',
      'Calculating your Name, Birth and Destiny Numbers',
      'Comparing your face theme with your chart and name numbers',
      'Mapping love, family, career, money and recognition',
      'Finding your personal planning period'
    ];
  }
  const detectedLines = palmLineList();
  return [
    `Reading the ${detectedLines || 'mapped lines'} in your left palm`,
    'Mapping career, promotion, business growth and recognition',
    'Mapping your strongest money and wealth-building period',
    'Finding your strongest marriage or relationship period',
    'Finding your strongest children and family period',
    'Mapping wellbeing, energy and the life ahead'
  ];
}

function renderAnalysis() {
  const config = laneConfig();
  const items = analysisItems();
  const isNameLane = state.lane === 'name_numerology';
  const nameNumber = isNameLane ? clientNameBreakdown(state.answers.name || '').root : null;
  const orbitSymbol = isNameLane
    ? nameNumber
    : state.lane === 'market_profile'
      ? '↗'
      : IS_GLOBAL_STOREFRONT && state.lane === 'palm_answers'
        ? '✋'
        : 'ॐ';
  const analysisTitle = isNameLane
    ? `We are testing your ${nameNumber} against two birth numbers.`
    : config?.analysisTitle || 'Preparing your personal report…';
  const analysisCopy = isNameLane
    ? `These two matches decide whether this strength stays supported—or whether another spelling deserves a comparison.`
    : config?.analysisCopy || 'This is based on the details you gave us, not a general result.';
  show(`<div class="analysis-screen analysis-screen--calculation" data-testid="analysis" aria-busy="${state.analysisError ? 'false' : 'true'}">
    <div class="kicker center">${escapeHtml(config?.analysisKicker || 'Building your personal report')}</div>
    <div class="analysis-orbit analysis-orbit--calculation ${isNameLane ? 'is-number-orbit' : ''}" aria-hidden="true"><span>${orbitSymbol}</span></div>
    <h1 class="question-title center">${escapeHtml(analysisTitle)}</h1>
    <p class="question-copy center">${escapeHtml(analysisCopy)}</p>
    <div class="analysis-stack">${escapeHtml(config?.analysisStack || 'Vedic chart · numerology · personal timing')}</div>
    <div class="analysis-progress"><span id="analysisProgressLabel">Preparing step 1 of ${items.length}</span><div class="analysis-progress-track" aria-hidden="true"><i class="analysis-progress-fill" id="analysisProgressFill"></i></div></div>
    <div class="analysis-list" id="analysisList" aria-live="off">${items.map((item, index) => `<div class="analysis-line is-queued" data-analysis-index="${index}" aria-hidden="true"><i aria-hidden="true"></i><span>${escapeHtml(item)}</span></div>`).join('')}</div>
    <div class="analysis-status visually-hidden" id="analysisStatus" role="status" aria-live="polite" aria-atomic="true">Preparing the first step.</div>
    <div id="analysisError">${state.analysisError ? `<div class="error-card">${escapeHtml(state.analysisError)}</div><div class="analysis-recovery-actions"><button class="primary-button" type="button" data-action="retry-analysis">Try again</button><button class="secondary-button" type="button" data-action="review-analysis-details">Review birth details</button><button class="text-button" type="button" data-action="start-fresh">Start fresh</button></div>` : ''}</div>
  </div>`);
  // Start the request synchronously. requestAnimationFrame can be suspended in
  // a background or automated tab, leaving a persisted analysis screen at step
  // one without ever firing the report-generation request.
  if (!state.analysisError) void runAnalysis();
}

function setAnalysisStep(lines, activeIndex) {
  lines.forEach((line, index) => {
    line.classList.toggle('is-queued', index > activeIndex);
    line.classList.toggle('is-active', index === activeIndex);
    line.classList.toggle('is-complete', index < activeIndex);
    line.setAttribute('aria-hidden', index > activeIndex ? 'true' : 'false');
    if (index === activeIndex) line.setAttribute('aria-current', 'step');
    else line.removeAttribute('aria-current');
  });
  const activeLine = lines[activeIndex];
  const label = document.getElementById('analysisProgressLabel');
  const fill = document.getElementById('analysisProgressFill');
  const status = document.getElementById('analysisStatus');
  const stepText = activeLine?.querySelector('span')?.textContent || 'Preparing your result';
  if (label) label.textContent = `Step ${activeIndex + 1} of ${lines.length}`;
  if (fill) fill.style.width = `${((activeIndex + 1) / Math.max(1, lines.length)) * 100}%`;
  if (status) status.textContent = `Step ${activeIndex + 1} of ${lines.length}: ${stepText}`;
  ensureAnalysisLineVisible(activeLine);
}

async function runAnalysis() {
  if (state.analysisRunning) return;
  const config = laneConfig();
  state.analysisRunning = true;
  state.analysisError = '';
  const started = Date.now();
  const lines = Array.from(document.querySelectorAll('.analysis-line'));
  const nameAnalysisDuration = Math.min(3200, Math.max(2500, 2500 + lines.length * 110));
  const nameRevealInterval = state.lane === 'name_numerology'
    ? Math.max(320, Math.floor((nameAnalysisDuration - 500) / Math.max(1, lines.length - 1)))
    : 850;
  track('analysis_started', { calculation_layers: lines.length, systems: config?.analysisStack || '' });
  const timers = lines.map((line, index) => setTimeout(() => {
    if (state.screen === 'analysis') setAnalysisStep(lines, index);
  }, state.lane === 'name_numerology' ? 180 + index * nameRevealInterval : 260 + index * 850));
  try {
    await ensurePreview();
    locationLookupRetryCount = 0;
    if (state.lane === 'mahakundli') {
      const evidenceCount = Number(state.preview?.lanePreview?.evidenceCount || 0);
      const finalLine = lines[lines.length - 1]?.querySelector('span');
      if (finalLine && evidenceCount > 0) {
        finalLine.textContent = 'Your kundli calculation is complete';
      }
    }
    const remainingDuration = state.lane === 'mahakundli'
      ? Math.max(0, 7000 - (Date.now() - started))
      : state.lane === 'name_numerology'
      ? Math.max(0, nameAnalysisDuration - (Date.now() - started))
      : confirmedCarriedPartnerCrossSell()
      ? 0
      : Math.max(0, 5600 - (Date.now() - started));
    await new Promise((resolve) => setTimeout(resolve, remainingDuration));
    state.analysisRunning = false;
    track('analysis_completed', { calculation_layers: lines.length, duration_ms: Date.now() - started });
    if (state.screen === 'analysis') go('unlock', 'analysis_complete');
  } catch (error) {
    timers.forEach(clearTimeout);
    state.analysisRunning = false;
    if (error.code === 'ANALYSIS_CANCELLED') return;
    if (error.code === 'LOCATION_LOOKUP_PENDING' && locationLookupRetryCount < 2) {
      locationLookupRetryCount += 1;
      const retryDelayMs = 1200 * locationLookupRetryCount;
      const status = document.getElementById('analysisStatus');
      const progressLabel = document.getElementById('analysisProgressLabel');
      if (status) status.textContent = 'Preparing your personal report. Your details are saved.';
      if (progressLabel) progressLabel.textContent = 'Preparing your report…';
      track('birthplace_lookup_retry', { attempt: locationLookupRetryCount });
      setTimeout(() => {
        if (state.screen === 'analysis' && !state.analysisRunning && !state.preview) runAnalysis();
      }, retryDelayMs);
      return;
    }
    state.analysisError = error.code === 'LOCATION_LOOKUP_PENDING'
      ? 'Your report could not be prepared just now. Please try again.'
      : error.code === 'ANALYSIS_TIMEOUT'
        ? error.message
      : error.message || 'Your report could not be prepared. Please try again.';
    if (error.readingId) state.readingId = error.readingId;
    persist();
    track('reading_preview_failed', { message: String(state.analysisError).slice(0, 180) });
    render();
  }
}

function actualProof() {
  if (!state.preview && RETURN_READING_ID) {
    return {
      title: 'We found your existing report.',
      line: 'Your report and payment record are linked to this page.',
      detail: 'Use the button below to check the payment or continue the same payment safely.'
    };
  }
  const chart = state.preview?.chart || {};
  const numerology = state.preview?.numerology || {};
  const lanePreview = state.preview?.lanePreview || {};
  const moon = chart.moonNakshatra ? `${chart.moonNakshatra} Moon pattern` : chart.moonSign ? `${chart.moonSign} Moon` : 'Vedic birth details included';
  const life = numerology.lifePath ? `Life Path ${numerology.lifePath}` : 'Life Path included';
  if (state.lane === 'mahakundli') {
    return {
      title: lanePreview.title || 'Your first personal Mahakundli result is ready.',
      line: lanePreview.value || 'Your first calculated result is ready.',
      detail: lanePreview.detail || 'The complete report explains the factors used for every available life-area answer and marks anything that cannot be calculated.'
    };
  }
  if (state.lane === 'name_numerology') {
    const local = clientNameBreakdown(state.answers.name || '');
    return {
      title: `Name Number ${local.root}`,
      line: 'Your three-number match is complete.',
      detail: 'Two numbers support the same strength. One decides whether the spelling you use every day should stay.'
    };
  }
  if (state.lane === 'best_city') {
    const safe = bestCitySafePaywallData();
    return {
      title: `${safe.candidateCount} cities produced your personal ranking.`,
      line: safe.leadingCityInitial ? `Your top city starts with “${safe.leadingCityInitial}”.` : 'Your top city name is locked.',
      detail: 'Reveal the full top three, why each city ranked where it did, and the trade-offs between them.'
    };
  }
  if (state.lane === 'partner_name') {
    const hasSafePreview = lanePreview.title && lanePreview.value && !removedReportText(`${lanePreview.title} ${lanePreview.value} ${lanePreview.detail || ''}`);
    return {
      title: hasSafePreview ? lanePreview.title : 'Your possible starting letters have been ranked.',
      line: hasSafePreview ? lanePreview.value : `${moon} · Name Number ${numerology.nameNumber || 'included'}`,
      detail: hasSafePreview ? lanePreview.detail : 'The full report shows three possible initials, matching name sounds, where you may meet and relationship timing when supported.'
    };
  }
  if (state.lane === 'market_profile') {
    return {
      title: 'Three personal market answers are ready.',
      line: 'One approach fits you more strongly. Two planning days also stand out.',
      detail: 'Which approach, which days and the future age when money-building strengthens stay locked in the full report.'
    };
  }
  if (state.lane === 'face_answers') {
    const hasSafePreview = lanePreview.title && !removedReportText(`${lanePreview.title} ${lanePreview.value || ''} ${lanePreview.detail || ''}`);
    return {
      title: hasSafePreview ? lanePreview.title : 'Your first-impression result and six life answers are ready.',
      line: hasSafePreview ? lanePreview.value : `${faceObservationRows().length || 9} face markers · ${moon} · ${life}`,
      detail: hasSafePreview
        ? lanePreview.detail
        : 'The free result shows a possible first impression from this photo. The complete report adds clearly labelled cultural reflections and compares the portrait cue with your chart and numbers across six life areas.'
    };
  }
  if (state.lane === 'palm_answers') {
    if (IS_GLOBAL_STOREFRONT) {
      const lines = palmLineNames();
      const firstLine = lines[0] || 'major Palm line';
      return {
        title: lines.length
          ? `${lines.length} ${lines.length === 1 ? 'major line is' : 'major lines are'} clear enough to reflect.`
          : 'Photo clarity comes before interpretation.',
        line: lines.length
          ? `${firstLine} is one of the visible patterns mapped from your photo.`
          : 'No major line will be interpreted unless the scan can map it clearly.',
        detail: 'The complete report explains each readable line, adds optional sidereal birth context and gives a grounded prompt—without promising an outcome.'
      };
    }
    const outlook = palmLifeOutlookPreview();
    const timingHint = palmTimingHint(outlook);
    if (timingHint.yearLevel) {
      return {
        title: timingHint.status === 'active' ? 'One year stands out—and it is already active.' : 'One future year stands out.',
        line: timingHint.startClue,
        detail: 'Unlock the year, its main theme, and the preparation that helps you use it well.'
      };
    }
    return {
      title: timingHint.timingAvailable ? 'One future period stands out.' : 'Your six life areas form a clear order.',
      line: timingHint.startClue,
      detail: 'The exact start and end, and the first life area to strengthen, stay in the complete report.'
    };
  }
  return {
    title: lanePreview.title || 'Your readable Palm lines are mapped.',
    line: lanePreview.value || `${palmLineList() || 'Visible palm lines'} · ${moon}`,
    detail: lanePreview.detail || `Only the detected lines will be read. Your ${life} adds separately titled chart and number support.`
  };
}

function bestCitySafePaywallData() {
  const preview = state.preview?.lanePreview || {};
  const rawCount = Number(preview.candidateCount);
  const fallbackCount = state.answers.locationScope === 'India first' ? 6 : 18;
  const candidateCount = Number.isInteger(rawCount) && rawCount >= 3 && rawCount <= 100
    ? rawCount
    : fallbackCount;
  const precision = preview.precision === 'timed' || preview.precision === 'broad'
    ? preview.precision
    : state.answers.birthTime && state.answers.birthTime !== 'unknown' ? 'timed' : 'broad';
  const priorityKey = ['overall', 'career', 'money', 'relationships'].includes(String(preview.priority || '').toLowerCase())
    ? String(preview.priority).toLowerCase()
    : ['overall', 'career', 'money', 'relationships'].includes(String(state.answers.cityPriority || '').toLowerCase())
      ? String(state.answers.cityPriority).toLowerCase()
      : 'overall';
  const priorityLabels = {
    overall: 'overall fit',
    career: 'career',
    money: 'money',
    relationships: 'relationships'
  };
  const dimensionKeys = {
    career: 'Career',
    success: 'Career',
    money: 'Money',
    wealth: 'Money',
    relationships: 'Relationships',
    relationship: 'Relationships',
    love: 'Relationships',
    visibility: 'Visibility'
  };
  const dimension = dimensionKeys[String(preview.winningDimension || '').trim().toLowerCase()] || '';
  const leadingCityInitial = /^[A-Z]$/i.test(String(preview.leadingCityInitial || '').trim())
    ? String(preview.leadingCityInitial).trim().toUpperCase()
    : '';
  return {
    candidateCount,
    precision,
    priorityKey,
    priorityLabel: priorityLabels[priorityKey],
    dimension,
    leadingCityInitial,
    scopeLabel: state.answers.locationScope === 'India first' ? 'Indian cities' : 'India + international'
  };
}

function bestCityOfferMarkup() {
  const pricing = currentPricing();
  const amount = Number(pricing.amount || REPORT_PRICE_INR);
  const comparison = priceComparisonFor(pricing);
  if (!comparison) {
    return `<div class="best-city-offer" data-testid="best-city-offer" data-paywall-section="purchase_summary"><small>Complete Best City Report</small><div><div class="best-city-offer__price-row"><strong>${escapeHtml(taxablePriceLabel(amount, pricing))}</strong><span>One-time payment</span></div>${gstDisclosureMarkup(amount, pricing)}</div></div>`;
  }
  return `<div class="best-city-offer" data-testid="best-city-offer" data-paywall-section="purchase_summary">
    <small>Complete Best City Report</small>
    <div><div class="best-city-offer__price-row"><del>${escapeHtml(taxablePriceLabel(comparison.compareAtAmount, pricing))}</del><strong>${escapeHtml(taxablePriceLabel(amount, pricing))}</strong><span>One-time payment</span></div>${gstDisclosureMarkup(amount, pricing)}</div>
  </div>`;
}

function bestCityLockedRankingMarkup(data) {
  const rows = [
    { rank: '01', title: 'Your #1 city — and why it feels right', copy: "The single best match for the life you're building, and what makes it lead" },
    { rank: '02', title: 'Your closest alternative', copy: 'Where it may fit you better than the first city' },
    { rank: '03', title: 'The alternative you may not expect', copy: 'The different strength that keeps it in your top three' }
  ];
  return `<section class="best-city-locked-ranking" data-testid="best-city-locked-ranking" data-paywall-section="locked_answers">
    <div class="best-city-locked-ranking__head"><small>Your private top three</small><h2>Three city names are still locked</h2><p>Each city leads for a different reason. Open the ranking to compare them together.</p></div>
    <div class="best-city-rank-list">${rows.map((row) => `<article class="best-city-rank-card" data-testid="best-city-rank-card">
      <span>${row.rank}</span><div><b>${escapeHtml(row.title)}</b><p>${escapeHtml(row.copy)}</p><em>City name locked</em></div><i aria-hidden="true">🔒</i>
    </article>`).join('')}</div>
  </section>`;
}

function renderBestCityUnlock() {
  const config = LANES.best_city;
  const data = bestCitySafePaywallData();
  const needsVerification = Boolean(state.pendingVerification);
  const checkoutAction = needsVerification ? 'verify-pending' : 'checkout';
  const checkoutTaxableValue = Number(currentPricing().amount || REPORT_PRICE_INR);
  const checkoutValue = checkoutEventValue();
  const checkoutLabel = state.checkoutLoading
    ? needsVerification ? 'Checking your payment…' : 'Opening secure payment…'
    : needsVerification
      ? 'Check my completed payment'
      : 'Reveal my top 3 cities';
  const checkoutLabelForAssistiveTech = !needsVerification && !state.checkoutLoading
    ? checkoutAriaLabel(checkoutLabel, checkoutTaxableValue)
    : checkoutLabel;
  const checkoutPriceNote = !needsVerification && !state.checkoutLoading
    ? checkoutPriceNoteMarkup(checkoutTaxableValue)
    : '';
  const cashfreeFallback = cashfreeFallbackMarkup();
  const basis = data.precision === 'timed'
    ? 'Birth chart timing and numerology'
    : 'Birth details, location patterns and numerology';
  const partialClue = data.leadingCityInitial
    ? `Your top city starts with “${data.leadingCityInitial}”.`
    : 'Your top city name is locked.';
  const dimensionMarkup = data.dimension
    ? `<span><small>Strongest area</small><b>${escapeHtml(data.dimension)}</b></span>`
    : '';

  trackOnce('unlockView', 'unlock_view', {
    product: config.product,
    value: checkoutValue,
    currency: 'INR',
    candidate_count: data.candidateCount,
    city_priority: data.priorityKey,
    comparison_precision: data.precision,
    locked_rank_count: 3,
    offer_position: 'before_top_cta',
    ...priceComparisonAnalytics()
  });

  show(`<div class="best-city-paywall" data-testid="unlock-view">
    <div class="kicker center">${escapeHtml(config.unlockKicker)}</div>
    <h1 class="unlock-title">Your #1 city — and why it feels right</h1>
    <p class="unlock-subtitle">The three cities that fit the life you want — their names, what each one offers you, and why. Scored across ${data.candidateCount} cities for your priority.</p>
    <section class="best-city-proof" data-testid="best-city-proof" data-paywall-section="personal_proof">
      <small>Your first clue</small>
      <b>${escapeHtml(partialClue)}</b>
      <p>Reveal the city and your full top three.</p>
      <div class="best-city-proof-grid">
        <span><small>Cities compared</small><b>${data.candidateCount}</b></span>
        <span><small>Search</small><b>${escapeHtml(data.scopeLabel)}</b></span>
        <span><small>Ranking method</small><b>${escapeHtml(basis)}</b></span>
        ${dimensionMarkup}
      </div>
    </section>
    <div class="value-tension best-city-tension" data-paywall-section="value_proposition"><i>✦</i><p>Your top three do not lead for the same reason. The full ranking shows which city best fits your priority—and what you may trade for that advantage.</p></div>
    ${state.paymentError ? `<div class="error-card" data-testid="payment-error">${escapeHtml(state.paymentError)}</div>` : ''}
    ${needsVerification ? '' : bestCityOfferMarkup()}
    <div class="best-city-primary-checkout" data-paywall-section="top_checkout">
      <button class="primary-button" type="button" data-action="${checkoutAction}" data-value="top" data-placement="top" data-testid="checkout-button-top" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
      ${checkoutPriceNote}
      ${needsVerification ? '' : paymentMethodTrustMarkup()}
    </div>
    ${needsVerification ? '<div class="small-note center">Do not pay again. We will check the payment response already received.</div>' : ''}
    ${bestCityLockedRankingMarkup(data)}
    <section class="best-city-unlocks" data-testid="unlock-includes" data-paywall-section="deliverables"><small>Inside your report</small><b>Names, reasons and trade-offs—not just a score</b><div><span>Top 3 city names</span><span>Priority comparison</span><span>The best time to move</span><span>Practical move checks</span></div></section>
    <button class="primary-button best-city-bottom-cta" type="button" data-action="${checkoutAction}" data-value="bottom" data-placement="bottom" data-testid="checkout-button" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
    ${checkoutPriceNote}
    ${needsVerification ? '' : paymentMethodTrustMarkup({ bottom: true })}
    ${cashfreeFallback}
  </div>`);
  stage.insertAdjacentHTML('beforeend', `<div class="mobile-checkout-dock"><button class="primary-button" type="button" data-action="${checkoutAction}" data-value="sticky" data-placement="sticky" data-testid="checkout-button-sticky" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>${checkoutPriceNote}${needsVerification ? '<span>We will check your completed payment. Do not pay again.</span>' : paymentMethodTrustMarkup({ compact: true })}</div>`);
  setupAndTrackCrossSellPaywallCtaExposure();
}

function nameLockedQuestionsMarkup(config) {
  const rows = (config.paywallQuestions || []).filter((item) => item?.title && item?.leadIn).slice(0, 3);
  return `<section class="name-locked-questions" data-testid="name-locked-questions">
    <small>Three answers your Name Number cannot give alone</small>
    <h2>The birth-date match changes what your ${clientNameBreakdown(state.answers.name || '').root} means for this spelling.</h2>
    <div>${rows.map((item, index) => `<article class="name-locked-question" data-testid="locked-insight">
      <span>${String(index + 1).padStart(2, '0')}</span><div><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.leadIn)}</p></div><svg aria-hidden="true" viewBox="0 0 20 20"><rect x="4.25" y="8.25" width="11.5" height="8.5" rx="2"></rect><path d="M6.75 8.25V6.5a3.25 3.25 0 0 1 6.5 0v1.75"></path></svg>
    </article>`).join('')}</div>
  </section>`;
}

function renderNameNumerologyUnlock() {
  const config = LANES.name_numerology;
  const result = clientNameBreakdown(state.answers.name || '');
  const profile = clientNameNumberProfile(result.root);
  const readerName = formatName(state.answers.name || '').split(' ')[0];
  const birthNumbers = clientBirthDestinyNumbers(state.answers.dob || '');
  const nameRuler = clientNumberRulers[result.root] || '';
  const birthRuler = clientNumberRulers[birthNumbers.birth] || '';
  const destinyRuler = clientNumberRulers[birthNumbers.destiny] || '';
  const title = `${readerName ? `${readerName}, ` : ''}Name ${result.root} meets Birth ${birthNumbers.birth} and Destiny ${birthNumbers.destiny}. Does this spelling stay—or change?`;
  const needsVerification = Boolean(state.pendingVerification);
  const checkoutAction = needsVerification ? 'verify-pending' : 'checkout';
  const checkoutTaxableValue = Number(currentPricing().amount || REPORT_PRICE_INR);
  const checkoutValue = checkoutEventValue();
  const checkoutLabel = state.checkoutLoading
    ? needsVerification ? 'Checking your payment…' : 'Opening secure payment…'
    : needsVerification
      ? 'Check my completed payment'
      : config.payCta;
  const checkoutLabelForAssistiveTech = !needsVerification && !state.checkoutLoading
    ? checkoutAriaLabel(checkoutLabel, checkoutTaxableValue)
    : checkoutLabel;
  const checkoutPriceNote = !needsVerification && !state.checkoutLoading
    ? checkoutPriceNoteMarkup(checkoutTaxableValue)
    : '';
  const cashfreeFallback = cashfreeFallbackMarkup();

  if (!LOCAL_NAME_PAYWALL_PREVIEW) {
    trackOnce('unlockView', 'unlock_view', {
      product: config.product,
      value: checkoutValue,
      currency: checkoutCurrency(),
      name_number: result.root,
      locked_answer_count: 3,
      offer_position: 'before_top_cta',
      ...priceComparisonAnalytics()
    });
  }

  show(`<div class="name-match-paywall" data-testid="unlock-view">
    <div class="kicker center">${escapeHtml(config.unlockKicker)}</div>
    <h1 class="unlock-title">${escapeHtml(title)}</h1>
    <p class="unlock-subtitle">Your ${result.root} amplifies ${escapeHtml(profile.power.toLowerCase())}. The locked verdict shows whether all three numbers reinforce that strength—or split it.</p>
    <section class="name-match-proof" data-testid="name-match-proof">
      <div class="name-match-proof__number"><small>Your calculation</small><strong>${result.root}</strong><span>${escapeHtml(nameRuler)} · ${escapeHtml(profile.title)}</span></div>
      <div class="name-match-proof__lead"><small>Natural power</small><b>${escapeHtml(profile.power)}</b><p><span>Blind spot:</span> ${escapeHtml(profile.watch)}.</p></div>
      <div class="name-match-grid" aria-label="Your three calculated numbers and locked spelling verdict">
        <div class="name-match-cell"><small>Name Number</small><b>${result.compound}/${result.root} · ${escapeHtml(nameRuler)}</b></div>
        <div class="name-match-cell"><small>Birth Number</small><b>${birthNumbers.birth} · ${escapeHtml(birthRuler)}</b></div>
        <div class="name-match-cell"><small>Destiny Number</small><b>${birthNumbers.destiny} · ${escapeHtml(destinyRuler)}</b></div>
        <div class="name-match-cell name-match-cell--locked"><small>Spelling verdict</small><b>Keep or change? <i aria-hidden="true">🔒</i></b></div>
      </div>
    </section>
    ${nameNumerologyOfferMarkup()}
    ${state.paymentError ? `<div class="error-card" data-testid="payment-error">${escapeHtml(state.paymentError)}</div>` : ''}
    <div class="unlock-top-checkout name-paywall-checkout">
      <button class="primary-button" type="button" data-action="${checkoutAction}" data-value="top" data-placement="top" data-testid="checkout-button-top" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
      ${checkoutPriceNote}
      ${needsVerification ? '' : paymentMethodTrustMarkup()}
    </div>
    <div class="name-paywall-cta-note">The full report opens with your keep-or-change answer, then shows the reason and ranked spelling options when a change genuinely helps.</div>
    ${nameLockedQuestionsMarkup(config)}
    ${cashfreeFallback}
    ${needsVerification ? '<div class="small-note center">Do not pay again. We will check the payment response already received.</div>' : ''}
  </div>`);
  stage.insertAdjacentHTML('beforeend', `<div class="mobile-checkout-dock"><button class="primary-button" type="button" data-action="${checkoutAction}" data-value="sticky" data-placement="sticky" data-testid="checkout-button-sticky" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>${checkoutPriceNote}${needsVerification ? '<span>We will check your completed payment. Do not pay again.</span>' : paymentMethodTrustMarkup({ compact: true })}</div>`);
}

function prepareLocalNamePaywallPreview() {
  state.lane = 'name_numerology';
  state.resolvedAngle = 'name_numerology';
  state.rawAngle = 'name_numerology';
  state.screen = 'unlock';
  state.paid = false;
  state.full = null;
  state.readingId = null;
  state.pendingVerification = null;
  state.checkoutLoading = false;
  state.paymentError = '';
  state.pricing = null;
  state.answers = { ...state.answers, name: 'Riya Sharma', dob: '1992-03-12' };
  state.preview = {
    numerology: { nameNumber: 3, method: 'Chaldean' },
    lanePreview: {
      title: 'Your free Name Number is 3.',
      value: 'Three personal answers are still locked'
    }
  };
  state.lastScreenKey = '';
  document.title = 'Name Numerology Paywall — Local Review';
}

function renderLocalNamePaywallPreview() {
  renderNameNumerologyUnlock();
  document.querySelectorAll('[data-action="checkout"]').forEach((button) => {
    button.dataset.action = 'preview-only';
    button.title = 'Local copy preview only';
  });
}

function activePalmPaywallVariant() {
  if (state.lane !== 'palm_answers') return '';
  if (LOCAL_PALM_PAYWALL_PREVIEW) return LOCAL_PALM_PAYWALL_VARIANT;
  return normalizePalmPaywallVariant(state.palmPaywallVariant, state.analyticsSessionId);
}

// The trust-proof cohort is variant G by storage identity, but it renders E's
// page. Every historical G-only treatment must therefore test the legacy
// helper, never the bare variant, or an old diff leaks into the comparison.
function isPalmGTrustProofCohort() {
  return activePalmPaywallVariant() === 'g'
    && [PALM_G_TRUST_PROOF_COPY_VERSION, PALM_G_TRUST_PROOF_V5_COPY_VERSION]
      .includes(activeCopyVersion());
}

function isLegacyPalmGCohort() {
  return activePalmPaywallVariant() === 'g' && !isPalmGTrustProofCohort();
}

function palmPaywallConfig(config) {
  if (state.lane !== 'palm_answers') return config;
  if (IS_GLOBAL_STOREFRONT) return config;
  const variant = activePalmPaywallVariant();
  const frozenLegacyBase = ['c', 'd'].includes(variant) ? LEGACY_PALM_PAYWALL_BASE : {};
  const variantCopy = isPalmGTrustProofCohort()
    ? PALM_PAYWALL_VARIANTS.e
    : (PALM_PAYWALL_VARIANTS[variant] || PALM_PAYWALL_VARIANTS.e);
  return {
    ...config,
    ...frozenLegacyBase,
    ...variantCopy
  };
}

function prepareLocalPalmPaywallPreview() {
  const keepCashfreeRecoveryForm = Boolean(state.cashfreeFallbackOpen);
  const keepPaymentPhone = String(state.answers.paymentPhone || '');
  state.lane = 'palm_answers';
  state.resolvedAngle = 'palm_answers';
  state.rawAngle = 'palm_answers';
  state.screen = 'unlock';
  state.paid = false;
  state.full = null;
  state.readingId = null;
  state.pendingVerification = null;
  state.checkoutLoading = false;
  state.paymentError = '';
  state.checkoutAttemptNumber = 1;
  state.activePaymentId = 'pay_local_gateway_preview';
  state.paymentDismissRecovery = LOCAL_PALM_GATEWAY_RECOVERY_VARIANT === PALM_GATEWAY_RECOVERY_TREATMENT
    && QUERY.get('payment_state') === 'dismissed'
    ? sanitizePaymentDismissRecovery({
        checkoutAttemptId: state.activePaymentId,
        attemptNumber: 1,
        dismissedAt: Date.now() - 4_200,
        gatewayOpenDurationMs: 18_600,
        ctaPlacement: 'top'
      })
    : null;
  state.palmPreviewUrl = state.palmPreviewUrl || PALM_SCAN_ASSET_URL;
  state.palmPaywallVariant = LOCAL_PALM_PAYWALL_VARIANT;
  state.palmPaywallCopyVersion = ['e', 'g'].includes(LOCAL_PALM_PAYWALL_VARIANT)
    ? freshPalmCopyVersionForVariant(LOCAL_PALM_PAYWALL_VARIANT)
    : fallbackPalmCopyVersionForVariant(LOCAL_PALM_PAYWALL_VARIANT);
  state.pricing = {
    ...RUNTIME_PRICING,
    key: 'full',
    label: 'Complete Palm Life Timeline',
    amount: PALM_REPORT_PRICE_INR,
    compareAtAmount: null,
    currency: 'INR',
    displayPrice: `₹${PALM_REPORT_PRICE_INR}`,
    compareAtDisplayPrice: null,
    tax: {
      mode: GST_EXCLUSIVE_MODE,
      gstRateBps: GST_RATE_BPS
    },
    offer: null
  };
  state.answers = {
    ...state.answers,
    name: 'Preview reader',
    birthTime: '09:30',
    ...(keepPaymentPhone ? { paymentPhone: keepPaymentPhone } : {})
  };
  state.cashfreeFallbackOpen = keepCashfreeRecoveryForm;
  state.palmDetection = {
    original_lines: {
      head: [{ x: 80, y: 205 }, { x: 150, y: 215 }, { x: 220, y: 225 }],
      fate: [{ x: 150, y: 315 }, { x: 152, y: 240 }, { x: 155, y: 170 }]
    },
    hand_points: [
      { x: 40, y: 360 },
      { x: 40, y: 60 },
      { x: 260, y: 60 },
      { x: 260, y: 360 }
    ],
    lines: {
      love: [{ x: 80, y: 160 }, { x: 210, y: 150 }],
      life: [{ x: 90, y: 180 }, { x: 130, y: 320 }],
      head: [{ x: 80, y: 205 }, { x: 220, y: 225 }],
      fate: [{ x: 150, y: 315 }, { x: 155, y: 170 }]
    }
  };
  state.preview = {
    experiments: {
      palmNameAlignmentOffer: {
        key: 'palm_name_alignment_offer',
        version: PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION,
        variant: 'offer',
        arm: PALM_NAME_ALIGNMENT_FACTORIAL_VERSIONS.has(PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION)
          ? `base_${LOCAL_PALM_NAME_BASE_AMOUNT}_default_${LOCAL_PALM_NAME_DEFAULT_SELECTED ? 'on' : 'off'}`
          : LOCAL_PALM_NAME_DEFAULT_SELECTED ? 'offer_default_on' : 'offer_default_off',
        defaultSelected: LOCAL_PALM_NAME_DEFAULT_SELECTED,
        bucket: PALM_NAME_ALIGNMENT_FACTORIAL_VERSIONS.has(PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION)
          ? PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION === 'v13'
            ? 0
            : PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION === 'v12'
            ? LOCAL_PALM_NAME_BASE_AMOUNT === 299 ? 0 : 3_000
            : PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION === 'v11'
            ? LOCAL_PALM_NAME_BASE_AMOUNT === 299 ? 0 : LOCAL_PALM_NAME_BASE_AMOUNT === 351 ? 4_000 : 7_000
            : PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION === 'v10'
            ? LOCAL_PALM_NAME_BASE_AMOUNT === 299 ? 0 : LOCAL_PALM_NAME_BASE_AMOUNT === 351 ? 7_000 : 9_000
            : PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION === 'v9'
            ? LOCAL_PALM_NAME_BASE_AMOUNT === 299 ? 0 : 8_000
            : PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION === 'v8'
            ? LOCAL_PALM_NAME_BASE_AMOUNT === 299 ? 0 : 5_000
            : PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION === 'v7'
              ? LOCAL_PALM_NAME_BASE_AMOUNT === 299 ? 0 : 8_000
              : PALM_NAME_ALIGNMENT_EXPERIMENT_VERSION === 'v6'
              ? LOCAL_PALM_NAME_BASE_AMOUNT === 299 ? 0 : 6_000
              : LOCAL_PALM_NAME_BASE_AMOUNT === 299
                ? LOCAL_PALM_NAME_DEFAULT_SELECTED ? 3_000 : 0
                : LOCAL_PALM_NAME_DEFAULT_SELECTED ? 8_000 : 5_000
          : LOCAL_PALM_NAME_DEFAULT_SELECTED ? 0 : 1_500,
        offerEligible: true,
        pricing: {
          baseAmount: LOCAL_PALM_NAME_BASE_AMOUNT,
          addOnAmount: PALM_NAME_ALIGNMENT_PRICE_INR,
          currency: 'INR'
        }
      }
    },
    chart: { precision: 'timed', ascendant: 'Libra' },
    numerology: { lifePath: 6, nameNumber: 3 },
    lifeOutlook: {
      timingAvailable: true,
      timingHint: { startClue: 'Within the next 24 months', status: 'upcoming' },
      // Mirrors the atomic field the server releases only to G. Append
      // &reveal=off to preview the evidence-safe fallback.
      ...(QUERY.get('reveal') === 'off' ? {} : {
        strongestFinding: {
          version: 'palm_strongest_proof_v3',
          areaKeys: ['moneyWealth'],
          areaLabel: 'Money and wealth',
          shared: false,
          selection: {
            kind: 'supported_single_period',
            statement: 'Among the six areas, your reading shows money and wealth most strongly.',
            timingLocked: true
          },
          // The synthetic preview lines meet the same Fate-versus-Head
          // geometry checks used by the production G payload.
          palmObservation: 'Your Fate Line runs deeper past its midpoint than your Head Line — in palmistry, that pattern points to earnings that build later and steadier than most people expect at your stage.',
          palmProof: {
            areaKey: 'moneyWealth',
            sourceLabel: 'Palm photo',
            lineLabel: 'Head Line',
            shortLabel: 'Head Line: near-linear path',
            observedClause: 'In your palm photo, the Head Line follows a near-linear path.',
            interpretation: 'Your Fate Line runs deeper past its midpoint than your Head Line — in palmistry, that pattern points to earnings that build later and steadier than most people expect at your stage.'
          },
          corroboration: {
            statement: 'Your Palm photo and birth calculation independently repeat a structured decision-making pattern.',
            receipts: [
              { factId: 'ev.palm.head.near_linear', sourceLabel: 'Palm photo', shortLabel: 'Head Line: near-linear path' },
              { factId: 'ev.date.life_path.6', sourceLabel: 'Birth-date numerology', shortLabel: 'Life Path 6' }
            ]
          },
          reportExcerpt: 'Your money pattern grows through steady progress over time, not quick luck. One focused skill or dependable income path becomes more valuable, creating steadier earnings and greater financial control.'
        }
      }),
      lockedResultCount: 6
    }
  };
  state.lastScreenKey = '';
  document.title = `Palm Paywall ${LOCAL_PALM_PAYWALL_VARIANT.toUpperCase()} — Local Review`;
}

function renderLocalPalmPaywallPreview() {
  renderUnlock();
  const gatewayRecoveryButton = document.querySelector(
    '[data-action="recover-dismissed-payment-gateway"]'
  );
  if (gatewayRecoveryButton) {
    gatewayRecoveryButton.dataset.previewAction = gatewayRecoveryButton.dataset.action;
    gatewayRecoveryButton.title = 'Reveal the local alternate-payment form preview';
  }
  document.querySelectorAll('[data-action="checkout"], [data-action="retry-dismissed-payment"], [data-action="checkout-cashfree"], [data-action="reconsider-payment-price"], [data-action="dismiss-payment-for-now"]').forEach((button) => {
    button.dataset.previewAction = button.dataset.action;
    button.dataset.action = 'preview-only';
    button.title = 'Local copy preview only';
  });
}

function localPalmPaidPreviewFixture() {
  const domains = {
    loveMarriage: {
      title: PALM_LIFE_AREA_TITLES.loveMarriage,
      verdict: 'Between August 2028 and June 2029, you have your strongest opportunity to begin a stable long-term relationship or make an existing one more serious.',
      primaryWindow: 'August 2028–June 2029',
      ageRange: '33-34',
      timingState: 'upcoming',
      likelyDevelopments: ['a clearer definition of the relationship', 'an honest conversation about long-term plans', 'better agreement on daily life, money and family'],
      palmInsight: {
        lineLabel: 'Heart line',
        reading: 'You trust love when care is consistent and words are matched by action.',
        meaning: 'Your heart line curves gently without rising sharply. You trust love when care is consistent and words are matched by action.'
      },
      supportingConfirmation: 'Your Venus-Jupiter chart period falls between August 2028 and June 2029 and points to the same relationship timing.',
      whyPersonal: 'Your heart line curves gently without rising sharply. You trust love when care is consistent and words are matched by action.',
      prepareNow: 'Use honest conversations to align commitment, money, family expectations and daily life.'
    },
    familyChildren: {
      title: PALM_LIFE_AREA_TITLES.familyChildren,
      verdict: 'Between September 2029 and July 2030, you have your strongest opportunity to make clear decisions about children, caring for a family member or a more settled home.',
      primaryWindow: 'September 2029–July 2030',
      ageRange: '34-35',
      timingState: 'upcoming',
      likelyDevelopments: ['serious family-planning conversations', 'a more stable home routine', 'clearer sharing of care and responsibility'],
      palmInsight: {
        lineLabel: 'Heart line',
        reading: 'Your emotional pattern favours family decisions made with trust, steadiness and shared responsibility.',
        meaning: 'The gentle curve in your heart line favours family decisions made after trust, routines and shared responsibilities are clear.'
      },
      supportingConfirmation: 'Your Jupiter-Moon chart period falls between September 2029 and July 2030 and places greater emphasis on family and home.',
      whyPersonal: 'The gentle curve in your heart line favours family decisions made after trust, routines and shared responsibilities are clear.',
      prepareNow: 'Build the emotional, practical and financial base that makes family decisions feel chosen rather than pressured.'
    },
    careerSuccess: {
      title: PALM_LIFE_AREA_TITLES.careerSuccess,
      verdict: 'Between September 2027 and May 2028, you have your strongest opportunity to pursue a promotion, take on a larger role or make business growth visible.',
      primaryWindow: 'September 2027–May 2028',
      ageRange: '32-33',
      timingState: 'upcoming',
      likelyDevelopments: ['a promotion, larger role or visible business result', 'more responsibility and decision-making', 'a defined next role or business target'],
      palmInsight: {
        lineLabel: 'Fate line',
        reading: 'Your success grows with responsibility, completed work and staying with a useful skill long enough to be known for it.',
        meaning: 'Your fate line runs steadily through the centre of your palm. It favours skill, responsibility and results that build on each other over time.'
      },
      supportingConfirmation: 'Your Saturn-Sun chart period falls between September 2027 and May 2028 and points to greater career responsibility.',
      whyPersonal: 'Your fate line runs steadily through the centre of your palm. It favours skill, responsibility and results that build on each other over time.',
      prepareNow: 'Choose one important project, finish it and make your contribution clear to your manager, client or the person approving the work.'
    },
    moneyWealth: {
      title: PALM_LIFE_AREA_TITLES.moneyWealth,
      verdict: 'Between January 2028 and December 2029, your strongest money opportunity comes from more reliable income, a written plan and choices you can repeat.',
      primaryWindow: 'January 2028–December 2029',
      ageRange: '32-34',
      timingState: 'upcoming',
      likelyDevelopments: ['more reliable income', 'a clearer saving or investment structure', 'less dependence on quick wins'],
      palmInsight: {
        lineLabel: 'Head line',
        reading: 'Your best money decisions come when the options are clear and the plan is written down.',
        meaning: 'Your head line runs steadily across your palm. Your strongest money decisions come from comparing options clearly and following a written plan.'
      },
      supportingConfirmation: 'In 2028, your Personal Year 8 is associated with authority, financial results and measurable progress, which aligns with the money timing shown here.',
      whyPersonal: 'Your head line runs steadily across your palm. Your strongest money decisions come from comparing options clearly and following a written plan.',
      prepareNow: 'Protect cash flow and strengthen the income source that can continue growing for several years.'
    },
    recognition: {
      title: PALM_LIFE_AREA_TITLES.recognition,
      verdict: 'Recognition grows when your name is attached to finished work and people can describe the result you created.',
      primaryWindow: 'September 2027–May 2028',
      ageRange: '32-33',
      timingState: 'upcoming',
      likelyDevelopments: ['greater visibility for completed work', 'more people connecting your name with a specific strength', 'credit for responsibility you already carry'],
      palmInsight: {
        lineLabel: 'Fate line',
        reading: 'Your fate line rewards clear responsibility and staying with the right work long enough to earn trust.',
        meaning: 'Your fate line runs steadily through the centre of your palm, linking recognition with completed work and growing responsibility rather than chasing attention.'
      },
      supportingConfirmation: 'Your Saturn-Sun chart period falls between September 2027 and May 2028; completed work during these dates can increase your visibility.',
      whyPersonal: 'Your fate line runs steadily through the centre of your palm, linking recognition with completed work and growing responsibility rather than chasing attention.',
      prepareNow: 'Publish, present or document one finished result instead of waiting for effort to be noticed on its own.'
    },
    wellbeingEnergy: {
      title: PALM_LIFE_AREA_TITLES.wellbeingEnergy,
      verdict: 'From now through December 2026, reduce the commitments that repeatedly drain you and rebuild a routine that supports consistent energy.',
      primaryWindow: 'Now to December 2026',
      ageRange: '31',
      timingState: 'active',
      likelyDevelopments: ['a steady routine you can follow', 'clearer boundaries around your time and energy', 'more consistent energy after reducing one duty that keeps exhausting you'],
      palmInsight: {
        lineLabel: 'Life line',
        reading: 'Your strength comes from steady energy, not endless intensity. A simple rhythm helps you recover and stay focused.',
        meaning: 'Your life line forms a broad, open curve. You do best with an adaptable rhythm that leaves room for movement, rest and a fresh start.'
      },
      supportingConfirmation: 'Your Saturn-return timing also points to a period of reduced pressure and recovery through December 2026.',
      whyPersonal: 'Your life line forms a broad, open curve. You do best with an adaptable rhythm that leaves room for movement, rest and a fresh start.',
      prepareNow: 'Keep one sleep, movement or focus habit steady for four weeks and reduce one duty or habit that keeps exhausting you.'
    }
  };
  const outlook = {
    currentPhase: {
      asOf: '2026-08-10',
      headline: 'Pressure is high. A clearer shift is ahead.',
      summary: 'The current sub-period brings support through people and relationships. Surya (Sun) is next, shifting the focus towards visibility and recognition.',
      window: 'Now through 25 October 2026',
      ageRange: '31',
      timingState: 'active',
      dashaLabel: 'Shani (Saturn) Mahadasha · Mangal (Mars) Antardasha',
      immediateDashaLabel: 'Shukra (Venus) Pratyantardasha',
      primaryDomains: ['careerSuccess', 'recognition'],
      challenge: {
        title: 'Why this phase may feel difficult',
        body: 'Mangal (Mars) can make pressure, impatience and disagreements sharper, especially when several matters need attention together.'
      },
      support: {
        title: 'What is working in your favour',
        body: 'Shukra (Venus) is in its own sign. This supports helpful people, relationships, creativity and a more balanced use of money.'
      },
      palm: {
        title: 'What your Palm confirms',
        line: 'Fate line',
        body: 'In this current phase, your Fate line supports patient progress through skill, responsibility and finished work.'
      },
      transitions: [
        {
          planet: 'Venus', planetLabel: 'Shukra (Venus)', dashaLabel: 'Shukra (Venus) Pratyantardasha',
          period: 'Now through 1 September 2026', active: true,
          title: 'Support through people and relationships',
          summary: 'Shukra can bring help through your network, close relationships and creative work. Keep expectations and spending clear so the support remains useful.'
        },
        {
          planet: 'Sun', planetLabel: 'Surya (Sun)', dashaLabel: 'Surya (Sun) Pratyantardasha',
          period: '1 September 2026–21 September 2026', active: false,
          title: 'Visibility and recognition',
          summary: 'Surya brings authority, confidence and how your work is seen into focus. A pending approval, an important conversation with a senior person, or recognition for completed work may move forward.'
        },
        {
          planet: 'Moon', planetLabel: 'Chandra (Moon)', dashaLabel: 'Chandra (Moon) Pratyantardasha',
          period: '21 September 2026–25 October 2026', active: false,
          title: 'Emotions, home and family',
          summary: 'Chandra makes feelings, family needs and peace of mind more immediate. Calm conversations and a steady routine help this phase to end with greater clarity.'
        }
      ],
      remedies: [
        { planet: 'Saturn', day: 'Saturday', title: 'For Shani (Saturn)', body: 'On Saturdays, offer food and clean water to a stray dog safely, or donate a simple meal to someone in need.' },
        { planet: 'Mars', day: 'Tuesday', title: 'For Mangal (Mars)', body: 'On Tuesdays, read the Hanuman Chalisa or donate masoor dal, and avoid an argument that can wait.' },
        { planet: 'Venus', day: 'Friday', title: 'For Shukra (Venus)', body: 'On Fridays, keep your home and prayer space clean and donate rice, milk or sweets if practical.' }
      ],
      hope: 'This pressure is temporary. Until the next shift, keep expectations clear, take difficult conversations calmly and finish the work already in motion.',
      remedyNote: 'These are traditional spiritual practices, not guaranteed cures.'
    },
    headline: 'Career progress and recognition have their strongest timing between September 2027 and May 2028.',
    personalAnswers: {
      marriage: {
        title: 'Marriage and close relationships',
        period: 'August 2028–June 2029',
        ageRange: '33-34',
        count: 1,
        answer: 'Serious relationship talks are likely to come to the front in this period. If you are waiting for marriage, this may include both families getting involved or a clear commitment decision. If you have a partner, the same period can bring renewed closeness and shared plans. Across your whole life, your Palm and Kundli point most strongly to one lasting marriage.',
        detail: domains.loveMarriage.palmInsight.meaning,
        supportingConfirmation: `${domains.loveMarriage.supportingConfirmation} This combines the relationship timing in your Kundli with the Heart Line visible in your Palm.`
      },
      children: {
        title: 'Children and family',
        period: 'September 2029–July 2030',
        ageRange: '34-35',
        count: 2,
        answer: 'If children are part of your plans, use this period for serious discussions about time, money, home and help from family. If you already have children, it may bring an important change in school, college or their goals. Across your whole life, your Palm and Kundli point most strongly to two children.',
        detail: domains.familyChildren.palmInsight.meaning,
        supportingConfirmation: `${domains.familyChildren.supportingConfirmation} This combines the family timing in your Kundli with the Heart and Life Lines visible in your Palm.`
      },
      expectedLifeSpan: {
        title: 'Energy, rest and recovery',
        answer: 'Your Life Line shows a steady long-term energy pattern.',
        detail: 'Your Life Line forms a broad, open curve, traditionally linked with steady energy when you protect rest, movement and regular care.',
        supportingLabel: 'What this period means for your energy',
        supportingConfirmation: `${domains.wellbeingEnergy.supportingConfirmation} This period is about energy and recovery only. A Palm reading cannot predict your health, how long you will live or any medical result.`
      }
    },
    strongestWindow: {
      title: 'Career progress and recognition overlap',
      domain: 'careerSuccess',
      window: 'September 2027–May 2028',
      ageRange: '32-33',
      timingState: 'upcoming',
      summary: 'Between September 2027 and May 2028, your strongest career opportunity overlaps with your strongest opportunity to receive recognition for completed work.',
      supportingConfirmation: 'Two separate timing calculations point to career progress and recognition during the same dates.',
      prepareNow: domains.careerSuccess.prepareNow
    },
    positiveTurningPoint: {
      title: 'Career progress and recognition overlap',
      domains: ['careerSuccess', 'recognition'],
      window: 'September 2027–May 2028',
      ageRange: '32-33',
      timingState: 'upcoming',
      summary: 'Between September 2027 and May 2028, your strongest career opportunity overlaps with your strongest opportunity to receive recognition for completed work.',
      whyPersonal: 'Your fate line runs steadily through the centre of your palm, linking progress with visible responsibility and completed work.',
      supportingConfirmation: 'Two separate timing calculations point to career progress and recognition during the same dates.',
      prepareNow: domains.careerSuccess.prepareNow
    },
    domains,
    nextThreeWindows: [
      {
        order: 1,
        title: 'Career and recognition',
        window: 'September 2027–May 2028',
        ageRange: '32-33',
        timingState: 'upcoming',
        summary: 'A larger role, promotion or visible business result becomes the first major focus.',
        prepareNow: 'Complete one result that makes your readiness easy to see.'
      },
      {
        order: 2,
        title: 'Money and wealth',
        window: 'January 2028–December 2029',
        ageRange: '32-34',
        timingState: 'upcoming',
        summary: 'Professional progress can lead to more reliable income and more stable finances.',
        prepareNow: 'Create a reliable way for one income source to grow month after month.'
      },
      {
        order: 3,
        title: 'Relationships and family',
        window: 'August 2028–July 2030',
        ageRange: '33-35',
        timingState: 'upcoming',
        summary: 'Relationships, home and family decisions become the next major chapter, whether you are single, in a relationship or married.',
        prepareNow: 'Use clear conversations and shared planning so both people understand the commitment being made.'
      }
    ],
    whatStrengthensWithAge: {
      title: 'What becomes easier with experience',
      verdict: 'With experience, you become better at making clear decisions, carrying authority and recognising which relationships can remain stable.',
      whyPersonal: 'Your fate line runs steadily through the centre of your palm, and your head line runs steadily across it. Together, they point to lessons becoming practical skill, confidence and clearer standards.',
      supportingConfirmation: 'Your calculated Life Path 6 is associated with trusted responsibility, care and community.',
      prepareNow: 'Keep evidence of what works so each new decision begins from experience instead of urgency.'
    },
    plan90Days: [
      { period: 'First month', action: 'Protect one sleep, movement or focus habit and reduce one duty or habit that keeps exhausting you.', purpose: 'Create the energy needed for the opportunities ahead.' },
      { period: 'Second month', action: 'Finish one meaningful piece of work and show it to your manager, client or the person approving the work.', purpose: 'Turn ability into visible proof before the career period strengthens.' },
      { period: 'Final month', action: 'Review money, relationship and family priorities, then choose one practical commitment.', purpose: 'Make one commitment that your available time, income and relationships can realistically support.' }
    ],
    palmAtGlance: {
      headline: 'Your Palm shows that you trust consistency, decide best with a plan and build career progress through completed work',
      summary: 'You trust love when care is consistent, make your best decisions after comparing the facts, protect your energy with movement and planned rest, and build career progress through completed work.',
      bridge: 'Wait for repeated, consistent actions before deepening trust. Write down your options, choose one and show the work you completed.',
      insights: [
        domains.loveMarriage.palmInsight,
        domains.moneyWealth.palmInsight,
        domains.wellbeingEnergy.palmInsight,
        domains.careerSuccess.palmInsight
      ]
    },
    positiveRecap: {
      title: 'Your way forward',
      summary: 'The current phase is one part of a longer cycle. Move through it steadily; the stronger periods ahead bring clearer support in their own time.',
      milestone: 'Career and recognition — September 2027–May 2028',
      firstStep: 'Choose one simple upay from your current-phase remedies and follow it regularly.',
      palmReminder: 'Your fate line points toward visible responsibility and completed work.'
    },
    timingAvailable: true,
    available: true
  };
  return {
    headline: outlook.headline,
    personalization: { name: 'Aarav Mehta', age: 31, reportDate: '2026-08-10' },
    web: { headline: outlook.headline, lifeOutlook: outlook },
    report: { lifeOutlook: outlook },
    lifeOutlook: outlook,
    nextReadingRecommendation: {
      version: 'palm_next_reading_v1',
      sourceLane: 'palm_answers',
      targetLane: 'partner_name',
      reasonCode: 'relationship_period_near',
      timingState: 'upcoming',
      window: 'August 2028–June 2029',
      domains: ['loveMarriage'],
      horizonMonths: 36
    }
  };
}

function prepareLocalPalmPaidPreview() {
  state.lane = 'palm_answers';
  state.resolvedAngle = 'palm_answers';
  state.rawAngle = 'palm_answers';
  state.screen = 'unlock';
  state.paid = true;
  state.fullLoading = false;
  state.paymentError = '';
  state.pendingVerification = null;
  state.readingId = null;
  state.answers = { ...state.answers, name: 'Aarav Mehta', birthTime: '09:30' };
  state.full = localPalmPaidPreviewFixture();
  previousPaidHistorySettled = true;
  previousPaidHistoryVerified = true;
  state.lastScreenKey = '';
  document.title = `${LOCAL_PALM_SUMMARY_PREVIEW ? 'Palm Summary' : 'Palm Report'} — Local Review`;
}

function renderLocalPalmPaidPreview() {
  const full = state.full || localPalmPaidPreviewFixture();
  const outlook = fullPalmLifeOutlook(full);
  const headline = outlookText(outlook?.headline) || 'Your Complete Palm Life Timeline';
  const markup = LOCAL_PALM_SUMMARY_PREVIEW
    ? `<div class="palm-life-report palm-life-report--summary-preview">${palmLifeSummaryMarkup(full, outlook, headline)}</div>`
    : palmLifeTimelineMarkup(full, headline);
  const closing = LOCAL_PALM_SUMMARY_PREVIEW
    ? ''
    : `${nextReadingRecommendationMarkup(full)}
      <span class="pdf-link" aria-disabled="true">Read my PDF report</span>
      ${postPurchaseEmail()}`;
  show(`<div data-testid="paid-report" data-local-preview="${LOCAL_PALM_SUMMARY_PREVIEW ? 'summary' : 'report'}" class="paid-report--palm-life">${markup}${closing}</div>`);
  stage.querySelectorAll('button').forEach((button) => {
    button.disabled = true;
    button.title = 'Local visual preview only';
  });
  stage.querySelectorAll('input').forEach((input) => {
    input.disabled = true;
  });
}

function renderPalmUnlockE(variant = activePalmPaywallVariant()) {
  pausePalmPaywallInstrumentation();
  const experimentAssignment = ensurePalmNameAlignmentSelection();
  const isHistoricalF = variant === 'f';
  const isG = variant === 'g';
  const proofDensityVariant = variant === 'e'
    ? activePalmProofDensityVariant()
    : 'not_eligible';
  const isGv3 = isG && activeCopyVersion() === PALM_EG_COPY_VERSION;
  // isGv4 renders E exactly, plus the reviewed additive blocks. isLegacyG
  // carries every historical G treatment and must gate all of them.
  // isGv4 is the shared trust-proof base both cohorts render. isGv5 gates only
  // what v5 changed, so a restored v4 session keeps seeing exactly the v4 page
  // it was assigned rather than silently switching treatment mid-session.
  const isGv4 = isG && [PALM_G_TRUST_PROOF_COPY_VERSION, PALM_G_TRUST_PROOF_V5_COPY_VERSION]
    .includes(activeCopyVersion());
  const isGv5 = isG && activeCopyVersion() === PALM_G_TRUST_PROOF_V5_COPY_VERSION;
  const isLegacyG = isG && !isGv4;
  const baseConfig = palmPaywallConfig(laneConfig());
  const config = isGv3 ? { ...baseConfig, ...PALM_G_V3_COPY } : baseConfig;
  const palmHint = isHistoricalF || isLegacyG ? palmTimingHint(palmLifeOutlookPreview()) : {};
  const needsVerification = Boolean(state.pendingVerification);
  const checkoutAction = needsVerification ? 'verify-pending' : 'checkout';
  const checkoutValue = checkoutEventValue();
  const checkoutLabel = palmCheckoutLabel(config, { needsVerification });
  const checkoutLabelForAssistiveTech = !needsVerification && !state.checkoutLoading
    ? checkoutAriaLabel(checkoutLabel, palmCheckoutTaxableValue())
    : checkoutLabel;
  const checkoutPriceNote = !needsVerification && !state.checkoutLoading
    ? checkoutPriceNoteMarkup(palmCheckoutTaxableValue())
    : '';
  const cashfreeFallback = cashfreeFallbackMarkup();
  const strongestFinding = isLegacyG ? palmStrongestFinding() : null;
  const strongestFindingRevealed = Boolean(strongestFinding);
  const timingClue = palmHint.hasStartClue
    ? palmHint.startClue
    : palmHint.yearLevel
      ? 'One future year stands out'
      : 'One important future period stands out';
  const historicalFProofLine = palmHint.status === 'active'
    ? 'One important phase is already unfolding. Its strongest timing and first life area are still sealed.'
    : palmHint.yearLevel
      ? 'One important year stands out. The exact year and what strengthens first are still sealed.'
      : 'One important period stands out. Its exact timing and what strengthens first are still sealed.';
  const gFindingHeadline = strongestFinding?.shared
    ? `Your reading gives equal weight to ${strongestFinding.areaLabel.toLowerCase()}.`
    : strongestFinding
      ? `Your reading points most strongly to ${strongestFinding.areaLabel.toLowerCase()}.`
      : timingClue;
  const gProofLine = strongestFinding
    ? strongestFinding.palmObservation
    : palmHint.status === 'active'
      ? 'One important phase is already unfolding. Its strongest area and timing are in the full report.'
      : palmHint.yearLevel
        ? 'One important year stands out. Its strongest life area and the year itself are in the full report.'
        : 'One important period stands out. Its strongest life area and when it becomes stronger are in the full report.';
  const gProofMarkup = `<div class="personal-proof personal-proof--palm-gap palm-scan-result" data-paywall-section="palm_proof">
    <div class="palm-scan-result__top">
      <div class="palm-scan-result__count" aria-label="Palm lines mapped"><b aria-hidden="true"><i></i><i></i><i></i></b><small>Palm lines<br />mapped</small></div>
      <div class="palm-scan-result__copy"><small>${strongestFindingRevealed ? 'What your reading already shows' : 'Your Palm timing clue'}</small><b>${escapeHtml(gFindingHeadline)}</b><p>${escapeHtml(gProofLine)}</p></div>
    </div>
    <div class="palm-scan-result__steps" aria-label="${strongestFindingRevealed ? 'Three parts of your Palm report still to open' : 'Three sealed answers in your Palm report'}">
      <div><em>01</em><small>${strongestFindingRevealed ? 'The strongest period' : 'Strongest area locked'}</small></div>
      <div><em>02</em><small>${strongestFindingRevealed ? 'What your other areas show' : 'Strongest period locked'}</small></div>
      <div><em>03</em><small>${strongestFindingRevealed ? (palmHint.yearLevel ? 'What may help now' : 'Simple upay') : 'What your Palm reveals'}</small></div>
    </div>
    <div class="palm-scan-result__unlock"><i aria-hidden="true"></i><strong>${strongestFindingRevealed ? 'The rest of your palm timeline opens together' : 'All six Palm answers open together'}</strong></div>
    <p class="palm-scan-result__trust">Dates appear only when your reading supports them clearly.</p>
  </div>`;
  const gV3ProofMarkup = strongestFinding
    ? palmGv3ResultMarkup(strongestFinding, {
        checkoutAction,
        checkoutLabel,
        checkoutLoading: state.checkoutLoading,
        timingHint: palmHint
      })
    : gProofMarkup;
  const historicalFProofMarkup = `<div class="personal-proof personal-proof--palm-gap palm-scan-result" data-paywall-section="palm_proof">
    <div class="palm-scan-result__top">
      <div class="palm-scan-result__count" aria-label="Palm lines mapped"><b aria-hidden="true"><i></i><i></i><i></i></b><small>Palm lines<br />mapped</small></div>
      <div class="palm-scan-result__copy"><small>Your Palm timing clue</small><b>${escapeHtml(timingClue)}</b><p>${escapeHtml(historicalFProofLine)}</p></div>
    </div>
    <div class="palm-scan-result__steps" aria-label="Three sealed answers in your Palm report">
      <div><em>01</em><small>Exact period locked</small></div>
      <div><em>02</em><small>First life area locked</small></div>
      <div><em>03</em><small>What your Palm reveals</small></div>
    </div>
    <div class="palm-scan-result__unlock"><i aria-hidden="true"></i><strong>All six Palm answers open together</strong></div>
    <p class="palm-scan-result__trust">Palm-led answer <i aria-hidden="true">·</i> Unclear details stay broad</p>
  </div>`;
  const eProofMarkup = `<div class="personal-proof personal-proof--palm-gap palm-scan-result" data-paywall-section="palm_proof">
    <div class="palm-scan-result__top">
      <div class="palm-scan-result__count" aria-label="Palm lines mapped"><b aria-hidden="true"><i></i><i></i><i></i></b><small>Palm lines<br />mapped</small></div>
      <div class="palm-scan-result__copy"><small>Palm evidence included</small><b>Your mapped lines are built into this reading.</b><p>See your strongest period, current phase, next three periods and practical next steps across all six life areas.</p></div>
    </div>
    <div class="palm-scan-result__steps" aria-label="New sections inside your Palm report">
      <div><em>01</em><small>Strongest overall period</small></div>
      <div><em>02</em><small>What shapes your current phase</small></div>
      <div><em>03</em><small>Your next three periods</small></div>
    </div>
    <div class="palm-scan-result__unlock"><i aria-hidden="true"></i><strong>All six areas open with practical next steps</strong></div>
    <p class="palm-scan-result__trust">Palm + birth details <i aria-hidden="true">·</i> Downloadable PDF</p>
  </div>`;
  const compactEProofMarkup = `<div class="personal-proof personal-proof--palm-gap palm-scan-result palm-scan-result--compact-evidence" data-paywall-section="palm_proof" data-palm-proof-density-variant="compact_evidence">
    <div class="palm-scan-result__top">
      <div class="palm-scan-result__count" aria-label="Palm lines mapped"><b aria-hidden="true"><i></i><i></i><i></i></b><small>Palm lines<br />mapped</small></div>
      <div class="palm-scan-result__copy"><small>Palm evidence included</small><b>Your mapped lines are built into this reading.</b><p>See your strongest period, current phase, next three periods and practical next steps across all six life areas.</p></div>
    </div>
  </div>`;
  const proofMarkup = isGv3
    ? gV3ProofMarkup
    : isGv4
      ? palmGv4ProofMarkup(isG && activeCopyVersion() === PALM_G_TRUST_PROOF_V5_COPY_VERSION)
    : isLegacyG
      ? gProofMarkup
      : isHistoricalF
        ? historicalFProofMarkup
        : proofDensityVariant === PALM_PROOF_DENSITY_TREATMENT
          ? compactEProofMarkup
          : eProofMarkup;
  const tension = isGv4
    ? 'One of your six areas is already ahead of the rest. Which one it is, and when it becomes strong, is still locked.'
    : isLegacyG
    ? strongestFindingRevealed
      ? 'The timing behind this emphasis—and what your other areas show—is still locked.'
      : 'Your reading has one strongest area. Which area it is—and when it becomes stronger—are still locked.'
    : isHistoricalF
      ? palmHint.status === 'active'
      ? 'One important phase is already unfolding. Its strongest period and first life area are still sealed.'
      : palmHint.yearLevel
        ? 'Your Palm timeline contains one important year. The year and what strengthens first are still sealed.'
        : palmHint.hasStartClue
          ? 'You can see how soon the shift begins. Its exact period and what strengthens first are still sealed.'
          : 'One important future period stands out. Its exact timing and what strengthens first are still sealed.'
      : 'One of six life areas strengthens first. Which one—and the strongest period for each area—are still locked.';
  const trustNote = isGv3
    ? 'Built from your birth details and palm scan. Opens here after payment confirmation · PDF included · Pay once · No subscription.'
    : isLegacyG
      ? 'Read from your own palm, not a generic horoscope. Opens here once payment is confirmed and your report is ready · PDF included · Pay once · No subscription.'
    : isHistoricalF
      ? 'Career, wealth, love, family, recognition and wellbeing—all six Palm answers open together. Secure payment · No subscription.'
    : 'Personal to your palm — not a generic horoscope. Secure payment · No subscription.';
  const gv4TrustBlock = isGv4 ? palmGv4TrustBlockMarkup(isG && activeCopyVersion() === PALM_G_TRUST_PROOF_V5_COPY_VERSION) : '';
  const gv4AddOnTeaser = isGv5 && !needsVerification ? palmGv4AddOnTeaserMarkup() : '';
  const heroName = formatName(state.answers.name || '');
  const gV3HeroCopy = isGv3 ? palmGv3HeroCopy(strongestFinding, heroName, palmHint) : null;
  const heroTitle = isGv3
    ? gV3HeroCopy.title
    : isLegacyG && strongestFinding
      ? strongestFinding.shared
        ? `${heroName ? `${heroName}, your` : 'Your'} reading equally highlights ${strongestFinding.areaLabel.toLowerCase()}.`
        : `${heroName ? `${heroName}, your` : 'Your'} reading highlights ${strongestFinding.areaLabel.toLowerCase()}.`
      : config.unlockTitle;
  const heroSubline = isGv3 ? gV3HeroCopy.subline : config.unlockSubline;
  const unlockClass = isGv3
    ? 'palm-unlock-view--e palm-unlock-view--f palm-unlock-view--g palm-unlock-view--g-v3'
    : isLegacyG
      ? 'palm-unlock-view--e palm-unlock-view--f palm-unlock-view--g'
    : isHistoricalF
      ? 'palm-unlock-view--e palm-unlock-view--f'
      : 'palm-unlock-view--e';
  if (!LOCAL_PALM_PAYWALL_PREVIEW) {
    trackOnce('unlockView', 'unlock_view', {
      product: config.product,
      value: checkoutValue,
      currency: checkoutCurrency(),
      ...(isLegacyG ? {
        strongest_finding_revealed: strongestFindingRevealed,
        strongest_area_keys: strongestFinding?.areaKeys.join('|') || '',
        shared_strongest_result: strongestFinding?.shared === true
      } : {}),
      ...(isGv3 ? {
        strongest_proof_version: strongestFinding?.version || '',
        strongest_proof_has_palm: Boolean(strongestFinding?.palmProofs?.length),
        strongest_proof_cross_checked: Boolean(strongestFinding?.corroboration)
      } : {}),
      ...palmNameAlignmentExperimentAnalytics(),
      ...priceComparisonAnalytics()
    });
  }
  show(`<div class="${unlockClass}" data-testid="unlock-view" data-paywall-variant="${escapeHtml(variant)}" data-palm-proof-density-variant="${escapeHtml(proofDensityVariant)}">
    <div data-paywall-section="hero"><div class="kicker center">${escapeHtml(config.unlockKicker)}</div>
    <h1 class="unlock-title">${escapeHtml(heroTitle)}</h1>
    <p class="unlock-subtitle">${escapeHtml(heroSubline)}</p></div>
    ${proofMarkup}
    ${isGv3 && strongestFindingRevealed ? '' : `<div class="value-tension" data-paywall-section="value_tension"><i>✦</i><p>${escapeHtml(tension)}</p></div>`}
    ${state.paymentError ? `<div class="error-card" data-testid="payment-error">${escapeHtml(state.paymentError)}</div>` : ''}
    ${paymentDismissRecoveryMarkup()}
    <div class="unlock-top-checkout" data-paywall-section="top_checkout">${gv4AddOnTeaser}<button class="primary-button" type="button" data-action="${checkoutAction}" data-palm-checkout data-placement="top" data-testid="checkout-button-top" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
    ${checkoutPriceNote}
    ${needsVerification ? '' : paymentMethodTrustMarkup()}</div>
    <div class="trust-note center" data-testid="palm-trust-note">${escapeHtml(trustNote)}</div>${isGv5 ? '' : gv4TrustBlock}
    ${isGv3 ? palmLockedReportPreviewMarkupG(strongestFinding, palmHint) : isGv4 ? palmGv4LockedPreviewMarkup(isGv5) : palmLockedReportPreviewMarkupE(config)}
    ${isGv3 ? palmPurchaseMarkupG(config, strongestFinding, palmHint) : palmPurchaseMarkupE(config)}
    ${isGv5 ? gv4TrustBlock : ''}
    <button class="primary-button" type="button" data-action="${checkoutAction}" data-palm-checkout data-placement="bottom" data-paywall-section="bottom_checkout" data-testid="checkout-button" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
    ${checkoutPriceNote}
    ${needsVerification ? '' : paymentMethodTrustMarkup({ bottom: true })}
    ${cashfreeFallback}
    ${needsVerification ? '<div class="small-note">Do not pay again. We will check the payment response already received.</div>' : ''}
  </div>`);
  stage.insertAdjacentHTML('beforeend', `<div class="mobile-checkout-dock mobile-checkout-dock--e${isGv3 ? ' mobile-checkout-dock--g-v3' : ''}"><button class="primary-button" type="button" data-action="${checkoutAction}" data-palm-checkout data-placement="sticky" data-testid="checkout-button-sticky" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>${checkoutPriceNote}${needsVerification ? '<span>We will check your completed payment. Do not pay again.</span>' : isGv3 ? '<span>UPI & cards · One-time payment · No subscription</span>' : paymentMethodTrustMarkup({ compact: true })}</div>`);
  updatePalmNameAlignmentCheckoutUi();
  focusPaymentDismissRecoveryTargets(
    stage.querySelector('[data-testid="payment-dismiss-recovery"]')
  );
  requestAnimationFrame(setupPaymentDismissRecoveryExposure);
  requestAnimationFrame(() => setupPalmPaywallInstrumentation(experimentAssignment));
}

function mahakundliPaywallDate(value) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date);
}

function mahakundliOrdinal(value) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) return String(value || '');
  const remainder100 = number % 100;
  const suffix = remainder100 >= 11 && remainder100 <= 13
    ? 'th'
    : ({ 1: 'st', 2: 'nd', 3: 'rd' }[number % 10] || 'th');
  return `${number}${suffix}`;
}

const MAHAKUNDLI_PLANET_DISPLAY = Object.freeze({
  Sun: 'Surya (Sun)',
  Moon: 'Chandra (Moon)',
  Mars: 'Mangal (Mars)',
  Mercury: 'Budh (Mercury)',
  Jupiter: 'Guru (Jupiter)',
  Venus: 'Shukra (Venus)',
  Saturn: 'Shani (Saturn)',
  Rahu: 'Rahu (North Node)',
  Ketu: 'Ketu (South Node)'
});

const MAHAKUNDLI_RASHI_DISPLAY = Object.freeze({
  Aries: 'Mesha (Aries)',
  Taurus: 'Vrishabha (Taurus)',
  Gemini: 'Mithuna (Gemini)',
  Cancer: 'Karka (Cancer)',
  Leo: 'Simha (Leo)',
  Virgo: 'Kanya (Virgo)',
  Libra: 'Tula (Libra)',
  Scorpio: 'Vrishchika (Scorpio)',
  Sagittarius: 'Dhanu (Sagittarius)',
  Capricorn: 'Makara (Capricorn)',
  Aquarius: 'Kumbha (Aquarius)',
  Pisces: 'Meena (Pisces)'
});

function mahakundliPlanetName(value) {
  const planet = String(value || '').trim();
  return MAHAKUNDLI_PLANET_DISPLAY[planet] || planet;
}

function mahakundliPlanetText(value) {
  let text = String(value || '');
  const protectedLabels = [];
  for (const display of Object.values(MAHAKUNDLI_PLANET_DISPLAY)) {
    const token = `\uE000${protectedLabels.length}\uE001`;
    protectedLabels.push(display);
    text = text.replaceAll(display, token);
  }
  for (const [english, display] of Object.entries(MAHAKUNDLI_PLANET_DISPLAY)) {
    text = text.replace(new RegExp(`\\b${english}\\b`, 'gi'), display);
  }
  protectedLabels.forEach((display, index) => {
    text = text.replaceAll(`\uE000${index}\uE001`, display);
  });
  return text;
}

function mahakundliRashiName(value) {
  const sign = String(value || '').trim();
  return MAHAKUNDLI_RASHI_DISPLAY[sign] || sign;
}

function mahakundliRashiText(value) {
  let text = String(value || '');
  const protectedLabels = [];
  const activeState = typeof state === 'object' && state ? state : {};
  const protectedCustomerText = [
    activeState.answers?.name,
    activeState.answers?.place,
    activeState.full?.web?.mahakundli?.birthSnapshot?.name,
    activeState.full?.web?.mahakundli?.birthSnapshot?.place
  ].map((item) => String(item || '').trim()).filter(Boolean);
  for (const item of [...Object.values(MAHAKUNDLI_RASHI_DISPLAY), ...protectedCustomerText]) {
    const token = `\uE100${protectedLabels.length}\uE101`;
    protectedLabels.push(item);
    text = text.replaceAll(item, token);
  }
  for (const [english, display] of Object.entries(MAHAKUNDLI_RASHI_DISPLAY)) {
    text = text.replace(new RegExp(`\\b${english}\\b`, 'gi'), display);
  }
  protectedLabels.forEach((item, index) => {
    text = text.replaceAll(`\uE100${index}\uE101`, item);
  });
  return text;
}

function plainMahakundliText(value) {
  const plain = String(value || '')
    .replace(/\bseventeen\b/gi, '17')
    .replace(/\b36 months\b/gi, '3 years')
    .replace(/\bchapters\b/gi, 'life areas')
    .replace(/\bchapter\b/gi, 'life area')
    .replace(/\bmaterial limit\b/gi, "what astrology can't decide")
    .replace(/\bwithheld\b/gi, (word) => word[0] === 'W' ? 'Not shown' : 'not shown')
    .replace(/\bcannot be supported\b/gi, 'cannot be calculated reliably')
    .replace(/\bcannot support\b/gi, 'cannot be calculated reliably')
    .replace(/\breceives constructive support\b/gi, 'has favourable timing')
    .replace(/\bshows both support and pressure\b/gi, 'has favourable timing with a caution')
    .replace(/\bhas support\b/gi, 'has favourable timing')
    .replace(/\bsupport is active\b/gi, 'timing is favourable now')
    .replace(/\btiming supports commitment\b/gi, 'this is a favourable time for commitment')
    .replace(/\breceives stronger support\b/gi, 'has stronger timing')
    .replace(/\breceives better support\b/gi, 'has better timing')
    .replace(/\bromantic support strengthens later\b/gi, 'timing for love improves later')
    .replace(/\bromantic support strengthens\b/gi, 'timing for love improves')
    .replace(/\bcommitment gains support\b/gi, 'commitment has more favourable timing')
    .replace(/\bresponsibility can grow with support\b/gi, 'responsibility can grow with the right preparation')
    .replace(/\bbetter supported\b/gi, 'better timed')
    .replace(/\bsupport is present\b/gi, 'timing is favourable')
    .replace(/\brecovery support improves\b/gi, 'recovery timing improves')
    .replace(/\bthe chart supports\b/gi, 'the kundli points to')
    .replace(/\bsupport improves\b/gi, 'timing improves')
    .replace(/\bsupport strengthens\b/gi, 'timing improves')
    .replace(/\bsupported timing\b/gi, 'timing')
    .replace(/\bsupported period\b/gi, 'favourable period')
    .replace(/\bsupported phase\b/gi, 'stronger phase')
    .replace(/\bsupported Antardasha\b/gi, 'stronger Antardasha')
    .replace(/\bno supported\b/gi, 'no stronger')
    .replace(/\bhidden exposure\b/gi, 'hidden risk')
    .replace(/\bthe later tailwind\b/gi, 'the better period')
    .replace(/\bexpansion would magnify\b/gi, 'growth would increase')
    .replace(/\bmovement is better backed\b/gi, 'travel timing improves')
    .replace(/\bthe decision distance can(?:'|’)t solve for you\b/gi, 'the problem a new place cannot solve')
    .replace(/\bweak control\b/gi, 'missing safeguard')
    .replace(/\bcontrol to strengthen\b/gi, 'safeguard to put in place')
    .replace(/\bcontract discipline\b/gi, 'clearer contracts')
    .replace(/\bwhy it qualifies\b/gi, 'why that period is stronger')
    .replace(/\bduty cycle\b/gi, 'family-duty period')
    .replace(/\bhouse\s+(\d{1,2})\b/gi, (_match, house) => `${mahakundliOrdinal(house)} house`)
    .replace(/\s+—\s+/g, ': ');
  return mahakundliRashiText(mahakundliPlanetText(plain));
}

const MAHAKUNDLI_LOCKED_LEAD_PRESENTATION = Object.freeze({
  self: Object.freeze({ hook: 'Something changed when this dasha began.', subject: 'Your life-direction answer' }),
  childhoodParents: Object.freeze({ hook: 'Family responsibilities can affect your own plans.', subject: 'Your parents and family answer' }),
  education: Object.freeze({ hook: 'Exams, higher studies and a professional course need separate timing.', subject: 'Your study answer' }),
  siblings: Object.freeze({ hook: 'Money, property and unequal duty can strain siblings.', subject: 'Your sibling answer' }),
  love: Object.freeze({ hook: 'Mixed signals can keep a relationship uncertain.', subject: 'Your love answer' }),
  marriage: Object.freeze({ hook: 'Marriage decisions need clarity from both people.', subject: 'Your marriage answer' }),
  children: Object.freeze({ hook: 'Children and family responsibilities need time, money and help at home.', subject: 'Your family answer' }),
  familyHome: Object.freeze({ hook: 'Property decisions can carry family pressure too.', subject: 'Your home and property answer' }),
  healthWellbeing: Object.freeze({ hook: 'Daily wellbeing starts with sleep, movement and recovery.', subject: 'Your wellbeing answer' }),
  careerDirection: Object.freeze({ hook: 'Staying, changing direction and waiting are three different choices.', subject: 'Your career answer' }),
  jobChange: Object.freeze({ hook: 'Changing jobs may not change the real problem.', subject: 'Your job-change answer' }),
  promotion: Object.freeze({ hook: 'Bigger titles can also mean more work without more authority.', subject: 'Your promotion answer' }),
  businessPartnerships: Object.freeze({ hook: 'One weak agreement can make business growth expensive.', subject: 'Your business check' }),
  moneyProperty: Object.freeze({ hook: 'Income can grow while security still feels far away.', subject: 'The money answer' }),
  lossDebtRisk: Object.freeze({ hook: 'Loans, guarantees and repeated expenses can quietly become a burden.', subject: 'Your risk check' }),
  fameRecognition: Object.freeze({ hook: 'Recognition can bring respect, customers or only temporary noise.', subject: 'Your recognition answer' }),
  travelPurpose: Object.freeze({ hook: 'Going abroad helps only when the purpose is clear.', subject: 'Your travel answer' }),
  nextPeriod: Object.freeze({ hook: 'Dasha periods change on calculated dates.', subject: 'The next-period timeline' })
});

const MAHAKUNDLI_BIRTH_DATE_PAYWALL_QUESTIONS = Object.freeze([
  Object.freeze({ key: 'marriage', emoji: '♥', title: 'Marriage: what should you check before deciding?', leadIn: 'Review money, family expectations and responsibilities. Personal dates appear only when your birth details support them.' }),
  Object.freeze({ key: 'children', emoji: '◌', title: 'Children and family: what support should you plan?', leadIn: 'Review the time, money and help at home that family responsibilities may need.' }),
  Object.freeze({ key: 'careerDirection', emoji: '↗', title: 'Career: what should you compare before changing direction?', leadIn: 'Compare your current field, another direction and the responsibilities each option may bring.' }),
  Object.freeze({ key: 'jobChange', emoji: '⇢', title: 'Job: what makes a new role genuinely better?', leadIn: 'Compare the role, manager, pay, pressure and emergency savings before deciding.' }),
  Object.freeze({ key: 'promotion', emoji: '▲', title: 'Promotion: what should change besides the title?', leadIn: 'Check whether a bigger role would bring authority and pay, or only more work.' }),
  Object.freeze({ key: 'businessPartnerships', emoji: '◇', title: 'Business: which agreement needs a closer look?', leadIn: 'Check roles, ownership, payments and exit terms before expanding.' }),
  Object.freeze({ key: 'moneyProperty', emoji: '₹', title: 'Money: what should you review before taking a new risk?', leadIn: 'Check saving, debts, guarantees and recurring expenses before deciding.' }),
  Object.freeze({ key: 'healthWellbeing', emoji: '◐', title: 'Wellbeing: which daily habit needs protection?', leadIn: 'Review sleep, movement and recovery while keeping medical decisions with a qualified professional.' })
]);

function mahakundliLockedLeadIn(item = {}) {
  const presentation = MAHAKUNDLI_LOCKED_LEAD_PRESENTATION[item.key] || Object.freeze({
    hook: 'Every life area needs its own check.',
    subject: 'Your full report'
  });
  const subject = presentation.subject;
  const lowerSubject = `${subject.charAt(0).toLowerCase()}${subject.slice(1)}`;
  const leadIn = plainMahakundliText(item.leadIn || '')
    .replace(/^See\s+/i, `${subject} shows `)
    .replace(/([.!?]\s+)See\s+/g, `$1${subject} shows `)
    .replace(/,\s*see\s+/gi, `; ${lowerSubject} shows `);
  return `${presentation.hook} ${leadIn}`.trim();
}

function mahakundliRemainingDays(endValue, nowValue = Date.now()) {
  const start = new Date(nowValue);
  const end = new Date(endValue);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return null;
  return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
}

function mahakundliPreviewTimingIsComplete(previewTiming = {}, chart = {}) {
  if (chart?.precision !== 'timed' || chart?.precisionReason === 'birthplace_unresolved') return false;
  if (previewTiming?.available !== true) return false;
  const asOf = Date.parse(previewTiming.asOf);
  if (!Number.isFinite(asOf)) return false;
  const periodBounds = (period) => {
    const lord = String(period?.lord || '').trim();
    const start = Date.parse(period?.start);
    const end = Date.parse(period?.end);
    if (!Object.prototype.hasOwnProperty.call(MAHAKUNDLI_PLANET_DISPLAY, lord)) return null;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return null;
    if (asOf < start || asOf >= end) return null;
    return { start, end };
  };
  const maha = periodBounds(previewTiming.maha);
  const antar = periodBounds(previewTiming.antar);
  const pratyantar = periodBounds(previewTiming.pratyantar);
  return Boolean(
    maha
    && antar
    && pratyantar
    && maha.start <= antar.start
    && antar.end <= maha.end
    && antar.start <= pratyantar.start
    && pratyantar.end <= antar.end
  );
}

function mahakundliBirthEyebrow() {
  const date = prefillDisplayDate(state.answers.dob);
  const time = prefillDisplayTime(state.answers.birthTime);
  const place = String(
    state.answers.location?.label
    || state.answers.location?.place
    || state.answers.place
    || ''
  ).trim();
  return `Calculated from ${date} · ${time}${place ? ` · ${place}` : ''}`;
}

function renderMahakundliUnlock() {
  const config = laneConfig();
  const lanePreview = state.preview?.lanePreview || {};
  const previewTiming = lanePreview.timing || {};
  const proof = actualProof();
  const name = formatName(state.answers.name || '');
  const birthTimeUnknown = state.answers.birthTime === 'unknown';
  const birthplaceUnresolved = state.preview?.chart?.precisionReason === 'birthplace_unresolved';
  const hasCompletePersonalTiming = mahakundliPreviewTimingIsComplete(
    previewTiming,
    state.preview?.chart || {}
  );
  const dateLevel = birthTimeUnknown || birthplaceUnresolved || !hasCompletePersonalTiming;
  const precisionCause = birthTimeUnknown
    ? birthplaceUnresolved
      ? 'You did not give a reliable birth time, and we could not match the birthplace. This report shows facts that stay the same throughout your birth date and current general transits. It does not show houses or personal dasha dates.'
      : 'You did not give a reliable birth time. This report shows birth-date facts and current general transits. It does not show houses or personal dasha dates.'
    : birthplaceUnresolved
      ? 'We could not confirm the birthplace. Your birth time is saved, but personal houses and dates need a matched place. This report shows only facts that are the same for every possible birth time on that date.'
      : 'Your birth details could not produce a timed kundli. This report shows birth-date facts, and time-sensitive results are not shown.';
  const precisionNoticeTitle = birthTimeUnknown
    ? birthplaceUnresolved
      ? 'Birth time and birthplace not available'
      : 'Birth time not available'
    : birthplaceUnresolved
      ? 'Birthplace needs confirmation'
      : 'Birth details need confirmation';
  const precisionNoticeBody = birthTimeUnknown
    ? birthplaceUnresolved
      ? 'Personal Lagna, houses, varga charts, yogas, doshas and dasha dates are not shown. The report still includes the birth-date facts and general transits that can be calculated reliably.'
      : 'Personal Lagna, houses, varga charts, yogas, doshas and dasha dates are not shown. You can add a reliable birth time later to calculate them.'
    : birthplaceUnresolved
      ? 'Your entered birth time is saved. Personal Lagna, houses, varga charts, yogas, doshas and dasha dates are not shown until the birthplace is confirmed.'
      : 'Lagna, houses, varga charts, yogas, doshas and personal dasha dates are not shown until the required birth details can be checked.';
  const needsVerification = Boolean(state.pendingVerification);
  const checkoutAction = needsVerification ? 'verify-pending' : 'checkout';
  const assignedPricing = currentPricing();
  const amount = Number(assignedPricing.amount || 500);
  const activeMaha = previewTiming.maha || null;
  const activeAntar = previewTiming.antar || null;
  const timedPeriod = !dateLevel && hasCompletePersonalTiming && activeMaha && activeAntar;
  const periodName = timedPeriod
    ? `${mahakundliPlanetName(activeMaha.lord)}–${mahakundliPlanetName(activeAntar.lord)}`
    : '';
  const periodEnd = timedPeriod ? mahakundliPaywallDate(activeAntar.end) : '';
  const remainingDays = timedPeriod
    ? mahakundliRemainingDays(activeAntar.end)
    : null;
  const periodEnded = timedPeriod
    && Number.isInteger(remainingDays)
    && new Date(activeAntar.end).getTime() <= Date.now();
  const remainingDayLabel = Number.isInteger(remainingDays)
    ? `${remainingDays.toLocaleString('en-IN')} ${remainingDays === 1 ? 'day' : 'days'}`
    : '';
  const hasPersonalLockedReveals = Array.isArray(lanePreview.lockedReveals) && lanePreview.lockedReveals.length > 0;
  const usePersonalLockedReveals = !dateLevel && hasPersonalLockedReveals;
  const lockedQuestions = dateLevel
    ? MAHAKUNDLI_BIRTH_DATE_PAYWALL_QUESTIONS
    : usePersonalLockedReveals
      ? lanePreview.lockedReveals
      : config.paywallQuestions || [];
  const personalLockedChapterCount = usePersonalLockedReveals
    ? lockedQuestions.filter((item) => item.key !== 'nextPeriod').length
    : 0;
  const heroTitle = dateLevel
    ? name
      ? `${name}, your birth-date report is ready.`
      : 'Your birth-date report is ready.'
    : periodEnded
      ? `${name ? `${name}, ` : ''}your saved ${periodName} period has reached its calculated end date.`
    : timedPeriod
      ? `${name ? `${name}, ` : ''}your ${periodName} period runs until ${periodEnd}.`
      : name
        ? `${name}, your first calculated result is ready.`
        : config.unlockTitle;
  const heroSubline = dateLevel
    ? precisionCause
    : periodEnded
      ? 'Recalculate your Mahakundli to find the period running now. Your saved report will remain available.'
    : timedPeriod && remainingDayLabel
      ? `${remainingDayLabel} left in this sub-period.`
      : config.unlockSubline;
  const deliverables = dateLevel
      ? [
        'The position of Surya (Sun), plus the position of Chandra (Moon) when it is the same for every possible birth time on that date',
        'Current Guru (Jupiter), Shani (Saturn), Rahu (North Node) and Ketu (South Node) transits in simple words',
        '17 life areas with practical questions, actions and clear limits',
        'A calculation record showing exactly what was used',
        'A PDF of the same birth-date report'
      ]
    : config.deliverables;
  const checkoutLabel = state.checkoutLoading
    ? needsVerification ? 'Checking your payment…' : 'Opening secure payment…'
    : needsVerification
      ? 'Check my completed payment'
      : dateLevel
        ? 'Open my birth-date report'
        : 'Open all 17 life areas';
  const checkoutLabelForAssistiveTech = !needsVerification && !state.checkoutLoading
    ? checkoutAriaLabel(checkoutLabel, amount)
    : checkoutLabel;
  const checkoutPriceNote = !needsVerification && !state.checkoutLoading
    ? checkoutPriceNoteMarkup(amount)
    : '';
  const freeProofTitle = dateLevel
    ? 'Your first birth-date result is ready.'
    : plainMahakundliText(lanePreview.title || proof.title);
  const freeProofLine = dateLevel
    ? 'Your birth-date calculation is ready.'
    : plainMahakundliText(lanePreview.value || proof.line);
  const freeProofDetail = dateLevel
    ? 'This result uses only facts that can be calculated from the available birth details and clearly marks anything that cannot be shown.'
    : plainMahakundliText(lanePreview.detail || proof.detail);
  const proofRows = dateLevel
    ? []
    : Array.isArray(lanePreview.proof)
      ? lanePreview.proof.map((item) => plainMahakundliText(item || '').trim()).filter(Boolean).slice(0, 3)
      : [];
  const specificityPromise = dateLevel
    ? 'Your paid birth-date report will use the birth details you gave, show the stable birth-date facts and current general transits that can be calculated reliably, and explain the basis for each answer. It will clearly mark personal dates and chart details that cannot be shown. If it misses anything promised for the details you provided, tell us within 7 days. We will correct or prepare the report again. If we still cannot deliver what was promised, we will refund your report payment.'
    : 'Your paid report will use the birth details you gave, show all personal dasha dates and graha positions that can be calculated reliably, and explain the basis for each answer. If it misses anything promised for the details you provided, tell us within 7 days. We will correct or prepare the report again. If we still cannot deliver what was promised, we will refund your report payment.';
  trackOnce('unlockView', 'unlock_view', {
    product: config.product,
    value: checkoutEventValue(),
    currency: 'INR',
    free_result_shown: Boolean(lanePreview.title),
    ...priceComparisonAnalytics()
  });
  show(`<div class="mahakundli-paywall" data-testid="unlock-view" data-mahakundli-paywall="true">
    <span data-testid="mahakundli-paywall" hidden></span>
    <section class="mahakundli-paywall__hero" data-paywall-section="hero">
      <div class="mahakundli-kicker">${escapeHtml(dateLevel ? 'Your birth-date report is ready' : mahakundliBirthEyebrow())}</div>
      <h1>${escapeHtml(heroTitle)}</h1>
      <p>${escapeHtml(plainMahakundliText(heroSubline))}</p>
    </section>

    <section class="mahakundli-free-proof" data-paywall-section="free_result">
      <div class="mahakundli-free-proof__head"><span>✓</span><div><small>${escapeHtml(config.proofLabel)}</small><h2>${escapeHtml(freeProofTitle)}</h2></div></div>
      <strong>${escapeHtml(freeProofLine)}</strong>
      <p>${escapeHtml(freeProofDetail)}</p>
      ${proofRows.length ? `<div class="mahakundli-free-proof__receipts">${proofRows.map((item) => `<span>${escapeHtml(plainMahakundliText(item))}</span>`).join('')}</div>` : ''}
      <div class="mahakundli-free-proof__bridge">${dateLevel
        ? 'Your free result shows what is the same for every possible birth time on your birth date. The paid birth-date report applies the same method to all 17 life areas and marks any time-sensitive answer that cannot be calculated reliably.'
        : 'You have seen your running dasha and one life-area answer. The complete report includes the important dates, points to watch and next steps for the other 16 life areas.'}</div>
    </section>

    ${timedPeriod ? `<section class="mahakundli-period-clock" data-paywall-section="period_clock">
      <small>${periodEnded ? 'Saved Antardasha end date' : 'Your next Antardasha change'}</small>
      <b>${escapeHtml(periodEnd)}</b>
      <span>${periodEnded
        ? 'This saved sub-period has ended. Recalculate to find the period running now.'
        : remainingDayLabel
          ? `${escapeHtml(remainingDayLabel)} left in this sub-period · Days remaining update each time you open this page`
          : 'The exact end date is saved in your calculation.'}</span>
    </section>` : ''}

    ${state.paymentError ? `<div class="error-card" data-testid="payment-error">${escapeHtml(state.paymentError)}</div>` : ''}

    <section class="mahakundli-paywall__checkout" data-paywall-section="top_checkout">
      ${mahakundliCategoryAnchorMarkup('mahakundli-category-anchor--paywall')}
      ${mahakundliPriceMarkup('mahakundli-price--paywall', assignedPricing)}
      <button class="primary-button mahakundli-cta" type="button" data-action="${checkoutAction}" data-palm-checkout data-placement="top" data-testid="checkout-button-top" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
      ${checkoutPriceNote}
      ${needsVerification ? '' : paymentMethodTrustMarkup()}
      <div class="mahakundli-paywall__trust">
        <span>${MAHAKUNDLI_VERIFIED_PAID_REPORT_FLOOR} paid reports delivered</span>
        <span>Each available answer shows the factors used</span>
        <span>We do not show results that cannot be calculated reliably</span>
        <span>One payment · no subscription</span>
        <span>Opens after payment · PDF included</span>
        <span>Your birth details are not sold</span>
      </div>
      <div class="mahakundli-specificity-promise"><b>Our promise to you</b><span>${escapeHtml(specificityPromise)}</span><a href="/terms-and-conditions.html">Read the terms</a></div>
    </section>

    <section class="mahakundli-locked" data-paywall-section="locked_answers">
      <div class="mahakundli-section-kicker">${usePersonalLockedReveals ? 'Each life area is checked separately' : 'What the full report checks'}</div>
      <h2>${usePersonalLockedReveals
        ? `1 answer is open. ${personalLockedChapterCount} more life areas and your next dasha are ready.`
        : dateLevel
          ? '8 life areas. 8 example questions.'
          : '7 life areas and your next dasha. 8 example questions.'}</h2>
      <p class="mahakundli-locked__lead">${usePersonalLockedReveals
        ? 'Marriage timing is not the same as money risk. A job switch is not the same as family responsibility. Every answer below comes from a separate check.'
        : dateLevel
          ? 'Marriage, money, work, business, wellbeing and family are checked separately. Personal dates are shown only when they can be calculated reliably.'
          : 'Marriage, money, work, business, wellbeing, recognition, family and the next dasha are checked separately.'}</p>
      <div class="mahakundli-locked__grid">${lockedQuestions.map((item) => `<article>
        <span>${item.emoji}</span><div><h3>${escapeHtml(plainMahakundliText(item.title))}</h3><p>${escapeHtml(mahakundliLockedLeadIn(item))}</p></div><i aria-hidden="true">🔒</i>
      </article>`).join('')}</div>
    </section>

    <section class="mahakundli-paywall__method" data-paywall-section="method">
      <div><small>How each life area is built</small><h2>Each life area has its own consistent check.</h2></div>
      <ul>
        <li><b>Your answer</b><span>The conclusion in one line</span></li>
        <li><b>Why</b><span>${dateLevel ? 'The birth-date fact or general current transit used' : 'The house, planet, dasha or transit used'}</span></li>
        <li><b>When</b><span>${dateLevel ? 'A clear note when a personal date cannot be calculated' : 'The date, or a clear answer when no date can be shown'}</span></li>
        <li><b>What to do</b><span>The first practical step</span></li>
        <li><b>What astrology cannot promise</b><span>The limit of this answer</span></li>
      </ul>
    </section>

    <section class="mahakundli-paywall__includes" data-paywall-section="report_contents">
      <div class="mahakundli-section-kicker">${dateLevel ? 'Birth-date report' : 'Complete Mahakundli Report'}</div>
      <h2>${dateLevel ? 'What the report includes and what cannot be shown.' : 'What your complete report includes.'}</h2>
      <ul>${deliverables.map((item) => `<li><span>✓</span>${escapeHtml(plainMahakundliText(item))}</li>`).join('')}</ul>
      ${dateLevel ? `<div class="mahakundli-precision-notice"><b>${escapeHtml(precisionNoticeTitle)}</b><span>${escapeHtml(precisionNoticeBody)}</span></div>` : ''}
      <div class="mahakundli-paywall__quality"><b>How we checked your report</b><span>Your report records the calculation method, the birth details used, the factors checked and each limitation.</span></div>
    </section>

    <section class="mahakundli-paywall__final" data-paywall-section="bottom_checkout">
      ${mahakundliWheelMarkup()}
      <div>
        <h2>${dateLevel ? 'Your birth-date report is ready.' : 'Your timing map and all 17 life areas are ready.'}</h2>
        <p>${dateLevel
          ? 'Open the stable facts, current general transits and practical guidance for all 17 life areas. Personal dates that cannot be calculated reliably are clearly not shown.'
          : 'See what is in your favour, what needs care, the dates that matter, and the first step for every life area.'}</p>
        ${mahakundliPriceMarkup('mahakundli-price--paywall', assignedPricing)}
        <button class="primary-button mahakundli-cta" type="button" data-action="${checkoutAction}" data-palm-checkout data-placement="bottom" data-testid="checkout-button" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
        ${checkoutPriceNote}
        ${needsVerification ? '' : paymentMethodTrustMarkup({ bottom: true })}
      </div>
    </section>
    <div class="mahakundli-saved-exit"><b>Not ready yet?</b><span>${dateLevel
      ? 'Keep this tab. Your birth-date report will reopen here when you return.'
      : 'Keep this tab. Your kundli will reopen here when you return.'}</span></div>
    ${cashfreeFallbackMarkup()}
    ${needsVerification ? '<div class="small-note">Do not pay again. We will check the payment response already received.</div>' : ''}
    <div class="method-note">Vedic astrology offers planning guidance. It does not predict a fixed future or replace medical, legal or financial advice.</div>
  </div>`);
  stage.insertAdjacentHTML('beforeend', `<div class="mobile-checkout-dock mobile-checkout-dock--mahakundli"><button class="primary-button" type="button" data-action="${checkoutAction}" data-palm-checkout data-placement="sticky" data-testid="checkout-button-sticky" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>${checkoutPriceNote}${needsVerification ? '<span>We will check your completed payment. Do not pay again.</span>' : '<span>UPI & cards · One-time payment · PDF included</span>'}</div>`);
  observeMahakundliCheckoutDock();
  requestAnimationFrame(() => setupPalmPaywallInstrumentation(null));
}

function renderGlobalPalmUnlock() {
  const config = LANES.palm_answers;
  const proof = actualProof();
  if (!globalCheckoutEnabled()) {
    if (!LOCAL_PALM_PAYWALL_PREVIEW) {
      trackOnce('unlockView', 'unlock_view', {
        product: 'free_palm_preview',
        value: 0,
        currency: checkoutCurrency(),
        storefront: 'global'
      });
    }
    show(`<div class="palm-unlock-view--e" data-testid="unlock-view" data-storefront="global" data-checkout-state="disabled">
      <div data-paywall-section="hero"><div class="kicker center">Your free Palm preview is ready</div><h1 class="unlock-title">${escapeHtml(proof.title)}</h1>${proof.line ? `<p class="unlock-subtitle">${escapeHtml(proof.line)}</p>` : ''}</div>
      ${proof.detail ? `<section class="personal-proof"><small>Your symbolic preview</small><span>${escapeHtml(proof.detail)}</span></section>` : ''}
      <div class="method-note">The complete international report is not available in this release. Your free preview remains here.</div>
      <button class="primary-button" type="button" data-testid="global-checkout-unavailable" aria-label="Complete international report unavailable" disabled>Complete report unavailable</button>
      <div class="life-method-footer">${escapeHtml(STOREFRONT.reportDisclaimer)}</div>
    </div>`);
    return;
  }
  const amount = palmBasePrice();
  const checkoutLabel = state.checkoutLoading
    ? 'Opening secure payment…'
    : config.payCta;
  const checkoutPriceNote = checkoutPriceNoteMarkup(amount);
  if (!LOCAL_PALM_PAYWALL_PREVIEW) {
    trackOnce('unlockView', 'unlock_view', {
      product: config.product,
      value: checkoutEventValue(),
      currency: checkoutCurrency(),
      storefront: 'global',
      ...priceComparisonAnalytics()
    });
  }
  show(`<div class="palm-unlock-view--e" data-testid="unlock-view" data-storefront="global">
    <div data-paywall-section="hero">
      <div class="kicker center">${escapeHtml(config.unlockKicker)}</div>
      <h1 class="unlock-title">${escapeHtml(config.unlockTitle)}</h1>
      <p class="unlock-subtitle">${escapeHtml(config.unlockSubline)}</p>
    </div>
    <section class="personal-proof" data-paywall-section="personal_proof">
      <small>${escapeHtml(config.proofLabel)}</small>
      <b>${escapeHtml(proof.title || 'Your first Palm insight is ready.')}</b>
      ${proof.line ? `<span>${escapeHtml(proof.line)}</span>` : ''}
      ${proof.detail ? `<span>${escapeHtml(proof.detail)}</span>` : ''}
    </section>
    <div class="value-tension" data-paywall-section="value_proposition"><i>✦</i><p>${escapeHtml(config.tension)}</p></div>
    ${state.paymentError ? `<div class="error-card" data-testid="payment-error">${escapeHtml(state.paymentError)}</div>` : ''}
    <div class="unlock-top-checkout" data-paywall-section="top_checkout">
      <button class="primary-button" type="button" data-action="checkout" data-palm-checkout data-placement="top" data-testid="checkout-button-top" aria-label="${escapeHtml(checkoutAriaLabel(checkoutLabel, amount))}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
      ${checkoutPriceNote}
      ${paymentMethodTrustMarkup()}
    </div>
    <section class="unlock-includes" data-testid="unlock-includes" data-paywall-section="deliverables">
      <small>Inside your complete report</small><b>Only what this scan can support</b>
      <ul class="deliverables">${config.deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
    </section>
    <section class="locked-sheet" data-paywall-section="locked_answers">
      <small>Your full Palm profile</small>
      <div>${config.paywallQuestions.map((item) => `<article><span>${escapeHtml(item.emoji)}</span><div><b>${escapeHtml(item.title)}</b><p>${escapeHtml(item.leadIn)}</p></div></article>`).join('')}</div>
    </section>
    <button class="primary-button" type="button" data-action="checkout" data-palm-checkout data-placement="bottom" data-testid="checkout-button" aria-label="${escapeHtml(checkoutAriaLabel(checkoutLabel, amount))}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
    ${checkoutPriceNote}
    <div class="method-note">${escapeHtml(STOREFRONT.reportDisclaimer)}</div>
  </div>`);
  stage.insertAdjacentHTML('beforeend', `<div class="mobile-checkout-dock mobile-checkout-dock--e"><button class="primary-button" type="button" data-action="checkout" data-palm-checkout data-placement="sticky" data-testid="checkout-button-sticky" aria-label="${escapeHtml(checkoutAriaLabel(checkoutLabel, amount))}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>${checkoutPriceNote}<span>International cards · One-time payment · PDF included</span></div>`);
  requestAnimationFrame(() => setupPalmPaywallInstrumentation(null));
}

function renderUnlock() {
  if (hasFullReportAccess()) {
    renderPaidState();
    return;
  }
  if (IS_CHARITY_GRANT_RETURN) {
    renderCharityGrantReturnCheck();
    return;
  }
  if (IS_PAID_RETURN) {
    renderPaidReturnCheck();
    return;
  }
  if (state.lane === 'mahakundli') {
    renderMahakundliUnlock();
    return;
  }
  if (state.lane === 'palm_answers' && !palmLineNames().length) {
    go('palmproof', 'missing_palm_evidence');
    return;
  }
  if (IS_GLOBAL_STOREFRONT && state.lane === 'palm_answers') {
    renderGlobalPalmUnlock();
    return;
  }
  const palmPaywallVariant = state.lane === 'palm_answers' ? activePalmPaywallVariant() : '';
  if (['e', 'f', 'g'].includes(palmPaywallVariant)) {
    renderPalmUnlockE(palmPaywallVariant);
    return;
  }
  if (state.lane === 'best_city') {
    renderBestCityUnlock();
    return;
  }
  if (state.lane === 'name_numerology') {
    renderNameNumerologyUnlock();
    return;
  }
  const config = palmPaywallConfig(laneConfig());
  const isAdditionalReportTargetPaywall = ADDITIONAL_REPORT_PAYWALL_TARGET_LANES.has(state.lane);
  const proof = actualProof();
  const deliverables = [...config.deliverables];
  let unlockTitle = config.unlockTitle;
  let unlockSubline = config.unlockSubline;
  let tension = config.tension;
  if (state.lane === 'partner_name' && state.answers.birthTime === 'unknown') {
    deliverables[3] = 'Your broad love phase from the details available';
    unlockSubline = 'We found the initials that repeat most strongly, possible name sounds, and a broad love phase from the details available.';
  }
  if (state.lane === 'market_profile') {
    if (state.palmDetection) {
      deliverables[5] = 'Mapped Palm lines used as an optional decision-style comparison';
    } else {
      deliverables.splice(5, 1);
    }
  }
  const needsVerification = Boolean(state.pendingVerification);
  const checkoutAction = needsVerification ? 'verify-pending' : 'checkout';
  const checkoutTaxableValue = state.lane === 'palm_answers'
    ? palmBasePrice()
    : Number(currentPricing().amount || REPORT_PRICE_INR);
  const checkoutValue = checkoutEventValue();
  let checkoutLabel = state.checkoutLoading
    ? needsVerification ? 'Checking your payment…' : 'Opening secure payment…'
    : needsVerification
      ? 'Check my completed payment'
      : config.payCta;
  const cashfreeFallback = cashfreeFallbackMarkup();
  const isPalmGapPaywall = state.lane === 'palm_answers';
  const palmOutlook = isPalmGapPaywall ? palmLifeOutlookPreview() : {};
  const palmHint = isPalmGapPaywall ? palmTimingHint(palmOutlook) : {};
  if (isPalmGapPaywall && palmHint.yearLevel && deliverables.length) {
    deliverables[deliverables.length - 1] = 'Your current Palm and birth-date phase, plus what becomes easier with experience';
  }
  const fixedPalmHeroCopy = isPalmGapPaywall && Boolean(config.fixedHeroCopy);
  if (isPalmGapPaywall && palmHint.yearLevel) {
    if (!fixedPalmHeroCopy) {
      unlockTitle = 'One future year stands out in your reading.';
      unlockSubline = 'Unlock the year, its main theme and the Palm evidence behind it.';
    }
    tension = 'Your standout year, its main theme and the Palm evidence behind it are ready inside the complete report.';
    if (!state.checkoutLoading && !needsVerification) checkoutLabel = 'Unlock my future year';
  } else if (isPalmGapPaywall && !palmHint.hasStartClue) {
    if (palmHint.timingAvailable) {
      if (!fixedPalmHeroCopy) {
        unlockSubline = 'One period in your future rises above the rest. Your full report reveals its exact start and end, what shifts first, and what follows.';
      }
      tension = 'The exact start, end and first life area to strengthen are still locked.';
    } else {
      if (!fixedPalmHeroCopy) {
        unlockTitle = 'Your six life areas fall into a clear order.';
        unlockSubline = 'Read from your own palm, birth chart and name number. Your full report reveals what strengthens first, what follows and what is shaping your current phase.';
      }
      tension = 'The first life area and the sequence that follows are still locked.';
    }
  }
  const proofMarkup = isPalmGapPaywall
    ? palmHint.yearLevel
      ? `<div class="personal-proof personal-proof--palm-gap"><small>${escapeHtml(config.proofLabel)}</small><b>One future year stands out.</b><div class="palm-timing-clue" aria-label="Locked future-year details"><div><small>Year</small><strong>Locked <i aria-hidden="true">🔒</i></strong></div><div><small>Main theme</small><strong>Locked <i aria-hidden="true">🔒</i></strong></div><div><small>Palm evidence</small><strong>Locked <i aria-hidden="true">🔒</i></strong></div></div><span>Open the complete report to reveal the year, what it highlights and the Palm evidence behind it.</span></div>`
      : `<div class="personal-proof personal-proof--palm-gap"><small>${escapeHtml(palmHint.timingAvailable ? config.proofLabel : 'Your free result')}</small><b>${escapeHtml(palmHint.timingAvailable ? 'One future period stands out.' : 'Your six life areas form a clear order.')}</b><div class="palm-timing-clue" aria-label="Partial life-timing clue"><div><small>${palmHint.status === 'active' ? 'Continues' : 'Begins'}</small><strong>${escapeHtml(palmHint.startClue)}</strong></div><div><small>Ends</small><strong>Locked <i aria-hidden="true">🔒</i></strong></div><div><small>First area</small><strong>Locked <i aria-hidden="true">🔒</i></strong></div></div><span>${escapeHtml(palmHint.hasStartClue ? 'These dates are read from your own lines, chart and name number. The exact window and the first life area to strengthen unlock in your full report.' : 'Read from your own lines, chart and name number. Your full report reveals the exact timing and which part of life strengthens first.')}</span></div>`
      : `<div class="personal-proof"${isAdditionalReportTargetPaywall ? ' data-paywall-section="personal_proof"' : ''}><small>${escapeHtml(config.proofLabel)}</small><b>${escapeHtml(proof.title)}</b><span>${escapeHtml(proof.line)}</span><span>${escapeHtml(proof.detail)}</span></div>`;
  const checkoutLabelForAssistiveTech = !needsVerification && !state.checkoutLoading
    ? checkoutAriaLabel(checkoutLabel, checkoutTaxableValue)
    : checkoutLabel;
  const checkoutPriceNote = !needsVerification && !state.checkoutLoading
    ? checkoutPriceNoteMarkup(checkoutTaxableValue)
    : '';
  if (!LOCAL_PALM_PAYWALL_PREVIEW) {
    trackOnce('unlockView', 'unlock_view', {
      product: config.product,
      value: checkoutValue,
      currency: 'INR',
      ...priceComparisonAnalytics()
    });
  }
  show(`<div class="${state.lane === 'face_answers' ? 'face-paywall' : ''}" data-testid="unlock-view">
    <div class="kicker center">${escapeHtml(config.unlockKicker)}</div>
    <h1 class="unlock-title">${escapeHtml(unlockTitle)}</h1>
    <p class="unlock-subtitle">${escapeHtml(unlockSubline)}</p>
    ${proofMarkup}
    <div class="value-tension"${isAdditionalReportTargetPaywall ? ' data-paywall-section="value_proposition"' : ''}><i>✦</i><p>${escapeHtml(tension)}</p></div>
    ${state.paymentError ? `<div class="error-card" data-testid="payment-error">${escapeHtml(state.paymentError)}</div>` : ''}
    <div class="unlock-top-checkout"${isAdditionalReportTargetPaywall ? ' data-paywall-section="top_checkout"' : ''}><button class="primary-button" type="button" data-action="${checkoutAction}" data-placement="top" data-testid="checkout-button-top" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
    ${checkoutPriceNote}
    ${needsVerification ? '' : paymentMethodTrustMarkup()}</div>
    ${isPalmGapPaywall ? '<div class="trust-note center" data-testid="palm-trust-note">Personal to your palm, birth chart and name number — not a generic horoscope. Secure payment · No subscription.</div>' : ''}
    ${lockedReportPreviewMarkup(config)}
    ${isPalmGapPaywall ? palmPurchaseMarkup(config, palmHint) : `<div class="unlock-card unlock-card--purchase"${isAdditionalReportTargetPaywall ? ' data-paywall-section="purchase_summary"' : ''}>
      <div class="unlock-card-head"><div><small>Complete personal report</small><b>${escapeHtml(config.product)}</b></div>${unlockPriceMarkup()}</div>
      <p class="unlock-card__ready">${state.lane === 'face_answers' ? 'Open the complete feature-by-feature Face Reading and your ordered three-phase Life Timeline together.' : 'Get each answer above, the reason behind it and a practical next step.'}</p>
    </div>
    <section class="unlock-includes" data-testid="unlock-includes"${isAdditionalReportTargetPaywall ? ' data-paywall-section="deliverables"' : ''}><small>Inside your full report</small><b>What you will get</b><ul class="deliverables">${deliverables.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`}
    <button class="primary-button" type="button" data-action="${checkoutAction}" data-placement="bottom" data-testid="checkout-button" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>
    ${checkoutPriceNote}
    ${needsVerification ? '' : paymentMethodTrustMarkup({ bottom: true })}
    ${cashfreeFallback}
    ${needsVerification ? '<div class="small-note">Do not pay again. We will check the payment response already received.</div>' : ''}
    ${isPalmGapPaywall ? '' : socialBonusMarkup(config)}
    ${isPalmGapPaywall || state.lane === 'face_answers' ? '' : `<div class="method-note">${state.lane === 'market_profile' ? 'Personal reflection only · Not investment advice, a trading signal or a return promise' : 'Personal guidance, not a guaranteed outcome'}</div>`}
  </div>`);
  stage.insertAdjacentHTML('beforeend', `<div class="mobile-checkout-dock"><button class="primary-button" type="button" data-action="${checkoutAction}" data-placement="sticky" data-testid="checkout-button-sticky" aria-label="${escapeHtml(checkoutLabelForAssistiveTech)}" ${state.checkoutLoading ? 'disabled' : ''}>${escapeHtml(checkoutLabel)}</button>${checkoutPriceNote}${needsVerification ? '<span>We will check your completed payment. Do not pay again.</span>' : paymentMethodTrustMarkup({ compact: true })}</div>`);
  setupAndTrackCrossSellPaywallCtaExposure();
}

function renderPaidReturnCheck() {
  show(`<div class="analysis-screen" data-testid="payment-return-check">
    <div class="kicker center">Checking your payment</div>
    <div class="analysis-orbit"><span>✓</span></div>
    <h1 class="question-title center">We are confirming your payment.</h1>
    <p class="question-copy center">${state.fullLoading ? 'Please wait while we load your report.' : state.paymentError ? 'We could not confirm it yet. If you just paid, wait a moment and check again. Do not make a second payment.' : 'Keep this page open for a moment.'}</p>
    ${state.paymentError ? `<div class="error-card">${escapeHtml(state.paymentError)}</div>` : ''}
    ${state.fullLoading || !state.paymentError ? '' : '<button class="primary-button" type="button" data-action="retry-report">Check my payment again</button>'}
  </div>`);
  if (!state.fullLoading && !state.paymentError) requestAnimationFrame(loadFullReading);
}

function renderCharityGrantReturnCheck() {
  show(`<div class="analysis-screen" data-testid="charity-grant-return-check">
    <div class="kicker center">Complimentary access</div>
    <div class="analysis-orbit"><span>✦</span></div>
    <h1 class="question-title center">Your Mahakundli report has been shared with you.</h1>
    <p class="question-copy center">${state.fullLoading ? 'Please wait while we open your private report.' : state.paymentError ? 'We could not open this private link yet. Check the original link and try again.' : 'Opening your complete report now. No payment is required.'}</p>
    ${state.paymentError ? `<div class="error-card">${escapeHtml(state.paymentError)}</div>` : ''}
    ${state.fullLoading || !state.paymentError ? '' : '<button class="primary-button" type="button" data-action="retry-report">Try opening my report again</button>'}
  </div>`);
  if (!state.fullLoading && !state.paymentError) requestAnimationFrame(loadFullReading);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing?.dataset.loaded === 'yes') {
      resolve();
      return;
    }
    if (existing) existing.remove();
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'yes';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => {
      script.remove();
      reject(new Error('The payment window did not load. Check your connection and try again.'));
    }, { once: true });
    document.head.appendChild(script);
  });
}

async function markPurchaseVerified(provider, purchaseTrackingToken = '') {
  finishPalmPaywallVisit('payment_verified');
  activeGatewayAttemptTelemetry = null;
  const checkoutValue = checkoutEventValue();
  track('payment_verify_success', palmNameAlignmentExperimentAnalytics({
    provider,
    value: checkoutValue,
    currency: checkoutCurrency()
  }));
  pendingBrowserPurchaseTrackingToken = /^bp1\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/.test(String(purchaseTrackingToken || ''))
    ? String(purchaseTrackingToken).slice(0, 1800)
    : '';
  state.additionalReportContinuationToken = '';
  state.additionalReportContinuationReadingId = '';
  state.additionalReportContinuationExpiresAt = 0;
  state.additionalReportDirectoryContinuationToken = '';
  state.additionalReportDirectoryContinuationReadingId = '';
  state.additionalReportDirectoryContinuationExpiresAt = 0;
  clearAdditionalReportLineage();
  state.paid = true;
  state.checkoutLoading = false;
  state.paymentError = '';
  state.paymentDismissRecovery = null;
  state.pendingVerification = null;
  rememberPaidReading();
  persist();
  updateRecoveryUrl({ paid: true });
  await loadFullReading();
}

function normalizeServerPurchaseTracking(value = {}) {
  const eventId = String(value?.eventId || '').trim();
  const transactionId = String(value?.transactionId || eventId).trim().slice(0, 140);
  const amount = Number(value?.value);
  const currency = String(value?.currency || '').trim().toUpperCase();
  if (
    !/^purchase_[a-f0-9]{32}$/.test(eventId)
    || !transactionId
    || !Number.isFinite(amount)
    || amount <= 0
    || !/^[A-Z]{3}$/.test(currency)
  ) return null;
  const sourceLane = String(value?.cross_sell_source_lane || '').trim();
  const targetLane = String(value?.cross_sell_target_lane || '').trim();
  const crossSell = (
    value?.purchase_journey === 'cross_sell'
    && value?.is_cross_sell === true
    && LANES[sourceLane]?.product
    && LANES[targetLane]?.product
    && sourceLane !== targetLane
    && targetLane === state.lane
  ) ? {
      purchase_journey: 'cross_sell',
      is_cross_sell: true,
      cross_sell_source_lane: sourceLane,
      cross_sell_target_lane: targetLane,
      cross_sell_source_product: LANES[sourceLane].product,
      cross_sell_target_product: LANES[targetLane].product
    } : {};
  return {
    eventId,
    transactionId,
    provider: String(value?.provider || 'payment_gateway').trim().slice(0, 40),
    value: amount,
    currency,
    product: String(value?.product || laneConfig()?.product || 'PalmQ IND report').trim().slice(0, 120),
    crossSell
  };
}

function recordVerifiedPurchase({
  provider,
  value,
  currency,
  product,
  transactionId = '',
  eventId = '',
  crossSell = {}
} = {}) {
  trackOnce('purchase', 'purchase', {
    provider,
    value,
    currency,
    product,
    ...(transactionId ? { transaction_id: transactionId } : {}),
    ...crossSell,
    ...palmNameAlignmentExperimentAnalytics(),
    ...priceComparisonAnalytics()
  }, eventId ? { eventId } : {});
}

function boundedCheckoutMetric(value, maximum = 86_400_000) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  return Math.min(maximum, Math.round(numeric));
}

function boundedProviderDiagnostic(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_.-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'unknown';
}

function boundedPaymentMethodCategory(value) {
  const normalized = boundedProviderDiagnostic(value);
  if (['upi', 'card', 'netbanking', 'wallet', 'emi', 'paylater'].includes(normalized)) {
    return normalized;
  }
  return normalized === 'unknown' ? 'unknown' : 'other';
}

function sanitizeCheckoutAttemptId(value) {
  const normalized = String(value || '').trim().slice(0, 140);
  return /^[a-zA-Z0-9_-]+$/.test(normalized) ? normalized : '';
}

function sanitizePaymentDismissRecovery(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const checkoutAttemptId = sanitizeCheckoutAttemptId(value.checkoutAttemptId);
  const attemptNumber = Math.max(1, Math.min(1000, Math.floor(Number(value.attemptNumber || 0))));
  const dismissedAt = Number(value.dismissedAt);
  if (!checkoutAttemptId || !Number.isFinite(dismissedAt) || dismissedAt <= 0) return null;
  return {
    checkoutAttemptId,
    recoveryRootAttemptId: sanitizeCheckoutAttemptId(value.recoveryRootAttemptId),
    attemptNumber,
    dismissedAt,
    gatewayOpenDurationMs: boundedCheckoutMetric(value.gatewayOpenDurationMs),
    ctaPlacement: String(value.ctaPlacement || '').trim().slice(0, 24),
    promptVersion: PAYMENT_DISMISS_RECOVERY_PROMPT_VERSION
  };
}

let activeGatewayAttemptTelemetry = null;
let paymentDismissRecoveryObserver = null;
let paymentDismissRecoveryNeedsFocus = false;
let alternatePaymentFormNeedsFocus = false;
let palmProofDensityServerValidatedThisLoad = false;
let palmGatewayRecoveryServerValidatedThisLoad = false;

function startGatewayAttemptTelemetry({
  checkoutAttemptId,
  recoveryRootAttemptId,
  attemptNumber,
  ctaPlacement,
  orderCreatedAt
} = {}) {
  const startedAt = performance.now();
  activeGatewayAttemptTelemetry = {
    checkoutAttemptId: sanitizeCheckoutAttemptId(checkoutAttemptId),
    recoveryRootAttemptId: sanitizeCheckoutAttemptId(recoveryRootAttemptId),
    attemptNumber: Math.max(1, Math.min(1000, Math.floor(Number(attemptNumber || 1)))),
    ctaPlacement: String(ctaPlacement || '').trim().slice(0, 24),
    openedAt: Date.now(),
    startedAt,
    orderToOpenMs: boundedCheckoutMetric(startedAt - Number(orderCreatedAt || startedAt)),
    visibilityChangeCount: 0,
    focusLostCount: 0,
    hiddenDurationMs: 0,
    hiddenStartedAt: document.hidden ? startedAt : 0,
    priorAttemptSignal: 'none'
  };
  return gatewayAttemptTelemetryProperties();
}

function noteGatewayAttemptSignal(signal) {
  if (!activeGatewayAttemptTelemetry) return;
  const normalized = String(signal || '').trim().toLowerCase();
  if (['payment_failed', 'verify_started', 'verify_failed'].includes(normalized)) {
    activeGatewayAttemptTelemetry.priorAttemptSignal = normalized;
  }
}

function gatewayAttemptTelemetryProperties({ finalize = false } = {}) {
  const attempt = activeGatewayAttemptTelemetry;
  if (!attempt) return { checkout_observability_version: CHECKOUT_OBSERVABILITY_VERSION };
  const now = performance.now();
  const hiddenDurationMs = attempt.hiddenDurationMs
    + (attempt.hiddenStartedAt ? Math.max(0, now - attempt.hiddenStartedAt) : 0);
  const properties = {
    checkout_observability_version: CHECKOUT_OBSERVABILITY_VERSION,
    checkout_attempt_id: attempt.checkoutAttemptId,
    ...(attempt.recoveryRootAttemptId ? {
      checkout_recovery_root_attempt_id: attempt.recoveryRootAttemptId
    } : {}),
    checkout_attempt_number: attempt.attemptNumber,
    checkout_mode: 'razorpay_checkout',
    cta_placement: attempt.ctaPlacement,
    order_to_open_ms: attempt.orderToOpenMs,
    gateway_open_duration_ms: boundedCheckoutMetric(now - attempt.startedAt),
    visibility_change_count_during_open: boundedCheckoutMetric(attempt.visibilityChangeCount, 1000),
    hidden_duration_ms_during_open: boundedCheckoutMetric(hiddenDurationMs),
    focus_lost_count_during_open: boundedCheckoutMetric(attempt.focusLostCount, 1000),
    prior_attempt_signal: attempt.priorAttemptSignal,
    recovery_prompt_version: PAYMENT_DISMISS_RECOVERY_PROMPT_VERSION
  };
  if (finalize) activeGatewayAttemptTelemetry = null;
  return properties;
}

function noteGatewayVisibilityChange() {
  const attempt = activeGatewayAttemptTelemetry;
  if (!attempt) return;
  const now = performance.now();
  attempt.visibilityChangeCount += 1;
  if (document.hidden) {
    if (!attempt.hiddenStartedAt) attempt.hiddenStartedAt = now;
  } else if (attempt.hiddenStartedAt) {
    attempt.hiddenDurationMs += Math.max(0, now - attempt.hiddenStartedAt);
    attempt.hiddenStartedAt = 0;
  }
}

function noteGatewayWindowBlur() {
  if (activeGatewayAttemptTelemetry) activeGatewayAttemptTelemetry.focusLostCount += 1;
}

function paymentDismissRecoveryMarkup() {
  const recovery = sanitizePaymentDismissRecovery(state.paymentDismissRecovery);
  if (
    !recovery
    || state.lane !== 'palm_answers'
    || activePalmGatewayRecoveryVariant() !== PALM_GATEWAY_RECOVERY_TREATMENT
  ) return '';
  const cashfreeGatewayChoice = LOCAL_PALM_PAYWALL_PREVIEW
    || RUNTIME_CONFIG.payments?.cashfreeFallback
    ? '<button class="secondary-button payment-dismiss-recovery__gateway" type="button" data-action="recover-dismissed-payment-gateway"><span>Try a different secure payment page</span><small>UPI, cards and net banking available</small></button>'
    : '';
  return `<section class="payment-dismiss-recovery" data-testid="payment-dismiss-recovery" data-paywall-section="payment_recovery" tabindex="-1" aria-labelledby="payment-dismiss-recovery-title">
    <small>PAYMENT CLOSED</small>
    <h2 id="payment-dismiss-recovery-title">Your reading is still saved.</h2>
    <p>How would you like to continue?</p>
    <div class="payment-dismiss-recovery__actions">
      <button class="primary-button" type="button" data-action="retry-dismissed-payment">Open the same payment window again</button>
      ${cashfreeGatewayChoice}
      <button class="text-button" type="button" data-action="reconsider-payment-price">I want to think about the price</button>
      <button class="text-button" type="button" data-action="dismiss-payment-for-now">I am not ready to pay</button>
    </div>
    ${cashfreeGatewayRecoveryMarkup()}
    <span>Before starting again, we check whether your last payment was completed.</span>
  </section>`;
}

function focusPaymentDismissRecoveryTargets(card) {
  if (!card) return;
  if (paymentDismissRecoveryNeedsFocus) {
    paymentDismissRecoveryNeedsFocus = false;
    card.scrollIntoView({
      block: 'center',
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
    card.focus({ preventScroll: true });
  }
  if (alternatePaymentFormNeedsFocus) {
    alternatePaymentFormNeedsFocus = false;
    const alternateForm = card.querySelector('[data-testid="cashfree-gateway-recovery"]');
    alternateForm?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    alternateForm?.focus({ preventScroll: true });
  }
}

function setupPaymentDismissRecoveryExposure() {
  paymentDismissRecoveryObserver?.disconnect?.();
  paymentDismissRecoveryObserver = null;
  const recovery = sanitizePaymentDismissRecovery(state.paymentDismissRecovery);
  const card = stage.querySelector('[data-testid="payment-dismiss-recovery"]');
  if (!recovery || !card) return;
  focusPaymentDismissRecoveryTargets(card);
  const recordExposure = () => trackOnce(
      `paymentDismissRecoveryView_${recovery.checkoutAttemptId}_${recovery.attemptNumber}`,
      'payment_dismiss_recovery_viewed',
      {
        checkout_observability_version: CHECKOUT_OBSERVABILITY_VERSION,
      checkout_attempt_id: recovery.checkoutAttemptId,
      ...(recovery.recoveryRootAttemptId ? {
        checkout_recovery_root_attempt_id: recovery.recoveryRootAttemptId
      } : {}),
        checkout_attempt_number: recovery.attemptNumber,
        gateway_open_duration_ms: recovery.gatewayOpenDurationMs,
        cta_placement: recovery.ctaPlacement,
        recovery_prompt_version: recovery.promptVersion
      }
    );
  if (typeof IntersectionObserver !== 'function') {
    const rect = card.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < window.innerHeight) recordExposure();
    return;
  }
  paymentDismissRecoveryObserver = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
    recordExposure();
    paymentDismissRecoveryObserver?.disconnect?.();
    paymentDismissRecoveryObserver = null;
  }, { threshold: 0.5 });
  paymentDismissRecoveryObserver.observe(card);
}

function trackPaymentDismissRecoveryAction(reasonCode, action) {
  const recovery = sanitizePaymentDismissRecovery(state.paymentDismissRecovery);
  if (!recovery) return null;
  track('payment_dismiss_recovery_action', {
    checkout_observability_version: CHECKOUT_OBSERVABILITY_VERSION,
    checkout_attempt_id: recovery.checkoutAttemptId,
    ...(recovery.recoveryRootAttemptId ? {
      checkout_recovery_root_attempt_id: recovery.recoveryRootAttemptId
    } : {}),
    checkout_attempt_number: recovery.attemptNumber,
    gateway_open_duration_ms: recovery.gatewayOpenDurationMs,
    cta_placement: recovery.ctaPlacement,
    recovery_prompt_version: recovery.promptVersion,
    reason_code: String(reasonCode || '').slice(0, 40),
    action: String(action || '').slice(0, 40),
    dismiss_to_action_ms: boundedCheckoutMetric(Date.now() - recovery.dismissedAt)
  });
  return recovery;
}

async function startCheckout(ctaPlacement = '', { retryTrigger = '' } = {}) {
  if (state.checkoutLoading || state.paid || state.deliveryAccessType === 'charity_grant') return;
  if (IS_GLOBAL_STOREFRONT && (!globalCheckoutEnabled() || !globalCheckoutDetailsComplete())) {
    state.paymentError = globalCheckoutEnabled()
      ? 'Complete and confirm your current residence before continuing.'
      : '';
    go('residence', 'checkout_details');
    return;
  }
  if (state.pendingVerification) {
    await retryPendingVerification();
    return;
  }
  if (!state.readingId) {
    state.paymentError = 'Your report is not ready yet. Please return to the previous step and try again.';
    render();
    return;
  }
  if (!IS_GLOBAL_STOREFRONT) ensurePalmNameAlignmentSelection();
  const requestedAddOns = IS_GLOBAL_STOREFRONT ? [] : palmCheckoutAddons();
  const currency = checkoutCurrency();
  const expectedProvider = IS_GLOBAL_STOREFRONT
    ? 'payglocal'
    : String(STOREFRONT.paymentProvider || 'razorpay').trim().toLowerCase();
  const previousRecovery = sanitizePaymentDismissRecovery(state.paymentDismissRecovery);
  const previousCheckoutAttemptId = previousRecovery?.checkoutAttemptId
    || sanitizeCheckoutAttemptId(state.activePaymentId);
  state.paymentDismissRecovery = null;
  state.checkoutAttemptNumber = Math.min(1000, state.checkoutAttemptNumber + 1);
  const checkoutAttemptNumber = state.checkoutAttemptNumber;
  state.checkoutLoading = true;
  state.paymentError = '';
  const checkoutValue = checkoutEventValue();
  const placement = String(ctaPlacement || '').slice(0, 24);
  const checkoutStartedAt = performance.now();
  const checkoutObservability = {
    checkout_observability_version: CHECKOUT_OBSERVABILITY_VERSION,
    checkout_attempt_number: checkoutAttemptNumber,
    checkout_mode: 'provider_pending',
    cta_placement: placement,
    ...(previousCheckoutAttemptId ? { previous_checkout_attempt_id: previousCheckoutAttemptId } : {}),
    ...(previousRecovery?.recoveryRootAttemptId ? {
      checkout_recovery_root_attempt_id: previousRecovery.recoveryRootAttemptId
    } : {}),
    ...(retryTrigger ? { retry_trigger: String(retryTrigger).slice(0, 40) } : {}),
    ...(previousRecovery ? {
      retry_delay_ms: boundedCheckoutMetric(Date.now() - previousRecovery.dismissedAt)
    } : {})
  };
  const checkoutProduct = state.preview?.product?.label
    || state.preview?.product?.title
    || laneConfig()?.product
    || '';
  if (!trackOnce('beginCheckout', 'begin_checkout', palmNameAlignmentExperimentAnalytics({ value: checkoutValue, currency, product: checkoutProduct, ...(placement ? { placement } : {}), ...checkoutObservability, ...priceComparisonAnalytics() }))) {
    track('checkout_retry', palmNameAlignmentExperimentAnalytics({ value: checkoutValue, currency, ...(placement ? { placement } : {}), ...checkoutObservability }));
  }
  persist();
  render();

  let orderCreated = false;
  let createdPaymentId = '';
  try {
    // Save only the opaque reading pointer before opening an external payment
    // surface. If an in-app browser closes during payment, a later visit can
    // ask the server whether this exact reading became paid.
    rememberRecoveryReading('pending');
    track('checkout_order_create_started', palmNameAlignmentExperimentAnalytics({ provider: expectedProvider, value: checkoutValue, currency, ...(placement ? { placement } : {}), ...checkoutObservability }));
    const body = await api('/api/create-order', {
      readingId: state.readingId,
      tier: 'full',
      addOns: requestedAddOns,
      email: IS_GLOBAL_STOREFRONT ? normalizeCheckoutEmail(state.answers.paymentEmail) : '',
      phone: '',
      ...(IS_GLOBAL_STOREFRONT ? { residence: globalResidenceDraft() } : {}),
      angle: state.resolvedAngle,
      rawAngle: state.rawAngle,
      lane: state.lane,
      analyticsSessionId: state.analyticsSessionId,
      tracking: trackingData()
    });
    syncAuthoritativeCheckout(body, requestedAddOns);
    state.metaPurchaseEventId = body.metaPurchaseEventId || state.metaPurchaseEventId;
    createdPaymentId = body.internalPaymentId || body.payment?.id || '';
    state.activePaymentId = createdPaymentId;
    rememberRecoveryReading(body.alreadyPaid ? 'paid' : 'pending');
    persist();
    if (body.alreadyPaid) {
      track('payment_recovered', palmNameAlignmentExperimentAnalytics({ provider: body.payment?.provider || expectedProvider, value: checkoutEventValue(), currency: body.currency || currency }));
      await markPurchaseVerified(body.payment?.provider || expectedProvider, body.purchaseTrackingToken);
      return;
    }
    const mode = body.payment?.mode || (IS_GLOBAL_STOREFRONT ? '' : 'razorpay_checkout');
    const provider = body.payment?.provider || (mode.includes('cashfree') ? 'cashfree' : mode === 'mock' ? 'mock' : expectedProvider);
    if (IS_GLOBAL_STOREFRONT && (mode !== 'payglocal_checkout' || provider !== 'payglocal')) {
      throw new Error('International checkout returned an unexpected payment route. No new payment was opened.');
    }
    orderCreated = true;
    const orderCreatedAt = performance.now();
    const recoveryRootAttemptId = sanitizeCheckoutAttemptId(
      body.payment?.gatewayRecovery?.rootPaymentId
    );
    const authoritativeAttempt = {
      ...checkoutObservability,
      checkout_attempt_id: sanitizeCheckoutAttemptId(createdPaymentId),
      ...(recoveryRootAttemptId ? {
        checkout_recovery_root_attempt_id: recoveryRootAttemptId
      } : {}),
      checkout_mode: String(mode || 'razorpay_checkout').slice(0, 40),
      order_create_duration_ms: boundedCheckoutMetric(orderCreatedAt - checkoutStartedAt)
    };
    track('checkout_order_created', {
      provider,
      order_id: body.order_id || body.payment?.providerOrderId || '',
      value: checkoutEventValue(),
      currency: body.currency || currency,
      ...authoritativeAttempt,
      ...palmNameAlignmentExperimentAnalytics()
    });

    if (mode === 'mock') {
      const completed = await api('/api/checkout/mock-complete', { paymentId: body.payment.id });
      track('payment_verify_started', palmNameAlignmentExperimentAnalytics({ provider: 'mock', value: checkoutEventValue(), currency: body.currency || currency, ...authoritativeAttempt }));
      await markPurchaseVerified('mock', completed.purchaseTrackingToken);
      return;
    }

    if (mode === 'cashfree_checkout') {
      await openCashfreeCheckout(body, authoritativeAttempt);
      return;
    }

    if (mode === 'razorpay_link') {
      openHostedPaymentPage(body, authoritativeAttempt);
      return;
    }
    if (mode === 'payglocal_checkout') {
      openHostedPaymentPage(body, authoritativeAttempt);
      return;
    }
    if (mode && mode !== 'razorpay_checkout') throw new Error('Secure checkout is not available for this report.');
    const checkout = body.payment?.checkout || {};
    await loadScript(checkout.sdkUrl || 'https://checkout.razorpay.com/v1/checkout.js');
    if (typeof window.Razorpay !== 'function') throw new Error('The secure payment window did not load. Please try again.');

    const razorpay = new window.Razorpay({
      key: checkout.key || body.key,
      amount: body.amount || checkout.amount,
      currency: body.currency || checkout.currency || 'INR',
      name: 'PalmQ IND',
      image: '/astroyogi/assets/palmq-logo.png',
      description: checkout.description || laneConfig()?.product || 'Personal report',
      order_id: body.order_id || checkout.orderId,
      prefill: { name: formatName(state.answers.name), email: '', contact: '' },
      theme: { color: '#9c6d2d' },
      handler: async (response) => {
        try {
          noteGatewayAttemptSignal('verify_started');
          track('payment_verify_started', palmNameAlignmentExperimentAnalytics({ provider: 'razorpay', value: checkoutEventValue(), currency: 'INR', ...gatewayAttemptTelemetryProperties() }));
          const verified = await api('/api/verify-payment', {
            ...response,
            readingId: state.readingId,
            internalPaymentId: body.internalPaymentId || body.payment?.id,
            angle: state.resolvedAngle,
            rawAngle: state.rawAngle,
            lane: state.lane,
            analyticsSessionId: state.analyticsSessionId
          });
          await markPurchaseVerified('razorpay', verified.purchaseTrackingToken);
        } catch (error) {
          noteGatewayAttemptSignal('verify_failed');
          state.checkoutLoading = false;
          state.pendingVerification = {
            response,
            internalPaymentId: body.internalPaymentId || body.payment?.id || ''
          };
          state.paymentError = 'We received the payment response but could not confirm it yet. Check the same payment again. Do not pay twice.';
          track('payment_verify_failed', palmNameAlignmentExperimentAnalytics({ provider: 'razorpay', value: checkoutEventValue(), currency: 'INR', message: String(error.message || error).slice(0, 180), ...gatewayAttemptTelemetryProperties({ finalize: true }) }));
          persist();
          render();
        }
      },
      modal: {
        confirm_close: activePalmGatewayRecoveryVariant() === PALM_GATEWAY_RECOVERY_TREATMENT,
        ondismiss: () => {
          const dismissalTelemetry = gatewayAttemptTelemetryProperties({ finalize: true });
          track('payment_modal_dismissed', palmNameAlignmentExperimentAnalytics({ provider: 'razorpay', value: checkoutEventValue(), currency: 'INR', ...dismissalTelemetry }));
          state.checkoutLoading = false;
          if (
            activePalmGatewayRecoveryVariant() === PALM_GATEWAY_RECOVERY_TREATMENT
            && dismissalTelemetry.checkout_attempt_id
          ) {
            paymentDismissRecoveryNeedsFocus = true;
            state.paymentDismissRecovery = sanitizePaymentDismissRecovery({
              checkoutAttemptId: dismissalTelemetry.checkout_attempt_id,
              recoveryRootAttemptId: dismissalTelemetry.checkout_recovery_root_attempt_id,
              attemptNumber: dismissalTelemetry.checkout_attempt_number,
              dismissedAt: Date.now(),
              gatewayOpenDurationMs: dismissalTelemetry.gateway_open_duration_ms,
              ctaPlacement: dismissalTelemetry.cta_placement
            });
          }
          persist();
          render();
        }
      }
    });

    if (typeof razorpay.on === 'function') {
      razorpay.on('payment.failed', (response) => {
        noteGatewayAttemptSignal('payment_failed');
        const providerMessage = response?.error?.description || response?.error?.reason || '';
        const message = 'Payment did not complete. You can try again. If your bank shows a debit, wait for it to update before paying again.';
        track('payment_failed', palmNameAlignmentExperimentAnalytics({
          provider: 'razorpay',
          value: checkoutEventValue(),
          currency: 'INR',
          reason: String(providerMessage || message).slice(0, 180),
          failure_code: boundedProviderDiagnostic(response?.error?.code),
          failure_source: boundedProviderDiagnostic(response?.error?.source),
          failure_step: boundedProviderDiagnostic(response?.error?.step),
          failure_reason: boundedProviderDiagnostic(response?.error?.reason),
          method_category: boundedPaymentMethodCategory(
            response?.error?.metadata?.payment_method || response?.error?.method
          ),
          ...gatewayAttemptTelemetryProperties()
        }));
        state.checkoutLoading = false;
        state.paymentError = message;
        persist();
        render();
      });
    }
    const gatewayOpenTelemetry = startGatewayAttemptTelemetry({
      checkoutAttemptId: createdPaymentId,
      recoveryRootAttemptId,
      attemptNumber: checkoutAttemptNumber,
      ctaPlacement: placement,
      orderCreatedAt
    });
    razorpay.open();
    track('razorpay_opened', palmNameAlignmentExperimentAnalytics({ provider: 'razorpay', value: checkoutEventValue(), currency: 'INR', ...gatewayOpenTelemetry }));
  } catch (error) {
    const checkoutFailureTelemetry = activeGatewayAttemptTelemetry
      ? gatewayAttemptTelemetryProperties({ finalize: true })
      : checkoutObservability;
    track(orderCreated ? 'checkout_open_failed' : 'checkout_order_create_failed', palmNameAlignmentExperimentAnalytics({ provider: expectedProvider, value: checkoutEventValue(), currency, message: String(error?.message || error).slice(0, 180), ...checkoutFailureTelemetry }));
    if (orderCreated && createdPaymentId) {
      // This order can already have a pending UPI/provider attempt. Never
      // create a second hosted/provider payment after an order exists: keep
      // the exact Razorpay order and let the reader safely reopen it.
      state.paymentError = 'The payment window did not open. Try secure payment again—we will reuse the same payment order. If your bank shows a debit, wait for it to update before retrying.';
    } else {
      state.paymentError = error.message || 'The payment window did not open. Please try again.';
    }
    state.checkoutLoading = false;
    persist();
    render();
  }
}

function openHostedPaymentPage(body, observability = {}) {
  const url = String(body?.payment?.checkout?.url || '');
  if (!/^https:\/\//i.test(url)) throw new Error('The payment page is not available. Please try again.');
  if (body?.payment?.provider === 'payglocal') {
    const payglocalRuntime = RUNTIME_CONFIG.payments?.payglocal;
    const environment = payglocalRuntime?.environment;
    const hostedCheckout = payglocalRuntime?.hostedCheckout;
    const expectedHostedCheckout = environment === 'uat'
      ? { origin: 'https://api.uat.payglocal.in', pathname: '/gl/payflow-ui/' }
      : environment === 'production'
        ? { origin: 'https://api.prod.payglocal.in', pathname: '/gl/v1/payments/redirect' }
        : null;
    let hostedUrl = null;
    try { hostedUrl = new URL(url); } catch (_) {}
    const queryKeys = hostedUrl ? [...hostedUrl.searchParams.keys()] : [];
    const checkoutTokens = hostedUrl ? hostedUrl.searchParams.getAll('x-gl-token') : [];
    if (
      payglocalRuntime?.enabled !== true
      || payglocalRuntime?.contractProfile !== 'account-v1.8.6-jwe'
      || !expectedHostedCheckout
      || body?.payment?.checkout?.environment !== environment
      || !hostedCheckout
      || hostedCheckout.origin !== expectedHostedCheckout.origin
      || hostedCheckout.pathname !== expectedHostedCheckout.pathname
      || !hostedUrl
      || hostedUrl.username
      || hostedUrl.password
      || hostedUrl.port
      || hostedUrl.hash
      || hostedUrl.origin !== hostedCheckout.origin
      || hostedUrl.pathname !== hostedCheckout.pathname
      || queryKeys.length !== 1
      || queryKeys[0] !== 'x-gl-token'
      || checkoutTokens.length !== 1
      || !/^[A-Za-z0-9._~-]{1,6144}$/.test(checkoutTokens[0] || '')
    ) {
      throw new Error('The international payment page could not be verified. Please try again.');
    }
  }
  const checkoutAttemptId = sanitizeCheckoutAttemptId(
    body.internalPaymentId || body.payment?.id
  );
  const recoveryRootAttemptId = sanitizeCheckoutAttemptId(
    body.payment?.gatewayRecovery?.rootPaymentId
      || observability.checkout_recovery_root_attempt_id
  );
  track('checkout_fallback_opened', palmNameAlignmentExperimentAnalytics({
    provider: body.payment?.provider || 'razorpay_link',
    value: checkoutEventValue(),
    currency: body.currency || 'INR',
    ...observability,
    ...(checkoutAttemptId ? { checkout_attempt_id: checkoutAttemptId } : {}),
    ...(recoveryRootAttemptId ? {
      checkout_recovery_root_attempt_id: recoveryRootAttemptId
    } : {})
  }));
  persist();
  window.location.assign(url);
}

function normalizePaymentPhone(value) {
  return String(value || '').replace(/\D/g, '').slice(-10);
}

async function startCashfreeFallback() {
  if (state.checkoutLoading || state.paid || state.deliveryAccessType === 'charity_grant') return;
  const previousRecovery = sanitizePaymentDismissRecovery(state.paymentDismissRecovery);
  const isGuidedGatewayRecovery = Boolean(
    previousRecovery
    && state.lane === 'palm_answers'
    && activePalmGatewayRecoveryVariant() === PALM_GATEWAY_RECOVERY_TREATMENT
    && state.cashfreeFallbackOpen
  );
  const guidedFailureObservability = previousRecovery ? {
    checkout_observability_version: CHECKOUT_OBSERVABILITY_VERSION,
    previous_checkout_attempt_id: previousRecovery.checkoutAttemptId,
    checkout_recovery_root_attempt_id:
      previousRecovery.recoveryRootAttemptId || previousRecovery.checkoutAttemptId,
    checkout_attempt_number: previousRecovery.attemptNumber,
    retry_trigger: 'dismiss_prompt_gateway',
    previous_provider: 'razorpay'
  } : {};
  if (isGuidedGatewayRecovery && !LOCAL_PALM_PAYWALL_PREVIEW) {
    state.checkoutLoading = false;
    state.paymentError = 'The other payment page is not available yet. For now, reopen the first payment window—we will reuse the same payment order.';
    track('checkout_fallback_failed', palmNameAlignmentExperimentAnalytics({
      provider: 'cashfree',
      previous_provider: 'razorpay',
      reason: 'production_switch_fail_closed',
      ...guidedFailureObservability
    }));
    persist();
    render();
    return;
  }
  if (sanitizeCheckoutAttemptId(state.activePaymentId) && !isGuidedGatewayRecovery) {
    state.cashfreeFallbackOpen = false;
    state.paymentError = 'Your first payment order is still open. Retry that secure payment so you cannot be charged twice.';
    persist();
    render();
    return;
  }
  const phone = normalizePaymentPhone(document.getElementById('cashfreePhone')?.value || state.answers.paymentPhone);
  if (phone.length !== 10) {
    state.paymentError = 'Enter a valid 10-digit mobile number for the other payment page.';
    render();
    return;
  }
  state.answers.paymentPhone = phone;
  const requestedAddOns = palmCheckoutAddons();
  const previousCheckoutAttemptId = sanitizeCheckoutAttemptId(
    state.activePaymentId || previousRecovery?.checkoutAttemptId
  );
  const recoveryRootAttemptId = sanitizeCheckoutAttemptId(
    previousRecovery?.recoveryRootAttemptId || previousCheckoutAttemptId
  );
  state.checkoutAttemptNumber = Math.min(1000, state.checkoutAttemptNumber + 1);
  const checkoutAttemptNumber = state.checkoutAttemptNumber;
  state.checkoutLoading = true;
  state.paymentError = '';
  const fallbackObservability = {
    checkout_observability_version: CHECKOUT_OBSERVABILITY_VERSION,
    ...(previousCheckoutAttemptId ? {
      previous_checkout_attempt_id: previousCheckoutAttemptId
    } : {}),
    ...(recoveryRootAttemptId ? {
      checkout_recovery_root_attempt_id: recoveryRootAttemptId
    } : {}),
    checkout_attempt_number: checkoutAttemptNumber,
    checkout_mode: 'cashfree',
    retry_trigger: isGuidedGatewayRecovery ? 'dismiss_prompt_gateway' : 'fallback_option',
    previous_provider: isGuidedGatewayRecovery ? 'razorpay' : ''
  };
  if (previousCheckoutAttemptId) {
    track('checkout_retry', palmNameAlignmentExperimentAnalytics({
      provider: 'cashfree',
      value: checkoutEventValue(),
      currency: 'INR',
      ...fallbackObservability
    }));
  }
  track('checkout_fallback_requested', palmNameAlignmentExperimentAnalytics({ provider: 'cashfree', value: checkoutEventValue(), currency: 'INR', reason: isGuidedGatewayRecovery ? 'gateway_friction' : 'user_selected_backup', ...fallbackObservability }));
  persist();
  render();
  if (LOCAL_PALM_PAYWALL_PREVIEW) {
    state.checkoutLoading = false;
    state.paymentError = '';
    persist();
    render();
    return;
  }
  try {
    rememberRecoveryReading('pending');
    const body = await api('/api/payment/fallback', {
      provider: 'cashfree',
      readingId: state.readingId,
      currentPaymentId: state.activePaymentId,
      switchReason: isGuidedGatewayRecovery ? 'dismiss_prompt_gateway' : '',
      addOns: requestedAddOns,
      phone,
      angle: state.resolvedAngle,
      rawAngle: state.rawAngle,
      lane: state.lane,
      analyticsSessionId: state.analyticsSessionId,
      tracking: trackingData()
    });
    syncAuthoritativeCheckout(body, requestedAddOns);
    state.activePaymentId = body.internalPaymentId || body.payment?.id || state.activePaymentId;
    rememberRecoveryReading(body.alreadyPaid ? 'paid' : 'pending');
    if (body.alreadyPaid) {
      await markPurchaseVerified(body.payment?.provider || 'cashfree', body.purchaseTrackingToken);
      return;
    }
    if (body.payment?.mode !== 'cashfree_checkout') throw new Error('The other payment page could not be prepared.');
    await openCashfreeCheckout(body, fallbackObservability);
  } catch (error) {
    state.checkoutLoading = false;
    state.paymentError = error.message || 'The other payment page could not open. Please open the first payment window again.';
    track('checkout_fallback_failed', palmNameAlignmentExperimentAnalytics({
      provider: 'cashfree',
      value: checkoutEventValue(),
      currency: 'INR',
      message: String(state.paymentError).slice(0, 180),
      ...fallbackObservability
    }));
    persist();
    render();
  }
}

async function retryPendingVerification() {
  if (!state.pendingVerification || state.checkoutLoading || state.paid) return;
  state.checkoutLoading = true;
  state.paymentError = '';
  persist();
  render();
  try {
    track('payment_verify_started', palmNameAlignmentExperimentAnalytics({ provider: 'razorpay', value: checkoutEventValue(), currency: 'INR', retry: 'yes' }));
    const verified = await api('/api/verify-payment', {
      ...state.pendingVerification.response,
      readingId: state.readingId,
      internalPaymentId: state.pendingVerification.internalPaymentId,
      angle: state.resolvedAngle,
      rawAngle: state.rawAngle,
      lane: state.lane,
      analyticsSessionId: state.analyticsSessionId
    });
    await markPurchaseVerified('razorpay', verified.purchaseTrackingToken);
  } catch (error) {
    state.checkoutLoading = false;
    state.paymentError = 'We are still checking this payment. Wait a moment, then use the same button again. Do not make a second payment.';
    track('payment_verify_failed', palmNameAlignmentExperimentAnalytics({ provider: 'razorpay', value: checkoutEventValue(), currency: 'INR', retry: 'yes', message: String(error.message || error).slice(0, 180) }));
    persist();
    render();
  }
}

async function openCashfreeCheckout(body, observability = {}) {
  const checkout = body.payment?.checkout || {};
  await loadScript(checkout.sdkUrl || 'https://sdk.cashfree.com/js/v3/cashfree.js');
  if (typeof window.Cashfree !== 'function') throw new Error('Secure checkout did not load.');
  if (!checkout.paymentSessionId) throw new Error('Payment session could not be created.');
  const rootAttemptId = sanitizeCheckoutAttemptId(
    body.payment?.gatewayRecovery?.rootPaymentId
      || observability.checkout_recovery_root_attempt_id
  );
  track('cashfree_opened', palmNameAlignmentExperimentAnalytics({
    provider: 'cashfree',
    value: checkoutEventValue(),
    currency: 'INR',
    ...observability,
    checkout_attempt_id: sanitizeCheckoutAttemptId(
      body.internalPaymentId || body.payment?.id
    ),
    ...(rootAttemptId ? { checkout_recovery_root_attempt_id: rootAttemptId } : {})
  }));
  const cashfree = window.Cashfree({ mode: checkout.environment === 'production' ? 'production' : 'sandbox' });
  await cashfree.checkout({ paymentSessionId: checkout.paymentSessionId, redirectTarget: '_self' });
}

async function loadFullReading() {
  if (!state.readingId || state.fullLoading) return;
  if (
    state.additionalReportContinuationReadingId
    && state.additionalReportContinuationReadingId !== state.readingId
  ) {
    state.additionalReportContinuationToken = '';
    state.additionalReportAttributionToken = '';
    state.additionalReportContinuationReadingId = '';
    state.additionalReportContinuationExpiresAt = 0;
  }
  if (
    state.additionalReportDirectoryContinuationReadingId
    && state.additionalReportDirectoryContinuationReadingId !== state.readingId
  ) {
    state.additionalReportDirectoryContinuationToken = '';
    state.additionalReportDirectoryContinuationReadingId = '';
    state.additionalReportDirectoryContinuationExpiresAt = 0;
  }
  state.fullLoading = true;
  render();
  const charityGrantToken = activeMahakundliCharityGrantToken();
  try {
    const purchaseTrackingQuery = !charityGrantToken && pendingBrowserPurchaseTrackingToken
      ? `?purchase_token=${encodeURIComponent(pendingBrowserPurchaseTrackingToken)}`
      : '';
    const full = await getJson(
      `/api/reading/${encodeURIComponent(state.readingId)}/full${purchaseTrackingQuery}`,
      false,
      charityGrantFullFetchOptions(charityGrantToken)
    );
    const isCharityGrantDelivery = hasCharityGrantDelivery(full);
    if (isCharityGrantDelivery && (!charityGrantToken || state.lane !== 'mahakundli')) {
      throw new Error('This complimentary report link could not be verified.');
    }
    pendingBrowserPurchaseTrackingToken = '';
    state.fullLoading = false;
    if (isCharityGrantDelivery) {
      state.deliveryAccessType = 'charity_grant';
      state.paid = false;
      state.additionalReportContinuationToken = '';
      state.additionalReportContinuationReadingId = '';
      state.additionalReportContinuationExpiresAt = 0;
      state.additionalReportDirectoryContinuationToken = '';
      state.additionalReportDirectoryContinuationReadingId = '';
      state.additionalReportDirectoryContinuationExpiresAt = 0;
      state.additionalReportAttributionToken = '';
      clearAdditionalReportLineage();
    } else {
      state.deliveryAccessType = 'paid';
      state.paid = true;
      const continuationToken = String(
        full?.additionalReportContinuationToken || ''
      ).trim().slice(0, 1600);
      const continuationClaims = additionalReportContinuationClaims(continuationToken);
      state.additionalReportContinuationToken = continuationClaims?.readingId === state.readingId
        ? continuationToken
        : '';
      state.additionalReportContinuationReadingId = continuationClaims?.readingId === state.readingId
        ? state.readingId
        : '';
      state.additionalReportContinuationExpiresAt = continuationClaims?.readingId === state.readingId
        ? continuationClaims.expiresAt
        : 0;
      const directoryContinuationToken = String(
        full?.additionalReportDirectoryContinuationToken || ''
      ).trim().slice(0, 1800);
      const directoryContinuationClaims = additionalReportDirectoryContinuationClaims(
        directoryContinuationToken
      );
      state.additionalReportDirectoryContinuationToken =
        directoryContinuationClaims?.readingId === state.readingId
          ? directoryContinuationToken
          : '';
      state.additionalReportDirectoryContinuationReadingId =
        directoryContinuationClaims?.readingId === state.readingId
          ? state.readingId
          : '';
      state.additionalReportDirectoryContinuationExpiresAt =
        directoryContinuationClaims?.readingId === state.readingId
          ? directoryContinuationClaims.expiresAt
          : 0;
      const attributionToken = String(
        full?.additionalReportAttributionToken || ''
      ).trim().slice(0, 1800);
      const attributionClaims = additionalReportAttributionClaims(attributionToken);
      state.additionalReportAttributionToken = attributionClaims?.readingId === state.readingId
        ? attributionToken
        : '';
    }
    const purchaseTracking = isCharityGrantDelivery
      ? null
      : normalizeServerPurchaseTracking(full?.purchaseTracking);
    const {
      additionalReportContinuationToken: _additionalReportContinuationToken,
      additionalReportDirectoryContinuationToken: _additionalReportDirectoryContinuationToken,
      additionalReportAttributionToken: _additionalReportAttributionToken,
      purchaseTracking: _purchaseTracking,
      ...commercialCustomerFull
    } = full || {};
    const customerFull = isCharityGrantDelivery
      ? charityGrantCustomerFull(full)
      : commercialCustomerFull;
    if (IS_GLOBAL_STOREFRONT && customerFull && typeof customerFull === 'object') {
      delete customerFull.nextReadingRecommendation;
      delete customerFull.additionalReportContinuationToken;
      delete customerFull.additionalReportDirectoryContinuationToken;
      delete customerFull.additionalReportAttributionToken;
      state.additionalReportContinuationToken = '';
      state.additionalReportDirectoryContinuationToken = '';
      state.additionalReportAttributionToken = '';
      state.additionalReportContinuationReadingId = '';
      state.additionalReportDirectoryContinuationReadingId = '';
      state.additionalReportContinuationExpiresAt = 0;
      state.additionalReportDirectoryContinuationExpiresAt = 0;
    }
    if (state.lane === 'face_answers') {
      state.faceReportType = customerFull?.product?.key === 'face_personality'
        ? 'personality'
        : 'holistic';
    }
    if (!isCharityGrantDelivery) {
      rememberPaidReading();
      updateRecoveryUrl({ paid: true });
      if (full?.reportPending) {
        state.full = null;
        state.pendingInvoice = customerFull?.invoice || null;
        if (purchaseTracking) recordVerifiedPurchase(purchaseTracking);
        state.paymentError = full.message || full.error || 'Your paid report is still being prepared. Please try opening it again shortly.';
        persist();
        track('report_unlock_pending', { message: String(state.paymentError).slice(0, 180) });
        render();
        return;
      }
    } else if (full?.reportPending) {
      state.full = null;
      state.pendingInvoice = null;
      state.paymentError = full.message || full.error || 'Your complimentary report is still being prepared. Please try opening it again shortly.';
      persist();
      track('charity_report_access_pending', { message: String(state.paymentError).slice(0, 180) });
      render();
      return;
    }
    paidReturnRefreshPending = false;
    state.full = customerFull;
    state.pendingInvoice = null;
    if (purchaseTracking) recordVerifiedPurchase(purchaseTracking);
    state.paymentError = '';
    persist();
    track('full_reading_loaded', {
      report_pending: state.full?.reportPending ? 'yes' : 'no',
      ...(isCharityGrantDelivery ? { access_type: 'charity_grant' } : {})
    });
    if (isCharityGrantDelivery) {
      track('charity_report_access_success', { access_type: 'charity_grant' });
    } else {
      track('report_unlock_success', { provider: state.full?.payment?.provider || 'razorpay' });
    }
    render();
  } catch (error) {
    state.fullLoading = false;
    state.paymentError = error.message || (charityGrantToken || isCharityGrantAccess()
      ? 'This complimentary report is taking longer to open.'
      : 'Your payment is verified, but the report is taking longer to open.');
    track('full_reading_load_failed', { message: String(state.paymentError).slice(0, 180) });
    persist();
    render();
  }
}

function fullPalmLifeOutlook(full = state.full) {
  const outlook = full?.lifeOutlook || full?.web?.lifeOutlook || full?.report?.lifeOutlook;
  return outlook && typeof outlook === 'object' && Object.keys(outlook).length ? outlook : null;
}

function lifeReportList(value, keys = ['text', 'value', 'summary', 'action', 'title']) {
  if (Array.isArray(value)) return value.map((item) => outlookText(item, keys)).filter(Boolean);
  const text = outlookText(value, keys);
  return text ? [text] : [];
}

const PALM_LIFE_DOMAIN_UI = [
  { key: 'loveMarriage', icon: '♥', title: PALM_LIFE_AREA_TITLES.loveMarriage },
  { key: 'familyChildren', icon: '⌂', title: PALM_LIFE_AREA_TITLES.familyChildren },
  { key: 'careerSuccess', icon: '↗', title: PALM_LIFE_AREA_TITLES.careerSuccess },
  { key: 'moneyWealth', icon: '₹', title: PALM_LIFE_AREA_TITLES.moneyWealth },
  { key: 'recognition', icon: '✦', title: PALM_LIFE_AREA_TITLES.recognition },
  { key: 'wellbeingEnergy', icon: '◐', title: PALM_LIFE_AREA_TITLES.wellbeingEnergy }
];

function palmPersonalAnswers(outlook = {}) {
  const source = outlook.personalAnswers && typeof outlook.personalAnswers === 'object'
    ? outlook.personalAnswers
    : {};
  return {
    marriage: source.marriage && typeof source.marriage === 'object' ? source.marriage : {},
    children: source.children && typeof source.children === 'object' ? source.children : {},
    expectedLifeSpan: source.expectedLifeSpan && typeof source.expectedLifeSpan === 'object' ? source.expectedLifeSpan : {}
  };
}

function palmDisplayWindow(value, timingState = '') {
  const text = palmWindowText(value);
  if (!text) return '';
  const storedActiveEnd = text.match(/^Already active · strongest through (.+)$/i)?.[1];
  if (storedActiveEnd) return `Now through ${storedActiveEnd}`;
  if (/^Already active\b/i.test(text)) return 'Active now';
  if (timingState === 'active') {
    const activeEnd = text.match(/^Now to (?:the end of )?(.+)$/i)?.[1];
    if (activeEnd) return `Now through ${activeEnd}`;
    if (/^Active now$/i.test(text)) return 'Active now';
  }
  return text;
}

function palmAgeLabel(value = '') {
  const raw = outlookText(value, ['ageRange', 'age', 'value']);
  const ageRange = String(raw || '')
    .trim()
    .replace(/^you will be ages?\s*/i, '')
    .replace(/^ages?\s*/i, '')
    .replace(/\s+(?:to|through)\s+/gi, '–')
    .replace(/\s*[-–—]\s*/g, '–');
  if (!ageRange) return '';
  const numericRange = ageRange.match(/^(\d{1,3})(?:–(\d{1,3}))?$/);
  if (numericRange?.[2] && numericRange[1] === numericRange[2]) return `Age ${numericRange[1]}`;
  return `${ageRange.includes('–') ? 'Ages' : 'Age'} ${ageRange}`;
}

function palmFriendlyAgeText(value = '') {
  const age = palmAgeLabel(value);
  if (!age) return '';
  return `Your age during this period: ${age.replace(/^Ages?\s+/i, '')}`;
}

function palmPreparedForMarkup(full = {}) {
  const personalization = full?.personalization && typeof full.personalization === 'object'
    ? full.personalization
    : {};
  const name = String(outlookText(personalization.name) || '').trim();
  if (!name) return '';
  const ageValue = Number(personalization.age);
  const hasAge = personalization.age !== ''
    && personalization.age != null
    && Number.isInteger(ageValue)
    && ageValue >= 0
    && ageValue <= 120;
  const label = `Prepared for ${name}${hasAge ? ` · Age ${ageValue} years` : ''}`;
  return `<p class="palm-life-hero__personalization">${escapeHtml(label)}</p>`;
}

function palmReportDateLabel(value = '') {
  const match = String(value || '').trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (!Number.isFinite(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC'
  });
}

function palmFriendlyConfirmationLabel(value = '') {
  const label = outlookText(value);
  if (!label || /^why this (?:timing|period) stands out$/i.test(label)) return 'Why this period is important';
  const legacyArea = label.match(/^why the (relationship|family|career|recognition|money) timing stands out$/i)?.[1]?.toLowerCase();
  if (legacyArea === 'recognition') return 'Why this period for being noticed is important';
  if (legacyArea) return `Why this ${legacyArea} period is important`;
  if (/^timing and wellbeing context$/i.test(label)) return 'What this period means for your energy';
  return label;
}

function palmCountWord(value) {
  const count = Number(value);
  return { 1: 'One', 2: 'Two', 3: 'Three' }[count] || String(value || '');
}

function palmPersonalAnswerRows(outlook = {}, domainKey = '') {
  const answers = palmPersonalAnswers(outlook);
  const domains = outlook.domains && typeof outlook.domains === 'object' ? outlook.domains : {};
  if (domainKey === 'loveMarriage') {
    const period = palmDisplayWindow(
      answers.marriage.period || answers.marriage.window || domains.loveMarriage?.primaryWindow,
      domains.loveMarriage?.timingState
    );
    const ageText = palmFriendlyAgeText(answers.marriage.ageRange || domains.loveMarriage?.ageRange);
    const rawCount = outlookText(answers.marriage.count, ['count', 'value']);
    const count = rawCount
      ? Number(rawCount) === 1
        ? 'One lasting marriage'
        : `${palmCountWord(rawCount)} serious relationships`
      : '';
    return [
      period ? { label: 'Relationship and commitment period', value: period, ageText } : null,
      count ? { label: 'Traditional overall-life indication', value: count } : null
    ].filter(Boolean);
  }
  if (domainKey === 'familyChildren') {
    const period = palmDisplayWindow(
      answers.children.period || answers.children.window || domains.familyChildren?.primaryWindow,
      domains.familyChildren?.timingState
    );
    const ageText = palmFriendlyAgeText(answers.children.ageRange || domains.familyChildren?.ageRange);
    const rawCount = outlookText(answers.children.count, ['count', 'value']);
    const count = rawCount ? `${palmCountWord(rawCount)} ${Number(rawCount) === 1 ? 'child' : 'children'}` : '';
    return [
      period ? { label: 'Family and home period', value: period, ageText } : null,
      count ? { label: 'Traditional overall-life indication', value: count } : null
    ].filter(Boolean);
  }
  if (domainKey === 'wellbeingEnergy') {
    const answer = outlookText(answers.expectedLifeSpan.answer, ['answer', 'value', 'summary']);
    const period = palmDisplayWindow(
      answers.expectedLifeSpan.period || answers.expectedLifeSpan.window || domains.wellbeingEnergy?.primaryWindow,
      domains.wellbeingEnergy?.timingState
    );
    const ageText = palmFriendlyAgeText(answers.expectedLifeSpan.ageRange || domains.wellbeingEnergy?.ageRange);
    return [
      answer ? { label: 'Energy pattern', value: answer } : null,
      period ? { label: 'Energy and recovery period', value: period, ageText } : null
    ].filter(Boolean);
  }
  return [];
}

function palmGrowthSummaryRows(outlook = {}) {
  const domains = outlook.domains && typeof outlook.domains === 'object' ? outlook.domains : {};
  return [
    { key: 'careerSuccess', icon: '↗', label: PALM_LIFE_AREA_TITLES.careerSuccess },
    { key: 'moneyWealth', icon: '₹', label: PALM_LIFE_AREA_TITLES.moneyWealth },
    { key: 'recognition', icon: '✦', label: PALM_LIFE_AREA_TITLES.recognition },
    { key: 'wellbeingEnergy', icon: '◐', label: PALM_LIFE_AREA_TITLES.wellbeingEnergy }
  ].map((meta) => {
    const domain = domains[meta.key] && typeof domains[meta.key] === 'object' ? domains[meta.key] : {};
    return {
      ...meta,
      answer: outlookText(domain.verdict, ['verdict', 'summary', 'value']),
      period: palmDisplayWindow(domain.primaryWindow, domain.timingState),
      periodLabel: outlookText(domain.periodLabel),
      age: palmAgeLabel(domain.ageRange)
    };
  }).filter((item) => item.answer || item.period);
}

function palmSummaryEvidence(value = '') {
  return String(value || '').split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 2).join(' ');
}

function palmPersonalAnswerSummary(value = '', domainKey = '') {
  const limit = domainKey === 'wellbeingEnergy' ? 2 : 3;
  return String(value || '')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .filter((sentence) => !/combined Palm and Kundli reading|Kundli gives a traditional indication|traditional indication, not a medical|medical or fertility (?:assessment|prediction)/i.test(sentence))
    .slice(0, limit)
    .join(' ');
}

function palmSummaryConfirmation(value = '', includeSafety = false) {
  const sentences = String(value || '').split(/(?<=[.!?])\s+/).filter(Boolean);
  if (!sentences.length) return '';
  const safety = includeSafety
    ? sentences.find((sentence) => /cannot predict (?:your )?health|how long you will live|medical result/i.test(sentence))
    : '';
  return [sentences[0], safety && safety !== sentences[0] ? safety : ''].filter(Boolean).join(' ');
}

function palmPersonalAnswersSummaryMarkup(outlook = {}) {
  const answers = palmPersonalAnswers(outlook);
  const domains = outlook.domains && typeof outlook.domains === 'object' ? outlook.domains : {};
  const marriageRows = palmPersonalAnswerRows(outlook, 'loveMarriage');
  const childrenRows = palmPersonalAnswerRows(outlook, 'familyChildren');
  const lifeRows = palmPersonalAnswerRows(outlook, 'wellbeingEnergy');
  if (!marriageRows.length && !childrenRows.length && !lifeRows.length) return '';
  const cards = [
    { key: 'loveMarriage', icon: '♥', label: outlookText(answers.marriage.title) || outlookText(domains.loveMarriage?.title) || PALM_LIFE_AREA_TITLES.loveMarriage, rows: marriageRows, answer: answers.marriage },
    { key: 'familyChildren', icon: '⌂', label: outlookText(answers.children.title) || outlookText(domains.familyChildren?.title) || PALM_LIFE_AREA_TITLES.familyChildren, rows: childrenRows, answer: answers.children },
    { key: 'wellbeingEnergy', icon: '◐', label: outlookText(answers.expectedLifeSpan.title) || outlookText(domains.wellbeingEnergy?.title) || PALM_LIFE_AREA_TITLES.wellbeingEnergy, rows: lifeRows, answer: answers.expectedLifeSpan }
  ].filter((item) => item.rows.length);
  const growthRows = palmGrowthSummaryRows(outlook);
  return `<section class="life-answer-summary" data-testid="palm-answer-summary">
    <div class="life-answer-summary__head"><small>Your life timeline</small><h2>Where each part of life becomes stronger</h2><p>Your strongest periods for relationships, family, career, money, recognition and energy are shown below.</p></div>
    <div class="life-answer-summary__grid">${cards.map((card, index) => {
      const answerSummary = palmPersonalAnswerSummary(outlookText(card.answer.answer, ['answer', 'summary', 'value']), card.key);
      const palmEvidence = palmSummaryEvidence(outlookText(card.answer.detail, ['detail', 'meaning', 'summary', 'value']));
      const confirmation = palmSummaryConfirmation(
        outlookText(card.answer.supportingConfirmation, ['supportingConfirmation', 'summary', 'value', 'text']),
        card.key === 'wellbeingEnergy'
      );
      const confirmationLabel = palmFriendlyConfirmationLabel(card.answer.supportingLabel);
      return `<article class="life-answer-summary__card" data-testid="palm-answer-summary-card">
        <div class="life-answer-summary__label"><i aria-hidden="true">${card.icon}</i><h3>${escapeHtml(card.label)}</h3><span class="life-answer-summary__index" aria-hidden="true">0${index + 1}</span></div>
        <div class="life-answer-summary__rows">${card.rows.map((row) => `<span><small>${escapeHtml(row.label)}</small><strong>${escapeHtml(row.value)}</strong>${row.ageText ? `<em class="life-age-context">${escapeHtml(row.ageText)}</em>` : ''}</span>`).join('')}</div>
        ${answerSummary || palmEvidence || confirmation ? `<div class="life-answer-summary__evidence">${answerSummary ? `<p><small>${card.key === 'wellbeingEnergy' ? 'Your long-term energy pattern' : 'What this period may bring'}</small>${escapeHtml(answerSummary)}</p>` : ''}${palmEvidence ? `<p><small>What your Palm shows</small>${escapeHtml(palmEvidence)}</p>` : ''}${confirmation ? `<p><small>${escapeHtml(confirmationLabel)}</small>${escapeHtml(confirmation)}</p>` : ''}</div>` : ''}
      </article>`;
    }).join('')}</div>
    ${growthRows.length ? `<div class="life-growth-summary"><div class="life-growth-summary__head"><small>Career, money and success</small><b>Best period shown for each area</b></div>${growthRows.map((item) => `<article><i aria-hidden="true">${item.icon}</i><div><small>${escapeHtml(item.label)}</small>${item.answer ? `<strong>${escapeHtml(item.answer)}</strong>` : ''}${item.period ? `<span>${escapeHtml(`${item.periodLabel ? `${item.periodLabel}: ` : ''}${item.period}${item.age ? ` · ${item.age}` : ''}`)}</span>` : ''}</div></article>`).join('')}</div>` : ''}
  </section>`;
}

function palmSupportingConfirmation(domain = {}, palmEvidence = '') {
  const candidates = [
    domain.supportingConfirmation,
    domain.timingConfirmation,
    domain.confirmation,
    domain.whyPersonal
  ];
  let text = outlookText(candidates.find((item) => outlookText(item, ['summary', 'value', 'text'])), ['summary', 'value', 'text']);
  if (!text) return '';
  const evidence = String(palmEvidence || '').trim();
  if (evidence && text.toLowerCase().startsWith(evidence.toLowerCase())) {
    text = text.slice(evidence.length).trim();
  }
  if (!text || text.toLowerCase() === evidence.toLowerCase()) return '';
  return text;
}

function palmLifeDomainCard(domain = {}, meta, outlook = {}) {
  const title = outlookText(domain.title) || meta.title;
  const verdict = outlookText(domain.verdict, ['verdict', 'summary', 'value']);
  const primaryWindow = palmDisplayWindow(domain.primaryWindow, domain.timingState);
  const timingLabel = outlookText(domain.periodLabel)
    || (domain.timingState === 'active' ? 'Already active' : 'Strongest period');
  const ageText = palmFriendlyAgeText(domain.ageRange);
  const developments = lifeReportList(domain.likelyDevelopments, ['text', 'value', 'summary', 'label']).slice(0, 3);
  const palmInsight = domain.palmInsight && typeof domain.palmInsight === 'object' ? domain.palmInsight : {};
  const directAnswer = meta.key === 'loveMarriage'
    ? palmPersonalAnswers(outlook).marriage
    : meta.key === 'familyChildren'
      ? palmPersonalAnswers(outlook).children
      : meta.key === 'wellbeingEnergy'
        ? palmPersonalAnswers(outlook).expectedLifeSpan
        : {};
  const directAnswerText = outlookText(directAnswer.answer, ['answer', 'value', 'summary']);
  const answer = ['loveMarriage', 'familyChildren'].includes(meta.key)
    ? verdict || directAnswerText
    : directAnswerText || verdict;
  const answerIncludesTiming = Boolean(primaryWindow) && (
    String(answer || '').includes(primaryWindow)
    || (domain.timingState === 'active' && /^From now through\b|^Your strongest .* window runs from now through\b/i.test(String(answer || '')))
  );
  const palmEvidence = outlookText(directAnswer.detail, ['detail', 'meaning', 'summary', 'value'])
    || outlookText(palmInsight.meaning, ['meaning', 'reading', 'summary', 'value'])
    || outlookText(palmInsight.reading, ['reading', 'meaning', 'summary', 'value']);
  const confirmation = palmSupportingConfirmation(domain, palmEvidence);
  const confirmationLabel = palmFriendlyConfirmationLabel(directAnswer.supportingLabel);
  const prepare = outlookText(domain.prepareNow, ['prepareNow', 'action', 'value']);
  const nameAlignment = domain.nameAlignment && typeof domain.nameAlignment === 'object' ? domain.nameAlignment : {};
  const nameAlignmentLabel = outlookText(nameAlignment.label) || 'What your name adds';
  const nameAlignmentSummary = outlookText(nameAlignment.summary, ['summary', 'value']);
  return `<article class="life-domain-card life-domain-card--${escapeHtml(meta.key)}">
    <div class="life-domain-card__head"><i aria-hidden="true">${meta.icon}</i><div><h3>${escapeHtml(title)}</h3></div></div>
    ${answer ? `<div class="life-domain-card__answer" data-testid="palm-answer-detail"><p>${escapeHtml(answer)}</p></div>` : ''}
    ${(!answerIncludesTiming && primaryWindow) || ageText ? `<div class="life-domain-card__timing">${!answerIncludesTiming && primaryWindow ? `<span><small>${timingLabel}</small><b>${escapeHtml(primaryWindow)}</b></span>` : ''}${ageText ? `<span><small>Personal timing</small><b>${escapeHtml(ageText)}</b></span>` : ''}</div>` : ''}
    ${developments.length ? `<div class="life-domain-card__developments"><small>What may happen in this period</small><ul>${developments.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
    ${palmEvidence || confirmation ? `<div class="life-domain-card__evidence">${palmEvidence ? `<p><strong>What your Palm shows</strong>${escapeHtml(palmEvidence)}</p>` : ''}${confirmation ? `<p><strong>${escapeHtml(confirmationLabel)}</strong>${escapeHtml(confirmation)}</p>` : ''}</div>` : ''}
    ${nameAlignmentSummary ? `<div class="life-domain-card__name-alignment"><small>${escapeHtml(nameAlignmentLabel)}</small><p>${escapeHtml(nameAlignmentSummary)}</p></div>` : ''}
    ${prepare ? `<div class="life-domain-card__action"><small>What you can do</small><p>${escapeHtml(prepare)}</p></div>` : ''}
  </article>`;
}

function palmAtGlanceMarkup(outlook = {}) {
  const palm = outlook.palmAtGlance && typeof outlook.palmAtGlance === 'object' ? outlook.palmAtGlance : {};
  const insights = Array.isArray(palm.insights) ? palm.insights.filter((item) => item && typeof item === 'object') : [];
  const headline = outlookText(palm.headline, ['headline', 'title', 'value']) || 'What your Palm lines show';
  const summary = outlookText(palm.summary, ['summary', 'value']);
  const bridge = outlookText(palm.bridge, ['bridge', 'summary', 'value']);
  if (!summary && !insights.length) return '';
  return `<section class="life-palm-card">
    <div class="life-palm-card__head"><i aria-hidden="true">✋</i><div><small>What your Palm lines show</small><h2>${escapeHtml(headline)}</h2></div></div>
    ${!insights.length && summary ? `<p class="life-palm-card__summary">${escapeHtml(summary)}</p>` : ''}
    ${insights.length ? `<div class="life-palm-grid">${insights.map((item) => `<article><small>${escapeHtml(outlookText(item.lineLabel, ['lineLabel', 'title', 'label']) || 'Visible line')}</small><p>${escapeHtml(outlookText(item.meaning, ['meaning', 'reading', 'summary', 'value']) || outlookText(item.reading, ['reading', 'summary', 'value']))}</p></article>`).join('')}</div>` : ''}
    ${bridge ? `<p class="life-palm-card__bridge"><strong>What you can do:</strong> ${escapeHtml(bridge)}</p>` : ''}
  </section>`;
}

function palmCurrentPhaseMarkup(outlook = {}) {
  const phase = outlook.currentPhase && typeof outlook.currentPhase === 'object' ? outlook.currentPhase : {};
  if (!outlookText(phase.headline)) return '';
  const broad = outlookText(phase.precision) === 'broad';
  const challenge = phase.challenge && typeof phase.challenge === 'object' ? phase.challenge : {};
  const support = phase.support && typeof phase.support === 'object' ? phase.support : {};
  const palm = phase.palm && typeof phase.palm === 'object' ? phase.palm : {};
  const transitions = Array.isArray(phase.transitions) ? phase.transitions.slice(0, 3) : [];
  const remedies = Array.isArray(phase.remedies) ? phase.remedies.slice(0, 3) : [];
  const insightCards = [challenge, support, palm].filter((item) => outlookText(item.body, ['body', 'summary', 'value']));
  return `<section class="life-report-section life-current-phase" data-testid="palm-current-phase">
    <div class="life-report-section__head"><small>${broad ? 'Current Palm + birth-date phase' : 'Current planetary phase'}</small><h2>What is shaping this period</h2>${outlookText(phase.summary, ['summary', 'value']) ? `<p>${escapeHtml(outlookText(phase.summary, ['summary', 'value']))}</p>` : ''}</div>
    ${insightCards.length ? `<div class="life-domain-grid">${insightCards.map((item) => `<article class="life-domain-card"><div class="life-domain-card__head"><i aria-hidden="true">✦</i><div><h3>${escapeHtml(outlookText(item.title) || '')}</h3></div></div><div class="life-domain-card__answer"><p>${escapeHtml(outlookText(item.body, ['body', 'summary', 'value']))}</p></div></article>`).join('')}</div>` : ''}
    ${transitions.length ? `<div class="life-report-section__head"><small>What changes next</small><h2>Your near future</h2></div><div class="life-phase-track">${transitions.map((item, index) => `<article class="life-phase"><div class="life-phase__number">${index + 1}</div><div><time>${escapeHtml(outlookText(item.period) || '')}</time><small>${escapeHtml(outlookText(item.dashaLabel) || '')}</small><h3>${escapeHtml(outlookText(item.title) || '')}</h3><p>${escapeHtml(outlookText(item.summary, ['summary', 'value']))}</p></div></article>`).join('')}</div>` : ''}
    ${remedies.length ? `<div class="life-report-section__head"><small>Easy traditional upay</small><h2>Simple remedies for this phase</h2><p>Choose one or two simple practices and follow them regularly.</p></div><div class="life-plan-grid">${remedies.map((item, index) => `<article><span>${index + 1}</span><small>${escapeHtml(outlookText(item.day) || '')}</small><h3>${escapeHtml(outlookText(item.title) || '')}</h3><p>${escapeHtml(outlookText(item.body, ['body', 'summary', 'value']))}</p></article>`).join('')}</div><p class="life-method-footer">${escapeHtml(outlookText(phase.remedyNote) || 'These are traditional spiritual practices, not guaranteed cures.')}</p>` : ''}
  </section>`;
}

function palmNameAlignmentBridgeMarkup(outlook = {}) {
  const nameAlignment = outlook.heroMetadata?.nameAlignment && typeof outlook.heroMetadata.nameAlignment === 'object'
    ? outlook.heroMetadata.nameAlignment
    : {};
  const label = outlookText(nameAlignment.label) || 'How your name connects to your Palm reading';
  const title = outlookText(nameAlignment.title, ['title', 'headline', 'value']);
  const summary = outlookText(nameAlignment.summary, ['summary', 'value']);
  if (!title && !summary) return '';
  return `<section class="life-name-alignment-bridge"><small>${escapeHtml(label)}</small>${title ? `<h2>${escapeHtml(title)}</h2>` : ''}${summary ? `<p>${escapeHtml(summary)}</p>` : ''}</section>`;
}

function palmLifeHeroMarkup(full = {}, outlook = {}, fallbackHeadline = '') {
  const current = outlook.currentPhase && typeof outlook.currentPhase === 'object' ? outlook.currentPhase : {};
  const hasCurrent = Boolean(outlookText(current.headline));
  const headline = hasCurrent
    ? outlookText(current.headline)
    : outlookText(outlook.headline) || fallbackHeadline || 'Your Complete Palm Life Timeline';
  const strongest = outlook.strongestWindow && typeof outlook.strongestWindow === 'object' ? outlook.strongestWindow : {};
  const turning = outlook.positiveTurningPoint && typeof outlook.positiveTurningPoint === 'object' ? outlook.positiveTurningPoint : {};
  const source = hasCurrent ? current : (outlookText(turning.summary, ['summary', 'value']) ? turning : strongest);
  const summary = outlookText(source.summary, ['summary', 'value']);
  const action = outlookText(source.prepareNow, ['prepareNow', 'action', 'value']);
  const window = palmDisplayWindow(source, source.timingState);
  const leadDomainKey = Array.isArray(source.primaryDomains) && source.primaryDomains.length
    ? source.primaryDomains[0]
    : Array.isArray(source.domains) && source.domains.length ? source.domains[0] : source.domain;
  const leadDomain = outlook.domains && typeof outlook.domains === 'object' ? outlook.domains[leadDomainKey] || {} : {};
  const age = palmAgeLabel(source.ageRange || leadDomain.ageRange);
  const datedPeriod = `${window}${window && age ? ` · ${age}` : ''}`;
  const leadPalmInsight = hasCurrent && current.palm && typeof current.palm === 'object'
    ? current.palm
    : leadDomain.palmInsight && typeof leadDomain.palmInsight === 'object' ? leadDomain.palmInsight : {};
  const palmWhy = String(outlookText(leadPalmInsight.body, ['body', 'meaning', 'reading', 'summary', 'value'])
    || outlookText(leadPalmInsight.meaning, ['meaning', 'reading', 'summary', 'value'])
    || outlookText(leadPalmInsight.reading, ['reading', 'meaning', 'summary', 'value'])
    || outlookText(source.whyPersonal, ['whyPersonal', 'why', 'summary', 'value']) || '').split(/(?<=[.!?])\s+/)[0] || '';
  const confirmation = (hasCurrent ? outlookText(current.support?.body, ['body', 'summary', 'value']) : '')
    || outlookText(source.supportingConfirmation, ['supportingConfirmation', 'summary', 'value', 'text'])
    || outlookText(leadDomain.supportingConfirmation, ['supportingConfirmation', 'summary', 'value', 'text']);
  const label = hasCurrent ? 'Your current phase' : source.timingState === 'active' ? 'Your most important period is active now' : 'Your strongest overall period';
  const reportDate = hasCurrent ? palmReportDateLabel(current.asOf) : '';
  const periodHeading = hasCurrent ? outlookText(current.dashaLabel) : datedPeriod;
  const periodSubline = hasCurrent
    ? [outlookText(current.immediateDashaLabel), window, age].filter(Boolean).join(' · ')
    : '';
  return `<section class="palm-life-hero">
    <div class="kicker center">Payment confirmed · Complete Palm Life Timeline</div>
    ${palmPreparedForMarkup(full)}
    ${reportDate ? `<p class="palm-life-hero__personalization">Report date: ${escapeHtml(reportDate)}</p>` : ''}
    <small class="palm-life-hero__label">${escapeHtml(label)}</small>
    <h1 class="paid-title">${escapeHtml(headline)}</h1>
    ${summary || window ? `<div class="life-main-window"><div><small>${hasCurrent ? (IS_GLOBAL_STOREFRONT ? 'Current symbolic period' : 'Current Dasha and Antardasha') : source.timingState === 'active' ? 'Active period' : 'Strongest period'}</small>${periodHeading ? `<b${hasCurrent ? ' class="life-main-window__dasha"' : ''}>${escapeHtml(periodHeading)}</b>` : ''}${periodSubline ? `<span class="life-main-window__subperiod">${escapeHtml(periodSubline)}</span>` : ''}</div>${!hasCurrent && summary ? `<p>${escapeHtml(palmSummaryEvidence(summary))}</p>` : ''}${!hasCurrent && palmWhy ? `<p class="life-main-window__why"><b>What your Palm shows</b> ${escapeHtml(palmWhy)}</p>` : ''}${!hasCurrent && confirmation ? `<p class="life-main-window__why"><b>Why this period is important</b> ${escapeHtml(confirmation)}</p>` : ''}${!hasCurrent && action ? `<span><b>What you can do:</b> ${escapeHtml(action)}</span>` : ''}</div>` : ''}
  </section>`;
}

function palmLifeSummaryMarkup(full = {}, outlook = {}, fallbackHeadline = '', recommendationTeaser = '') {
  return `${palmLifeHeroMarkup(full, outlook, fallbackHeadline)}
    ${palmCurrentPhaseMarkup(outlook)}
    ${palmNameAlignmentBridgeMarkup(outlook)}
    ${palmPersonalAnswersSummaryMarkup(outlook)}
    ${recommendationTeaser}
    ${palmAtGlanceMarkup(outlook)}`;
}

function globalPalmReportContract(full = {}) {
  const schemaVersion = String(full?.schemaVersion || '').trim();
  const copyVersion = String(full?.reportCopyVersion || '').trim();
  const canonicalDisclaimer = String(STOREFRONT.reportDisclaimer || '').trim();
  const disclaimer = String(full?.disclaimer || canonicalDisclaimer).trim();
  const hero = full?.hero && typeof full.hero === 'object' ? full.hero : null;
  const sections = Array.isArray(full?.sections) ? full.sections : null;
  if (
    schemaVersion !== STOREFRONT.reportSchemaVersion
    || copyVersion !== STOREFRONT.reportCopyVersion
    || !canonicalDisclaimer
    || disclaimer !== canonicalDisclaimer
    || !hero
    || !sections
    || !sections.length
    || ![hero.kicker, hero.label, hero.title, hero.subtitle].every((value) => String(value || '').trim())
  ) return null;
  const validSections = sections.every((section) => (
    section
    && typeof section === 'object'
    && String(section.key || '').trim()
    && String(section.label || '').trim()
    && String(section.title || '').trim()
    && String(section.body || '').trim()
    && Array.isArray(section.items)
    && section.items.every((item) => (
      item
      && typeof item === 'object'
      && String(item.key || '').trim()
      && String(item.label || '').trim()
      && String(item.title || '').trim()
      && String(item.body || '').trim()
      && (!item.action || String(item.actionLabel || '').trim())
    ))
    && (!section.action || String(section.actionLabel || '').trim())
  ));
  return validSections ? { ...full, disclaimer } : null;
}

function globalPalmReportItemMarkup(item = {}) {
  return `<article class="life-domain-card global-palm-line-card" data-report-item-key="${escapeHtml(item.key)}"><div class="life-domain-card__head"><i aria-hidden="true">✋</i><div><small>${escapeHtml(item.label)}</small><h3>${escapeHtml(item.title)}</h3></div></div><div class="life-domain-card__answer"><p>${escapeHtml(item.body)}</p></div>${item.action ? `<div class="life-domain-card__action"><small>${escapeHtml(item.actionLabel)}</small><p>${escapeHtml(item.action)}</p></div>` : ''}</article>`;
}

function globalPalmReportSectionMarkup(section = {}) {
  if (section.key === 'clearest_pattern') {
    return `<section class="life-age-card global-palm-clearest" data-report-section="${escapeHtml(section.key)}"><i aria-hidden="true">✦</i><div><small>${escapeHtml(section.label)}</small><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p>${section.action ? `<span><b>${escapeHtml(section.actionLabel)}:</b> ${escapeHtml(section.action)}</span>` : ''}</div></section>`;
  }
  if (section.key === 'how_to_use') {
    return `<section class="life-closing-card global-palm-closing" data-report-section="${escapeHtml(section.key)}"><small>${escapeHtml(section.label)}</small><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></section>`;
  }
  return `<section class="life-report-section global-palm-report-section" data-report-section="${escapeHtml(section.key)}">
    <div class="life-report-section__head"><small>${escapeHtml(section.label)}</small><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.body)}</p></div>
    <div class="life-domain-grid">${section.items.map(globalPalmReportItemMarkup).join('')}</div>
  </section>`;
}

function globalPalmPaidReportMarkup(full = {}, pdfUrl = '') {
  const report = globalPalmReportContract(full);
  if (!report) {
    return `<div class="analysis-screen" data-testid="global-palm-report-unavailable"><div class="analysis-orbit"><span>✦</span></div><h1 class="question-title center">This report cannot be displayed safely.</h1><p class="question-copy center">Reopen the original report link or try again later.</p></div>`;
  }
  return `<div class="palm-life-report palm-life-report--global" data-testid="global-palm-paid-report" data-report-copy-version="${escapeHtml(report.reportCopyVersion)}">
    <section class="palm-life-hero">
      <div class="kicker center">${escapeHtml(report.hero.kicker)}</div>
      ${palmPreparedForMarkup(report)}
      <small class="palm-life-hero__label">${escapeHtml(report.hero.label)}</small>
      <h1 class="paid-title">${escapeHtml(report.hero.title)}</h1>
      <p class="hero-subtitle">${escapeHtml(report.hero.subtitle)}</p>
    </section>
    ${report.sections.map(globalPalmReportSectionMarkup).join('')}
    <div class="life-method-footer">${escapeHtml(report.disclaimer)}</div>
    ${paidDeliveryMarkup(report, pdfUrl, { completePdfLabel: true, includeInvoice: false })}
  </div>`;
}

function palmLifeTimelineMarkup(full, fallbackHeadline = '', synthesis = '', recommendationTeaser = '') {
  const outlook = fullPalmLifeOutlook(full);
  if (!outlook) {
    return `<div class="kicker center">Payment confirmed</div>
      ${palmPreparedForMarkup(full)}
      <h1 class="paid-title">${escapeHtml(fallbackHeadline || 'Your Complete Palm Life Timeline')}</h1>
      <p class="hero-subtitle">Your relationship, family, career, money, success, energy and recovery readings are shown below.</p>
      <div class="paid-card">${paidSections(full)}${synthesis ? `<div class="paid-section"><small>How it comes together</small><p>${escapeHtml(synthesis)}</p></div>` : ''}</div>
      ${recommendationTeaser}`;
  }

  const windows = Array.isArray(outlook.nextThreeWindows) ? outlook.nextThreeWindows.slice(0, 3) : [];
  const domains = outlook.domains && typeof outlook.domains === 'object' ? outlook.domains : {};
  const ageStrength = outlook.whatStrengthensWithAge && typeof outlook.whatStrengthensWithAge === 'object' ? outlook.whatStrengthensWithAge : {};
  const positiveRecap = outlook.positiveRecap && typeof outlook.positiveRecap === 'object' ? outlook.positiveRecap : {};

  const phaseMarkup = windows.length ? `<section class="life-report-section life-phases">
    <div class="life-report-section__head"><small>What changes later</small><h2>How your next three major periods unfold</h2></div>
    <div class="life-phase-track">${windows.map((item, index) => {
      const window = palmDisplayWindow(item, item.timingState);
      const periodLabel = outlookText(item.periodLabel);
      const age = palmAgeLabel(item.ageRange);
      const datedPeriod = `${periodLabel ? `${periodLabel}: ` : ''}${window || 'Timing remains broad'}${window && age ? ` · ${age}` : ''}`;
      const title = outlookText(item, ['title', 'label']) || `Phase ${index + 1}`;
      const summary = outlookText(item.summary, ['summary', 'value']);
      const prepare = outlookText(item.prepareNow, ['prepareNow', 'action', 'value']);
      return `<article class="life-phase"><div class="life-phase__number">${index + 1}</div><div><time>${escapeHtml(datedPeriod)}</time><h3>${escapeHtml(title)}</h3>${summary ? `<p>${escapeHtml(summary)}</p>` : ''}${prepare ? `<small><b>What you can do:</b> ${escapeHtml(prepare)}</small>` : ''}</div></article>`;
    }).join('')}</div>
  </section>` : '';

  const ageVerdict = outlookText(ageStrength.verdict, ['verdict', 'summary', 'value']);
  const ageWhy = outlookText(ageStrength.whyPersonal, ['whyPersonal', 'why', 'summary', 'value']);
  const ageWhyIsPalm = /\b(?:heart|head|life|fate) line\b/i.test(ageWhy);
  const ageConfirmation = outlookText(ageStrength.supportingConfirmation, ['supportingConfirmation', 'summary', 'value', 'text']);
  const ageAction = outlookText(ageStrength.prepareNow, ['prepareNow', 'action', 'value']);
  const recapTitle = outlookText(positiveRecap.title, ['title', 'label']) || 'Your way forward';
  const recapSummary = outlookText(positiveRecap.summary, ['summary', 'value']);
  const recapMilestone = outlookText(positiveRecap.milestone, ['milestone', 'window', 'value']);
  const recapStep = outlookText(positiveRecap.firstStep, ['firstStep', 'action', 'value']);
  const recapPalm = outlookText(positiveRecap.palmReminder, ['palmReminder', 'summary', 'value']);
  const recapNameAlignment = positiveRecap.nameAlignment && typeof positiveRecap.nameAlignment === 'object'
    ? positiveRecap.nameAlignment
    : {};
  const recapNameLabel = outlookText(recapNameAlignment.label) || 'What this means for the name you use';
  const recapNameTitle = outlookText(recapNameAlignment.title, ['title', 'headline', 'value']);
  const recapNameGuidance = outlookText(recapNameAlignment.guidance, ['guidance', 'summary', 'value']);
  // `details` already includes any ranked spelling lines, so prefer it and fall
  // back to bare options only for older stored reports that predate it.
  const recapNameDetails = Array.isArray(recapNameAlignment.details)
    ? recapNameAlignment.details.map((detail) => outlookText(detail, ['summary', 'value', 'title'])).filter(Boolean)
    : [];
  const recapNameOptions = recapNameDetails.length
    ? recapNameDetails
    : (Array.isArray(recapNameAlignment.options)
      ? recapNameAlignment.options.map((option) => outlookText(option, ['summary', 'value', 'title'])).filter(Boolean).slice(0, 3)
      : []);
  const enhancedMethod = Boolean(outlook.nameAlignment);

  return `<div class="palm-life-report">
    ${palmLifeSummaryMarkup(full, outlook, fallbackHeadline, recommendationTeaser)}
    ${phaseMarkup}
    <section class="life-report-section life-domains">
      <div class="life-report-section__head"><small>Your full Palm reading</small><h2>What the reading says about each part of your life</h2></div>
      <div class="life-domain-grid">${PALM_LIFE_DOMAIN_UI.map((meta) => palmLifeDomainCard(domains[meta.key] || {}, meta, outlook)).join('')}</div>
    </section>
    ${ageVerdict ? `<section class="life-age-card"><i aria-hidden="true">↗</i><div><small>${escapeHtml(outlookText(ageStrength.title) || 'What becomes easier with experience')}</small><h2>${escapeHtml(ageVerdict)}</h2>${ageWhy ? `<p><b>${ageWhyIsPalm ? 'What your Palm shows' : 'Why this becomes easier with experience'}:</b> ${escapeHtml(ageWhy)}</p>` : ''}${ageConfirmation ? `<p><b>What your birth date adds:</b> ${escapeHtml(ageConfirmation)}</p>` : ''}${ageAction ? `<span><b>What to continue:</b> ${escapeHtml(ageAction)}</span>` : ''}</div></section>` : ''}
    ${recapSummary || recapNameTitle || recapNameGuidance ? `<section class="life-closing-card"><small>${escapeHtml(recapTitle)}</small>${recapSummary ? `<h2>${escapeHtml(recapSummary)}</h2>` : ''}${recapPalm ? `<p>${escapeHtml(recapPalm)}</p>` : ''}${recapNameTitle || recapNameGuidance ? `<div class="life-closing-card__name-alignment"><small>${escapeHtml(recapNameLabel)}</small>${recapNameTitle ? `<h3>${escapeHtml(recapNameTitle)}</h3>` : ''}${recapNameGuidance ? `<p>${escapeHtml(recapNameGuidance)}</p>` : ''}${recapNameOptions.length ? `<ul>${recapNameOptions.map((option) => `<li>${escapeHtml(option)}</li>`).join('')}</ul>` : ''}</div>` : ''}<div class="life-closing-card__next">${recapMilestone ? `<span><small>Next milestone</small><b>${escapeHtml(recapMilestone)}</b></span>` : ''}${recapStep ? `<span><small>First step</small><b>${escapeHtml(recapStep)}</b></span>` : ''}</div><button type="button" data-action="share-whatsapp">Share the free Palm scan</button><em>Nothing from your private report or palm photo is shared.</em></section>` : ''}
    <div class="life-method-footer">${escapeHtml(IS_GLOBAL_STOREFRONT
      ? full?.disclaimer || STOREFRONT.reportDisclaimer
      : enhancedMethod
        ? 'Your report combines the lines visible in your Palm photo with your Vedic birth chart and birth-date numbers. Name Alignment also compares the name you entered with your Birth and Destiny Numbers. These traditional methods offer guidance, not guaranteed predictions. A Palm reading cannot predict your health, how long you will live or any medical result.'
        : 'Your report combines the lines visible in your Palm photo with your Vedic birth chart and birth-date numbers. These traditional methods offer guidance, not guaranteed predictions. A Palm reading cannot predict your health, how long you will live or any medical result.')}</div>
  </div>`;
}

function paidSections(full) {
  const web = full?.web || {};
  const defaultAnswerLabel = state.lane === 'palm_answers' ? 'Your reading' : 'Your answer';
  const defaultAdviceLabel = state.lane === 'palm_answers' ? 'What to do now' : 'Best move now';
  if (Array.isArray(web.predictions) && web.predictions.length) {
    return web.predictions.filter((row) => !removedReportText(`${row?.key || ''} ${row?.label || ''}`)).map((row) => `<div class="paid-section"><small>${escapeHtml(row.label || row.key || defaultAnswerLabel)}</small><b>${escapeHtml(row.value || 'See the details below')}</b>${row.window ? `<span>${escapeHtml(row.window)}</span>` : ''}${row.why ? `<p><strong>${escapeHtml(row.whyLabel || 'Why we see it')}:</strong> ${escapeHtml(row.why)}</p>` : ''}${Array.isArray(row.details) ? row.details.filter((detail) => !removedReportText(detail)).map((detail) => `<p>• ${escapeHtml(detail)}</p>`).join('') : ''}${row.advice ? `<p><strong>${escapeHtml(row.adviceLabel || defaultAdviceLabel)}:</strong> ${escapeHtml(row.advice)}</p>` : ''}</div>`).join('');
  }
  if (Array.isArray(full?.sections) && full.sections.length) {
    return full.sections.filter((section) => !removedReportText(section?.title)).map((section) => `<div class="paid-section"><small>${escapeHtml(section.title || 'Your reading')}</small>${section.prediction ? `<b>${escapeHtml(section.prediction)}</b>` : ''}${section.why ? `<p><strong>${escapeHtml(section.whyLabel || 'Why we see it')}:</strong> ${escapeHtml(section.why)}</p>` : ''}${Array.isArray(section.details) ? section.details.filter((detail) => !removedReportText(detail)).map((detail) => `<p>• ${escapeHtml(detail)}</p>`).join('') : ''}${section.advice ? `<p><strong>${escapeHtml(section.adviceLabel || defaultAdviceLabel)}:</strong> ${escapeHtml(section.advice)}</p>` : ''}</div>`).join('');
  }
  return '<div class="paid-section"><small>Your report</small><b>Your complete result is available in the PDF.</b><p>Use the PDF button below to read the full report.</p></div>';
}

function removedReportText(value) {
  return /tarot|chosen card|advertised letter|\bm signal\b|\bletter m\b|city direction|current city|direction from|already written|already prepared|pressure layer|timing stack|recognition clues?|open every result|where success flows/i.test(String(value || ''));
}

function safeShareValue(value, limit = 86) {
  const text = String(value || '').replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!text || removedReportText(text)) return '';
  if (text.length <= limit) return text;
  const available = Math.max(8, limit - 1);
  const candidate = text.slice(0, available + 1);
  const wordBoundary = candidate.lastIndexOf(' ');
  const cutoff = wordBoundary >= Math.floor(available * 0.6)
    ? wordBoundary
    : available;
  return `${text.slice(0, cutoff).replace(/[\s,;:–—-]+$/, '')}…`;
}

const GLOBAL_SHARE_PALM_LINE_LABELS = Object.freeze({
  love: 'Heart Line',
  heart: 'Heart Line',
  head: 'Head Line',
  life: 'Life Line',
  fate: 'Fate Line'
});

function globalPalmStrongestKey(full = state.full) {
  const key = String(full?.evidence?.strongestLineKey || '').trim().toLowerCase();
  return GLOBAL_SHARE_PALM_LINE_LABELS[key] ? key : '';
}

function globalPalmPattern(full = state.full) {
  const strongest = globalPalmStrongestKey(full);
  return strongest
    ? `${GLOBAL_SHARE_PALM_LINE_LABELS[strongest]} · clearest visible pattern`
    : 'Visible Palm lines · reflected separately';
}

function sharePublicBaseUrl() {
  const configured = IS_GLOBAL_STOREFRONT
    ? STOREFRONT.publicBaseUrl
    : RUNTIME_CONFIG.publicBaseUrl;
  try {
    return new URL(configured || (IS_GLOBAL_STOREFRONT
      ? 'https://global.tarotbyvela.com'
      : 'https://astro.tarotbyvela.com'));
  } catch (_) {
    return new URL(IS_GLOBAL_STOREFRONT
      ? 'https://global.tarotbyvela.com'
      : 'https://astro.tarotbyvela.com');
  }
}

function shareDisplayHostname() {
  return IS_GLOBAL_STOREFRONT
    ? sharePublicBaseUrl().hostname
    : 'astro.tarotbyvela.com';
}

function shareResultValue(full = state.full) {
  if (IS_GLOBAL_STOREFRONT) return globalPalmPattern(full);
  const predictions = Array.isArray(full?.web?.predictions) ? full.web.predictions : [];
  if (state.lane === 'best_city') {
    const row = predictions.find((item) => item?.key === 'bestCity');
    return safeShareValue(row?.value || full?.report?.locationMatch?.top?.label, 58);
  }
  if (state.lane === 'partner_name') {
    const rankings = Array.isArray(full?.report?.soulmate?.initialRankings)
      ? full.report.soulmate.initialRankings
      : [];
    return rankings.map((item) => String(item?.initial || '').toUpperCase()).filter((value) => /^[A-Z]$/.test(value)).slice(0, 3).join(' · ');
  }
  if (state.lane === 'name_numerology') {
    const profile = full?.report?.nameNumerology || {};
    const compound = Number(profile.compound || full?.numerology?.chaldeanCompound || 0);
    const root = Number(profile.nameNumber || full?.numerology?.chaldeanNameNumber || 0);
    return compound && root ? `${compound}/${root}` : root ? String(root) : '';
  }
  if (state.lane === 'market_profile') {
    const row = predictions.find((item) => item?.key === 'marketStyle');
    return safeShareValue(row?.value || full?.report?.marketProfile?.primaryStyleLabel, 58);
  }
  if (state.lane === 'face_answers') {
    const row = predictions.find((item) => ['recognition', 'careerSuccess', 'timing'].includes(item?.key))
      || predictions[0];
    return safeShareValue(row?.value || full?.report?.face?.headline, 78);
  }
  const lifeOutlook = full?.lifeOutlook && typeof full.lifeOutlook === 'object' ? full.lifeOutlook : {};
  const strongest = palmStrongestWindow(lifeOutlook);
  const turningPoint = palmPositiveTurningPoint(lifeOutlook);
  if (strongest.window) return safeShareValue(`${strongest.title}: ${strongest.window}`, 78);
  if (turningPoint) return safeShareValue(turningPoint, 78);
  const row = predictions.find((item) => item?.key === 'palmAnswer');
  const strongestLine = String(full?.report?.palm?.strongestLine || '').toLowerCase();
  const lineFallback = { heart: 'Heart-line result', head: 'Head-line result', life: 'Life-line result', fate: 'Fate-line result' }[strongestLine] || '';
  return safeShareValue(row?.value || lineFallback, 78);
}

function hasPalmLifeOutlook(full = state.full) {
  return Boolean(full?.lifeOutlook && typeof full.lifeOutlook === 'object' && Object.keys(full.lifeOutlook).length);
}

function shareCardContent(full = state.full) {
  const config = laneConfig();
  const result = shareResultValue(full);
  const reveal = Boolean(state.shareResultVisible && result);
  if (IS_GLOBAL_STOREFRONT) {
    const standout = Boolean(globalPalmStrongestKey(full));
    return {
      reveal,
      result,
      title: standout
        ? reveal ? 'MY CLEAREST PALM PATTERN' : 'GUESS MY CLEAREST PALM PATTERN'
        : reveal ? 'MY VISIBLE PALM LINES' : 'WHAT DO MY PALM LINES SHOW?',
      main: reveal
        ? result
        : standout ? 'Which major Palm line was clearest?' : 'Which major Palm lines were clear enough to reflect?',
      note: 'Symbolic Palm reflection · no photo shared',
      prompt: reveal ? 'What might your visible lines suggest?' : 'Try the same private Palm reflection'
    };
  }
  const legacyPalmReport = state.lane === 'palm_answers' && !hasPalmLifeOutlook(full);
  const combinedFaceReport = state.lane === 'face_answers'
    && full?.product?.key === 'face_answers';
  return {
    reveal,
    result,
    title: legacyPalmReport ? (reveal ? 'MY MAIN PALM RESULT' : 'GUESS MY PALM RESULT') : (reveal ? config.shareRevealTitle : config.shareMysteryTitle),
    main: legacyPalmReport && !reveal ? 'What did the visible lines suggest?' : (reveal ? result : config.shareMysteryBody),
    note: legacyPalmReport && reveal
      ? 'Personal Palm Reading'
      : reveal && state.lane === 'face_answers'
        ? combinedFaceReport
          ? 'Face · Astrology · Numerology'
          : 'Portrait reflection · no photo shared'
        : reveal ? config.shareRevealNote : config.shareMysteryPrompt,
    prompt: legacyPalmReport && reveal ? 'What would yours show?' : (reveal ? config.shareRevealPrompt : 'Try the same reading at PalmQ IND')
  };
}

function shareReferralLink(platform = 'share_menu') {
  const route = IS_GLOBAL_STOREFRONT
    ? '/'
    : { best_city: '/best-city', partner_name: '/partner-name', palm_answers: '/palm-answers', face_answers: '/face-reading', name_numerology: '/name-numerology', market_profile: '/market-profile' }[state.lane] || '/';
  const base = sharePublicBaseUrl();
  base.pathname = route;
  base.search = '';
  base.hash = '';
  base.searchParams.set('ref', state.shareCode);
  base.searchParams.set('utm_source', 'customer_share');
  base.searchParams.set('utm_medium', String(platform).slice(0, 40));
  base.searchParams.set('utm_campaign', 'result_share');
  base.searchParams.set('utm_content', `${state.lane}_${state.shareResultVisible ? 'reveal' : 'mystery'}`);
  base.searchParams.set('utm_id', state.shareCode);
  return base.toString();
}

function shareDraftText(full = state.full, platform = 'share_menu') {
  const card = shareCardContent(full);
  const link = shareReferralLink(platform);
  if (IS_GLOBAL_STOREFRONT) {
    const standout = Boolean(globalPalmStrongestKey(full));
    return card.reveal
      ? standout
        ? `The clearest visible pattern in my symbolic Palm reading was my ${card.result.replace(/ ·.*$/, '')}. What might your visible lines suggest? ${link}`
        : `My symbolic Palm reading reflected each visible line separately without forcing a ranking. What might your visible lines suggest? ${link}`
      : standout
        ? `I tried a private symbolic Palm reading. Which major line do you think was clearest? ${link}`
        : `I tried a private symbolic Palm reading. Which major lines do you think were clear enough to reflect? ${link}`;
  }
  if (state.lane === 'best_city') {
    return card.reveal
      ? `My #1 city match is ${card.result}. Would your chart pick the same? ${link}`
      : `I found my top city match. Which city do you think came first? ${link}`;
  }
  if (state.lane === 'partner_name') {
    return card.reveal
      ? `My top possible partner initials are ${card.result}. Which name came to mind? ${link}`
      : `I ranked three possible partner initials from my chart and numbers. Which letters do you think came first? ${link}`;
  }
  if (state.lane === 'name_numerology') {
    return card.reveal
      ? `My name carries ${card.result} in Chaldean numerology. What number does your name carry? ${link}`
      : `I compared my Name Number with my birth numbers. Which number do you think my name carries? ${link}`;
  }
  if (state.lane === 'market_profile') {
    return card.reveal
      ? `My investor style is “${card.result}”. Fast, patient or mixed—which one are you? ${link}`
      : `I checked my market decision habits under pressure. Fast, patient or mixed—which style do you think I got? ${link}`;
  }
  if (state.lane === 'face_answers') {
    const combinedFaceReport = full?.product?.key === 'face_answers';
    return card.reveal
      ? `My Face Reading highlighted this possible first-glance signal: “${card.result}”. What might your portrait suggest? ${link}`
      : combinedFaceReport
        ? `I compared a possible first-glance cue from my portrait with my birth chart and numbers. Which theme do you think stood out? ${link}`
        : `I explored a possible first-glance cue from one portrait. Which signal do you think stood out? ${link}`;
  }
  if (!hasPalmLifeOutlook(full)) {
    return card.reveal
      ? `My main Palm result is “${card.result}”. What might your visible lines suggest? ${link}`
      : `I had the visible lines in my left palm checked. What do you think they suggested? ${link}`;
  }
  return card.reveal
    ? `My strongest life phase is “${card.result}”. Which part of your life becomes stronger next? ${link}`
    : `I mapped six parts of my life through a personal Palm reading. Which part do you think becomes stronger first? ${link}`;
}

function sharePreviewMarkup(full = state.full) {
  const card = shareCardContent(full);
  return `<div class="story-card-preview ${card.reveal ? 'is-reveal' : ''}" data-testid="share-card-preview">
    <div class="story-card-preview__brand"><span>✋ PalmQ IND</span><small>Story mode</small></div>
    <div class="story-card-preview__star" aria-hidden="true">✦</div>
    <b>${escapeHtml(card.title)}</b>
    <strong>${escapeHtml(card.main)}</strong>
    <p>${escapeHtml(card.note)}</p>
    <div class="story-card-preview__footer"><span>${escapeHtml(card.prompt)}</span><small>${escapeHtml(shareDisplayHostname())}</small></div>
  </div>`;
}

function socialShareBuilder(full = state.full) {
  const config = laneConfig();
  const resultAvailable = Boolean(shareResultValue(full));
  return `<section class="share-builder" data-testid="share-builder" aria-live="off">
    <div class="kicker">Optional Story card</div>
    <h2>${escapeHtml(config.shareHeading)}</h2>
    <p class="share-builder__intro">Choose whether the card shows your result. Then share it as a Story or Status.</p>
    <div class="share-mode-picker" role="group" aria-label="Choose what the Story card shows">
      <button type="button" class="share-mode ${state.shareResultVisible ? '' : 'is-active'}" data-action="share-mode" data-value="mystery" aria-pressed="${state.shareResultVisible ? 'false' : 'true'}"><b>Hide the result</b><span>Let friends guess.</span></button>
      <button type="button" class="share-mode ${state.shareResultVisible ? 'is-active' : ''}" data-action="share-mode" data-value="reveal" aria-pressed="${state.shareResultVisible ? 'true' : 'false'}" ${resultAvailable ? '' : 'disabled'}><b>Show the result</b><span>Share only this answer.</span></button>
    </div>
    ${sharePreviewMarkup(full)}
    <div class="share-privacy">🔒 The card never includes your name, birth details, full report or ${state.lane === 'face_answers' ? 'face' : 'palm'} photo. It shows your result only if you choose “Show the result.”</div>
    <button class="primary-button share-main-button" type="button" data-action="share-menu">Share Story card</button>
    <div class="share-action-grid">
      <button type="button" data-action="share-whatsapp">Share on WhatsApp</button>
      <button type="button" data-action="save-story-card">Save Story card</button>
      <button type="button" data-action="copy-share-link">Copy reading link</button>
    </div>
    <div class="share-confirmation">Nothing posts automatically. You choose the app, audience and final post.</div>
    <div class="share-message" id="shareMessage" aria-live="polite"></div>
  </section>`;
}

function setShareMessage(message, error = false) {
  const host = document.getElementById('shareMessage');
  if (!host) return;
  host.className = `share-message${error ? ' is-error' : ''}`;
  host.textContent = message;
}

function setShareMode(value) {
  const reveal = value === 'reveal' && Boolean(shareResultValue());
  if (state.shareResultVisible === reveal) return;
  state.shareResultVisible = reveal;
  persist();
  track('share_preview', { share_id: state.shareCode, variant: state.shareResultVisible ? 'reveal' : 'mystery' });
  const builder = stage.querySelector('[data-testid="share-builder"]');
  if (!builder) return;
  builder.querySelectorAll('[data-action="share-mode"]').forEach((button) => {
    const active = button.dataset.value === (state.shareResultVisible ? 'reveal' : 'mystery');
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  const preview = builder.querySelector('[data-testid="share-card-preview"]');
  if (preview) preview.outerHTML = sharePreviewMarkup();
  setShareMessage('');
}

function canvasLines(context, text, maxWidth, maxLines = 4) {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && context.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    } else {
      line = next;
    }
  }
  if (line && lines.length < maxLines) lines.push(line);
  return lines;
}

function drawCanvasLines(context, text, x, y, maxWidth, lineHeight, maxLines = 4) {
  const lines = canvasLines(context, text, maxWidth, maxLines);
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
  return y + lines.length * lineHeight;
}

function buildShareCanvas(full = state.full) {
  const card = shareCardContent(full);
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext('2d');
  const gradient = context.createLinearGradient(0, 0, 1080, 1920);
  gradient.addColorStop(0, '#fffaf0');
  gradient.addColorStop(0.62, '#f3e5ca');
  gradient.addColorStop(1, '#e8c987');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1920);
  context.strokeStyle = 'rgba(142, 95, 34, .3)';
  context.lineWidth = 2;
  context.strokeRect(52, 52, 976, 1816);
  context.fillStyle = 'rgba(156, 109, 45, .1)';
  context.beginPath();
  context.arc(878, 270, 150, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = '#9c6d2d';
  context.font = '600 34px Inter, sans-serif';
  context.letterSpacing = '2px';
  context.fillText('☾  ASTRO VELA', 100, 150);
  context.font = '700 22px Inter, sans-serif';
  context.fillText('STORY MODE', 100, 220);
  context.font = '700 34px Inter, sans-serif';
  let y = drawCanvasLines(context, card.title, 100, 560, 820, 46, 3) + 62;
  context.fillStyle = '#241d17';
  context.font = '600 78px "Cormorant Garamond", Georgia, serif';
  y = drawCanvasLines(context, card.main, 100, y, 850, 88, 4) + 44;
  context.fillStyle = '#5f564c';
  context.font = '500 34px Inter, sans-serif';
  drawCanvasLines(context, card.note, 100, y, 820, 48, 4);
  context.fillStyle = '#9c6d2d';
  context.font = '600 30px Inter, sans-serif';
  context.fillText(card.prompt, 100, 1645);
  context.fillStyle = '#2f7b68';
  context.font = '700 28px Inter, sans-serif';
  context.fillText(shareDisplayHostname(), 100, 1755);
  context.fillStyle = '#9c6d2d';
  context.font = '38px Georgia, serif';
  context.fillText('✦', 895, 300);
  return canvas;
}

function shareCardBlob(full = state.full) {
  const dataUrl = buildShareCanvas(full).toDataURL('image/png', 0.95);
  const encoded = dataUrl.split(',')[1] || '';
  if (!encoded) throw new Error('Story card could not be created.');
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: 'image/png' });
}

function shareTracking(platform) {
  return { share_id: state.shareCode, platform, variant: state.shareResultVisible ? 'reveal' : 'mystery' };
}

async function shareFromMenu(button) {
  if (button) button.disabled = true;
  track('share_cta_click', shareTracking('share_menu'));
  try {
    const link = shareReferralLink('share_menu');
    const text = shareDraftText(state.full, 'share_menu').replace(link, '').trim();
    const blob = shareCardBlob();
    const file = typeof File === 'function' ? new File([blob], 'astro-vela-story.png', { type: 'image/png' }) : null;
    const payload = { title: 'PalmQ IND Story card', text, url: link };
    const canShareFile = Boolean(file && navigator.canShare?.({ files: [file] }));
    if (canShareFile) payload.files = [file];
    else {
      downloadShareBlob(blob);
      track('share_asset_downloaded', shareTracking('share_menu_fallback'));
    }
    if (typeof navigator.share !== 'function') {
      setShareMessage('Story card saved. Copy the reading link and add both wherever you post Stories.');
      return;
    }
    track('share_sheet_opened', shareTracking('share_menu'));
    await navigator.share(payload);
    track('share_sheet_completed', shareTracking('share_menu'));
    setShareMessage(canShareFile
      ? 'Sharing options opened. You still choose where and whether to post.'
      : 'Story card saved and sharing options opened. You still choose where and whether to post.');
  } catch (error) {
    if (error?.name === 'AbortError') {
      track('share_sheet_cancelled', shareTracking('share_menu'));
      return;
    }
    track('share_failed', { ...shareTracking('share_menu'), message: String(error?.message || error).slice(0, 120) });
    setShareMessage('Sharing could not open. Save the Story card or copy the reading link instead.', true);
  } finally {
    if (button) button.disabled = false;
  }
}

function shareOnWhatsApp() {
  track('share_cta_click', shareTracking('whatsapp'));
  const draft = shareDraftText(state.full, 'whatsapp');
  const opened = window.open(`https://wa.me/?text=${encodeURIComponent(draft)}`, '_blank', 'noopener,noreferrer');
  if (opened) opened.opener = null;
  track('share_sheet_requested', shareTracking('whatsapp'));
  setShareMessage('WhatsApp will open a draft if your browser allows it. You still choose who receives it and whether to send.');
}

function downloadShareBlob(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'astro-vela-story.png';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function saveStoryCard(button) {
  if (button) button.disabled = true;
  track('share_cta_click', shareTracking('instagram_story'));
  try {
    downloadShareBlob(shareCardBlob());
    track('share_asset_downloaded', shareTracking('instagram_story'));
    setShareMessage('Story card saved. Add it to Instagram, WhatsApp Status, Snapchat or any Story you use.');
  } catch (error) {
    setShareMessage(error?.message || 'Story card could not be saved.', true);
  } finally {
    if (button) button.disabled = false;
  }
}

async function copyShareLink() {
  const link = shareReferralLink('copy_link');
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link);
    } else {
      const input = document.createElement('textarea');
      input.value = link;
      input.setAttribute('readonly', '');
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    track('share_link_copied', shareTracking('copy_link'));
    setShareMessage('Reading link copied. Add it to your Story link sticker or share it anywhere.');
  } catch (error) {
    setShareMessage('Copy did not work. Use the main share button instead.', true);
  }
}

function normalizedNextReadingRecommendation(full = state.full) {
  if (IS_GLOBAL_STOREFRONT) return null;
  const raw = full?.nextReadingRecommendation;
  if (!raw || typeof raw !== 'object') return null;
  const targetLane = String(raw.targetLane || '').trim();
  const sourceLane = String(raw.sourceLane || state.lane || '').trim();
  if (
    state.lane !== 'palm_answers'
    || sourceLane !== 'palm_answers'
    || !['partner_name', 'best_city', 'market_profile'].includes(targetLane)
    || targetLane === state.lane
  ) return null;
  const domains = Array.isArray(raw.domains)
    ? raw.domains.map((value) => String(value || '').trim().slice(0, 60)).filter(Boolean).slice(0, 6)
    : [];
  const reasonCode = String(raw.reasonCode || '').trim().slice(0, 100);
  const rawVersion = String(raw.version || '').trim().slice(0, 60);
  const rawTimingState = String(raw.timingState || '').trim().toLowerCase();
  const rawRecommendationMode = String(raw.recommendationMode || '').trim().toLowerCase();
  const rawWindow = String(raw.window || '').trim().slice(0, 120);
  const rawOffer = raw.offer && typeof raw.offer === 'object' && !Array.isArray(raw.offer)
    ? raw.offer
    : {};
  const evergreenFallback = rawRecommendationMode === 'evergreen_fallback';
  const expectedOfferVersions = evergreenFallback
    ? PALM_CROSS_SELL_EVERGREEN_OFFER_VERSIONS
    : PALM_CROSS_SELL_TIMED_OFFER_VERSIONS;
  const hasEvergreenIdentity = rawVersion === 'palm_next_reading_evergreen_v1'
    || String(rawOffer.version || '').trim() === PALM_NEXT_READING_EVERGREEN_OFFER_VERSION
    || reasonCode === 'no_supported_timing_within_horizon'
    || rawTimingState === 'not_supported';
  if (rawOffer.version && !expectedOfferVersions.has(String(rawOffer.version).trim())) return null;
  if (
    evergreenFallback
    && (
      targetLane !== 'partner_name'
      || rawVersion !== 'palm_next_reading_evergreen_v1'
      || rawTimingState !== 'not_supported'
      || reasonCode !== 'no_supported_timing_within_horizon'
      || rawWindow
      || !Array.isArray(raw.domains)
      || raw.domains.length !== 0
      || !Number.isInteger(raw.horizonMonths)
      || raw.horizonMonths < 1
      || raw.horizonMonths > 120
      || !PALM_CROSS_SELL_EVERGREEN_OFFER_VERSIONS.has(String(rawOffer.version || '').trim())
      || !String(rawOffer.product || '').trim()
      || !String(rawOffer.deliverable || '').trim()
      || !String(rawOffer.heading || '').trim()
      || !String(rawOffer.cta || '').trim()
    )
  ) return null;
  if (rawRecommendationMode && !['timed', 'evergreen_fallback'].includes(rawRecommendationMode)) return null;
  if (
    !evergreenFallback
    && (hasEvergreenIdentity || !['active', 'upcoming'].includes(rawTimingState))
  ) return null;
  const offer = Object.fromEntries([
    ['version', 100],
    ['product', 100],
    ['deliverable', 180],
    ['heading', 260],
    ['teaser', 320],
    ['body', 700],
    ['fomo', 500],
    ['cta', 120],
    ['helper', 180],
    ['method', 500],
    ['sampleLabel', 100],
    ['sample', 500],
    ['disclosure', 220]
  ].map(([key, limit]) => [key, String(rawOffer[key] || '').trim().slice(0, limit)]));
  return {
    version: rawVersion || 'v1',
    sourceLane,
    targetLane,
    reasonCode,
    recommendationMode: evergreenFallback ? 'evergreen_fallback' : 'timed',
    timingState: evergreenFallback
      ? 'not_supported'
      : rawTimingState === 'active'
        ? 'active'
        : 'upcoming',
    window: evergreenFallback ? '' : rawWindow,
    domains,
    horizonMonths: Number.isFinite(Number(raw.horizonMonths))
      ? Math.max(0, Math.min(600, Math.round(Number(raw.horizonMonths))))
      : null,
    offer,
    suggestedPriority: ['overall', 'career', 'money', 'relationships'].includes(String(raw.suggestedPriority || '').toLowerCase())
      ? String(raw.suggestedPriority).toLowerCase()
      : domains.some((domain) => /career|recognition/i.test(domain))
        ? 'career'
        : ''
  };
}

function recommendationTargetPrice(lane, rawRecommendation = {}) {
  const direct = Number(recommendationTargetPricing(lane, rawRecommendation).amount);
  if (Number.isFinite(direct) && direct > 0) return direct;
  if (lane === 'best_city') return Number(BEST_CITY_PRICING.amount || 299);
  return REPORT_PRICE_INR;
}

function recommendationTargetPricing(lane, rawRecommendation = {}) {
  const livePrice = rawRecommendation.livePrice;
  if (
    livePrice
    && typeof livePrice === 'object'
    && Number.isFinite(Number(livePrice.amount))
    && Number(livePrice.amount) > 0
  ) return livePrice;
  const runtime = RUNTIME_CONFIG.lanePricing?.[lane];
  if (
    runtime
    && typeof runtime === 'object'
    && Number.isFinite(Number(runtime.amount))
    && Number(runtime.amount) > 0
  ) return runtime;
  return { amount: lane === 'best_city' ? Number(BEST_CITY_PRICING.amount || 299) : REPORT_PRICE_INR };
}

function nextReadingRecommendationContent(recommendation) {
  if (recommendation?.offer?.product && recommendation.offer.heading && recommendation.offer.cta) {
    return recommendation.offer;
  }
  const active = recommendation.timingState === 'active';
  const evergreenFallback = recommendation.recommendationMode === 'evergreen_fallback'
    && recommendation.timingState === 'not_supported';
  if (recommendation.targetLane === 'partner_name') {
    return {
      version: evergreenFallback
        ? PALM_NEXT_READING_EVERGREEN_OFFER_VERSION
        : PALM_NEXT_READING_TIMED_OFFER_VERSION,
      product: 'Partner Initials Report',
      deliverable: 'your top 3 partner initials, matching name sounds and where you may meet',
      heading: 'Which partner initials stand out for you?',
      teaser: evergreenFallback
        ? 'Use your saved details to see which three partner initials and matching sounds stand out, plus where you may meet.'
        : 'See which three partner initials and matching sounds stand out during this relationship period, plus where you may meet.',
      body: 'Your Palm report shows when relationships receive stronger support. The Partner Initials Report uses your birth chart and name number to rank three possible initials, matching sounds and where you may meet.',
      fomo: evergreenFallback
        ? 'Already with someone? See if their initial appears in your top 3. Still looking? Know which 3 initials stand out most.'
        : 'Already with someone? Check if their initial matches your kundli. Looking for a partner? Discover the 3 initials to notice before this period passes.',
      cta: 'Preview the Partner Initials Report',
      helper: 'No payment on this tap · Your top 3 initials unlock after purchase',
      method: evergreenFallback
        ? 'Using your saved birth chart, Venus, sounds linked to your birth star and name number, this report ranks your top 3 initials and matching name sounds. It also explains where you may meet. It does not give a relationship date.'
        : 'Your Palm timeline identifies the relationship period. Using your birth chart, Venus, sounds linked to your birth star and name number, this report ranks your top 3 initials and matching name sounds.',
      sampleLabel: 'This is an example of how your report will look',
      sample: 'Rank 1: S or Sa sound. Where you may meet: at work or through someone you both know.'
    };
  }
  if (recommendation.targetLane === 'best_city') {
    return {
      version: PALM_NEXT_READING_TIMED_OFFER_VERSION,
      product: 'Best City Report',
      heading: active
        ? 'Your career and wealth period is active. Are you in the city that supports it best?'
        : 'Your career and wealth period is approaching. Which cities support it best?',
      teaser: 'See which three cities stand out for career, money and overall growth.',
      body: 'Your Palm report shows when career and wealth receive stronger support. The Best City Report uses your birth chart, current periods, numerology and location factors to rank the three cities that may support your growth most strongly.',
      fomo: 'The best city for career may not be the best for money. Compare your top three before this growth period moves ahead.',
      cta: 'Preview the Best City Report',
      helper: 'Preview before payment · One-time purchase · No subscription',
      method: 'Your Palm timeline identifies the growth period. The report compares your chart, current periods, numerology and location factors.'
    };
  }
  return {
    version: PALM_NEXT_READING_TIMED_OFFER_VERSION,
    product: 'Market Decision Profile',
    heading: active
      ? 'Your wealth period is active. Does trading or long-term investing fit you better?'
      : 'Your wealth period is approaching. Does trading or long-term investing fit you better?',
    teaser: 'See whether trading or long-term investing fits you better, plus your two planning days and future prosperity-building phase.',
    body: 'The Market Decision Profile gives you three personal outputs: your stronger fit across active trading, long-term investing or a balanced approach; two days for research and review; and the future age linked with a stronger prosperity-building phase. It also explains the discipline and emotional patterns to watch.',
    fomo: 'The approach that feels most exciting may not match the way you make decisions under pressure. Understand your pattern before committing time or money.',
    cta: 'Preview the Market Decision Profile',
    helper: 'Preview before payment · One-time purchase · No subscription',
    method: 'Your Palm timeline identifies the wealth period. Your birth chart and numerology are used to compare decision habits. It does not predict returns.',
    sampleLabel: 'This is an example of how your report will look',
    sample: 'Stronger fit: patient, rules-based investing. Planning days: Wednesday and Friday. Future phase: your next stronger prosperity-building cycle. Watch-out: changing course after short-term losses.',
    disclosure: 'Personal reflection only · No stock tips, trading signals or return promises'
  };
}

function recommendationOwnedReadings(targetLane) {
  return combinedPaidHistory().filter((item) => item.status === 'paid' && item.lane === targetLane);
}

function currentReadingHasAdditionalReportContinuation() {
  return Boolean(
    state.paid
    && state.readingId
    && hasAdditionalReportContinuationFor(state.readingId)
  );
}

function currentReadingHasAdditionalReportAttribution(recommendation = normalizedNextReadingRecommendation()) {
  return Boolean(
    state.paid
    && state.readingId
    && recommendation
    && hasAdditionalReportAttributionFor(state.readingId, recommendation.targetLane)
  );
}

function hasAdditionalReportContinuationFor(readingId, minimumRemainingMs = 0) {
  const claims = additionalReportContinuationClaims(state.additionalReportContinuationToken);
  return Boolean(
    readingId
    && state.additionalReportContinuationReadingId === readingId
    && claims?.readingId === readingId
    && claims.expiresAt > Date.now() + minimumRemainingMs
  );
}

function hasAdditionalReportDirectoryContinuationFor(readingId, minimumRemainingMs = 0) {
  const claims = additionalReportDirectoryContinuationClaims(
    state.additionalReportDirectoryContinuationToken
  );
  return Boolean(
    readingId
    && state.additionalReportDirectoryContinuationReadingId === readingId
    && claims?.readingId === readingId
    && claims.expiresAt > Date.now() + minimumRemainingMs
  );
}

function hasAdditionalReportAttributionFor(readingId, targetLane, minimumRemainingMs = 0) {
  const claims = additionalReportAttributionClaims(state.additionalReportAttributionToken);
  return Boolean(
    readingId
    && claims?.readingId === readingId
    && claims.sourceLane === 'palm_answers'
    && claims.targetLane === targetLane
    && claims.expiresAt > Date.now() + minimumRemainingMs
  );
}

async function refreshAdditionalReportCapabilities(
  readingId,
  targetLane,
  {
    expectedRecommendation = null,
    minimumRemainingMs = 0,
    navigationAttempt = 0
  } = {}
) {
  if (IS_GLOBAL_STOREFRONT) return false;
  const normalizedReadingId = String(readingId || '').trim().slice(0, 120);
  if (
    !/^[a-zA-Z0-9_-]+$/.test(normalizedReadingId)
    || !['partner_name', 'best_city', 'market_profile'].includes(targetLane)
  ) return false;
  if (
    hasAdditionalReportContinuationFor(normalizedReadingId, minimumRemainingMs)
    || hasAdditionalReportAttributionFor(normalizedReadingId, targetLane, minimumRemainingMs)
  ) return true;
  try {
    const full = await getJson(`/api/reading/${encodeURIComponent(normalizedReadingId)}/full`);
    if (navigationAttempt && navigationAttempt !== additionalReportNavigationAttempt) return false;
    const rawRecommendation = full?.nextReadingRecommendation;
    const refreshedSourceLane = String(rawRecommendation?.sourceLane || '').trim();
    const refreshedTargetLane = String(rawRecommendation?.targetLane || '').trim();
    const refreshedVersion = String(rawRecommendation?.version || '').trim();
    const refreshedReasonCode = String(rawRecommendation?.reasonCode || '').trim();
    if (
      refreshedSourceLane !== 'palm_answers'
      || refreshedTargetLane !== targetLane
      || (
        expectedRecommendation
        && (
          refreshedVersion !== expectedRecommendation.version
          || refreshedReasonCode !== expectedRecommendation.reasonCode
        )
      )
    ) return false;

    const continuationToken = String(full?.additionalReportContinuationToken || '').trim().slice(0, 1600);
    const continuationClaims = additionalReportContinuationClaims(continuationToken);
    const hasContinuation = Boolean(
      continuationClaims?.readingId === normalizedReadingId
      && continuationClaims.expiresAt > Date.now() + minimumRemainingMs
    );
    const attributionToken = String(full?.additionalReportAttributionToken || '').trim().slice(0, 1800);
    const attributionClaims = additionalReportAttributionClaims(attributionToken);
    const hasAttribution = Boolean(
      attributionClaims?.readingId === normalizedReadingId
      && attributionClaims.sourceLane === 'palm_answers'
      && attributionClaims.targetLane === targetLane
      && attributionClaims.expiresAt > Date.now() + minimumRemainingMs
    );
    state.additionalReportContinuationToken = hasContinuation ? continuationToken : '';
    // A child request must present exactly one server capability. Prefer the
    // original-browser continuation because it can securely prefill details.
    state.additionalReportAttributionToken = !hasContinuation && hasAttribution
      ? attributionToken
      : '';
    state.additionalReportContinuationReadingId = hasContinuation || hasAttribution
      ? normalizedReadingId
      : '';
    state.additionalReportContinuationExpiresAt = hasContinuation
      ? continuationClaims.expiresAt
      : hasAttribution
        ? attributionClaims.expiresAt
        : 0;
    persist();
    return hasContinuation || hasAttribution;
  } catch (_) {
    return false;
  }
}

async function ensureNextReadingRecommendationCapability(recommendation, navigationAttempt) {
  if (!state.paid || !state.readingId || !recommendation) return false;
  return refreshAdditionalReportCapabilities(
    state.readingId,
    recommendation.targetLane,
    {
      expectedRecommendation: recommendation,
      minimumRemainingMs: 15 * 60 * 1000,
      navigationAttempt
    }
  );
}

async function ensurePendingAdditionalReportAuthorization() {
  if (IS_GLOBAL_STOREFRONT) return true;
  if (state.readingId || !state.parentReadingId) return true;
  if (hasAdditionalReportDirectoryContinuationFor(state.parentReadingId)) return true;
  if (
    state.additionalReportDirectoryContinuationReadingId === state.parentReadingId
    || state.additionalReportDirectoryContinuationToken
  ) {
    return ensureAdditionalReportDirectoryContinuation(state.parentReadingId);
  }
  if (hasAdditionalReportContinuationFor(state.parentReadingId)) return true;
  if (
    ['partner_name', 'best_city', 'market_profile'].includes(state.lane)
    && hasAdditionalReportAttributionFor(state.parentReadingId, state.lane)
  ) return true;
  // Standard continuations are reserved for their existing personalized or
  // same-product paths. Generic directory navigation carries its own signed
  // capability and must never widen a Palm recommendation token.
  if (await ensureAdditionalReportContinuation(state.parentReadingId)) return true;
  // Only Palm's recommendation card has the PII-free cross-browser fallback.
  if (!['partner_name', 'best_city', 'market_profile'].includes(state.lane)) return false;
  return refreshAdditionalReportCapabilities(
    state.parentReadingId,
    state.lane
  );
}

function nextReadingRecommendationTracking(recommendation, placement = 'paid_report_before_delivery') {
  const copy = nextReadingRecommendationContent(recommendation);
  const rawRecommendation = state.full?.nextReadingRecommendation || {};
  const pricing = recommendationTargetPricing(recommendation.targetLane, rawRecommendation);
  const owned = recommendationOwnedReadings(recommendation.targetLane);
  const crossSellIdentity = sanitizeCrossSellIdentity({
    sourceReadingId: state.readingId,
    sourceLane: recommendation.sourceLane,
    targetLane: recommendation.targetLane,
    recommendationVersion: recommendation.version,
    recommendationMode: recommendation.recommendationMode,
    offerCopyVersion: copy.version || PALM_NEXT_READING_TIMED_OFFER_VERSION,
    presentationVersion: PALM_NEXT_READING_PRESENTATION_VERSION
  }, recommendation.targetLane);
  return {
    recommendation_version: recommendation.version,
    offer_copy_version: copy.version || PALM_NEXT_READING_TIMED_OFFER_VERSION,
    recommendation_presentation_version: PALM_NEXT_READING_PRESENTATION_VERSION,
    source_lane: recommendation.sourceLane,
    target_lane: recommendation.targetLane,
    reason_code: recommendation.reasonCode,
    recommendation_mode: recommendation.recommendationMode,
    timing_state: recommendation.timingState,
    trigger_domains: recommendation.domains.join(','),
    horizon_months: recommendation.horizonMonths == null ? '' : recommendation.horizonMonths,
    continuation_available: currentReadingHasAdditionalReportContinuation() ? 'yes' : 'no',
    attribution_available: currentReadingHasAdditionalReportAttribution(recommendation) ? 'yes' : 'no',
    placement,
    already_owned: previousPaidHistoryVerified ? (owned.length ? 'yes' : 'no') : 'unknown',
    offer_mode: previousPaidHistoryVerified
      ? (owned.length ? 'owned_recovery' : 'cross_sell')
      : 'ownership_unverified',
    taxable_value: recommendationTargetPrice(recommendation.targetLane, rawRecommendation),
    currency: String(pricing.currency || 'INR').toUpperCase(),
    gst_display: pricing.tax?.mode === 'exclusive' ? 'plus_gst' : 'included_or_not_applicable',
    ...crossSellIdentityAnalytics(crossSellIdentity)
  };
}

function nextReadingRecommendationCtaContent(recommendation, full = state.full) {
  const copy = nextReadingRecommendationContent(recommendation);
  const targetPricing = recommendationTargetPricing(recommendation.targetLane, full?.nextReadingRecommendation || {});
  const price = recommendationTargetPrice(recommendation.targetLane, full?.nextReadingRecommendation || {});
  return `<span class="next-reading-cta__label">${escapeHtml(copy.cta)}</span><span class="next-reading-cta__separator" aria-hidden="true">—</span>${prePayPricePairMarkup(price, targetPricing, { allowCheckoutQuote: false })}`;
}

function nextReadingRecommendationTeaserCtaContent(recommendation, full = state.full) {
  const copy = nextReadingRecommendationContent(recommendation);
  const targetPricing = recommendationTargetPricing(recommendation.targetLane, full?.nextReadingRecommendation || {});
  const price = recommendationTargetPrice(recommendation.targetLane, full?.nextReadingRecommendation || {});
  const prefix = PALM_CROSS_SELL_TEASER_TREATMENT_OFFER_VERSIONS.has(copy.version)
    ? 'Preview before payment'
    : 'Start free';
  const label = /^preview\b/i.test(String(copy.cta || '')) ? copy.cta : `${prefix} · ${copy.cta}`;
  return `<span class="next-reading-cta__label">${escapeHtml(label)}</span><span class="next-reading-cta__price">Full report ${prePayPricePairMarkup(price, targetPricing, { allowCheckoutQuote: false })}</span>`;
}

function nextReadingRecommendationActionMarkup(recommendation, full, placement, className) {
  const copy = nextReadingRecommendationContent(recommendation);
  const canSecurelyContinue = currentReadingHasAdditionalReportContinuation();
  const teaser = placement === 'paid_report_summary_teaser';
  const content = teaser
    ? nextReadingRecommendationTeaserCtaContent(recommendation, full)
    : nextReadingRecommendationCtaContent(recommendation, full);
  const helper = teaser
    ? recommendation.targetLane === 'partner_name'
      ? 'No payment on this tap · Your top 3 initials unlock after purchase'
      : `${canSecurelyContinue ? 'Your Palm details are ready for confirmation · ' : 'Start free · '}No payment on this tap`
    : `${canSecurelyContinue ? 'Your details will be carried forward for confirmation · ' : ''}${copy.helper || 'Preview before payment · One-time purchase · No subscription'}`;
  return `<button class="${className}" type="button" data-action="open-next-reading-recommendation" data-next-reading-cta data-target-lane="${escapeHtml(recommendation.targetLane)}" data-recommendation-placement="${escapeHtml(placement)}">${content}</button>
    <small class="next-reading-card__helper">${escapeHtml(helper)}</small>`;
}

function nextReadingTeaserLockedOutputs(recommendation) {
  if (recommendation.targetLane === 'partner_name') return ['Initial #1', 'Initial #2', 'Initial #3'];
  if (recommendation.targetLane === 'best_city') return ['City #1', 'City #2', 'City #3'];
  return ['Approach fit', '2 planning days', 'Future phase'];
}

function nextReadingRecommendationTeaserMarkup(full = state.full) {
  const placement = 'paid_report_summary_teaser';
  const recommendation = normalizedNextReadingRecommendation(full);
  if (!recommendation) return '';
  if (!previousPaidHistorySettled) {
    return `<section class="next-reading-teaser next-reading-teaser--loading" data-next-reading-host data-next-reading-placement="${placement}" aria-busy="true" aria-label="Checking your previous readings">
      <span aria-hidden="true">✦</span><div><b></b><small></small></div>
    </section>`;
  }
  if (!previousPaidHistoryVerified) return '';
  const copy = nextReadingRecommendationContent(recommendation);
  const evergreenFallback = recommendation.recommendationMode === 'evergreen_fallback';
  const owned = recommendationOwnedReadings(recommendation.targetLane);
  const timing = recommendation.window
    ? `<span class="next-reading-teaser__period">${recommendation.timingState === 'active' ? 'Active' : 'Upcoming'} · ${escapeHtml(recommendation.window)}</span>`
    : '';
  if (owned.length) {
    const singular = owned.length === 1;
    return `<section id="next-reading-recommendation" class="next-reading-teaser next-reading-teaser--owned" data-next-reading-host data-next-reading-surface data-next-reading-placement="${placement}" data-testid="next-reading-recommendation-teaser" data-target-lane="${escapeHtml(recommendation.targetLane)}">
      <div class="next-reading-teaser__copy"><small>Already unlocked</small><h2>Your ${escapeHtml(copy.product)} is saved.</h2><p>Open your previous paid answer instead of purchasing it again.</p>${timing}</div>
      ${singular
        ? `<button class="next-reading-teaser__cta" type="button" data-action="open-owned-reading" data-reading-id="${escapeHtml(owned[0].readingId)}" data-lane="${escapeHtml(owned[0].lane)}">Read it again</button>`
        : `<button class="next-reading-teaser__cta" type="button" data-action="show-owned-readings">View my saved reports</button><div class="next-reading-card__owned-list" hidden>${owned.map(previousReadingRowMarkup).join('')}</div>`}
    </section>`;
  }
  const lockedOutputs = nextReadingTeaserLockedOutputs(recommendation);
  return `<section id="next-reading-recommendation" class="next-reading-teaser" data-next-reading-host data-next-reading-surface data-next-reading-placement="${placement}" data-testid="next-reading-recommendation-teaser" data-target-lane="${escapeHtml(recommendation.targetLane)}">
    <div class="next-reading-teaser__copy"><div class="next-reading-teaser__meta"><small>${evergreenFallback ? 'A separate report using your details' : 'Chosen from your Palm report'}</small>${timing}</div><h2>${escapeHtml(copy.heading)}</h2></div>
    <div class="next-reading-teaser__action">${nextReadingRecommendationActionMarkup(recommendation, full, placement, 'next-reading-teaser__cta next-reading-teaser__cta--commercial')}<div class="next-reading-card__error" data-next-reading-error role="alert"></div></div>
    <div class="next-reading-teaser__outputs" aria-label="Three locked outputs in this recommended report">${lockedOutputs.map((label) => `<span><b>${escapeHtml(label)}</b><i aria-hidden="true">🔒</i></span>`).join('')}</div>
  </section>`;
}

function nextReadingRecommendationMarkup(full = state.full) {
  const placement = 'paid_report_before_delivery';
  const recommendation = normalizedNextReadingRecommendation(full);
  if (!recommendation) return '';
  if (!previousPaidHistorySettled) {
    return `<section class="next-reading-card next-reading-card--loading" data-next-reading-host data-next-reading-placement="${placement}" aria-busy="true" aria-label="Checking your previous readings">
      <div class="next-reading-card__loading-mark" aria-hidden="true">✦</div>
      <div><span></span><b></b><small></small></div>
    </section>`;
  }
  if (!previousPaidHistoryVerified) return '';
  const copy = nextReadingRecommendationContent(recommendation);
  const evergreenFallback = recommendation.recommendationMode === 'evergreen_fallback';
  const owned = recommendationOwnedReadings(recommendation.targetLane);
  const timingChip = recommendation.window
    ? `<span class="next-reading-card__period"><small>${recommendation.timingState === 'active' ? 'Active period' : 'Upcoming period'}</small><b>${escapeHtml(recommendation.window)}</b></span>`
    : '';
  if (owned.length) {
    const singular = owned.length === 1;
    const ownedHeading = singular
      ? `You already have this answer in your ${copy.product}.`
      : `You already have ${owned.length} ${copy.product.replace(/ Report$/, '')} readings.`;
    return `<section class="next-reading-card next-reading-card--owned" data-next-reading-host data-next-reading-surface data-next-reading-placement="${placement}" data-testid="next-reading-recommendation" data-target-lane="${escapeHtml(recommendation.targetLane)}">
      <div class="next-reading-card__ornament" aria-hidden="true">✦</div>
      <div class="next-reading-card__top"><span>Already unlocked</span>${timingChip}</div>
      <h2>${escapeHtml(ownedHeading)}</h2>
      <p>Your previous paid reading is saved. Open it again instead of purchasing the same answer by mistake.</p>
      ${singular
        ? `<button class="next-reading-card__cta" type="button" data-action="open-owned-reading" data-reading-id="${escapeHtml(owned[0].readingId)}" data-lane="${escapeHtml(owned[0].lane)}">Read my ${escapeHtml(copy.product)} again</button>`
        : `<button class="next-reading-card__cta" type="button" data-action="show-owned-readings">View my ${escapeHtml(copy.product.replace(/ Report$/, ''))} readings</button>
          <div class="next-reading-card__owned-list" hidden>${owned.map(previousReadingRowMarkup).join('')}</div>`}
    </section>`;
  }
  const action = nextReadingRecommendationActionMarkup(recommendation, full, placement, 'next-reading-card__cta');
  return `<section class="next-reading-card" data-next-reading-host data-next-reading-surface data-next-reading-placement="${placement}" data-testid="next-reading-recommendation" data-target-lane="${escapeHtml(recommendation.targetLane)}">
    <div class="next-reading-card__ornament" aria-hidden="true">✦</div>
    <div class="next-reading-card__top"><span>${evergreenFallback ? 'A separate report using your details' : 'Chosen from your Palm report'}</span>${timingChip}</div>
    <h2>${escapeHtml(copy.heading)}</h2>
    <p>${escapeHtml(copy.body)}</p>
    <strong class="next-reading-card__curiosity">${escapeHtml(copy.fomo)}</strong>
    ${copy.sample ? `<div class="next-reading-card__sample"><small>${escapeHtml(copy.sampleLabel || 'This is an example of how your report will look')}</small><p>${escapeHtml(copy.sample)}</p></div>` : ''}
    <details class="next-reading-card__method"><summary>How we work this out</summary><p>${escapeHtml(copy.method)}</p></details>
    ${action}
    ${copy.disclosure ? `<em>${escapeHtml(copy.disclosure)}</em>` : ''}
    <div class="next-reading-card__error" data-next-reading-error role="alert"></div>
  </section>`;
}

let nextReadingRecommendationObserver = null;
let nextReadingRecommendationCtaObserver = null;
const eligibleNextReadingRecommendations = new Set();
const servedNextReadingRecommendations = new Set();
const viewedNextReadingRecommendations = new Set();
const viewedNextReadingRecommendationCtas = new Set();
const openedAnchoredNextReadingRecommendations = new Set();

function setupNextReadingRecommendationExposure() {
  nextReadingRecommendationObserver?.disconnect?.();
  nextReadingRecommendationObserver = null;
  nextReadingRecommendationCtaObserver?.disconnect?.();
  nextReadingRecommendationCtaObserver = null;
  const recommendation = normalizedNextReadingRecommendation();
  if (!recommendation) return;
  const copy = nextReadingRecommendationContent(recommendation);
  const baseKey = `${state.readingId || 'paid'}:${recommendation.version}:${copy.version || PALM_NEXT_READING_TIMED_OFFER_VERSION}:${recommendation.targetLane}`;
  const owned = recommendationOwnedReadings(recommendation.targetLane);
  const commerciallyEligible = previousPaidHistoryVerified && owned.length === 0;
  if (commerciallyEligible && !eligibleNextReadingRecommendations.has(baseKey)) {
    eligibleNextReadingRecommendations.add(baseKey);
    track('recommendation_eligible', nextReadingRecommendationTracking(recommendation, 'paid_report'));
  }
  const surfaces = [...stage.querySelectorAll('[data-next-reading-surface][data-next-reading-placement]')];
  if (!surfaces.length) return;
  const teaserSurface = surfaces.find((surface) =>
    surface.dataset.nextReadingPlacement === 'paid_report_summary_teaser'
  );
  if (
    commerciallyEligible
    && teaserSurface
    && !servedNextReadingRecommendations.has(baseKey)
  ) {
    servedNextReadingRecommendations.add(baseKey);
    track(
      'recommendation_served',
      nextReadingRecommendationTracking(recommendation, 'paid_report_summary_teaser')
    );
  }
  if (
    location.hash === '#next-reading-recommendation'
    && !openedAnchoredNextReadingRecommendations.has(baseKey)
  ) {
    const teaser = document.getElementById('next-reading-recommendation');
    if (teaser) {
      openedAnchoredNextReadingRecommendations.add(baseKey);
      requestAnimationFrame(() => teaser.scrollIntoView({ behavior: 'smooth', block: 'center' }));
    }
  }
  const recordView = (surface) => {
    const placement = String(surface?.dataset.nextReadingPlacement || 'paid_report_before_delivery');
    const impressionKey = `${baseKey}:${placement}`;
    if (viewedNextReadingRecommendations.has(impressionKey)) return;
    viewedNextReadingRecommendations.add(impressionKey);
    track('next_reading_recommendation_view', {
      ...nextReadingRecommendationTracking(recommendation, placement)
    });
  };
  const recordCtaView = (button) => {
    const surface = button?.closest?.('[data-next-reading-surface][data-next-reading-placement]');
    if (!surface) return;
    const placement = String(surface.dataset.nextReadingPlacement || 'paid_report_before_delivery');
    const impressionKey = `${baseKey}:${placement}`;
    if (viewedNextReadingRecommendationCtas.has(impressionKey)) return;
    viewedNextReadingRecommendationCtas.add(impressionKey);
    track('next_reading_recommendation_cta_view', {
      ...nextReadingRecommendationTracking(recommendation, placement),
      viewed_element: 'cta',
      visibility_threshold: 0.5
    });
  };
  if (typeof IntersectionObserver !== 'function') {
    surfaces.forEach(recordView);
    return;
  }
  nextReadingRecommendationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      recordView(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: [0.5] });
  surfaces.forEach((surface) => nextReadingRecommendationObserver.observe(surface));
  const ctaButtons = surfaces
    .map((surface) => surface.querySelector?.('[data-next-reading-cta]'))
    .filter(Boolean);
  if (!ctaButtons.length) return;
  nextReadingRecommendationCtaObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) return;
      recordCtaView(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: [0.5] });
  ctaButtons.forEach((button) => nextReadingRecommendationCtaObserver.observe(button));
}

function refreshNextReadingRecommendationCard() {
  const currentSurfaces = [...stage.querySelectorAll('[data-next-reading-host][data-next-reading-placement]')];
  if (!currentSurfaces.length || !state.full) return;
  currentSurfaces.forEach((current) => {
    const placement = String(current.dataset.nextReadingPlacement || 'paid_report_before_delivery');
    const markup = placement === 'paid_report_summary_teaser'
      ? nextReadingRecommendationTeaserMarkup()
      : nextReadingRecommendationMarkup();
    if (!markup) current.remove();
    else current.outerHTML = markup;
  });
  setupNextReadingRecommendationExposure();
}

function showNextReadingRecommendationError(message, button = null) {
  const host = button?.closest?.('[data-next-reading-host]')?.querySelector?.('[data-next-reading-error]')
    || stage.querySelector('[data-next-reading-error]');
  if (host) host.textContent = message;
}

function storeAdditionalReportPrefill(response, recommendation) {
  const targetLane = String(response?.targetLane || '').trim();
  const sourceLane = String(response?.sourceLane || '').trim();
  const crossSellIdentity = sanitizeCrossSellIdentity(
    nextReadingRecommendationTracking(recommendation),
    targetLane
  );
  if (
    targetLane !== recommendation.targetLane
    || sourceLane !== recommendation.sourceLane
    || !['partner_name', 'best_city', 'market_profile'].includes(targetLane)
    || !response?.prefill
    || !crossSellIdentity
  ) return false;
  const handoff = {
    version: String(response.version || recommendation.version || 'v1').slice(0, 60),
    sourceLane,
    targetLane,
    reasonCode: recommendation.reasonCode,
    suggestedPriority: recommendation.suggestedPriority,
    reusablePalmAvailable: Boolean(response.reusablePalmAvailable),
    crossSellIdentity,
    prefill: sanitizeAdditionalReportPrefill(response.prefill),
    createdAt: Date.now(),
    expiresAt: Date.now() + ADDITIONAL_REPORT_PREFILL_TTL_MS
  };
  try {
    sessionStorage.setItem(ADDITIONAL_REPORT_PREFILL_KEY, JSON.stringify(handoff));
    return true;
  } catch (_) {
    return false;
  }
}

function continueNextReadingWithoutPrefill(recommendation, placement = 'paid_report_before_delivery') {
  const attributed = rememberAdditionalReportAttributionLineage(
    recommendation,
    'view_other_reports'
  );
  if (!attributed) return false;
  track('next_reading_refill_started', {
    ...nextReadingRecommendationTracking(recommendation, placement),
    verified_attribution: 'yes'
  });
  rememberPaidReading();
  clearActiveReading();
  finishPalmPaywallVisit('next_reading_recommendation');
  location.assign(nextReadingDestination(recommendation.targetLane));
  return true;
}

async function openNextReadingRecommendation(button) {
  if (
    additionalReportNavigationPending
    || !previousPaidHistoryVerified
    || !state.paid
    || !state.readingId
  ) return;
  const recommendation = normalizedNextReadingRecommendation();
  if (!recommendation || button?.dataset.targetLane !== recommendation.targetLane) return;
  const placement = String(button?.dataset.recommendationPlacement || 'paid_report_before_delivery');
  const owned = recommendationOwnedReadings(recommendation.targetLane);
  if (owned.length) {
    openPreviousPaidReport(owned[0].readingId, owned[0].lane);
    return;
  }
  const navigationAttempt = ++additionalReportNavigationAttempt;
  setAdditionalReportNavigationPending(true);
  if (button) {
    button.disabled = true;
    button.textContent = 'Preparing your details…';
  }
  showNextReadingRecommendationError('', button);
  track('next_reading_recommendation_click', nextReadingRecommendationTracking(recommendation, placement));
  try {
    const authorized = await ensureNextReadingRecommendationCapability(
      recommendation,
      navigationAttempt
    );
    if (!authorized || navigationAttempt !== additionalReportNavigationAttempt) {
      throw new Error('We could not securely prepare this reading. Check your connection and tap again.');
    }
    if (!currentReadingHasAdditionalReportContinuation()) {
      if (continueNextReadingWithoutPrefill(recommendation, placement)) return;
      throw new Error('We could not securely prepare this reading. Check your connection and tap again.');
    }
    const ready = await prepareAdditionalReportLineage('view_other_reports', navigationAttempt);
    if (!ready || navigationAttempt !== additionalReportNavigationAttempt) {
      throw new Error('We could not securely prepare this reading. Please tap again.');
    }
    const response = await api(
      `/api/reading/${encodeURIComponent(state.readingId)}/additional-report-prefill`,
      {
        targetLane: recommendation.targetLane,
        additionalReportContinuationToken: state.additionalReportContinuationToken
      }
    );
    if (
      navigationAttempt !== additionalReportNavigationAttempt
      || !storeAdditionalReportPrefill(response, recommendation)
    ) {
      throw new Error('Your details could not be prepared securely. Please try again.');
    }
    track('next_reading_prefill_success', nextReadingRecommendationTracking(recommendation, placement));
    rememberPaidReading();
    clearActiveReading();
    finishPalmPaywallVisit('next_reading_recommendation');
    location.assign(nextReadingDestination(recommendation.targetLane));
  } catch (error) {
    if (navigationAttempt !== additionalReportNavigationAttempt) return;
    if (
      error?.code !== 'ADDITIONAL_REPORT_ALREADY_OWNED'
      && currentReadingHasAdditionalReportAttribution(recommendation)
      && continueNextReadingWithoutPrefill(recommendation, placement)
    ) {
      return;
    }
    setAdditionalReportNavigationPending(false);
    if (button) {
      button.disabled = false;
      button.innerHTML = placement === 'paid_report_summary_teaser'
        ? nextReadingRecommendationTeaserCtaContent(recommendation)
        : nextReadingRecommendationCtaContent(recommendation);
    }
    showNextReadingRecommendationError(error?.message || 'We could not carry your details into this reading. Please try again.', button);
    track('next_reading_prefill_failed', {
      ...nextReadingRecommendationTracking(recommendation, placement),
      error_code: String(error?.code || 'request_failed').slice(0, 80)
    });
  }
}

function postPurchaseEmail() {
  if (IS_GLOBAL_STOREFRONT) return '';
  if (state.emailSaved) return '<div class="success-note">✓ Email saved. We will send the report or an update if it is still being prepared.</div>';
  return `<div class="email-after"><h2>Send this report to your email</h2><p>Add your email if you want a copy in your inbox.</p><div class="email-row"><input class="input" id="postPurchaseEmail" data-testid="post-purchase-email" type="email" inputmode="email" autocomplete="email" placeholder="you@email.com" /><button type="button" data-action="save-email">Email my report</button></div><div id="emailMessage"></div></div>`;
}

function newReadingActionsMarkup() {
  const product = laneConfig()?.product || 'PalmQ IND report';
  if (IS_GLOBAL_STOREFRONT) {
    return `<section class="new-reading-panel" data-testid="new-reading-panel">
      <small>Another Palm reading</small>
      <h2>Start a new Palm profile</h2>
      <p>Start with blank answers. You can reopen this report on this device. A new complete report is a separate purchase.</p>
      <button class="secondary-button" type="button" data-action="start-fresh">Start another Palm profile</button>
    </section>`;
  }
  return `<section class="new-reading-panel" data-testid="new-reading-panel">
    <small>Another reading</small>
    <h2>Start a new report</h2>
    <p>Start a new ${escapeHtml(product)} with blank answers. You can reopen this report on this device. A new full report is a separate purchase.</p>
    <button class="secondary-button" type="button" data-action="start-fresh">Start another report</button>
    <button class="text-button" type="button" data-action="go-home">View other report types</button>
  </section>`;
}

function paidMoreOptionsMarkup(full = state.full, { includeShare = true } = {}) {
  return `<details class="paid-more-options" data-testid="paid-more-options">
    <summary>More options</summary>
    ${includeShare ? socialShareBuilder(full) : ''}
    ${newReadingActionsMarkup()}
  </details>`;
}

function safePaidDownloadUrl(value) {
  const url = String(value || '').trim();
  return /^(?:\/(?!\/)|https:\/\/)/i.test(url) ? url : '';
}

function paidDownloadLinksMarkup(
  full,
  pdfUrl,
  { completePdfLabel = false, includeInvoice = true } = {}
) {
  const safePdfUrl = safePaidDownloadUrl(pdfUrl);
  const invoice = includeInvoice && full?.invoice && typeof full.invoice === 'object'
    ? full.invoice
    : {};
  const invoiceUrl = invoice.status === 'issued'
    ? safePaidDownloadUrl(invoice.downloadUrl)
    : '';
  if (!safePdfUrl && !invoiceUrl) return '';
  const invoiceNumber = String(invoice.number || '').trim().slice(0, 80);
  return `<div class="paid-downloads" data-testid="paid-downloads">
    ${safePdfUrl ? `<a class="pdf-link" href="${escapeHtml(safePdfUrl)}" target="_blank" rel="noopener">${completePdfLabel ? 'Read my complete PDF report' : 'Read my PDF report'}</a>` : ''}
    ${safePdfUrl ? `<a class="pdf-link pdf-link--download" href="${escapeHtml(safePdfUrl)}" download="astro-vela-report.pdf" rel="noopener" data-testid="download-pdf">Download my report as PDF</a>` : ''}
    ${invoiceUrl ? `<a class="invoice-link" data-testid="download-gst-invoice" href="${escapeHtml(invoiceUrl)}" target="_blank" rel="noopener"><span>Download GST tax invoice</span>${invoiceNumber ? `<small>${escapeHtml(invoiceNumber)}</small>` : ''}</a>` : ''}
  </div>`;
}

function complimentaryDeliveryMarkup(full, pdfUrl, { completePdfLabel = false } = {}) {
  return `<section class="email-after complimentary-delivery" data-testid="charity-grant-delivery">
    <small>Complimentary access</small>
    <h2>Your private report is ready to keep.</h2>
    <p>This complete Mahakundli was shared with you at no charge. Read it here or save the PDF for yourself. No payment was taken for this access, and no invoice is created.</p>
    ${paidDownloadLinksMarkup(full, pdfUrl, { completePdfLabel, includeInvoice: false })}
  </section>`;
}

function paidDeliveryMarkup(
  full,
  pdfUrl,
  {
    recommendation = '',
    completePdfLabel = false,
    includeShare = true,
    includeInvoice = true
  } = {}
) {
  if (isCharityGrantAccess()) {
    return complimentaryDeliveryMarkup(full, pdfUrl, { completePdfLabel });
  }
  return `${recommendation}
    ${paidDownloadLinksMarkup(full, pdfUrl, { completePdfLabel, includeInvoice })}
    ${postPurchaseEmail()}
    ${paidMoreOptionsMarkup(full, { includeShare })}`;
}

// FACE_PAID_V2_RENDERER_START
function faceV2ObservationChips(observationKeys = [], featureInsights = []) {
  const insightByKey = new Map(
    (Array.isArray(featureInsights) ? featureInsights : []).map((item) => [item?.key, item])
  );
  return [...new Set(Array.isArray(observationKeys) ? observationKeys : [])]
    .map((key) => insightByKey.get(key))
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item.label || item.key)} · ${escapeHtml(item.value || 'Visible cue')}</span>`)
    .join('');
}

function faceV2AnswerCardMarkup(item = {}, featureInsights = [], index = 0) {
  const evidenceChips = faceV2ObservationChips(item.observationKeys, featureInsights);
  return `<article class="face-v2-answer" data-testid="face-v2-answer-card" data-answer-key="${escapeHtml(item.key || '')}">
    <header><span>${String(index + 1).padStart(2, '0')}</span><div><small>Your answer</small><h3>${escapeHtml(item.title || 'How this may show up')}</h3></div></header>
    <div class="face-v2-answer__rows">
      <section class="face-v2-answer__row face-v2-answer__row--signal"><small>Likely first-glance signal</small><p>${escapeHtml(item.possibleEffect || '')}</p></section>
      <section class="face-v2-answer__row face-v2-answer__row--impact"><small>Real-life impact</small><p>${escapeHtml(item.upside || '')}</p></section>
      <section class="face-v2-answer__row face-v2-answer__row--misread"><small>Possible misunderstanding</small><p>${escapeHtml(item.possibleMisreading || '')}</p></section>
      <section class="face-v2-answer__row face-v2-answer__row--action"><small>What you can try</small><p>${escapeHtml(item.reversibleAction || '')}</p></section>
    </div>
    <details class="face-v2-answer__proof">
      <summary>Why this appears in your reading <i aria-hidden="true">+</i></summary>
      <div><small>Visible evidence in this photo</small><p>${escapeHtml(item.cue || '')}</p>${evidenceChips ? `<div class="face-v2-chips">${evidenceChips}</div>` : ''}</div>
    </details>
  </article>`;
}

function faceV2TraditionLensMarkup(lens = {}, kind = 'cultural') {
  const items = (Array.isArray(lens.items) ? lens.items : [])
    .filter((item) => item?.key !== 'eye_color');
  if (!lens.title && !items.length) return '';
  return `<article class="face-v2-lens face-v2-lens--${escapeHtml(kind)}" data-testid="face-v2-${escapeHtml(kind)}-lens">
    <header><small>${kind === 'samudrika' ? 'Indian cultural reflection' : 'Chinese cultural reflection'}</small><h3>${escapeHtml(lens.title || 'Traditional symbolic lens')}</h3><p>${escapeHtml(lens.framing || '')}</p></header>
    <div class="face-v2-lens__items">${items.map((item, index) => `<details ${index === 0 ? 'open' : ''}>
      <summary><span><small>${escapeHtml(item.label || '')}</small><b>${escapeHtml(item.whatIsVisible || '')}</b></span><i aria-hidden="true">+</i></summary>
      <div><p><b>Traditional reflection</b>${escapeHtml(item.symbolicReading || '')}</p>${item.reflectionPrompt ? `<p><b>Compare it with your real life</b>${escapeHtml(item.reflectionPrompt)}</p>` : ''}</div>
    </details>`).join('')}</div>
  </article>`;
}

function faceV2FeatureEvidenceMarkup(featureInsights = []) {
  return `<div class="face-v2-feature-stack" data-testid="face-v2-feature-evidence">
    ${(Array.isArray(featureInsights) ? featureInsights : []).map((item, index) => {
      const eyeColourVisibleOnly = item?.key === 'eye_color';
      const visibleValue = String(item?.value || '').replaceAll('_', ' ');
      return `<details class="face-v2-feature ${eyeColourVisibleOnly ? 'face-v2-feature--visible-only' : ''}" data-feature-key="${escapeHtml(item?.key || '')}">
        <summary><span><small>${escapeHtml(item?.label || 'Visible feature')}</small><b>${escapeHtml(visibleValue)}</b></span><i aria-hidden="true">+</i></summary>
        <div>
          <p class="face-v2-feature__visible"><b>Visible measurement</b>${escapeHtml(item?.whatIsVisible || '')}</p>
          ${item?.measurementTechnique ? `<p><b>${escapeHtml(item.measurementTechnique)}</b>${escapeHtml(eyeColourVisibleOnly ? 'Compared only when the photographed colour is clear enough.' : item.howMeasured || '')}</p>` : ''}
          ${eyeColourVisibleOnly
            ? '<p class="face-v2-feature__limit"><b>Visible detail only</b>This row never changes the theme ranking.</p>'
            : ''}
        </div>
      </details>`;
    }).join('')}
  </div>`;
}

function faceV2MethodMarkup(methodology = {}) {
  const layers = Array.isArray(methodology.layers) ? methodology.layers : [];
  const limitations = (Array.isArray(methodology.limitations) ? methodology.limitations : [])
    .filter((_, index) => index < 4 && index !== 2);
  const references = Array.isArray(methodology.references) ? methodology.references : [];
  return `<section class="face-v2-method" data-testid="face-v2-method">
    <div class="face-report__section-head"><small>Method and limits</small><h2>${escapeHtml(methodology.title || 'How this reading was made')}</h2><p>${escapeHtml(methodology.birthContext || '')}</p></div>
    ${methodology.scienceSummary ? `<div class="face-v2-method__science"><small>What portrait research says</small><p>${escapeHtml(methodology.scienceSummary)}</p></div>` : ''}
    <div class="face-v2-method__layers">${layers.map((layer, index) => `<article><span>${index + 1}</span><small>${escapeHtml(layer.label || '')}</small><p>${escapeHtml(layer.description || '')}</p></article>`).join('')}</div>
    ${limitations.length ? `<details class="face-v2-method__limits"><summary>Important limits <i aria-hidden="true">+</i></summary><ul>${limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></details>` : ''}
    ${references.length ? `<details class="face-v2-method__references"><summary>Evidence and cultural references <i aria-hidden="true">+</i></summary><div>${references.map((item) => `<article><b>${escapeHtml(item.title || '')}</b><p>${escapeHtml(item.whatItSupports || '')}</p></article>`).join('')}</div></details>` : ''}
  </section>`;
}

function faceV2TimelineMarkup(lifeTimeline = {}) {
  const strongest = lifeTimeline.strongestPeriod || {};
  const phases = Array.isArray(lifeTimeline.nextThreePhases) ? lifeTimeline.nextThreePhases : [];
  const domains = Array.isArray(lifeTimeline.domains) ? lifeTimeline.domains : [];
  const plan = Array.isArray(lifeTimeline.plan90Days) ? lifeTimeline.plan90Days : [];
  if (!strongest.window && !phases.length && !domains.length) return '';
  return `<section id="face-life-timeline-section" class="face-report__part face-v2-timeline" data-testid="face-report-timeline">
    <div class="face-report__part-heading"><span>Part 2</span><div><small>Your optional timing add-on</small><h2>Astrology + numerology life timeline</h2><p>${escapeHtml(lifeTimeline.headline || '')}</p></div></div>
    <article class="face-v2-timeline__strongest"><small>${strongest.timingState === 'active' ? 'Strongest period active now' : 'Strongest promising period'}</small><h3>${escapeHtml(strongest.window || strongest.title || '')}</h3><p>${escapeHtml(strongest.summary || '')}</p>${strongest.timingEvidence ? `<span><b>${escapeHtml(strongest.timingSourceLabel || 'Timing evidence')}</b>${escapeHtml(strongest.timingEvidence)}</span>` : ''}${strongest.prepareNow ? `<div><small>What to do now</small><b>${escapeHtml(strongest.prepareNow)}</b></div>` : ''}</article>
    ${phases.length ? `<div class="face-v2-timeline__phases">${phases.slice(0, 3).map((phase, index) => `<article><span>${index + 1}</span><time>${escapeHtml(phase.window || 'Broad period')}</time><h3>${escapeHtml(phase.title || `Phase ${index + 1}`)}</h3><p>${escapeHtml(phase.summary || '')}</p>${phase.prepareNow ? `<small><b>Prepare:</b> ${escapeHtml(phase.prepareNow)}</small>` : ''}</article>`).join('')}</div>` : ''}
    <div class="face-v2-timeline__domains">${domains.map((domain) => {
      const current = domain.currentAssessment || null;
      const nextWindow = domain.nextWindow || null;
      const impacts = Array.isArray(domain.likelyImpact)
        ? domain.likelyImpact
        : Array.isArray(domain.likelyDevelopments) ? domain.likelyDevelopments : [];
      return `<article data-testid="face-timeline-domain" data-domain-key="${escapeHtml(domain.key || '')}">
        <header><small>${escapeHtml(domain.label || 'Life area')}</small><h3>${escapeHtml(current?.summary || nextWindow?.summary || domain.headline || '')}</h3></header>
        <div class="face-v2-timeline__window"><small>${current ? 'Current active period' : nextWindow ? 'Next promising period' : escapeHtml(domain.periodLabel || 'Planning period')}</small><b>${escapeHtml(current?.window || nextWindow?.window || domain.period || 'Broad timing')}</b></div>
        ${domain.timingEvidence ? `<p><b>Why this period</b>${escapeHtml(domain.timingEvidence)}</p>` : ''}
        ${impacts.length ? `<div><small>What may happen because of it</small><ul>${impacts.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
        ${domain.action || domain.preparation ? `<p class="face-v2-timeline__action"><b>What to do now</b>${escapeHtml(domain.action || domain.preparation)}</p>` : ''}
        ${domain.limit ? `<p class="face-v2-timeline__limit"><b>Limit</b>${escapeHtml(domain.limit)}</p>` : ''}
      </article>`;
    }).join('')}</div>
    ${plan.length ? `<section class="face-v2-timeline__plan"><small>Start before the period arrives</small><h2>Your 90-day preparation plan</h2><div>${plan.slice(0, 3).map((item, index) => `<article><span>${index + 1}</span><small>${escapeHtml(item.period || `Step ${index + 1}`)}</small><h3>${escapeHtml(item.action || '')}</h3>${item.purpose ? `<p>${escapeHtml(item.purpose)}</p>` : ''}</article>`).join('')}</div></section>` : ''}
  </section>`;
}

function facePaidReportV2Markup(full, paidHeadline, pdfUrl, faceReading = {}, lifeTimeline = {}) {
  const firstImpression = faceReading.firstImpression || {};
  const dailyLife = Array.isArray(faceReading.dailyLife) ? faceReading.dailyLife.slice(0, 6) : [];
  const featureInsights = Array.isArray(faceReading.featureInsights) ? faceReading.featureInsights : [];
  const differentSignal = faceReading.sameFaceDifferentSignal || {};
  const experiments = Array.isArray(differentSignal.experiments) ? differentSignal.experiments : [];
  const traditionLenses = faceReading.traditionLenses || {};
  const methodology = faceReading.methodology || {};
  const reportLimit = faceReading.mirror?.realityCheck
    || (Array.isArray(methodology.limitations) ? methodology.limitations[1] : '')
    || '';
  const personalityOnly = full?.product?.key === 'face_personality';
  const observationCount = Number(faceReading.observationReceipt?.count || featureInsights.length || 0);
  return `<div class="paid-report paid-report--face face-report face-report-v2" data-testid="face-paid-report" data-face-report-schema="face_reading_v2">
    <section class="face-report__part face-report__part--personality">
      <header class="face-v2-hero" data-testid="face-v2-first-impression">
        <div class="face-v2-hero__eyebrow"><span>Part 1</span><small>${observationCount} visible details · private Face Reading</small></div>
        <h1>${escapeHtml(paidHeadline || firstImpression.title || 'Your Face Reading')}</h1>
        <p class="face-v2-hero__headline">${escapeHtml(faceReading.headline || firstImpression.possibleEffect || '')}</p>
        <div class="face-v2-hero__answer">
          <span><small>What is visible</small><b>${escapeHtml(firstImpression.cue || '')}</b></span>
          <span><small>Likely first-glance signal</small><b>${escapeHtml(firstImpression.possibleEffect || '')}</b></span>
          <span><small>How it may help</small><b>${escapeHtml(firstImpression.possibleUpside || '')}</b></span>
          <span><small>What may be misunderstood</small><b>${escapeHtml(firstImpression.possibleMisreading || '')}</b></span>
        </div>
        ${firstImpression.reversibleAction ? `<div class="face-v2-hero__action"><small>Try this with the same face</small><b>${escapeHtml(firstImpression.reversibleAction)}</b></div>` : ''}
        ${reportLimit ? `<p class="face-v2-hero__limit"><b>Reality check</b>${escapeHtml(reportLimit)}</p>` : ''}
      </header>

      <section class="face-v2-daily" data-testid="face-v2-daily-life">
        <div class="face-report__section-head"><small>Six personal answers</small><h2>How this may land in daily life—and what you can do</h2><p>Each answer connects the measured cue with a possible impact, misunderstanding and useful next move.</p></div>
        <div class="face-v2-answer-grid">${dailyLife.map((item, index) => faceV2AnswerCardMarkup(item, featureInsights, index)).join('')}</div>
      </section>

      <section class="face-v2-mirror" data-testid="face-v2-combined-patterns">
        <div class="face-v2-experiments"><header><small>A fun, practical experiment</small><h2>${escapeHtml(differentSignal.title || 'Same face, different signal')}</h2><p>${escapeHtml(differentSignal.premise || '')}</p></header><div>${experiments.map((item, index) => `<article><span>${index + 1}</span><h4>${escapeHtml(item.change || '')}</h4><p>${escapeHtml(item.possibleSignal || '')}</p><small>${escapeHtml(item.check || '')}</small></article>`).join('')}</div></div>
      </section>

      <section class="face-v2-traditions" data-testid="face-v2-tradition-lenses">
        <div class="face-report__section-head"><small>Traditional reflections, clearly labelled</small><h2>Indian and Chinese cultural lenses</h2><p>These symbolic reflections are shown separately from visible measurement. They are not science, facts about your personality or predictions.</p></div>
        <div class="face-v2-lens-grid">${faceV2TraditionLensMarkup(traditionLenses.samudrika, 'samudrika')}${faceV2TraditionLensMarkup(traditionLenses.mianXiang, 'mian-xiang')}</div>
      </section>

      <section class="face-v2-evidence" data-testid="face-v2-evidence-method">
        <div class="face-report__section-head"><small>Feature evidence</small><h2>What was actually measured in this photo</h2><p>Open any row to see the check and result. Eye colour remains a visible detail only and never changes your pattern.</p></div>
        ${faceV2FeatureEvidenceMarkup(featureInsights)}
      </section>
      ${faceV2MethodMarkup(methodology)}
    </section>
    ${personalityOnly ? '' : faceV2TimelineMarkup(lifeTimeline)}
    ${paidDeliveryMarkup(full, pdfUrl, { completePdfLabel: !personalityOnly, includeShare: false })}
  </div>`;
}
// FACE_PAID_V2_RENDERER_END

function facePaidReportMarkup(full, paidHeadline, synthesis, pdfUrl) {
  const web = full?.web || {};
  const report = full?.report || {};
  const isPersonalityOnly = full?.product?.key === 'face_personality';
  const faceReading = report.faceReading || report.face || full?.faceReading || {};
  const lifeTimeline = report.lifeTimeline || web.lifeTimeline || full?.lifeTimeline || {};
  if (faceReading?.schemaVersion === 'face_reading_v2') {
    return facePaidReportV2Markup(full, paidHeadline, pdfUrl, faceReading, lifeTimeline);
  }
  const predictions = Array.isArray(web.predictions) ? web.predictions.slice(0, 8) : [];
  const chart = full?.chart || {};
  const numerology = report.numerology || full?.numerology || {};
  const theme = faceReading?.themes?.[0]?.label || 'your leading face-reading theme';
  const markerCount = Number(faceReading?.observationReceipt?.count || state.faceAnalysis?.observations?.length || 0);
  const personalityMarkerCount = Number(
    faceReading?.observationReceipt?.personalityMarkerCount
      || Math.max(0, markerCount - Number(
        faceReading?.faceAnalysis?.observations?.some?.(({ key }) => key === 'eye_color')
      ))
  );
  const featureSignature = faceVisualSignature(
    faceReading?.faceAnalysis || state.faceAnalysis,
    { legacyPresentation: true }
  );
  const fallbackFeatureGroups = faceReportFeatureGroups(
    featureSignature,
    { legacyPresentation: true }
  ).map((group) => ({
    ...group,
    items: group.items.map((item) => {
      const primaryTheme = item.themes?.[0] || '';
      const reflection = FACE_THEME_REFLECTIONS[primaryTheme] || {};
      return {
        ...item,
        traditionalMeaning: item.traditionalMeaning || (item.themes?.length
          ? `Reinforces ${humanList(item.themes.map((label) => FACE_THEME_REFLECTIONS[label]?.label || label))}.`
          : 'This visible detail adds character to the full first impression.'),
        perceptionCue: item.notice ? `People first notice ${item.notice}.` : '',
        strength: reflection.strength || '',
        watch: reflection.watch || '',
        practicalUse: ''
      };
    })
  }));
  const canonicalFeatureGroups = Array.isArray(faceReading?.featureGroups)
    ? faceReading.featureGroups.map((group) => ({
        key: group.key,
        title: group.title,
        summary: group.summary,
        items: Array.isArray(group.features) ? group.features
          .map((item) => ({
          key: item.key,
          label: item.label,
          feature: legacyFaceObservationValue(item.key, item.value)
            || String(item.value || '').replaceAll('_', ' '),
          fact: item.description,
          themes: Array.isArray(item.themes)
            ? item.themes.map((entry) => typeof entry === 'string' ? entry : entry?.label).filter(Boolean)
            : [],
          traditionalMeaning: item.traditionalMeaning || item.interpretation || '',
          perceptionCue: item.perceptionCue || '',
          strength: item.strength || '',
          watch: item.watchout || '',
          practicalUse: item.practicalUse || ''
          })) : []
      })).filter(({ items }) => items.length)
    : [];
  const featureGroups = canonicalFeatureGroups.length ? canonicalFeatureGroups : fallbackFeatureGroups;
  const mappedFeatures = featureGroups.flatMap(({ items }) => items);
  const personality = Array.isArray(faceReading?.personalityProfile) && faceReading.personalityProfile.length
    ? faceReading.personalityProfile.slice(0, 3).map((item) => ({
        label: item.label,
        role: item.role === 'leading' ? 'Leading pattern' : 'Supporting pattern',
        summary: item.summary,
        perception: item.howPerceived,
        roomEnergy: item.roomEnergy,
        strength: item.strength,
        watch: item.watchout,
        practicalUse: item.practicalUse,
        observationKeys: Array.isArray(item.observationKeys) ? item.observationKeys : []
      }))
    : faceThemeProfiles(featureSignature);
  const faceReadingSummary = faceReading.summary || featureSignature.traditional;
  const personalitySections = Array.isArray(faceReading?.sections)
    ? faceReading.sections.slice(0, 6)
    : [];
  const leadingPersonality = personality[0] || {};
  const supportingPersonality = personality[1] || {};
  const firstImpression = leadingPersonality.perception || 'Distinctive and self-possessed.';
  const roomEnergyLabel = featureSignature.impression?.label || 'A DISTINCTIVE PRESENCE';
  const roomEnergy = leadingPersonality.roomEnergy
    || (featureSignature.impression?.phrase
      ? `You bring ${featureSignature.impression.phrase} into the room.`
      : 'You bring a distinctive presence that people notice quickly.');
  const roomEnergyDetail = featureSignature.perception || faceReadingSummary;
  const mappedFeatureByKey = new Map(mappedFeatures.map((item) => [item.key, item]));
  const evidenceChips = (keys = []) => [...new Set(keys)]
    .map((key) => mappedFeatureByKey.get(key))
    .filter(Boolean)
    .slice(0, 4);
  const personalityAreaLabels = {
    self_direction: 'How you make decisions',
    communication: 'How you communicate',
    relationships: 'How you connect',
    work: 'How you work',
    resources: 'How you handle responsibilities',
    growth: 'How you grow'
  };
  const readableFaceSectionHeadline = (section = {}) => {
    const headline = String(section.headline || '').trim();
    if (!/leads here|supports it|leads this part of the reading/i.test(headline)) return headline;
    return String(section.traditionalReading || section.synthesis || headline).trim();
  };
  const phases = Array.isArray(lifeTimeline.nextThreePhases)
    ? lifeTimeline.nextThreePhases.slice(0, 3)
    : [];
  const timelineDomains = Array.isArray(lifeTimeline.domains)
    ? lifeTimeline.domains.slice(0, 6)
    : [];
  const strongestPeriod = lifeTimeline.strongestPeriod && typeof lifeTimeline.strongestPeriod === 'object'
    ? lifeTimeline.strongestPeriod
    : {};
  const timelineGlance = Array.isArray(lifeTimeline.atAGlance) && lifeTimeline.atAGlance.length
    ? lifeTimeline.atAGlance.slice(0, 6)
    : timelineDomains;
  const ageStrength = lifeTimeline.whatStrengthensWithAge && typeof lifeTimeline.whatStrengthensWithAge === 'object'
    ? lifeTimeline.whatStrengthensWithAge
    : {};
  const positiveRecap = lifeTimeline.positiveRecap && typeof lifeTimeline.positiveRecap === 'object'
    ? lifeTimeline.positiveRecap
    : {};
  const domainIcons = {
    loveRelationships: '♥',
    familyHome: '⌂',
    careerSuccess: '↗',
    moneyWealth: '₹',
    recognition: '✦',
    personalGrowth: '◷'
  };
  const sourceCards = [
    {
      className: 'face-source-card--face',
      icon: '◉',
      tag: 'Face map',
      body: markerCount
        ? `${markerCount} mapped face details were clear enough to read${personalityMarkerCount && personalityMarkerCount !== markerCount ? `; ${personalityMarkerCount} shape the core personality pattern` : ''}.`
        : 'Your reviewed face-map details form the personality layer.'
    },
    {
      className: 'face-source-card--chart',
      icon: '☾',
      tag: 'Vedic chart',
      body: [
        chart.moonSign && `${chart.moonSign} Moon`,
        chart.precision === 'timed' && chart.ascendant && chart.ascendant !== 'Solar chart'
          ? `${chart.ascendant} rising`
          : ''
      ].filter(Boolean).join(' · ') || 'Your birth chart supplies the life-area and timing context.'
    },
    {
      className: 'face-source-card--number',
      icon: '№',
      tag: 'Numerology',
      body: [
        numerology.lifePath && `Life Path ${numerology.lifePath}`,
        numerology.nameNumber && `Chaldean Name ${numerology.nameNumber}`,
        numerology.destinyNumber && `Destiny ${numerology.destinyNumber}`
      ].filter(Boolean).join(' · ') || 'Your birth and name numbers provide a comparison layer.'
    }
  ];
  const reportName = formatName(state.answers.name);
  const reportTitle = isPersonalityOnly
    ? 'What your face reveals about you'
    : reportName
      ? `${reportName}’s Face, Personality & Life Timeline`
      : 'Your Face, Personality & Life Timeline';
  return `<div class="face-report">
    <section class="face-report__hero">
      <div class="face-report__label">Payment confirmed · ${isPersonalityOnly ? 'Detailed Face Reading' : 'Two-part personal report'}</div>
      <h1 class="face-report__title">${escapeHtml(reportTitle)}</h1>
      <p class="face-report__intro">${isPersonalityOnly
        ? 'Your face has a recognisable signature. This report reveals what your strongest features say about your personality, the impression you leave, your natural superpower and the one blind spot that makes the reading unmistakably personal.'
        : 'Part 1 reveals the personality signature in your mapped face. Part 2 shows the important periods calculated through Vedic astrology and numerology, with your Face Reading explaining how you are likely to move through each one.'}</p>
    </section>
    ${isPersonalityOnly ? '' : `<nav class="face-report__part-nav" data-testid="face-report-nav" aria-label="Report parts">
      <a href="#face-reading-section"><span>Part 1</span><b>Face Reading</b></a>
      <a href="#face-life-timeline-section"><span>Part 2</span><b>Life Timeline</b></a>
    </nav>`}
    <section id="face-reading-section" class="face-report__part face-report__part--reading" data-testid="face-report-reading">
      <div class="face-report__part-heading"><span>${isPersonalityOnly ? 'Report' : 'Part 1'}</span><div><small>Your Face &amp; Personality Reading</small><h2>What your presence reveals</h2><p>Start with the impression you create, then see the personality patterns, strengths and mapped features behind it.</p></div></div>
      <section class="face-report__presence" data-testid="face-impression-lead">
        <div class="face-report__presence-head"><small>Your first impression</small><h2>How people perceive you</h2><strong>${escapeHtml(firstImpression)}</strong><p>This is the strongest immediate signal in your mapped face—before people know the deeper personality behind it.</p></div>
        <div class="face-report__presence-grid">
          <article class="face-report__presence-energy">
            <small>The energy you bring into a room</small>
            <h3>${escapeHtml(roomEnergyLabel)}</h3>
            <p>${escapeHtml(roomEnergy)}</p>
            ${roomEnergyDetail ? `<span>${escapeHtml(roomEnergyDetail)}</span>` : ''}
          </article>
          ${supportingPersonality.perception ? `<article>
            <small>What people notice next</small>
            <h3>${escapeHtml(supportingPersonality.perception)}</h3>
            <p>${escapeHtml(supportingPersonality.summary || '')}</p>
          </article>` : ''}
        </div>
      </section>
      <section class="face-report__summary face-report__personality-summary" data-testid="face-personality-summary">
        <div class="face-report__section-head"><small>Behind that impression</small><h2>The personality patterns people are responding to</h2><p>These are the themes that repeat most clearly across your mapped features.</p></div>
        ${personality.length ? `<div class="face-report__personality-stack">${personality.map((item, index) => {
          const evidence = evidenceChips(item.observationKeys);
          return `<article class="face-report__pattern-card${index === 0 ? ' face-report__pattern-card--leading' : ''}"${index === 0 ? ' data-testid="face-signature-pattern"' : ''}>
            <div class="face-report__pattern-head"><span>${index === 0 ? 'Your signature pattern' : 'Another side of you'}</span><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(item.summary || '')}</p></div>
            <div class="face-report__pattern-copy">
              ${item.strength ? `<p><b>Your natural superpower</b>${escapeHtml(item.strength)}</p>` : ''}
              ${index === 0 && item.watch ? `<p><b>Your one blind spot</b>${escapeHtml(item.watch)}</p>` : ''}
              ${item.practicalUse ? `<p class="face-report__pattern-action"><b>Use this strength well</b>${escapeHtml(item.practicalUse)}</p>` : ''}
            </div>
            ${evidence.length ? `<div class="face-report__pattern-evidence"><small>Based on your map</small><div>${evidence.map((feature) => `<span>${escapeHtml(feature.feature)}</span>`).join('')}</div></div>` : ''}
          </article>`;
        }).join('')}</div>` : ''}
      </section>
      ${personalitySections.length ? `<section class="face-report__section face-report__daily-life" data-testid="face-personality-areas">
        <div class="face-report__section-head"><small>Your reading in daily life</small><h2>How this shows up</h2><p>Open an area for the direct reading, the mapped evidence behind it and one action you can use now.</p></div>
        <div class="face-report__daily-stack">
          ${personalitySections.map((section, index) => {
            const evidence = evidenceChips(section.evidence?.faceObservations?.map(({ key }) => key));
            return `<details class="face-report__daily-card" ${index === 0 ? 'open' : ''}>
              <summary><span><small>${escapeHtml(personalityAreaLabels[section.key] || section.title)}</small><b>${escapeHtml(readableFaceSectionHeadline(section))}</b></span><i aria-hidden="true">+</i></summary>
              <div class="face-report__daily-body">
                <p>${escapeHtml(section.traditionalReading || section.synthesis || '')}</p>
                ${evidence.length ? `<div class="face-report__daily-evidence"><small>Why this result</small>${evidence.map((feature) => `<span>${escapeHtml(feature.label)} · ${escapeHtml(feature.feature)}</span>`).join('')}</div>` : ''}
                ${section.practicalUse ? `<div class="face-report__daily-action"><small>Use this strength well</small><b>${escapeHtml(section.practicalUse)}</b></div>` : ''}
              </div>
            </details>`;
          }).join('')}
        </div>
      </section>` : ''}
      ${mappedFeatures.length ? `<section class="face-report__section face-report__features" data-testid="face-report-features">
        <div class="face-report__section-head"><small>Your features, one by one</small><h2>What makes your face distinctly yours</h2><p>Every mapped area is open below, showing the feature we found and the personality quality traditional face reading connects with it.</p></div>
        <div class="face-report__feature-groups" data-testid="face-report-feature-groups">
          ${featureGroups.map((group) => `<details class="face-report__feature-group" open>
            <summary><span><small>${escapeHtml(group.title)}</small><b>${escapeHtml(group.summary)}</b></span><i>${group.items.length}</i></summary>
            <div class="face-report__evidence-list">${group.items.map((item) => `<article class="face-report__evidence-row">
              <div><small>${escapeHtml(item.label)}</small><h3>${escapeHtml(item.feature)}</h3></div>
              <p>${escapeHtml(item.fact)}</p>
              ${item.traditionalMeaning ? `<div class="face-report__evidence-meaning"><small>What this feature reveals</small><p>${escapeHtml(item.traditionalMeaning)}</p></div>` : ''}
              ${item.perceptionCue ? `<span><b>How it is noticed</b>${escapeHtml(item.perceptionCue)}</span>` : ''}
              ${item.strength ? `<span><b>Natural gift</b>${escapeHtml(item.strength)}</span>` : ''}
            </article>`).join('')}</div>
          </details>`).join('')}
        </div>
      </section>` : ''}
      ${isPersonalityOnly
        ? `<div class="face-report__method-note"><b>Method</b>${escapeHtml(full?.disclaimer || 'Visible proportions were mapped on your device. Traditional face reading supplied the personality interpretation.')}</div>`
        : `<a class="face-report__part-bridge" href="#face-life-timeline-section"><span>Continue to Part 2</span><b>See your Complete Life Timeline</b><i aria-hidden="true">↓</i></a>`}
    </section>
    ${isPersonalityOnly ? '' : `<section id="face-life-timeline-section" class="face-report__part face-report__part--timeline" data-testid="face-report-timeline">
      <div class="face-report__part-heading"><span>Part 2</span><div><small>Your Complete Life Timeline</small><h2>Your astrology + numerology timeline, personalised by your face</h2><p>Your Vedic chart and birth-date numerology determine when each important period appears. Your Chaldean Name Number adds an expression layer, while your Face Reading reveals how your natural personality meets the moment.</p></div></div>
      <div class="face-source-grid">${sourceCards.map((card) => `<article class="face-source-card ${card.className}"><div class="face-source-card__head"><i class="face-source-card__icon">${escapeHtml(card.icon)}</i><div><small>Source</small><h3>${escapeHtml(card.tag)}</h3></div></div><p class="face-source-card__body">${escapeHtml(card.body)}</p></article>`).join('')}</div>
      ${timelineGlance.length ? `<section class="face-report__timeline-glance">
        <div class="face-report__section-head"><small>Your life at a glance</small><h2>The six timelines that matter most</h2><p>Astrology and numerology set the periods. Your face pattern shows the personal style you bring into each one.</p></div>
        <div>${timelineGlance.map((domain) => `<article>
          <i aria-hidden="true">${escapeHtml(domainIcons[domain.key] || '✦')}</i>
          <div><small>${escapeHtml(domain.label || 'Your timeline')}</small><h3>${escapeHtml(domain.period || domain.periodLabel || 'Year-level timing')}</h3><p>${escapeHtml(domain.headline || '')}</p><span>${escapeHtml(domain.timingSourceLabel || 'Vedic astrology + birth-date numerology')}</span></div>
        </article>`).join('')}</div>
      </section>` : ''}
      <section class="face-report__timeline-overview" data-testid="face-timeline-overview">
        <small>${strongestPeriod.timingState === 'active' ? 'Your strongest period is already active' : 'Your strongest upcoming period'}</small>
        <h3>${escapeHtml(strongestPeriod.window || lifeTimeline.headline || 'Your strongest year-level phase')}</h3>
        <p>${escapeHtml(strongestPeriod.summary || lifeTimeline.headline || 'The ordered phases below show what comes first and how to prepare.')}</p>
        ${strongestPeriod.timingEvidence ? `<span><b>Why this period stands out · ${escapeHtml(strongestPeriod.timingSourceLabel || 'Astrology + numerology')}</b>${escapeHtml(strongestPeriod.timingEvidence)}</span>` : ''}
        ${strongestPeriod.prepareNow ? `<div><small>Prepare now</small><b>${escapeHtml(strongestPeriod.prepareNow)}</b></div>` : ''}
      </section>
      ${phases.length ? `<section class="face-report__phases">
        <div class="face-report__section-head"><small>Your timeline at a glance</small><h2>Three periods to pay attention to</h2><p>Read them in order: what deserves attention first, what follows and what to prepare before each phase.</p></div>
        <div class="face-report__phase-track">${phases.map((phase, index) => `<article>
          <i>${index + 1}</i><div><time>${escapeHtml(phase.window || 'Year-level timing')}</time><h3>${escapeHtml(phase.title || `Phase ${index + 1}`)}</h3><p>${escapeHtml(phase.summary || '')}</p>${phase.prepareNow ? `<small><b>Prepare:</b> ${escapeHtml(phase.prepareNow)}</small>` : ''}</div>
        </article>`).join('')}</div>
      </section>` : ''}
      <section class="face-report__section">
        <div class="face-report__section-head"><small>Six personal timelines</small><h2>How each life area develops</h2><p>Every card separates the Face-reading lens from the astrology and numerology timing, then gives you a practical preparation step.</p></div>
        ${timelineDomains.length ? timelineDomains.map((domain) => `<article class="face-report__domain face-report__timeline-domain" data-testid="face-timeline-domain" data-domain-key="${escapeHtml(domain.key || '')}">
          <div class="face-report__domain-head"><i aria-hidden="true">${escapeHtml(domainIcons[domain.key] || '✦')}</i><div><small>${escapeHtml(domain.label || 'Your timeline')}</small><h3>${escapeHtml(domain.headline || 'Your life-area pattern is ready')}</h3></div></div>
          <div class="face-report__domain-body">
            <div class="face-report__window"><span><small>${escapeHtml(domain.periodLabel || 'Key period')}</small><b>${escapeHtml(domain.period || 'Year-level timing')}</b></span>${domain.ageRange ? `<span><small>Age range</small><b>${escapeHtml(domain.ageRange)}</b></span>` : ''}</div>
            ${domain.faceLens ? `<div class="face-report__lens"><small>How your face pattern shapes this period</small>${domain.faceLensHeadline ? `<b>${escapeHtml(domain.faceLensHeadline)}</b>` : ''}<p>${escapeHtml(domain.faceLens)}</p>${domain.faceCrossCheck ? `<p><b>Expression cross-check</b> ${escapeHtml(domain.faceCrossCheck)}</p>` : ''}${Array.isArray(domain.themeLabels) && domain.themeLabels.length ? `<div>${domain.themeLabels.map((label) => `<span>${escapeHtml(label)}</span>`).join('')}</div>` : ''}</div>` : ''}
            ${domain.timingEvidence ? `<div class="face-report__timing-evidence"><small>Why this timing appears · ${escapeHtml(domain.timingSourceLabel || 'Astrology + numerology')}</small><p>${escapeHtml(domain.timingEvidence)}</p></div>` : ''}
            ${Array.isArray(domain.likelyDevelopments) && domain.likelyDevelopments.length ? `<div class="face-report__developments"><small>How this develops</small><ul>${domain.likelyDevelopments.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></div>` : ''}
            ${domain.preparation || domain.facePractice ? `<div class="face-report__action"><small>Use this period well</small>${domain.preparation ? `<b>${escapeHtml(domain.preparation)}</b>` : ''}${domain.facePractice ? `<p>${escapeHtml(domain.facePractice)}</p>` : ''}</div>` : ''}
          </div>
        </article>`).join('') : predictions.length ? predictions.map((row) => `<article class="face-report__domain"><div class="face-report__domain-head"><i>✦</i><div><small>${escapeHtml(row.label || row.key || 'Your reading')}</small><h3>${escapeHtml(row.value || 'Your result is ready')}</h3></div></div><div class="face-report__domain-body">${row.window ? `<div class="face-report__window"><small>Important period</small><b>${escapeHtml(row.window)}</b></div>` : ''}${row.why ? `<p><b>${escapeHtml(row.whyLabel || 'Why this appears')}:</b> ${escapeHtml(row.why)}</p>` : ''}${row.advice ? `<div class="face-report__action"><small>Use this well</small><b>${escapeHtml(row.advice)}</b></div>` : ''}</div></article>`).join('') : paidSections(full)}
      </section>
      ${Array.isArray(lifeTimeline.plan90Days) && lifeTimeline.plan90Days.length ? `<section class="face-report__plan">
        <div class="face-report__section-head"><small>Start before the window arrives</small><h2>Your 90-day preparation plan</h2></div>
        <div>${lifeTimeline.plan90Days.slice(0, 3).map((item, index) => `<article><span>${index + 1}</span><small>${escapeHtml(item.period || `Step ${index + 1}`)}</small><h3>${escapeHtml(item.action || '')}</h3>${item.purpose ? `<p>${escapeHtml(item.purpose)}</p>` : ''}</article>`).join('')}</div>
      </section>` : ''}
      ${ageStrength.verdict ? `<section class="face-report__age-strength">
        <i aria-hidden="true">↗</i><div><small>${escapeHtml(ageStrength.title || 'What strengthens with age')}</small><h2>${escapeHtml(ageStrength.verdict)}</h2>
        ${ageStrength.faceLens ? `<p><b>What your face adds</b>${escapeHtml(ageStrength.faceLens)}</p>` : ''}
        ${ageStrength.timingEvidence ? `<p><b>${escapeHtml(ageStrength.timingSourceLabel || 'Astrology + numerology')}</b>${escapeHtml(ageStrength.timingEvidence)}</p>` : ''}
        ${ageStrength.preparation ? `<span><b>Keep strengthening this</b>${escapeHtml(ageStrength.preparation)}</span>` : ''}</div>
      </section>` : ''}
      ${positiveRecap.summary ? `<section class="face-report__closing">
        <small>${escapeHtml(positiveRecap.title || 'Your way forward')}</small><h2>${escapeHtml(positiveRecap.summary)}</h2>
        <div>${positiveRecap.milestone ? `<span><small>Next milestone</small><b>${escapeHtml(positiveRecap.milestone)}</b></span>` : ''}${positiveRecap.firstStep ? `<span><small>First step</small><b>${escapeHtml(positiveRecap.firstStep)}</b></span>` : ''}</div>
      </section>` : ''}
      ${synthesis ? `<section class="face-report__section face-report__summary"><div class="face-report__section-head"><small>How all three systems come together</small><h2>Your combined reading</h2></div><p>${escapeHtml(synthesis)}</p></section>` : ''}
      <div class="face-report__method-note"><b>Method</b>${escapeHtml(full?.disclaimer || 'The on-device face map supplies the personality lens. Vedic astrology and Chaldean numerology supply the timing layers.')}</div>
    </section>`}
    ${paidDeliveryMarkup(full, pdfUrl, {
      completePdfLabel: true,
      includeShare: false
    })}
  </div>`;
}

function mahakundliReportDate(value) {
  const date = new Date(String(value || ''));
  if (!Number.isFinite(date.getTime())) return String(value || '').slice(0, 10);
  return date.toLocaleDateString('en-IN', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

const MAHAKUNDLI_LIFE_AREA_PRESENTATION_ORDER = Object.freeze([
  'marriage',
  'children',
  'careerDirection',
  'jobChange',
  'promotion',
  'businessPartnerships',
  'moneyProperty',
  'love',
  'familyHome',
  'healthWellbeing',
  'lossDebtRisk',
  'fameRecognition',
  'travelPurpose',
  'education',
  'childhoodParents',
  'siblings',
  'self'
]);
const MAHAKUNDLI_LIFE_AREA_PRESENTATION_RANK = new Map(
  MAHAKUNDLI_LIFE_AREA_PRESENTATION_ORDER.map((key, index) => [key, index])
);

function orderedMahakundliReportLifeAreas(value = []) {
  return [...(Array.isArray(value) ? value : [])].sort((left, right) => (
    (MAHAKUNDLI_LIFE_AREA_PRESENTATION_RANK.get(left?.key) ?? Number.MAX_SAFE_INTEGER)
      - (MAHAKUNDLI_LIFE_AREA_PRESENTATION_RANK.get(right?.key) ?? Number.MAX_SAFE_INTEGER)
  ));
}

function mahakundliPaidReportMarkup(full, paidHeadline, pdfUrl) {
  const model = full?.web?.mahakundli || full?.report?.mahakundli || {};
  const snapshot = model.birthSnapshot || {};
  const precision = model.precision || {};
  const numerology = model.numerology || full?.numerology || {};
  const dasha = model.currentDasha || {};
  const planets = Array.isArray(model.planetTable) ? model.planetTable : [];
  const houses = Array.isArray(model.houses) ? model.houses : [];
  const divisionalCharts = Array.isArray(model.divisionalCharts) ? model.divisionalCharts : [];
  const yogas = Array.isArray(model.yogas) ? model.yogas : [];
  const cautions = Array.isArray(model.cautions) ? model.cautions : [];
  const lifeAreas = orderedMahakundliReportLifeAreas(model.lifeAreas);
  const reportVersion = String(
    model.version
    || full?.report?.mahakundli?.version
    || full?.report?.version
    || full?.reportVersion
    || ''
  ).trim();
  const isPersonalImpactV3 = reportVersion === 'mahakundli_report_v3';
  const birthDateLifeGuidance = !precision.timed
    && lifeAreas.some((area) => area.timingState === 'birth-date-guidance');
  const phases = Array.isArray(model.nextThreePhases) ? model.nextThreePhases : [];
  const timeline = Array.isArray(model.dashaTimeline) ? model.dashaTimeline : [];
  const transits = model.transits || {};
  const actionPlan = Array.isArray(model.actionPlan) ? model.actionPlan : [];
  const remedies = precision.timed && Array.isArray(model.remedies) ? model.remedies : [];
  const glossary = Array.isArray(model.glossary) ? model.glossary : [];
  const quality = model.qualityReceipt || {};
  const receipt = model.calculationReceipt || {};
  const placeLimited = Boolean(
    precision.placeUnresolved
    || precision.reason === 'birthplace-unresolved'
    || precision.envelopeScope === 'global-calendar-date'
  );
  const bothBirthDetailsUnresolved = placeLimited && (
    precision.birthTimeKnown === false
    || precision.reason === 'birth-time-and-birthplace-unresolved'
  );
  const personalTimingPrerequisite = bothBirthDetailsUnresolved
    ? 'a reliable birth time and a matched birthplace'
    : placeLimited
      ? 'a matched birthplace'
      : 'a reliable birth time';
  const precisionNeed = bothBirthDetailsUnresolved
    ? 'Reliable birth time and matched birthplace needed'
    : placeLimited
      ? 'Matched birthplace needed'
      : 'Correct birth time needed';
  const housesWithheldCopy = bothBirthDetailsUnresolved
    ? 'Houses are not shown because a reliable birth time and matched birthplace coordinates are both needed.'
    : placeLimited
      ? 'Houses are not shown because the birthplace could not be matched to reliable coordinates.'
      : 'Houses are not shown because the birth time is not reliable.';
  const vargaWithheldTitle = bothBirthDetailsUnresolved
    ? 'Not shown without a reliable birth time and matched birthplace'
    : placeLimited
      ? 'Not shown until birthplace is matched'
      : 'Not shown without a reliable birth time';
  const vargaWithheldCopy = bothBirthDetailsUnresolved
    ? 'Varga positions need a reliable birth time and matched birthplace coordinates, so they are not shown.'
    : placeLimited
      ? 'Varga positions need matched birthplace coordinates, so they are not shown.'
      : 'Varga positions need a reliable birth time, so they are not shown.';
  const vargaWithheldDetail = bothBirthDetailsUnresolved
    ? 'D2 resources, D3 effort, D4 home, D7 caregiving, D9 marriage, D10 career and D12 parents are not shown until a reliable birth time is added and the birthplace is matched to reliable coordinates.'
    : placeLimited
      ? 'D2 resources, D3 effort, D4 home, D7 caregiving, D9 marriage, D10 career and D12 parents are not shown until the birthplace is matched to reliable coordinates.'
      : 'D2 resources, D3 effort, D4 home, D7 caregiving, D9 marriage, D10 career and D12 parents are not shown until a reliable time is added.';
  const signalLabel = {
    supportive: 'Favourable period',
    mixed: 'Favourable period with caution',
    'needs-care': 'Needs care',
    'date-based-guidance': 'Birth-date guidance',
    'insufficient-data': 'Not shown'
  };
  const impactStatusKey = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    if (['supportive', 'good', 'favourable', 'favorable', 'strong'].includes(normalized)) return 'supportive';
    if (['mixed', 'caution', 'mixed-with-caution'].includes(normalized)) return 'mixed';
    if (['needs-care', 'challenging', 'difficult', 'bad', 'pressure'].includes(normalized)) return 'needs-care';
    if (['date-based-guidance', 'birth-date-guidance'].includes(normalized)) return 'date-based-guidance';
    if (['insufficient-data', 'withheld'].includes(normalized)) return 'insufficient-data';
    return 'neutral';
  };
  const impactStatusLabel = {
    supportive: 'Good for this question',
    mixed: 'Mixed — move carefully',
    'needs-care': 'Pressure is high',
    neutral: 'Not a peak period',
    'date-based-guidance': 'Broad guidance only',
    'insufficient-data': 'Personal timing is not available'
  };
  const impactPlanetWords = Object.freeze({
    Sun: 'confidence pattern',
    Moon: 'emotional pattern',
    Mars: 'action pattern',
    Mercury: 'communication pattern',
    Jupiter: 'growth pattern',
    Venus: 'relationship pattern',
    Saturn: 'responsibility pattern',
    Rahu: 'ambition pattern',
    Ketu: 'detachment pattern'
  });
  const customerImpactText = (value) => {
    let text = String(value || '').trim();
    if (!text) return '';
    text = text
      .replace(/\b(?:Surya\s*\(Sun\)|Chandra\s*\(Moon\)|Mangal\s*\(Mars\)|Budh\s*\(Mercury\)|Guru\s*\(Jupiter\)|Shukra\s*\(Venus\)|Shani\s*\(Saturn\)|Rahu(?:\s*\(North Node\))?|Ketu(?:\s*\(South Node\))?|Sun|Moon|Mars|Mercury|Jupiter|Venus|Saturn)\s+(?:Mahadasha|Antardasha|Pratyantardasha)\b/gi, 'this period')
      .replace(/Surya\s*\(Sun\)|\bSurya\b/gi, 'confidence pattern')
      .replace(/Chandra\s*\(Moon\)|\bChandra\b/gi, 'emotional pattern')
      .replace(/Mangal\s*\(Mars\)|\bMangal\b/gi, 'action pattern')
      .replace(/Budh\s*\(Mercury\)|\bBudh\b/gi, 'communication pattern')
      .replace(/Guru\s*\(Jupiter\)|\bGuru\b/gi, 'growth pattern')
      .replace(/Shukra\s*\(Venus\)|\bShukra\b/gi, 'relationship pattern')
      .replace(/Shani\s*\(Saturn\)|\bShani\b/gi, 'responsibility pattern')
      .replace(/Rahu\s*\(North Node\)/gi, 'ambition pattern')
      .replace(/Ketu\s*\(South Node\)/gi, 'detachment pattern')
      .replace(/\b(?:Mahadasha|Antardasha|Pratyantardasha|dasha)\b/gi, 'period')
      .replace(/\b(?:gochara|transits?)\b/gi, 'wider trend')
      .replace(/\b(?:\d{1,2}(?:st|nd|rd|th)?\s+house|house\s+\d{1,2})\b/gi, 'this life area');
    for (const [planet, replacement] of Object.entries(impactPlanetWords)) {
      text = text.replace(new RegExp(`\\b${planet}\\b`, 'gi'), replacement);
    }
    text = text
      .replace(/\b(?:grahas?|planets?)\b/gi, 'influences')
      .replace(/\b(?:nakshatra|rashi|lagna|ascendant|yoga|dosha|varga|placement)\b/gi, 'pattern')
      .replace(/\b(?:astrology|kundli|chart)\b/gi, 'this report')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return text;
  };
  const customerImpactList = (value) => (
    (Array.isArray(value) ? value : value ? [value] : [])
      .map(customerImpactText)
      .filter(Boolean)
  );
  const impactWindowLabel = (value) => {
    if (!value || typeof value !== 'object') return '';
    const window = value.window && typeof value.window === 'object' ? value.window : value;
    const start = window.start || value.start;
    const end = window.end || value.end;
    const until = value.until || window.until;
    if (start && end) return `${mahakundliReportDate(start)} – ${mahakundliReportDate(end)}`;
    if (until) return `Until ${mahakundliReportDate(until)}`;
    if (end) return `Until ${mahakundliReportDate(end)}`;
    if (start) return `From ${mahakundliReportDate(start)}`;
    return customerImpactText(value.label || value.period || '');
  };
  const impactWindowSummary = (value, fallback = '') => customerImpactText(
    value?.summary || value?.text || value?.meaning || fallback
  );
  const impactWindowHeading = (value, fallback) => customerImpactText(
    String(value?.label || '').split(/\s+·\s+/)[0] || fallback
  );
  const v3LifeAreaMarkup = isPersonalImpactV3 ? `<section id="mk-life" class="mahakundli-report__section mahakundli-report__life mahakundli-report__life--impact-v3" data-testid="mahakundli-report-v3-life">
      <div class="mahakundli-report__heading"><small>Your 17 personal answers</small><h2>First, what this means for your life</h2><p>${precision.timed ? 'Each answer starts with the impact on your life, then shows your current phase, any stronger earlier or upcoming periods where supported, and one practical step.' : `Each answer gives broad birth-date guidance and a practical step. Personal period dates need ${personalTimingPrerequisite}.`}</p></div>
      <div class="mahakundli-report__life-stack">${lifeAreas.map((area, index) => {
        const currentAssessment = area.currentAssessment && typeof area.currentAssessment === 'object'
          ? area.currentAssessment
          : {};
        const status = impactStatusKey(currentAssessment.status || area.signal);
        const whatThisMeans = customerImpactText(area.whatThisMeans || area.answer || '');
        const howItMayShowUp = customerImpactList(area.howItMayShowUp);
        const whyThisFits = customerImpactText(area.whyThisFits || area.impactExplanation || '');
        const currentSummary = impactWindowSummary(
          currentAssessment,
          area.timingSummary || area.timing || 'Use the present phase for steady, practical decisions.'
        );
        const currentWindow = impactWindowLabel(currentAssessment);
        const pastSummary = impactWindowSummary(area.pastWindow);
        const pastWindow = impactWindowLabel(area.pastWindow);
        const pastHeading = impactWindowHeading(area.pastWindow, 'Strongest earlier period');
        const nextSummary = impactWindowSummary(area.nextWindow);
        const nextWindow = impactWindowLabel(area.nextWindow);
        const nextHeading = impactWindowHeading(area.nextWindow, 'Next promising period');
        const watchFor = customerImpactList(area.watchFor).join(' ');
        const currentHeading = status === 'date-based-guidance'
          ? 'Your birth-date guidance'
          : status === 'insufficient-data'
            ? 'Why personal timing is not shown'
            : 'Your current phase';
        return `<details class="mahakundli-report__life-card signal-${escapeHtml(status)}" data-life-area="${escapeHtml(area.key || '')}" ${index < 2 ? 'open' : ''}>
          <summary><div><span class="mahakundli-report__status-badge status-${escapeHtml(status)}">${escapeHtml(impactStatusLabel[status])}</span><h3>${escapeHtml(area.label || '')}</h3><p>${escapeHtml(whatThisMeans)}</p></div><i aria-hidden="true">+</i></summary>
          <div class="mahakundli-report__life-body mahakundli-report__life-body--impact-v3">
            ${area.countText ? `<section class="is-wide"><small>Your full-life indication</small><p>${escapeHtml(customerImpactText(area.countText))}</p></section>` : ''}
            ${area.contextText ? `<section class="is-wide"><small>What this can mean for you</small><p>${escapeHtml(customerImpactText(area.contextText))}</p></section>` : ''}
            <section class="is-wide is-impact"><small>What this means for you</small><p>${escapeHtml(whatThisMeans)}</p></section>
            ${howItMayShowUp.length ? `<section class="is-wide is-situations"><small>How this may show up</small><ul>${howItMayShowUp.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>` : ''}
            ${whyThisFits ? `<section class="is-wide is-why"><small>Why this fits you</small><p>${escapeHtml(whyThisFits)}</p></section>` : ''}
            <section class="is-current"><small>${escapeHtml(currentHeading)}</small>${currentWindow ? `<time>${escapeHtml(currentWindow)}</time>` : ''}<p>${escapeHtml(currentSummary)}</p></section>
            ${area.pastWindow ? `<section class="is-past"><small>${escapeHtml(pastHeading)}</small>${pastWindow ? `<time>${escapeHtml(pastWindow)}</time>` : ''}<p>${escapeHtml(pastSummary)}</p></section>` : ''}
            ${area.nextWindow ? `<section class="is-next"><small>${escapeHtml(nextHeading)}</small>${nextWindow ? `<time>${escapeHtml(nextWindow)}</time>` : ''}<p>${escapeHtml(nextSummary)}</p></section>` : ''}
            <section class="is-action"><small>What to do now</small><p>${escapeHtml(customerImpactText(area.action || ''))}</p></section>
            ${watchFor ? `<section class="is-watch"><small>Be careful about</small><p>${escapeHtml(watchFor)}</p></section>` : ''}
            ${area.limit ? `<section class="is-limit"><small>Keep in mind</small><p>${escapeHtml(customerImpactText(area.limit))}</p></section>` : ''}
          </div>
        </details>`;
      }).join('')}</div>
    </section>` : '';
  return `<div class="mahakundli-report${isPersonalImpactV3 ? ' mahakundli-report--impact-v3' : ''}">
    <section class="mahakundli-report__hero">
      <div class="mahakundli-report__hero-copy">
        <div class="mahakundli-kicker">${state.deliveryAccessType === 'charity_grant' ? 'Complimentary access · Complete Mahakundli' : 'Payment confirmed · Complete Mahakundli'}</div>
        <h1>${escapeHtml(paidHeadline || model.headline || `${formatName(state.answers.name)}’s Complete Mahakundli`)}</h1>
        <p>${escapeHtml(plainMahakundliText(model.summary || 'Your complete Vedic life report, with the reason behind every calculated answer.'))}</p>
        <div class="mahakundli-report__meta"><span>${escapeHtml(precision.label || 'Report precision')}</span><span>As of ${escapeHtml(mahakundliReportDate(model.asOf))}</span><span>${quality.sectionCount || 0} report sections</span></div>
      </div>
      ${mahakundliWheelMarkup()}
    </section>

    <nav class="mahakundli-report__nav" aria-label="Mahakundli report sections">
      ${isPersonalImpactV3
        ? `<a href="#mk-life">Your 17 answers</a><a href="#mk-plan">Your action plan</a><a href="#mk-chart">Calculation details</a>${precision.timed ? '<a href="#mk-timing">Timing method</a>' : '<a href="#mk-numbers">Your numbers</a>'}<a href="#mk-method">How we checked it</a>`
        : precision.timed
          ? '<a href="#mk-chart">Your kundli</a><a href="#mk-timing">Timing</a><a href="#mk-life">Every life area</a><a href="#mk-plan">Your plan</a><a href="#mk-method">How we checked it</a>'
          : '<a href="#mk-chart">Your kundli</a><a href="#mk-numbers">Your numbers</a><a href="#mk-life">Every life area</a><a href="#mk-plan">Your plan</a><a href="#mk-method">How we checked it</a>'}
    </nav>

    ${v3LifeAreaMarkup}
    ${isPersonalImpactV3 ? '<div class="mahakundli-report__technical-divider"><small>Calculation details</small><b>The personal answers are above. The detailed kundli calculations follow below.</b></div>' : ''}

    <section id="mk-chart" class="mahakundli-report__section">
      <div class="mahakundli-report__heading"><small>Your kundli</small><h2>${precision.timed ? 'Your birth details and three key placements' : 'Your birth details and stable graha facts'}</h2><p>${escapeHtml(plainMahakundliText(snapshot.summary || precision.note || ''))}</p></div>
      <div class="mahakundli-report__anchors">${precision.timed ? `
        <article><small>Lagna (Ascendant)</small><b>${escapeHtml(snapshot.ascendant ? mahakundliRashiName(snapshot.ascendant) : 'Not shown')}</b><span>${snapshot.ascendant ? 'Your approach and 1st house' : escapeHtml(precisionNeed)}</span></article>
        <article><small>Chandra (Moon)</small><b>${escapeHtml(snapshot.moonSign ? mahakundliRashiText(snapshot.moonSign) : 'Not shown')}</b><span>${escapeHtml(snapshot.moonNakshatra ? `${snapshot.moonNakshatra} · pada ${snapshot.moonNakshatraPada}` : 'Time-sensitive result not shown')}</span></article>
        <article><small>Surya (Sun)</small><b>${escapeHtml(snapshot.sunSign ? mahakundliRashiText(snapshot.sunSign) : 'Not shown')}</b><span>Confidence, authority and leadership</span></article>` : `
        ${snapshot.moonSign ? `<article><small>Chandra (Moon)</small><b>${escapeHtml(mahakundliRashiText(snapshot.moonSign))}</b><span>${escapeHtml(snapshot.moonNakshatra || 'Same rashi throughout the date')}</span></article>` : ''}
        ${snapshot.sunSign ? `<article><small>Surya (Sun)</small><b>${escapeHtml(mahakundliRashiText(snapshot.sunSign))}</b><span>Same rashi throughout the date</span></article>` : ''}
        <article><small>Graha rashis unchanged all day</small><b>${planets.filter((item) => String(item.dignity || '').startsWith('Same rashi throughout the date')).length} of 9</b><span>Checked from the start to the end of the date</span></article>`}</div>
      <div class="mahakundli-report__birth-grid">
        <span><small>Name</small><b>${escapeHtml(snapshot.name || state.answers.name || '')}</b></span>
        <span><small>Birth date</small><b>${escapeHtml(snapshot.dob || state.answers.dob || '')}</b></span>
        <span><small>Birth time</small><b>${escapeHtml(snapshot.birthTime || state.answers.birthTime || '')}</b></span>
        <span><small>Birthplace</small><b>${escapeHtml(snapshot.place || state.answers.place || '')}</b></span>
      </div>
      ${model.panchanga ? `<article class="mahakundli-report__panchanga"><div><small>Birth Panchanga</small><h3>${escapeHtml(model.panchanga.weekday)} · ${escapeHtml(model.panchanga.tithi)}</h3></div><span><small>Yoga</small><b>${escapeHtml(model.panchanga.yoga)}</b></span><span><small>Karana</small><b>${escapeHtml(model.panchanga.karana)}</b></span><span><small>Paksha</small><b>${escapeHtml(model.panchanga.paksha)}</b></span></article>` : ''}
    </section>

    <section class="mahakundli-report__section">
      <div class="mahakundli-report__heading"><small>${precision.timed ? 'All 9 grahas' : 'Birth-date result'}</small><h2>${precision.timed ? 'All nine grahas in plain words' : 'Only stable graha facts are shown'}</h2><p>${precision.timed
        ? 'Each graha represents a theme; its rashi shows how it acts, and its house shows the life area affected.'
        : precision.envelopeScope === 'global-calendar-date'
          ? `${Number(precision.envelopeSampleCount) || 51} hourly checks covered all possible times worldwide for the entered birth date. Exact degrees and anything that changed are not shown.`
          : `The full local birth date was checked at intervals no wider than ${Number(precision.envelopeCertification?.maxGapMinutes) || 60} minutes. A graha close to a rashi change is kept as a two-rashi range.`}</p></div>
      <div class="mahakundli-report__planet-grid">${planets.map((item) => `<article>
        <div><span>${escapeHtml(mahakundliPlanetName(item.planet))}</span><b>${escapeHtml(mahakundliRashiText(item.sign))}${Number.isFinite(item.degree) ? ` ${Number(item.degree).toFixed(2)}°` : ''}</b></div>
        <small>${item.house ? `${mahakundliOrdinal(item.house)} house · ` : ''}${escapeHtml(item.dignity || '')}${item.retrograde ? ' · Retrograde' : ''}</small>
        <p>${escapeHtml(plainMahakundliText(item.meaning || ''))}</p>
      </article>`).join('')}</div>
    </section>

    ${!precision.timed ? `<section id="mk-numbers" class="mahakundli-report__section">
      <div class="mahakundli-report__heading"><small>Your birth and name numbers</small><h2>Numbers that do not need a birth time</h2><p>${escapeHtml(plainMahakundliText(numerology.personalYearLine || 'Your birth date and entered name add a second view of your habits and this year’s priorities.'))}</p></div>
      <div class="mahakundli-report__anchors">
        <article><small>Birth Number</small><b>${escapeHtml(numerology.birthNumber ?? '')}</b><span>${escapeHtml(plainMahakundliText(numerology.birthLine || ''))}</span></article>
        <article><small>Destiny Number</small><b>${escapeHtml(numerology.destinyNumber ?? numerology.lifePath ?? '')}</b><span>${escapeHtml(plainMahakundliText(numerology.destinyLine || numerology.lifePathLine || ''))}</span></article>
        ${numerology.chaldeanNameNumber ? `<article><small>Chaldean Name Number</small><b>${escapeHtml(numerology.chaldeanCompound ? `${numerology.chaldeanCompound}/${numerology.chaldeanNameNumber}` : numerology.chaldeanNameNumber)}</b><span>${escapeHtml(plainMahakundliText(numerology.nameLine || ''))}</span></article>` : ''}
      </div>
      <div class="mahakundli-report__withheld">${escapeHtml(bothBirthDetailsUnresolved
        ? 'This Mahakundli includes the graha rashis that remain the same throughout the date, your numbers, major gochara and practical life guidance. Personal houses, varga charts and dasha dates need a reliable birth time and a matched birthplace.'
        : placeLimited
          ? 'This Mahakundli includes the graha rashis that remain the same throughout the date, your numbers, major gochara and practical life guidance. Personal houses, varga charts and dasha dates need a matched birthplace.'
          : 'This Mahakundli includes the graha rashis that remain the same throughout the date, your numbers, major gochara and practical life guidance. Lagna, houses, varga charts and personal dasha dates need an exact birth time.')} Use the life-area cards as practical guidance for current choices. Important health, legal and money decisions still need qualified advice.</div>
    </section>` : ''}

    ${precision.timed ? `<section class="mahakundli-report__section">
      <div class="mahakundli-report__heading"><small>All 12 houses</small><h2>Your 12 houses and their life areas</h2><p>${precision.timed ? 'Whole-sign houses counted from your timed Lagna.' : escapeHtml(housesWithheldCopy)}</p></div>
      <div class="mahakundli-report__house-grid">${houses.map((item) => `<article class="${item.sign ? '' : 'is-withheld'}">
        <span>${item.house}</span><div><small>${escapeHtml(item.sign ? mahakundliRashiName(item.sign) : 'Not shown')}</small><h3>${escapeHtml(plainMahakundliText(item.meaning || ''))}</h3><p>${item.sign ? `Ruling graha: ${escapeHtml(mahakundliPlanetName(item.lord))} · Grahas placed here: ${escapeHtml((item.occupants || []).map(mahakundliPlanetName).join(', ') || 'none')} · Graha aspects: ${escapeHtml((item.aspects || []).map(mahakundliPlanetName).join(', ') || 'none')}` : escapeHtml(`${precisionNeed}.`)}</p></div>
      </article>`).join('')}</div>
    </section>

    <section class="mahakundli-report__section">
      <div class="mahakundli-report__heading"><small>Varga charts</small><h2>${divisionalCharts.length ? '7 focused views of important life areas' : escapeHtml(vargaWithheldTitle)}</h2><p>${divisionalCharts.length ? 'D2, D3, D4, D7, D9, D10 and D12 add detail after the main kundli. No varga chart is used alone to make a prediction.' : escapeHtml(vargaWithheldCopy)}</p></div>
      ${divisionalCharts.length ? `<div class="mahakundli-report__varga-grid">${divisionalCharts.map((item) => `<article>
        <div><span>${escapeHtml(item.key)}</span><small>${escapeHtml(item.label)}</small></div>
        <h3>${escapeHtml(item.focus)}</h3>
        <b>Lagna ${escapeHtml(mahakundliRashiName(item.ascendant))}</b>
        <p>${escapeHtml(plainMahakundliText(item.summary))}</p>
        <em>${escapeHtml(plainMahakundliText(item.limit))}</em>
      </article>`).join('')}</div>` : `<div class="mahakundli-report__withheld">${escapeHtml(vargaWithheldDetail)}</div>`}
    </section>

    <section class="mahakundli-report__section mahakundli-report__conditions">
      <div class="mahakundli-report__heading"><small>Yogas and doshas</small><h2>Only the combinations your kundli actually shows</h2><p>A yoga can strengthen a theme. A dosha or caution asks for care. Neither promises an event.</p></div>
      <div class="mahakundli-report__condition-grid">
        <div><h3>Yogas present</h3>${yogas.length ? yogas.map((item) => `<article><b>${escapeHtml(plainMahakundliText(item.name))}</b><p>${escapeHtml(plainMahakundliText(item.condition))}</p><small>Condition present</small></article>`).join('') : precision.timed ? '<p>None of the named yogas checked was present.</p>' : `<p>Not shown because ${escapeHtml(precision.cause || 'the kundli uses birth-date facts only')}.</p>`}</div>
        <div><h3>Doshas and cautions</h3>${cautions.length ? cautions.map((item) => `<article><b>${escapeHtml(plainMahakundliText(item.name))}</b><p>${escapeHtml(plainMahakundliText(item.condition))}</p><small>Condition present</small></article>`).join('') : precision.timed ? '<p>None of the caution conditions checked was present.</p>' : `<p>Not shown because ${escapeHtml(precision.cause || 'the kundli uses birth-date facts only')}.</p>`}</div>
      </div>
    </section>

    <section id="mk-timing" class="mahakundli-report__section mahakundli-report__timing">
      <div class="mahakundli-report__heading"><small>${dasha.available ? 'Your current dasha' : 'Dasha timing'}</small><h2>${dasha.available ? 'Mahadasha, Antardasha and Pratyantardasha' : 'Personal dasha periods are not shown'}</h2><p>${escapeHtml(plainMahakundliText(dasha.synthesis || dasha.meaning || dasha.message || ''))}</p></div>
      ${dasha.available ? `<div class="mahakundli-report__dasha-stack">
        <article><small>Wider period</small><b>${escapeHtml(mahakundliPlanetName(dasha.maha.lord))} Mahadasha</b><span>${escapeHtml(mahakundliReportDate(dasha.maha.start))} – ${escapeHtml(mahakundliReportDate(dasha.maha.end))}</span><p>${escapeHtml(plainMahakundliText(dasha.maha.meaning || ''))}</p></article>
        ${dasha.antar ? `<article><small>Active sub-period</small><b>${escapeHtml(mahakundliPlanetName(dasha.antar.lord))} Antardasha</b><span>${escapeHtml(mahakundliReportDate(dasha.antar.start))} – ${escapeHtml(mahakundliReportDate(dasha.antar.end))}</span><p>${escapeHtml(plainMahakundliText(dasha.antar.meaning || ''))}</p></article>` : ''}
        ${dasha.pratyantar ? `<article><small>Right now</small><b>${escapeHtml(mahakundliPlanetName(dasha.pratyantar.lord))} Pratyantardasha</b><span>${escapeHtml(mahakundliReportDate(dasha.pratyantar.start))} – ${escapeHtml(mahakundliReportDate(dasha.pratyantar.end))}</span><p>${escapeHtml(plainMahakundliText(dasha.pratyantar.meaning || ''))}</p></article>` : ''}
      </div>` : `<div class="mahakundli-report__withheld">${escapeHtml(dasha.message || precision.note || '')}</div>`}
      ${timeline.length ? `<details class="mahakundli-report__timeline"><summary><span>Your full Vimshottari timeline</span><i>See ${timeline.length} periods</i></summary><div>${timeline.map((item) => `<span><b>${escapeHtml(mahakundliPlanetName(item.lord))}</b><small>${escapeHtml(mahakundliReportDate(item.start))} – ${escapeHtml(mahakundliReportDate(item.end))}</small><em>${escapeHtml(plainMahakundliText(item.meaning || ''))}</em></span>`).join('')}</div></details>` : ''}
    </section>` : ''}

    <section class="mahakundli-report__section">
      <div class="mahakundli-report__heading"><small>Major gochara (transits)</small><h2>Transits now and for the next 3 years</h2><p>${escapeHtml(plainMahakundliText(transits.summary || ''))}</p></div>
      <div class="mahakundli-report__transit-current">${(transits.current || []).map((item) => `<article><small>${escapeHtml(mahakundliPlanetName(item.planet))}</small><b>${escapeHtml(mahakundliRashiName(item.sign))} ${Number(item.degree || 0).toFixed(2)}°</b><span>${item.retrograde ? 'Retrograde' : 'Direct'}${item.house ? ` · ${mahakundliOrdinal(item.house)} house` : ''}</span><p>${escapeHtml(plainMahakundliText(item.meaning || ''))} ${escapeHtml(plainMahakundliText(item.motionMeaning || ''))}</p><em>What to do: ${escapeHtml(plainMahakundliText(item.action || ''))}</em></article>`).join('')}</div>
      ${(transits.ingresses || []).length ? `<details class="mahakundli-report__ingresses"><summary>Important sign changes · ${transits.ingresses.length}</summary><div>${transits.ingresses.map((item) => `<span><b>${escapeHtml(mahakundliPlanetName(item.planet))}</b><small>${escapeHtml(mahakundliRashiName(item.fromSign))} → ${escapeHtml(mahakundliRashiName(item.toSign))}</small><time>${escapeHtml(item.date || mahakundliReportDate(item.at))}</time>${precision.timed ? `<p>${escapeHtml(plainMahakundliText(item.meaning || ''))}</p>` : ''}</span>`).join('')}</div></details>` : ''}
      ${(transits.stations || []).length ? `<details class="mahakundli-report__ingresses"><summary>Retrograde and direct changes · ${transits.stations.length}</summary>${precision.timed ? '' : '<p>Motion guide: retrograde is for review; direct is for acting after checking the facts.</p>'}<div>${transits.stations.map((item) => `<span><b>${escapeHtml(mahakundliPlanetName(item.planet))}</b><small>Turns ${escapeHtml(item.motionAfter || '')}</small><time>${escapeHtml(item.date || mahakundliReportDate(item.at))}</time>${precision.timed ? `<p>${escapeHtml(plainMahakundliText(item.meaning || ''))} What to do: ${escapeHtml(plainMahakundliText(item.action || ''))}</p>` : ''}</span>`).join('')}</div></details>` : ''}
    </section>

    ${isPersonalImpactV3 ? '' : `<section id="mk-life" class="mahakundli-report__section mahakundli-report__life">
      <div class="mahakundli-report__heading"><small>All 17 life areas</small><h2>17 separate answers</h2><p>${birthDateLifeGuidance ? 'Open a life area for a birth-date pattern, one supporting fact, a broad current focus and a practical action.' : 'Open a life area for the answer, reason, timing, caution, action and what astrology cannot decide.'}</p></div>
      <div class="mahakundli-report__life-stack">${lifeAreas.map((area, index) => `<details class="mahakundli-report__life-card signal-${escapeHtml(area.signal || '')}" ${index < 2 ? 'open' : ''}>
        <summary><div><small>${escapeHtml(signalLabel[area.signal] || area.signal || '')}</small><h3>${escapeHtml(area.label || '')}</h3><p>${escapeHtml(plainMahakundliText(area.answer || ''))}</p></div><i aria-hidden="true">+</i></summary>
        <div class="mahakundli-report__life-body">
          ${area.countText ? `<section><small>Your full-life indication</small><p>${escapeHtml(plainMahakundliText(area.countText))}</p></section>` : ''}
          ${area.contextText ? `<section><small>What this can mean for you</small><p>${escapeHtml(plainMahakundliText(area.contextText))}</p></section>` : ''}
          <section><small>${area.timingState === 'birth-date-guidance' ? 'What your birth date says' : 'Why this appears'}</small><p>${escapeHtml(plainMahakundliText(area.plainMeaning || ''))}</p>${area.timingState === 'birth-date-guidance' && area.supportingFact ? `<div><span>${escapeHtml(plainMahakundliText(area.supportingFact))}</span></div>` : (area.evidenceDetails || []).length ? `<div>${area.evidenceDetails.slice(0, 8).map((item) => `<span>${escapeHtml(plainMahakundliText(item))}</span>`).join('')}</div>` : ''}</section>
          <section><small>${area.timingState === 'birth-date-guidance' ? 'Broad focus now' : 'When'}</small><p>${escapeHtml(plainMahakundliText(area.timing || ''))}</p></section>
          ${area.timingState === 'birth-date-guidance' && (area.transitSignals || []).length ? `<section><small>Wider gochara now</small><p>${escapeHtml(plainMahakundliText(area.transitSignals[0].meaning || ''))}</p></section>` : ''}
          <section class="is-watch"><small>Watch for</small><p>${escapeHtml(plainMahakundliText((area.watchFor || []).join(' ')))}</p></section>
          <section class="is-action"><small>What to do</small><p>${escapeHtml(plainMahakundliText(area.action || ''))}</p></section>
          ${area.timingState === 'birth-date-guidance' ? '' : `<section class="is-limit"><small>What astrology cannot decide</small><p>${escapeHtml(plainMahakundliText(area.limit || ''))}</p></section>`}
        </div>
      </details>`).join('')}</div>
    </section>`}

    <section id="mk-plan" class="mahakundli-report__section mahakundli-report__plan">
      <div class="mahakundli-report__heading"><small>Your next steps</small><h2>${phases.length ? 'Your next 3 periods and 90-day plan' : 'Your 90-day plan'}</h2><p>${phases.length ? 'Prepare before a period begins. Do not wait for a date to make a basic improvement.' : 'Use this plan without waiting for a personal date.'}</p></div>
      ${phases.length ? `<div class="mahakundli-report__phase-grid">${phases.map((phase) => `<article><span>${phase.order}</span><small>${escapeHtml(mahakundliReportDate(phase.start))} – ${escapeHtml(mahakundliReportDate(phase.end))}</small><h3>${escapeHtml([phase.maha, phase.antar, phase.pratyantar].map(mahakundliPlanetName).join('–'))}</h3><p>${escapeHtml(plainMahakundliText(phase.summary || ''))}</p></article>`).join('')}</div>` : ''}
      <div class="mahakundli-report__action-grid">${actionPlan.map((item, index) => `<article><span>${index + 1}</span><small>${escapeHtml(plainMahakundliText(item.period || ''))}</small><h3>${escapeHtml(plainMahakundliText(item.action || ''))}</h3><p>${escapeHtml(plainMahakundliText(item.purpose || ''))}</p></article>`).join('')}</div>
      ${remedies.length ? `<div class="mahakundli-report__remedies"><h3>Optional, practical upay</h3>${remedies.map((item) => `<p><b>${escapeHtml(item.planet ? mahakundliPlanetName(item.planet) : 'Precision')}</b>${escapeHtml(plainMahakundliText(item.practice || ''))}</p>`).join('')}</div>` : ''}
    </section>

    <section class="mahakundli-report__section">
      <div class="mahakundli-report__heading"><small>Simple meanings</small><h2>Astrology words used in your report</h2><p>Technical words appear only when they help explain your answer.</p></div>
      <div class="mahakundli-report__glossary">${glossary.map((item) => `<details><summary>${escapeHtml(plainMahakundliText(item.term))}</summary><p>${escapeHtml(plainMahakundliText(item.meaning))}</p></details>`).join('')}</div>
    </section>

    <section id="mk-method" class="mahakundli-report__section mahakundli-report__method">
      <div class="mahakundli-report__heading"><small>How we checked your report</small><h2>What we calculated and what astrology cannot claim</h2><p>We linked every calculated conclusion to the calculation used for it. General guidance and results that cannot be shown are labelled clearly.</p></div>
      <div class="mahakundli-report__quality-grid">
        <span><small>Library</small><b>${escapeHtml(`${receipt.library || ''} ${receipt.libraryVersion || ''}`.trim() || 'Calculation receipt')}</b></span>
        <span><small>Planetary calculation</small><b>${escapeHtml(receipt.ephemeris || '')}</b></span>
        <span><small>Ayanamsa</small><b>${escapeHtml(receipt.ayanamsa || '')}</b></span>
        <span><small>House system</small><b>${escapeHtml(receipt.houseSystem || '')}</b></span>
        <span><small>Answer checks</small><b>Each available answer shows its basis</b></span>
        <span><small>Reliability</small><b>Unsupported results are not shown</b></span>
      </div>
      <p class="mahakundli-report__limit">${escapeHtml(plainMahakundliText(full.disclaimer || 'Vedic astrology is a traditional guide for planning. Keep your judgement and use qualified professional care for important decisions.'))}</p>
    </section>
    ${paidDeliveryMarkup(full, pdfUrl, { completePdfLabel: true, includeShare: false })}
  </div>`;
}

function renderPaidState() {
  const charityGrantAccess = isCharityGrantAccess();
  if (state.full && !paidReturnRefreshPending) {
    if (!charityGrantAccess) rememberPaidReading();
    const full = state.full;
    const web = full.web || {};
    const pdfUrl = web.pdfUrl || full.pdfUrl || '';
    const rawHeadline = web.headline || full.headline || full.title || '';
    const paidHeadline = rawHeadline && !removedReportText(rawHeadline) ? rawHeadline : laneConfig()?.product;
    const synthesis = web.synthesis && !removedReportText(web.synthesis) ? web.synthesis : '';
    if (!charityGrantAccess) {
      trackOnce('sharePromptView', 'share_prompt_view', {
        share_id: state.shareCode,
        default_variant: state.shareResultVisible ? 'reveal' : 'mystery'
      });
    }
    const isPalmLifeReport = state.lane === 'palm_answers';
    const isFaceLifeReport = state.lane === 'face_answers';
    const isMahakundliReport = state.lane === 'mahakundli';
    const nextReadingRecommendation = !IS_GLOBAL_STOREFRONT && !charityGrantAccess && isPalmLifeReport
      ? nextReadingRecommendationMarkup(full)
      : '';
    const nextReadingRecommendationTeaser = !IS_GLOBAL_STOREFRONT && !charityGrantAccess && isPalmLifeReport
      ? nextReadingRecommendationTeaserMarkup(full)
      : '';
    const paidContent = IS_GLOBAL_STOREFRONT && isPalmLifeReport
      ? globalPalmPaidReportMarkup(full, pdfUrl)
      : isMahakundliReport
      ? mahakundliPaidReportMarkup(full, paidHeadline, pdfUrl)
      : isPalmLifeReport
      ? `${palmLifeTimelineMarkup(full, paidHeadline, synthesis, nextReadingRecommendationTeaser)}
        ${paidDeliveryMarkup(full, pdfUrl, { recommendation: nextReadingRecommendation })}`
      : isFaceLifeReport
        ? facePaidReportMarkup(full, paidHeadline, synthesis, pdfUrl)
        : `<div class="kicker center">Payment confirmed</div>
          <h1 class="paid-title">${escapeHtml(paidHeadline || `${formatName(state.answers.name)}’s report`)}</h1>
          <p class="hero-subtitle">Your complete report is below.</p>
          <div class="paid-card">${paidSections(full)}${synthesis ? `<div class="paid-section"><small>How it comes together</small><p>${escapeHtml(synthesis)}</p></div>` : ''}</div>
          ${paidDeliveryMarkup(full, pdfUrl)}
          ${state.lane === 'market_profile' ? '<div class="method-note">This is not investment advice. It cannot identify a security, profitable date or expected return. Use independent research and a SEBI-registered professional for personalized guidance.</div>' : ''}`;
    show(`<div data-testid="paid-report" class="${isMahakundliReport ? 'paid-report--mahakundli' : isPalmLifeReport ? IS_GLOBAL_STOREFRONT ? 'paid-report--palm-global' : 'paid-report--palm-life' : isFaceLifeReport ? 'paid-report--face-life' : ''}">
      ${paidContent}
    </div>`);
    if (!IS_GLOBAL_STOREFRONT && !charityGrantAccess) setupNextReadingRecommendationExposure();
    return;
  }

  if (charityGrantAccess || IS_CHARITY_GRANT_RETURN) {
    show(`<div class="analysis-screen" data-testid="charity-grant-recovery">
      <div class="kicker center">Complimentary access</div>
      <div class="analysis-orbit"><span>✦</span></div>
      <h1 class="question-title center">Your private Mahakundli report is safe.</h1>
      <p class="question-copy center">${state.fullLoading ? 'Loading your complete report now…' : 'The report did not load yet. No payment is required.'}</p>
      ${state.paymentError ? `<div class="error-card">${escapeHtml(state.paymentError)}</div>` : ''}
      ${state.fullLoading ? '' : '<button class="primary-button" type="button" data-action="retry-report">Try loading my report</button>'}
    </div>`);
    if (!state.fullLoading && !state.paymentError) requestAnimationFrame(loadFullReading);
    return;
  }

  show(`<div class="analysis-screen" data-testid="paid-recovery">
    <div class="kicker center">Payment confirmed</div>
    <div class="analysis-orbit"><span>✓</span></div>
    <h1 class="question-title center">Your paid report is safe.</h1>
    <p class="question-copy center">${state.fullLoading ? 'Loading your full report now…' : 'The report did not load yet. You will not be charged again.'}</p>
    ${state.paymentError ? `<div class="error-card">${escapeHtml(state.paymentError)}</div>` : ''}
    ${state.fullLoading ? '' : '<button class="primary-button" type="button" data-action="retry-report">Try loading my paid report</button>'}
    ${paidDownloadLinksMarkup({ invoice: state.pendingInvoice }, '')}
    ${postPurchaseEmail()}
  </div>`);
  if (!state.fullLoading && !state.paymentError) requestAnimationFrame(loadFullReading);
}

async function savePostPurchaseEmail() {
  if (IS_GLOBAL_STOREFRONT || isCharityGrantSession()) return;
  const input = document.getElementById('postPurchaseEmail');
  const host = document.getElementById('emailMessage');
  const email = String(input?.value || '').trim();
  if (!/.+@.+\..+/.test(email)) {
    if (host) host.innerHTML = '<div class="error-card">Enter a valid email address.</div>';
    return;
  }
  const button = stage.querySelector('[data-action="save-email"]');
  if (button) {
    button.disabled = true;
    button.textContent = 'Saving…';
  }
  try {
    const result = await api('/api/lead', {
      readingId: state.readingId,
      name: formatName(state.answers.name),
      email,
      phone: '',
      consent: true,
      postPurchase: true,
      tracking: trackingData()
    });
    if (result.reportEmailStatus !== 'sent') {
      if (button) {
        button.disabled = false;
        button.textContent = 'Try emailing again';
      }
      if (host) host.innerHTML = '<div class="error-card">Your email was saved, but the copy could not be sent yet. Keep this page open or use the PDF button above.</div>';
      track('post_purchase_email_delivery_failed', { status: result.reportEmailStatus || 'unknown' });
      return;
    }
    state.emailSaved = true;
    persist();
    track('post_purchase_email_saved', { has_email: 'yes' });
    render();
  } catch (error) {
    if (button) {
      button.disabled = false;
      button.textContent = 'Email my report';
    }
    if (host) host.innerHTML = `<div class="error-card">${escapeHtml(error.message || 'Email could not be saved. Please try again.')}</div>`;
  }
}

function resetPalmForRetry() {
  state.scanRunId = '';
  state.palmFile = null;
  state.palmDetection = null;
  state.palmImageSize = null;
  state.palmUploadError = '';
  if (state.palmPreviewUrl) URL.revokeObjectURL(state.palmPreviewUrl);
  state.palmPreviewUrl = '';
  persist();
  go(palmCaptureScreen(), 'palm_retry');
}

function render() {
  if (LOCAL_PALM_PAYWALL_PREVIEW) prepareLocalPalmPaywallPreview();
  if (LOCAL_PALM_PAID_PREVIEW) prepareLocalPalmPaidPreview();
  if (LOCAL_NAME_PAYWALL_PREVIEW) prepareLocalNamePaywallPreview();
  const keepsPalmPaywallVisit = (
    ['palm_answers', 'mahakundli'].includes(state.lane)
    || Boolean(verifiedPalmAdditionalReportPaywallIdentity())
  )
    && state.screen === 'unlock'
    && !hasFullReportAccess()
    && !IS_PAID_RETURN
    && !IS_CHARITY_GRANT_RETURN;
  if (keepsPalmPaywallVisit) {
    if (state.lane === 'palm_answers') ensurePalmNameAlignmentSelection();
  } else {
    finishPalmPaywallVisit(state.paid ? 'paid_report' : 'screen_change');
  }
  setChrome();
  if (LOCAL_PALM_SCAN_PREVIEW) {
    renderPalmScanPreview();
    return;
  }
  if (LOCAL_PALM_PROOF_PREVIEW) {
    renderPalmProofPreview();
    return;
  }
  if (LOCAL_PALM_MOUNT_PREVIEW) {
    renderPalmMountPreview();
    return;
  }
  if (LOCAL_PALM_PAYWALL_PREVIEW) {
    renderLocalPalmPaywallPreview();
    return;
  }
  if (LOCAL_PALM_PAID_PREVIEW) {
    renderLocalPalmPaidPreview();
    return;
  }
  if (LOCAL_NAME_PAYWALL_PREVIEW) {
    renderLocalNamePaywallPreview();
    return;
  }
  trackScreenView();
  const renderer = {
    intro: renderLanding,
    confirmdetails: renderAdditionalReportConfirm,
    marketsegment: renderMarketSegmentation,
    nameproof: renderNameProof,
    dob: renderDob,
    time: renderTime,
    place: renderPlace,
    residence: renderGlobalCheckoutDetails,
    scope: renderScope,
    name: renderName,
    palmoffer: renderPalmOffer,
    palmupload: renderPalmUpload,
    palmscan: renderPalmScan,
    palmproof: renderPalmProof,
    facescan: renderFaceScan,
    faceproof: renderFaceProof,
    analysis: renderAnalysis,
    unlock: renderUnlock
  }[state.screen];
  (renderer || renderLanding)();
  enhanceFacePaywall();
  const focusTarget = {
    dob: 'dobDay',
    place: 'placeInput',
    name: 'nameInput'
  }[state.screen];
  const requestedFocusTarget = focusTimeHourOnNextRender && state.screen === 'time'
    ? 'timeHour'
    : focusTarget;
  focusTimeHourOnNextRender = false;
  if (requestedFocusTarget) {
    const input = document.getElementById(requestedFocusTarget);
    if (input && !input.disabled) input.focus({ preventScroll: true });
    if (requestedFocusTarget === 'timeHour') setTimeout(ensureBirthTimeInputVisible, 80);
  }
  resumePendingPlaceLookupAfterRender();
}

stage.addEventListener('click', (event) => {
  const palmEvidence = event.target.closest('[data-paywall-section="palm_proof"]');
  if (
    palmEvidence
    && state.lane === 'palm_answers'
    && state.screen === 'unlock'
    && !state.paid
  ) {
    trackOnce('palmPaywallEvidenceClick', 'palm_paywall_evidence_click', {
      interaction: 'noninteractive_evidence',
      evidence_copy_version: 'palm_evidence_included_v1',
      proof_density_variant: activePalmProofDensityVariant(),
      clicked_element: String(event.target?.tagName || '').toLowerCase().slice(0, 24)
    });
  }
  const target = event.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;
  const value = target.dataset.value || '';
  track('quiz_interaction', { action, value });

  if (action === 'show-name-alignment-offer') {
    const offer = stage.querySelector('[data-name-alignment-offer]');
    if (offer) {
      // Restart the highlight even on a repeat tap. This forces a synchronous
      // reflow, so it must happen before the smooth scroll starts — reflowing
      // mid-animation cancels it and the page never moves.
      offer.classList.remove('is-highlighted');
      void offer.offsetWidth;
      offer.classList.add('is-highlighted');
      scrollPaywallElementIntoView(offer);
      window.setTimeout(() => offer.classList.remove('is-highlighted'), 1800);
      track('palm_name_offer_teaser_click', palmPaywallVisitProperties({
        selected: palmNameAlignmentIsSelected(),
        placement: 'top_checkout'
      }));
    }
    return;
  }
  if (action === 'choose-lane') selectDefaultLane(value);
  else if (action === 'start-lane') startAdvertisedLane();
  else if (action === 'start-global-age-check' && IS_GLOBAL_STOREFRONT) {
    startQuiz(LANES.palm_answers.startAnswer, { deferQuizStart: true });
    state.globalAgeCheckError = '';
    persist();
    go('dob', 'adult_check');
  }
  else if (action === 'start-market-profile') {
    if (
      state.lane === 'market_profile'
      && state.marketLandingVariant === MARKET_LANDING_TREATMENT_VARIANT
    ) {
      startQuiz(LANES.market_profile.startAnswer, { deferQuizStart: true });
      go('marketsegment', 'start');
    }
  }
  else if (action === 'choose-market-profile') {
    const allowed = ['active', 'long_term', 'both', 'starting'];
    if (allowed.includes(value)) {
      state.answers.marketExperience = value;
      startQuiz(`${LANES.market_profile.startAnswer}_${value}`);
      track('market_profile_selected', {
        market_experience: value,
        entry_surface: state.screen === 'marketsegment' ? 'segment' : 'landing'
      });
      persist();
      if (state.additionalReportPrefillVersion && state.additionalReportPrefillConfirmed) {
        go(state.reuseParentPalm ? 'analysis' : 'palmoffer', 'confirmed_prefill');
      } else {
        go('dob', 'start');
      }
    }
  }
  else if (action === 'start-name-numerology') {
    const name = formatName(document.getElementById('landingNameInput')?.value);
    if (name.length >= 2 && clientNameBreakdown(name).letters.length >= 2) {
      state.answers.name = name;
      trackOnce('nameSubmit', 'name_submit', {
        entry_position: 'landing',
        cta_placement: 'landing_hero',
        character_count: name.length,
        letter_count: clientNameBreakdown(name).letters.length
      });
      startQuiz(LANES.name_numerology.startAnswer);
      track('quiz_answer', { step: 'name', value: 'completed', entry_position: 'landing' });
      persist();
      go('nameproof', 'start');
    }
  }
  else if (action === 'continue-name-proof') go('dob', 'number_revealed');
  else if (action === 'save-dob') completeDobStep();
  else if (action === 'save-time') completeTimeStep();
  else if (action === 'unknown-time') {
    state.answers.birthTime = 'unknown';
    state.birthTimeDraft = null;
    track('quiz_answer', { step: 'birth_time', value: 'unknown' });
    persist();
    next();
  } else if (action === 'save-place' && birthplaceReady()) {
    state.answers.place = normalizedTypedBirthplace(
      state.answers.place || state.answers.location?.place || state.answers.location?.label
    );
    if (!hasResolvedBirthplace()) {
      track('quiz_answer', {
        step: 'birth_place',
        value: 'typed_for_server_match',
        character_count: state.answers.place.length
      });
    }
    cancelPlaceLookup();
    maybeTrackBirthComplete();
    persist();
    next();
  }
  else if (action === 'choose-place') choosePlace(Number(target.dataset.index));
  else if (action === 'choose-scope') {
    state.answers.locationScope = value;
    track('quiz_answer', { step: 'location_scope', value });
    persist();
    updateCityChoiceState(target.closest('[data-testid="scope-options"]'), value);
  }
  else if (action === 'choose-city-priority') {
    const allowed = ['overall', 'career', 'money', 'relationships'];
    if (allowed.includes(value)) {
      state.answers.cityPriority = value;
      track('quiz_answer', { step: 'city_priority', value });
      persist();
      updateCityChoiceState(target.closest('[data-testid="city-priority-options"]'), value);
    }
  }
  else if (action === 'continue-city-scope') {
    const hasScope = ['India first', 'India and abroad'].includes(state.answers.locationScope);
    const hasPriority = ['overall', 'career', 'money', 'relationships'].includes(String(state.answers.cityPriority || '').toLowerCase());
    if (hasScope && hasPriority) {
      track('quiz_answer', {
        step: 'city_scope_priority',
        value: 'completed',
        location_scope: state.answers.locationScope,
        city_priority: state.answers.cityPriority
      });
      next();
    }
  }
  else if (action === 'save-name') {
    const name = formatName(document.getElementById('nameInput')?.value);
    if (name.length >= 2) {
      state.answers.name = name;
      track('quiz_answer', { step: 'name', value: 'completed' });
      maybeTrackBirthComplete();
      persist();
      next();
    }
  } else if (action === 'choose-palm') {
    if (IS_GLOBAL_STOREFRONT && !usableGlobalAgeCheck()) {
      state.globalAgeCheckToken = '';
      state.globalAgeCheckExpiresAt = '';
      state.globalAgeCheckError = 'Confirm that you are 18 or older before choosing a palm photo.';
      persist();
      go('dob', 'age_check_required');
      return;
    }
    choosePalmPhoto(target.dataset.input || 'palmInput');
  } else if (action === 'open-palm-camera') {
    if (IS_GLOBAL_STOREFRONT && !usableGlobalAgeCheck()) {
      state.globalAgeCheckToken = '';
      state.globalAgeCheckExpiresAt = '';
      state.globalAgeCheckError = 'Confirm that you are 18 or older before opening the camera.';
      persist();
      go('dob', 'age_check_required');
      return;
    }
    openPalmCamera();
  } else if (action === 'choose-face') {
    chooseFacePhoto(target.dataset.input || 'landingFaceInput');
  } else if (action === 'open-face-camera') {
    openFaceCamera();
  } else if (action === 'add-market-palm') {
    state.answers.palmChoice = 'added';
    track('palm_offer_accepted', { optional: true });
    persist();
    go('palmupload', 'palm_optional_added');
  } else if (action === 'skip-market-palm') {
    state.answers.palmChoice = 'skipped';
    state.palmDetection = null;
    track('palm_offer_skipped', { optional: true, from_screen: state.screen });
    persist();
    go('analysis', 'palm_optional_skipped');
  } else if (action === 'retry-palm') resetPalmForRetry();
  else if (action === 'accept-palm') {
    track('palm_result_accepted', {
      mapped_lines: palmLineNames().length,
      placement: target.dataset.placement || 'unknown',
      palm_result_cta_version: PALM_RESULT_CTA_VERSION
    });
    next();
  }
  else if (action === 'retry-face') resetFaceForRetry();
  else if (action === 'unlock-face-personality') startFacePersonalityCheckout();
  else if (action === 'continue-face-holistic') continueFaceHolisticReport();
  else if (action === 'accept-face') {
    track('face_result_accepted', { marker_count: faceObservationRows().length });
    // Keep only the tab-local object URLs long enough to repeat the mapped
    // face on the paywall. They are excluded from persisted/API state and are
    // still revoked on retry, refresh, navigation or pagehide.
    state.faceFile = null;
    state.faceImageSize = null;
    persist();
    next();
  }
  else if (action === 'retry-analysis') {
    locationLookupRetryCount = 0;
    state.analysisError = '';
    state.analysisRunning = false;
    render();
  } else if (action === 'review-analysis-details') {
    analysisRequestCancelledForNavigation = true;
    analysisRequestController?.abort();
    analysisRequestController = null;
    locationLookupRetryCount = 0;
    state.analysisError = '';
    state.analysisRunning = false;
    const analysisIndex = flow().indexOf('analysis');
    go(flow()[Math.max(0, analysisIndex - 1)] || 'intro', 'review_details');
  } else if (action === 'checkout') {
    const placement = target.dataset.placement || '';
    trackPalmPaywallCtaClick(placement);
    if (IS_GLOBAL_STOREFRONT) {
      state.checkoutPlacement = String(placement).slice(0, 24);
      state.paymentError = '';
      persist();
      go('residence', 'checkout_details');
    } else {
      startCheckout(placement);
    }
  }
  else if (action === 'continue-global-checkout') {
    captureGlobalCheckoutDetails();
    if (globalCheckoutDetailsComplete()) startCheckout(state.checkoutPlacement || 'residence');
  }
  else if (action === 'return-to-global-result') {
    state.paymentError = '';
    go('unlock', 'back');
  }
  else if (action === 'retry-dismissed-payment') {
    const recovery = trackPaymentDismissRecoveryAction('accidental_close', 'retry_same');
    if (recovery) startCheckout('dismiss_recovery', { retryTrigger: 'dismiss_prompt' });
  }
  else if (action === 'recover-dismissed-payment-gateway') {
    const recovery = trackPaymentDismissRecoveryAction('gateway_friction', 'open_cashfree_form');
    if (recovery) {
      state.cashfreeFallbackOpen = true;
      alternatePaymentFormNeedsFocus = true;
      track('checkout_fallback_option_opened', palmNameAlignmentExperimentAnalytics({
        provider: 'cashfree',
        previous_provider: 'razorpay',
        retry_trigger: 'dismiss_prompt_gateway',
        checkout_observability_version: CHECKOUT_OBSERVABILITY_VERSION,
        checkout_attempt_id: recovery.checkoutAttemptId,
        ...(recovery.recoveryRootAttemptId ? {
          checkout_recovery_root_attempt_id: recovery.recoveryRootAttemptId
        } : {}),
        checkout_attempt_number: recovery.attemptNumber
      }));
      persist();
      render();
    }
  }
  // Price and timing are different objections, and the prompt cannot tell them
  // apart unless the reader is given both. Neither changes what is offered: the
  // card closes back to the paywall and only the recorded reason differs.
  else if (action === 'reconsider-payment-price' || action === 'dismiss-payment-for-now') {
    const recovery = trackPaymentDismissRecoveryAction(
      action === 'reconsider-payment-price' ? 'price_objection' : 'intent_not_ready',
      'return_to_paywall'
    );
    if (recovery) {
      state.paymentDismissRecovery = null;
      persist();
      render();
    }
  }
  else if (action === 'show-cashfree-fallback') {
    state.cashfreeFallbackOpen = true;
    track('checkout_fallback_option_opened', { provider: 'cashfree' });
    persist();
    render();
  }
  else if (action === 'checkout-cashfree') {
    trackPalmPaywallCtaClick('cashfree');
    startCashfreeFallback();
  }
  else if (action === 'verify-pending') {
    trackPalmPaywallCtaClick(target.dataset.placement || 'verification');
    retryPendingVerification();
  }
  else if (action === 'retry-report') {
    state.paymentError = '';
    loadFullReading();
  } else if (action === 'save-email') savePostPurchaseEmail();
  else if (action === 'start-fresh') openFreshDialog();
  else if (action === 'go-home') goHome();
  else if (action === 'open-previous-report') openPreviousPaidReport();
  else if (action === 'open-previous-reading' || action === 'open-owned-reading') {
    openPreviousPaidReport(target.dataset.readingId, target.dataset.lane);
  }
  else if (action === 'show-owned-readings') {
    const list = target.parentElement?.querySelector('.next-reading-card__owned-list');
    if (list) {
      list.hidden = false;
      target.hidden = true;
    }
  }
  else if (action === 'open-next-reading-recommendation') openNextReadingRecommendation(target);
  else if (action === 'edit-prefill-field') editAdditionalReportPrefillField(value);
  else if (action === 'prefill-unknown-time') {
    state.answers.birthTime = 'unknown';
    state.prefillEditingFields = state.prefillEditingFields.filter((field) => field !== 'time');
    persist();
    render();
  }
  else if (action === 'confirm-additional-report-details') confirmAdditionalReportDetails();
  else if (action === 'share-mode') setShareMode(value);
  else if (action === 'share-menu') shareFromMenu(target);
  else if (action === 'share-whatsapp') shareOnWhatsApp();
  else if (action === 'save-story-card') saveStoryCard(target);
  else if (action === 'copy-share-link') copyShareLink();
});

stage.addEventListener('input', (event) => {
  const input = event.target;
  let autoAdvance = null;
  if (input.id === 'prefillName') {
    state.answers.name = input.value;
    persist();
  } else if (input.id === 'prefillDob') {
    state.answers.dob = input.value;
    persist();
  } else if (input.id === 'prefillTime') {
    state.answers.birthTime = input.value;
    persist();
  } else if (['dobDay', 'dobMonth', 'dobYear'].includes(input.id)) {
    if (input.id === 'dobYear') input.value = input.value.replace(/\D/g, '').slice(0, 4);
    const dob = dobFromControls();
    state.answers.dob = validDob(dob) ? dob : '';
    persist();
    if (input.id === 'dobYear' && !event.isComposing) autoAdvance = () => autoAdvanceDobControl(input);
  } else if (['timeHour', 'timeMinute', 'timeMeridiem'].includes(input.id)) {
    if (input.id !== 'timeMeridiem') input.value = input.value.replace(/\D/g, '').slice(0, 2);
    persistBirthTimeDraft();
    if (['timeHour', 'timeMinute'].includes(input.id) && !event.isComposing) {
      autoAdvance = () => autoAdvanceTimeControl(input);
    }
  } else if (input.id === 'nameInput') {
    state.answers.name = input.value;
    persist();
  } else if (input.id === 'landingNameInput') {
    state.answers.name = input.value;
    const formattedName = formatName(input.value);
    const letterCount = clientNameBreakdown(formattedName).letters.length;
    updateLandingNameCalculation(formattedName);
    if (formattedName.length) {
      trackOnce('nameInputStarted', 'name_input_started', {
        entry_position: 'landing',
        character_count: formattedName.length,
        letter_count: letterCount
      });
    }
    if (formattedName.length >= 2 && letterCount >= 2) {
      trackOnce('nameInputValid', 'name_input_valid', {
        entry_position: 'landing',
        character_count: formattedName.length,
        letter_count: letterCount
      });
    }
    persist();
  } else if (input.id === 'placeInput') {
    handlePlaceTyping(input.value);
  } else if (input.id === 'cashfreePhone') {
    input.value = normalizePaymentPhone(input.value);
    state.answers.paymentPhone = input.value;
    persist();
    const cashfreeButton = stage.querySelector(
      '[data-action="checkout-cashfree"], [data-preview-action="checkout-cashfree"]'
    );
    if (cashfreeButton) cashfreeButton.disabled = input.value.length !== 10 || state.checkoutLoading;
  } else if (input.id?.startsWith('global')) {
    captureGlobalCheckoutDetails();
    const checkoutButton = stage.querySelector('[data-action="continue-global-checkout"]');
    if (checkoutButton) checkoutButton.disabled = state.checkoutLoading || !globalCheckoutDetailsComplete();
  }
  updateContinueButtons();
  autoAdvance?.();
});

stage.addEventListener('focusin', (event) => {
  if (event.target?.id === 'placeInput') schedulePlaceResultsVisibility();
});

stage.addEventListener('change', (event) => {
  const input = event.target;
  if (input.matches('[data-face-timeline-toggle]')) {
    if (state.checkoutLoading || state.faceCheckoutPreparing || state.pendingVerification || state.paid) {
      render();
      return;
    }
    const previousType = state.faceReportType;
    const nextType = input.checked ? 'holistic' : 'personality';
    if (previousType === nextType) return;
    if (state.readingId) resetFaceReadingChoice();
    state.faceReportType = nextType;
    persist();
    track('face_timeline_addon_toggle', {
      selected: nextType === 'holistic',
      previous_report_type: previousType,
      upgrade_value: FACE_LIFETIME_UPGRADE_PRICE_INR,
      subtotal_value: nextType === 'holistic'
        ? FACE_LIFETIME_REPORT_PRICE_INR
        : FACE_PERSONALITY_REPORT_PRICE_INR
    });
    render();
    return;
  }
  if (input.id === 'reuseParentPalm') {
    state.reuseParentPalm = Boolean(input.checked);
    persist();
    return;
  }
  if (input.matches('[data-name-alignment-toggle]')) {
    const assignment = palmNameAlignmentAssignment();
    if (assignment?.variant !== 'offer' || state.checkoutLoading || state.pendingVerification) {
      updatePalmNameAlignmentCheckoutUi();
      return;
    }
    const previousSelected = palmNameAlignmentIsSelected();
    state.palmNameAlignmentSelected = Boolean(input.checked);
    state.checkoutAddons = palmCheckoutAddons();
    state.checkoutAuthoritativeValue = 0;
    state.checkoutQuoteVersion = '';
    state.checkoutGstRateBps = 0;
    persist();
    updatePalmNameAlignmentCheckoutUi();
    track('palm_name_offer_toggle', palmPaywallVisitProperties({
      selected: palmNameAlignmentIsSelected(),
      previous_selected: previousSelected,
      interaction: 'checkbox'
    }));
    return;
  }
  if (input.id === 'palmInput' || input.id === 'landingPalmInput') acceptPalmFile(input.files?.[0], { source: 'gallery' });
  if (input.id === 'landingFaceInput' || input.id === 'faceRetryInput') acceptFaceFile(input.files?.[0], { source: 'gallery' });
  if (['dobDay', 'dobMonth'].includes(input.id)) {
    const dob = dobFromControls();
    state.answers.dob = validDob(dob) ? dob : '';
    persist();
    updateContinueButtons();
    autoAdvanceDobControl(input);
  }
  if (['timeHour', 'timeMinute', 'timeMeridiem'].includes(input.id)) {
    if (input.id !== 'timeMeridiem') input.value = input.value.replace(/\D/g, '').slice(0, 2);
    if (input.id === 'timeHour' && input.value) input.value = String(Number(input.value));
    if (input.id === 'timeMinute' && /^\d{1,2}$/.test(input.value)) input.value = input.value.padStart(2, '0');
    persistBirthTimeDraft();
    updateContinueButtons();
    if (input.id === 'timeMeridiem') autoAdvanceTimeControl(input);
  }
});

stage.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.isComposing) return;
  const input = event.target;
  let handled = false;
  if (input?.id === 'dobYear') handled = completeDobStep();
  if (input?.id === 'timeHour' && /^(?:0?[1-9]|1[0-2])$/.test(input.value)) {
    handled = focusSequentialControl('timeMinute', { birthTime: true });
  }
  if (input?.id === 'timeMinute' && /^(?:\d|[0-5]\d)$/.test(input.value)) {
    handled = focusSequentialControl('timeMeridiem', { birthTime: true });
  }
  if (!handled) return;
  event.preventDefault();
  event.stopPropagation();
});

backButton.addEventListener('click', back);
freshButton?.addEventListener('click', openFreshDialog);
savedReportsButton?.addEventListener('click', openSavedReadingsDialog);
savedReadingsClose?.addEventListener('click', closeSavedReadingsDialog);
savedReadingsDialog?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeSavedReadingsDialog();
});
savedReadingsContent?.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action="open-previous-reading"]');
  if (!target) return;
  closeSavedReadingsDialog();
  openPreviousPaidReport(target.dataset.readingId, target.dataset.lane);
});
freshCancel?.addEventListener('click', () => closeFreshDialog({ cancelled: true }));
freshConfirm?.addEventListener('click', confirmFreshStart);
freshDialog?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeFreshDialog({ cancelled: true });
});
palmCameraClose?.addEventListener('click', () => closePalmCamera({ reason: 'close_button' }));
palmCameraCapture?.addEventListener('click', capturePalmCameraPhoto);
palmCameraSwitch?.addEventListener('click', switchPalmCamera);
palmCameraRetake?.addEventListener('click', retakePalmCameraPhoto);
palmCameraUse?.addEventListener('click', usePalmCameraPhoto);
palmCameraFallback?.addEventListener('click', () => {
  track('palm_camera_fallback_opened', { recovery: palmCameraDialog?.classList.contains('is-upload-recovery') ? 'yes' : 'no' });
  openPalmFallbackPicker();
});
palmCameraFallbackInput?.addEventListener('change', async () => {
  const file = palmCameraFallbackInput.files?.[0];
  if (!file) return;
  palmCameraResumeAfterPicker = false;
  closePalmCamera({ reason: 'fallback_photo', restoreFocus: false });
  await acceptPalmFile(file, { source: 'camera_fallback' });
});
palmCameraDialog?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closePalmCamera({ reason: 'escape' });
});
palmCameraDialog?.addEventListener('close', () => {
  cancelPalmCameraRequest();
  document.body.classList.remove('is-camera-open');
});
faceCameraClose?.addEventListener('click', () => closeFaceCamera({ reason: 'close_button' }));
faceCameraCapture?.addEventListener('click', captureFaceCameraPhoto);
faceCameraSwitch?.addEventListener('click', switchFaceCamera);
faceCameraRetake?.addEventListener('click', retakeFaceCameraPhoto);
faceCameraUse?.addEventListener('click', useFaceCameraPhoto);
faceCameraFallback?.addEventListener('click', () => {
  track('face_camera_fallback_opened');
  openFaceFallbackPicker();
});
faceCameraFallbackInput?.addEventListener('change', async () => {
  const file = faceCameraFallbackInput.files?.[0];
  if (!file) return;
  faceCameraResumeAfterPicker = false;
  closeFaceCamera({ reason: 'fallback_photo', restoreFocus: false });
  await acceptFaceFile(file, { source: 'camera_fallback' });
});
faceCameraDialog?.addEventListener('cancel', (event) => {
  event.preventDefault();
  closeFaceCamera({ reason: 'escape' });
});
faceCameraDialog?.addEventListener('close', () => {
  cancelFaceCameraRequest();
  document.body.classList.remove('is-camera-open');
});
homeLink?.addEventListener('click', (event) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  goHome();
});
window.addEventListener('resize', requestViewportSync, { passive: true });
window.addEventListener('orientationchange', requestViewportSync, { passive: true });
window.addEventListener('online', () => {
  void flushCriticalCrossSellEventQueue({ force: true });
});
window.visualViewport?.addEventListener('resize', () => {
  requestViewportSync();
  if (state.screen === 'palmscan') setTimeout(ensurePalmScanProgressVisible, 80);
  if (state.screen === 'time') setTimeout(ensureBirthTimeInputVisible, 80);
}, { passive: true });
window.visualViewport?.addEventListener('scroll', requestViewportSync, { passive: true });
document.addEventListener('visibilitychange', noteGatewayVisibilityChange, { passive: true });
window.addEventListener('blur', noteGatewayWindowBlur, { passive: true });
window.addEventListener('pagehide', () => {
  finishPalmPaywallVisit('pagehide');
  crossSellPaywallCtaObserver?.disconnect?.();
  crossSellPaywallCtaObserver = null;
  state.faceScanRunId = '';
  cancelActiveFaceScanPresentation();
  cancelPalmCameraRequest();
  cancelFaceCameraRequest();
  releaseFacePhoto();
  cancelFaceLandmarkWorkerRequests('The page was closed before the face scan finished.');
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    finishPalmPaywallVisit('hidden');
    return;
  }
  if (
    ['palm_answers', 'mahakundli'].includes(state.lane)
    && state.screen === 'unlock'
    && !hasFullReportAccess()
    && !IS_PAID_RETURN
    && !IS_CHARITY_GRANT_RETURN
  ) {
    requestAnimationFrame(() => setupPalmPaywallInstrumentation());
  } else if (crossSellPaywallCtaMeasurementAvailable()) {
    requestAnimationFrame(setupAndTrackCrossSellPaywallCtaExposure);
  }
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter' || event.isComposing || event.target?.tagName === 'TEXTAREA') return;
  // Let the native dialog handle its own focused buttons. Never send Enter to
  // a hidden quiz action behind the modal.
  if (freshDialog?.open || palmCameraDialog?.open || faceCameraDialog?.open) return;
  // Buttons already have correct native Enter activation. Redirecting their
  // keydown to the first primary CTA can trigger the wrong recovery choice.
  if (event.target?.closest?.('button, a[href]')) return;
  const button = stage.querySelector('.primary-button:not(:disabled)');
  if (button && event.target?.type !== 'file') {
    event.preventDefault();
    button.click();
  }
});

if (!LOCAL_VISUAL_PREVIEW) {
  if (IS_CHARITY_GRANT_RETURN) {
    track('charity_report_access_view', {
      access_type: 'charity_grant',
      reading_id: state.readingId
    });
  } else if (IS_READING_RETURN) {
    track('report_recovery_view', { payment_status: RETURN_PAYMENT || 'unknown', reading_id: state.readingId });
  } else {
    trackOnce('landingView', 'landing_view', {
      raw_angle: state.rawAngle,
      resolved_angle: state.resolvedAngle,
      lane: state.lane,
      entry_source: state.entrySource,
      referral_entry: REFERRAL_CODE ? 'yes' : 'no',
      referral_code: REFERRAL_CODE,
      ...priceComparisonAnalytics()
    });
  }
}
requestViewportSync();
void flushCriticalCrossSellEventQueue();
void (async () => {
  if (restoredPalmExperimentsNeedStartupCheck()) renderRestoredPalmExperimentCheck();
  await revalidateRestoredPalmExperiments();
  render();
  if (!LOCAL_VISUAL_PREVIEW) {
    loadPreviousPaidHistory();
    recoverPendingPaidReading();
  }
})();
