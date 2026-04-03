import type React from "react";

import {
  Button,
  Content,
  Spinner,
  Stack,
  StackItem,
} from "@patternfly/react-core";

import { StateError } from "@app/components/StateError";
import { StateNoData } from "@app/components/StateNoData";
import {
  useCreateRiskAssessmentMutation,
  useDeleteRiskAssessmentMutation,
  useFetchRiskAssessmentResults,
  useFetchRiskAssessmentsByGroup,
} from "@app/queries/risk-assessments";

import { AssessmentWizard } from "./components/assessment-wizard";

interface ProductRiskAssessmentProps {
  groupId: string;
}

export const ProductRiskAssessment: React.FC<ProductRiskAssessmentProps> = ({
  groupId,
}) => {
  const { assessments, isFetching, fetchError } =
    useFetchRiskAssessmentsByGroup(groupId);

  const latestAssessment =
    assessments.length > 0 ? assessments[assessments.length - 1] : undefined;

  const { results } = useFetchRiskAssessmentResults(latestAssessment?.id);

  const deleteMutation = useDeleteRiskAssessmentMutation(
    () => {},
    () => {},
  );
  const createMutation = useCreateRiskAssessmentMutation(
    () => {},
    () => {},
  );

  const handleStartNewAssessment = async () => {
    if (latestAssessment) {
      await deleteMutation.mutateAsync(latestAssessment.id);
    }
    createMutation.mutate(groupId);
  };

  const handleCreateAssessment = () => {
    createMutation.mutate(groupId);
  };

  if (isFetching) {
    return <Spinner aria-label="Loading risk assessment" />;
  }

  if (fetchError) {
    return <StateError />;
  }

  if (!latestAssessment) {
    return (
      <Stack hasGutter>
        <StackItem>
          <Content component="p">
            The NIST 800-30 Product Risk Assessment (PRA) is a rigorous
            methodology used to assess and manage product risks.
          </Content>
        </StackItem>
        <StackItem>
          <StateNoData />
        </StackItem>
        <StackItem>
          <Button variant="primary" onClick={handleCreateAssessment}>
            Start New Assessment
          </Button>
        </StackItem>
      </Stack>
    );
  }

  return (
    <Stack hasGutter>
      <StackItem>
        <Content component="p">
          The NIST 800-30 Product Risk Assessment (PRA) is a rigorous
          methodology used to assess and manage product risks.
        </Content>
      </StackItem>
      <StackItem isFilled>
        <AssessmentWizard
          riskAssessmentId={latestAssessment.id}
          results={results}
          onStartNewAssessment={handleStartNewAssessment}
        />
      </StackItem>
    </Stack>
  );
};
