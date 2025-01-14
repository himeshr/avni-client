import AbstractComponent from "../../framework/view/AbstractComponent";
import {ListView, Text, TouchableNativeFeedback, View} from "react-native";
import PropTypes from 'prop-types';
import React from "react";
import Path from "../../framework/routing/Path";
import GlobalStyles from "../primitives/GlobalStyles";
import AppHeader from "../common/AppHeader";
import Colors from "../primitives/Colors";
import General from "../../utility/General";
import CHSContainer from "../common/CHSContainer";
import Styles from "../primitives/Styles";
import SearchResultsHeader from "./SearchResultsHeader";
import IndividualDetailsCard from "../common/IndividualDetailsCard";
import {IndividualSearchActionNames as Actions} from "../../action/individual/IndividualSearchActions";

@Path('/individualSearchResults')
class IndividualSearchResultsView extends AbstractComponent {
    static propTypes = {
        searchResults: PropTypes.array.isRequired,
        totalSearchResultsCount: PropTypes.number.isRequired,
        onIndividualSelection: PropTypes.func.isRequired,
        headerTitle: PropTypes.string,
    };

    constructor(props, context) {
        super(props, context);
        const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows(['row 1', 'row 2']),
        };
    }

    viewName() {
        return 'IndividualSearchResultsView';
    }

    componentWillMount() {
        setTimeout(() => this.dispatchAction(Actions.LOAD_INDICATOR, {status: false}), 0);
        super.componentWillMount();
    }

    renderZeroResultsMessageIfNeeded() {
        if (this.props.searchResults.length === 0)
            return (
                <View>
                    <Text
                        style={GlobalStyles.emptyListPlaceholderText}>{this.I18n.t('zeroNumberOfResults')}</Text>
                </View>
            );
        else
            return (<View/>);
    }

    renderProgram(program, index) {
        return (
            <Text key={index} disabled
                  style={[{
                      height: 22,
                      marginLeft: 4,
                      marginRight: 4,
                      borderRadius: 2,
                      paddingHorizontal: 4,
                      backgroundColor: program.colour,
                      color: Colors.TextOnPrimaryColor,
                  }, Styles.userProfileProgramTitle]}>{this.I18n.t(program.displayName)}</Text>
        );
    }

    renderRow(item, onResultRowPress) {
        return <TouchableNativeFeedback onPress={() => onResultRowPress(item)}
                                        background={TouchableNativeFeedback.SelectableBackground()}>
            <View>
                <IndividualDetailsCard individual={item}/>
            </View>
        </TouchableNativeFeedback>
    }

    render() {
        General.logDebug(this.viewName(), 'render');
        const dataSource = new ListView.DataSource({rowHasChanged: () => false}).cloneWithRows(this.props.searchResults);
        const title = this.props.headerTitle || "searchResults";

        return (
            <CHSContainer theme={{iconFamily: 'MaterialIcons'}} style={{backgroundColor: Colors.GreyContentBackground}}>
                <AppHeader title={this.I18n.t(title)}/>
                <SearchResultsHeader totalCount={this.props.totalSearchResultsCount}
                                     displayedCount={this.props.searchResults.length}/>
                    <ListView enableEmptySections={true}
                              dataSource={dataSource}
                              style={{marginBottom: 16}}
                              renderRow={(item) => this.renderRow(item, this.onResultRowPress.bind(this))}/>
                    {this.renderZeroResultsMessageIfNeeded()}
            </CHSContainer>
        );
    }

    onResultRowPress(individual) {
        this.props.onIndividualSelection(this, individual);
        // CHSNavigator.navigateToProgramEnrolmentDashboardView(this, individual.uuid);
    }
}

export default IndividualSearchResultsView;
