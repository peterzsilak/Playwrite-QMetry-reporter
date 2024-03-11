import {LogLevels} from "../enum/loglevels";

export const staging = {
    loglevel: LogLevels.WARN,

    name: 'test',
    baseurl: 'https://staging.preprod.abc.com',

    // QMetry
    qmetryTestPlanId: 'abcd',
    qmetryFolderId: 1234,
    qmetryEnvironmentId: 1234,
}
