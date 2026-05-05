import { useState, useCallback } from "react";
import { useRequestUploadUrl, useConfirmUpload, getListFilesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const requestUrl = useRequestUploadUrl();
  const confirmUpload = useConfirmUpload();

  const uploadFile = useCallback(async (file: File) => {
    try {
      setIsUploading(true);
      setProgress(0);

      // 1. Request URL
      const { uploadUrl, fileId } = await requestUrl.mutateAsync({
        data: {
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
        }
      });

      // 2. Upload to URL using XHR for progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => reject(new Error("Network error during upload")));
        xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      // 3. Confirm upload
      await confirmUpload.mutateAsync(fileId);

      // 4. Invalidate cache
      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });

      toast({
        title: "Upload complete",
        description: `${file.name} has been uploaded successfully.`,
      });

    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [requestUrl, confirmUpload, queryClient, toast]);

  return {
    uploadFile,
    isUploading,
    progress
  };
}
