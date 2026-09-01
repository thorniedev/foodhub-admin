# Google Maps Address Display Fix

## Problem
When importing store information from Google Maps, the Cambodian administrative divisions were not being displayed in the preview, even though they were being extracted from Google's API:

- **សង្កាត់/ឃុំ** (Sangkat/Khum - Commune)
- **ខណ្ឌ/ស្រុក** (Khan/Srok - District)  
- **ក្រុង/ទីក្រុង** (Krong - City/Town)
- **រាជធានី/ខេត្ត** (Province/Capital)
- **លេខកូដប្រៃសណីយ៍** (Postal Code)

### Example Case
When searching for "ផ្ទះអ្នកម៉ែ" (House of Mother), the fields show as empty (—) even though phone number and coordinates are populated.

## Root Causes

### 1. Display Issue (Fixed)
The `GooglePlacesImportModal` component had a function `readAddressFromPreview()` that correctly extracted these administrative divisions from Google's `addressComponents` array, and stored them in the `resolvedAddress` state. 

However, the `GooglePlacePreviewCard` component that displays the preview to users was:
1. Not receiving the `resolvedAddress` data as a prop
2. Only displaying the formatted address string, not the individual administrative divisions

### 2. Data Availability Issue (Potential)
Google Places API may not always return complete address component data for all locations, especially:
- Informal businesses
- New or unverified locations
- Places without complete Google Maps data
- Residential or private locations

## Solution

### Part 1: Display Fix (Completed)
Updated `GooglePlacesImportModal.tsx` to:

1. **Pass the resolved address data to the preview card:**
   ```tsx
   <GooglePlacePreviewCard preview={preview} resolvedAddress={resolvedAddress} />
   ```

2. **Update the preview card to accept and display administrative divisions:**
   - Added `resolvedAddress` parameter to `GooglePlacePreviewCard` function
   - Added display rows for each administrative division field when available
   - Added a warning message when no address components are found

3. **Added debug logging:**
   - Logs the preview response from Google
   - Logs the addressComponents array
   - Logs the resolved address fields
   - Check browser console when testing

### Part 2: Data Investigation
To check if Google is providing the data:

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Search for "ផ្ទះអ្នកម៉ែ" in Google Maps import
4. Look for logs starting with `[GooglePlacesImport]`
5. Check if `addressComponents` array is present and contains the data

**Expected structure:**
```javascript
addressComponents: [
  {
    longText: "Chamkarmon",
    shortText: "Chamkarmon", 
    types: ["sublocality_level_1", "sublocality", "political"]
  },
  {
    longText: "Phnom Penh",
    shortText: "Phnom Penh",
    types: ["administrative_area_level_1", "political"]
  },
  // ... more components
]
```

## Technical Details

### Address Component Mapping
The system maps Google Places API address component types to Cambodian administrative divisions:

```typescript
{
  // Commune / Sangkat
  commune: getComponentByTypes(
    comps,
    "sublocality_level_1",
    "sublocality",
    "neighborhood",
    "ward",
    "quarter",
  ),
  
  // District / Khan
  district: getComponentByTypes(
    comps,
    "administrative_area_level_2",
    "sublocality_level_2",
  ),
  
  // City / Town
  city: getComponentByTypes(
    comps,
    "locality",
    "postal_town",
    "administrative_area_level_3",
  ),
  
  // Province / Capital
  province: getComponentByTypes(
    comps,
    "administrative_area_level_1",
  ),
  
  // Postal Code
  postalCode: getComponentByTypes(comps, "postal_code"),
}
```

### Google Places API Integration
The preview endpoint (`/api/admin/google-places/[placeId]/preview/route.ts`):
1. Fetches data from FoodHub backend
2. **Directly calls Google Places API** to get `addressComponents`
3. Merges the data before sending to frontend
4. Uses field mask: `addressComponents,shortFormattedAddress,formattedAddress`

### Why Data Might Be Missing

**Google's addressComponents may be incomplete for:**
- Unofficial or informal businesses
- Private residences or homes
- New locations not fully verified in Google Maps
- Places in areas with limited address data
- Locations that were manually added without full details

**Workaround:**
When address components are missing, the system now:
1. Shows a warning message in the preview
2. Allows store creation to proceed
3. Admin can manually fill in the missing address fields after store creation

## Testing Steps

1. **Clear browser cache** and reload
2. Navigate to Shops → Import from Google Maps
3. Search for "ផ្ទះអ្នកម៉ែ" 
4. Select the result
5. Check browser console for debug logs
6. Verify if administrative divisions appear in preview OR warning message shows

## Next Steps

If the data is still not showing after this fix:

1. **Check console logs** to see if `addressComponents` array is present
2. **Compare with a well-known location** (e.g., "Starbucks Phnom Penh") to verify the system works
3. **If Google data is missing**: This is a Google Maps data limitation, not a code issue
4. **Manual entry**: After creating the store, edit it to add missing address fields

## Impact
- Administrators can now see all administrative division details when available
- Clear warning when data is missing from Google
- Debug logs help troubleshoot data availability issues
- The data was always being saved correctly to the database; this fix addresses:
  - Display in the preview
  - Visibility of data availability issues

## Files Changed
- `src/components/shops/GooglePlacesImportModal.tsx`
  - Added `resolvedAddress` prop to preview card
  - Added display rows for each address field
  - Added warning message for missing data
  - Added console debug logging
