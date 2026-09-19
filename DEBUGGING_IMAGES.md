# 🔍 Debugging Images on Plan Details Page

## QUICK TEST

1. **Reload the website** (Ctrl+F5 to force refresh)
2. **Click "View Plan" on any house** from homepage
3. **Check if images appear now**

If images still don't show, follow these steps:

---

## HOW TO CHECK BROWSER CONSOLE (For Debugging)

### Step 1: Open Developer Tools
- Open the plan-details.html page
- Press **F12** on keyboard
- The Developer Tools panel will open at bottom

### Step 2: Click the "Console" tab
- You should see black console with text
- Look for any red error messages

### Step 3: Check for errors
Look for messages like:
- ✅ Good: `Loading plan ID: 1` or `Plan loaded: {object}`
- ❌ Bad: Red errors or "Uncaught TypeError"

---

## MANUAL TEST

### If images still don't show:

**Step 1: Go to Firefox or Chrome**
- Press **F12** to open Developer Tools
- Go to **Console** tab

**Step 2: Try this command:**
Paste this into the console and press Enter:
```javascript
console.log(housePlans);
```

You should see:
```
Array(3)
  0: {id: 1, name: "Modern 4 Bedroom Maisonette", image: "images/maisonette-4bed.jpg", ...}
  1: {id: 2, name: "Modern 3 Bedroom House", image: "images/house-3bed.jpg", ...}
  2: {id: 3, name: "Modern 2 Bedroom Bungalow", image: "images/bungalow-2bed.jpg", ...}
```

**Step 3: Test the image paths:**
Type this in console:
```javascript
console.log(housePlans[0].image);
```

Should show: `images/maisonette-4bed.jpg`

**Step 4: Test loading the plan:**
Type this:
```javascript
loadPlanDetails(housePlans[0]);
```

The image should appear on the page!

---

## COMMON ISSUES & FIXES

### ❌ Issue: "housePlans is not defined"
**Fix:** The data/plans.js file isn't loading
- Check that data/plans.js exists in the folder
- Make sure it's linked in plan-details.html
- Try hard refresh: Ctrl+Shift+Del to clear cache

### ❌ Issue: Image shows as placeholder
**Possible causes:**
1. Image filename doesn't match exactly (check spelling!)
2. Image file not in images/ folder
3. Wrong file format (should be .jpg)

**Fix:**
- Go to Barno Plans/images/ folder
- Check files are named:
  - `maisonette-4bed.jpg`
  - `house-3bed.jpg`
  - `bungalow-2bed.jpg`
- Filenames are case-sensitive!

### ❌ Issue: "Cannot find main-product-image"
**Fix:**
- Make sure plan-details.html hasn't been edited
- Check that the div exists: `<div class="main-product-image">`
- Hard refresh browser

---

## STEP BY STEP VERIFICATION

### ✅ Step 1: File Check
Verify these files exist:

```
Barno Plans/
├── data/
│   └── plans.js                    ← Should have image paths
├── images/
│   ├── maisonette-4bed.jpg        ← Should be here
│   ├── house-3bed.jpg             ← Should be here
│   └── bungalow-2bed.jpg          ← Should be here
├── script.js                       ← Should load data & display images
└── plan-details.html               ← Should link both files
```

### ✅ Step 2: Link Check
Open plan-details.html and look for these at the bottom:
```html
<script src="data/plans.js"></script>
<script src="script.js"></script>
```

### ✅ Step 3: Console Check
1. Open plan-details.html?id=1 in browser
2. Press F12
3. Go to Console tab
4. Look for these messages (scroll up if needed):
   - `Loading plan ID: 1`
   - `Plan loaded: Object { id: 1, name: "Modern 4 Bedroom Maisonette", ... }`

If you don't see these, check:
- Are scripts linked correctly in HTML?
- Is there a JavaScript error (red text)?

### ✅ Step 4: Image Path Check
In Console, type:
```javascript
document.querySelector('.main-product-image')
```

Should show: `<div class="main-product-image"><img src="images/maisonette-4bed.jpg" ...`

If it shows `<div class="main-product-image">House Render</div>`, then the image wasn't set.

---

## IF STILL NOT WORKING

**Tell me:**
1. What do you see in the console? (Any red errors?)
2. What's in your images/ folder? (Exact filenames)
3. Does the plan details page load at all?
4. Do you see the placeholder or blank area?

---

## QUICK FIXES TO TRY

1. **Clear browser cache:**
   - Press Ctrl+Shift+Del
   - Select "Cached images and files"
   - Click Clear

2. **Hard refresh:**
   - Hold Ctrl and press F5 multiple times
   - Or press Ctrl+Shift+R

3. **Close and reopen browser**
   - Close all tabs with plan-details.html
   - Reopen the file

4. **Check file names:**
   - Images must be exactly: `maisonette-4bed.jpg`, `house-3bed.jpg`, `bungalow-2bed.jpg`
   - Case-sensitive! (maisonette, not Maisonette)

---

## STILL STUCK?

**Share with me:**
1. Screenshot of what you see
2. Screenshot of Developer Console (F12)
3. What error messages appear (if any)
4. What files are in your images/ folder

Then I can help fix it faster! 🔧
