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
import {
  useDownloadAssessmentDocument,
  useFetchRiskAssessmentResults,
} from "@app/queries/risk-assessments";

import { CriteriaSummaryTable } from "./criteria-summary-table";

interface AssessmentResultsProps {
  assessment: RiskAssessment;
  onStartNewAssessment: () => void;
}

/** Displays overall score card and criteria summary for a completed assessment. */
export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessment,
  onStartNewAssessment,
}) => {
  const { results, isFetching, fetchError } = useFetchRiskAssessmentResults(
    assessment.id,
  );
  const { download } = useDownloadAssessmentDocument(assessment.id, "sar");

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
            <Stack hasGutter>
              <StackItem>
                <Content component="p">
                  <span
                    style={{
                      fontSize: "var(--pf-t--global--font--size--2xl)",
                      fontWeight: "var(--pf-t--global--font--weight--bold)",
                    }}
                  >
                    {scorePercent != null
                      ? `${Math.round(scorePercent)}%`
                      : "\u2014"}
                  </span>
                  {riskLevel && (
                    <span
                      style={{
                        marginLeft: "var(--pf-t--global--spacer--sm)",
                      }}
                    >
                      ({riskLevel})
                    </span>
                  )}
                </Content>
                <Content component="small">Completed on {updatedDate}</Content>
              </StackItem>
              <StackItem>
                <Flex gap={{ default: "gapSm" }}>
                  <FlexItem>
                    <Button variant="secondary" onClick={onStartNewAssessment}>
                      Start New Assessment
                    </Button>
                  </FlexItem>
                  <FlexItem>
                    <Button variant="primary" onClick={download}>
                      Download Assessment
                    </Button>
                  </FlexItem>
                </Flex>
              </StackItem>
            </Stack>
          </CardBody>
        </Card>
      </StackItem>
      {allCriteria.length > 0 && (
        <StackItem>
          <Card>
            <CardTitle>Criteria Summary</CardTitle>
            <CardBody>
              <CriteriaSummaryTable criteria={allCriteria} />
            </CardBody>
          </Card>
        </StackItem>
      )}
    </Stack>
  );
};
