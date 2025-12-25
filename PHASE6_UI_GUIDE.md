# Phase 6 UI Implementation Guide

## 🎨 User Interface Overview

The nursing module UI has been built with a **mobile-first, user-friendly** design focused on making clinical workflows efficient and intuitive.

## ✅ Completed Components

### Reusable Components (`components/nursing/`)

#### 1. **NandaCard.tsx**
Displays NANDA diagnosis in a clean, scannable format.

**Features:**
- Color-coded type badges (Actual: red, Risk: orange, Health Promotion: green, Syndrome: purple)
- Domain display with icon
- Collapsible details view
- Risk factors & characteristics count
- Touch-optimized for mobile

**Usage:**
```tsx
<NandaCard 
  nanda={nandaDiagnosis} 
  onPress={() => navigate('NandaDetail', { nandaId: nanda.id })}
  showDetails={true}
/>
```

#### 2. **CarePlanItemCard.tsx** ⭐ KEY DIFFERENTIATOR
Displays care plan items with **ICD-10 → NANDA bridge visualization**.

**Features:**
- **Visual bridge flow**: ICD-10 code → NANDA diagnosis (clearly shows the unique mapping)
- Status indicator with color coding
- NIC/NOC intervention count badges
- NOC score progress tracker (1-5 scale)
- Progress bar for goal achievement
- Goal statement display

**Usage:**
```tsx
<CarePlanItemCard 
  item={carePlanItem} 
  onPress={() => viewDetails(item)}
/>
```

#### 3. **SbarPreview.tsx**
Professional SBAR report display with proper formatting.

**Features:**
- Urgency level badge (Routine: green, Urgent: orange, Emergent: red)
- Four SBAR sections with icons
- Vital signs display box
- Recipient role indicator
- Timestamp

**Usage:**
```tsx
<SbarPreview report={sbarReport} />
```

---

### Screen Components (`screens/nursing/`)

#### 1. **NandaSearchScreen.tsx**
Search and browse NANDA diagnoses.

**Features:**
- Real-time search (triggers at 2+ characters)
- Filter pills for diagnosis type (actual, risk, health promotion, syndrome)
- Popular diagnoses section when no search
- Empty state with helpful messaging
- Touch-optimized list cards

**Navigation:**
- → `NandaDetailScreen` (tap any diagnosis)

#### 2. **NandaDetailScreen.tsx**
Comprehensive NANDA diagnosis details with NNN linkages.

**Features:**
- Full definition display
- Defining characteristics list
- Risk factors & related factors
- **NNN Linkages section** (Evidence-based interventions & outcomes)
- NIC Interventions with activities preview
- NOC Outcomes with indicators preview
- Color-coded intervention/outcome cards

**Key Value:** Shows nurses exactly which interventions and outcomes are evidence-linked to each diagnosis.

#### 3. **CarePlanBuilderScreen.tsx** ⭐ MAGIC FEATURE
Auto-generate care plans from ICD-10 codes using the bridge.

**Features:**
- Care plan name input
- ICD-10 code entry with pill-style chips
- **Real-time care plan suggestions** as codes are added
- Visual ICD-10 → NANDA → NIC → NOC flow for each suggestion
- Preview of interventions & outcomes
- **One-tap auto-generation** of complete care plan
- Loading states with progress indicators

**The Workflow:**
1. Enter ICD-10 codes (e.g., I50.9, E11.9)
2. System shows NANDA suggestions with NIC/NOC linkages
3. Tap "Auto-Generate Care Plan"
4. Complete care plan created with all items, goals, and scores

**Navigation:**
- → `CarePlanDetailScreen` (after generation)

#### 4. **CarePlanListScreen.tsx**
List all care plans for a patient.

**Features:**
- Care plan cards with status badges
- Item count & active item count
- Start/end date display
- Empty state with create action
- Add another care plan button

**Navigation:**
- → `CarePlanBuilderScreen` (create new)
- → `CarePlanDetailScreen` (tap existing plan)

#### 5. **SbarGeneratorScreen.tsx**
Create SBAR handoff reports with smart templates.

**Features:**
- **Auto-generated templates** from patient/encounter data
- Urgency level selector (routine, urgent, emergent)
- Four SBAR text sections with helper prompts
- Vital signs input grid (Temp, HR, BP, RR, SpO2)
- Recipient role field
- Save & share functionality

**The Magic:** Templates pre-fill with patient history, diagnoses, and context - nurse just needs to refine.

---

## 🎯 Navigation Integration

### Add to Main Navigation

```tsx
// In your main navigator (e.g., App.tsx or navigation/index.tsx)
import {
  NandaSearchScreen,
  NandaDetailScreen,
  CarePlanBuilderScreen,
  CarePlanListScreen,
  SbarGeneratorScreen,
} from './screens/nursing';

// Add to stack navigator
<Stack.Screen 
  name="NandaSearch" 
  component={NandaSearchScreen}
  options={{ title: 'NANDA Diagnoses' }}
/>
<Stack.Screen 
  name="NandaDetail" 
  component={NandaDetailScreen}
  options={{ title: 'Diagnosis Details' }}
/>
<Stack.Screen 
  name="CarePlanBuilder" 
  component={CarePlanBuilderScreen}
  options={{ title: 'Create Care Plan' }}
/>
<Stack.Screen 
  name="CarePlanList" 
  component={CarePlanListScreen}
  options={{ title: 'Care Plans' }}
/>
<Stack.Screen 
  name="SbarGenerator" 
  component={SbarGeneratorScreen}
  options={{ title: 'SBAR Report' }}
/>
```

