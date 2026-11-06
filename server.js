import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import multer from 'multer';
import { housePlans } from './data/plans.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const adminSessions = new Map();
let pesapalToken = null;
let pesapalTokenExpiresAt = 0;
const ordersFile = path.join(__dirname, 'data', 'orders.json');
const catalogOverridesFile = path.join(__dirname, 'data', 'catalog-overrides.json');
const catalogAdditionsFile = path.join(__dirname, 'data', 'catalog-additions.json');
const contactsFile = path.join(__dirname, 'data', 'contact-submissions.json');
const orders = new Map(
    JSON.parse(fs.readFileSync(ordersFile, 'utf8')).map(order => [order.orderId, order])
);
const catalogOverrides = JSON.parse(fs.readFileSync(catalogOverridesFile, 'utf8'));
const catalogAdditions = JSON.parse(fs.readFileSync(catalogAdditionsFile, 'utf8'));
const contactSubmissions = JSON.parse(fs.readFileSync(contactsFile, 'utf8'));
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024, files: 4 },
    fileFilter: (request, file, callback) => {
        const isImage = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
        const isPdf = file.fieldname === 'pdf' && file.mimetype === 'application/pdf';
        callback(null, isImage || isPdf);
    }
});

function getCatalogPlans() {
    const featuredPlanIds = new Map([[6, 0], [7, 1]]);
    return [...housePlans, ...catalogAdditions]
        .map(plan => ({ ...plan, ...(catalogOverrides[String(plan.id)] || {}) }))
        .sort((first, second) => {
            const firstPosition = featuredPlanIds.get(first.id);
            const secondPosition = featuredPlanIds.get(second.id);
            if (firstPosition !== undefined || secondPosition !== undefined) {
                if (firstPosition === undefined) return 1;
                if (secondPosition === undefined) return -1;
                return firstPosition - secondPosition;
            }
            return String(second.createdAt || '').localeCompare(String(first.createdAt || '')) || second.id - first.id;
        });
}

const plans = new Map(getCatalogPlans().map((plan) => [
    plan.id,
    {
        name: plan.name,
        price: plan.price,
        pdf: path.basename(plan.pdf)
    }
]));

function saveOrders() {
    fs.writeFileSync(ordersFile, JSON.stringify([...orders.values()], null, 2));
    syncFileToGitHub('data/orders.json', JSON.stringify([...orders.values()], null, 2));
}

function saveCatalogOverrides() {
    fs.writeFileSync(catalogOverridesFile, JSON.stringify(catalogOverrides, null, 2));
    syncFileToGitHub('data/catalog-overrides.json', JSON.stringify(catalogOverrides, null, 2));
}

function saveCatalogAdditions() {
    fs.writeFileSync(catalogAdditionsFile, JSON.stringify(catalogAdditions, null, 2));
    syncFileToGitHub('data/catalog-additions.json', JSON.stringify(catalogAdditions, null, 2));
}

function saveContactSubmissions() {
    fs.writeFileSync(contactsFile, JSON.stringify(contactSubmissions, null, 2));
    syncFileToGitHub('data/contact-submissions.json', JSON.stringify(contactSubmissions, null, 2));
}

