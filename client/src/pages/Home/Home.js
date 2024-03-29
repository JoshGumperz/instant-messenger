import { useState, useEffect } from 'react'
import { getTokenAndDecode, loggedIn } from '../../utils/auth'
import { userRequest } from '../../utils/apiCalls'
import { io } from "socket.io-client"
import Chat from '../../components/Chat/Chat'
import Contacts from '../../components/Contacts/Contacts'
import Recents from '../../components/Recents/Recents'
import './Home.css'


function Home({ setLoggedIn }) {
  const [conversations, setConversations] = useState([])
  const [currentChat, setCurrentChat] = useState(null)
  const [arrivalMessage, setArrivalMessage] = useState(null)
  const [modifyMessage, setModifyMessage] = useState(null)
  const [lastMessageSent, setLastMessageSent] = useState(null)
  const user = getTokenAndDecode();
  const socket = io.connect('/')

  const updateLastMessageSent = (message) => {
    setLastMessageSent(message)
  }

  useEffect(() => {
    socket.emit('userConnect', user?.id);
    socket.on('getUsers', users=>{
      console.log('user connected')
    })
    socket.on("userDisconnected", users=> {
      console.log('user disconnected')
    })
  }, [user])

  useEffect(() => {
    socket.on("getMessage", data => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        _id: data.messageId,
        conversationId: data.conversationId,
        createdAt: Date.now()
      })
    })

    socket.on("messageEdited", data => {
      setModifyMessage({
        sender: data.senderId,
        id: data.messageId,
        text: data.text
      })
    })

    socket.on("messageDeleted", data => {
      setModifyMessage({
        sender: data.senderId,
        id: data.messageId,
      })
    })
  }, [])

  const sendMessageToSocket = (senderId, receiverId, messageId, conversationId, text) => {
    const messageObj = { 
      senderId, receiverId, messageId, conversationId, text 
    };
    socket.emit("sendMessage", messageObj);
  };

  const editMessageInSocket = (senderId, receiverId, messageId, text) => {
    const messageObj = { 
      senderId, receiverId, messageId, text 
    };
    socket.emit("editMessage", messageObj);
  };

  const deleteMessageInSocket = (senderId, receiverId, messageId) => {
    const messageObj = { 
      senderId, receiverId, messageId
    };
    socket.emit("deleteMessage", messageObj);
  };

  const openChat = (chat) => {
    setCurrentChat(chat)
  }
  
  useEffect(() => {
    async function getConversations() {
      const response = await userRequest(`/api/conversation/${user?.id}`, 'GET', null)
      if(response.ok) {
        const json = await response.json()
        setConversations(json)
      } else {
        if(response.status === 403) { 
          setLoggedIn(false)
        }
        const json = await response.json()
        console.log('error', json)
      }
    }

    getConversations();
  }, [])

  const removeConversation = (id) =>  {
    setConversations(conversations.filter((c) => c._id !== id))
  }

  const addConversation = (conversation) => {
    setConversations([...conversations, conversation])
  }

  return (
    <div className='home-container'>
      <div className='home-box'>
        <div className='home-wrapper home-recents-container'>
          <Recents recents={conversations} openChat={openChat} arrivalMessage={arrivalMessage} lastMessageSent={lastMessageSent}/>
        </div>
        <div className='home-wrapper home-main-container'>
          { currentChat ? 
            <Chat conversation={currentChat} setLoggedIn={setLoggedIn} sendMessageToSocket={sendMessageToSocket} editMessageInSocket={editMessageInSocket} deleteMessageInSocket={deleteMessageInSocket} arrivalMessage={arrivalMessage} modifyMessage={modifyMessage} updateLastMessageSent={updateLastMessageSent}/>
            : <p className='home-p'>Open a conversation to start a chat.</p> 
          }
        </div>
        <div className='home-wrapper home-contacts-container'>
          <Contacts setLoggedIn={setLoggedIn} contacts={conversations} openChat={openChat} removeContact={removeConversation} addContact={addConversation}/>
        </div>
      </div>
    </div>
  )
}

export default Home