import type React from "react";

import { Content, Stack, StackItem } from "@patternfly/react-core";

import { AssessmentWizard } from "./components/assessment-wizard";

interface ProductRiskAssessmentProps {
  riskAssessmentId: string;
}

export const ProductRiskAssessment: React.FC<ProductRiskAssessmentProps> = ({
  riskAssessmentId,
}) => {
  return (
    <Stack hasGutter>
      <StackItem>
        <Content component="p">
          The NIST 800-30 Product Risk Assessment (PRA) is a rigorous
          methodology used to assess and manage product risks.
        </Content>
      </StackItem>
      <StackItem isFilled>
        <AssessmentWizard riskAssessmentId={riskAssessmentId} />
      </StackItem>
    </Stack>
  );
};
