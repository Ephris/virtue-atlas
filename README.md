# Bridging Medical Deserts Platform

## Virtue Foundation - Health Infrastructure Intelligence Dashboard

A high-fidelity React dashboard for NGO planners to identify and address healthcare gaps using geospatial intelligence and AI-powered analysis.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
# or
bun install
```

### 2. Configure Backend URL
Edit `src/lib/api.ts` and update the API_BASE_URL:

```typescript
// Change from:
const API_BASE_URL = 'http://localhost:8000';

// To your production URL:
const API_BASE_URL = 'https://your-api-server.com';
```

Or use environment variable:
```bash
VITE_API_URL=https://your-api-server.com npm run dev
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 📦 Modules Overview

### 1. **Upload Module** (`src/components/UploadModule.tsx`)
- Drag-drop PDF, Excel, CSV files
- **Chunked upload** for large files (handles "unable to upload all records" issue)
- Real-time progress bar
- Retry on error

**Endpoints:**
- `POST /parse` - Upload single file
- `POST /parse/chunk` - Chunked upload for large files
- `POST /parse/finalize` - Finalize chunked upload

### 2. **Intelligence Map** (`src/components/IntelligenceMap.tsx`)
- Leaflet-based interactive map
- **Blue markers** for facilities (hubs)
- **Red heatmap** for Cold Spots (high population, zero surgical capacity)
- Click facility to open verification sidebar
- Drag-drop resources for planning

**Endpoints:**
- `GET /facilities` - Fetch all facilities
- `GET /cold-spots` - Fetch cold spot analysis

### 3. **Chat Console** (`src/components/ChatConsole.tsx`)
- Natural language queries ("Where are nearest labs?")
- **Response time target: <3 seconds**
- Chain of Thought stepper (visible for all AI responses)
- 1-click citations to source documents

**Endpoints:**
- `POST /query` - Natural language AI queries

### 4. **Verification Sidebar** (`src/components/VerificationSidebar.tsx`)
- Opens on facility click
- Confidence score meter
- Validation status badge
- **1-click citation** to PDF page/snippet
- Anomaly highlights (amber)

**Endpoints:**
- `GET /facility/:id` - Facility details with citations
- `GET /citation/:sourceId` - PDF page URL

### 5. **Planning Panel** (`src/components/PlanningPanel.tsx`)
- Drag-drop resources to Cold Spots
- Save deployment plans

**Endpoints:**
- `POST /plan` - Save resource deployment plan

---

## 🔗 Backend Endpoints Reference

All endpoints are documented in `src/lib/api.ts` with `HIGHLIGHT ENDPOINT` comments.

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/parse` | POST | Upload and parse file |
| `/parse/chunk` | POST | Chunked upload for large files |
| `/parse/finalize` | POST | Finalize chunked upload |
| `/ingest` | POST | Bulk ingest records |
| `/facilities` | GET | Fetch all facilities for map |
| `/facility/:id` | GET | Facility details with citations |
| `/cold-spots` | GET | Cold spot analysis data |
| `/query` | POST | Natural language AI queries |
| `/plan` | POST | Save deployment plan |
| `/plans` | GET | Fetch saved plans |
| `/stats` | GET | Dashboard statistics |
| `/citation/:id` | GET | PDF page URL for citation |

---

## ✅ Test Checklist

### Must-Have Features:

1. **Citation Visibility**
   - [ ] 1-click access to source PDF page
   - [ ] Confidence scores displayed
   - [ ] Source snippets visible

2. **Cold Spot Overlay**
   - [ ] Red heatmap visible on map
   - [ ] Clear contrast with blue facility markers
   - [ ] Population and distance data in popups

3. **Reasoning Clarity**
   - [ ] Chain of Thought stepper visible for all AI responses
   - [ ] Steps show complete/active/pending status
   - [ ] Methodology is transparent

4. **Natural Language**
   - [ ] Response time <3 seconds
   - [ ] No SQL required
   - [ ] Quick query buttons work

5. **Upload Reliability**
   - [ ] Large files use chunked upload
   - [ ] Progress bar animates
   - [ ] Retry button appears on error

---

## 🔧 Configuration Notes

### For Databricks Issues
The frontend only calls APIs after the backend is ready. Backend team should:
1. Ensure all endpoints return proper JSON
2. Handle CORS for frontend domain
3. Set response time targets (<3s for /query)

### For Large File Upload Issues
The system automatically uses chunked upload for files >5MB:
1. Files are split into 5MB chunks
2. Each chunk is uploaded separately
3. Backend receives `uploadId`, `chunkIndex`, `totalChunks`
4. Final `/parse/finalize` call completes the upload

### Mobile Responsiveness
- Tab navigation for mobile
- Chat console moves to tab on small screens
- Touch-friendly controls

---

## 🎨 Visual Design

- **Palette**: Whites, deep blues (navy), amber alerts
- **Trust**: Clear visual feedback, glass-morphism effects
- **Accessibility**: High contrast, readable fonts
- **Animations**: Framer Motion for smooth transitions

---

## 📁 File Structure

```
src/
├── components/
│   ├── chat/
│   │   ├── ChainOfThoughtStepper.tsx  # AI reasoning display
│   │   ├── ChatInput.tsx              # Message input
│   │   ├── ChatMessage.tsx            # Message display
│   │   ├── CitationList.tsx           # Source citations
│   │   └── QuickQueryBar.tsx          # Quick query buttons
│   ├── ChatConsole.tsx                # Main chat interface
│   ├── DashboardHeader.tsx            # Top header
│   ├── IntelligenceMap.tsx            # Map with facilities/cold spots
│   ├── PlanningPanel.tsx              # Resource planning
│   ├── StatsBar.tsx                   # Statistics cards
│   ├── UploadModule.tsx               # File upload
│   └── VerificationSidebar.tsx        # Facility details
├── data/
│   └── mockData.ts                    # Demo data
├── lib/
│   └── api.ts                         # API service layer (ALL ENDPOINTS DOCUMENTED HERE)
└── pages/
    └── Index.tsx                      # Main dashboard
```

---

## 📖 Related Documentation

- `BACKEND_INTEGRATION_GUIDE.md` - Full API specifications for backend team
- `FRONTEND_SETUP.md` - Detailed frontend architecture

---

## 🤝 For Backend Team

1. Review all `HIGHLIGHT ENDPOINT` comments in `src/lib/api.ts`
2. Implement endpoints matching the documented schemas
3. Test with the frontend by changing `API_BASE_URL`
4. Ensure response time <3s for `/query` endpoint
5. Handle chunked uploads for large files

---

## Technologies Used

- **Vite** - Build tool
- **TypeScript** - Type safety
- **React** - UI framework
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Leaflet** - Maps
- **React Markdown** - Content rendering

---

Built for the **Virtue Foundation** to bridge medical deserts through AI-powered geospatial intelligence.
