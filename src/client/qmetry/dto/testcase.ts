import {Version} from "./version";

export interface Testcase {
    archived: boolean,
    id: string,
    version: Version,
    projectId: number,
    key: string
}
