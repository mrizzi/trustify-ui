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
  useFetchRiskAssessmentsByGroup,
} from "@app/queries/risk-assessments";

import { AssessmentResults } from "./components/assessment-results";
import { AssessmentWizard } from "./components/assessment-wizard";

interface ProductRiskAssessmentProps {
  groupId: string;
}

export const ProductRiskAssessment: React.FC<ProductRiskAssessmentProps> = ({
  groupId,
}) => {
  const { assessments, isFetching, fetchError } =
    useFetchRiskAssessmentsByGroup(groupId);

  const createMutation = useCreateRiskAssessmentMutation(
    () => {},
    () => {},
  );

  const handleStartNewAssessment = () => {
    createMutation.mutate(groupId);
  };

  if (isFetching) {
    return <Spinner aria-label="Loading risk assessment" />;
  }

  if (fetchError) {
    return <StateError />;
  }

  const latestAssessment =
    assessments.length > 0 ? assessments[assessments.length - 1] : undefined;

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
          <Button variant="primary" onClick={handleStartNewAssessment}>
            Start New Assessment
          </Button>
        </StackItem>
      </Stack>
    );
  }

  const isCompleted = latestAssessment.status === "completed";

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
          resultsContent={
            isCompleted ? (
              <AssessmentResults
                assessment={latestAssessment}
                onStartNewAssessment={handleStartNewAssessment}
              />
            ) : undefined
          }
        />
      </StackItem>
    </Stack>
  );
};
