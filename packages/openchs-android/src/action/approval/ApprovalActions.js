class ApprovalActions {

    static getInitialState() {
        return {rejectionComment: "", openDialog: false};
    }

    static onLoad(state) {
        const newState = {...state};
        const initialState = ApprovalActions.getInitialState();
        return {...newState, ...initialState};
    }

    static onApprovePress(state, action) {
        const newState = {...state};
        const {entity} = action;
        newState.rejectionComment = "";
        newState.openDialog = true;
        newState.title = `Approve ${entity.getName()} request?`;
        newState.message = `Do you confirm the registration details for the subject ${entity.individual.nameString}?`;
        newState.showInputBox = false;
        return newState;
    }

    static onDialogClose(state) {
        const newState = {...state};
        newState.openDialog = false;
        return newState;
    }

    static onInputChange(state, action) {
        const newState = {...state};
        newState.rejectionComment = action.value;
        return newState;
    }

    static onRejectPress(state, action) {
        const newState = {...state};
        const {entity} = action;
        newState.rejectionComment = "";
        newState.openDialog = true;
        newState.title = `Reject ${entity.getName()} request for the subject ${entity.individual.nameString}?`;
        newState.message = `Please mention the reason below:`;
        newState.showInputBox = true;
        return newState;
    }

    static onApprove(state, action, context) {
        const newState = {...state};
        const {entity, schema, cb} = action;
        newState.openDialog = false;

        cb();
        return newState;
    }

    static onReject(state, action, context) {
        const newState = {...state};
        const {entity, schema, cb} = action;
        newState.openDialog = false;

        cb();
        return newState;
    }
}

const ActionPrefix = 'Approval';

const ApprovalActionNames = {
    ON_LOAD: `${ActionPrefix}.ON_LOAD`,
    ON_APPROVE: `${ActionPrefix}.ON_APPROVE`,
    ON_APPROVE_PRESS: `${ActionPrefix}.ON_APPROVE_PRESS`,
    ON_REJECT: `${ActionPrefix}.ON_REJECT`,
    ON_REJECT_PRESS: `${ActionPrefix}.ON_REJECT_PRESS`,
    ON_DIALOG_CLOSE: `${ActionPrefix}.ON_DIALOG_CLOSE`,
    ON_INPUT_CHANGE: `${ActionPrefix}.ON_INPUT_CHANGE`,
};

const ApprovalActionMap = new Map([
    [ApprovalActionNames.ON_LOAD, ApprovalActions.onLoad],
    [ApprovalActionNames.ON_APPROVE, ApprovalActions.onApprove],
    [ApprovalActionNames.ON_APPROVE_PRESS, ApprovalActions.onApprovePress],
    [ApprovalActionNames.ON_REJECT, ApprovalActions.onReject],
    [ApprovalActionNames.ON_REJECT_PRESS, ApprovalActions.onRejectPress],
    [ApprovalActionNames.ON_DIALOG_CLOSE, ApprovalActions.onDialogClose],
    [ApprovalActionNames.ON_INPUT_CHANGE, ApprovalActions.onInputChange],
]);

export {ApprovalActions, ApprovalActionNames, ApprovalActionMap}
