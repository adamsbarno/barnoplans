# Barno Plans launch checklist

## Completed in the project

- Ten house plans are registered with matching images and PDFs.
- Catalog search, filters, sorting, and plan comparison are available.
- Mobile navigation and enquiry form are included.
- SEO descriptions and social metadata are included.
- Order records persist in `data/orders.json`.
- Admin users can add future plans and upload their images and PDF from `/admin.html`.
- Contact enquiries are stored in `data/contact-submissions.json`.

## Still requires your accounts

1. Wait for Pesapal API approval and add its credentials only to `.env`.
2. Choose a domain name and hosting provider that supports Node.js.
3. Set the production `PORT` and public callback/webhook URL.
4. Set the production Pesapal callback URL in the provider dashboard.
5. Test one payment and one PDF delivery on the public domain.
6. Replace the local M-Pesa/manual fallback after automatic payment is confirmed.
7. Add a privacy notice explaining payment and customer-data handling.
8. Keep `.env` private and never upload it to GitHub.

## Before launch

- Check every plan image, PDF, price, and description.
- Test the mobile layout.
- Test contact and WhatsApp links.
- Test payment confirmation and PDF access.
- Back up `data/orders.json` securely.
