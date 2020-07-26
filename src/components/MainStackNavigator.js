import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import CameraPage from "../screens/CameraScreen";
import ProcessingPage from "../screens/ProcessingScreen";
import ReportPage from "../screens/ReportScreen";

const Stack = createStackNavigator();

function MainStackNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="CameraPage"
          component={CameraPage}
        />
        <Stack.Screen
          options={{ headerShown: false }}
          name="ProcessingPage"
          component={ProcessingPage}
        />
        <Stack.Screen
          name="ReportPage"
          component={ReportPage}
          options={{ title: "Report Details", headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainStackNavigator;
