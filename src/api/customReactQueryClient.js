import { QueryClient } from "react-query";

const reactQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      retry: 1,
    },
  },
});
export const invalidateQuery = (queryKey) =>
  reactQueryClient.invalidateQueries(queryKey);

export default reactQueryClient;
