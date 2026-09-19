# 📸 Thumbnail Gallery Setup Guide

## What's Now Working

The **Exterior**, **Floor Plan**, and **Elevation** buttons below the main image are now clickable!

When you click on a thumbnail, the main image changes to show that view.

---

## 📁 Folder Structure - What You Need

For each house plan, you now need **4 images** instead of 1:

```
Barno Plans/images/

4 BEDROOM MAISONETTE:
├── maisonette-4bed.jpg              (main image - shows when page loads)
├── maisonette-4bed-exterior.jpg     (shown when "Exterior" clicked)
├── maisonette-4bed-floor.jpg        (shown when "Floor Plan" clicked)
└── maisonette-4bed-elevation.jpg    (shown when "Elevation" clicked)

3 BEDROOM HOUSE:
├── house-3bed.jpg
├── house-3bed-exterior.jpg
├── house-3bed-floor.jpg
└── house-3bed-elevation.jpg

2 BEDROOM BUNGALOW:
├── bungalow-2bed.jpg
├── bungalow-2bed-exterior.jpg
├── bungalow-2bed-floor.jpg
└── bungalow-2bed-elevation.jpg
```

---

## 🖼️ What Each Image Should Be

### Main Image (e.g., `maisonette-4bed.jpg`)
- The main render or photo of the house
- This shows when the page first loads
- Size: 800x600 pixels

### Exterior (`-exterior.jpg`)
- Outside view of the house
- Could be a photo, render, or 3D visualization
- Size: 800x600 pixels

### Floor Plan (`-floor.jpg`)
- Top-down view of the floor layout
- Shows rooms, doors, windows, measurements
- Size: 800x600 pixels

### Elevation (`-elevation.jpg`)
- Side/front view of the house
- Shows the profile and heights
- Size: 800x600 pixels

---

## ✅ How to Get These Images

### Option 1: You Already Have Them
- Use renders from SketchUp, AutoCAD, or your architect
- Screenshot floor plans from your design software
- Take photos of physical models

### Option 2: Create Simple Versions
- Use software like:
  - **SketchUp** (free version available)
  - **Floorplanner** (online, free)
  - **LibreOffice Draw**
  - **Paint.NET**

### Option 3: Placeholder While You Work
- Just duplicate the main image for now:
  ```
  maisonette-4bed.jpg → maisonette-4bed-exterior.jpg (same file)
  maisonette-4bed.jpg → maisonette-4bed-floor.jpg (same file)
  maisonette-4bed.jpg → maisonette-4bed-elevation.jpg (same file)
  ```
- Later, replace with actual images

---

## 🚀 Setup Steps

### Step 1: Prepare Your Images
1. Get/create 4 images per house plan (12 total)
2. Resize all to **800x600 pixels**
3. Save as JPG format

### Step 2: Name Correctly
Use these exact names (case-sensitive):
```
maisonette-4bed.jpg
maisonette-4bed-exterior.jpg
maisonette-4bed-floor.jpg
maisonette-4bed-elevation.jpg

house-3bed.jpg
house-3bed-exterior.jpg
house-3bed-floor.jpg
house-3bed-elevation.jpg

bungalow-2bed.jpg
bungalow-2bed-exterior.jpg
bungalow-2bed-floor.jpg
bungalow-2bed-elevation.jpg
```

### Step 3: Place in images/ Folder
```
C:\Users\user\Desktop\Barno Plans\images\
└── All 12 JPG files here
```

### Step 4: Reload Website
1. Hard refresh browser (Ctrl+Shift+R)
2. Go to plan details page
3. Click the thumbnail buttons!

---

## 🎯 What Happens When You Click Thumbnails

1. **Click "Exterior"** → Shows exterior image
2. **Click "Floor Plan"** → Shows floor plan image
3. **Click "Elevation"** → Shows elevation image
4. **Thumbnails highlight** → Show which one is active

---

## 💡 Tips

- **Consistent sizes** - Keep all images 800x600 pixels for best look
- **File naming** - Must match exactly (no spaces, use hyphens)
- **Image quality** - Use high-quality JPGs for professional look
- **Load time** - Compressed JPGs load faster

---

## 🆘 If Thumbnails Don't Work

1. **Check file names:**
   - Must be exactly: `maisonette-4bed-exterior.jpg`
   - Case-sensitive! (not `Maisonette-4bed-exterior.jpg`)
   
2. **Check folder:**
   - Files in: `Barno Plans/images/`
   - NOT in subdolders
   
3. **Clear browser cache:**
   - Ctrl+Shift+Del → Clear cache
   - Hard refresh: Ctrl+Shift+R

4. **Check console (F12):**
   - Look for error messages
   - Should see: `Changed image to: exterior`

---

## 🔄 If Image Not Found

If you don't have all 4 images yet:
- The main image will load fine
- Clicking thumbnails will show an alert: "Image coming soon!"
- Add images whenever you're ready
- No need to change code

---

## ⏱️ Quick Start

**Minimum to get started:**
1. Have your main 3 images loaded ✓ (you already have these!)
2. Add 3 more images per plan (exterior, floor, elevation)
3. Name them correctly
4. Put in images/ folder
5. Reload website
6. Click thumbnails!

---

## 📊 File Count Checklist

Before uploading:
- [ ] `maisonette-4bed.jpg` ✓
- [ ] `maisonette-4bed-exterior.jpg` (new)
- [ ] `maisonette-4bed-floor.jpg` (new)
- [ ] `maisonette-4bed-elevation.jpg` (new)
- [ ] `house-3bed.jpg` ✓
- [ ] `house-3bed-exterior.jpg` (new)
- [ ] `house-3bed-floor.jpg` (new)
- [ ] `house-3bed-elevation.jpg` (new)
- [ ] `bungalow-2bed.jpg` ✓
- [ ] `bungalow-2bed-exterior.jpg` (new)
- [ ] `bungalow-2bed-floor.jpg` (new)
- [ ] `bungalow-2bed-elevation.jpg` (new)

**Total: 12 JPG files (you have 3, need to add 9 more)**

---

## 🎉 Result

When done, users will be able to:
- ✅ View main image of house
- ✅ Click "Exterior" to see outside view
- ✅ Click "Floor Plan" to see layout
- ✅ Click "Elevation" to see profile
- ✅ Thumbnails highlight when active
- ✅ See visual feedback

Perfect for showcasing your house plans from all angles! 🏠
