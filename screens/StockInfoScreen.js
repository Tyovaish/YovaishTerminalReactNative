import React from 'react';
import {View,TextInput,Text,TouchableOpacity,Dimensions} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Sparkline from 'react-native-sparkline';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import {NavigationEvents} from 'react-navigation';

class StockInfoScreen extends React.Component {
    static navigationOptions = {
      header: null
    }
    state = {
      index: 0,
      stockTicker : this.props.navigation.getParam('stockTicker','NO-ID'),
      stockName : "",
      stockPrices : [],
      routes: [
        { key: 'first', title: '1d' },
        { key: 'second', title: '1m' },
        { key: 'third', title: '3m' },
        { key: 'fourth', title: '6m' },
        { key: 'fifth', title: '1y' },
        { key: 'sixth', title: '2y' },
        { key: 'seventh', title: '5y' },
      ],
    }
    getStockName = async (ticker) => {
        try {
          let response = await fetch(
            'https://api.iextrading.com/1.0/ref-data/symbols'
          );
          let responseJson = await response.json();
          for(let i=0;i<responseJson.length;i++){
              if(responseJson[i].symbol === ticker){
                  this.setState({stockName:responseJson[i].name});
              }
          }
        } catch (error) {
          console.error(error);
        }
    }
    getStockPrice = async (duration) =>{
        try {
            let response = await fetch(
              'https://api.iextrading.com/1.0/stock/'+this.state.stockTicker+'/chart/'+duration
            );
            let responseJson = await response.json();
            if(duration === '1d') {
            let oneDayStockPrices = responseJson.map((stockPriceData,i)=>{return stockPriceData["marketAverage"]}).filter((price)=>{if(price!==-1){return true;}else{return false;}})
            this.setState({stockPrices:oneDayStockPrices})
            } else {
                this.setState({stockPrices:responseJson.map((stockPriceData,i)=>{return stockPriceData["close"]})})
            }
          } catch (error) {
            console.error(error);
          }
    }
    render() {
      return (
        <View style = {{top:40,flex: 1,backgroundColor: '#303030'}}>
          <NavigationEvents
          onDidFocus={payload => {this.getStockPrice('1d'),this.getStockName(this.props.navigation.getParam('stockTicker','NO-ID'))}}
            />
          <View style ={{flex:1,flexDirection: 'row',justifyContent: 'space-between',backgroundColor:'#181818'}}>
            <TouchableOpacity style ={{flex:1}}onPress = {()=>this.props.navigation.pop()}>
                <FontAwesome name = "angle-left" style={{left: 10,top:15,flex: 1,color:'white', alignSelf:'flex-start'}} size={40}/>
            </TouchableOpacity>
            <View style={{flex:1,alignSelf:'center'}}> 
                <Text style = {{alignSelf:'center',fontSize: 30, color:'white'}}>{this.state.stockTicker}</Text>
                <Text style = {{alignSelf:'center',fontSize: 15, color:'white'}}>{this.state.stockName}</Text>
            </View>
            <View style={{flex:1}}/>
          </View>
          <View style = {{flex:10}}>
                {this.state.stockPrices.length !==0 ?
                <Text style = {{top:40,alignSelf:'center',fontSize: 40, color:'white'}}>$<Text style={{fontSize:60}}>{this.state.stockPrices[this.state.stockPrices.length-1].toFixed(2)}</Text></Text> 
                : null}
                {this.state.stockPrices.length !==0 ?
                    <Text style = {{top:40,alignSelf:'center',fontSize: 20, color:this.state.stockPrices[this.state.stockPrices.length-1]>=this.state.stockPrices[0]?'green':'red'
                    }}>
                    {this.state.stockPrices[this.state.stockPrices.length-1]>=this.state.stockPrices[0]?'+':''}{(this.state.stockPrices[this.state.stockPrices.length-1]-this.state.stockPrices[0]).toFixed(2)+' '}
                    <Text> 
                    ({this.state.stockPrices[this.state.stockPrices.length-1]>=this.state.stockPrices[0]?'+':''}{(((this.state.stockPrices[this.state.stockPrices.length-1]-this.state.stockPrices[0])/this.state.stockPrices[0])*100).toFixed(2)+' %'})
                    </Text>    
                    </Text> 
                : null}
                  <TabView
                  navigationState={this.state}
                  tabBarPosition ='bottom'
                  style = {{bottom: 100}}
                  renderScene={({ route }) => {
                          return  <Sparkline style= {{top:200,alignSelf:'center'}} width={300} height={300} data={this.state.stockPrices}>
                                    <Sparkline.Line color = {this.state.stockPrices[this.state.stockPrices.length-1]>=this.state.stockPrices[0]?'green':'red'} strokeWidth={1}/>
                                    </Sparkline>;
                    }}
                  onIndexChange={index => {
                      switch(index){
                          case 0:
                            this.getStockPrice('1d')
                            break
                          case 1:
                            this.getStockPrice('1m')
                            break
                          case 2:
                            this.getStockPrice('3m')
                            break
                          case 3:
                            this.getStockPrice('6m')
                            break
                          case 4:
                            this.getStockPrice('1y')
                            break
                          case 5:
                            this.getStockPrice('2y')
                            break
                          case 6:
                            this.getStockPrice('5y')
                            break
                      }
                      this.setState({ index })}}
                  initialLayout={{ height: Dimensions.get('window').height,width: Dimensions.get('window').width }}
                  renderTabBar={props =>
                      <TabBar
                        {...props}
                        style={{ backgroundColor: '#181818' }}
                      />
                  } 
                  />   
                { this.state.stockPrices.length!==0 ?
                <TouchableOpacity style={{bottom:75}} onPress = {()=>{ this.props.navigation.navigate('Trading', {
                    stockTicker : this.state.stockTicker,
                    stockPrice: this.state.stockPrices[this.state.stockPrices.length-1].toFixed(2),
                    stockName: this.state.stockName
                })}}>
                    <Text style = {{alignSelf: 'center',fontSize:30,color:'white',borderRadius:15}}>Trade</Text>
                </TouchableOpacity> :
                null
                }
          </View>
        </View>
      );
    }
  }
  
  export default StockInfoScreen;