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
import {
  useDownloadAssessment,
  useFetchRiskAssessmentResults,
} from "@app/queries/risk-assessments";

import { CriteriaSummaryTable } from "./criteria-summary-table";

interface AssessmentResultsProps {
  riskAssessmentId: string;
  onStartNewAssessment: () => void;
}

export const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  riskAssessmentId,
  onStartNewAssessment,
}) => {
  const { results, isFetching, fetchError } =
    useFetchRiskAssessmentResults(riskAssessmentId);
  const { download } = useDownloadAssessment(riskAssessmentId);

  if (isFetching) {
    return <Spinner aria-label="Loading assessment results" />;
  }

  if (fetchError) {
    return <StateError />;
  }

  if (!results) {
    return null;
  }

  const submittedDate = new Date(results.submittedAt).toLocaleDateString();

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
                    {results.overallScore}%
                  </span>
                </Content>
                <Content component="small">
                  Submitted on {submittedDate}
                </Content>
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
                  <FlexItem>
                    <Button variant="primary" onClick={download}>
                      Download Assessment
                    </Button>
                  </FlexItem>
                </Flex>
              </FlexItem>
            </Flex>
          </CardBody>
        </Card>
      </StackItem>
      <StackItem>
        <CriteriaSummaryTable criteria={results.criteria} />
      </StackItem>
    </Stack>
  );
};
