import React from 'react';
import {View, Text, StyleSheet,TouchableOpacity} from 'react-native';
import Sparkline from 'react-native-sparkline';


export class StockRow extends React.Component {
        state = {
            stockPrices : [],
        }
        getStockPrice = async (duration) =>{
            try {
                let response = await fetch(
                  'https://api.iextrading.com/1.0/stock/'+this.props.ticker+'/chart/'+duration
                );
                let responseJson = await response.json();
                let oneDayStockPrices = responseJson.map((stockPriceData,i)=>{return stockPriceData["marketAverage"]}).filter((price)=>{if(price!==-1){return true;}else{return false;}})
                this.setState({stockPrices:oneDayStockPrices})
              } catch (error) {
                console.error(error);
              }
        }
        componentDidMount = () =>{
            this.getStockPrice('1d')
        }
        render(){
            let numberOfSharesText = this.props.numberOfShares !== undefined ? <Text style={styles.share}>{this.props.numberOfShares} SHARES</Text> : null;
            return (
            this.state.stockPrices.length !==0 ?
            <TouchableOpacity onPress={this.props.onPressItem}>
            <View style = {{height:75,flexDirection:'row', justifyContent: 'space-between',borderBottomWidth: .25, borderColor:'grey'}}>
                <View style ={styles.tickerContainer}> 
                    <Text style = {styles.ticker}>{this.props.ticker}</Text>
                    {numberOfSharesText}
                </View>
                <Sparkline style= {{flex:1}} data={this.state.stockPrices}>
                    <Sparkline.Line color = {this.state.stockPrices[this.state.stockPrices.length-1]>=this.state.stockPrices[0]?'green':'red'}
                    strokeWidth={1}/>
                </Sparkline>
                <View style ={styles.priceContainer}>
                    <Text style = {[styles.price,{backgroundColor: this.state.stockPrices[this.state.stockPrices.length-1]>=this.state.stockPrices[0]?'green':'red'}]}>{this.state.stockPrices[this.state.stockPrices.length-1].toFixed(2)}</Text>
                </View>  
            </View> 
            </TouchableOpacity>: <View />
            )
        }
}

const styles = StyleSheet.create({
    ticker: {
        color: 'white', 
        fontSize: 25,

    },
    tickerContainer: {
        flex: 1,
        left: 10,
        flexDirection: 'column',
        justifyContent:'center',
    },
    price : {
        color: 'white',
        fontSize: 20,
        alignSelf: 'center',
        padding: "8% 8% 8% 8%",
        overflow: "hidden",
        borderRadius: 12,
        
    },
    priceContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent:'center',
    },
    share: {
        color: 'white',
        fontSize:12
    }
})