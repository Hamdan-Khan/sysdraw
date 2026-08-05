import { LIBRARY_URL } from "@/lib/constants";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LibraryManifest,
  LibraryMetadata,
  useLibraryRegistry,
} from "@zero-sketch/models";
import { LIBRARIES_METADATA_QUERY_KEY } from "./useCommunityLibraries";

export const LIBRARY_MANIFEST_QUERY_KEY = "libraryManifest";

export function useLibraryManifest(id: string | null, fetchRemote: boolean) {
  const queryClient = useQueryClient();
  const registry = useLibraryRegistry();

  return useQuery<LibraryManifest | null>({
    queryKey: [LIBRARY_MANIFEST_QUERY_KEY, id, fetchRemote],
    queryFn: async () => {
      if (!id) {
        return null;
      }

      if (fetchRemote) {
        // reuse cached community libraries metadata
        const targetMeta = queryClient
          .getQueryData<LibraryMetadata[]>([LIBRARIES_METADATA_QUERY_KEY])
          ?.find((lib) => lib.id === id);

        const manifestPath = targetMeta?.path
          ? targetMeta.path.replace(/^\//, "")
          : `data/${id}.json`;

        // fetch target library manifest
        const res = await fetch(`${LIBRARY_URL}/${manifestPath}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch library manifest for id: ${id}`);
        }

        const manifest: LibraryManifest = await res.json();
        return manifest;
      }

      // load local library manifest from IDB via registry
      return await registry.getLibraryManifest(id);
    },
    enabled: !!id,
  });
}
