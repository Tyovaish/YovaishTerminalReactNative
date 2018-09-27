import React from 'react';
import {View, Text, StyleSheet,TouchableOpacity,TextInput} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import {FileSystem} from 'expo';
var gaussian = require('gaussian');


class SimulationScreen extends React.Component {
    static navigationOptions = {
        header: null
    }
    state = {
        numberOfDays : '60',
        numberOfSimulations: '100',
        simulated : false,
        stockTickerInfo: {},
        portfolioValue : null,
        averagePortfolioValueInFuture : null,
        maxPortfolioValueInFuture : null,
        minPortfolioValueInFuture : null,
        stdPortfolioValueInFuture : null,
        averageReturnForPortfolioInFutre: null,
    }
    getStockPrices= async (duration,ticker) =>{
        try {
            let response = await fetch(
            'https://api.iextrading.com/1.0/stock/'+ticker+'/chart/'+duration
            );
            let responseJson = await response.json();
            let stockPrices = responseJson;
            this.state.stockTickerInfo[ticker].stockPrices = stockPrices.map((stockPrice)=>{return stockPrice.close});
            return parseFloat(stockPrices[stockPrices.length-1].close);
          } catch (error) {
            console.error(error);
          }
      }
      getPortfolioValue = async () => {
        this.state.portfolioValue = 0.0
        for (let ticker in this.state.stockTickerInfo) {
          if (this.state.stockTickerInfo.hasOwnProperty(ticker)) {           
              let currentStockPrice = await this.getStockPrices('5y',ticker);
              this.state.stockTickerInfo[ticker].currentStockPrice = currentStockPrice;
              this.state.portfolioValue += currentStockPrice * parseInt(this.state.stockTickerInfo[ticker].numberOfShares);
          }
        }
        this.setState({portfolioValue: this.state.portfolioValue.toFixed(2)})
      }
      getDailyStandardDeviation = async () => {
            await this.getAverageDailyReturn();
            for (let ticker in this.state.stockTickerInfo) {
                if (this.state.stockTickerInfo.hasOwnProperty(ticker)) {
                    let averageReturnDifference = 0.0;           
                    for(let day = 1; day<this.state.stockTickerInfo[ticker].stockPrices.length;++day){
                        let differenceFromAverage = (this.state.stockTickerInfo[ticker].stockPrices[day]-this.state.stockTickerInfo[ticker].stockPrices[day-1])/(this.state.stockTickerInfo[ticker].stockPrices[day-1])-this.state.stockTickerInfo[ticker].averageDailyReturn
                        differenceFromAverage *= differenceFromAverage;
                        averageReturnDifference += differenceFromAverage; 
                    }
                    this.state.stockTickerInfo[ticker].averageSTD = Math.sqrt(averageReturnDifference/(this.state.stockTickerInfo[ticker].stockPrices.length-1));
                }
            }
      }
      getAverageDailyReturn = async () => {
        for (let ticker in this.state.stockTickerInfo) {
            if (this.state.stockTickerInfo.hasOwnProperty(ticker)) {
                let averageReturn = 0.0;           
                for(let day = 1; day<this.state.stockTickerInfo[ticker].stockPrices.length;++day){
                    averageReturn += (this.state.stockTickerInfo[ticker].stockPrices[day]-this.state.stockTickerInfo[ticker].stockPrices[day-1])/(this.state.stockTickerInfo[ticker].stockPrices[day-1]);
                }
                this.state.stockTickerInfo[ticker].averageDailyReturn = averageReturn/(this.state.stockTickerInfo[ticker].stockPrices.length);
            }
        }
      }
      getStockTickerToAmountOwned = async () => {
        let stockInfoFile = await FileSystem.getInfoAsync(FileSystem.documentDirectory+'/Info.txt');
        let stockTransactions = []
        if(stockInfoFile.exists){
            let fileData = await FileSystem.readAsStringAsync(FileSystem.documentDirectory+'/Info.txt');
            stockTransactions  = await JSON.parse(fileData).stockTransactions
        }
        for(let i=0;i<stockTransactions.length;++i){
          if(this.state.stockTickerInfo.hasOwnProperty(stockTransactions[i].stockTicker)){
              if(stockTransactions[i].stockAction === 'BUY'){
                this.state.stockTickerInfo[stockTransactions[i].stockTicker].numberOfShares=this.state.stockTickerInfo[stockTransactions[i].stockTicker].numberOfShares+parseInt(stockTransactions[i].numberOfShares)
              } else {
                this.state.stockTickerInfo[stockTransactions[i].stockTicker].numberOfShares=this.state.stockTickerInfo[stockTransactions[i].stockTicker].numberOfShares-parseInt(stockTransactions[i].numberOfShares)
              }
          } else {
            this.state.stockTickerInfo[stockTransactions[i].stockTicker] = {}
            if(stockTransactions[i].stockAction === 'BUY'){
              this.state.stockTickerInfo[stockTransactions[i].stockTicker].numberOfShares=parseInt(stockTransactions[i].numberOfShares);
            } else {
              this.state.stockTickerInfo[stockTransactions[i].stockTicker].numberOfShares=-parseInt(stockTransactions[i].numberOfShares);
            }
          } 
        }
      }
      simulateStock = (ticker,days) =>{
            let stockPrice = this.state.stockTickerInfo[ticker].stockPrices[this.state.stockTickerInfo[ticker].stockPrices.length-1];
            let averageReturn = this.state.stockTickerInfo[ticker].averageDailyReturn;
            let std = this.state.stockTickerInfo[ticker].averageSTD;
            var distribution = gaussian(averageReturn, std*std);
            for(let day=0;day<days;++day){
                stockPrice = stockPrice + stockPrice*distribution.ppf(Math.random());
            }
            return stockPrice;
      }

