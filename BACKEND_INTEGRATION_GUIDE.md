# 🏥 Bridging Medical Deserts - Backend Integration Guide

**Share this document with your backend team for API integration.**

---

## 📁 Project Structure Overview

```
├── public/                      # Static assets (favicon, robots.txt)
├── src/
│   ├── components/              # React UI components
│   │   ├── chat/                # Chat console sub-components
│   │   │   ├── ChatMessage.tsx        # Message bubble with markdown
│   │   │   ├── ChainOfThoughtStepper.tsx  # AI reasoning steps display
│   │   │   ├── CitationList.tsx       # Source citations UI
│   │   │   ├── QuickQueryBar.tsx      # Quick query buttons
│   │   │   ├── ChatInput.tsx          # Text input for chat
│   │   │   └── index.ts               # Barrel export
│   │   ├── ui/                  # Reusable UI primitives (shadcn)
│   │   ├── ChatConsole.tsx      # Main AI chat interface
│   │   ├── DashboardHeader.tsx  # Top navigation bar
│   │   ├── IntelligenceMap.tsx  # Leaflet map with markers
│   │   ├── MobileChatSheet.tsx  # Mobile chat drawer
│   │   ├── MobileVerificationSheet.tsx  # Mobile facility details
│   │   ├── PlanningPanel.tsx    # Drag-drop resource planning
│   │   ├── StatsBar.tsx         # Dashboard statistics cards
│   │   ├── UploadModule.tsx     # File upload with chunking
│   │   └── VerificationSidebar.tsx  # Facility verification panel
│   ├── data/
│   │   └── mockData.ts          # ⚠️ Mock data (replace with API calls)
│   ├── hooks/                   # Custom React hooks
│   ├── lib/
│   │   ├── api.ts               # ⭐ API SERVICE LAYER (ALL ENDPOINTS HERE)
│   │   └── utils.ts             # Utility functions
│   ├── pages/
│   │   ├── Index.tsx            # Main dashboard page
│   │   └── NotFound.tsx         # 404 page
│   ├── index.css                # Global styles & design tokens
│   ├── main.tsx                 # React entry point
│   └── App.tsx                  # Router & providers
├── FRONTEND_SETUP.md            # Detailed frontend docs
├── index.html                   # HTML entry point
├── tailwind.config.ts           # Tailwind CSS configuration
├── vite.config.ts               # Vite bundler configuration
└── package.json                 # Dependencies
```

---

## 🔌 API ENDPOINTS (Backend Must Implement)

**All endpoints are defined in: `src/lib/api.ts`**

### Base URL Configuration
```env
# .env file
VITE_API_URL=https://your-backend-url.com
```

---

### 📤 FILE UPLOAD ENDPOINTS

#### `POST /parse`
Upload and parse PDF/Excel/CSV files.

**Request:**
```
Content-Type: multipart/form-data
Body: FormData with 'file' field
```

**Response:**
```json
{
  "success": true,
  "recordsProcessed": 150,
  "recordsFailed": 2,
  "facilities": [
    {
      "id": "f1",
      "name": "Kigali Central Hospital",
      "lat": -1.9403,
      "lng": 29.8739,
      "type": "hospital",
      "status": "verified",
      "confidence": 0.94,
      "surgicalCapacity": true,
      "beds": 450,
      "doctors": 82,
      "lastUpdated": "2024-11-15",
      "source": "WHO Health Facility Registry 2024",
      "sourceSnippet": "Kigali Central Hospital — tertiary referral...",
      "sourcePage": 14,
      "anomalies": []
    }
  ],
  "errors": ["Row 45: Invalid coordinates"]
}
```

#### `POST /parse/chunk`
For large files (>5MB), files are uploaded in chunks.

**Request:**
```
Content-Type: multipart/form-data
Body:
  - chunk: Blob (file chunk)
  - uploadId: string
  - chunkIndex: number
  - totalChunks: number
  - fileName: string
  - fileType: string
```

#### `POST /parse/finalize`
Finalize chunked upload.

**Request:**
```json
{
  "uploadId": "upload_123456_abc",
  "fileName": "facilities.pdf"
}
```

#### `POST /ingest`
Bulk ingest pre-processed facility records.

**Request:**
```json
{
  "records": [
    { "name": "...", "lat": -1.94, "lng": 29.87, "type": "hospital", ... }
  ]
}
```

**Response:**
```json
{
  "processed": 100,
  "failed": 2
}
```

---

### 🗺️ FACILITY ENDPOINTS

#### `GET /facilities`
Fetch all facilities for map display.

**Query Parameters (optional):**
- `region`: Filter by region name
- `status`: Filter by "verified" | "unverified" | "flagged"
- `type`: Filter by "hospital" | "clinic" | "lab" | "pharmacy"

**Response:**
```json
[
  {
    "id": "f1",
    "name": "Kigali Central Hospital",
    "lat": -1.9403,
    "lng": 29.8739,
    "type": "hospital",
    "status": "verified",
    "confidence": 0.94,
    "surgicalCapacity": true,
    "beds": 450,
    "doctors": 82,
    "lastUpdated": "2024-11-15",
    "source": "WHO Health Facility Registry 2024",
    "sourceSnippet": "...",
    "sourcePage": 14,
    "anomalies": []
  }
]
```

