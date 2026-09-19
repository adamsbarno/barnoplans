import { BarnoCatalog } from './plan-manager.js';
import { housePlans } from './data/plans.js';

// ===========================
// BARNO PLANS - MAIN SCRIPT
// ===========================

let planCatalog = new BarnoCatalog(housePlans);
window.dataLayer = window.dataLayer || [];
function trackEvent(name, details = {}) {
    window.dataLayer.push({ name, ...details, timestamp: new Date().toISOString() });
}

window.trackBarnoEvent = trackEvent;
window.planCatalog = planCatalog;
window.addPlanToCatalog = function(plan) {
    return planCatalog.addPlan(plan);
};
window.getPlanCatalog = function() {
    return planCatalog;
};

// Function to render plan cards dynamically
function renderPlanCards(plans, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.replaceChildren();

    if (!plans.length) {
        const noResults = document.createElement('p');
        noResults.className = 'no-results';
        noResults.textContent = 'No house plans match your search.';
        container.appendChild(noResults);
        return;
    }

    plans.forEach(plan => {
        const card = document.createElement('div');
        card.className = 'plan-card';

        const category = document.createElement('span');
        category.className = 'plan-category';
        category.textContent = plan.category;

        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'plan-image';
        const image = document.createElement('img');
        image.src = plan.image;
        image.alt = plan.name;
        image.onerror = () => {
            imageWrapper.textContent = `${plan.bedrooms} Bed ${plan.category}`;
        };
        imageWrapper.appendChild(image);

        const name = document.createElement('h3');
        name.textContent = plan.name;
        const details = document.createElement('p');
        details.textContent = `${plan.bedrooms} Bedrooms - ${plan.bathrooms} Bathrooms`;
        const price = document.createElement('p');
        price.className = 'price';
        price.textContent = `KSh ${plan.price.toLocaleString()}`;
        const link = document.createElement('a');
        link.className = 'view-plan';
        link.href = `plan-details.html?id=${encodeURIComponent(plan.id)}`;
        link.textContent = 'View Plan';
        link.addEventListener('click', () => trackEvent('plan_view', { planId: plan.id, planName: plan.name }));

        const compareLabel = document.createElement('label');
        compareLabel.className = 'compare-control';
        const compareInput = document.createElement('input');
        compareInput.type = 'checkbox';
        compareInput.value = plan.id;
        compareInput.setAttribute('aria-label', `Compare ${plan.name}`);
        compareInput.checked = comparisonIds.has(plan.id);
        compareInput.addEventListener('change', () => {
            if (compareInput.checked) comparisonIds.add(plan.id);
            else comparisonIds.delete(plan.id);
            updateComparisonToolbar();
        });
        compareLabel.append(compareInput, document.createTextNode(' Compare'));

        if (document.getElementById('plans-container')) {
            card.append(imageWrapper, category, name, details, price, compareLabel, link);
        } else {
            card.append(imageWrapper, category, name, details, price, link);
        }
        container.appendChild(card);
    });
}

const comparisonIds = new Set();

function updateComparisonToolbar() {
    const toolbar = document.getElementById('comparison-toolbar');
    const count = document.getElementById('comparison-count');
    if (!toolbar || !count) return;
    toolbar.hidden = comparisonIds.size === 0;
    count.textContent = `${comparisonIds.size} selected`;
}

