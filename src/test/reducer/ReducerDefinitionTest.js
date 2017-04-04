import {expect} from "chai";
import Reducers from "../../js/reducer/index";
import TestContext from "../views/testframework/TestContext";

describe('ReducerDefinitionTest', () => {
    it('wiring', () => {
        const testContext = new TestContext();
        Reducers.createReducers(testContext);
    });
});