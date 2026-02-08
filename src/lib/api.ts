/**
 * API Service Layer for Bridging Medical Deserts Platform
 * ========================================================
 * 
 * This module centralizes all backend API communications.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Set API_BASE_URL environment variable or update the constant below
 * 2. For authentication, implement the getAuthHeaders function
 * 3. Each endpoint is documented with its expected request/response format
 * 
 * ENDPOINTS:
 * - POST /parse        → Upload and parse PDF/Excel/CSV files
 * - POST /ingest       → Bulk ingest facility records
 * - GET  /facilities   → Fetch all facilities for map display
 * - GET  /facility/:id → Get single facility details with citations
 * - POST /query        → Natural language AI queries
 * - POST /plan         → Save resource deployment plans
 * - GET  /cold-spots   → Fetch cold spot analysis data
 * - GET  /stats        → Dashboard statistics
 */

// API Configuration
// TODO: Replace with your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.bridgingmedicaldeserts.org';

// Chunk size for large file uploads (5MB)
const CHUNK_SIZE = 5 * 1024 * 1024;

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
 * Generic API request handler with error handling
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
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
}

export interface ParseResponse {
  success: boolean;
  recordsProcessed: number;
  recordsFailed: number;
  facilities: Facility[];
  errors?: string[];
}

/**
 * POST /parse - Upload and parse a single file
 * Supports: PDF, Excel (.xlsx, .xls), CSV
 * 
 * For large files (>5MB), this uses chunked upload automatically
 */
export async function uploadAndParseFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ data: ParseResponse | null; error: string | null }> {
  // For large files, use chunked upload
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
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
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
 * Chunked upload for large files
 * Handles the 'unable to upload all records' issue by splitting files
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
        });
      }
    } catch (err) {
      return {
        data: null,
        error: `Failed to upload chunk ${chunkIndex + 1}/${totalChunks}: ${err instanceof Error ? err.message : 'Unknown error'}. Try uploading a smaller file.`,
      };
    }
  }

  // Finalize the chunked upload
  try {
    const finalizeResponse = await fetch(`${API_BASE_URL}/parse/finalize`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ uploadId, fileName: file.name }),
    });

    if (!finalizeResponse.ok) {
      throw new Error('Failed to finalize upload');
    }

    const finalResult = await finalizeResponse.json();
    return { data: { ...allResults, ...finalResult }, error: null };
  } catch (err) {
    return { data: allResults, error: null }; // Return partial results
  }
}

/**
 * POST /ingest - Bulk ingest records
 * Use when you have pre-processed facility data
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
  anomalies: string[];
}

/**
 * GET /facilities - Fetch all facilities for map display
 * Optionally filter by region, status, or type
 */
export async function getFacilities(params?: {
  region?: string;
  status?: string;
  type?: string;
}): Promise<{ data: Facility[] | null; error: string | null }> {
  const queryString = params
    ? '?' + new URLSearchParams(params as Record<string, string>).toString()
    : '';
  return apiRequest(`/facilities${queryString}`);
}

/**
 * GET /facility/:id - Get single facility with full citation details
 * Used for verification sidebar
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
  lat: number;
  lng: number;
  intensity: number;
  population: number;
  nearestFacilityKm: number;
}

/**
 * GET /cold-spots - Fetch cold spot analysis data
 * Returns areas with high population but zero surgical capacity
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
}

export interface Citation {
  id: string;
  source: string;
  page: number;
  snippet: string;
  confidence: number;
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
  };
}

/**
 * POST /query - Natural language AI queries
 * Handles questions like "Where are the nearest labs?"
 * Response time target: <3 seconds
 */
export async function queryAI(
  question: string,
  context?: {
    selectedFacilityId?: string;
    mapBounds?: [number, number, number, number];
  }
): Promise<{ data: QueryResponse | null; error: string | null }> {
  return apiRequest('/query', {
    method: 'POST',
    body: JSON.stringify({ question, context }),
  });
}

// ============================================================================
// PLANNING API
// ============================================================================

export interface ResourceDeployment {
  resourceId: string;
  resourceType: 'doctor' | 'nurse' | 'surgeon' | 'ambulance';
  lat: number;
  lng: number;
  label: string;
}

export interface DeploymentPlan {
  id?: string;
  name: string;
  resources: ResourceDeployment[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * POST /plan - Save resource deployment plan
 * Stores planned resource allocations to cold spots
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
 * GET /stats - Fetch dashboard statistics
 */
export async function getDashboardStats(): Promise<{ data: DashboardStats | null; error: string | null }> {
  return apiRequest('/stats');
}

// ============================================================================
// PDF CITATION API
// ============================================================================

/**
 * GET /citation/:sourceId - Get PDF page/snippet for 1-click citation
 * Returns URL to specific page in PDF viewer
 */
export async function getCitationUrl(
  sourceId: string,
  page: number
): Promise<{ data: { url: string; highlightText?: string } | null; error: string | null }> {
  return apiRequest(`/citation/${sourceId}?page=${page}`);
}
