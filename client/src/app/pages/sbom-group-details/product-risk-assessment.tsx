import type React from "react";

import { Content, PageSection } from "@patternfly/react-core";

export const ProductRiskAssessment: React.FC = () => {
  return (
    <PageSection>
      <Content component="p">
        The NIST 800-30 Product Risk Assessment (PRA) is a rigorous methodology
        used to assess and manage product risks.
      </Content>
    </PageSection>
  );
};