function renderComparison() {
    const panel = document.getElementById('comparison-panel');
    const container = document.getElementById('comparison-table-container');
    if (!panel || !container) return;
    const selectedPlans = planCatalog.getAll().filter(plan => comparisonIds.has(plan.id));
    if (selectedPlans.length < 2) {
        alert('Select at least two plans to compare.');
        return;
    }
    const table = document.createElement('table');
    table.className = 'comparison-table';
    table.innerHTML = `<thead><tr><th>Plan</th>${selectedPlans.map(plan => `<th>${plan.name}</th>`).join('')}</tr></thead><tbody>${[
        ['Bedrooms', plan => plan.bedrooms],
        ['Bathrooms', plan => plan.bathrooms],
        ['Floors', plan => plan.floors],
        ['Price', plan => `KSh ${plan.price.toLocaleString()}`]
    ].map(([label, value]) => `<tr><th>${label}</th>${selectedPlans.map(plan => `<td>${value(plan)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    container.replaceChildren(table);
    panel.hidden = false;
    panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupNavigation() {
    document.querySelectorAll('.nav-toggle').forEach(toggle => {
        const navigation = document.getElementById(toggle.getAttribute('aria-controls'));
        if (!navigation) return;
        toggle.addEventListener('click', () => {
            const isOpen = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!isOpen));
            navigation.classList.toggle('is-open', !isOpen);
        });
    });
}

function setupBackToTop() {
    const button = document.getElementById('back-to-top');
    if (!button) return;

    const updateVisibility = () => {
        button.classList.toggle('is-visible', window.scrollY > 500);
    };

    window.addEventListener('scroll', updateVisibility, { passive: true });
    button.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    updateVisibility();
}

// Function to get plan by ID
function getPlanById(id) {
    return planCatalog.getById(id);
}

// Function to filter plans by category
function filterPlansByCategory(category) {
    if (category === 'All') {
        return planCatalog.getAll();
    }

    if (category.toLowerCase().includes('all ensuite')) {
        return planCatalog.filter({ bedrooms: 3, search: 'all ensuite' });
    }

    const bedroomMatch = category.match(/(\d+)\s+Bedroom/);
    if (bedroomMatch) {
        const bedroomCount = parseInt(bedroomMatch[1], 10);
        return planCatalog.filter({ bedrooms: bedroomCount });
    }

    return planCatalog.filter({ category: category });
}

function updatePlanResults(category, searchTerm, sortOrder) {
    const query = searchTerm.trim().toLowerCase();
    const filters = {
        search: query || undefined
    };

    if (category !== 'All') {
        if (category.toLowerCase().includes('all ensuite')) {
            filters.bedrooms = 3;
            filters.search = `${filters.search || ''} all ensuite`.trim();
        }

        const bedroomMatch = category.match(/(\d+)\s+Bedroom/);
        if (bedroomMatch && !category.toLowerCase().includes('all ensuite')) {
            filters.bedrooms = parseInt(bedroomMatch[1], 10);
        } else if (!bedroomMatch) {
            filters.category = category;
        }
    }

    if (sortOrder === 'low') {
        filters.sortBy = 'lowPrice';
    } else if (sortOrder === 'high') {
        filters.sortBy = 'highPrice';
    }

    const results = planCatalog.filter(filters);
    renderPlanCards(results, 'plans-container');
}

// Initialize featured plans on homepage
document.addEventListener('DOMContentLoaded', async function() {
    setupNavigation();
    setupBackToTop();

    try {
        const response = await fetch('/api/catalog');
        if (response.ok) {
            planCatalog = new BarnoCatalog(await response.json());
            window.planCatalog = planCatalog;
        }
    } catch (error) {
        console.warn('Using local catalog data:', error.message);
    }

    document.getElementById('contact-form')?.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const form = event.currentTarget;
        fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(Object.fromEntries(formData))
        }).then(async response => {
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Could not send enquiry');
            trackEvent('contact_submit');
            form.reset();
            alert('Your enquiry has been received. Barno Plans will contact you soon.');
        }).catch(error => alert(error.message));
    });
    
    // Render featured plans on index.html
    if (document.getElementById('featured-plans-container')) {
        renderPlanCards(planCatalog.getAll().slice(0, 3), 'featured-plans-container');
    }

    // Initialize plan filtering on plans.html
    if (document.getElementById('plans-container')) {
        const searchInput = document.getElementById('plan-search');
        const sortSelect = document.getElementById('plan-sort');
        const params = new URLSearchParams(window.location.search);
        const bedroomFilter = params.get('bedrooms');
        let selectedCategory = bedroomFilter ? `${bedroomFilter} Bedroom` : 'All';

        updatePlanResults(selectedCategory, '', 'featured');

        document.getElementById('compare-plans-button')?.addEventListener('click', renderComparison);
        document.getElementById('clear-comparison-button')?.addEventListener('click', () => {
            comparisonIds.clear();
            updatePlanResults(selectedCategory, searchInput?.value || '', sortSelect?.value || 'featured');
            updateComparisonToolbar();
            document.getElementById('comparison-panel').hidden = true;
        });
        
        // Setup category button filters
        const filterButtons = document.querySelectorAll('.plan-categories button');
        filterButtons.forEach(button => {
            if (button.textContent.trim() === selectedCategory) {
                button.classList.add('active');
            } else if (bedroomFilter && button.classList.contains('active')) {
                button.classList.remove('active');
            }
            button.addEventListener('click', function() {
                selectedCategory = this.textContent.trim();
                updatePlanResults(selectedCategory, searchInput?.value || '', sortSelect?.value || 'featured');
                
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });

        searchInput?.addEventListener('input', function() {
            updatePlanResults(selectedCategory, this.value, sortSelect?.value || 'featured');
        });

        sortSelect?.addEventListener('change', function() {
            updatePlanResults(selectedCategory, searchInput?.value || '', this.value);
        });
    }

    // Load plan details on plan-details.html
    if (document.getElementById('product-info') || document.querySelector('.main-product-image')) {
        const urlParams = new URLSearchParams(window.location.search);
        const planId = urlParams.get('id') || 1;
        const plan = getPlanById(planId);
        
        if (plan) {
            loadPlanDetails(plan);
        }
    }

});

// Function to load and display plan details
function openImageModal(imageSrc, imageAlt) {
    const modal = document.getElementById('image-modal');
    const modalImage = document.getElementById('image-modal-img');

    if (!modal || !modalImage) return;

    modalImage.src = imageSrc;
    modalImage.alt = imageAlt || 'Plan image';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function loadPlanDetails(plan) {
    // Update title
    document.title = `${plan.name} | Barno Plans`;
    
    // Update product gallery image - SIMPLE AND DIRECT
    const mainImage = document.querySelector('.main-product-image');
    if (mainImage) {
        // Clear the div completely
        mainImage.innerHTML = '';
        
        // Create a simple img element
        const img = document.createElement('img');
        img.src = plan.image;
        img.alt = plan.name;
        img.style.display = 'block';
        mainImage.style.cursor = 'zoom-in';
        mainImage.appendChild(img);

        mainImage.onclick = function() {
            if (img.src) {
                openImageModal(img.src, plan.name);
            }
        };
    }
    
    // Update product category
    const categoryEl = document.querySelector('.product-category');
    if (categoryEl) categoryEl.textContent = plan.category;
    
    // Update product name
    const nameEl = document.querySelector('.product-info h1');
    if (nameEl) nameEl.textContent = plan.name;
    
    // Update description
    const descEl = document.querySelector('.product-description');
    if (descEl && plan.description) descEl.textContent = plan.description;

    const aboutDescription = document.querySelector('.product-description-section p');
    if (aboutDescription && plan.description) {
        aboutDescription.textContent = `${plan.description} The design should be reviewed and adapted for your site by a qualified professional.`;
    }
    
    // Update price
    const priceEl = document.querySelector('.product-price');
    if (priceEl) priceEl.textContent = `KSh ${plan.price.toLocaleString()}`;
    
    // Update features
    const featuresEl = document.querySelector('.features');
    if (featuresEl) {
        const featureValues = [plan.bedrooms, plan.bathrooms, plan.floors];
        featuresEl.querySelectorAll('div').forEach((feature, index) => {
            const value = feature.querySelector('strong');
            if (value) value.textContent = featureValues[index] ?? '';
        });
    }
    
    // Setup thumbnail gallery if plan has multiple images
    if (plan.images) {
        setupThumbnailGallery(plan);
    }

    const modalCloseButton = document.querySelector('.image-modal-close');
    const modalBackdrop = document.querySelector('[data-close-image-modal="true"]');

    if (modalCloseButton) {
        modalCloseButton.addEventListener('click', closeImageModal);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeImageModal);
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeImageModal();
        }
    });
    
    // Update buy button
    const buyButton = document.querySelector('.buy-button');
    if (buyButton) {
        buyButton.setAttribute('data-plan-id', plan.id);
        buyButton.setAttribute('data-plan-name', plan.name);
        buyButton.setAttribute('data-plan-price', plan.price);
        buyButton.addEventListener('click', function() {
            buyPlanWithMpesa(plan);
        });
    }

    const manualPaymentButton = document.querySelector('.manual-payment-button');
    const manualPaymentModal = document.getElementById('manual-payment-modal');
    const manualPaymentForm = document.getElementById('manual-payment-form');
    const manualPaymentClose = document.querySelector('.manual-payment-close');

    if (manualPaymentButton && manualPaymentModal && manualPaymentForm) {
        manualPaymentButton.addEventListener('click', function() {
            document.getElementById('manual-plan-name').value = plan.name;
            manualPaymentModal.style.display = 'block';
        });

        manualPaymentClose?.addEventListener('click', function() {
            manualPaymentModal.style.display = 'none';
        });

        manualPaymentForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const customerName = document.getElementById('manual-customer-name').value.trim();
            const customerPhone = document.getElementById('manual-customer-phone').value.trim();
            const transactionCode = document.getElementById('manual-transaction-code').value.trim().toUpperCase();
            const message = `Hello Barno Plans, I paid for ${plan.name} (KSh ${plan.price.toLocaleString()}). Name: ${customerName}. Phone: ${customerPhone}. M-Pesa code: ${transactionCode}. Please confirm my payment and send the PDF.`;
            window.open(`https://wa.me/254710304401?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
            manualPaymentModal.style.display = 'none';
            manualPaymentForm.reset();
        });
    }
    
    // Add preview PDF link
    const previewBtn = document.querySelector('.custom-button');
    if (previewBtn) {
        previewBtn.innerHTML = 'PDF after payment';
        previewBtn.onclick = function(e) {
            e.preventDefault();
            alert('The PDF download becomes available after your M-Pesa payment is confirmed.');
        };
    }
}

