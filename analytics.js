const measurementId = 'G-5FWHBPEL1Y';
const consentStorageKey = 'barno-analytics-consent';
let analyticsLoaded = false;

function getConsentChoice() {
    try {
        return localStorage.getItem(consentStorageKey);
    } catch {
        return null;
    }
}

function setConsentChoice(choice) {
    try {
        localStorage.setItem(consentStorageKey, choice);
    } catch {
        // Keep the visitor's choice for this page view if storage is unavailable.
    }
}

function loadAnalytics() {
    if (analyticsLoaded || !/^G-[A-Z0-9]+$/.test(measurementId)) return;
    analyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
        window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId);

    const analyticsScript = document.createElement('script');
    analyticsScript.async = true;
    analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(analyticsScript);
}

function createConsentControls() {
    const settingsButton = document.createElement('button');
    settingsButton.className = 'analytics-settings-button';
    settingsButton.type = 'button';
    settingsButton.textContent = 'Cookie settings';

    const banner = document.createElement('section');
    banner.className = 'analytics-consent-banner';
    banner.setAttribute('aria-label', 'Analytics cookie preferences');
    banner.setAttribute('aria-live', 'polite');

    const message = document.createElement('p');
    message.textContent = 'May we use Google Analytics to understand how visitors use Barno Plans? Analytics stays off unless you accept.';

    const privacyLink = document.createElement('a');
    privacyLink.href = 'privacy.html';
    privacyLink.textContent = 'Privacy policy';

    const actions = document.createElement('div');
    actions.className = 'analytics-consent-actions';

    const rejectButton = document.createElement('button');
    rejectButton.className = 'analytics-reject-button';
    rejectButton.type = 'button';
    rejectButton.textContent = 'Reject';

    const acceptButton = document.createElement('button');
    acceptButton.className = 'analytics-accept-button';
    acceptButton.type = 'button';
    acceptButton.textContent = 'Accept analytics';

    actions.append(rejectButton, acceptButton);
    banner.append(message, privacyLink, actions);
    document.body.append(settingsButton, banner);

    const saveChoice = choice => {
        setConsentChoice(choice);
        banner.hidden = true;
        if (choice === 'accepted') loadAnalytics();
        settingsButton.focus();
    };

    acceptButton.addEventListener('click', () => saveChoice('accepted'));
    rejectButton.addEventListener('click', () => saveChoice('rejected'));
    settingsButton.addEventListener('click', () => {
        banner.hidden = false;
        acceptButton.focus();
    });

    const existingChoice = getConsentChoice();
    banner.hidden = Boolean(existingChoice);
    if (existingChoice === 'accepted') loadAnalytics();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createConsentControls, { once: true });
} else {
    createConsentControls();
}