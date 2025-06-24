import { BeforeAll, AfterAll, Before, After, Status } from "@cucumber/cucumber";
import { APIRequestContext, request } from "@playwright/test";
import { fixture } from "./pageFixture";
import { createLogger } from "winston";
import { options } from "../helper/util/logger";

let apiContext: APIRequestContext;

BeforeAll(async function () {
    // Setup for API automation
});

// It will trigger for API scenarios
Before({ tags: "@api" }, async function ({ pickle }) {
    const scenarioName = pickle.name + pickle.id;
    
    // Create API request context for API testing
    apiContext = await request.newContext({
        baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com',
        extraHTTPHeaders: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
    });
    
    // Set up fixture
    fixture.request = apiContext;
    fixture.logger = createLogger(options(scenarioName));
    
    // Also set it on the world object directly as a fallback
    this.request = apiContext;
    this.fixture = fixture;
    
    fixture.logger.info(`Starting API test: ${scenarioName}`);
});

After({ tags: "@api" }, async function ({ pickle, result }) {
    const scenarioName = pickle.name + pickle.id;
    
    if (result?.status == Status.PASSED) {
        fixture.logger.info(`API test passed: ${scenarioName}`);
    } else {
        fixture.logger.error(`API test failed: ${scenarioName}`);
    }
    
    // Dispose API context
    if (apiContext) {
        await apiContext.dispose();
    }
});

AfterAll(async function () {
    // Cleanup for API automation
});


