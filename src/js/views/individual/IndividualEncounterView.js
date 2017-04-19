import AbstractComponent from "../../framework/view/AbstractComponent";
import React from "react";
import {View} from "react-native";
import Path from "../../framework/routing/Path";
import themes from "../primitives/themes";
import {Button, Container, Content, Icon, Text} from "native-base";
import TypedTransition from "../../framework/routing/TypedTransition";
import IndividualProfile from "../common/IndividualProfile";
import FormElementGroup from "../form/FormElementGroup";
import {IndividualEncounterViewActions as Actions} from "../../action/individual/EncounterActions";
import Reducers from "../../reducer";
import AppHeader from "../common/AppHeader";
import WizardButtons from "../common/WizardButtons";
import PreviousEncounters from "../common/PreviousEncounters";
import Colors from "../primitives/Colors";
import ObservationsHolder from "../../models/ObservationsHolder";
import AbstractDataEntryState from "../../state/AbstractDataEntryState";
import CHSNavigator from "../../utility/CHSNavigator";
import BaseEntity from "../../models/BaseEntity";
import DGS from '../primitives/DynamicGlobalStyles';
import PreviousEncounterPullDownView from "./PreviousEncounterPullDownView";

@Path('/IndividualEncounterView')
class IndividualEncounterView extends AbstractComponent {
    viewName() {
        return IndividualEncounterView.name;
    }

    constructor(props, context) {
        super(props, context, Reducers.reducerKeys.encounter);
    }

    componentWillMount() {
        this.dispatchAction(Actions.ON_LOAD);
        return super.componentWillMount();
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !nextState.wizard.isFirstPage();
    }

    next() {
        this.dispatchAction(Actions.NEXT, {
            completed: (newState, encounterDecisions, ruleValidationErrors) => {
                const headerMessage = `${this.I18n.t(this.state.encounter.encounterType.name)} - ${this.I18n.t('summaryAndRecommendations')}`;
                CHSNavigator.navigateToSystemRecommendationViewFromEncounterWizard(this, encounterDecisions, ruleValidationErrors, this.state.encounter, Actions.SAVE, headerMessage);
            },
            validationFailed: (newState) => {
            }
        });
    }

    previous() {
        this.dispatchAction(Actions.PREVIOUS, {
            cb: (newState) => {
                if (newState.wizard.isFirstPage())
                    TypedTransition.from(this).goBack();
            }
        });
    }

    render() {
        console.log('IndividualEncounterView.render');
        return (
            <Container theme={themes}>
                <Content ref='abc'>
                    <AppHeader title={this.I18n.t(this.state.encounter.encounterType.name)} func={() => this.previous()}/>
                    <PreviousEncounterPullDownView showExpanded={this.state.previousEncountersDisplayed} individual={this.state.encounter.individual}
                                                   actionName={Actions.TOGGLE_SHOWING_PREVIOUS_ENCOUNTER} encounters={this.state.encounters}/>
                    <View style={{flexDirection: 'column', paddingHorizontal: DGS.resizeWidth(26)}}>
                        <FormElementGroup observationHolder={new ObservationsHolder(this.state.encounter.observations)} group={this.state.formElementGroup}
                                          actions={Actions}
                                          validationResults={this.state.validationResults}/>
                        <WizardButtons previous={{func: () => this.previous(), visible: !this.state.wizard.isFirstPage(), label: this.I18n.t('previous')}}
                                       next={{func: () => this.next(), label: this.I18n.t('next')}}/>
                    </View>
                </Content>
            </Container>
        );
    }
}

export default IndividualEncounterView;
