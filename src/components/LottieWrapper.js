import React, { Component } from 'react'
import { Text, View ,StyleSheet} from 'react-native'
import LottieView from "lottie-react-native";
export default class LottieWrapper extends Component {

    resetAnimation = () => {
        this.animation.reset();
        this.animation.play();
      };

    render() {
        let {source,style,loop } = this.props
        return (
        <LottieView
          ref={animation => {
            this.animation = animation;
          }}
          autoPlay
          loop={loop || true}
          style={{
            width: 400,
            height: 400,
            ...style
          }}
          source={source}
          // OR find more Lottie files @ https://lottiefiles.com/featured
          // Just click the one you like, place that file in the 'assets' folder to the left, and replace the above 'require' statement
        />
        )
    }
}



const styles = StyleSheet.create({
    animationContainer: {
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
    },
    buttonContainer: {
      paddingTop: 20,
    },
  });
  