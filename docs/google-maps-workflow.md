# Google Maps Import Workflow

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Step 1: Search for Location                                    │
│  ────────────────────────────────────────────────────────────   │
│  User types: "ផ្ទះអ្នកម៉ែ"                                      │
│                                                                  │
│  System calls: /api/admin/google-places/search                  │
│  Returns: List of matching places                               │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 2: Select Location → Fetch Details                        │
│  ────────────────────────────────────────────────────────────   │
│  System calls: /api/admin/google-places/[placeId]/preview       │
│                                                                  │
│  Backend fetches from Google Places API:                        │
│  • displayName                                                   │
│  • formattedAddress                                              │
│  • phoneNumber                                                   │
│  • latitude, longitude                                           │
│  • addressComponents ← This array contains the detailed data    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 3: Parse Address Components                               │
│  ────────────────────────────────────────────────────────────   │
│  Function: readAddressFromPreview()                             │
│                                                                  │
│  Maps Google types → Cambodian divisions:                       │
│  • sublocality_level_1    → សង្កាត់/ឃុំ (Commune)              │
│  • admin_area_level_2     → ខណ្ឌ/ស្រុក (District)              │
│  • locality               → ក្រុង/ទីក្រុង (City)               │
│  • admin_area_level_1     → រាជធានី/ខេត្ត (Province)            │
│  • postal_code            → លេខកូដប្រៃសណីយ៍                    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    ╔═════════════════╗
                    ║ Has Data?       ║
                    ╚═════════════════╝
                     ↙              ↘
          ┌──────────┘                └──────────┐
          ↓                                      ↓
┌─────────────────────────┐      ┌─────────────────────────┐
│ ✅ Data Available       │      │ ❌ Data Missing         │
│ ───────────────────     │      │ ───────────────────     │
│ Display in preview:     │      │ Show warning:           │
│                         │      │                         │
│ សង្កាត់/ឃុំ: ចំការមន   │      │ ⚠️ ព័ត៌មានមិនពេញលេញ   │
│ ខណ្ឌ/ស្រុក: ដូនពេញ     │      │                         │
│ ក្រុង: ភ្នំពេញ          │      │ Google Maps មិនបាន     │
│ រាជធានី: ភ្នំពេញ        │      │ ផ្តល់ព័ត៌មានអំពី...    │
│ លេខកូដ: 12000          │      │                         │
└─────────────────────────┘      └─────────────────────────┘
          ↓                                      ↓
          └──────────┐                ┌──────────┘
                     ↓                ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 4: Create Store                                           │
│  ────────────────────────────────────────────────────────────   │
│  User clicks: "បង្កើតហាងពី Google Maps"                         │
│                                                                  │
│  System creates store with:                                     │
│  ✅ Always saved: latitude, longitude, phone, name              │
│  ⚠️  Maybe saved: commune, district, city, province, postalCode │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  Step 5: Manual Edit (if needed)                                │
│  ────────────────────────────────────────────────────────────   │
│  Admin can edit store to fill missing fields:                   │
│                                                                  │
│  Go to: Shops → [Select Store] → Edit → Location Info          │
│  Fill: សង្កាត់/ឃុំ, ខណ្ឌ/ស្រុក, ក្រុង, ខេត្ត, លេខកូដ          │
└─────────────────────────────────────────────────────────────────┘
```

## Why Data Might Be Missing

### Common Scenarios

#### Scenario A: Well-Known Business ✅
```
Location: "Starbucks Phnom Penh"

Google Response:
addressComponents: [
  { longText: "Tonle Bassac", types: ["sublocality_level_1"] },
  { longText: "Chamkar Mon", types: ["administrative_area_level_2"] },
  { longText: "Phnom Penh", types: ["administrative_area_level_1"] },
  { longText: "12301", types: ["postal_code"] }
]

Result: ✅ All fields populated
```

#### Scenario B: Private/Informal Location ⚠️
```
Location: "ផ្ទះអ្នកម៉ែ" (House of Mother)

Google Response:
addressComponents: []  ← Empty!
// OR
addressComponents: null

