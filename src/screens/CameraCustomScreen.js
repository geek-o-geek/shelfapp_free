import React from "react";
import { Camera } from "expo-camera";
import { View, Text, ActivityIndicator, Image,Dimensions } from "react-native";
import * as Permissions from "expo-permissions";
import ImgStore from "../stores/ImgStore";
import styles from "../assets/styles/camera";
import Toolbar from "./toolbar.component";
import { copilot, walkthroughable, CopilotStep } from "react-native-copilot";
import { Ionicons } from "@expo/vector-icons";
import * as Font from "expo-font";
const { width: winWidth, height: winHeight } = Dimensions.get('window');

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
    showTut:true,
    loading: true,
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
    this.setState({showTut:false,})
    const result = await this.camera.takePictureAsync();

    this.setState({
      capturing: false,
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
    });
    this.setState({ loading: false });
    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const hasCameraPermission = camera.status === "granted";

    this.setState({ hasCameraPermission });
    this.handleCoPilot();
  }

  _renderLoader = () => {
    return (
      <ActivityIndicator
        style={{ marginTop: "70%" }}
        size="large"
        color="#edf1fe"
      />
    );
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

          {this.state.loaderFlag ? this._renderLoader() : null}
        </View>
      {this.state.showTut && 
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            zIndex: 0,
            position: "absolute",
            height: "100%",
            width: "100%",
          }}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={styles.txt}>
              Detect A&W and 7UP bottles, cans and boxes
            </Text>
          </View>

          <View style={{ flex: 0.64, width: "50%",paddingLeft:15 }}>
            <View style={{ alignSelf: "flex-start", alignItems: "center" }}>
              <Text style={[styles.txt]}>
                Press button to detect A&W and 7UP
              </Text>
              <Image
                source={require("../assets/images/cameraPointer.png")}
                style={{ width: winWidth/2, height: winHeight/4 }}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>
      }


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
  animated: false,
})(CameraCustomScreen);
