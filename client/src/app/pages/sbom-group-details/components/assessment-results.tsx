import type React from "react";

import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Content,
  Flex,
  FlexItem,
  Stack,
  StackItem,
} from "@patternfly/react-core";

import type {
  CategoryResult,
  RiskAssessmentResults,
} from "@app/queries/risk-assessments";
import { useDownloadAssessmentDocument } from "@app/queries/risk-assessments";

import type { AssessmentCategory } from "./assessment-category-step";
import { CriteriaSummaryTable } from "./criteria-summary-table";

interface AssessmentCategoryResultsProps {
  /** The assessment ID for document download. */
  assessmentId: string;
  /** The category definition (key, name, description). */
  category: AssessmentCategory;
  /** The per-category result data including criteria. */
  categoryResult: CategoryResult;
  /** The full results for scoring lookup. */
  overallResults: RiskAssessmentResults;
  onStartNewAssessment: () => void;
}

/** Displays per-category score card and criteria summary for a processed category. */
export const AssessmentCategoryResults: React.FC<
  AssessmentCategoryResultsProps
> = ({
  assessmentId,
  category,
  categoryResult,
  overallResults,
  onStartNewAssessment,
}) => {
  const { download } = useDownloadAssessmentDocument(
    assessmentId,
    category.key,
  );

  const categoryScore = overallResults.scoring?.categories.find(
    (c) => c.category === category.key,
  );
  const scorePercent = categoryScore?.score ?? overallResults.overallScore;
  const riskLevel = categoryScore?.riskLevel;

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
      {categoryResult.criteria.length > 0 && (
        <StackItem>
          <Card>
            <CardTitle>Criteria Summary</CardTitle>
            <CardBody>
              <CriteriaSummaryTable criteria={categoryResult.criteria} />
            </CardBody>
          </Card>
        </StackItem>
      )}
    </Stack>
  );
};
