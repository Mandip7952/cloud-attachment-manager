import { useState, useCallback } from "react";
import { useUpload } from "@/hooks/use-upload";
import { UploadCloud, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const { uploadFile, isUploading, progress } = useUpload();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file) {
        uploadFile(file);
      }
    }
  }, [uploadFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        uploadFile(file);
      }
    }
  }, [uploadFile]);

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed transition-all duration-200 ease-in-out overflow-hidden group",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        isUploading ? "pointer-events-none opacity-80" : "cursor-pointer"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileChange}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center p-10 text-center">
        {isUploading ? (
          <div className="w-full max-w-xs flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <div className="w-full space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        ) : (
          <>
            <div className="bg-background p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform duration-200 border">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Click or drag file to this area to upload</h3>
            <p className="text-sm text-muted-foreground">Support for a single file upload. File will be securely stored.</p>
          </>
        )}
      </div>
    </div>
  );
}
