import React from "react";

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

import {
  ASSESSMENT_CATEGORIES,
  AssessmentCategoryStep,
} from "./assessment-category-step";

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
}

export const AssessmentWizard: React.FC<AssessmentWizardProps> = ({
  riskAssessmentId,
}) => {
  const [activeStep, setActiveStep] = React.useState(0);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(
    new Set(),
  );

  const currentCategory = ASSESSMENT_CATEGORIES[activeStep];

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
            {ASSESSMENT_CATEGORIES.map((category, index) => (
              <NavItem
                key={category.key}
                itemId={index}
                isActive={activeStep === index}
                onClick={() => setActiveStep(index)}
                icon={
                  completedSteps.has(index) ? (
                    <CheckCircleIcon color="var(--pf-t--global--color--status--success--default)" />
                  ) : undefined
                }
              >
                {`${index + 1}. ${category.name}`}
              </NavItem>
            ))}
          </NavList>
        </Nav>
      </FlexItem>
      <FlexItem flex={{ default: "flex_1" }}>
        <Stack hasGutter>
          <StackItem isFilled>
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
              onUploadSuccess={() => {
                setCompletedSteps((prev) => new Set(prev).add(activeStep));
              }}
            />
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