// Setup thumbnail gallery - allows clicking to change main image
function setupThumbnailGallery(plan) {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.querySelector('.main-product-image');
    
    if (!thumbnails.length || !mainImage) return;
    
    // Get thumbnail labels
    const labels = ['Exterior', 'Floor Plan'];
    const imageKeys = ['exterior', 'floor'];
    
    // Setup each thumbnail
    thumbnails.forEach((thumbnail, index) => {
        const label = labels[index];
        const imageKey = imageKeys[index];
        
        // Set thumbnail text
        thumbnail.textContent = label;
        thumbnail.style.cursor = 'pointer';
        thumbnail.style.transition = 'all 0.3s ease';

        if (plan.images && plan.images[imageKey]) {
            thumbnail.style.backgroundImage = `url("${plan.images[imageKey]}")`;
            thumbnail.style.backgroundSize = 'cover';
            thumbnail.style.backgroundPosition = 'center';
            thumbnail.style.color = 'white';
            thumbnail.style.textShadow = '0 1px 3px rgba(0, 0, 0, .8)';
        }
        
        // Add click handler
        thumbnail.addEventListener('click', function() {
            if (plan.images && plan.images[imageKey]) {
                const img = mainImage.querySelector('img');
                if (img) {
                    img.src = plan.images[imageKey];
                    img.alt = `${plan.name} ${label}`;
                    mainImage.style.cursor = 'zoom-in';
                    mainImage.onclick = function() {
                        openImageModal(plan.images[imageKey], `${plan.name} ${label}`);
                    };
                }
            } else {
                alert(`${label} image coming soon!`);
            }
            
            // Visual feedback - highlight active thumbnail
            thumbnails.forEach(t => t.style.opacity = '0.6');
            this.style.opacity = '1';
            this.style.backgroundColor = '#4dd4dd';
        });

        if (!plan.images || !plan.images[imageKey]) {
            thumbnail.classList.add('unavailable');
            thumbnail.title = `${label} image coming soon`;
        }
        
        // Hover effect
        thumbnail.addEventListener('mouseover', function() {
            if (this.style.opacity !== '1') {
                this.style.opacity = '0.8';
            }
        });
        
        thumbnail.addEventListener('mouseout', function() {
            if (this.style.opacity !== '1') {
                this.style.opacity = '0.6';
            }
        });
    });
}

