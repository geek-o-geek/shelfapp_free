import React from "react";
import { View, Alert } from "react-native";
import * as Permissions from "expo-permissions";
import ImgStore from '../stores/ImgStore';
import { observer } from 'mobx-react'
import * as ImagePicker from 'expo-image-picker';
import { withNavigation } from "react-navigation";

@observer
class CameraPage extends React.Component {
  camera = null;

  state = {
    capturing: null,
    hasCameraPermission: null,
    loaderFlag: false,
    currentCapture: {}
  };

  handleShortCapture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
    });
  
    if (result.cancelled) {
      return;
    }
  
    let localUri = result.uri;
    let filename = localUri.split('/').pop();
  
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;
  
    await ImgStore.setImg({ uri: localUri, name: filename, type })
    this.props.navigation.navigate('ProcessingPage');
  }

  didFocus = () =>{
    this.openCam()
  }

  componentDidMount() {
    setTimeout(() => {
      this.props.navigation.addListener('focus', this.didFocus)
    }, 400) 
  }

  componentWillUnmount(){
    console.log("blurred")
  }

  openCam = async () => {
    const camera = await Permissions.askAsync(Permissions.CAMERA);
    const hasCameraPermission =
      camera.status === "granted"

    if (hasCameraPermission === null) {
      Alert.alert('Camera has no permission')
      return 
    } else if (hasCameraPermission === false) {
      Alert.alert('Camera has no permission')
      return
    }

    this.handleShortCapture()
  }

  render(){
    return (
      <View />
    )
  }
}

export default withNavigation(CameraPage)