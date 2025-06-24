const fs = require("fs-extra");
const report = require("multiple-cucumber-html-reporter");

/**
 * Initialize test results directory - cleans and prepares for new test run
 */
export function initializeReports() {
    try {
        fs.ensureDir("test-results");
        fs.emptyDir("test-results");
        console.log("Test results directory initialized successfully");
    } catch (error) {
        console.log("Failed to initialize test results directory: " + error);
    }
}

/**
 * Generate HTML report from cucumber JSON results
 */
export function generateReport() {
    try {
        report.generate({
            jsonDir: "test-results",
            reportPath: "test-results/reports/",
            reportName: "Playwright API Automation Report",
            pageTitle: "API Test Report",
            displayDuration: false,
            metadata: {
                browser: {
                    name: "API Tests",
                    version: "N/A",
                },
                device: "Local Machine",
                platform: {
                    name: process.platform,
                    version: process.version,
                },
            },
            customData: {
                title: "Test Info",
                data: [
                    { label: "Project", value: "API Automation" },
                    { label: "Framework", value: "Playwright + Cucumber" },
                    { label: "Test Type", value: "API Testing" }
                ],
            },
        });
        console.log("HTML report generated successfully");
    } catch (error) {
        console.log("Failed to generate HTML report: " + error);
    }
}

// If this file is run directly, generate the report
if (require.main === module) {
    generateReport();
}