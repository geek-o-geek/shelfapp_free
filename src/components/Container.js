import React, { Component } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export default class Container extends Component {
  renderForIOS() {
    let {
      padding,
      style,
      turnOffScroll,
      contentStyle,
      extraScrollheight,
    } = this.props;
    return (
      <>
        <SafeAreaView style={{ flex: 0, color: "#fff" }} />
        <SafeAreaView style={{ flex: 1 }}>
          <StatusBar translucent={true} barStyle="dark-content" />
          <ScrollView
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="always"
            contentContainerStyle={{
              flexGrow: 1,
              padding: 5,
              paddingTop: 20,
              backgroundColor: "#fff",
            }}
          >
            {this.props.children}
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  renderForAndroid() {
    const { style, turnOffScroll, contentStyle } = this.props;
    return (
      <>
        <StatusBar backgroundColor="#eee" barStyle={"dark-content"} />
        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="always"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {this.props.children}
        </ScrollView>
      </>
    );
  }

  render() {
    return (
      <>
        {Platform.OS == "android"
          ? this.renderForAndroid()
          : this.renderForIOS()}
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  contentContainerStyle: {
    flexGrow: 1,
    width: "100%",
  },
});
