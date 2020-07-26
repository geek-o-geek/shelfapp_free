import React, { Component } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { withNavigation } from "react-navigation";
import { MaterialCommunityIcons } from "@expo/vector-icons";

class ScreenHeader extends Component {
  render() {
    const { title } = this.props;

    return (
      <View
        style={{ flexDirection: "row", marginBottom: 20, alignItems: "center" }}
      >
        <TouchableOpacity onPress={() => this.props.navigation.pop()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#000" />
        </TouchableOpacity>
        <Text style={{ marginLeft: 15, fontSize: 20 }}>{title}</Text>
      </View>
    );
  }
}
export default withNavigation(ScreenHeader);
