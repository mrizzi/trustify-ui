import type React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  Spinner,
  Stack,
  StackItem,
} from "@patternfly/react-core";

import { StateError } from "@app/components/StateError";
import type { RiskAssessment } from "@app/queries/risk-assessments";
import { useFetchRiskAssessmentResults } from "@app/queries/risk-assessments";

import { CriteriaSummaryTable } from "./criteria-summary-table";

interface AssessmentResultsProps {
  assessment: RiskAssessment;
  onStartNewAssessment: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessment,
  onStartNewAssessment,
}) => {
  const { results, isFetching, fetchError } = useFetchRiskAssessmentResults(
    assessment.id,
  );

  if (isFetching) {
    return <Spinner aria-label="Loading assessment results" />;
  }

  if (fetchError) {
    return <StateError />;
  }

  if (!results) {
    return null;
  }

  const scorePercent = results.scoring?.overall.score ?? results.overallScore;
  const riskLevel = results.scoring?.overall.riskLevel;
  const updatedDate = new Date(assessment.updatedAt).toLocaleDateString();

  const allCriteria = results.categories.flatMap((cat) => cat.criteria);

  return (
    <Stack hasGutter>
      <StackItem>
        <Card>
          <CardTitle>Overall Score</CardTitle>
          <CardBody>
            <Flex
              alignItems={{ default: "alignItemsCenter" }}
              justifyContent={{
                default: "justifyContentSpaceBetween",
              }}
            >
              <FlexItem>
                <Content component="p">
                  <span
                    style={{
                      fontSize: "var(--pf-t--global--font--size--2xl)",
                      fontWeight: "var(--pf-t--global--font--weight--bold)",
                    }}
                  >
                    {scorePercent != null
                      ? `${Math.round(scorePercent)}%`
                      : "—"}
                  </span>
                  {riskLevel && (
                    <span
                      style={{ marginLeft: "var(--pf-t--global--spacer--sm)" }}
                    >
                      ({riskLevel})
                    </span>
                  )}
                </Content>
                <Content component="small">Completed on {updatedDate}</Content>
              </FlexItem>
              <FlexItem>
                <Flex gap={{ default: "gapSm" }}>
                  <FlexItem>
                    <Button
                      variant="primary"
                      isInline
                      onClick={onStartNewAssessment}
                    >
                      Start New Assessment
                    </Button>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </StackItem>
      {allCriteria.length > 0 && (
        <StackItem>
          <CriteriaSummaryTable criteria={allCriteria} />
        </StackItem>
      )}
    </Stack>
  );
};
