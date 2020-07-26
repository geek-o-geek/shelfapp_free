import React  from "react";
import MainStackNavigator from "./src/components/MainStackNavigator";
import { AppLoading } from "expo";
import { useFonts } from '@use-expo/font';

console.disableYellowBox = true;
export default function App() {
  let [fontsLoaded] = useFonts({
    "Rockwell-Bold": require("./src/assets/fonts/Rockwell-Bold-03.ttf"),
    "Rockwell-BoldItalic": require("./src/assets/fonts/Rockwell-BoldItalic-04.ttf"),
    "Rockwell-Italic": require("./src/assets/fonts/Rockwell-Italic-02.ttf"),
    "Rockwell-Regular": require("./src/assets/fonts/Rockwell-Regular-01.ttf"),
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return <MainStackNavigator />
  }
}
