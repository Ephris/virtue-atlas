/**
 * ============================================================================
 * API SERVICE LAYER - Bridging Medical Deserts Platform
 * ============================================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Set API_BASE_URL environment variable or update the constant below
 * 2. Test each endpoint sequentially: Upload → Map → Chat → Sidebar → Planning
 * 3. For Databricks config issues: Backend team fixes, frontend only calls API after ready
 * 
 * ENDPOINT OVERVIEW:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │  POST /parse          → Upload and parse PDF/Excel/CSV files               │
 * │  POST /parse/chunk    → Chunked upload for large files                     │
 * │  POST /parse/finalize → Finalize chunked upload                            │
 * │  POST /ingest         → Bulk ingest facility records                       │
 * │  GET  /facilities     → Fetch all facilities for map display               │
 * │  GET  /facility/:id   → Get single facility with citations (sidebar)       │
 * │  POST /query          → Natural language AI queries (<3 sec target)        │
 * │  POST /plan           → Save resource deployment plans                     │
 * │  GET  /plans          → Fetch saved deployment plans                       │
 * │  GET  /cold-spots     → Fetch cold spot analysis data                      │
 * │  GET  /stats          → Dashboard statistics                               │
 * │  GET  /citation/:id   → Get PDF page URL for 1-click citation              │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */

// ============================================================================
// HIGHLIGHT: API CONFIGURATION
// ============================================================================
// TODO: Replace with your actual backend URL
// Step 1: Change this to your production API URL when ready
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Chunk size for large file uploads (5MB) - handles "unable to upload all records" issue
const CHUNK_SIZE = 5 * 1024 * 1024;

// Maximum retries for failed requests
const MAX_RETRIES = 3;

/**
 * Get authentication headers
 * TODO: Implement with your auth provider (e.g., Supabase, Auth0)
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

/**
 * Generic API request handler with error handling and retry logic
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = MAX_RETRIES
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    console.error(`API Error [${endpoint}]:`, message);
    
    // Retry on network errors
    if (retries > 0 && message.includes('network')) {
      console.log(`Retrying request... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return apiRequest(endpoint, options, retries - 1);
    }
    
    return { data: null, error: message };
  }
}

// ============================================================================
// FILE UPLOAD APIs
// ============================================================================

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  currentChunk?: number;
  totalChunks?: number;
  status?: 'uploading' | 'processing' | 'complete';
}

export interface ParseResponse {
  success: boolean;
  recordsProcessed: number;
  recordsFailed: number;
  facilities: Facility[];
  errors?: string[];
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: POST /parse - Upload and parse file
 * ============================================================================
 * 
 * Supports: PDF, Excel (.xlsx, .xls), CSV
 * For large files (>5MB), automatically uses chunked upload
 * 
 * Request: FormData with 'file' field
 * Response: { success, recordsProcessed, recordsFailed, facilities[], errors[] }
 */
