import { Layout } from "@/components/layout";
import { FileUploader } from "@/components/file-uploader";
import { FileList } from "@/components/file-list";
import { ProtectedRoute } from "@/hooks/use-auth";

export default function Files() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Files</h1>
              <p className="text-muted-foreground mt-1 text-lg">
                Manage, upload, and organize your personal file vault.
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <section aria-label="Upload files">
              <FileUploader />
            </section>

            <section aria-label="File list" className="min-h-[400px]">
              <FileList />
            </section>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
