# Barno Plans - Implementation Guide

## 1. ADDING HOUSE PICTURES

### Step 1: Create a `images` folder
Create a folder named `images` in your project:
```
Barno Plans/
├── images/
│   ├── plan-1.jpg
│   ├── plan-2.jpg
│   └── plan-3.jpg
├── index.html
├── plans.html
└── ...
```

### Step 2: Update data/plans.js with image paths
Add an `image` property to each plan:

```javascript
const housePlans = [
    {
        id: 1,
        name: "Modern 4 Bedroom Maisonette",
        category: "Maisonette",
        bedrooms: 4,
        bathrooms: 4,
        floors: 2,
        garage: 1,
        price: 15000,
        image: "images/plan-1.jpg"  // ADD THIS LINE
    },
    {
        id: 2,
        name: "Modern 3 Bedroom House",
        category: "3 Bedroom",
        bedrooms: 3,
        bathrooms: 3,
        floors: 1,
        garage: 1,
        price: 10000,
        image: "images/plan-2.jpg"  // ADD THIS LINE
    },
    {
        id: 3,
        name: "Modern 2 Bedroom Bungalow",
        category: "Bungalow",
        bedrooms: 2,
        bathrooms: 2,
        floors: 1,
        garage: 1,
        price: 8000,
        image: "images/plan-3.jpg"  // ADD THIS LINE
    }
];
```

### Step 3: Update script.js to use real images
In `script.js`, update the `renderPlanCards()` function:

**Find this:**
```javascript
<div class="plan-image">
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Crect fill='%23d5d5d5' width='100%25' height='100%25'/%3E%3Ctext x='50%25' y='50%25' font-size='18' fill='%23999' text-anchor='middle' dy='.3em'%3E${plan.bedrooms} Bed ${plan.category}%3C/text%3E%3C/svg%3E" alt="${plan.name}">
</div>
```

**Replace with:**
```javascript
<div class="plan-image">
    <img src="${plan.image}" alt="${plan.name}">
</div>
```

---

## 2. ADDING PDF DOWNLOADS AFTER PAYMENT

### Step 1: Create a `pdfs` folder
```
Barno Plans/
├── pdfs/
│   ├── plan-1.pdf
│   ├── plan-2.pdf
│   └── plan-3.pdf
├── data/
├── images/
└── ...
```

### Step 2: Update data/plans.js with PDF paths
```javascript
const housePlans = [
    {
        id: 1,
        name: "Modern 4 Bedroom Maisonette",
        // ... other properties ...
        pdf: "pdfs/plan-1.pdf"  // ADD THIS LINE
    },
    // ... more plans ...
];
```

### Step 3: Update script.js to add PDF download function
Add this function to `script.js`:

```javascript
// Download PDF file
function downloadPlanPDF(plan) {
    const link = document.createElement('a');
    link.href = plan.pdf;
    link.download = `${plan.name}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
```

### Step 4: Update payment confirmation to trigger download
Replace the `confirmPayment()` function in `script.js`:

```javascript
// Confirm Payment and Send Receipt
function confirmPayment(plan, phoneNumber) {
    const confirmBtn = document.getElementById('confirm-payment');
    confirmBtn.textContent = 'Processing...';
    confirmBtn.disabled = true;
    
    // Simulate payment processing
    setTimeout(function() {
        confirmBtn.textContent = 'I\'ve Completed Payment';
        confirmBtn.disabled = false;
        
        // Show success message
        alert(`✓ Payment Confirmed!\n\nThank you for purchasing:\n${plan.name}\n\nAmount: KSh ${plan.price.toLocaleString()}\n\nYour house plan files will be sent to ${phoneNumber} shortly.\n\nPlease check your email for download links.`);
        
        // DOWNLOAD PDF AUTOMATICALLY
        setTimeout(function() {
            downloadPlanPDF(plan);
        }, 1000);
        
        // Close modal
        document.getElementById('mpesa-modal').style.display = 'none';
    }, 1500);
}
```

### Step 5: Add download button to plan-details.html
Add this button to the purchase section:

```html
<div class="purchase-section">
    <button class="buy-button">
        Buy This Plan
    </button>
    
    <button class="custom-button">
        Request Modification
    </button>
    
    <!-- Add this if user wants to preview first -->
    <a href="#" id="preview-pdf" class="button" style="background: #666; color: white; display: inline-flex; align-items: center; padding: 15px 25px; border-radius: 8px;">
        📄 Preview PDF
    </a>