async function syncFileToGitHub(repoPath, content) {
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO;
    if (!token || !repo) return;
    const branch = process.env.GITHUB_BRANCH || 'main';
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${repoPath}`;
    const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json'
    };
    try {
        const existing = await fetch(`${apiUrl}?ref=${branch}`, { headers });
        const existingData = existing.ok ? await existing.json() : null;
        const response = await fetch(apiUrl, {
            method: 'PUT',
            headers,
            body: JSON.stringify({
                message: `Update ${repoPath} from admin dashboard`,
                content: Buffer.from(content, 'utf8').toString('base64'),
                sha: existingData?.sha,
                branch
            })
        });
        if (!response.ok) {
            console.error(`GitHub sync failed for ${repoPath}:`, response.status, await response.text());
        }
    } catch (error) {
        console.error(`GitHub sync error for ${repoPath}:`, error.message);
    }
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-7', legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api', apiLimiter);
app.use(['/data/orders.json', '/data/catalog-overrides.json', '/data/catalog-additions.json', '/data/contact-submissions.json'], (request, response) => response.status(404).json({ error: 'Not found' }));
app.use('/pdfs', (request, response) => response.status(404).json({ error: 'PDF access requires a verified payment' }));
app.use('/images', express.static(path.join(__dirname, 'images'), { maxAge: '7d' }));
app.use(express.static(__dirname, {
    fallthrough: true
}));

app.get('/api/catalog', (request, response) => {
    return response.json(getCatalogPlans());
});

app.post('/api/contact', contactLimiter, (request, response) => {
    const { name, email, message } = request.body || {};
    if (!String(name || '').trim() || !String(email || '').includes('@') || !String(message || '').trim()) {
        return response.status(400).json({ error: 'Name, valid email, and message are required' });
    }
    contactSubmissions.push({
        id: crypto.randomUUID(),
        name: String(name).trim(),
        email: String(email).trim(),
        message: String(message).trim(),
        createdAt: new Date().toISOString()
    });
    saveContactSubmissions();
    return response.status(201).json({ received: true });
});

function getSessionToken(request) {
    const cookies = String(request.headers.cookie || '').split(';');
    const adminCookie = cookies.find(cookie => cookie.trim().startsWith('barno_admin='));
    return adminCookie ? adminCookie.split('=')[1] : null;
}

function requireAdmin(request, response, next) {
    const token = getSessionToken(request);
    const session = token && adminSessions.get(token);
    if (!session || Date.now() - session.createdAt > 8 * 60 * 60 * 1000) {
        if (token) adminSessions.delete(token);
        return response.status(401).json({ error: 'Admin login required' });
    }
    request.admin = session;
    return next();
}

app.post('/api/admin/login', authLimiter, (request, response) => {
    const { username, password } = request.body || {};
    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
        return response.status(503).json({ error: 'Admin credentials are not configured in .env' });
    }
    if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
        return response.status(401).json({ error: 'Incorrect admin login' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    adminSessions.set(token, { username, createdAt: Date.now() });
    const secureCookie = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    response.setHeader('Set-Cookie', `barno_admin=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secureCookie}`);
    return response.json({ authenticated: true });
});

app.post('/api/admin/logout', requireAdmin, (request, response) => {
    adminSessions.delete(getSessionToken(request));
    response.setHeader('Set-Cookie', 'barno_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
    return response.json({ authenticated: false });
});

app.get('/api/admin/summary', requireAdmin, (request, response) => {
    return response.json({
        plans: getCatalogPlans().map(plan => ({
            id: plan.id,
            name: plan.name,
            category: plan.category,
            price: plan.price,
            bedrooms: plan.bedrooms,
            pdf: plan.pdf
        })),
        orders: [...orders.values()].sort((first, second) => second.createdAt.localeCompare(first.createdAt)),
        contacts: contactSubmissions.length
    });
});

app.patch('/api/admin/plans/:id', requireAdmin, (request, response) => {
    const planId = Number(request.params.id);
    const plan = getCatalogPlans().find(item => item.id === planId);
    if (!plan) return response.status(404).json({ error: 'Plan not found' });

    const price = Number(request.body?.price);
    if (!Number.isFinite(price) || price < 0) {
        return response.status(400).json({ error: 'Price must be a valid positive number' });
    }

    catalogOverrides[String(planId)] = { ...(catalogOverrides[String(planId)] || {}), price };
    saveCatalogOverrides();
    const updatedPlan = { ...plan, ...catalogOverrides[String(planId)] };
    plans.set(planId, { name: updatedPlan.name, price: updatedPlan.price, pdf: path.basename(updatedPlan.pdf) });
    return response.json(updatedPlan);
});

app.post('/api/admin/plans', requireAdmin, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'exteriorImage', maxCount: 1 },
    { name: 'floorImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
]), (request, response) => {
    const body = request.body || {};
    const name = String(body.name || '').trim();
    const price = Number(body.price);
    const bedrooms = Number(body.bedrooms);
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(bedrooms) || bedrooms < 1) {
        return response.status(400).json({ error: 'Name, bedrooms, and a valid price are required' });
    }

    const files = request.files || {};
    const requiredFiles = ['mainImage', 'exteriorImage', 'floorImage', 'pdf'];
    if (requiredFiles.some(field => !files[field]?.[0])) {
        return response.status(400).json({ error: 'Main image, exterior image, floor image, and PDF are required' });
    }

    const planId = Math.max(...getCatalogPlans().map(plan => Number(plan.id)), 0) + 1;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    const saveFile = (field, folder, extension) => {
        const filename = `${bedrooms}-bedroom-${slug}-${field}-${crypto.randomUUID().slice(0, 8)}${extension}`;
        fs.writeFileSync(path.join(__dirname, folder, filename), files[field][0].buffer);
        return `${folder}/${filename}`;
    };
    const mainImage = saveFile('mainImage', 'images', path.extname(files.mainImage[0].originalname) || '.jpg');
    const exteriorImage = saveFile('exteriorImage', 'images', path.extname(files.exteriorImage[0].originalname) || '.jpg');
    const floorImage = saveFile('floorImage', 'images', path.extname(files.floorImage[0].originalname) || '.jpg');
    const pdf = saveFile('pdf', 'pdfs', '.pdf');
    const plan = {
        id: planId,
        createdAt: new Date().toISOString().slice(0, 10),
        name,
        category: String(body.category || `${bedrooms} Bedroom`).trim(),
        bedrooms,
        bathrooms: Number(body.bathrooms || 0),
        floors: Number(body.floors || 1),
        garage: Number(body.garage || 0),
        price,
        image: mainImage,
        images: { main: mainImage, exterior: exteriorImage, floor: floorImage, elevation: null },
        pdf,
        description: String(body.description || '').trim()
    };
    catalogAdditions.push(plan);
    saveCatalogAdditions();
    plans.set(plan.id, { name: plan.name, price: plan.price, pdf: path.basename(plan.pdf) });
    return response.status(201).json(plan);
});

function normalizeInternationalPhoneNumber(phoneNumber) {
    if (typeof phoneNumber !== 'string') return phoneNumber == null ? '' : null;
    const rawPhoneNumber = phoneNumber.trim();
    if (!rawPhoneNumber) return '';

    let normalizedPhoneNumber = rawPhoneNumber.replace(/[^\d+]/g, '');
    if (normalizedPhoneNumber.startsWith('00')) {
        normalizedPhoneNumber = `+${normalizedPhoneNumber.slice(2)}`;
    } else if (/^0[17]\d{8}$/.test(normalizedPhoneNumber)) {
        normalizedPhoneNumber = `+254${normalizedPhoneNumber.slice(1)}`;
    } else if (/^254[17]\d{8}$/.test(normalizedPhoneNumber)) {
        normalizedPhoneNumber = `+${normalizedPhoneNumber}`;
    }

    return /^\+[1-9]\d{6,14}$/.test(normalizedPhoneNumber) ? normalizedPhoneNumber : null;
}

function isValidEmailAddress(emailAddress) {
    return typeof emailAddress === 'string' && emailAddress.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress);
}

function getPesapalBaseUrl() {
    return getPesapalEnvironment() === 'live'
        ? 'https://pay.pesapal.com/v3'
        : 'https://cybqa.pesapal.com/pesapalv3';
}

function getPesapalEnvironment() {
    return process.env.PESAPAL_ENVIRONMENT === 'live' ? 'live' : 'sandbox';
}

function getPublicAppUrl() {
    const baseUrl = process.env.PUBLIC_APP_URL || process.env.RENDER_EXTERNAL_URL;
    return baseUrl ? baseUrl.replace(/\/$/, '') : null;
}

function hasPesapalCredentials() {
    return Boolean(process.env.PESAPAL_CONSUMER_KEY && process.env.PESAPAL_CONSUMER_SECRET);
}

async function getPesapalToken() {
    if (!hasPesapalCredentials()) throw new Error('Pesapal credentials are not configured');
    if (pesapalToken && Date.now() < pesapalTokenExpiresAt) return pesapalToken;

    const response = await fetch(`${getPesapalBaseUrl()}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            consumer_key: process.env.PESAPAL_CONSUMER_KEY,
            consumer_secret: process.env.PESAPAL_CONSUMER_SECRET
        })
    });
    const result = await response.json();
    if (!response.ok || !result.token) throw new Error('Pesapal authentication failed');

    pesapalToken = result.token;
    pesapalTokenExpiresAt = Date.now() + 4 * 60 * 1000;
    return pesapalToken;
}

