import { View, Text ,TextInput,TouchableOpacity,Alert,Keyboard} from 'react-native'
import React,{ useEffect } from 'react'
import { useState } from 'react';
import { useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar';
import ChatRoomHeader from '../../components/ChatRoomHeader';
import MessageList from '../../components/MessageList';
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../context/authContext';
import { getRoomId } from '../../utils/common';
import { Timestamp, addDoc, collection, doc, onSnapshot, orderBy, query, setDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export default function ChatRoom() {

  const item = useLocalSearchParams();  // second user
  const {user} = useAuth(); // loged in user
  // console.log('got item data:',item);
  const router = useRouter();
  const [messages,setMessages] = useState([]);
  const textRef= useRef('');
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(()=>{
    createRoomIfNotExists();

    let roomId = getRoomId(user?.userId, item?.userId);
    const docRef = doc(db,'rooms',roomId);
    const messagesRef = collection(docRef,"messages");
    const q = query(messagesRef,orderBy('createdAt','asc'));

    let unsub = onSnapshot(q,(snapShot)=>{
      let allMessages = snapShot.docs.map(doc=>{
        return doc.data();
      });

      
      setMessages([...allMessages]);
    });
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',updateScrollView
    );

    return ()=>{
      unsub();
      keyboardDidShowListener.remove();
    }

  },[]);

  useEffect(()=>{
    updateScrollView();
  },[messages])

  const updateScrollView=()=>{
    setTimeout(()=>{
      scrollViewRef?.current?.scrollToEnd({animated:true})
    },100)
  }

  const createRoomIfNotExists=async ()=>{
    let roomId = getRoomId(user?.userId,item?.userId);
    await setDoc(doc(db,'rooms',roomId),{
      roomId,
      createdAt:Timestamp.fromDate(new Date())
    });
  }

  const handleSendMessage=async()=>{
    let message = textRef.current.trim();
    if(!message) return;
    try{
      let roomId = getRoomId(user?.userId,item?.userId);
      const docRef = doc(db, 'rooms', roomId);
      const messagesRef = collection(docRef,"messages");
      textRef.current="";
      if(inputRef) inputRef?.current?.clear();
      const newDoc = await addDoc(messagesRef,{
        userId:user?.userId,
        text:message,
        profileUrl:user?.profileUrl,
        senderName:user?.username,
        createdAt: Timestamp.fromDate(new Date())
      });

      // console.log('New Message Id', newDoc.id);
    }catch(err){
      Alert.alert('message', err.message);
    }
  }

  // console.log('messages:',messages);

  return (
    <View className='flex-1 bg-white'>
      <StatusBar style='dark' />
      <ChatRoomHeader user={item} router={router}/>
      <View className='h-3 border-b border-neutral-300'/>
      <View className='flex-1 justify-between bg-neutral-100 overflow-visible'>
        <View className='flex-1'>
          <MessageList scrollViewRef={scrollViewRef} messages={messages} currentUser={user}/>
        </View>
        <View style={{marginBottom: hp(1.7)}} className='pt-2'>
          <View className='flex-row mx-2 justify-between bg-white border p-2 border-neutral-300 rounded-full pl-5'>
              <TextInput
                ref={inputRef}
                onChangeText={value=>textRef.current=value}
                placeholder='Type message.....'
                style={{fontSize:hp(2)}}
                className='flex-1 mr-2'
              />
              <TouchableOpacity onPress={handleSendMessage}>
                <View className="bg-neutral-200 p-2 mr-[1px] rounded-full">
                  <Feather name='send' size={hp(2.7)} color="#737373"/>
                </View>
              </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}