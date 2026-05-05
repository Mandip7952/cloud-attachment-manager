import { useListFiles, useDeleteFile, useGetFile, getListFilesQueryKey } from "@workspace/api-client-react";
import { formatBytes, formatDate } from "@/lib/format";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Download, 
  Trash2, 
  FileIcon, 
  FileText, 
  Image as ImageIcon, 
  FileArchive, 
  FileVideo, 
  FileAudio,
  Loader2
} from "lucide-react";
import { useState } from "react";

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-blue-500" />;
  if (type.startsWith('video/')) return <FileVideo className="h-4 w-4 text-purple-500" />;
  if (type.startsWith('audio/')) return <FileAudio className="h-4 w-4 text-yellow-500" />;
  if (type.includes('pdf') || type.includes('document')) return <FileText className="h-4 w-4 text-red-500" />;
  if (type.includes('zip') || type.includes('tar') || type.includes('compressed')) return <FileArchive className="h-4 w-4 text-orange-500" />;
  return <FileIcon className="h-4 w-4 text-gray-500" />;
}

export function FileList() {
  const { data, isLoading, error } = useListFiles();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const deleteFile = useDeleteFile();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    
    try {
      await deleteFile.mutateAsync({ fileId });
      queryClient.invalidateQueries({ queryKey: getListFilesQueryKey() });
      toast({
        title: "File deleted",
        description: "The file has been removed from your storage.",
      });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: "There was an error deleting the file.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      setDownloadingId(fileId);
      
      // We need to fetch the file details to get the downloadUrl
      const response = await fetch(`/api/files/${fileId}`, { credentials: "include" });
      if (!response.ok) throw new Error("Failed to get download URL");
      
      const fileDetail = await response.json();
      
      if (fileDetail.downloadUrl) {
        // Create an invisible anchor to trigger the download
        const a = document.createElement('a');
        a.href = fileDetail.downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        throw new Error("No download URL provided");
      }
    } catch (err) {
      console.error("Download error", err);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-destructive">
        <p>Failed to load files.</p>
        <p className="text-sm mt-2 opacity-80">{error.message}</p>
      </div>
    );
  }

  const files = data?.files || [];

  if (files.length === 0) {
    return (
      <div className="text-center py-20 border rounded-xl bg-card/50 shadow-sm mt-6">
        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileIcon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">No files yet</h3>
        <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
          Upload your first file using the area above to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm mt-6 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Uploaded</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.fileId} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-md group-hover:bg-background transition-colors">
                      {getFileIcon(file.type)}
                    </div>
                    <span className="truncate max-w-[250px] sm:max-w-[300px]" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap">
                  {formatBytes(file.size)}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md truncate max-w-[150px] inline-block" title={file.type}>
                    {file.type.split('/')[1] || file.type}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={file.status === 'confirmed' ? 'default' : 'secondary'}
                    className={file.status === 'confirmed' ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20' : ''}
                  >
                    {file.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatDate(file.uploadedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem 
                        onClick={() => handleDownload(file.fileId, file.name)}
                        disabled={file.status !== 'confirmed' || downloadingId === file.fileId}
                        className="gap-2 cursor-pointer"
                      >
                        {downloadingId === file.fileId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                        <span>Download</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(file.fileId)}
                        disabled={deleteFile.isPending}
                        className="text-destructive focus:text-destructive gap-2 cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
