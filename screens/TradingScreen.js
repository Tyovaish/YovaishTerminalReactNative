import React from 'react';
import {View,TextInput,Text,TouchableOpacity,Dimensions} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Sparkline from 'react-native-sparkline';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import {FileSystem} from 'expo';

class BuyTab extends React.Component {
    state = {
        numberOfShares: "0",
    }
    buyStock = async ()=>{
        let stockTransaction ={
            stockAction:'BUY',
            stockTicker:this.props.stockTicker,
            marketPrice:this.props.stockPrice,
            numberOfShares: this.state.numberOfShares
        }
        let stockInfoFile = await FileSystem.getInfoAsync(FileSystem.documentDirectory+'/Info.txt');
        let stockTransactions = []
        if(stockInfoFile.exists){
            let fileData = await FileSystem.readAsStringAsync(FileSystem.documentDirectory+'/Info.txt');
            stockTransactions  = JSON.parse(fileData).stockTransactions
        }
        stockTransactions.push(stockTransaction)
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory+'/Info.txt',JSON.stringify({stockTransactions: stockTransactions}))
        this.props.navigate()
    }
    render(){
    return (
        <View style={[{flex:1,backgroundColor:'#303030'}]}>
            <Text style = {{position:'absolute',top:100,left:20,color:'white',fontSize:20}}>SHARES</Text>
            <TextInput keyboardType='numeric' returnKeyType='done' style={{position:'absolute',top:95,right:10,height: 40,backgroundColor:'transparent', fontSize:35,color:'white'}} onChangeText={(numberOfShares) =>{if(numberOfShares === ""){numberOfShares="0"}this.setState({numberOfShares})}} value={this.state.numberOfShares}/>
            <View style ={{top:135,borderBottomColor:'white',borderBottomWidth:3}}/>
            <Text style = {{position:'absolute',top:220,left:20,color:'white',fontSize:20}}>MARKET PRICE</Text>
            <Text style = {{position:'absolute',top:210,right:10,color:'white',fontSize:35}}>{'$'+this.props.stockPrice}</Text>
            <View style ={{top:250,borderBottomColor:'white',borderBottomWidth:3}}/>
            <Text style = {{position:'absolute',top:340,left:20,color:'white',fontSize:20}}>EST COST</Text>
            <Text style = {{position:'absolute',top:330,right:10,color:'white',fontSize:35}}>{'$'+(parseFloat(this.props.stockPrice)*parseFloat(this.state.numberOfShares)).toFixed(2)}</Text>
            <View style ={{top:370,borderBottomColor:'white',borderBottomWidth:3}}/>
            <TouchableOpacity style ={{position:'absolute',top:440,alignSelf:'center'}}onPress = {this.buyStock}>
                <Text style ={{fontSize:35,alignSelf:'center',color:'white'}}>BUY</Text> 
            </TouchableOpacity>
        </View>
    )
    }
}

