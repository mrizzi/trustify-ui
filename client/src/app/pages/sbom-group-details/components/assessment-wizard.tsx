import React from "react";

import { useQueryClient } from "@tanstack/react-query";
import axios, { type AxiosRequestConfig } from "axios";

import {
  Button,
  Flex,
  FlexItem,
  Nav,
  NavItem,
  NavList,
  Stack,
  StackItem,
} from "@patternfly/react-core";
import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";

import { FORM_DATA_FILE_KEY } from "@app/Constants";
import type { RiskAssessmentResults } from "@app/queries/risk-assessments";
import { RiskAssessmentsQueryKey } from "@app/queries/risk-assessments";

import {
  ASSESSMENT_CATEGORIES,
  AssessmentCategoryStep,
} from "./assessment-category-step";
import { AssessmentCategoryResults } from "./assessment-results";

const RISK_ASSESSMENTS = "/api/v2/risk-assessment";

const uploadRiskAssessmentDocument = (
  riskAssessmentId: string,
  category: string,
  formData: FormData,
  config?: AxiosRequestConfig,
) => {
  const file = formData.get(FORM_DATA_FILE_KEY) as File;
  return axios.post(
    `${RISK_ASSESSMENTS}/${riskAssessmentId}/document/${category}`,
    file,
    {
      ...config,
      headers: { "Content-Type": "application/pdf" },
    },
  );
};

interface AssessmentWizardProps {
  riskAssessmentId: string;
  /** Per-category results data from the API. */
  results?: RiskAssessmentResults;
  /** Callback to delete the current assessment and create a fresh one. */
  onStartNewAssessment: () => void;
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  riskAssessmentId,
  results,
  onStartNewAssessment,
}) => {
  const queryClient = useQueryClient();
  const [activeStep, setActiveStep] = React.useState(0);
  const [uploadedSteps, setUploadedSteps] = React.useState<Set<number>>(
    new Set(),
  );

  const categoryResultMap = new Map(
    results?.categories.map((cat) => [cat.category, cat]) ?? [],
  );

  const currentCategory = ASSESSMENT_CATEGORIES[activeStep];
  const currentCategoryResult = categoryResultMap.get(currentCategory.key);
  const isCategoryProcessed = currentCategoryResult?.processed ?? false;

  const handleBack = () => {
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setActiveStep((prev) =>
      Math.min(ASSESSMENT_CATEGORIES.length - 1, prev + 1),
    );
  };

  return (
    <Flex>
      <FlexItem>
        <Nav aria-label="Assessment categories" variant="default">
          <NavList>
            {ASSESSMENT_CATEGORIES.map((category, index) => {
              const isActive = activeStep === index;
              const isProcessed =
                categoryResultMap.get(category.key)?.processed ?? false;
              const isUploaded = uploadedSteps.has(index);
              const isCompleted = isProcessed || isUploaded;

              const stepIcon = isCompleted ? (
                <CheckCircleIcon color="var(--pf-t--global--color--status--success--default)" />
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    fontSize: "var(--pf-t--global--font--size--sm)",
                    fontWeight: "var(--pf-t--global--font--weight--bold)",
                    backgroundColor: isActive
                      ? "var(--pf-t--global--color--brand--default)"
                      : "transparent",
                    color: isActive
                      ? "#fff"
                      : "var(--pf-t--global--color--200)",
                    border: isActive
                      ? "none"
                      : "1px solid var(--pf-t--global--color--200)",
                  }}
                >
                  {index + 1}
                </span>
              );

              return (
                <NavItem
                  key={category.key}
                  itemId={index}
                  isActive={isActive}
                  onClick={() => setActiveStep(index)}
                  icon={stepIcon}
                >
                  {category.name}
                </NavItem>
              );
            })}
          </NavList>
        </Nav>
      </FlexItem>
      <FlexItem flex={{ default: "flex_1" }}>
        <Stack hasGutter>
          <StackItem isFilled>
            {isCategoryProcessed && currentCategoryResult ? (
              <AssessmentCategoryResults
                assessmentId={riskAssessmentId}
                category={currentCategory}
                categoryResult={currentCategoryResult}
                overallResults={results as RiskAssessmentResults}
                onStartNewAssessment={onStartNewAssessment}
              />
            ) : (
              <AssessmentCategoryStep
                key={currentCategory.key}
                category={currentCategory}
                uploadFn={(formData, config) =>
                  uploadRiskAssessmentDocument(
                    riskAssessmentId,
                    currentCategory.key,
                    formData,
                    config,
                  )
                }
                onUploadSuccess={async () => {
                  setUploadedSteps((prev) => new Set(prev).add(activeStep));
                  await queryClient.invalidateQueries({
                    queryKey: [RiskAssessmentsQueryKey],
                  });
                }}
              />
            )}
          </StackItem>
          <StackItem>
            <Flex justifyContent={{ default: "justifyContentFlexEnd" }}>
              <FlexItem>
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  isDisabled={activeStep === 0}
                >
                  Back
                </Button>
              </FlexItem>
              <FlexItem>
                <Button
                  variant="primary"
                  onClick={handleNext}
                  isDisabled={activeStep === ASSESSMENT_CATEGORIES.length - 1}
                >
                  Next
                </Button>
              </FlexItem>
            </Flex>
          </StackItem>
        </Stack>
      </FlexItem>
    </Flex>
  );
};
