import {View, StyleSheet} from "react-native";
import React, {Component} from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import _ from "lodash";
import {Text, CheckBox, Grid, Col, Row } from "native-base";
import DynamicGlobalStyles from '../primitives/DynamicGlobalStyles';
import BaseEntity from "../../models/BaseEntity";


class FormElement extends AbstractComponent {
    static propTypes = {
        element: React.PropTypes.object.isRequired,
        actionName : React.PropTypes.string.isRequired,
        selectedAnswers : React.PropTypes.array.isRequired
    };

    constructor(props, context) {
        super(props, context);
    }

    toggleFormElementAnswerSelection(conceptUUID, answer) {
        return () => {
            this.dispatchAction(this.props.actionName, {conceptUUID: conceptUUID, answerUUID: answer.uuid});
        }
    }

    renderMultiSelectAnswers() {
        return(<Grid style={{
                        padding: 28,
                        backgroundColor: '#ffffff',
                        borderWidth: 1
                    }}>{
            _.chunk(this.props.element.concept.answers, 2).map(([answer1, answer2]) => {
                        return (
                            <Row>
                                <Col>
                                    <Row>
                                        <CheckBox
                                            checked={BaseEntity.collectionHasEntity(this.props.selectedAnswers, answer1)}
                                            onPress={this.toggleFormElementAnswerSelection(this.props.element.concept.uuid, answer1)}/>
                                        <Text style={{fontSize: 16, marginLeft: 11}}>{answer1.name}</Text>
                                    </Row>
                                </Col>
                                <Col>
                                    <Row>
                                        <CheckBox
                                            checked={BaseEntity.collectionHasEntity(this.props.selectedAnswers, answer2)}
                                            onPress={this.toggleFormElementAnswerSelection(this.props.element.concept.uuid, answer2)}/>
                                        <Text style={{fontSize: 16, marginLeft: 11}}>{answer2.name}</Text>
                                    </Row>
                                </Col>
                            </Row>
                        )})
                    }
        </Grid>);

    }

    render() {
            return (
                <View>
                    <Row style={{backgroundColor: '#ffffff', marginTop: 10, marginBottom: 10}}>
                        <Text style={DynamicGlobalStyles.formElementLabel}>{this.props.element.name}</Text>
                    </Row>
                {this.renderMultiSelectAnswers()}
                </View>);
    }

}

export default FormElement;