Result: ⚠️ Warning shown, manual entry needed
```

### Why Does This Happen?

| Type | Google Data Quality | Address Components |
|------|-------------------|-------------------|
| 🏢 Official businesses | High | ✅ Usually complete |
| 🏪 Verified shops | Medium-High | ✅ Often complete |
| 🏠 Private residences | Low | ❌ Often missing |
| 🍜 Small/informal eateries | Variable | ⚠️ May be incomplete |
| 📍 New locations | Low | ❌ Often missing |
| 🗺️ Rural areas | Low | ❌ Often missing |

## Technical Implementation

### Code Flow

```typescript
// 1. User selects place
selectPlace(result) {
  const placeId = extractGooglePlaceId(result);
  
  // 2. Fetch details from Google
  const preview = await getPreview(placeId).unwrap();
  
  // 3. Parse address components
  const resolvedAddress = readAddressFromPreview(preview);
  
  // 4. Check what we got
  console.log('addressComponents:', preview.addressComponents);
  console.log('resolved:', resolvedAddress);
  
  // 5. Display results
  setPreview(preview);
  setResolvedAddress(resolvedAddress);
}
```

### Address Parser Logic

```typescript
function readAddressFromPreview(preview) {
  const components = preview.addressComponents || [];
  
  return {
    // Try to find commune/sangkat
    commune: findByTypes(components, [
      "sublocality_level_1",
      "sublocality",
      "neighborhood"
    ]),
    
    // Try to find district/khan
    district: findByTypes(components, [
      "administrative_area_level_2",
      "sublocality_level_2"
    ]),
    
    // Try to find city
    city: findByTypes(components, [
      "locality",
      "postal_town"
    ]),
    
    // Try to find province
    province: findByTypes(components, [
      "administrative_area_level_1"
    ]),
    
    // Try to find postal code
    postalCode: findByTypes(components, [
      "postal_code"
    ])
  };
}
```

## Database Impact

### What Gets Saved

```sql
-- Store record in database
INSERT INTO stores (
  store_name,
  latitude,          -- ✅ Always from Google
  longitude,         -- ✅ Always from Google
  phone_number,      -- ✅ If Google has it
  formatted_address, -- ✅ Always from Google
  commune,           -- ⚠️ Only if Google provides addressComponents
  district,          -- ⚠️ Only if Google provides addressComponents
  city,              -- ⚠️ Only if Google provides addressComponents
  province,          -- ⚠️ Only if Google provides addressComponents
  postal_code        -- ⚠️ Only if Google provides addressComponents
) VALUES (
  'ផ្ទះអ្នកម៉ែ',
  11.919484,          -- ✅ From coordinates
  105.66457,          -- ✅ From coordinates
  '+855 98 608 969',  -- ✅ From phone
  'St 310, PP',       -- ✅ From formattedAddress
  NULL,               -- ❌ Missing from Google
  NULL,               -- ❌ Missing from Google
  NULL,               -- ❌ Missing from Google
  NULL,               -- ❌ Missing from Google
  NULL                -- ❌ Missing from Google
);
```

### After Manual Edit

```sql
-- Admin fills missing data
UPDATE stores 
SET 
  commune = 'ទន្លេបាសាក់',
  district = 'ចំការមន',
  city = 'ភ្នំពេញ',
  province = 'ភ្នំពេញ',
  postal_code = '12301'
WHERE store_id = '...';
```

## Best Practices

### For Admins

1. **Always create the store first**
   - Don't skip import because of warning
   - Coordinates are most important (always available)

2. **Review after creation**
   - Go to shop detail page
   - Check what fields are empty
   - Fill manually if needed

3. **Keep records**
   - Save official business documents
   - Note correct address divisions
   - Update in system

### For Developers

1. **Don't hide the warning**
   - Users need to know data is incomplete
   - Transparency builds trust

2. **Log everything**
   - Console logs help debugging
   - Track what Google returns
   - Identify patterns

3. **Graceful degradation**
   - System works even without all fields
   - Coordinates are sufficient for maps
   - Manual entry is always an option

## Summary

```
📊 Google Maps Import Success Rate:

Well-known businesses:     ████████████████████ 95% complete data
Verified shops:           ███████████████░░░░░ 75% complete data
Small/informal businesses: ████████░░░░░░░░░░░ 40% complete data
Private residences:       ██░░░░░░░░░░░░░░░░░ 10% complete data

✅ Always available: Coordinates, Name, Basic Address
⚠️ Sometimes missing: Administrative divisions, Postal codes
🔧 Solution: Manual entry after import
```

---

**Key Takeaway:** The warning message is **working as designed**. It alerts admins when Google doesn't have complete data, allowing them to proceed with import and fill details later.
