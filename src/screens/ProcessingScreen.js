import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import axios from "axios";
import ImgStore from "../stores/ImgStore";
import ReportStore from "../stores/ReportStore";
import { observer } from "mobx-react";
import config from "../config";
import LottieWrapper from "../components/LottieWrapper";
import SSModal from "../components/SSModal";
import CustomText from "../components/CustomText";
import { Colors } from "../components/Colors";

@observer
export default class ProcessingPage extends Component {
  state = {
    gobackModalFlag: false,
  };

  componentDidMount = async () => {
    const img = await ImgStore.getImg();
    this.brandClassification(img);
  };

  gobackModal = () => {
    return (
      <SSModal
        closeModal={() => this.setState({ gobackModalFlag: false })}
        visible={this.state.gobackModalFlag}
      >
        <View style={styles.modal}>
          <CustomText
            text="Server is down, please retry after sometime"
            style={{ textAlign: "center" }}
            size={20}
          />

          <CustomText
            text="OK"
            style={{ textAlign: "center", marginTop: 5 }}
            size={16}
            onPress={() => this.backLogic()}
            color={Colors.accent}
          />
        </View>
      </SSModal>
    );
  };

  backLogic = () => {
    this.props.navigation.navigate("CameraPage");
  };

  goBack = () => {
    this.setState({ gobackModalFlag: true });
  };

  brandClassification = (imagefile) => {
    const timer = setTimeout(() => {
      this.goBack()
    }, 2 * 60 * 1000);

    const endpoint = `${config.API_URL}/api/brandClassification`;

    try {
      const formData = new FormData();
      formData.append("img", imagefile);
      
      const headers = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      axios
        .post(endpoint, formData, headers)
        .then(async (response) => {
          clearTimeout(timer);
        
          await ReportStore.setReport(JSON.stringify(response.data.results));
          this.props.navigation.navigate("ReportPage");
        })
        .catch((err) => {
          this.goBack();
        });
    } catch (error) {
      this.goBack();
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.processingTxt}>Processing...</Text>
        <LottieWrapper source={require("../assets/lotties/processing.json")} />
        {this.gobackModal()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#21252e",
  },
  processingTxt: {
    color: "#E5EAF3",
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: 0.01,
    fontWeight: "normal",
    fontStyle: "normal",
  },
  modal: {
    padding: 25,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
