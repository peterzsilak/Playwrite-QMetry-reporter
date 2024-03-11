import {Testcase} from "./testcase";
import {BaseResponseDto} from "./base_response_dto";

export interface SearchTestCaseResponseDto extends BaseResponseDto {
    data: Testcase[];
}
