export interface Facility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: "hospital" | "clinic" | "lab" | "pharmacy";
  status: "verified" | "unverified" | "flagged";
  confidence: number;
  surgicalCapacity: boolean;
  beds: number;
  doctors: number;
  lastUpdated: string;
  source: string;
  sourceSnippet: string;
  sourcePage: number;
  anomalies: string[];
}

export interface ColdSpot {
  lat: number;
  lng: number;
  intensity: number;
  population: number;
  nearestFacilityKm: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "basic" | "reasoning" | "geospatial";
  chainOfThought?: ChainStep[];
  citations?: Citation[];
}

export interface ChainStep {
  step: number;
  title: string;
  detail: string;
  status: "complete" | "active" | "pending";
}

export interface Citation {
  id: string;
  source: string;
  page: number;
  snippet: string;
  confidence: number;
}

export interface DraggableResource {
  id: string;
  type: "doctor" | "nurse" | "surgeon" | "ambulance";
  label: string;
  icon: string;
}

export const facilities: Facility[] = [
  {
    id: "f1",
    name: "Kigali Central Hospital",
    lat: -1.9403,
    lng: 29.8739,
    type: "hospital",
    status: "verified",
    confidence: 0.94,
    surgicalCapacity: true,
    beds: 450,
    doctors: 82,
    lastUpdated: "2024-11-15",
    source: "WHO Health Facility Registry 2024",
    sourceSnippet: "Kigali Central Hospital — tertiary referral, 450 beds, fully equipped surgical theatres (3), ICU capacity 24...",
    sourcePage: 14,
    anomalies: [],
  },
  {
    id: "f2",
    name: "Butaro District Hospital",
    lat: -1.4126,
    lng: 29.8464,
    type: "hospital",
    status: "verified",
    confidence: 0.89,
    surgicalCapacity: true,
    beds: 150,
    doctors: 22,
    lastUpdated: "2024-09-20",
    source: "Partners in Health Annual Report",
    sourceSnippet: "Butaro Hospital serves ~400,000 catchment population with 150 beds, 2 surgical theatres, oncology ward...",
    sourcePage: 8,
    anomalies: [],
  },
  {
    id: "f3",
    name: "Nyamata Health Center",
    lat: -2.1489,
    lng: 30.0891,
    type: "clinic",
    status: "flagged",
    confidence: 0.52,
    surgicalCapacity: false,
    beds: 20,
    doctors: 3,
    lastUpdated: "2023-06-01",
    source: "MOH Facility Audit 2023",
    sourceSnippet: "Nyamata HC — Level 3 health center, limited surgical capacity, reported equipment shortages Q2 2023...",
    sourcePage: 42,
    anomalies: ["Outdated data (>18 months)", "Equipment shortage reported"],
  },
  {
    id: "f4",
    name: "Ruhengeri Referral Hospital",
    lat: -1.4989,
    lng: 29.6349,
    type: "hospital",
    status: "verified",
    confidence: 0.91,
    surgicalCapacity: true,
    beds: 230,
    doctors: 38,
    lastUpdated: "2024-10-01",
    source: "WHO Health Facility Registry 2024",
    sourceSnippet: "Ruhengeri Referral — district referral hospital, 230 beds, emergency surgery, neonatal ICU...",
    sourcePage: 22,
    anomalies: [],
  },
  {
    id: "f5",
    name: "Kibungo Pharmacy",
    lat: -2.1592,
    lng: 30.5433,
    type: "pharmacy",
    status: "unverified",
    confidence: 0.38,
    surgicalCapacity: false,
    beds: 0,
    doctors: 0,
    lastUpdated: "2022-12-10",
    source: "Community Health Survey",
    sourceSnippet: "Pharmacy operating at Kibungo market area — unverified hours, possible stockouts...",
    sourcePage: 67,
    anomalies: ["Unverified operating status", "Possible stockouts", "Data from 2022"],
  },
  {
    id: "f6",
    name: "Gitarama Lab",
    lat: -2.0745,
    lng: 29.7576,
    type: "lab",
    status: "verified",
    confidence: 0.85,
    surgicalCapacity: false,
    beds: 0,
    doctors: 5,
    lastUpdated: "2024-08-15",
    source: "National Lab Network Registry",
    sourceSnippet: "Gitarama Laboratory — BSL-2, TB/HIV testing, malaria RDT, blood bank services available...",
    sourcePage: 11,
    anomalies: [],
  },
];

export const coldSpots: ColdSpot[] = [
  { lat: -2.35, lng: 29.4, intensity: 0.9, population: 180000, nearestFacilityKm: 78 },
  { lat: -1.75, lng: 30.3, intensity: 0.75, population: 120000, nearestFacilityKm: 52 },
  { lat: -2.5, lng: 29.9, intensity: 0.85, population: 95000, nearestFacilityKm: 65 },
  { lat: -1.3, lng: 30.1, intensity: 0.6, population: 70000, nearestFacilityKm: 41 },
  { lat: -2.0, lng: 29.2, intensity: 0.7, population: 85000, nearestFacilityKm: 55 },
];

export const draggableResources: DraggableResource[] = [
  { id: "r1", type: "doctor", label: "General Practitioner", icon: "👨‍⚕️" },
  { id: "r2", type: "surgeon", label: "Surgeon", icon: "🩺" },
  { id: "r3", type: "nurse", label: "Nurse", icon: "👩‍⚕️" },
  { id: "r4", type: "ambulance", label: "Ambulance Unit", icon: "🚑" },
];

export const sampleChainOfThought: ChainStep[] = [
  { step: 1, title: "Navigating WHO facility registry", detail: "Searching Rwanda health facility database for facilities within 50km radius of query region.", status: "complete" },
  { step: 2, title: "Cross-referencing population data", detail: "Found 3 facilities. Cross-referencing with UN population grid (2024) — 180,000 people in catchment with zero surgical capacity.", status: "complete" },
  { step: 3, title: "Flagged as Cold Spot", detail: "Region flagged: high population density (>100k), nearest surgical facility 78km. Confidence: 0.91 based on 2 verified sources.", status: "complete" },
];

export const dashboardStats = {
  totalFacilities: 847,
  verifiedFacilities: 623,
  coldSpots: 34,
  populationAtRisk: 2400000,
  pendingVerifications: 89,
  lastSyncDate: "2024-12-01",
};
