import React, { Component, createRef } from "react";
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
  AppState,
  ScrollView
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
import axios from "axios";
import { Platform } from "react-native";
import ImageZoom from 'react-native-image-pan-zoom';
import ImgStore from "../stores/ImgStore";

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

  flatList = createRef()
  scrollOffset = 0
  flatListtopOffset = 0
  flatListHeight = 0

  constructor(props) {
    super(props);
    this.state = {
      index: 0,
      FlatListItemsArea: [],
      FlatListItems: [],
      imagePath: "",
      modalVisible: false,
      downloadSuccess: false,
      fullViewContent: [],
      showFullImage: false,
      downloadSuccessIndicator: false,
      activeSlide: 0,
      imageSaved: false,
      downloadMsg: "Image saved in gallery successfully",
      annotationUrl: '',
      originalUrl: '',
      imagePathUri: '',
      enableScrollViewScroll: true,
      FlatListItems: [
        { id: "1", topic: "7UP Bottles", cnt: 0 },
        { id: "2", topic: "7UP Boxes", cnt: 0 },
        { id: "3", topic: "7UP Cans", cnt: 0 },
        { id: "4", topic: "A&W Bottles", cnt: 0 },
        { id: "5", topic: "A&W Boxes", cnt: 0 },
        { id: "6", topic: "A&W Cans", cnt: 0 },
      ],
    };

    this._renderItem = this._renderItem.bind(this);
  }

  uploadFile = ({file, folder_name}) => {
    const endpoint = `${config.API_URL}/uploadAndSet`;

    const fd = new FormData();

    if(folder_name == 'annotated-images'){
      fd.append('filePath', file)
    }
    else {
      fd.append('file', file);
    }

    fd.append('folder_name', folder_name)

    const headers = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
    };

    return axios.post(endpoint, fd, headers);
  };

  setReport = async (reportArr, lastInsertId) => {
    const img = await ImgStore.getImg();
    const response = await this.uploadFile({file: img, folder_name: 'original-images'})
    const originalImageUrl = response.data.url

    const endpoint = `${config.API_URL}/api/set/reports`;

    try {
      const ob = {
        reports: reportArr,
        lastInsertId,
        originalImageUrl,
        annotatedImageUrl: ''
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

  delLocalUrl = (filename = '') => {
    if(!filename) return
    const endpoint = `${config.API_URL}/api/delete/localFile?file_name=${filename}`;

    try {
      const ob = {
        filename
      };
      const headers = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      axios
        .get(endpoint, headers)
        .then(async (response) => {})
        .catch((err) => {
          console.log(err, "error in deleting local file api");
        });
    } catch (error) {
      console.log(error);
    }
  };

  componentWillUnmount = async () => {
    const fileArr = this.state.imagePath.split("/")
    const filename = fileArr[fileArr.length-1]

    this.delLocalUrl(filename)
  }

  hardwareBackPress = () => {
    if (this.state.showFullImage) {
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

  _handleAppStateChange = (nextAppState) => {
    if(nextAppState == "inactive"){
      const fileArr = this.state.imagePath.split("/")
      const filename = fileArr[fileArr.length-1]

      this.delLocalUrl(filename)
    }
  }

  componentWillUnmount(){
    AppState.removeEventListener("change", this._handleAppStateChange);
    BackHandler.removeEventListener("hardwareBackPress", this.hardwareBackPress);
  }

  componentDidMount = async () => {
    AppState.addEventListener("change", this._handleAppStateChange);
    if (Platform.OS == "android") {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    BackHandler.addEventListener("hardwareBackPress", this.hardwareBackPress);

    const report = await ReportStore.getReport();

    const parsedReport = JSON.parse(report);
    const { imagePath, modelData, lastInsertId } = parsedReport;

    this.setState({ imagePath: `${config.API_URL}${imagePath}`, imagePathUri: imagePath });

    const { FlatListItems } = this.state;

    const cntOb = {
      awBoxCnt: 0,
      awCanCnt: 0,
      awBottleCnt: 0,
      sevenUpBoxCnt: 0,
      sevenUpCanCnt: 0,
      sevenUpBottleCnt: 0,
    };

    const areaArr = [
      { id: 7, label:'7up-bottle', topic: "7UP Bottles", per: 0, cnt: 0},
      { id: 8, label:'7up-box', topic: "7UP Boxes", per: 0, cnt: 0},
      { id: 9, label:'7up-can', topic: "7UP Cans", per: 0, cnt: 0},
      { id: 10, label:'aw-bottle', topic: "A&W Bottles", per: 0, cnt: 0}, 
      { id: 11, label:'aw-box', topic: "A&W Boxes", per: 0, cnt: 0},
      { id: 12, label:'aw-can', topic: "A&W Cans", per: 0, cnt: 0},
    ]

    modelData.forEach((ob) => {
      let { name, area } = ob;
      
      name = name.toLowerCase();
      let cnt = 0
      switch (name) {
        case "aw-box":
          ++cntOb["awBoxCnt"];
          cnt = cntOb["awBoxCnt"]
          break;
        case "aw-can":
          ++cntOb["awCanCnt"];
          cnt = cntOb["awCanCnt"];
          break;
        case "aw-bottle":
          ++cntOb["awBottleCnt"];
          cnt = cntOb["awBottleCnt"]
          break;
        case "7up-box":
          ++cntOb["sevenUpBoxCnt"];
          cnt = cntOb["sevenUpBoxCnt"]
          break;
        case "7up-can":
          ++cntOb["sevenUpCanCnt"];
          cnt = cntOb["sevenUpCanCnt"]
          break;
        case "7up-bottle":
          ++cntOb["sevenUpBottleCnt"];
          cnt = cntOb["sevenUpBottleCnt"];
          break;
        default:
          break;
      }

      areaArr.forEach(ob => {
        if(ob.label.toLowerCase() == name){
          ob.per += area
          ob['cnt'] = cnt
        }
      })
    });

    const insertArr = [];

    const objectsArr = ["can", "box", "bottle"];
    const brandsArr = ["aw", "7up"];

    FlatListItems.forEach((ob) => {
      let { topic } = ob;

      let item = areaArr.filter(obj => obj.topic.toLowerCase() == topic.toLowerCase())[0]
      let area = item.cnt != 0? (item.per/item.cnt).toFixed(2): 0

      switch (topic) {
        case "A&W Boxes":
          let cnt = +cntOb["awBoxCnt"]
          const obj = { cnt, objectId: 2, brandId: 1, area };
          insertArr.push(obj);
          ob["cnt"] = cnt;
          break;
        case "A&W Cans":
          let cnt1 = +cntOb["awCanCnt"]
          const obj1 = { cnt: cnt1, objectId: 1, brandId: 1, area };
          insertArr.push(obj1);
          ob["cnt"] = cnt1
          break;
        case "A&W Bottles":
          let cnt2 = +cntOb["awBottleCnt"]
          const obj2 = { cnt: cnt2, objectId: 3, brandId: 1, area };
          insertArr.push(obj2);
          ob["cnt"] = cnt2;
          break;
        case "7UP Boxes":
          let cnt3 = +cntOb["sevenUpBoxCnt"]
          const obj3 = { cnt: cnt3, objectId: 2, brandId: 2, area };
          insertArr.push(obj3);
          ob["cnt"] = cnt3;
          break;
        case "7UP Cans":
          let cnt4 = +cntOb["sevenUpCanCnt"]
          const obj4 = { cnt: cnt4, objectId: 1, brandId: 2, area };
          insertArr.push(obj4);
          ob["cnt"] = cnt4;
          break;
        case "7UP Bottles":
          let cnt5 = +cntOb["sevenUpBottleCnt"]
          const obj5 = { cnt: cnt5, objectId: 3, brandId: 2, area };
          insertArr.push(obj5);
          ob["cnt"] = cnt5;
          break;
        default:
          break;
      }
    });
    
    this.setState({ FlatListItems, FlatListItemsArea: areaArr });
    this.setReport(insertArr, lastInsertId);
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
        activeDotIndex={activeSlide || 0}
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
          resizeMode={"contain"}
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
          style={[styles.imgDimensions, { height: ITEM_HEIGHT * 0.8 }]}
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

  onEnableScroll= (value) => {
    this.setState({
      enableScrollViewScroll: value,
    });
  };

  _renderTableItem = () => {
    return (
        <SafeAreaView style={styles.itemContainer}
        onStartShouldSetResponderCapture={() => {
          this.setState({ enableScrollViewScroll: true });
        }}>
          <Text style={styles.headTitle}>Report:</Text>
          <ScrollView 
            scrollEnabled={this.state.enableScrollViewScroll}
            ref={myScroll => (this._myScroll = myScroll)}
            >
          <View style={{flex:1}}
          onStartShouldSetResponderCapture={() => {
          this.setState({ enableScrollViewScroll: false });
          if (this._myScroll.contentOffset === 0
            && this.state.enableScrollViewScroll === false) {
            this.setState({ enableScrollViewScroll: true });
          }
        }}>
          <FlatList
            onScroll={e => {
              this.scrollOffset = e.nativeEvent.contentOffset.y
            }}
            ref={this.flatList}
            scrollEnabled={true}
            data={[...this.state.FlatListItems, ...this.state.FlatListItemsArea]}
            onLayout={
              e => {
                this.flatListtopOffset = e.nativeEvent.layout.y;
                this.flatListHeight = e.nativeEvent.layout.height;
              }
            }
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text
                  style={styles.item}
                >
                  {item.topic} : {item.per>=0? (item.cnt != 0? `${(item.per/item.cnt).toFixed(2)}%`: `0%`): item.cnt}
                </Text>
              </View>
            )}
          />
          </View>
        </ScrollView>
        </SafeAreaView>
    );
  };

  _renderItem({ item }) {
    return item == 0 ? this._renderImageItem() : this._renderTableItem();
  }

  delete() {
    this.props.navigation.navigate('CameraPage');
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
    let fileUri = FileSystem.documentDirectory + `shelfset_${new Date().toISOString()}.jpg`;
    
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

  saveFile = async (fileUri) => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === "granted") {
      const cachedAsset = await MediaLibrary.createAssetAsync(fileUri);
      
      const albumName = 'Shelfset';
      const album = await MediaLibrary.getAlbumAsync(albumName)
      
      if(album){
        await MediaLibrary.addAssetsToAlbumAsync([cachedAsset], album, false);
      }else{
        const asset = await MediaLibrary.createAssetAsync(fileUri);
        await MediaLibrary.createAlbumAsync(albumName, asset);
      }
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
              <Image
                source={require("../assets/img/x.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
              //   <Ionicons name="md-arrow-back" size={36} style={{marginLeft:8,bottom:1}} color="#fff" />
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
                itemWidth={ITEM_WIDTH}
                scrollEnabled={true}
                containerCustomStyle={styles.carouselContainer}
                inactiveSlideShift={0}
                onSnapToItem={(index) => this.setState({ index, activeSlide: index })}
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
  listItemOther: {
    padding: 10,
    fontSize: 18,
    lineHeight: 21,
    left: 35,
  },
  headTitle: {
    fontSize: 30,
    left: 35,
    top: 24,
  },
  subHeadTitle: {
    fontSize: 24,
    paddingBottom: 10,
  },
  imgDimensions: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT-100,
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