class SellTab extends React.Component {
    state = {
        numberOfShares: "0",
        numberOfSharesOwned: "0"
    }
    getNumberOfSharesOwned= async (ticker) =>{
        let stockInfoFile = await FileSystem.getInfoAsync(FileSystem.documentDirectory+'/Info.txt');
        let amountOwned = 0;
        if(stockInfoFile.exists){
            let fileData = await FileSystem.readAsStringAsync(FileSystem.documentDirectory+'/Info.txt');
            let stockTransactions  = JSON.parse(fileData).stockTransactions
            for(let i=0;i<stockTransactions.length;++i){
                if(stockTransactions[i].stockTicker === this.props.stockTicker){
                    if(stockTransactions[i].stockAction == 'BUY'){
                        amountOwned += parseInt(stockTransactions[i].numberOfShares)
                    } else {
                        amountOwned -= parseInt(stockTransactions[i].numberOfShares)
                    }
                }
            }
        }
        this.setState({numberOfSharesOwned: ''+amountOwned+''})
    }
    componentDidMount = () => {
        this.getNumberOfSharesOwned(this.props.stockTicker)
    }
    sellStock =async ()=>{
        let stockTransaction ={
            stockAction:'SELL',
            stockTicker:this.props.stockTicker,
            marketPrice:this.props.stockPrice,
            numberOfShares: this.state.numberOfShares
        }
        let stockInfoFile = await FileSystem.getInfoAsync(FileSystem.documentDirectory+'/Info.txt');
        let stockTransactions = []
        if(stockInfoFile.exists){
            let fileData = await FileSystem.readAsStringAsync(FileSystem.documentDirectory+'/Info.txt');
            stockTransactions  = JSON.parse(fileData).stockTransactions
        }
        stockTransactions.push(stockTransaction)
        await FileSystem.writeAsStringAsync(FileSystem.documentDirectory+'/Info.txt',JSON.stringify({stockTransactions: stockTransactions}))
        this.props.navigate()
    }
    render(){
    return (
        <View style={[{flex:1,backgroundColor:'#303030'}]}>
            <Text style = {{position:'absolute',top:15,color:'white',fontSize:25,alignSelf:'center'}}>Owned: {this.state.numberOfSharesOwned}</Text>
            <Text style = {{position:'absolute',top:100,left:20,color:'white',fontSize:20}}>SHARES</Text>
            <TextInput keyboardType='numeric' returnKeyType='done' style={{position:'absolute',top:95,right:10,height: 40,backgroundColor:'transparent', fontSize:35,color:'white'}} onChangeText={(numberOfShares) =>{if(numberOfShares === ""){numberOfShares="0"} this.setState({numberOfShares})}} value={this.state.numberOfShares}/>
            <View style ={{top:135,borderBottomColor:'white',borderBottomWidth:3}}/>
            <Text style = {{position:'absolute',top:220,left:20,color:'white',fontSize:20}}>MARKET PRICE</Text>
            <Text style = {{position:'absolute',top:210,right:10,color:'white',fontSize:35}}>{'$'+this.props.stockPrice}</Text>
            <View style ={{top:250,borderBottomColor:'white',borderBottomWidth:3}}/>
            <Text style = {{position:'absolute',top:340,left:20,color:'white',fontSize:20}}>EST CREDIT</Text>
            <Text style = {{position:'absolute',top:330,right:10,color:'white',fontSize:35}}>{'$'+(parseFloat(this.props.stockPrice)*parseFloat(this.state.numberOfShares)).toFixed(2)}</Text>
            <View style ={{top:370,borderBottomColor:'white',borderBottomWidth:3}}/>
            <TouchableOpacity style ={{position:'absolute',top:440,alignSelf:'center'}}onPress = {this.sellStock}>
                <Text style ={{fontSize:35,alignSelf:'center',color:'white'}}>SELL</Text> 
            </TouchableOpacity>
        </View>
    )
    }
}


class TradingScreen extends React.Component {
    static navigationOptions = {
      header: null
    }
    state = {
      index: 0,
      stockTicker : this.props.navigation.getParam('stockTicker','NO-ID'),
      stockName : this.props.navigation.getParam('stockName','NO-ID'),
      stockPrice : this.props.navigation.getParam('stockPrice','NO-ID'),
      routes: [
        { key: 'first', title: 'Buy' },
        { key: 'second', title: 'Sell' },
      ],
    }
    navigateToPortfolio = () =>{
        this.props.navigation.navigate('Portfolio');
    }
    render() {
      return (
        <View style = {{top:40,flex: 1,backgroundColor: '#303030'}}>
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
          <TabView
            navigationState={this.state}
            renderScene={({ route }) => {
                switch (route.key) {
                  case 'first':
                    return <BuyTab navigate={()=>this.navigateToPortfolio()}stockTicker={this.state.stockTicker} stockPrice={this.state.stockPrice} />;
                  case 'second':
                    return <SellTab navigate={()=>this.navigateToPortfolio()} stockTicker ={this.state.stockTicker} stockPrice={this.state.stockPrice}/>;
                  default:
                    return null;
                }
              }}
            onIndexChange={index => this.setState({ index })}
            initialLayout={{ height: Dimensions.get('window').height,width: Dimensions.get('window').width }}
            renderTabBar={props =>
                <TabBar
                  {...props}
                  style={{ backgroundColor: '#181818' }}
                />
            } 
            />   
          </View>
        </View>
      );
    }
  }
  
  export default TradingScreen;