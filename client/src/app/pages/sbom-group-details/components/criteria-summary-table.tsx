import type React from "react";

import { Flex, FlexItem, Label } from "@patternfly/react-core";
import CheckCircleIcon from "@patternfly/react-icons/dist/esm/icons/check-circle-icon";
import ExclamationCircleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-circle-icon";
import ExclamationTriangleIcon from "@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import type { CriterionResult } from "@app/queries/risk-assessments";

interface CriteriaSummaryTableProps {
  criteria: CriterionResult[];
}

/** Format a snake_case criterion key into a readable label. */
const formatCriterionLabel = (key: string) => {
  return key.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
};

/** Map a completeness string to a PatternFly Label color. */
const completenessColor = (value: string) => {
  switch (value) {
    case "complete":
      return "green";
    case "partial":
      return "blue";
    case "missing":
      return "yellow";
    default:
      return "grey";
  }
};

/** Render a risk level with an appropriate status icon. */
const RiskLevelDisplay: React.FC<{ value: string }> = ({ value }) => {
  const lower = value.toLowerCase();

  let icon: React.ReactNode;
  if (lower === "very high" || lower === "high") {
    icon = (
      <ExclamationCircleIcon color="var(--pf-t--global--color--status--danger--default)" />
    );
  } else if (lower === "moderate") {
    icon = (
      <ExclamationTriangleIcon color="var(--pf-t--global--color--status--warning--default)" />
    );
  } else {
    icon = (
      <CheckCircleIcon color="var(--pf-t--global--color--status--success--default)" />
    );
  }

  return (
    <Flex
      gap={{ default: "gapSm" }}
      alignItems={{ default: "alignItemsCenter" }}
      flexWrap={{ default: "nowrap" }}
    >
      <FlexItem>{icon}</FlexItem>
      <FlexItem>{formatCriterionLabel(value)}</FlexItem>
    </Flex>
  );
};

export const CriteriaSummaryTable: React.FC<CriteriaSummaryTableProps> = ({
  criteria,
}) => {
  return (
    <Table aria-label="Criteria summary table" variant="compact">
      <Thead>
        <Tr>
          <Th>Criterion</Th>
          <Th>Completeness</Th>
          <Th>Risk Level</Th>
          <Th>Score</Th>
        </Tr>
      </Thead>
      <Tbody>
        {criteria.map((item) => (
          <Tr key={item.id}>
            <Td dataLabel="Criterion">
              {formatCriterionLabel(item.criterion)}
            </Td>
            <Td dataLabel="Completeness">
              <Label color={completenessColor(item.completeness)}>
                {formatCriterionLabel(item.completeness)}
              </Label>
            </Td>
            <Td dataLabel="Risk Level">
              <RiskLevelDisplay value={item.riskLevel} />
            </Td>
            <Td dataLabel="Score">{item.score}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
