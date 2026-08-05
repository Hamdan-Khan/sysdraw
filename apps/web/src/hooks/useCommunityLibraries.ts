import { LIBRARY_URL } from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { LibraryMetadata } from "@zero-sketch/models";

export const LIBRARIES_METADATA_QUERY_KEY = "librariesMetadata";

export function useCommunityLibraries() {
  return useQuery<LibraryMetadata[]>({
    queryKey: [LIBRARIES_METADATA_QUERY_KEY],
    queryFn: async () => {
      const res = await fetch(`${LIBRARY_URL}metadata.json`);
      if (!res.ok) {
        throw new Error("Failed to fetch community libraries metadata");
      }
      const data = await res.json();
      return data.libraries as LibraryMetadata[];
    },
  });
}
