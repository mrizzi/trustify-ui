import React from "react";
import { NavLink } from "react-router-dom";

import { Table, Tbody, Td, Th, Thead, Tr } from "@patternfly/react-table";

import { SimplePagination } from "@app/components/SimplePagination";
import {
  ConditionalTableBody,
  TableHeaderContentWithControls,
  TableRowContentWithControls,
} from "@app/components/TableControls";
import { Paths } from "@app/Routes";

import { ModelSearchContext } from "./model-context";

export const ModelTable: React.FC = () => {
  const { isFetching, fetchError, totalItemCount, tableControls } =
    React.useContext(ModelSearchContext);

  const {
    numRenderedColumns,
    currentPageItems,
    propHelpers: {
      paginationProps,
      tableProps,
      getThProps,
      getTrProps,
      getTdProps,
    },
  } = tableControls;

  return (
    <>
      <Table {...tableProps} aria-label="model-table">
        <Thead>
          <Tr>
            <TableHeaderContentWithControls {...tableControls}>
              <Th {...getThProps({ columnKey: "name" })} />
              <Th {...getThProps({ columnKey: "supplier" })} />
              <Th {...getThProps({ columnKey: "license" })} />
            </TableHeaderContentWithControls>
          </Tr>
        </Thead>
        <ConditionalTableBody
          isLoading={isFetching}
          isError={!!fetchError}
          isNoData={totalItemCount === 0}
          numRenderedColumns={numRenderedColumns}
        >
          {currentPageItems.map((item, rowIndex) => (
            <Tbody key={item.nodeId}>
              <Tr {...getTrProps({ item })}>
                <TableRowContentWithControls
                  {...tableControls}
                  item={item}
                  rowIndex={rowIndex}
                >
                  <Td
                    width={30}
                    modifier="breakWord"
                    {...getTdProps({ columnKey: "name" })}
                  >
                    <NavLink
                      to={`${Paths.models}/${item.sbomId}/${item.nodeId}`}
                    >
                      {item.name}
                    </NavLink>
                  </Td>
                  <Td
                    width={30}
                    modifier="truncate"
                    {...getTdProps({ columnKey: "supplier" })}
                  >
                    {item.supplier ?? "-"}
                  </Td>
                  <Td
                    width={40}
                    modifier="truncate"
                    {...getTdProps({ columnKey: "license" })}
                  >
                    {item.license ?? "-"}
                  </Td>
                </TableRowContentWithControls>
              </Tr>
            </Tbody>
          ))}
        </ConditionalTableBody>
      </Table>
      <SimplePagination
        idPrefix="model-table"
        isTop={false}
        paginationProps={paginationProps}
      />
    </>
  );
};
