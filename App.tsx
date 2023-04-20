import JitsiMeet, {JitsiCallbackModule} from 'react-native-jitsimeet';
import {NativeEventEmitter} from 'react-native';
import React, {useEffect} from 'react';
import {StyleSheet, View, Pressable, Text} from 'react-native';

const conferenceOptions = {
  room: `https://meet.jit.si/ReactNativeJitsiRoom${Math.random()}`,
  userInfo: {
    displayName: `ReactNativeJitsiRoom${Math.random()}`,
    email: 'example@test.com',
    avatar: 'https://picsum.photos/200',
  },
  featureFlags: {
    'live-streaming.enabled': false,
    'prejoinpage.enabled': false,
  },
  configOverrides: {
    'breakoutRooms.hideAddRoomButton': true,
  },
};

const eventEmitter = new NativeEventEmitter(JitsiCallbackModule);

function App() {
  const [extendReq, setExtendReq] = React.useState(false);
  const [meetLoading, setMeetLoading] = React.useState(false);

  const startJitsiMeet = () => {
    setMeetLoading(true);
    registerEventEmitters();
    // This setTimeout needed only when user end the conference & start a new conference when the activity closing or when unRegistering native events or immediately after ending the conference. To avoid launch JitsiMeet at this, 2s delay is added for clean up. Remove this setTimeout when the conference starts not immediately (after 2s) after the conference is closed.
    setTimeout(() => {
      setMeetLoading(false);
      JitsiMeet.launchJitsiMeetView(conferenceOptions);
    }, 2000);
  };

  useEffect(() => {
    if (!extendReq) {
      return;
    }

    (async () => {
      try {
        const response = await fetch('https://api.publicapis.org/entries');
        if (response) {
          JitsiMeet.sendEventToSDK('EXTEND_CHAT_RESPONSE', true);
          setExtendReq(false);
        }
      } catch (error) {
        JitsiMeet.sendEventToSDK('EXTEND_CHAT_RESPONSE', false);
        console.error(error);
      }
    })();
  }, [extendReq]);

  useEffect(() => {
    registerEventEmitters();

    return () => {
      unRegisterEventEmitters();
      setExtendReq(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerEventEmitters = () => {
    eventEmitter.addListener('EXTEND_CHAT_REQUEST', () => {
      setExtendReq(true);
    });

    eventEmitter.addListener('CONFERENCE_TERMINATED', () => {
      unRegisterEventEmitters();
    });
  };

  const unRegisterEventEmitters = () => {
    eventEmitter.removeAllListeners('EXTEND_CHAT_REQUEST');
    eventEmitter.removeAllListeners('CONFERENCE_TERMINATED');
  };

  return (
    <View style={styles.container}>
      <Pressable
        onPress={startJitsiMeet}
        style={({pressed}) => [styles.pressable, {opacity: pressed ? 0.5 : 1}]}>
        <Text style={styles.pressableText}>
          {meetLoading ? 'Loading ...' : 'Start Jitsi Meet'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    width: '80%',
    borderRadius: 15,
    height: 50,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
  },
  pressableText: {
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
});

export default App;