export async function uploadAndParseFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ data: ParseResponse | null; error: string | null }> {
  // For large files, use chunked upload to handle "unable to upload all records" issue
  if (file.size > CHUNK_SIZE) {
    return uploadFileChunked(file, onProgress);
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const xhr = new XMLHttpRequest();
    
    return new Promise((resolve) => {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percentage: Math.round((e.loaded / e.total) * 100),
            status: 'uploading',
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          onProgress?.({ loaded: 100, total: 100, percentage: 100, status: 'processing' });
          const data = JSON.parse(xhr.responseText);
          onProgress?.({ loaded: 100, total: 100, percentage: 100, status: 'complete' });
          resolve({ data, error: null });
        } else {
          resolve({ 
            data: null, 
            error: `Upload failed: ${xhr.statusText}. Try a smaller file or check your connection.` 
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({ 
          data: null, 
          error: 'Network error during upload. Please check your connection and try again.' 
        });
      });

      // HIGHLIGHT ENDPOINT: POST /parse
      xhr.open('POST', `${API_BASE_URL}/parse`);
      
      const token = localStorage.getItem('auth_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err.message : 'Upload failed' 
    };
  }
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: POST /parse/chunk - Chunked upload for large files
 * ============================================================================
 * 
 * Handles the 'unable to upload all records' issue by splitting files
 * Each chunk is uploaded separately, then finalized
 * 
 * Request: FormData with chunk, uploadId, chunkIndex, totalChunks, fileName, fileType
 * Response: Partial parse results for this chunk
 */
async function uploadFileChunked(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ data: ParseResponse | null; error: string | null }> {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  let uploadedBytes = 0;
  const allResults: ParseResponse = {
    success: true,
    recordsProcessed: 0,
    recordsFailed: 0,
    facilities: [],
    errors: [],
  };

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, file.size);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append('chunk', chunk);
    formData.append('uploadId', uploadId);
    formData.append('chunkIndex', chunkIndex.toString());
    formData.append('totalChunks', totalChunks.toString());
    formData.append('fileName', file.name);
    formData.append('fileType', file.type);

    try {
      // HIGHLIGHT ENDPOINT: POST /parse/chunk
      const response = await fetch(`${API_BASE_URL}/parse/chunk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Chunk ${chunkIndex + 1} failed: ${response.statusText}`);
      }

      const result = await response.json();
      uploadedBytes += chunk.size;

      // Merge results
      if (result.recordsProcessed) {
        allResults.recordsProcessed += result.recordsProcessed;
      }
      if (result.recordsFailed) {
        allResults.recordsFailed += result.recordsFailed;
      }
      if (result.facilities) {
        allResults.facilities.push(...result.facilities);
      }
      if (result.errors) {
        allResults.errors!.push(...result.errors);
      }

      if (onProgress) {
        onProgress({
          loaded: uploadedBytes,
          total: file.size,
          percentage: Math.round((uploadedBytes / file.size) * 100),
          currentChunk: chunkIndex + 1,
          totalChunks,
          status: 'uploading',
        });
      }
    } catch (err) {
      return {
        data: null,
        error: `Failed to upload chunk ${chunkIndex + 1}/${totalChunks}: ${err instanceof Error ? err.message : 'Unknown error'}. Try uploading a smaller file or check your connection.`,
      };
    }
  }

  // HIGHLIGHT ENDPOINT: POST /parse/finalize
  try {
    const finalizeResponse = await fetch(`${API_BASE_URL}/parse/finalize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ uploadId, fileName: file.name }),
    });

    if (!finalizeResponse.ok) {
      throw new Error('Failed to finalize upload');
    }

    onProgress?.({ loaded: file.size, total: file.size, percentage: 100, status: 'complete' });
    const finalResult = await finalizeResponse.json();
    return { data: { ...allResults, ...finalResult }, error: null };
  } catch (err) {
    return { data: allResults, error: null }; // Return partial results
  }
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: POST /ingest - Bulk ingest records
 * ============================================================================
 * 
 * Use when you have pre-processed facility data
 * 
 * Request: { records: Facility[] }
 * Response: { processed: number, failed: number }
 */
export async function ingestRecords(
  records: Partial<Facility>[]
): Promise<{ data: { processed: number; failed: number } | null; error: string | null }> {
  return apiRequest('/ingest', {
    method: 'POST',
    body: JSON.stringify({ records }),
  });
}

// ============================================================================
// FACILITY APIs
// ============================================================================

export interface Facility {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: 'hospital' | 'clinic' | 'lab' | 'pharmacy';
  status: 'verified' | 'unverified' | 'flagged';
  confidence: number;
  surgicalCapacity: boolean;
  beds: number;
  doctors: number;
  lastUpdated: string;
  source: string;
  sourceSnippet: string;
  sourcePage: number;
  sourceUrl?: string;
  anomalies: string[];
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: GET /facilities - Fetch all facilities for map
 * ============================================================================
 * 
 * Returns all facilities for map display
 * Optionally filter by region, status, or type
 * 
 * Query params: ?region=...&status=verified&type=hospital
 * Response: Facility[]
 */
export async function getFacilities(params?: {
  region?: string;
  status?: string;
  type?: string;
  bounds?: [number, number, number, number]; // [minLat, minLng, maxLat, maxLng]
}): Promise<{ data: Facility[] | null; error: string | null }> {
  const queryParams: Record<string, string> = {};
  if (params?.region) queryParams.region = params.region;
  if (params?.status) queryParams.status = params.status;
  if (params?.type) queryParams.type = params.type;
  if (params?.bounds) queryParams.bounds = params.bounds.join(',');
  
  const queryString = Object.keys(queryParams).length 
    ? '?' + new URLSearchParams(queryParams).toString()
    : '';
  return apiRequest(`/facilities${queryString}`);
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: GET /facility/:id - Get facility details with citations
 * ============================================================================
 * 
 * Used for verification sidebar - includes full citation data
 * 
 * Response: Facility with sourceUrl for 1-click PDF access
 */
export async function getFacilityById(
  id: string
): Promise<{ data: Facility | null; error: string | null }> {
  return apiRequest(`/facility/${id}`);
}

// ============================================================================
// COLD SPOTS API
// ============================================================================

export interface ColdSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  intensity: number;
  population: number;
  nearestFacilityKm: number;
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: GET /cold-spots - Fetch cold spot analysis
 * ============================================================================
 * 
 * Returns areas with high population but zero surgical capacity
 * Used for red heatmap overlay on map (contrast with blue hubs)
 * 
 * Response: ColdSpot[] with intensity values for heatmap
 */
export async function getColdSpots(): Promise<{ data: ColdSpot[] | null; error: string | null }> {
  return apiRequest('/cold-spots');
}

// ============================================================================
// AI QUERY API
// ============================================================================

export interface ChainStep {
  step: number;
  title: string;
  detail: string;
  status: 'complete' | 'active' | 'pending';
  duration?: number; // milliseconds
}

export interface Citation {
  id: string;
  source: string;
  page: number;
  snippet: string;
  confidence: number;
  sourceUrl?: string;
}

export interface QueryResponse {
  answer: string;
  type: 'basic' | 'reasoning' | 'geospatial';
  chainOfThought?: ChainStep[];
  citations?: Citation[];
  mapHighlights?: {
    facilityIds?: string[];
    coldSpotIndices?: number[];
    bounds?: [number, number, number, number];
    distances?: { from: string; to: string; km: number }[];
  };
  processingTime?: number; // Target: <3000ms
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: POST /query - Natural language AI queries
 * ============================================================================
 * 
 * Handles questions like "Where are the nearest labs?"
 * Response time target: <3 seconds
 * 
 * Request: { question: string, context?: { selectedFacilityId, mapBounds } }
 * Response: QueryResponse with answer, chainOfThought, citations, mapHighlights
 */
export async function queryAI(
  question: string,
  context?: {
    selectedFacilityId?: string;
    mapBounds?: [number, number, number, number];
  }
): Promise<{ data: QueryResponse | null; error: string | null }> {
  const startTime = Date.now();
  const result = await apiRequest<QueryResponse>('/query', {
    method: 'POST',
    body: JSON.stringify({ question, context }),
  });
  
  // Log response time for monitoring
  const processingTime = Date.now() - startTime;
  if (result.data) {
    result.data.processingTime = processingTime;
    if (processingTime > 3000) {
      console.warn(`Query response exceeded 3s target: ${processingTime}ms`);
    }
  }
  
  return result;
}

// ============================================================================
// PLANNING API
// ============================================================================

export interface ResourceDeployment {
  resourceId: string;
  resourceType: 'doctor' | 'nurse' | 'surgeon' | 'ambulance' | 'equipment' | 'supply';
  lat: number;
  lng: number;
  label: string;
  targetColdSpotId?: string;
}

export interface DeploymentPlan {
  id?: string;
  name: string;
  resources: ResourceDeployment[];
  createdAt?: string;
  updatedAt?: string;
  status?: 'draft' | 'submitted' | 'approved';
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: POST /plan - Save resource deployment plan
 * ============================================================================
 * 
 * Stores planned resource allocations to cold spots
 * Used with drag-drop planning interface
 * 
 * Request: DeploymentPlan
 * Response: { id: string, success: boolean }
 */
export async function savePlan(
  plan: DeploymentPlan
): Promise<{ data: { id: string; success: boolean } | null; error: string | null }> {
  return apiRequest('/plan', {
    method: 'POST',
    body: JSON.stringify(plan),
  });
}

/**
 * GET /plans - Fetch all saved plans
 */
export async function getPlans(): Promise<{ data: DeploymentPlan[] | null; error: string | null }> {
  return apiRequest('/plans');
}

// ============================================================================
// DASHBOARD STATS API
// ============================================================================

export interface DashboardStats {
  totalFacilities: number;
  verifiedFacilities: number;
  coldSpots: number;
  populationAtRisk: number;
  pendingVerifications: number;
  lastSyncDate: string;
}

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: GET /stats - Fetch dashboard statistics
 * ============================================================================
 * 
 * Returns aggregate statistics for dashboard cards
 */
export async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: string | null }> {
  return apiRequest('/stats');
}

// ============================================================================
// PDF CITATION API
// ============================================================================

/**
 * ============================================================================
 * HIGHLIGHT ENDPOINT: GET /citation/:sourceId - 1-click PDF citation access
 * ============================================================================
 * 
 * Returns URL to specific page in PDF viewer with highlighted text
 * Used for transparency - prove AI reasoning with source documents
 * 
 * Query: ?page=14
 * Response: { url: string, highlightText?: string }
 */
export async function getCitationUrl(
  sourceId: string,
  page: number
): Promise<{ data: { url: string; highlightText?: string } | null; error: string | null }> {
  return apiRequest(`/citation/${sourceId}?page=${page}`);
}

// ============================================================================
// EXPORT API BASE URL FOR DEBUGGING
// ============================================================================
export { API_BASE_URL };
