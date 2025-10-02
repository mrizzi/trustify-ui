import { createBdd } from "playwright-bdd";
import { expect } from "playwright/test";
import { DetailsPage } from "../../helpers/DetailsPage";
import { ToolbarTable } from "../../helpers/ToolbarTable";
import { SbomListPage } from "../../pages/sbom-list/SbomListPage";
import { test } from "../../fixtures";

export const { Given, When, Then } = createBdd(test);

const PACKAGE_TABLE_NAME = "Package table";
const VULN_TABLE_NAME = "Vulnerability table";

Given("An ingested SBOM {string} is available", async ({ page }, sbomName) => {
  const sbomListPage = await SbomListPage.build(page);

  const toolbar = await sbomListPage.getToolbar();
  const table = await sbomListPage.getTable();

  await toolbar.applyTextFilter("Filter text", sbomName);
  await table.waitUntilDataIsLoaded();
  await table.verifyColumnContainsText("Name", sbomName);
});

When(
  "User visits SBOM details Page of {string}",
  async ({ page }, sbomName) => {
    await page.getByRole("link", { name: sbomName, exact: true }).click();
  },
);

Then("{string} is visible", async ({ page }, fieldName) => {
  await expect(page.locator(`[aria-label="${fieldName}"]`)).toBeVisible();
});

Then(
  "{string} action is invoked and downloaded filename is {string}",
  async ({ page }, actionName, expectedFilename) => {
    const downloadPromise = page.waitForEvent("download");

    const detailsPage = new DetailsPage(page);
    await detailsPage.clickOnPageAction(actionName);

    const download = await downloadPromise;

    const filename = download.suggestedFilename();
    expect(filename).toEqual(expectedFilename);
  },
);

Then(
  "The Package table is sorted by {string}",
  async ({ page }, columnName) => {
    const toolbarTable = new ToolbarTable(page, PACKAGE_TABLE_NAME);
    await toolbarTable.verifyTableIsSortedBy(columnName);
  },
);

Then("Search by FilterText {string}", async ({ page }, filterText) => {
  const toolbarTable = new ToolbarTable(page, PACKAGE_TABLE_NAME);
  await toolbarTable.filterByText(filterText);
});

Then(
  "The Package table total results is {int}",
  async ({ page }, totalResults) => {
    const toolbarTable = new ToolbarTable(page, PACKAGE_TABLE_NAME);
    await toolbarTable.verifyPaginationHasTotalResults(totalResults);
  },
);

Then(
  "The Package table total results is greather than {int}",
  async ({ page }, totalResults) => {
    const toolbarTable = new ToolbarTable(page, PACKAGE_TABLE_NAME);
    await toolbarTable.verifyPaginationHasTotalResultsGreatherThan(
      totalResults,
    );
  },
);

Then(
  "The {string} column of the Package table table contains {string}",
  async ({ page }, columnName, expectedValue) => {
    const toolbarTable = new ToolbarTable(page, PACKAGE_TABLE_NAME);
    await toolbarTable.verifyColumnContainsText(columnName, expectedValue);
  },
);

When("User Clicks on Vulnerabilities Tab Action", async ({ page }) => {
  await page.getByLabel("Tab action").click();
});

Then("Vulnerability Popup menu appears with message", async ({ page }) => {
  await page.getByText("Any found vulnerabilities").isVisible();
  await page.getByLabel("Close").click();
});

Then(
  "Vulnerability Risk Profile circle should be visible",
  async ({ page }) => {
    await page.locator(`xpath=//div[contains(@class, 'chart')]`).isVisible();
  },
);

Then(
  "Vulnerability Risk Profile shows summary of vulnerabilities",
  async ({ page }) => {
    const detailsPage = new DetailsPage(page);
    await detailsPage.verifyVulnerabilityPanelcount();
  },
);

Then(
  "SBOM Name {string} should be visible inside the tab",
  async ({ page }, sbomName) => {
    const panelSbomName = await page.locator(
      `xpath=//section[@id='refVulnerabilitiesSection']//dt[contains(.,'Name')]/following-sibling::dd`,
    );
    await panelSbomName.isVisible();
    await expect(await panelSbomName.textContent()).toEqual(sbomName);
  },
);

