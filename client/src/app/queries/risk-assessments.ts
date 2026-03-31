import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosError } from "axios";

const RISK_ASSESSMENTS = "/api/v2/risk-assessment";

export const RiskAssessmentsQueryKey = "risk-assessments";

export interface RiskAssessment {
  id: string;
  status: "in_progress" | "completed";
  submittedAt?: string;
  overallScore?: number;
}

export interface CriterionResult {
  criterion: string;
  completeness: "Complete" | "Partial" | "Missing";
  riskLevel: "Very high" | "High" | "Moderate" | "Low";
  score: number;
}

export interface RiskAssessmentResults {
  overallScore: number;
  submittedAt: string;
  criteria: CriterionResult[];
}

export const useFetchRiskAssessment = (id?: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [RiskAssessmentsQueryKey, id],
    queryFn: () => axios.get<RiskAssessment>(`${RISK_ASSESSMENTS}/${id}`),
    enabled: !!id,
  });

  return {
    riskAssessment: data?.data,
    isFetching: isLoading,
    fetchError: error as AxiosError | null,
  };
};

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

export const useCreateRiskAssessmentMutation = (
  onSuccess: (response: RiskAssessment) => void,
  onError: (err: AxiosError) => void,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await axios.post<RiskAssessment>(RISK_ASSESSMENTS, {
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

export const useDownloadAssessment = (id?: string) => {
  const download = async () => {
    if (!id) return;
    const response = await axios.get(`${RISK_ASSESSMENTS}/${id}/report`, {
      responseType: "blob",
      headers: { Accept: "application/pdf" },
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `risk-assessment-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return { download };
};