</div>
```

And add this JavaScript to handle the preview:

```javascript
// In the loadPlanDetails() function, add:
const previewBtn = document.getElementById('preview-pdf');
if (previewBtn && plan.pdf) {
    previewBtn.href = plan.pdf;
    previewBtn.target = '_blank';
}
```

---

## 3. REAL M-PESA PAYMENT INTEGRATION

### Option A: Using M-Pesa Daraja API (Recommended for Production)

#### What You Need:
1. **M-Pesa Business Account** - Apply at Safaricom
2. **Consumer Key & Consumer Secret** - From Safaricom developer portal
3. **Shortcode** - Your M-Pesa business shortcode
4. **Passkey** - Your M-Pesa passkey
5. **Backend Server** - Node.js, Python, or PHP

#### Step 1: Create a Backend (Example: Node.js)

Install dependencies:
```bash
npm install express axios dotenv body-parser
```

Create `server.js`:
```javascript
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// M-Pesa Configuration
const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const SHORTCODE = process.env.MPESA_SHORTCODE;
const PASSKEY = process.env.MPESA_PASSKEY;
const CALLBACK_URL = process.env.CALLBACK_URL;

// Get Access Token
async function getAccessToken() {
    try {
        const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            auth: {
                username: CONSUMER_KEY,
                password: CONSUMER_SECRET
            }
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
    }
}

// Initiate STK Push (M-Pesa Prompt)
app.post('/api/mpesa-payment', async (req, res) => {
    try {
        const { phoneNumber, amount, planId, planName } = req.body;
        const accessToken = await getAccessToken();
        
        const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
        const password = Buffer.from(`${SHORTCODE}${PASSKEY}${timestamp}`).toString('base64');
        
        const payload = {
            BusinessShortCode: SHORTCODE,
            Password: password,
            Timestamp: timestamp,
            TransactionType: 'CustomerPayBillOnline',
            Amount: amount,
            PartyA: phoneNumber,
            PartyB: SHORTCODE,
            PhoneNumber: phoneNumber,
            CallBackURL: CALLBACK_URL,
            AccountReference: `PLAN-${planId}`,
            TransactionDesc: planName
        };
        
        const response = await axios.post(
            'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
            payload,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('M-Pesa payment error:', error.response?.data || error.message);
        res.status(500).json({ error: 'Payment initiation failed' });
    }
});

// Callback from M-Pesa
app.post('/api/mpesa-callback', (req, res) => {
    const callbackData = req.body.Body.stkCallback;
    
    if (callbackData.ResultCode === 0) {
        // Payment successful
        console.log('Payment successful:', callbackData);
        // TODO: Update database, send email with PDF download link
    } else {
        // Payment failed
        console.log('Payment failed:', callbackData);
    }
    
    res.json({ ResultCode: 0, ResultDesc: 'Received' });
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

Create `.env` file:
```
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=your_shortcode
MPESA_PASSKEY=your_passkey
CALLBACK_URL=https://your-domain.com/api/mpesa-callback
```

#### Step 2: Update Frontend to Call Backend
Update `script.js`:

```javascript
// M-Pesa Payment Integration
async function buyPlanWithMpesa(plan) {
    const phoneNumber = prompt('Enter your M-Pesa phone number (254xxxxxxxxx):', '254');
    
    if (!phoneNumber) return;
    
    if (!/^254\d{9}$/.test(phoneNumber)) {
        alert('Please enter a valid phone number in format 254xxxxxxxxx');
        return;
    }
    
    try {
        const response = await fetch('/api/mpesa-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phoneNumber: phoneNumber,
                amount: plan.price,
                planId: plan.id,
                planName: plan.name
            })
        });
        
        const data = await response.json();
        
        if (data.ResponseCode === '0') {
            showMpesaModal(plan, phoneNumber);
        } else {
            alert('Error initiating payment: ' + data.ResponseDescription);
        }
    } catch (error) {
        console.error('Payment error:', error);
        alert('Failed to initiate payment');
    }
}
```

---

### Option B: Using Flutterwave, Pesapal, or Jambopay (Easier for Beginners)

These platforms provide M-Pesa integration without complex backend setup:

#### Flutterwave Example:
```html
<script src="https://checkout.flutterwave.com/v3.js"></script>

<script>
function buyWithFlutterwave(plan) {
    FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-xxxxx",
        tx_ref: `plan-${plan.id}-${Date.now()}`,
        amount: plan.price,
        currency: "KES",
        payment_options: "card,ussd,mpesa",
        customer: {
            email: "customer@example.com",
            phone_number: "254xxxxxxxxx",
            name: "Customer Name"
        },
        callback: function(data) {
            if (data.status === 'successful') {
                downloadPlanPDF(plan);
            }
        }
    });
}
</script>
```

---

### Option C: Testing with Postman (Before Going Live)

1. **Get Safaricom M-Pesa sandbox credentials** from developer.safaricom.co.ke
2. **Use Postman** to test your backend API
3. **Test phone numbers** for sandbox: Use Safaricom test numbers provided in docs

---

## QUICK CHECKLIST

- [ ] Create `images/` folder with house pictures
- [ ] Create `pdfs/` folder with house plans PDFs
- [ ] Update `data/plans.js` with `image` and `pdf` properties
- [ ] Update `script.js` to display real images
- [ ] Add PDF download functionality
- [ ] Choose M-Pesa integration method (Daraja API or third-party)
- [ ] Test payment flow with test credentials
- [ ] Set up email notifications for customers

Would you like me to implement any of these steps for you?