app.post('/api/admin/pesapal/register-ipn', requireAdmin, async (request, response) => {
    const environment = getPesapalEnvironment();
    if (process.env.PESAPAL_IPN_ID && process.env.PESAPAL_IPN_ENVIRONMENT === environment) {
        return response.json({ ipnId: process.env.PESAPAL_IPN_ID, environment, alreadyRegistered: true });
    }
    const publicUrl = getPublicAppUrl();
    if (!publicUrl || !hasPesapalCredentials()) {
        return response.status(503).json({ error: 'Set the public app URL and Pesapal credentials in Render first.' });
    }

    try {
        const token = await getPesapalToken();
        const resultResponse = await fetch(`${getPesapalBaseUrl()}/api/URLSetup/RegisterIPN`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                url: `${publicUrl}/api/pesapal/ipn`,
                ipn_notification_type: 'GET'
            })
        });
        const result = await resultResponse.json();
        if (!resultResponse.ok || !result.ipn_id) {
            return response.status(502).json({ error: 'Pesapal could not register the notification URL.' });
        }
        return response.status(201).json({ ipnId: result.ipn_id, environment, alreadyRegistered: false });
    } catch (error) {
        console.error('Pesapal IPN registration failed:', error.message);
        return response.status(502).json({ error: 'Could not register the Pesapal notification URL.' });
    }
});

