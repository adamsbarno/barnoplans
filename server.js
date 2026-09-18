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
const payments = new Map();
const adminSessions = new Map();
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
}

function saveCatalogOverrides() {
    fs.writeFileSync(catalogOverridesFile, JSON.stringify(catalogOverrides, null, 2));
}

function saveCatalogAdditions() {
    fs.writeFileSync(catalogAdditionsFile, JSON.stringify(catalogAdditions, null, 2));
}

function saveContactSubmissions() {
    fs.writeFileSync(contactsFile, JSON.stringify(contactSubmissions, null, 2));
}

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: '20kb' }));
const apiLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 200, standardHeaders: 'draft-7', legacyHeaders: false });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: 'draft-7', legacyHeaders: false });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 20, standardHeaders: 'draft-7', legacyHeaders: false });
app.use('/api', apiLimiter);
app.use('/pdfs', (request, response) => response.status(404).json({ error: 'PDF access requires a verified payment' }));
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

function validatePhone(phoneNumber) {
    return typeof phoneNumber === 'string' && /^2547\d{8}$/.test(phoneNumber);
}

function normalizePhoneNumber(phoneNumber) {
    if (typeof phoneNumber !== 'string') return null;
    const digits = phoneNumber.replace(/\D/g, '');
    if (/^07\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
    if (/^2547\d{8}$/.test(digits)) return digits;
    return null;
}

async function getAccessToken() {
    const credentials = Buffer.from(
        `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
    ).toString('base64');

    const response = await fetch(
        'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
        { headers: { Authorization: `Basic ${credentials}` } }
    );

    if (!response.ok) {
        throw new Error(`OAuth request failed with status ${response.status}`);
    }

    return (await response.json()).access_token;
}

app.post('/api/mpesa/stk-push', async (request, response) => {
    try {
        const { planId } = request.body;
        const phoneNumber = normalizePhoneNumber(request.body.phoneNumber);
        const plan = plans.get(Number(planId));

        if (!plan || !validatePhone(phoneNumber)) {
            return response.status(400).json({ error: 'Invalid plan or phone number' });
        }

        const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
        const password = Buffer.from(
            `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
        ).toString('base64');
        const accessToken = await getAccessToken();

        const mpesaResponse = await fetch(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    BusinessShortCode: process.env.MPESA_SHORTCODE,
                    Password: password,
                    Timestamp: timestamp,
                    TransactionType: 'CustomerPayBillOnline',
                    Amount: plan.price,
                    PartyA: phoneNumber,
                    PartyB: process.env.MPESA_SHORTCODE,
                    PhoneNumber: phoneNumber,
                    CallBackURL: process.env.MPESA_CALLBACK_URL,
                    AccountReference: `PLAN-${planId}`,
                    TransactionDesc: plan.name
                })
            }
        );
        const result = await mpesaResponse.json();

        if (!mpesaResponse.ok || result.ResponseCode !== '0') {
            return response.status(502).json({ error: result.errorMessage || result.ResponseDescription || 'STK Push failed' });
        }

        const downloadToken = crypto.randomUUID();
        const orderId = `BP-${Date.now()}-${planId}`;
        orders.set(orderId, {
            orderId,
            planId: Number(planId),
            planName: plan.name,
            amount: plan.price,
            phoneNumber,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        saveOrders();
        payments.set(result.CheckoutRequestID, {
            orderId,
            planId: Number(planId),
            phoneNumber,
            downloadToken,
            paid: false,
            createdAt: Date.now()
        });

        return response.json({ checkoutRequestId: result.CheckoutRequestID, downloadToken });
    } catch (error) {
        console.error('M-Pesa STK Push error:', error.message);
        return response.status(500).json({ error: 'Could not start M-Pesa payment' });
    }
});

app.post('/api/mpesa/callback', (request, response) => {
    const callback = request.body?.Body?.stkCallback;
    const payment = callback && payments.get(callback.CheckoutRequestID);

    if (payment && callback.ResultCode === 0) {
        payment.paid = true;
        payment.paidAt = Date.now();
        const order = orders.get(payment.orderId);
        if (order) {
            order.status = 'paid';
            order.paidAt = new Date().toISOString();
            saveOrders();
        }
    }

    return response.json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

app.get('/api/mpesa/status/:checkoutRequestId', (request, response) => {
    const payment = payments.get(request.params.checkoutRequestId);
    if (!payment) return response.status(404).json({ error: 'Payment not found' });
    return response.json({ paid: payment.paid, orderId: payment.orderId });
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
    const payment = [...payments.values()].find(item =>
        item.planId === Number(request.params.planId) &&
        item.downloadToken === request.params.downloadToken &&
        item.paid
    );
    const plan = plans.get(Number(request.params.planId));

    if (!payment || !plan) return response.status(403).json({ error: 'Payment not verified' });

    const filePath = path.join(__dirname, 'pdfs', plan.pdf);
    if (!fs.existsSync(filePath)) return response.status(404).json({ error: 'Plan PDF is not available yet' });
    return response.download(filePath, `${plan.name}.pdf`);
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Barno Plans server running on port ${process.env.PORT || 3000}`);
});
