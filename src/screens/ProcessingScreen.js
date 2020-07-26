import React, { Component } from "react";
import { StyleSheet, View, Text } from "react-native";
import axios from "axios";
import ImgStore from '../stores/ImgStore';
import ReportStore from '../stores/ReportStore';
import { observer } from 'mobx-react'
import SvgProcessing from '../components/processingSvg';
import config from  '../config'

@observer
export default class ProcessingPage extends Component {
  state = {
  };

  componentDidMount = async () => {
    const img = await ImgStore.getImg()
    this.brandClassification(img)
  };

  brandClassification = imagefile => {
    const endpoint = `${config.API_URL}/api/brandClassification`;

    try {
      const formData = new FormData();
      
      formData.append("img", imagefile);
      
      const headers = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }

      axios.post(endpoint, formData, headers)
      .then(async (response) => {
        await ReportStore.setReport(JSON.stringify(response.data.results))
        this.props.navigation.navigate('ReportPage')
      })
      .catch((err) => {
        alert(err);
        this.props.navigation.navigate('CameraPage')
      }); 
    } catch (error) {
      alert(error);
      this.props.navigation.navigate('CameraPage')
    }
  };

  render() {
    return (
        <View style={styles.container}>
            <Text style={styles.processingTxt}>Processing...</Text>
            <SvgProcessing />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#21252e"
  },
  processingTxt: {
    color: "#E5EAF3",
    fontSize: 32,
    lineHeight: 37,
    letterSpacing: 0.01,
    fontWeight: 'normal',
    fontStyle: 'normal'
  }
});
