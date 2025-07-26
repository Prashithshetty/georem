import React from 'react';
import { StatusBar } from 'react-native';
import MainScreen from './src/screens/MainScreen';
import { colors } from './src/styles/styles';

const App = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.surface}
        translucent={false}
      />
      <MainScreen />
    </>
  );
};

export default App;
