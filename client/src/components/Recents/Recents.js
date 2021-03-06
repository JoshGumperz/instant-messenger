import { getTokenAndDecode } from '../../utils/auth'
import UserBox from '../UserBox/UserBox'
import './Recents.css'

function Recents({ recents, openChat, arrivalMessage, lastMessageSent }) {
  const user = getTokenAndDecode();

  return (
    <div className='recents-container'>
        <h4 className='recents-header'>Recent Conversations</h4>
        <div className='recents-boxContainer'>
          {recents.length ? recents.map((c, index) => {
            return (
              <div onClick={() => {openChat(c)}}>
                <UserBox key={index} contactId={c.members.find((m) => m !== user?.id)} conversationId={c._id} arrivalMessage={arrivalMessage} lastMessageSent={lastMessageSent} recent={true}/>
              </div>
            )
          }) : <p className='recents-p'>You have no recent recent conversations.</p>}
        </div>
    </div>
  )
}

export default Recents