### Recommended Menu Structure

```
Patient Dashboard
├── 📋 Care Plans → CarePlanListScreen
│   └── ➕ Create Care Plan → CarePlanBuilderScreen
├── 🔍 NANDA Search → NandaSearchScreen
└── 📝 SBAR Report → SbarGeneratorScreen
```

---

## 🎨 Design System

### Colors
- **Primary (Blue)**: `#3b82f6` - Actions, links, active states
- **Success (Green)**: `#10b981` - Completed, active, NIC interventions
- **Warning (Orange)**: `#f59e0b` - Risk diagnoses, urgent
- **Danger (Red)**: `#ef4444` - Emergent, actual diagnoses
- **Purple**: `#8b5cf6` - NANDA diagnoses, syndrome type
- **Yellow**: `#fbbf24` - NOC outcomes

### Typography
- **Titles**: 24px, weight 700
- **Section Headers**: 16px, weight 700
- **Body Text**: 15px, weight 400
- **Labels**: 14px, weight 600
- **Captions**: 12px, weight 500

### Spacing
- Section padding: 20px
- Card padding: 16px
- Element gaps: 8-12px
- Border radius: 8-12px

### Icons
- Emojis are used throughout for visual clarity and mobile-friendliness
- Each SBAR section has a unique emoji identifier
- Status indicators use color dots + text

---

## 📱 Mobile UX Patterns

### Touch Targets
- Minimum button height: 44px
- Minimum touch area: 44x44px
- Adequate spacing between interactive elements

### Scrolling
- All screens use `ScrollView` for keyboard handling
- Lists use `FlatList` for performance
- Content padding ensures nothing is hidden behind tab bars

### Loading States
- Spinners for async operations
- Loading text for user feedback
- Skeleton screens could be added (future enhancement)

### Empty States
- Helpful messaging
- Clear call-to-action buttons
- Icon/emoji for visual interest

### Error Handling
- Alert dialogs for errors
- Inline validation where appropriate
- Helpful error messages

---

## 🚀 Key User Flows

### Flow 1: Create Care Plan from Diagnoses
```
Patient Record → Care Plans → Create
  → Enter ICD-10 codes (I50.9, J44.0)
  → See NANDA suggestions appear automatically
  → Review bridge: ICD-10 → NANDA → NIC → NOC
  → Tap "Auto-Generate"
  → Complete care plan created! ✅
```

### Flow 2: Search NANDA & View Linkages
```
Menu → NANDA Search
  → Type "pain"
  → Results filtered in real-time
  → Tap diagnosis
  → See full details + NNN linkages
  → Review evidence-based interventions & outcomes
```

### Flow 3: Create SBAR Report
```
Patient → SBAR Report
  → Select report type (Shift Handoff)
  → Template auto-fills from patient data
  → Enter vital signs
  → Refine situation/assessment/recommendation
  → Save → Share with team ✅
```

---

## ⚡ Performance Considerations

### Optimizations
- Use `React.memo()` for complex cards
- Lazy load NANDA details (only fetch when screen opens)
- Cache popular diagnoses
- Debounce search input (already implemented)

### Offline Support
- Services already built for offline-first
- UI shows cached data when offline
- Sync indicators could be added (future enhancement)

---

## 🧪 Testing Checklist

- [ ] Search NANDA diagnoses
- [ ] View diagnosis details with NNN linkages
- [ ] Create care plan from ICD-10 codes
- [ ] Verify ICD-10→NANDA bridge displays correctly
- [ ] View care plan list
- [ ] Generate SBAR report
- [ ] Test all navigation flows
- [ ] Verify touch targets on mobile device
- [ ] Test with real patient data
- [ ] Test offline functionality

---

## 🔮 Future Enhancements

### Phase 6.1
- [ ] Care plan detail screen (view/edit existing plans)
- [ ] Care plan evaluation screen (update NOC scores)
- [ ] SBAR history screen (view past reports)
- [ ] Voice-to-text for SBAR (using AssemblyAI)

### Phase 6.2
- [ ] Care plan templates library
- [ ] Bulk NANDA search from encounter diagnoses
- [ ] Care plan sharing between nurses
- [ ] Outcome trend charts (NOC score over time)

### Phase 6.3
- [ ] AI-powered SBAR suggestions
- [ ] Clinical decision support alerts
- [ ] Integration with EHR systems
- [ ] Print/PDF export for care plans

---

## 📚 Related Documentation

- **PHASE6_NURSING_MODULE.md** - Complete feature overview
- **PHASE6_IMPLEMENTATION_GUIDE.md** - Backend setup
- **PHASE6_QUICK_REFERENCE.md** - API reference
- **database/nursing-schema.sql** - Database structure
- **types/nursing.ts** - TypeScript definitions

---

## 💡 Tips for Success

1. **Highlight the Bridge**: The ICD-10→NANDA mapping is your competitive advantage - make it prominent!
2. **One-Tap Magic**: Auto-generation should feel magical but not mysterious - show previews
3. **Mobile First**: Test on actual devices, not just simulators
4. **Clinical Accuracy**: Involve nurses in UX testing - they'll spot workflow issues
5. **Save Time**: Every feature should save nurses 5-10+ minutes vs manual process

---

**Status**: UI implementation complete ✅  
**Next Step**: Add navigation integration and test end-to-end flows
