import type React from "react";

import { Label } from "@patternfly/react-core";
import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import type { CriterionResult } from "@app/queries/risk-assessments";

interface CriteriaSummaryTableProps {
  criteria: CriterionResult[];
}

const completenessColor = (value: CriterionResult["completeness"]) => {
  switch (value) {
    case "Complete":
      return "green";
    case "Partial":
      return "blue";
    case "Missing":
      return "yellow";
  }
};

const riskLevelColor = (value: CriterionResult["riskLevel"]) => {
  switch (value) {
    case "Very high":
    case "High":
      return "red";
    case "Moderate":
      return "orange";
    case "Low":
      return "grey";
  }
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
          <Tr key={item.criterion}>
            <Td dataLabel="Criterion">{item.criterion}</Td>
            <Td dataLabel="Completeness">
              <Label color={completenessColor(item.completeness)}>
                {item.completeness}
              </Label>
            </Td>
            <Td dataLabel="Risk Level">
              <Label color={riskLevelColor(item.riskLevel)}>
                {item.riskLevel}
              </Label>
            </Td>
            <Td dataLabel="Score">{item.score}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
