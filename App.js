import React, { Component } from 'react';
import {View,TextInput,TouchableOpacity,FlatList,Text} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {createStackNavigator} from 'react-navigation';
import PortfolioScreen from './screens/PortfolioScreen';
import StockInfoScreen from './screens/StockInfoScreen';
import TradingScreen from './screens/TradingScreen';
import UserScreen from './screens/UserScreen';
import SimulationScreen from './screens/SimulationScreen';
// Alpha Vantage API: JD2AHEDRK6AMY9QL
export default class App extends Component {
  
 
  
  render() {
    return (<AppNavigation />);
  }
}
const AppNavigation = createStackNavigator({
  User: UserScreen,
  Portfolio: PortfolioScreen,
  Stock : StockInfoScreen,
  Trading : TradingScreen,
  Simulation : SimulationScreen
});

