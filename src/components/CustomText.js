import React, { Component } from "react";
import { Text, Image } from "react-native";

export default class CustomText extends Component {
  render() {
    let {
      size,
      onPress,
      textAlign,
      type,
      color,
      font,
      padding,
      numberOfLines,
      fit,
      text,
      style,
      regular
    } = this.props;
    let rem = global.rem;

    padding = padding == undefined && 1
    
    return (
            <Text
              adjustsFontSizeToFit={fit}
              numberOfLines={fit ? 1 : numberOfLines}
              allowFontScaling={true}
              onPress={onPress ? () => onPress() : onPress}
              style={[
                styles.text,
                {
                  fontSize:size || 18.5,
                  color: color || '#000',
                  textAlign: textAlign ,
                  ...style
                }
              ]}
            >
              {text}
            </Text>
          );
  }
}

const styles = {
  text: {
    textAlign: "center",
  }
}
