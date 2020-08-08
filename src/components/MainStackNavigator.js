import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import CameraPage from "../screens/CameraScreen";
import ProcessingPage from "../screens/ProcessingScreen";
import ReportPage from "../screens/ReportScreen";
import { View } from 'react-native'; 

const Stack = createStackNavigator();

function MainStackNavigator() {
  return (
    <View style={{ flex: 1, backgroundColor: '#21252e' }}>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName='CameraPage'
        mode="modal"
        swipeEnabled={false}
        animationEnabled={false}
      >
        <Stack.Screen
          options={{ headerShown: false, gestureEnabled: false, swipeEnabled: false, animationEnabled: false }}
          name="CameraPage"
          component={CameraPage}
        />
        <Stack.Screen
          options={{ headerShown: false, gestureEnabled: false, swipeEnabled: false, animationEnabled: false }}
          name="ProcessingPage"
          component={ProcessingPage}
        />
        <Stack.Screen
          name="ReportPage"
          component={ReportPage}
          options={{ title: "Report Details", headerShown: false, gestureEnabled: false, swipeEnabled: false, animationEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </View>
  );
}

export default MainStackNavigator;
