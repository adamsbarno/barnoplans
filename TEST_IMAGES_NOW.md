# ✅ QUICK TEST - Images on Plan Details Page

## 🚀 Do This Now

### Step 1: Hard Refresh Browser
1. Open any page on your Barno Plans website
2. Press **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)
3. Wait for page to reload

### Step 2: Test the Homepage
1. You should see your house photos on the homepage
2. Verify they look good
3. Confirm filenames:
   - 4 Bedroom = `maisonette-4bed.jpg`
   - 3 Bedroom = `house-3bed.jpg`
   - 2 Bedroom = `bungalow-2bed.jpg`

### Step 3: Click "View Plan"
1. Click any "View Plan" button
2. Look at plan-details.html page
3. **Check if your house image appears in the large area at top**

---

## 🔍 If Images Still Don't Show

### Open Browser Console (Debug)
1. Press **F12** on keyboard
2. Click **Console** tab at top
3. Look for one of these:

**GOOD (images working):**
```
Loading plan ID: 1
Plan loaded: Object
Setting image source to: images/maisonette-4bed.jpg
Image added to DOM
```

**BAD (there's a problem):**
- Red error messages
- "housePlans is not defined"
- "Cannot find main-product-image"

---

## 📋 File Verification Checklist

Run through this checklist:

- [ ] Images folder exists at: `Barno Plans/images/`
- [ ] All 3 images in folder:
  - [ ] `maisonette-4bed.jpg` (4 bed)
  - [ ] `house-3bed.jpg` (3 bed)
  - [ ] `bungalow-2bed.jpg` (2 bed)
- [ ] Filenames are **exact** (case-sensitive!)
- [ ] All images are JPG format
- [ ] Filenames have NO spaces (use hyphens instead)
- [ ] `data/plans.js` exists and has image paths
- [ ] `script.js` exists and has loadPlanDetails function
- [ ] `plan-details.html` exists and links both scripts

---

## 💡 If Console Shows Error

### Error: "housePlans is not defined"
- The data/plans.js file isn't loading
- Solution: Check that both scripts are linked at bottom of plan-details.html:
  ```html
  <script src="data/plans.js"></script>
  <script src="script.js"></script>
  ```

### Error: Image path wrong
- The image path in data/plans.js doesn't match actual filename
- Solution: 
  1. Check exact spelling of filenames
  2. Make sure they're in images/ folder
  3. Verify case (capitalization)

### Error: Can't find element
- The HTML element structure is wrong
- Solution: Don't edit plan-details.html HTML structure

---

## ✨ Expected Result

When everything works:
1. ✅ Homepage shows 3 house photos
2. ✅ Plans.html shows house photos on cards
3. ✅ Plan-details.html shows LARGE house photo at top
4. ✅ All other details load (price, bedrooms, etc.)
5. ✅ Buttons work (Preview PDF, Buy This Plan)

---

## 🆘 Still Stuck?

**Check these common issues:**

1. **Wrong folder?**
   - Images must be in: `Barno Plans/images/`
   - NOT in: `Barno Plans/data/images/` or anywhere else

2. **Wrong filename?**
   - `maisonette-4bed.jpg` ← Exact spelling required
   - Not: `Maisonette-4bed.jpg` or `maisonette-4Bed.jpg`

3. **File type wrong?**
   - Must be `.jpg` or `.jpeg`
   - Not `.png` or `.gif` (can use those but have to update data/plans.js)

4. **Browser cache?**
   - Try Ctrl+Shift+Del to clear cache
   - Close browser completely and reopen

---

## 📞 Questions?

If images still don't show:
1. Check DEBUGGING_IMAGES.md for detailed troubleshooting
2. Check the browser console for error messages
3. Verify file names and paths match exactly
4. Try clearing browser cache

The code is now updated and should work! 🎉
