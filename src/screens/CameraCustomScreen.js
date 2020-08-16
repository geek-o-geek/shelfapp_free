import React from "react";
import { Camera } from "expo-camera";
import { View, Text, ActivityIndicator } from "react-native";
import * as Permissions from "expo-permissions";
import ImgStore from "../stores/ImgStore";
import styles from "../assets/styles/camera";
import Toolbar from "./toolbar.component";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

const WalkthroughableText = walkthroughable(Text);

class CameraCustomScreen extends React.Component {
  camera = null;

  state = {
    capturing: null,
    hasCameraPermission: null,
    cameraType: Camera.Constants.Type.back,
    flashMode: Camera.Constants.FlashMode.off,
    loaderFlag: false,
    currentCapture: {},
    loading: true
  };

  setFlashMode = (flashMode) => this.setState({ flashMode });
  setCameraType = (cameraType) => this.setState({ cameraType });
  handleCaptureIn = () => this.setState({ capturing: true });

  handleCaptureOut = () => {
    if (this.state.capturing) this.camera.stopRecording();
  };

  handleCoPilot() {
    this.props.start();
  }

  handleShortCapture = async () => {
    const result = await this.camera.takePictureAsync();

    this.setState({
      capturing: false
    });

    let localUri = result.uri;
    let filename = localUri.split("/").pop();

    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

    await ImgStore.setImg({ uri: localUri, name: filename, type });
    this.props.navigation.navigate("ProcessingPage");
  };

  async componentDidMount() {
    await Font.loadAsync({
      ...Ionicons.font,
    })
    this.setState({ loading: false })
    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const hasCameraPermission =
      camera.status === "granted"

    this.setState({ hasCameraPermission });
    this.handleCoPilot()
  }

  _renderLoader = () => {
    return <ActivityIndicator style={{marginTop: '70%'}} size="large" color="#edf1fe" />;
  };

  render() {
    const {
      hasCameraPermission,
      flashMode,
      cameraType,
      capturing,
    } = this.state;

    if (hasCameraPermission === null || this.state.loading) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>Access to camera has been denied.</Text>;
    }

    return (
      <>
        <View>
          <Camera
            type={cameraType}
            flashMode={flashMode}
            style={styles.preview}
            ref={(camera) => (this.camera = camera)}
          />
          {this.state.loaderFlag ? this._renderLoader(): null} 
        </View>

        <Toolbar
          capturing={capturing}
          flashMode={flashMode}
          cameraType={cameraType}
          setFlashMode={this.setFlashMode}
          setCameraType={this.setCameraType}
          onCaptureIn={this.handleCaptureIn}
          onCaptureOut={this.handleCaptureOut}
          onShortCapture={this.handleShortCapture}
        />
        
      </>
    );
  }
}

export default copilot({
  overlay: "svg",
  animated: false
})(CameraCustomScreen);


