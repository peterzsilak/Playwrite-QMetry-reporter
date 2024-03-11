import * as process from "process";

const nodeenv: string = process.env.NODE_ENV;
export const qmetry = {
    'qmetry': {
        'baseurl': 'https://qtmcloud.qmetry.com/rest/api/latest',
        'apikey': 'adfcf1d3d73b80c8fd115dbfdb589a8797cdd53e64e92802784b21ee5d8ffb5b4abdad0f9c70169e72fc048e2c3bc756c4a0ed4df8b6aeff6e112cbe8195f57fc6d93f5710ec4b746a73908c203431d3',
        'ciSummary': `Daily regression run on ${nodeenv.toUpperCase()} environment`,
        'description': 'This is an automated test run',
        'labels': [122388],
        'projectId': 10050,
        'adhocTestRunTestPlanId': '4GrLflPMcJmr',
    },
}