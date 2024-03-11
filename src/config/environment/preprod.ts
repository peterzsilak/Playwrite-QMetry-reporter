import {LogLevels} from "../enum/loglevels";

export const preprod = {
    loglevel: LogLevels.WARN,

    name: 'preprod',
    baseurl: 'https://preprod.abc.com',

    // QMetry
    qmetryTestPlanId: 'abcd',
    qmetryFolderId: 1234,
    qmetryEnvironmentId: 1234,
}
