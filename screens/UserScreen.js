import React from 'react';
import {View, Text, StyleSheet,TouchableOpacity} from 'react-native';

class UserScreen extends React.Component {
    static navigationOptions = {
        header: null
      }
        render(){
        return ( 
        <View style = {{top:40,flex: 1,backgroundColor: '#303030'}}>
         <View style ={{flex:1,flexDirection: 'column',justifyContent: 'space-between',backgroundColor:'#181818'}}>
            <Text style ={{top:15,color:'white',fontSize:30,alignSelf:'center'}}>Trevor Yovaish</Text>
         </View>
         <View style = {{flex:10,flexDirection:'column',justifyContent:'center'}}>
            <TouchableOpacity style = {{top:100,flex: 1,alignSelf:'center'}}onPress = {()=>this.props.navigation.navigate('Portfolio')}>
                    <Text style={{color: 'white',fontSize:30}}>PORTFOLIO</Text> 
            </TouchableOpacity>
            <TouchableOpacity style = {{flex: 1,alignSelf:'center'}} onPress = {()=>this.props.navigation.navigate('Simulation')}>
                    <Text style={{color: 'white',fontSize:30}}>SIMULATION</Text> 
            </TouchableOpacity>
         </View>
       </View>) 
            
        }
}
export default UserScreen