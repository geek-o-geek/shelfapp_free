import React, { Component } from "react";
import {
  Text,
  View,
  Dimensions,
  StyleSheet,
  FlatList,
  BackHandler,
  LayoutAnimation,
  UIManager,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from "expo-file-system";
import * as Permissions from "expo-permissions";
import Carousel, { Pagination } from "react-native-snap-carousel";

import { scrollInterpolator, animatedStyles } from "../utils/animations";
import ReportStore from "../stores/ReportStore";
import config from "../config";
import { SafeAreaView } from "react-native-safe-area-context";
import { TouchableWithoutFeedback } from "react-native";
import { withNavigation } from "react-navigation";
import SSModal from "../components/SSModal";
import CustomText from "../components/CustomText";
import CustomButton from "../components/CustomButton";
import { Colors } from "../components/Colors";
import { StackActions } from "@react-navigation/native";
import axios from "axios";
import { Platform } from "react-native";
import ImageZoom from 'react-native-image-pan-zoom';

const SLIDER_WIDTH = Dimensions.get("window").width;
const SLIDER_HEIGHT = Dimensions.get("window").height;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH);
let ITEM_HEIGHT = Math.round(SLIDER_HEIGHT);

const DATA = [];
for (let i = 0; i < 2; i++) {
  DATA.push(i);
}

class ReportPage extends Component {
  static route = {
    styles: {
      gestures: null,
    },
  };

  state = {
    index: 0,
    FlatListItems: [],
    imagePath: "",
    modalVisible: false,
    downloadSuccess: false,
    fullViewContent: [],
    showFullImage: false,
    downloadSuccessIndicator: false,
    activeSlide: 1,
    imageSaved: false,
    downloadMsg: "Image saved in gallery successfully"
  };

  constructor(props) {
    super(props);
    this._renderItem = this._renderItem.bind(this);
    this.state = {
      FlatListItems: [
        { id: "1", topic: "7UP Bottles", cnt: 0 },
        { id: "2", topic: "7UP Boxes", cnt: 0 },
        { id: "3", topic: "7UP Cans", cnt: 0 },
        { id: "4", topic: "A&W Bottles", cnt: 0 },
        { id: "5", topic: "A&W Boxes", cnt: 0 },
        { id: "6", topic: "A&W Cans", cnt: 0 },
      ],
    };
  }

  setReport = (reportArr, lastInsertId) => {
    const endpoint = `${config.API_URL}/api/set/reports`;

    try {
      const ob = {
        reports: reportArr,
        lastInsertId,
      };
      const headers = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios
        .post(endpoint, ob, headers)
        .then(async (response) => {})
        .catch((err) => {
          console.log(err, "error in set report api");
        });
    } catch (error) {
      console.log(error);
    }
  };

