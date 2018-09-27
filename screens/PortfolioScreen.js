import React, {Component} from 'react';
import {View,TextInput,TouchableOpacity,FlatList,Text} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {StockRow} from './StockRow.js';
import {NavigationEvents} from 'react-navigation';
import {FileSystem} from 'expo'


class PortfolioScreen extends React.Component {
  static navigationOptions = {
    header: null
  }
  state = {
    stockTicker : "",
    searchOn: false,
    tickerSearch:{},
    portfolioList : [],
    stockTickerToAmountOwned : {},
    stockTickerToPrice : {},
    portfolioValue : 0.0,
  }
  getStockName = async (ticker) => {
    try {
      let response = await fetch(
        'https://api.iextrading.com/1.0/ref-data/symbols'
      );
      let responseJson = await response.json();
      for(let i=0;i<responseJson.length;i++){
            this.state.tickerSearch[responseJson[i].symbol] = true;
      }
      
    } catch (error) {
      console.error(error);
    }
}
getCurrentStockPrice= async (duration,ticker) =>{
  try {
      let response = await fetch(
        'https://api.iextrading.com/1.0/stock/'+ticker+'/chart/'+duration
      );
      let responseJson = await response.json();
      let stockPrices = responseJson.map((stockPriceData,i)=>{return stockPriceData["marketAverage"]}).filter((price)=>{if(price!==-1){return true;}else{return false;}})
      return parseFloat(stockPrices[stockPrices.length-1]);
    } catch (error) {
      console.error(error);
    }
}
getPortfolioValue = async () => {
  this.state.portfolioValue = 0.0
  for (let ticker in this.state.stockTickerToAmountOwned) {
    if (this.state.stockTickerToAmountOwned.hasOwnProperty(ticker)) {           
        let currentStockPrice = await this.getCurrentStockPrice('1d',ticker);
        this.state.portfolioValue += currentStockPrice * parseFloat(this.state.stockTickerToAmountOwned[ticker])
    }
  }
  this.setState({portfolioValue: this.state.portfolioValue.toFixed(2)})
}
  componentDidMount = () => {
    this.getStockName();  
  }
  searchStock = (ticker) => {
        this.setState({stockTicker:ticker.toUpperCase()})
        if(ticker === ""){
            this.setState({searchOn: false})
        } else {
          this.setState({searchOn: true})
        }
  }
  navigateToStockInfoScreen = (ticker) =>{
    this.props.navigation.navigate('Stock', {
      stockTicker : ticker
  })
  }
  renderPortfolioList = () =>{
    return (
    this.state.portfolioList !==0 ? 
          <FlatList
            data={[{key:"PORTFOLIO_VALUE",value:this.state.portfolioValue},...this.state.portfolioList]}
            renderItem={({item}) => {
              if(item.key === "PORTFOLIO_VALUE"){
                  return (
                  <View style={{flexDirection:'row',justifyContent:'center',height: 70}}>
                      <Text style={{color:'white',fontSize:40
                    
                     }}> ${this.state.portfolioValue} </Text>
                  </View>)
                } else { 
                   return (<StockRow 
                   key={item.ticker} 
                   ticker={item.ticker}
                   onPressItem = {() => {this.navigateToStockInfoScreen(item.ticker)}}
                   numberOfShares = {item.numberOfShares}/>)}}}/>  
          : null)  
  }
  renderSearchList = () => {
    if(this.state.tickerSearch[this.state.stockTicker] === undefined){
          return <View />
    }
    return (<FlatList
            data={[{key: this.state.stockTicker, ticker:this.state.stockTicker,numberOfShares:this.state.stockTickerToAmountOwned[this.state.stockTicker]}]}
            renderItem={({item}) => 
            <StockRow 
            key={item.ticker} 
            ticker={item.ticker}
            onPressItem = {() => {this.navigateToStockInfoScreen(item.ticker)}}
            numberOfShares = {item.numberOfShares}  
            /> 
            }
    />)
  }
  updatePortfolio = async () => {
      this.state.portfolioList = []
      let stockInfoFile = await FileSystem.getInfoAsync(FileSystem.documentDirectory+'/Info.txt');
      let stockTransactions = []
      if(stockInfoFile.exists){
          let fileData = await FileSystem.readAsStringAsync(FileSystem.documentDirectory+'/Info.txt');
          stockTransactions  = await JSON.parse(fileData).stockTransactions
      }
      this.state.stockTickerToAmountOwned = {};
      for(let i=0;i<stockTransactions.length;++i){
        if(this.state.stockTickerToAmountOwned.hasOwnProperty(stockTransactions[i].stockTicker)){
            if(stockTransactions[i].stockAction === 'BUY'){
              this.state.stockTickerToAmountOwned[stockTransactions[i].stockTicker]=this.state.stockTickerToAmountOwned[stockTransactions[i].stockTicker]+parseInt(stockTransactions[i].numberOfShares)
            } else {
              this.state.stockTickerToAmountOwned[stockTransactions[i].stockTicker]=this.state.stockTickerToAmountOwned[stockTransactions[i].stockTicker]-parseInt(stockTransactions[i].numberOfShares)
            }
        } else {
          if(stockTransactions[i].stockAction === 'BUY'){
            this.state.stockTickerToAmountOwned[stockTransactions[i].stockTicker]=parseInt(stockTransactions[i].numberOfShares)
          } else {
            this.state.stockTickerToAmountOwned[stockTransactions[i].stockTicker]=-parseInt(stockTransactions[i].numberOfShares)
          }
        } 
      }
      for (let ticker in this.state.stockTickerToAmountOwned) {
        if (this.state.stockTickerToAmountOwned.hasOwnProperty(ticker)) {           
            this.state.portfolioList.push({key:ticker,ticker:ticker,numberOfShares:''+this.state.stockTickerToAmountOwned[ticker]+''})
        }
      }
    await this.getPortfolioValue();
     this.setState({portfolioList: this.state.portfolioList})
  }
  render() {
    return (
      <View style = {{top:40,flex: 1,backgroundColor: '#303030'}}>
       <NavigationEvents
          onDidFocus={payload => {this.updatePortfolio()}}
        />
        <View style ={{flex:1,flexDirection: 'row',justifyContent: 'space-between',backgroundColor:'#181818'}}>
          <TouchableOpacity style={{top:0,flex: 1, alignSelf:'flex-start'}} onPress = {()=>{this.props.navigation.navigate('User')}}>
            <FontAwesome name = "user" style={{top:15,flex: 1,color:'white', alignSelf:'flex-start'}} size={40}/>
          </TouchableOpacity>
          <TextInput
            style={{flex:1,width: 70,alignSelf:'center',backgroundColor:'transparent',color: 'white',textAlign:'center', fontSize: 20}}
            onChangeText={(stockTicker) => { this.searchStock(stockTicker)}}
            placeholderTextColor='gray'
            value={this.state.stockTicker}
            placeholder={'Ticker...'}
          /> 
          <View style={{flex:1}} />
        </View>
        <View style = {{flex:10}}>
          {this.state.searchOn === false ? this.renderPortfolioList() : this.renderSearchList()}
        </View>
      </View>
    );
  }
}

export default PortfolioScreen;