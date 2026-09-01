# Testing Google Maps Address Components

## Quick Test Steps

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Open Browser Developer Tools
- Press `F12` or right-click → Inspect
- Go to the **Console** tab

### 3. Navigate to Shops Import
1. Go to `/shops` page
2. Click "Import from Google Maps" button
3. Keep the Console tab visible

### 4. Test with Different Locations

#### Test Case 1: Well-Known Location (Should Have Full Data)
**Search:** `Starbucks Phnom Penh` or `Brown Coffee Phnom Penh`

**Expected Result:**
- Console logs should show:
  ```
  [GooglePlacesImport] Preview response: {...}
  [GooglePlacesImport] Address components: [...]
  [GooglePlacesImport] Resolved address: {...}
  ```
- Preview should display:
  - សង្កាត់/ឃុំ (Commune)
  - ខណ្ឌ/ស្រុក (District)
  - ក្រុង/ទីក្រុង (City)
  - រាជធានី/ខេត្ត (Province)
  - លេខកូដប្រៃសណីយ៍ (Postal Code) - if available

#### Test Case 2: Your Specific Location
**Search:** `ផ្ទះអ្នកម៉ែ`

**Check Console Logs:**
1. Look for `[GooglePlacesImport] Address components:` log
2. Check if the array is:
   - **Empty or null**: Google doesn't have detailed address data
   - **Has data**: The data should appear in preview

**Expected Behavior:**
- If data exists: Fields will show in preview
- If data missing: Yellow warning box appears saying:
  > "ព័ត៌មានអាសយដ្ឋានមិនពេញលេញ - Google Maps មិនបានផ្តល់ព័ត៌មានអំពីសង្កាត់/ឃុំ..."

## Understanding Console Logs

### Example of GOOD data (has address components):
```javascript
[GooglePlacesImport] Address components: [
  {
    longText: "Chamkarmon",
    shortText: "Chamkarmon",
    types: ["sublocality_level_1", "sublocality", "political"]
  },
  {
    longText: "Khan Chamkarmon", 
    types: ["administrative_area_level_2", "political"]
  },
  {
    longText: "Phnom Penh",
    types: ["administrative_area_level_1", "political"]
  },
  {
    longText: "Cambodia",
    types: ["country", "political"]
  }
]

[GooglePlacesImport] Resolved address: {
  commune: "Chamkarmon",
  district: "Khan Chamkarmon",
  city: null,
  province: "Phnom Penh",
  postalCode: null,
  formattedAddress: "..."
}
```

### Example of MISSING data:
```javascript
[GooglePlacesImport] Address components: null
// OR
[GooglePlacesImport] Address components: []

[GooglePlacesImport] Resolved address: {
  commune: null,
  district: null,
  city: null,
  province: null,
  postalCode: null,
  formattedAddress: "..."
}
```

## Troubleshooting

### Issue: No logs appear in console
**Cause:** JavaScript not loading or errors
**Solution:** 
- Check browser console for any red errors
- Try hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Clear cache and reload

### Issue: addressComponents is null/empty
**Cause:** Google doesn't have detailed address data for this location
**Reason:** Could be:
- Private residence (not a business)
- New location not fully verified
- Informal/unofficial business
- Area with limited Google Maps data

**Solution:** 
- Try a different, well-known location to verify system works
- For locations with missing data, admin must manually enter address fields after store creation
- This is a Google Maps data limitation, not a bug

### Issue: addressComponents exists but fields still empty
**Cause:** Type mapping mismatch
**Solution:**
1. Copy the console log of `addressComponents`
2. Check the `types` array in each component
3. Verify if types match our mapping (see docs)
4. May need to add additional type mappings

## Comparison Test

To verify the system is working correctly:

1. **Test with known good location:**
   ```
   Search: "Aeon Mall Phnom Penh"
   Expected: Full address details should appear
   ```

2. **Test with your location:**
   ```
   Search: "ផ្ទះអ្នកម៉ែ"
   Check: Compare console logs between both searches
   ```

If Aeon Mall shows data but your location doesn't, it's a **Google data availability issue**, not a code bug.

## What Gets Saved to Database

**Important:** Even if preview shows empty fields, the system still saves:
- Latitude/Longitude (coordinates)
- formattedAddress (full address string)
- Phone number
- Other available data

**The missing fields can be manually filled later** by editing the store.

## API Endpoint Information

The data comes from:
1. **Frontend search:** `/api/admin/google-places/search?query=...`
2. **Frontend preview:** `/api/admin/google-places/[placeId]/preview`
3. **Google Places API:** Direct call from backend server
   - Endpoint: `https://places.googleapis.com/v1/places/{placeId}`
   - Field mask: `addressComponents,shortFormattedAddress,formattedAddress`

Check these endpoints in Network tab (F12 → Network) to see raw responses.
