// @flow
import {Form, ValidationResult} from 'openchs-models';
import {Action} from "../util";

export default class BeneficiaryDashboardActions {
    static getInitialState(context) {
        return {};
    }

    @Action()
    static onLoad(state: Object, action: Object, context: Map) {
        const newState = {...state};
        newState.beneficiary = action.beneficiary;
        newState.enrolment = newState.beneficiary.firstActiveOrRecentEnrolment;
        newState.completedEncounters = _.filter(newState.enrolment && newState.enrolment.nonVoidedEncounters(),
                it => it.encounterDateTime || it.cancelDateTime
        ).map(encounter => ({encounter, expand: false}));
        return newState;
    }

    @Action()
    static onEncounterToggle(state, action) {
        const newState = {...state};
        newState.completedEncounters = _.reject(newState.completedEncounters,
                it => it.encounter.uuid === action.encounterInfo.encounter.uuid
        ).concat(action.encounterInfo);
        return newState;
    }
}

const actions = BeneficiaryDashboardActions.Names = {
};

BeneficiaryDashboardActions.Map = new Map([
    [BeneficiaryDashboardActions.onLoad.Id, BeneficiaryDashboardActions.onLoad],
    [BeneficiaryDashboardActions.onEncounterToggle.Id, BeneficiaryDashboardActions.onEncounterToggle],
]);
