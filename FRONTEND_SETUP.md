# Bridging Medical Deserts - Frontend Documentation

## Overview

A geospatial intelligence platform for NGO planners to identify healthcare gaps ("cold spots") and plan resource deployments. Built with React, TypeScript, Leaflet, and Tailwind CSS.

## Architecture

```
src/
├── components/
│   ├── chat/                    # Modular chat components
│   │   ├── ChatMessage.tsx      # Individual message with markdown support
│   │   ├── ChainOfThoughtStepper.tsx  # AI reasoning visualization
│   │   ├── CitationList.tsx     # 1-click source citations
│   │   ├── QuickQueryBar.tsx    # Pre-defined query buttons
│   │   └── ChatInput.tsx        # Message input with send
│   ├── ChatConsole.tsx          # Main AI chat interface
│   ├── DashboardHeader.tsx      # Top navigation
│   ├── IntelligenceMap.tsx      # Leaflet map with facilities & cold spots
│   ├── MobileChatSheet.tsx      # Mobile bottom sheet for chat
│   ├── MobileVerificationSheet.tsx  # Mobile facility details
│   ├── PlanningPanel.tsx        # Drag-drop resource planning
│   ├── StatsBar.tsx             # Dashboard statistics
│   ├── UploadModule.tsx         # File upload with chunking
│   └── VerificationSidebar.tsx  # Facility verification panel
├── data/
│   └── mockData.ts              # Demo data (replace with API)
├── lib/
│   └── api.ts                   # Centralized API service layer
└── pages/
    └── Index.tsx                # Main dashboard page
```

## Backend API Integration

### Setup

1. Set the API base URL in `.env`:
   ```env
   VITE_API_URL=https://your-backend-url.com
   ```

2. If using authentication, implement token storage in `src/lib/api.ts`:
   ```typescript
   const getAuthHeaders = () => {
     const token = localStorage.getItem('auth_token');
     return token ? { Authorization: `Bearer ${token}` } : {};
   };
   ```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/parse` | POST | Upload and parse PDF/Excel/CSV files |
| `/parse/chunk` | POST | Upload file chunks (for large files) |
| `/parse/finalize` | POST | Finalize chunked upload |
| `/ingest` | POST | Bulk ingest facility records |
| `/facilities` | GET | Fetch all facilities for map |
| `/facility/:id` | GET | Get single facility with citations |
| `/query` | POST | Natural language AI queries |
| `/plan` | POST | Save resource deployment plan |
| `/plans` | GET | Fetch all saved plans |
| `/cold-spots` | GET | Fetch cold spot analysis data |
| `/stats` | GET | Dashboard statistics |
| `/citation/:sourceId` | GET | Get PDF citation URL |

### Connecting Components to Backend

#### 1. Upload Module → `/parse`

The upload module automatically handles:
- File validation (PDF, Excel, CSV)
- Chunked uploads for files >5MB
- Progress tracking
- Error handling with retry

```typescript
// In UploadModule.tsx, replace the simulation with:
const { data, error } = await uploadAndParseFile(file, handleProgress);
```

#### 2. Intelligence Map → `/facilities` & `/cold-spots`

Replace mock data with API calls:

```typescript
// In IntelligenceMap.tsx
import { getFacilities, getColdSpots } from "@/lib/api";

useEffect(() => {
  async function loadData() {
    const [facilitiesRes, coldSpotsRes] = await Promise.all([
      getFacilities(),
      getColdSpots(),
    ]);
    if (facilitiesRes.data) setFacilities(facilitiesRes.data);
    if (coldSpotsRes.data) setColdSpots(coldSpotsRes.data);
  }
  loadData();
}, []);
```

#### 3. Chat Console → `/query`

Replace simulation with real AI queries:

```typescript
// In ChatConsole.tsx
import { queryAI } from "@/lib/api";

const { data, error } = await queryAI(userQuery, {
  selectedFacilityId: selectedFacility?.id,
  mapBounds: currentBounds,
});
```

#### 4. Verification Sidebar → `/facility/:id`

Fetch full facility details on selection:

```typescript
// In VerificationSidebar.tsx
import { getFacilityById } from "@/lib/api";

useEffect(() => {
  if (facility.id) {
    getFacilityById(facility.id).then(({ data }) => {
      if (data) setFullDetails(data);
    });
  }
}, [facility.id]);
```

#### 5. Planning Panel → `/plan`

Save deployments to backend:

```typescript
// In PlanningPanel.tsx
import { savePlan } from "@/lib/api";

const handleSavePlan = async () => {
  const { data, error } = await savePlan({
    name: `Plan ${Date.now()}`,
    resources: droppedResources,
  });
  if (data?.success) {
    toast.success("Plan saved to backend");
  }
};
```

## Error Handling

All API functions return `{ data, error }` format:

```typescript
const { data, error } = await someApiCall();

if (error) {
  toast.error(error);
  return;
}

// Use data safely
```

### Common Error Messages

| Error | User Message | Solution |
|-------|--------------|----------|
| File too large | "Try a smaller file or split into chunks" | Files >5MB auto-chunk |
| Network error | "Check your connection" | Retry button shown |
| Unauthorized | "Please log in again" | Redirect to login |
| Server error | "Something went wrong" | Contact support |

## Testing Endpoints

1. **Upload**: Try uploading a PDF with facility data
2. **Map**: Verify facilities appear with correct markers
3. **Chat**: Ask "Where are the nearest labs?"
4. **Sidebar**: Click a facility, verify citations load
5. **Planning**: Drag a doctor icon onto a cold spot, save

## Databricks Configuration Note

If you encounter issues with Databricks backend integration:

1. Ensure the backend Databricks connection is properly configured
2. The frontend only calls API endpoints after backend configuration
3. Check `/api/health` endpoint to verify backend status
4. Contact backend team if API endpoints return 503 errors

## Performance Targets

- Natural language query response: **<3 seconds**
- Map render with 1000 facilities: **<1 second**
- File upload progress: Real-time updates
- Sidebar open animation: **300ms**

## Mobile Responsiveness

- **Desktop**: Full layout with side-by-side panels
- **Tablet**: Collapsible sidebar, full map
- **Mobile**: Bottom sheets for chat and verification
