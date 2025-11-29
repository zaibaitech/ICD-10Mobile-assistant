# Offline Mode Testing Guide

## 🧪 How to Test Offline Functionality

### Prerequisites
1. Expo Go app installed on your phone
2. App running in tunnel mode: `npm start -- --tunnel`
3. Logged in with a valid account

---

## Test Scenarios

### ✅ Scenario 1: Create Patient Offline
**Steps:**
1. Open the app and navigate to **Patients** tab
2. Turn on **Airplane Mode** on your device
3. Verify **red "Offline mode"** banner appears at top
4. Tap **+** button to create new patient
5. Fill in:
   - Display Label: "Test Offline Patient"
   - Year of Birth: 1990
   - Sex: Male
6. Tap **Create**
7. Patient should appear in list immediately with temp ID
8. Turn **Airplane Mode OFF**
9. Wait 5-10 seconds for auto-sync
10. Banner should change to **"Syncing..."** then disappear
11. Refresh patient list - patient now has real UUID

**Expected Result:** Patient created offline, synced when online, appears in database

---

### ✅ Scenario 2: Create Encounter Offline
**Steps:**
1. Navigate to **Patients** tab
2. Select a patient (or create one while online)
3. Turn on **Airplane Mode**
4. Tap **Add Encounter** button
5. Fill in encounter form:
   - Date: Today
   - Chief Complaint: "Fever and headache"
   - Symptoms: Check "Fever", "Headache"
   - Temperature: 38.5
   - Pain Severity: 6/10
6. Tap **Save**
7. Encounter appears in patient's encounter list
8. Turn **Airplane Mode OFF**
9. Wait for auto-sync
10. Tap encounter to verify AI analysis can now run (needs online)

**Expected Result:** Encounter saved offline, synced when online, visible in database

---

### ✅ Scenario 3: Update Patient While Offline
**Steps:**
1. Navigate to **Patients** tab
2. Select a patient
3. Turn on **Airplane Mode**
4. Tap **Edit** (if available) or update notes
5. Change patient details (e.g., add notes)
6. Save changes
7. Changes appear immediately in UI
8. Turn **Airplane Mode OFF**
9. Wait for sync
10. Refresh patient - changes persisted

**Expected Result:** Updates queued offline, synced when online

---

### ✅ Scenario 4: View Data While Offline
**Steps:**
1. Navigate to **Patients** tab while **ONLINE**
2. Open several patients and encounters (to populate cache)
3. Turn on **Airplane Mode**
4. Navigate away and back to **Patients** tab
5. All previously viewed patients should still be visible
6. Open patient detail - encounters should still load from cache
7. Try to create new encounter - should queue for sync

**Expected Result:** Cached data remains accessible offline

---

### ✅ Scenario 5: Offline Indicator Behavior
**Steps:**
1. Start **ONLINE** - banner should be hidden
2. Turn on **Airplane Mode**
3. **Red banner** appears: "Offline mode" with cloud-offline icon
4. Create 2-3 patients or encounters
5. Turn **Airplane Mode OFF**
6. Banner turns **orange**: "3 pending sync" with cloud-upload icon
7. Tap the banner to manually trigger sync
8. Banner shows **"Syncing..."** with spinner
9. After sync completes, banner disappears

**Expected Result:** Clear visual feedback for network state and sync status

---

### ✅ Scenario 6: Manual Sync Trigger
**Steps:**
1. Create some data while offline (3-4 patients)
2. Turn **Airplane Mode OFF**
3. Orange banner appears: "X pending sync"
4. **Tap the banner**
5. Sync starts immediately (spinner appears)
6. Wait for completion
7. Banner disappears

**Expected Result:** User can manually trigger sync instead of waiting 5 minutes

---

### ✅ Scenario 7: Failed Sync Recovery
**Steps:**
1. Turn on **Airplane Mode**
2. Create a patient with invalid data (if validation allows)
3. Turn **Airplane Mode OFF**
4. Auto-sync attempts, fails due to invalid data
5. Check queue (via debugging or console logs)
6. Retry count should increment
7. After 3 failed retries, item marked as failed
8. User can tap banner to retry manually

**Expected Result:** Failed operations don't block queue, retry logic works

---

## 🔍 Debugging Tips

### Check AsyncStorage Cache
Run in terminal (with app running):
```bash
# This requires React Native Debugger or Flipper
# Or add console.log in code:
AsyncStorage.getAllKeys().then(console.log)
```

### Check Sync Queue
Add this to any screen to see queue status:
```tsx
import { getQueue, getPendingCount, getFailedItems } from '../services/syncQueue';

// In a useEffect or button press:
const debugQueue = async () => {
  const queue = await getQueue();
  const pending = await getPendingCount();
  const failed = await getFailedItems();
  
  console.log('Queue:', queue);
  console.log('Pending:', pending);
  console.log('Failed:', failed);
};
```

### Monitor Network State
Already built into OfflineContext, check logs:
```
[OfflineContext] Initializing...
[Sync Manager] Starting...
[Sync Manager] Network state: true
[Sync Manager] Syncing 3 operations...
[Sync Manager] ✓ Synced create on patients
[Sync Manager] Sync complete: 3 success, 0 failed
```

### Verify Database Sync
Check Supabase dashboard:
1. Go to https://hwclojaalnzruviubxju.supabase.co
2. Navigate to **Table Editor**
3. Open **patients** table
4. Verify offline-created records now have real UUIDs
5. Check `created_at` timestamps match when sync occurred

---

## 📊 Success Metrics

✅ **Data Integrity**: No data loss during offline operations
✅ **UI Responsiveness**: Optimistic updates feel instant
✅ **Auto-Sync**: Queue processes within 5 minutes of going online
✅ **User Awareness**: Clear indicators show offline state
✅ **Error Recovery**: Failed operations retry or notify user

---

## 🐛 Known Limitations (Current Implementation)

1. **Temp IDs**: Offline-created records have `temp_*` IDs until synced
2. **Conflict Resolution**: Last-write-wins (no user prompt yet)
3. **Cache Expiry**: No automatic cache expiration (stays until cleared)
4. **Large Datasets**: May slow down with 1000+ cached records
5. **Background Sync**: Only syncs when app is in foreground

---

## 🚀 Next Testing Phase

After manual testing passes, implement:
1. Automated tests with Jest + React Native Testing Library
2. Network simulation tests (slow 3G, intermittent)
3. Stress testing with large datasets (100+ patients, 1000+ encounters)
4. Battery impact testing (sync manager efficiency)
5. Storage limits testing (AsyncStorage 6MB default limit)

---

**Ready to Test!** Follow scenarios above and report any issues.