app.post('/api/pesapal/orders', async (request, response) => {
    const planId = Number(request.body?.planId);
    const emailAddress = String(request.body?.emailAddress || '').trim();
    const phoneNumber = normalizeInternationalPhoneNumber(request.body?.phoneNumber);
    const plan = plans.get(planId);
    const publicUrl = getPublicAppUrl();

    if (!plan || !isValidEmailAddress(emailAddress) || phoneNumber === null) {
        return response.status(400).json({ error: 'Enter a valid email address and, if provided, a valid international phone number with its country code.' });
    }
    if (!hasPesapalCredentials() || !process.env.PESAPAL_IPN_ID ||
        process.env.PESAPAL_IPN_ENVIRONMENT !== getPesapalEnvironment() || !publicUrl ||
        !process.env.DOWNLOAD_TOKEN_SECRET || process.env.DOWNLOAD_TOKEN_SECRET.length < 32) {
        return response.status(503).json({ error: 'Online payments are not configured yet. Please contact Barno Plans for assistance.' });
    }

    try {
        const token = await getPesapalToken();
        const merchantReference = `BP-${planId}-${crypto.randomUUID()}`;
        const returnUrl = `${publicUrl}/payment-return.html`;
        const resultResponse = await fetch(`${getPesapalBaseUrl()}/api/Transactions/SubmitOrderRequest`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                id: merchantReference,
                currency: 'KES',
                amount: plan.price,
                description: plan.name.slice(0, 100),
                callback_url: returnUrl,
                cancellation_url: returnUrl,
                redirect_mode: 'TOP_WINDOW',
                notification_id: process.env.PESAPAL_IPN_ID,
                billing_address: {
                    email_address: emailAddress,
                    ...(phoneNumber ? { phone_number: phoneNumber } : {})
                }
            })
        });
        const result = await resultResponse.json();
        if (!resultResponse.ok || !result.redirect_url || !result.order_tracking_id) {
            console.error('Pesapal order request rejected:', result.error?.message || result.message || 'No redirect URL');
            return response.status(502).json({ error: 'Pesapal could not start checkout. Please try again.' });
        }

        orders.set(merchantReference, {
            orderId: merchantReference,
            planId,
            planName: plan.name,
            amount: plan.price,
            currency: 'KES',
            phoneNumber: phoneNumber || null,
            paymentProvider: 'pesapal',
            pesapalTrackingId: result.order_tracking_id,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        saveOrders();
        return response.json({ redirectUrl: result.redirect_url });
    } catch (error) {
        console.error('Pesapal checkout error:', error.message);
        return response.status(502).json({ error: 'Could not start Pesapal checkout. Please try again.' });
    }
});

async function refreshPesapalOrder(merchantReference, trackingId) {
    const order = orders.get(merchantReference);
    if (!order || order.paymentProvider !== 'pesapal' || order.pesapalTrackingId !== trackingId) {
        throw new Error('Payment order not found');
    }

    const token = await getPesapalToken();
    const statusUrl = new URL(`${getPesapalBaseUrl()}/api/Transactions/GetTransactionStatus`);
    statusUrl.searchParams.set('orderTrackingId', trackingId);
    const resultResponse = await fetch(statusUrl, {
        headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }
    });
    const result = await resultResponse.json();
    if (!resultResponse.ok) throw new Error('Pesapal status check failed');

    const paymentCompleted = Number(result.status_code) === 1 &&
        String(result.payment_status_description).toLowerCase() === 'completed' &&
        result.merchant_reference === merchantReference &&
        String(result.currency).toUpperCase() === order.currency &&
        Number(result.amount) === Number(order.amount);

    if (paymentCompleted && order.status !== 'paid') {
        order.status = 'paid';
        order.paidAt = new Date().toISOString();
        order.paymentMethod = result.payment_method || null;
        order.confirmationCode = result.confirmation_code || null;
        saveOrders();
    } else if (!paymentCompleted && Number(result.status_code) >= 2) {
        const status = Number(result.status_code) === 3 ? 'reversed' : 'failed';
        if (order.status !== status) {
            order.status = status;
            saveOrders();
        }
    }
    return order;
}

