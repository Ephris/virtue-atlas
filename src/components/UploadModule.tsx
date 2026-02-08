import { useState, useCallback } from "react";
import {
  Upload,
  FileText,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { uploadAndParseFile, type UploadProgress, type ParseResponse } from "@/lib/api";

interface UploadedFile {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  result?: ParseResponse;
  error?: string;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const ACCEPTED_EXTENSIONS = [".pdf", ".csv", ".xls", ".xlsx"];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const getFileIcon = (type: string) => {
  if (type === "application/pdf") return FileText;
  return FileSpreadsheet;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

interface UploadModuleProps {
  onUploadComplete?: (result: ParseResponse) => void;
}

const UploadModule = ({ onUploadComplete }: UploadModuleProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): string | null => {
    // Check file type
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension) && !ACCEPTED_TYPES.includes(file.type)) {
      return `Invalid file type. Accepted: PDF, CSV, Excel`;
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large (${formatFileSize(file.size)}). Maximum: ${formatFileSize(MAX_FILE_SIZE)}`;
    }

    return null;
  };

  const uploadFile = async (uploadedFile: UploadedFile) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "uploading", progress: 0 } : f))
    );

    const handleProgress = (progress: UploadProgress) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id ? { ...f, progress: progress.percentage } : f
        )
      );
    };

    // Simulate API call for demo (replace with real call when backend is ready)
    // const { data, error } = await uploadAndParseFile(uploadedFile.file, handleProgress);
    
    // Demo simulation with progress
    await new Promise<void>((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          resolve();
        }
        handleProgress({ loaded: progress, total: 100, percentage: Math.round(progress) });
      }, 200);
    });

    // Simulated response (replace with actual API response)
    const simulatedSuccess = Math.random() > 0.1; // 90% success rate for demo
    
    if (simulatedSuccess) {
      const result: ParseResponse = {
        success: true,
        recordsProcessed: Math.floor(Math.random() * 200) + 50,
        recordsFailed: Math.floor(Math.random() * 5),
        facilities: [],
      };

      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "success", progress: 100, result }
            : f
        )
      );

      toast.success(`Processed ${result.recordsProcessed} records from ${uploadedFile.file.name}`);
      onUploadComplete?.(result);
    } else {
      const error = "Unable to upload all records. Try splitting the file into smaller chunks.";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadedFile.id
            ? { ...f, status: "error", error }
            : f
        )
      );
      toast.error(error);
    }
  };

  const handleFiles = useCallback((fileList: FileList | File[]) => {
    const newFiles: UploadedFile[] = [];

    Array.from(fileList).forEach((file) => {
      const validationError = validateFile(file);
      
      if (validationError) {
        toast.error(validationError);
        return;
      }

      // Check for duplicates
      const exists = files.some((f) => f.file.name === file.name && f.file.size === file.size);
      if (exists) {
        toast.info(`${file.name} is already in the queue`);
        return;
      }

      newFiles.push({
        file,
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        status: "pending",
        progress: 0,
      });
    });

    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
      
      // Auto-start upload
      newFiles.forEach((f) => uploadFile(f));
    }
  }, [files]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    e.target.value = ""; // Reset to allow re-uploading same file
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const retryFile = (uploadedFile: UploadedFile) => {
    uploadFile(uploadedFile);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
          <Upload className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Upload Data Sources</h3>
          <p className="text-[11px] text-muted-foreground">
            PDF reports, Excel spreadsheets, or CSV files
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative mb-4 rounded-lg border-2 border-dashed p-6 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/50"
        }`}
      >
        <input
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(",")}
          multiple
          onChange={handleFileInput}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        
        <div className="flex flex-col items-center gap-2">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
              isDragging ? "bg-primary/10" : "bg-muted"
            }`}
          >
            <HardDrive className={`h-6 w-6 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-muted-foreground">
              or <span className="text-primary underline">browse</span> to select
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Supports PDF, Excel, CSV • Max 50MB per file
          </p>
        </div>
      </div>

      {/* File List */}
      <AnimatePresence mode="popLayout">
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {files.map((uploadedFile) => {
              const FileIcon = getFileIcon(uploadedFile.file.type);
              
              return (
                <motion.div
                  key={uploadedFile.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`flex items-center gap-3 rounded-lg border p-3 ${
                    uploadedFile.status === "error"
                      ? "border-cold-spot/30 bg-cold-spot/5"
                      : uploadedFile.status === "success"
                      ? "border-teal/30 bg-teal/5"
                      : "border-border bg-muted/50"
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      uploadedFile.status === "error"
                        ? "bg-cold-spot/10"
                        : uploadedFile.status === "success"
                        ? "bg-teal/10"
                        : "bg-muted"
                    }`}
                  >
                    {uploadedFile.status === "uploading" ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : uploadedFile.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-teal" />
                    ) : uploadedFile.status === "error" ? (
                      <AlertCircle className="h-4 w-4 text-cold-spot" />
                    ) : (
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {uploadedFile.file.name}
                    </p>
                    
                    {uploadedFile.status === "uploading" && (
                      <div className="mt-1.5">
                        <Progress value={uploadedFile.progress} className="h-1.5" />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Uploading... {uploadedFile.progress}%
                        </p>
                      </div>
                    )}
                    
                    {uploadedFile.status === "success" && uploadedFile.result && (
                      <p className="text-[11px] text-teal">
                        ✓ {uploadedFile.result.recordsProcessed} records processed
                        {uploadedFile.result.recordsFailed > 0 && (
                          <span className="text-amber">
                            {" "}• {uploadedFile.result.recordsFailed} failed
                          </span>
                        )}
                      </p>
                    )}
                    
                    {uploadedFile.status === "error" && (
                      <p className="text-[11px] text-cold-spot">
                        {uploadedFile.error}
                      </p>
                    )}
                    
                    {uploadedFile.status === "pending" && (
                      <p className="text-[11px] text-muted-foreground">
                        {formatFileSize(uploadedFile.file.size)} • Waiting...
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    {uploadedFile.status === "error" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => retryFile(uploadedFile)}
                      >
                        Retry
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => removeFile(uploadedFile.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary */}
      {files.length > 0 && (
        <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
          <span>
            {files.filter((f) => f.status === "success").length} of {files.length} files processed
          </span>
          {files.some((f) => f.status === "error") && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs text-amber"
              onClick={() => files.filter((f) => f.status === "error").forEach(retryFile)}
            >
              Retry all failed
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadModule;