      simulatePortfolio = (days,iterations) =>{
            let simulatedPortfolioValues = []
            for(let it=0;it<iterations;++it){
                    let currentPortfolioValue = 0.0;
                    for (let ticker in this.state.stockTickerInfo) {
                        if (this.state.stockTickerInfo.hasOwnProperty(ticker)) {
                            currentPortfolioValue += this.simulateStock(ticker,days) * parseInt(this.state.stockTickerInfo[ticker].numberOfShares)
                        }
                    }
                    simulatedPortfolioValues.push(currentPortfolioValue)
            }
            let sumOfSimulatedPortfolioValues = 0.0;
            for(let port = 0;port<simulatedPortfolioValues.length;++port){
                sumOfSimulatedPortfolioValues += simulatedPortfolioValues[port];
            }
            let averageOfSimulatedPortfolioValues = sumOfSimulatedPortfolioValues/iterations;
            let sumOfStandardDifference = 0.0;
            for(let port = 0;port<simulatedPortfolioValues.length;++port){
                let differenceFromAverage = (simulatedPortfolioValues[port]-averageOfSimulatedPortfolioValues)
                sumOfStandardDifference += differenceFromAverage * differenceFromAverage;
            }

            let stdOfSimulatedPortfolioValues = Math.sqrt(sumOfStandardDifference/(iterations-1));

            for(let port = 0;port<simulatedPortfolioValues.length;++port){
                if(this.state.minPortfolioValueInFuture == null || simulatedPortfolioValues[port]<this.state.minPortfolioValueInFuture){
                    this.state.minPortfolioValueInFuture = simulatedPortfolioValues[port]
                }
                if(this.state.maxPortfolioValueInFuture == null || simulatedPortfolioValues[port]>this.state.maxPortfolioValueInFuture){
                    this.state.maxPortfolioValueInFuture = simulatedPortfolioValues[port]
                }
            }
            
            this.state.averagePortfolioValueInFuture = averageOfSimulatedPortfolioValues;
            this.state.stdPortfolioValueInFuture = stdOfSimulatedPortfolioValues;
            this.state.averageReturnForPortfolioInFutre = (this.state.averagePortfolioValueInFuture - this.state.portfolioValue)/(this.state.portfolioValue)

      }