  hardwareBackPress = () => {
    if (this.state.showFullImage) {
      // LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      this.setState({ showFullImage: false },()=>{
        setTimeout(() => {
          this.carousel.snapToItem(this.state.index,)
        }, 4);
      });
      return true;
    } else {
      return false;
    }
  };

  componentWillUnmount(){
    BackHandler.removeEventListener("hardwareBackPress", this.hardwareBackPress);

  }
  componentDidMount = async () => {
    if (Platform.OS == "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    BackHandler.addEventListener("hardwareBackPress", this.hardwareBackPress);

    const report = await ReportStore.getReport();

    const parsedReport = JSON.parse(report);
    const { imagePath, modelData, lastInsertId } = parsedReport;

    console.log(lastInsertId, "lastInsertIdlastInsertId");

    this.setState({ imagePath: `${config.API_URL}${imagePath}` });

    const { FlatListItems } = this.state;

    const cntOb = {
      awBoxCnt: 0,
      awCanCnt: 0,
      awBottleCnt: 0,
      sevenUpBoxCnt: 0,
      sevenUpCanCnt: 0,
      sevenUpBottleCnt: 0,
    };

    modelData.forEach((ob) => {
      let { name, percentage_probability } = ob;

      // filter the report data
      if (+percentage_probability < 80) {
        return;
      }

      name = name.toLowerCase();

      switch (name) {
        case "aw-box":
          ++cntOb["awBoxCnt"];
          break;
        case "aw-can":
          ++cntOb["awCanCnt"];
          break;
        case "aw-bottle":
          ++cntOb["awBottleCnt"];
          break;
        case "7up-box":
          ++cntOb["sevenUpBoxCnt"];
          break;
        case "7up-can":
          ++cntOb["sevenUpCanCnt"];
          break;
        case "7up-bottle":
          ++cntOb["sevenUpBottleCnt"];
          break;
        default:
          break;
      }
    });

    const insertArr = [];

    const objectsArr = ["can", "box", "bottle"];
    const brandsArr = ["aw", "7up"];

    FlatListItems.forEach((ob) => {
      let { topic } = ob;

      switch (topic) {
        case "A&W Boxes":
          const obj = { cnt: +cntOb["awBoxCnt"], objectId: 2, brandId: 1 };
          insertArr.push(obj);
          ob["cnt"] = +cntOb["awBoxCnt"];
          break;
        case "A&W Cans":
          const obj1 = { cnt: +cntOb["awCanCnt"], objectId: 1, brandId: 1 };
          insertArr.push(obj1);
          ob["cnt"] = +cntOb["awCanCnt"];
          break;
        case "A&W Bottles":
          const obj2 = { cnt: +cntOb["awCanCnt"], objectId: 3, brandId: 1 };
          insertArr.push(obj2);
          ob["cnt"] = +cntOb["awBottleCnt"];
          break;
        case "7UP Boxes":
          const obj3 = { cnt: +cntOb["awCanCnt"], objectId: 2, brandId: 2 };
          insertArr.push(obj3);
          ob["cnt"] = +cntOb["sevenUpBoxCnt"];
          break;
        case "7UP Cans":
          const obj4 = { cnt: +cntOb["awCanCnt"], objectId: 1, brandId: 2 };
          insertArr.push(obj4);
          ob["cnt"] = +cntOb["sevenUpCanCnt"];
          break;
        case "7UP Bottles":
          const obj5 = { cnt: +cntOb["awCanCnt"], objectId: 3, brandId: 2 };
          insertArr.push(obj5);
          ob["cnt"] = +cntOb["sevenUpBottleCnt"];
          break;
        default:
          break;
      }
    });

    this.setReport(insertArr, lastInsertId);

    cntOb = {
      awBoxCnt: 0,
      awCanCnt: 0,
      awBottleCnt: 0,
      sevenUpBoxCnt: 0,
      sevenUpCanCnt: 0,
      sevenUpBottleCnt: 0,
    };

    this.setState({ FlatListItems });
  };

  FlatListItemSeparator = () => {
    return (
      <View
        style={{ height: 0.5, width: "100%", backgroundColor: "#C8C8C8" }}
      />
    );
  };

  get pagination() {
    const { activeSlide } = this.state;
    return (
      <Pagination
        dotsLength={2}
        activeDotIndex={activeSlide}
        containerStyle={{ backgroundColor: "#21252e" }}
        dotStyle={{
          width: 10,
          height: 10,
          borderRadius: 5,
          marginHorizontal: 8,
          backgroundColor: "white",
        }}
        inactiveDotStyle={{
          backgroundColor: "grey",
        }}
        inactiveDotOpacity={0.4}
        inactiveDotScale={0.6}
      />
    );
  }

  GetItem(item) {
    Alert.alert(item);
  }
  
  viewFullImage(type, content) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    this.setState({ showFullImage: true, fullViewContent: content });
  }

  _renderImageItem = () => {
    let view = (
      <View style={styles.itemContainer}>
        <Image
          source={{
            uri: this.state.imagePath,
          }}
          resizeMode={"center"}
          style={[
            styles.imgDimensions,
            this.state.showFullImage && { height: ITEM_HEIGHT },
          ]}
        />
      </View>
    );

    let viewFull = (
      <ImageZoom cropWidth={Dimensions.get('window').width}
      cropHeight={Dimensions.get('window').height}
      imageWidth={ITEM_WIDTH}
      imageHeight={ITEM_HEIGHT}
      panToMove={true}
      pinchToZoom={true}
      enableCenterFocus={true}
      centerOn={{ x: 0, y: 0, scale: 1, duration: 10 }}
      >
        <Image
          source={{
            uri: this.state.imagePath,
          }}
          resizeMode={"contain"}
          style={[styles.imgDimensions, { height: ITEM_HEIGHT }]}
        />
      </ImageZoom>
    );

    return (
      <TouchableWithoutFeedback
        onPress={() => this.viewFullImage("image", viewFull)}
      >
        {view}
      </TouchableWithoutFeedback>
    );
  };

  _renderTableItem = () => {
    let view = (
      <View style={[styles.itemContainer, { marginTop: 10 }]}>
        <Text style={styles.headTitle}>Report:</Text>
        <FlatList
          data={this.state.FlatListItems}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              {item.id == 1 ? (
                <Text style={styles.subHeadTitle}>Count:</Text>
              ) : null}
              <Text
                style={styles.item}
                onPress={this.GetItem.bind(this, `${item.topic} : ${item.cnt}`)}
              >
                {item.topic} : {item.cnt}
              </Text>
            </View>
          )}
        />
      </View>
    );
    return (
      <TouchableWithoutFeedback
        onPress={() => this.viewFullImage("report", view)}
      >
        <View style={styles.itemContainer}>
          <Text style={styles.headTitle}>Report:</Text>
          <FlatList
            data={this.state.FlatListItems}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                {item.id == 1 ? (
                  <Text style={styles.subHeadTitle}>Count:</Text>
                ) : null}
                <Text
                  style={styles.item}
                  onPress={this.GetItem.bind(
                    this,
                    `${item.topic} : ${item.cnt}`
                  )}
                >
                  {item.topic} : {item.cnt}
                </Text>
              </View>
            )}
          />
        </View>
      </TouchableWithoutFeedback>
    );
  };

  _renderItem({ item }) {
    return item == 0 ? this._renderImageItem() : this._renderTableItem();
  }

  delete() {
    this.props.navigation.navigate('CameraPage')
  }

  downloadSuccess = () => {
    return (
      <SSModal
        closeModal={() => this.setState({ downloadSuccess: false })}
        visible={this.state.downloadSuccess}
      >
        <View style={styles.modal}>
          <CustomText
            text={this.state.downloadMsg || "Image saved in gallery successfully"}
            style={{ textAlign: "center" }}
            size={20}
          />

          <CustomText
            text="OK"
            style={{ textAlign: "center", marginTop: 5 }}
            size={16}
            onPress={() => this.setState({ downloadSuccess: false, imageSaved: true })}
            color={Colors.accent}
          />
        </View>
      </SSModal>
    );
  };

  download() {
    if(this.state.imageSaved){
      this.setState({downloadMsg: 'Image already saved', downloadSuccess: true})
      return
    }

    const uri = this.state.imagePath;

    if (!uri) return;
    this.setState({ downloadSuccess: false, downloadSuccessIndicator: true });
    let fileUri =
      FileSystem.documentDirectory + `shelfset_${new Date().toISOString()}.jpg`;
    FileSystem.downloadAsync(uri, fileUri)
      .then(({ uri }) => {
        this.saveFile(uri);
        this.setState({
          downloadSuccess: true,
          downloadSuccessIndicator: false,
        });
      })
      .catch((error) => {
        this.setState({
          downloadSuccess: false,
          downloadSuccessIndicator: false,
        });
        console.error(error);
      });
  }

  saveFile = async (fileUri: string) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      const asset = await MediaLibrary.createAssetAsync(fileUri);
      await MediaLibrary.createAlbumAsync("Shelfset", asset, false);
    }
  };

  downloadIndicator = () => {
    return <ActivityIndicator size="large" color="#00ff00" />;
  };

  reset() {
    if(this.state.showFullImage){
      this.setState({ showFullImage:false },()=>{});
      setTimeout(() => {
        this.carousel.snapToItem(this.state.index)
      }, 4);
    } else {
      if(this.state.imageSaved){
        this.delete()
        return
      }
      this.setState({ modalVisible: true });
    }
  }

  render() {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.container}>
          <View
            style={{
              flexDirection: "row",
              marginTop: 10,
              alignItems: "center",
              width: "100%",
              justifyContent: "space-between",
            }}
          >
            <TouchableWithoutFeedback onPress={() => this.reset()}>
            {this.state.showFullImage ? 
              <Ionicons name="md-arrow-back" size={36} style={{marginLeft:8,bottom:1}} color="#fff" />
            :
              <Image
                source={require("../assets/img/x.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            }
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.download()}>
              <Image
                source={require("../assets/img/download.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>
          </View>
          {this.state.downloadSuccessIndicator
            ? this.downloadIndicator()
            : null}

          {this.state.showFullImage ? (
            <ReportPageFullScreen content={this.state.fullViewContent} />
          ) : (
            <>
              <Carousel
                ref={(c) => (this.carousel = c)}
                data={DATA}
                renderItem={this._renderItem}
                sliderWidth={SLIDER_WIDTH}
                itemWidth={ITEM_WIDTH * 0.9}
                scrollEnabled={true}
                containerCustomStyle={styles.carouselContainer}
                inactiveSlideShift={0}
                onSnapToItem={(index) => this.setState({ index })}
                scrollInterpolator={scrollInterpolator}
                slideInterpolatedStyle={animatedStyles}
                useScrollView={true}
              />
              {this.pagination}
            </>
          )}
        </View>

        <SSModal
          closeModal={() => this.setState({ modalVisible: false })}
          visible={this.state.modalVisible && !this.state.imageSaved}
        >
          <View style={styles.modal}>
            <CustomText
              text="Are you sure you want to delete this image?"
              style={{ textAlign: "center" }}
              size={20}
            />

            <CustomButton
              text="Delete"
              onPress={() => this.delete()}
              style={{ width: "50%", marginTop: 25 }}
            />

            <CustomText
              text="CANCEL"
              style={{ textAlign: "center", marginTop: 5 }}
              size={16}
              onPress={() => this.setState({ modalVisible: false })}
              color={Colors.accent}
            />
          </View>
        </SSModal>

        {this.state.downloadSuccess ? this.downloadSuccess() : null}
      </SafeAreaView>
    );
  }
}

class ReportPageFullScreen extends Component {
  componentDidMount() {}

  render() {
    return <>{this.props.content}</>
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 10,
    paddingBottom: 20,
    backgroundColor: "#21252e",
  },
  carouselContainer: {
    marginTop: 50,
  },
  itemContainer: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: "#fff",
  },
  listItem: {
    padding: 10,
    fontSize: 18,
    lineHeight: 21,
    left: 35,
    top: 60,
  },
  headTitle: {
    fontSize: 42,
    left: 35,
    top: 48,
  },
  subHeadTitle: {
    fontSize: 24,
    paddingBottom: 10,
  },
  imgDimensions: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT - 250,
  },
  modal: {
    padding: 25,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
export default withNavigation(ReportPage);
