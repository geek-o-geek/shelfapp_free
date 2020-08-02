import React, { Component } from "react";
import {
  Text,
  View,
  Dimensions,
  StyleSheet,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { NavigationActions, StackActions } from "react-navigation";
import Carousel from "react-native-snap-carousel";

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

const SLIDER_WIDTH = Dimensions.get("window").width;
const SLIDER_HEIGHT = Dimensions.get("window").height;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);
const ITEM_HEIGHT = Math.round(SLIDER_HEIGHT * 0.9);

const DATA = [];
for (let i = 0; i < 2; i++) {
  DATA.push(i);
}

class ReportPage extends Component {
  state = {
    index: 0,
    FlatListItems: [],
    imagePath: "",
    modalVisible: false,
  };

  constructor(props) {
    super(props);
    this._renderItem = this._renderItem.bind(this);
    this.state = {
      FlatListItems: [
        { id: "1", topic: "7UP", cnt: 0 },
        { id: "2", topic: "A&W", cnt: 0 },
      ],
    };
  }

  componentDidMount = async () => {
    const report = await ReportStore.getReport();

    const parsedReport = JSON.parse(report);
    const { imagePath, modelData } = parsedReport;

    this.setState({ imagePath: `${config.API_URL}${imagePath}` });

    const { FlatListItems } = this.state;

    const cntOb = { sevenUpCnt: 0, awCnt: 0 };
    modelData.forEach((ob) => {
      const { name, percentage_probability } = ob;

      switch (name) {
        case "7up":
          ++cntOb["sevenUpCnt"];
          break;
        case "AW":
          ++cntOb["awCnt"];
          break;
        default:
          break;
      }
    });

    FlatListItems.forEach((ob) => {
      let { topic } = ob;

      switch (topic) {
        case "7UP":
          ob["cnt"] = +cntOb["sevenUpCnt"];
          break;
        case "A&W":
          ob["cnt"] = +cntOb["awCnt"];
          break;
        default:
          break;
      }
    });

    cntOb = { sevenUpCnt: 0, awCnt: 0 };

    this.setState({ FlatListItems });
  };

  FlatListItemSeparator = () => {
    return (
      <View
        style={{ height: 0.5, width: "100%", backgroundColor: "#C8C8C8" }}
      />
    );
  };

  GetItem(item) {
    Alert.alert(item);
  }

  _renderImageItem = () => {
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{
            uri: this.state.imagePath,
          }}
          style={styles.imgDimensions}
        />
      </View>
    );
  };

  _renderTableItem = () => {
    return (
      <View style={styles.itemContainer}>
        <Text style={styles.headTitle}>Report:</Text>
        <FlatList
          data={this.state.FlatListItems}
          // ItemSeparatorComponent={this.FlatListItemSeparator}
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
  };

  _renderItem({ item }) {
    return item == 0 ? this._renderImageItem() : this._renderTableItem();
  }

  download() {
    alert("downaload");
  }

  delete() {
    
    this.setState({ modalVisible: false },()=>{
      this.props.navigation.navigate('CameraPage')
    });
  }

  reset() {
    this.setState({ modalVisible: true });
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
              <Image
                source={require("../assets/img/x.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>

            <TouchableWithoutFeedback onPress={() => this.download()}>
              <Image
                source={require("../assets/img/download.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </TouchableWithoutFeedback>
          </View>
          <Carousel
            ref={(c) => (this.carousel = c)}
            data={DATA}
            renderItem={this._renderItem}
            sliderWidth={SLIDER_WIDTH}
            itemWidth={ITEM_WIDTH}
            scrollEnabled={this.state.index != 1}
            containerCustomStyle={styles.carouselContainer}
            inactiveSlideShift={0}
            onSnapToItem={(index) => this.setState({ index })}
            scrollInterpolator={scrollInterpolator}
            slideInterpolatedStyle={animatedStyles}
            useScrollView={true}
          />
        </View>

        <SSModal
          closeModal={() => this.setState({ modalVisible: false })}
          visible={this.state.modalVisible}
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
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
    height: ITEM_HEIGHT,
    resizeMode: "stretch",
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
