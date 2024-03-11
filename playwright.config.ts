import type {PlaywrightTestConfig} from '@playwright/test';
import {devices} from '@playwright/test';
import {environment} from "./src/config/environment";

const WIDTH: number = process.env.CI ? 1280 : 1680;
const HEIGHT: number = process.env.CI ? 720 : 1050;
const FIFTEEN_SECONDS: number = 15 * 1000;
const THREE_MINUTES: number = 3 * 60 * 1000;
const IS_CI_RUN: string = process.env.CI;

const config: PlaywrightTestConfig = {
    testDir: './src/tests',
    timeout: THREE_MINUTES,
    expect: {
        timeout: FIFTEEN_SECONDS,
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,     /* Fail the build on CI if you accidentally left test.only in the source code. */
    retries: process.env.CI ? 1 : 0,  /* Retry numbers on CI only */
    workers: process.env.CI ? 5 : 5,  /* Worker number for parallel tests. */
    reporter: [
        ['list', {outputFile: 'test-results/list.txt', open: 'always'}],
        ['./src/reporter/qmetry_reporter.ts'],
    ],
    globalSetup: require.resolve('./src/tests/_global_auth'),
    use: {
        actionTimeout: 0,
        baseURL: environment.env.baseurl,
        headless: environment.headless,
        ignoreHTTPSErrors: true,
        screenshot: IS_CI_RUN ? 'on' : 'only-on-failure', /* Keeping the trace file in case of FLAKY tests. */
        testIdAttribute: 'data-testid',
        trace: IS_CI_RUN ? 'on' : 'retain-on-failure',
        video:  "off"
    },
    projects: [
        {
            name: 'Authentication',
            testMatch: /authentication.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
        },
        {
            name: 'Contracts',
            testMatch: /contracts.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Footer',
            testMatch: /footer.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Home Direct',
            testMatch: /home_direct.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Motor Direct',
            testMatch: /motor_direct.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Policyholders',
            testMatch: /policyholders.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Sara Partners',
            testMatch: /sara_partners.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Tenants',
            testMatch: /tenants.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Travel Direct',
            testMatch: /travel_direct.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Travel Partners',
            testMatch: /travel_partners.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Internal Users',
            testMatch: /internal_users.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'External Users',
            testMatch: /external_users.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Link Builder',
            testMatch: /linkbuilder.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        },
        {
            name: 'Sessions',
            testMatch: /session.spec.ts/,
            use: {
                ...devices['Desktop Chrome'],
                viewport: {width: WIDTH, height: HEIGHT},
                baseURL: environment.env.baseurl,
            },
            // dependencies: ['Authentication'],
        }
    ],
    outputDir: 'test-results/',
};
export default config;