// M-Pesa Payment Integration
function buyPlanWithMpesa(plan) {
    const enteredNumber = prompt('Enter your M-Pesa phone number (07xxxxxxxx or 2547xxxxxxxx):', '07');
    const phoneNumber = normalizePhoneNumber(enteredNumber);
    
    if (!phoneNumber) return;
    
    // Validate phone number format
    if (!phoneNumber) {
        alert('Please enter a valid Kenyan phone number.');
        return;
    }
    
    startMpesaPayment(plan, phoneNumber);
}

function normalizePhoneNumber(phoneNumber) {
    if (!phoneNumber) return null;
    const digits = phoneNumber.replace(/\D/g, '');
    if (/^07\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
    if (/^2547\d{8}$/.test(digits)) return digits;
    return null;
}

async function startMpesaPayment(plan, phoneNumber) {
    const buyButton = document.querySelector('.buy-button');
    if (buyButton) {
        buyButton.disabled = true;
        buyButton.textContent = 'Sending prompt...';
    }

    try {
        const response = await fetch('/api/mpesa/stk-push', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ planId: plan.id, phoneNumber })
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Payment could not start');

        showMpesaModal(plan, phoneNumber, result.checkoutRequestId, result.downloadToken);
    } catch (error) {
        alert(error.message);
        if (buyButton) {
            buyButton.disabled = false;
            buyButton.textContent = 'Buy This Plan';
        }
    }
}