      simulate = async () => {
        this.state.stockTickerInfo = {}
        this.state.minPortfolioValueInFuture = null
        this.state.maxPortfolioValueInFuture = null
        this.state.averagePortfolioValueInFuture = null
        this.state.portfolioValue = 0.0
        this.state.averageReturnForPortfolioInFutre = null

        this.setState({simulated:false});

        await this.getStockTickerToAmountOwned();
        await this.getPortfolioValue();
        await this.getDailyStandardDeviation();
        this.simulatePortfolio(parseInt(this.state.numberOfDays),parseInt(this.state.numberOfSimulations));
        this.setState({simulated:true});
      }


      renderSimulation = ()=> {
          return <View style={{flex:1,bottom:100}}>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>Portfolio Value Today</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>${this.state.portfolioValue}</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>Average Portfolio Value In Future</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>${this.state.averagePortfolioValueInFuture.toFixed(2)}</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>Max Portfolio Value In Future</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>${this.state.maxPortfolioValueInFuture.toFixed(2)}</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>Min Portfolio Value In Future</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>${this.state.minPortfolioValueInFuture.toFixed(2)}</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>STD of Portfolio In Future</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>${this.state.stdPortfolioValueInFuture.toFixed(2)}</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>Average Simulated Return</Text>
            <Text style={{color: 'white',fontSize:20,alignSelf:'center'}}>{this.state.averageReturnForPortfolioInFutre.toFixed(7)}</Text>
          </View>
      }
        render(){
        return ( 
        <View style = {{top:40,flex: 1,backgroundColor: '#303030'}}>
         <View style ={{flex:1,flexDirection: 'column',justifyContent: 'space-between',backgroundColor:'#181818'}}>
         <TouchableOpacity style ={{flex:1}}onPress = {()=>this.props.navigation.pop()}>
                <FontAwesome name = "angle-left" style={{left: 10,top:15,flex: 1,color:'white', alignSelf:'flex-start'}} size={40}/>
            </TouchableOpacity>
            <Text style ={{flex:1,bottom:15,color:'white',fontSize:30,alignSelf:'center'}}>Simulation</Text>
         </View>
         <View style = {{flex:10,flexDirection:'column',justifyContent:'center'}}>
            <Text style={{top:30,color: 'white',fontSize:30,alignSelf:'center'}}>Number Of Days</Text>
            <TextInput
                    keyboardType = 'numeric'
                    returnKeyType='done'
                    style={{alignSelf:'center',top:40,height: 40, width: 100,borderColor: 'gray', borderWidth: 1,color:'white',textAlign:'center',fontSize:30,}}
                    onChangeText={(numberOfDays) => this.setState({numberOfDays})}
                    value={this.state.numberOfDays}
            />
            <Text style={{top:50,color: 'white',fontSize:30,alignSelf:'center'}}>Number Of Simulations</Text>
            <TextInput
                    keyboardType = 'numeric'
                    returnKeyType='done'
                    style={{alignSelf:'center',top:70,height: 40, width: 100,borderColor: 'gray', borderWidth: 1,color:'white',textAlign:'center',fontSize:30,}}
                    onChangeText={(numberOfSimulations) => this.setState({numberOfSimulations})}
                    value={this.state.numberOfSimulations}
            />
            <TouchableOpacity style = {{top:100,flex: 1,alignSelf:'center'}} onPress = {()=>{this.simulate();}}>
                    <Text style={{color: 'white',fontSize:30}}>SIMULATE</Text> 
            </TouchableOpacity>
            {this.state.simulated ? this.renderSimulation() : null}
         </View>
       </View>) 
            
        }
}
export default SimulationScreen