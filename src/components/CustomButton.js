import React, { Component } from "react";
import {View, Keyboard, Text, TouchableWithoutFeedback } from "react-native";
import { Colors } from "./Colors";
import CustomText from "./CustomText";

export default class CustomButton extends Component {
  state = {
    animation: "",
  };
  onPress() {
    let { onPress } = this.props;
    if (!onPress) {
      alert("Provide onpress prop");
      return;
    }
    onPress();
    Keyboard.dismiss();
  }

  componentWillReceiveProps(nextProps) {
    const { isApiCall } = nextProps;
    this.setState({ animation: isApiCall == "failed" ? "shake" : "" });
  }

  renderGradient() {
    let {
      text,
      containerStyle,
      gradStyle,
      half,
      style,
      isApiCall,
      fixed,
    } = this.props;
    return (
      <TouchableWithoutFeedback onPress={() => this.onPress()}>
        <View
          style={[
            {
              width:'100%',
              marginVertical: 10,
              backgroundColor:Colors.accent,
              borderRadius:20,
              alignItems:'center',
              padding:13,
              ...style,
            },
          ]}
        >
          <CustomText
            text={text || "Button"}
            size={18}
            color="#fff"
          />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  render() {
    return this.renderGradient();
  }
}

