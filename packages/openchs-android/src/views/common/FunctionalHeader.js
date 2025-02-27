import PropTypes from 'prop-types';
import React from "react";
import AbstractComponent from "../../framework/view/AbstractComponent";
import TypedTransition from "../../framework/routing/TypedTransition";
import {Icon} from "native-base";
import {Text, TouchableNativeFeedback, View, Platform} from "react-native";
import _ from "lodash";
import Colors from "../primitives/Colors";
import CHSNavigator from "../../utility/CHSNavigator";

class FunctionalHeader extends AbstractComponent {
    static propTypes = {
        title: PropTypes.string.isRequired,
        func: PropTypes.func,
    };

    constructor(props, context) {
        super(props, context);
    }

    onBack() {
        if (_.isNil(this.props.func))
            TypedTransition.from(this).goBack();
        else
            this.props.func();
    }

    onHome() {
        CHSNavigator.goHome(this);
    }

    background() {
        return Platform['Version'] >= 21 ?
            TouchableNativeFeedback.SelectableBackgroundBorderless() :
            TouchableNativeFeedback.SelectableBackground();
    }

    render() {
        const FunctionalComponent = this.props.component;
        return (
            <View style={{
                backgroundColor: Colors.DefaultPrimaryColor,
                flexDirection: 'row',
                height: 56
            }}>
                <TouchableNativeFeedback onPress={() => this.onBack()}
                                         background={this.background()}>
                    <View style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        height: 56,
                        width: 72,
                        paddingHorizontal: 16
                    }}>
                        <Icon style={{fontSize: 40, color: Colors.TextOnPrimaryColor}} name='keyboard-arrow-left' type='MaterialIcons'/>
                    </View>
                </TouchableNativeFeedback>

                <View style={{flex: 1, flexDirection: 'row', alignSelf: 'center'}}>
                    {this.props.children}
                </View>

                <TouchableNativeFeedback onPress={() => this.onHome()}
                                         background={this.background()}>
                    <View style={{
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-end',
                        height: 56,
                        width: 72,
                        paddingHorizontal: 16
                    }}>
                        <Icon style={{fontSize: 40, color: Colors.TextOnPrimaryColor}} name='home'/>
                    </View>
                </TouchableNativeFeedback>
            </View>
        );
    }
}

export default FunctionalHeader;