// Show M-Pesa Payment Modal
function showMpesaModal(plan, phoneNumber, checkoutRequestId, downloadToken) {
    const modal = document.getElementById('mpesa-modal');
    if (!modal) return;
    
    document.getElementById('modal-plan-name').textContent = plan.name;
    document.getElementById('modal-plan-price').textContent = plan.price.toLocaleString();
    document.getElementById('modal-phone').textContent = phoneNumber;
    
    modal.style.display = 'block';
    
    // Close modal button
    const closeBtn = document.querySelector('.close-modal');
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    };
    
    // Confirm payment button
    const confirmBtn = document.getElementById('confirm-payment');
    confirmBtn.onclick = function() {
        checkPaymentStatus(plan, checkoutRequestId, downloadToken);
    };
    
    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

async function checkPaymentStatus(plan, checkoutRequestId, downloadToken) {
    const confirmBtn = document.getElementById('confirm-payment');
    confirmBtn.textContent = 'Checking payment...';
    confirmBtn.disabled = true;

    try {
        const response = await fetch(`/api/mpesa/status/${checkoutRequestId}`);
        const result = await response.json();
        if (!response.ok || !result.paid) {
            throw new Error('Payment is not confirmed yet. Complete the prompt on your phone, then try again.');
        }
        const link = document.createElement('a');
        link.href = `/api/download/${plan.id}/${downloadToken}`;
        link.download = `${plan.name}.pdf`;
        link.click();
        document.getElementById('mpesa-modal').style.display = 'none';
    } catch (error) {
        alert(error.message);
        confirmBtn.textContent = 'I\'ve Completed Payment';
        confirmBtn.disabled = false;
    }
}

