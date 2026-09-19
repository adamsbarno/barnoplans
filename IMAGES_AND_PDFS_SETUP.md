# 🏠 Barno Plans - Images & PDFs Setup Guide

## ✅ What's Done
- ✅ Created `images/` folder
- ✅ Created `pdfs/` folder  
- ✅ Updated data to reference image and PDF paths
- ✅ Updated script to display real images
- ✅ Added PDF download functionality
- ✅ Changed button from "Request Modification" to "📄 Preview PDF"

---

## 📸 STEP 1: Add Your House Images

### Where to put images:
```
Barno Plans/
└── images/
    ├── maisonette-4bed.jpg      (4 Bedroom Maisonette)
    ├── house-3bed.jpg           (3 Bedroom House)
    └── bungalow-2bed.jpg        (2 Bedroom Bungalow)
```

### Image requirements:
- **Format**: JPG, PNG, or WebP
- **Size**: 800x600 pixels or larger (aspect ratio 4:3)
- **File size**: Keep under 2MB for faster loading
- **Filename**: Must match exactly what's in `data/plans.js`:
  - `maisonette-4bed.jpg`
  - `house-3bed.jpg`
  - `bungalow-2bed.jpg`

### Steps to add images:
1. Take photos or renders of your house plans
2. Resize them to 800x600 pixels (or similar)
3. Save as JPG files in the `images/` folder
4. Make sure filenames match exactly (they're case-sensitive!)
5. Reload the website - images will appear automatically!

---

## 📄 STEP 2: Add Your PDF Plans

### Where to put PDFs:
```
Barno Plans/
└── pdfs/
    ├── plan-4bedroom-maisonette.pdf
    ├── plan-3bedroom-house.pdf
    └── plan-2bedroom-bungalow.pdf
```

### PDF requirements:
- **Format**: PDF only
- **Content**: Architectural drawings, floor plans, elevations
- **File size**: Keep under 10MB
- **Pages**: Can be multiple pages
- **Filename**: Must match exactly what's in `data/plans.js`

### Steps to add PDFs:
1. Prepare your architectural drawings/floor plans (from AutoCAD, SketchUp, etc.)
2. Export as PDF
3. Save in the `pdfs/` folder with correct filename
4. Reload the website - PDFs will be available!

### What happens with PDFs:
- ✅ Users can click "📄 Preview PDF" to view before buying
- ✅ After M-Pesa payment confirmation, PDF auto-downloads
- ✅ Users can also right-click "Preview PDF" → "Save as"

---

## 🧪 TESTING WITHOUT REAL FILES

If you don't have images/PDFs yet, the website shows a placeholder when real files are missing:
- **Images**: Show a placeholder with bedroom count
- **PDFs**: Will show error if not found (can add later)

### Test now with placeholder:
1. Open in browser: `file:///C:/Users/user/Desktop/Barno%20Plans/index.html`
2. Click "View Plan" on any house
3. Click "📄 Preview PDF" button - it will try to open the PDF
4. Click "Buy This Plan" → Enter phone number → Download will work after payment

---

## 📝 FILE CHECKLIST

### Before adding to website:
- [ ] 3 house images ready (JPG format, 800x600px)
- [ ] 3 floor plan PDFs ready
- [ ] Images named: `maisonette-4bed.jpg`, `house-3bed.jpg`, `bungalow-2bed.jpg`
- [ ] PDFs named: `plan-4bedroom-maisonette.pdf`, `plan-3bedroom-house.pdf`, `plan-2bedroom-bungalow.pdf`

### After adding files:
- [ ] Image in `images/` folder
- [ ] PDFs in `pdfs/` folder
- [ ] Filenames match exactly (case-sensitive)
- [ ] Reload website to see changes
- [ ] Test "View Plan" on homepage
- [ ] Test "Preview PDF" button
- [ ] Test buying process

---

## 🎯 CURRENT FILE STRUCTURE

```
Barno Plans/
├── images/                              (YOUR HOUSE PHOTOS GO HERE)
│   ├── README.md
│   ├── maisonette-4bed.jpg             (add this)
│   ├── house-3bed.jpg                  (add this)
│   └── bungalow-2bed.jpg               (add this)
│
├── pdfs/                                (YOUR FLOOR PLANS GO HERE)
│   ├── README.md
│   ├── plan-4bedroom-maisonette.pdf    (add this)
│   ├── plan-3bedroom-house.pdf         (add this)
│   └── plan-2bedroom-bungalow.pdf      (add this)
│
├── data/
│   └── plans.js                        ✅ Updated with image/pdf paths
│
├── index.html                           ✅ Ready
├── plans.html                           ✅ Ready
├── plan-details.html                    ✅ Updated with PDF preview
├── style.css                            ✅ Ready
├── script.js                            ✅ Updated for images & PDF downloads
└── IMPLEMENTATION_GUIDE.md
```

---

## ❓ TROUBLESHOOTING

### Images not showing:
1. Check filename spelling (case-sensitive!)
2. Make sure it's in the `images/` folder
3. Try refreshing browser (Ctrl+F5)
4. Check if file actually exists in folder

### PDF preview not working:
1. Check filename spelling
2. Make sure PDF exists in `pdfs/` folder
3. Make sure PDF is valid/readable

### Download not working after payment:
1. Make sure PDF file exists
2. Check browser's download settings
3. Check browser downloads folder

---

## 🚀 Next Steps

1. **Gather your files**: Get 3 house images and 3 floor plan PDFs
2. **Rename them**: Use exact names from list above
3. **Put in folders**: Save to `images/` and `pdfs/` folders
4. **Reload website**: Refresh your browser
5. **Test everything**: Click through buying process
6. **Upload to hosting**: When ready to go live

---

## 💡 TIPS

- Keep image file sizes small (200-500 KB) for faster loading
- Use high-quality PDFs (300 DPI) for printing
- Test PDFs before uploading to make sure they open correctly
- You can add more plans later - just add to data/plans.js, images/, and pdfs/

---

**Questions? Check the files in each folder (README.md) for more details!**
