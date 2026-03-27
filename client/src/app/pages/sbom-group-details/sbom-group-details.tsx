import React from "react";
import { Link } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  Content,
  Flex,
  FlexItem,
  Label,
  PageSection,
  Tab,
  TabContent,
  TabTitleText,
  Tabs,
} from "@patternfly/react-core";

import { PRODUCT_LABEL_KEY } from "@app/Constants.ts";
import { PathParam, Paths, useRouteParams } from "@app/Routes";
import { DocumentMetadata } from "@app/components/DocumentMetadata";
import { useTabControls } from "@app/hooks/tab-controls/useTabControls";
import { useSuspenseSBOMGroupById } from "@app/queries/sbom-groups";

import { SbomSearchProvider } from "../sbom-list/sbom-context";
import { SbomTable } from "../sbom-list/sbom-table";
import { SbomToolbar } from "../sbom-list/sbom-toolbar";
import { ProductRiskAssessment } from "./product-risk-assessment";

const SbomListContent: React.FC<{ sbomGroupId: string }> = ({
  sbomGroupId,
}) => (
  <SbomSearchProvider sbomGroupId={sbomGroupId}>
    <SbomToolbar showFilters />
    <SbomTable />
  </SbomSearchProvider>
);

export const SBOMGroupDetails: React.FC = () => {
  const sbomGroupId = useRouteParams(PathParam.SBOM_GROUP_ID);

  const { sbomGroup } = useSuspenseSBOMGroupById(sbomGroupId);

  const isProduct = PRODUCT_LABEL_KEY in (sbomGroup?.labels ?? {});

  const {
    propHelpers: { getTabsProps, getTabProps, getTabContentProps },
  } = useTabControls({
    persistenceKeyPrefix: "sgd",
    persistTo: "urlParams",
    tabKeys: ["sboms", "risk-assessment"],
  });

  const sbomsTabRef = React.createRef<HTMLElement>();
  const riskAssessmentTabRef = React.createRef<HTMLElement>();

  return (
    <>
      <DocumentMetadata title={sbomGroup?.name} />
      <PageSection type="breadcrumb">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={Paths.sbomGroups}>Groups</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>Group details</BreadcrumbItem>
        </Breadcrumb>
      </PageSection>
      <PageSection>
        <Flex>
          <FlexItem>
            <Content component="h1">{sbomGroup?.name} </Content>
          </FlexItem>
          <FlexItem>
            {isProduct ? (
              <Label color="purple" isCompact>
                {PRODUCT_LABEL_KEY}
              </Label>
            ) : null}
          </FlexItem>
        </Flex>
        <Content component="p">{sbomGroup?.description} </Content>
      </PageSection>
      {isProduct ? (
        <>
          <PageSection>
            <Tabs
              mountOnEnter
              {...getTabsProps()}
              aria-label="Group details tabs"
              role="region"
            >
              <Tab
                {...getTabProps("sboms")}
                title={<TabTitleText>Group SBOMs</TabTitleText>}
                tabContentRef={sbomsTabRef}
              />
              <Tab
                {...getTabProps("risk-assessment")}
                title={<TabTitleText>Product Risk Assessment</TabTitleText>}
                tabContentRef={riskAssessmentTabRef}
              />
            </Tabs>
          </PageSection>
          <PageSection>
            <TabContent
              {...getTabContentProps("sboms")}
              ref={sbomsTabRef}
              aria-label="Group SBOMs"
            >
              <SbomListContent sbomGroupId={sbomGroupId} />
            </TabContent>
            <TabContent
              {...getTabContentProps("risk-assessment")}
              ref={riskAssessmentTabRef}
              aria-label="Product Risk Assessment"
            >
              <ProductRiskAssessment riskAssessmentId={sbomGroupId} />
            </TabContent>
          </PageSection>
        </>
      ) : (
        <PageSection>
          <SbomListContent sbomGroupId={sbomGroupId} />
        </PageSection>
      )}
    </>
  );
};