#### `GET /facility/:id`
Get single facility with full citation details.

**Response:** Same as facility object above

---

### 🔴 COLD SPOTS ENDPOINT

#### `GET /cold-spots`
Fetch areas with high population but zero surgical capacity.

**Response:**
```json
[
  {
    "lat": -2.35,
    "lng": 29.4,
    "intensity": 0.9,
    "population": 180000,
    "nearestFacilityKm": 78
  }
]
```

---

### 🤖 AI QUERY ENDPOINT

#### `POST /query`
Natural language AI queries. **Target response time: <3 seconds**

**Request:**
```json
{
  "question": "Where are the nearest labs?",
  "context": {
    "selectedFacilityId": "f1",
    "mapBounds": [-2.5, 29.0, -1.0, 30.5]
  }
}
```

**Response:**
```json
{
  "answer": "Found **1 verified lab** within your area: **Gitarama Lab**...",
  "type": "reasoning",
  "chainOfThought": [
    {
      "step": 1,
      "title": "Navigating WHO facility registry",
      "detail": "Searching Rwanda health facility database...",
      "status": "complete"
    },
    {
      "step": 2,
      "title": "Cross-referencing population data",
      "detail": "Found 3 facilities. Cross-referencing with UN population grid...",
      "status": "complete"
    },
    {
      "step": 3,
      "title": "Flagged as Cold Spot",
      "detail": "Region flagged: high population density...",
      "status": "complete"
    }
  ],
  "citations": [
    {
      "id": "c1",
      "source": "WHO Health Facility Registry 2024",
      "page": 14,
      "snippet": "Kigali Central Hospital — tertiary referral, 450 beds...",
      "confidence": 0.94
    }
  ],
  "mapHighlights": {
    "facilityIds": ["f1", "f6"],
    "coldSpotIndices": [0, 2],
    "bounds": [-2.5, 29.0, -1.0, 30.5]
  }
}
```

**Response Types:**
- `basic`: Simple text answer
- `reasoning`: Includes Chain of Thought steps
- `geospatial`: Includes map highlights

---

### 📋 PLANNING ENDPOINTS

#### `POST /plan`
Save resource deployment plan.

**Request:**
```json
{
  "name": "Southern Province Deployment",
  "resources": [
    {
      "resourceId": "r1",
      "resourceType": "doctor",
      "lat": -2.35,
      "lng": 29.4,
      "label": "General Practitioner"
    }
  ]
}
```

**Response:**
```json
{
  "id": "plan_123",
  "success": true
}
```

#### `GET /plans`
Fetch all saved plans.

---

### 📊 DASHBOARD STATS

#### `GET /stats`
Fetch dashboard statistics.

**Response:**
```json
{
  "totalFacilities": 847,
  "verifiedFacilities": 623,
  "coldSpots": 34,
  "populationAtRisk": 2400000,
  "pendingVerifications": 89,
  "lastSyncDate": "2024-12-01"
}
```

---

### 📄 PDF CITATION

#### `GET /citation/:sourceId?page=14`
Get PDF viewer URL for 1-click citation access.

**Response:**
```json
{
  "url": "https://storage.example.com/docs/who-registry.pdf#page=14",
  "highlightText": "Kigali Central Hospital"
}
```

---

## 🔐 Authentication

The frontend expects JWT token-based auth:

```typescript
// Stored in localStorage
localStorage.setItem('auth_token', 'your-jwt-token');

// Sent with every request
Authorization: Bearer <token>
```

---

## 📱 TypeScript Interfaces

All data types are defined in `src/lib/api.ts`:

```typescript
interface Facility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'hospital' | 'clinic' | 'lab' | 'pharmacy';
  status: 'verified' | 'unverified' | 'flagged';
  confidence: number;          // 0.0 - 1.0
  surgicalCapacity: boolean;
  beds: number;
  doctors: number;
  lastUpdated: string;         // ISO date
  source: string;              // Document name
  sourceSnippet: string;       // Quoted text from source
  sourcePage: number;          // Page number in PDF
  anomalies: string[];         // Warning messages
}

interface ColdSpot {
  lat: number;
  lng: number;
  intensity: number;           // 0.0 - 1.0 (higher = more critical)
  population: number;
  nearestFacilityKm: number;
}

interface ChainStep {
  step: number;
  title: string;
  detail: string;
  status: 'complete' | 'active' | 'pending';
}

interface Citation {
  id: string;
  source: string;
  page: number;
  snippet: string;
  confidence: number;          // 0.0 - 1.0
}
```

---

## 🚀 Quick Start for Backend Team

1. **Clone the repo** and run `npm install`
2. **Create `.env`** with `VITE_API_URL=http://localhost:8000`
3. **Implement endpoints** following the specs above
4. **Test with frontend**:
   - Upload a PDF → verify `/parse` works
   - Load map → verify `/facilities` returns data
   - Ask a question → verify `/query` responds in <3s
   - Click facility → verify `/facility/:id` loads details
   - Save a plan → verify `/plan` persists data

---

## 📞 Contact

Questions? Reach out to the frontend team or open a GitHub issue.

**Frontend Preview URL:** https://id-preview--2f42ab6a-86d1-4fb6-b157-a192a6c3375a.lovable.app