Then("SBOM Version should be visible inside the tab", async ({ page }) => {
  const panelSBOMVersion = await page.locator(
    `xpath=//section[@id='refVulnerabilitiesSection']//dt[contains(.,'Version')]/following-sibling::dd`,
  );
  await panelSBOMVersion.isVisible();
});

Then(
  "SBOM Creation date should be visible inside the tab",
  async ({ page }) => {
    const panelSBOMVersion = await page.locator(
      `xpath=//section[@id='refVulnerabilitiesSection']//dt[contains(.,'Creation date')]/following-sibling::dd`,
    );
    await panelSBOMVersion.isVisible();
  },
);

Then(
  "List of related Vulnerabilities should be sorted by {string} in ascending order",
  async ({ page }, columnName) => {
    const toolbarTable = new ToolbarTable(page, VULN_TABLE_NAME);
    await toolbarTable.verifyTableIsSortedBy(columnName, true);
  },
);

Then("Pagination of Vulnerabilities list works", async ({ page }) => {
  const toolbarTable = new ToolbarTable(page, VULN_TABLE_NAME);
  const vulnTableTopPagination = `xpath=//div[@id="vulnerability-table-pagination-top"]`;
  await toolbarTable.verifyPagination(vulnTableTopPagination);
});

Then("Pagination of Packages list works", async ({ page }) => {
  const toolbarTable = new ToolbarTable(page, PACKAGE_TABLE_NAME);
  const vulnTableTopPagination = `xpath=//div[@id="package-table-pagination-top"]`;
  await toolbarTable.verifyPagination(vulnTableTopPagination);
});

Then(
  "List of Vulnerabilities has column {string}",
  async ({ page }, columnHeader) => {
    const toolbarTable = new ToolbarTable(page, VULN_TABLE_NAME);
    await toolbarTable.verifyTableHeaderContains(columnHeader);
  },
);

Then(
  "Table column {string} is not sortable",
  async ({ page }, columnHeader) => {
    const toolbarTable = new ToolbarTable(page, VULN_TABLE_NAME);
    await toolbarTable.verifyColumnIsNotSortable(columnHeader);
  },
);

Then(
  "Sorting of {string} Columns Works",
  async ({ page }, columnHeaders: string) => {
    const headers = columnHeaders
      .split(`,`)
      .map((column: string) => column.trim());
    const toolbarTable = new ToolbarTable(page, VULN_TABLE_NAME);
    const vulnTableTopPagination = `xpath=//div[@id="vulnerability-table-pagination-top"]`;
    await toolbarTable.verifySorting(vulnTableTopPagination, headers);
  },
);

When(
  "User Adds Labels {string} to {string} SBOM from Explorer Page",
  async ({ page }, labelList, _sbomName) => {
    const detailsPage = new DetailsPage(page);
    await detailsPage.editLabelsDetailsPage();
    const labelsToAdd =
      labelList === "RANDOM_LABELS" ? detailsPage.generateLabels() : labelList;
    await detailsPage.addLabels(labelsToAdd);
    // biome-ignore lint/suspicious/noExplicitAny: allowed
    (page as any).testContext = {
      // biome-ignore lint/suspicious/noExplicitAny: allowed
      ...(page as any).testContext,
      generatedLabels: labelsToAdd,
    };
  },
);

Then(
  "The Label list {string} added to the SBOM {string} on Explorer Page",
  async ({ page }, labelList, sbomName) => {
    const detailsPage = new DetailsPage(page);
    await detailsPage.selectTab(`Info`);
    const infoSection = page.locator("#refTabInfoSection");

    // Use stored generated labels if placeholder was used
    const labelsToVerify =
      labelList === "RANDOM_LABELS"
        ? // biome-ignore lint/suspicious/noExplicitAny: allowed
          (page as any).testContext?.generatedLabels || labelList
        : labelList;
    await detailsPage.verifyLabels(labelsToVerify, sbomName, infoSection);
  },
);
