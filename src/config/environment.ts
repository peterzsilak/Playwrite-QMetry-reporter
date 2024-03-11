import {commonEnv} from './common';
import {qmetry} from "./client/qmetry";
import {qtm4j} from "./client/qtm4j";
import {development} from "./environment/development";
import {staging} from "./environment/staging";
import {preprod} from "./environment/preprod";

let NODE_ENV: string = process.env.NODE_ENV;
if (NODE_ENV === undefined) {
    NODE_ENV = 'test';
}
const devEnv = {...commonEnv, env: development, ...qmetry, ...qtm4j };
const testEnv = {...commonEnv, env: staging, ...qmetry, ...qtm4j  };
const preProdEnv = {...commonEnv, env: preprod, ...qmetry, ...qtm4j};
export const environment = NODE_ENV === 'dev' ? devEnv : NODE_ENV === 'preprod' ? preProdEnv : testEnv;
