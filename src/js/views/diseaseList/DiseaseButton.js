import React, { Component, StyleSheet, Text } from 'react-native';
import TypedTransition from '../../routing/TypedTransition';
import questionAnswer from './../questionAnswer/QuestionAnswerView';
import QuestionnaireAnswers from "../../models/QuestionnaireAnswers";
import AppState from "../../hack/AppState";

class DiseaseButton extends Component {

    static propTypes = {
        diseaseName: React.PropTypes.string.isRequired
    };

    static contextTypes = {
        navigator: React.PropTypes.func.isRequired
    };

    static styles = StyleSheet.create({
        item: {
            backgroundColor: '#FF8A80',
            color: '#FFFFFF',
            margin: 10,
            width: 100,
            height: 100,
            textAlign: 'center',
            textAlignVertical: 'center',
            justifyContent: 'center',
            fontWeight: 'bold'
        }
    });

    onSelect = () => {
        AppState.questionnaireAnswers = new QuestionnaireAnswers(this.props.diseaseName);
        TypedTransition
            .from(this)
            .with({
                questionNumber: 0
            })
            .to(questionAnswer);
    };

    render() {
        return (
            <Text onPress={this.onSelect} style={DiseaseButton.styles.item}>
                {this.props.diseaseName}
            </Text>
        );
    }
}

export default DiseaseButton;