import React from 'react';
import { View, Text } from 'react-native';
import UserManagement from './components/UserManagement';

const App = () => {
  return (
    <View style={{ flex: 1 }}>
      <UserManagement />
    </View>
  );
};

export default App;