async function handlePesapalIpn(request, response) {
    const notification = { ...request.query, ...(request.body || {}) };
    const trackingId = String(notification.OrderTrackingId || '');
    const merchantReference = String(notification.OrderMerchantReference || '');
    if (!trackingId || !merchantReference) {
        return response.status(400).json({ orderNotificationType: 'IPNCHANGE', status: 400 });
    }

    try {
        await refreshPesapalOrder(merchantReference, trackingId);
        return response.json({
            orderNotificationType: 'IPNCHANGE',
            orderTrackingId: trackingId,
            orderMerchantReference: merchantReference,
            status: 200
        });
    } catch (error) {
        console.error('Pesapal IPN processing failed:', error.message);
        return response.status(500).json({
            orderNotificationType: 'IPNCHANGE',
            orderTrackingId: trackingId,
            orderMerchantReference: merchantReference,
            status: 500
        });
    }
}

app.get('/api/pesapal/ipn', handlePesapalIpn);
app.post('/api/pesapal/ipn', handlePesapalIpn);

app.get('/api/pesapal/status', async (request, response) => {
    const merchantReference = String(request.query.merchantReference || '');
    const trackingId = String(request.query.trackingId || '');
    if (!merchantReference || !trackingId) {
        return response.status(400).json({ error: 'Payment reference is incomplete.' });
    }

    try {
        const order = await refreshPesapalOrder(merchantReference, trackingId);
        const result = { status: order.status, planName: order.planName };
        if (order.status === 'paid') {
            const expiresAt = Date.now() + 15 * 60 * 1000;
            const payload = `${merchantReference}.${expiresAt}`;
            const signature = crypto.createHmac('sha256', process.env.DOWNLOAD_TOKEN_SECRET).update(payload).digest('hex');
            result.downloadUrl = `/api/download/${encodeURIComponent(merchantReference)}/${expiresAt}.${signature}`;
        }
        return response.json(result);
    } catch (error) {
        console.error('Pesapal payment status check failed:', error.message);
        return response.status(502).json({ error: 'Could not verify payment yet. Please retry shortly.' });
    }
});

app.use((error, request, response, next) => {
    if (error instanceof multer.MulterError || error?.code === 'LIMIT_FILE_SIZE') {
        return response.status(400).json({ error: 'Upload rejected. Use JPG, PNG, or WebP images and a PDF under 15 MB.' });
    }
    if (error) {
        console.error('Unhandled server error:', error.message);
        return response.status(500).json({ error: 'Unexpected server error' });
    }
    return next();
});

app.get('/api/download/:planId/:downloadToken', (request, response) => {
    const merchantReference = request.params.planId;
    const order = orders.get(merchantReference);
    const plan = order && order.status === 'paid' ? plans.get(order.planId) : null;
    const [expiresAt, suppliedSignature] = request.params.downloadToken.split('.');
    const payload = `${merchantReference}.${expiresAt}`;
    const expectedSignature = crypto.createHmac('sha256', process.env.DOWNLOAD_TOKEN_SECRET || '').update(payload).digest('hex');
    const expectedBuffer = Buffer.from(expectedSignature);
    const suppliedBuffer = Buffer.from(suppliedSignature || '');
    const validSignature = suppliedBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(suppliedBuffer, expectedBuffer);

    if (!plan || !validSignature || !Number.isFinite(Number(expiresAt)) || Number(expiresAt) < Date.now()) {
        return response.status(403).json({ error: 'Payment not verified or download link expired.' });
    }

    const filePath = path.join(__dirname, 'pdfs', plan.pdf);
    if (!fs.existsSync(filePath)) return response.status(404).json({ error: 'Plan PDF is not available yet' });
    return response.download(filePath, `${plan.name}.pdf`);
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Barno Plans server running on port ${process.env.PORT || 3000}`);
});
