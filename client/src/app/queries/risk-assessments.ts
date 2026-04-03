import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";

const RISK_ASSESSMENTS = "/api/v2/risk-assessment";

export const RiskAssessmentsQueryKey = "risk-assessments";

/** A risk assessment associated with a group. */
export interface RiskAssessment {
  id: string;
  groupId: string;
  status: string;
  overallScore?: number;
  createdAt: string;
  updatedAt: string;
}

/** Per-criterion evaluation within a category. */
export interface CriterionResult {
  id: string;
  criterion: string;
  completeness: string;
  riskLevel: string;
  score: number;
  details?: unknown;
}

/** Results for a single assessment category (e.g. a document). */
export interface CategoryResult {
  category: string;
  documentId: string;
  processed: boolean;
  criteria: CriterionResult[];
}

/** Aggregated score for a single category. */
export interface CategoryScore {
  category: string;
  score: number;
  weight: number;
  weightedScore: number;
  riskLevel: string;
  criteriaCount: number;
}

/** Overall scoring summary across all categories. */
export interface OverallScore {
  score: number;
  riskLevel: string;
  missingCategories: string[];
}

/** Aggregated scoring result with overall and per-category breakdowns. */
export interface ScoringResult {
  overall: OverallScore;
  categories: CategoryScore[];
}

/** Full results for a completed risk assessment. */
export interface RiskAssessmentResults {
  assessmentId: string;
  overallScore?: number;
  categories: CategoryResult[];
  scoring?: ScoringResult;
}

/** Fetch all risk assessments for a given group. */
export const useFetchRiskAssessmentsByGroup = (groupId?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [RiskAssessmentsQueryKey, "group", groupId],
    queryFn: () =>
      axios.get<RiskAssessment[]>(`${RISK_ASSESSMENTS}/group/${groupId}`),
    enabled: !!groupId,
  });

  return {
    assessments: data?.data ?? [],
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
  };
};

/** Fetch detailed results for a specific risk assessment. */
export const useFetchRiskAssessmentResults = (id?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [RiskAssessmentsQueryKey, id, "results"],
    queryFn: () =>
      axios.get<RiskAssessmentResults>(`${RISK_ASSESSMENTS}/${id}/results`),
    enabled: !!id,
  });

  return {
    results: data?.data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
  };
};

/** Create a new risk assessment for a group. */
export const useCreateRiskAssessmentMutation = (
  onSuccess: (response: { id: string }) => void,
  onError: (err: AxiosError) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await axios.post<{ id: string }>(RISK_ASSESSMENTS, {
        groupId,
      });
      return response.data;
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: [RiskAssessmentsQueryKey],
      });
      onSuccess(response);
    },
    onError: onError,
  });
};

/** Delete a risk assessment by ID. */
export const useDeleteRiskAssessmentMutation = (
  onSuccess: () => void,
  onError: (err: AxiosError) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${RISK_ASSESSMENTS}/${id}`);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [RiskAssessmentsQueryKey],
      });
      onSuccess();
    },
    onError: onError,
  });
};

/** Download a risk assessment document for a specific category. */
export const useDownloadAssessmentDocument = (
  assessmentId?: string,
  category?: string,
) => {
  const download = async () => {
    if (!assessmentId || !category) return;
    const response = await axios.get(
      `${RISK_ASSESSMENTS}/${assessmentId}/document/${category}`,
      {
        responseType: "blob",
        headers: { Accept: "application/octet-stream" },
      },
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `risk-assessment-${assessmentId}-${category}`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return { download };
};
