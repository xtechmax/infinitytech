/**
 * Meta (Facebook) Pixel Standard Event Tracking Utility
 * Path: vastu/assets/pixelEvents.js
 */

// Helper to check and call fbq safely
function safeTrack(eventName, params = {}) {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', eventName, params);
        console.log(`[Meta Pixel] Tracked event: ${eventName}`, params);
    } else {
        console.warn(`[Meta Pixel] fbq not available for event: ${eventName}`);
    }
}

/**
 * 1. ViewContent - Triggered on product page load
 */
window.trackViewContent = function(product = {}) {
    safeTrack('ViewContent', {
        content_name: product.name || 'Practical Vastu Shastra Bundle',
        content_category: product.category || 'E-Book Bundle',
        content_ids: product.ids || ['vastu_bundle_1'],
        content_type: 'product',
        value: product.value || 199.00,
        currency: product.currency || 'INR'
    });
};

/**
 * 2. Search - Triggered on search submission
 */
window.trackSearch = function(searchString, category = '') {
    safeTrack('Search', {
        search_string: searchString,
        content_category: category
    });
};

/**
 * 3. AddToWishlist - Triggered on save/wishlist click
 */
window.trackAddToWishlist = function(product = {}) {
    safeTrack('AddToWishlist', {
        content_name: product.name || 'Practical Vastu Shastra Bundle',
        content_ids: product.ids || ['vastu_bundle_1'],
        content_type: 'product',
        value: product.value || 199.00,
        currency: product.currency || 'INR'
    });
};

/**
 * 4. AddToCart - Triggered on add-to-cart click
 */
window.trackAddToCart = function(product = {}) {
    safeTrack('AddToCart', {
        content_name: product.name || 'Practical Vastu Shastra Bundle',
        content_ids: product.ids || ['vastu_bundle_1'],
        content_type: 'product',
        value: product.value || 199.00,
        currency: product.currency || 'INR'
    });
};

/**
 * 5. InitiateCheckout - Triggered on checkout load
 */
window.trackInitiateCheckout = function(checkoutData = {}) {
    safeTrack('InitiateCheckout', {
        content_ids: checkoutData.ids || ['vastu_bundle_1'],
        contents: checkoutData.contents || [{ id: 'vastu_bundle_1', quantity: 1, item_price: 199 }],
        num_items: checkoutData.num_items || 1,
        value: checkoutData.value || 199.00,
        currency: checkoutData.currency || 'INR'
    });
};

/**
 * 6. AddPaymentInfo - Triggered when payment step is submitted
 */
window.trackAddPaymentInfo = function(paymentData = {}) {
    safeTrack('AddPaymentInfo', {
        content_category: paymentData.category || 'E-Book Bundle',
        value: paymentData.value || 199.00,
        currency: paymentData.currency || 'INR'
    });
};

/**
 * 7. Purchase - Triggered on successful checkout completion
 */
window.trackPurchase = function(purchaseData = {}) {
    // Note: If Server-Side Conversions API (CAPI) is implemented later,
    // match this with the event_id parameter to ensure deduplication.
    safeTrack('Purchase', {
        content_ids: purchaseData.ids || ['vastu_bundle_1'],
        contents: purchaseData.contents || [{ id: 'vastu_bundle_1', quantity: 1 }],
        content_type: 'product',
        value: purchaseData.value || 199.00,
        currency: purchaseData.currency || 'INR',
        num_items: purchaseData.num_items || 1
    });
};

/**
 * 8. Subscribe - Triggered on subscription start
 */
window.trackSubscribe = function(subData = {}) {
    safeTrack('Subscribe', {
        value: subData.value || 0.00,
        currency: subData.currency || 'INR'
    });
};

/**
 * 9. StartTrial - Triggered on trial start
 */
window.trackStartTrial = function(trialData = {}) {
    safeTrack('StartTrial', {
        value: trialData.value || 0.00,
        currency: trialData.currency || 'INR'
    });
};

/**
 * 10. CompleteRegistration - Triggered on form submit / newsletter signup
 */
window.trackCompleteRegistration = function(regData = {}) {
    safeTrack('CompleteRegistration', {
        content_name: regData.name || 'Newsletter Signup',
        status: regData.status !== false,
        value: regData.value || 0.00,
        currency: regData.currency || 'INR'
    });
};

/**
 * 11. Contact - Triggered on support links / email clicks
 */
window.trackContact = function(category = 'Support') {
    safeTrack('Contact', {
        content_category: category
    });
};

/**
 * 12. FindLocation - Triggered on location search/clicks
 */
window.trackFindLocation = function() {
    safeTrack('FindLocation');
};

/**
 * 13. Schedule - Triggered on calendar booking
 */
window.trackSchedule = function(category = 'Appointment') {
    safeTrack('Schedule', {
        content_category: category
    });
};
