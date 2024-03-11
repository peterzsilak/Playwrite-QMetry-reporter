import {LogLevels} from "../enum/loglevels";

export const development = {
    loglevel: LogLevels.WARN,

    name: 'dev',
    baseurl: 'https://dev.abc.com',

    // QMetry
    qmetryTestPlanId: 'abcd',
    qmetryFolderId: 1234,
    qmetryEnvironmentId: 1234,

}