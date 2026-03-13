import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import type { HubRequestParams } from "@app/api/models";
import { client } from "@app/axios-config/apiInit";
import { getAiModel, listAiModels } from "@app/client";
import { requestParamsQuery } from "@app/hooks/table-controls";

export const AiModelsQueryKey = "ai-models";

export const useFetchAiModels = (params: HubRequestParams = {}) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: [AiModelsQueryKey, params],
    queryFn: () =>
      listAiModels({
        client,
        query: { ...requestParamsQuery(params) },
      }),
  });

  return {
    result: {
      data: data?.data?.items || [],
      total: data?.data?.total ?? 0,
      params,
    },
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
    refetch,
  };
};

export const useFetchAiModelById = (sbomId: string, nodeId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [AiModelsQueryKey, sbomId, nodeId],
    queryFn: () =>
      getAiModel({
        client,
        path: { sbom_id: sbomId, node_id: nodeId },
      }),
    enabled: !!sbomId && !!nodeId,
  });

  return {
    aiModel: data?.data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
  };
};
