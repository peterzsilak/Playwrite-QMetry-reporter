import {LinkedTestCase} from "./linked_testcase";
import {BaseResponseDto} from "./base_response_dto";

export interface LinkTestCaseResponseDto extends BaseResponseDto {
    data: Array<LinkedTestCase>;
}
