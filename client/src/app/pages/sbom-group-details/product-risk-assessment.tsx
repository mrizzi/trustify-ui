import type React from "react";

import { Content, Spinner, Stack, StackItem } from "@patternfly/react-core";

import { StateError } from "@app/components/StateError";
import {
  useCreateRiskAssessmentMutation,
  useFetchRiskAssessment,
} from "@app/queries/risk-assessments";

import { AssessmentResults } from "./components/assessment-results";
import { AssessmentWizard } from "./components/assessment-wizard";

interface ProductRiskAssessmentProps {
  riskAssessmentId: string;
}

export const ProductRiskAssessment: React.FC<ProductRiskAssessmentProps> = ({
  riskAssessmentId,
}) => {
  const { riskAssessment, isFetching, fetchError } =
    useFetchRiskAssessment(riskAssessmentId);

  const createMutation = useCreateRiskAssessmentMutation(
    () => {
      window.location.reload();
    },
    () => {},
  );

  const handleStartNewAssessment = () => {
    createMutation.mutate(riskAssessmentId);
  };

  if (isFetching) {
    return <Spinner aria-label="Loading risk assessment" />;
  }

  if (fetchError) {
    return <StateError />;
  }

  const isCompleted = riskAssessment?.status === "completed";

  return (
    <Stack hasGutter>
      <StackItem>
        <Content component="p">
          The NIST 800-30 Product Risk Assessment (PRA) is a rigorous
          methodology used to assess and manage product risks.
        </Content>
      </StackItem>
      <StackItem isFilled>
        {isCompleted ? (
          <AssessmentResults
            riskAssessmentId={riskAssessmentId}
            onStartNewAssessment={handleStartNewAssessment}
          />
        ) : (
          <AssessmentWizard riskAssessmentId={riskAssessmentId} />
        )}
      </StackItem>
    </Stack>
  );
};
