import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Room, RoomMember, IEvent, EventType, RoomEvent, ClientEvent, MatrixEvent } from 'matrix-js-sdk';

import matrixClient from '../../utils/matrix';
import styles from './Chat.module.scss';

interface IProps {
  initialRoomId?: string;
}

export const Chat = ({ initialRoomId }: IProps) => {
  const [roomId, setRoomId] = useState<string | null>(initialRoomId || null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<IEvent[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const onSync = (state: string) => {
    if (state === 'PREPARED') {
      fetchJoinedRooms();
      if (roomId) {
        matrixClient.joinRoom(roomId).catch(console.error);
      }
    }
  };

  const onRoomMyMembership = () => {
    fetchJoinedRooms();
  };

  useEffect(() => {
    const initClient = async () => {
      try {
        await matrixClient.startClient();

        matrixClient.on(ClientEvent.Sync, onSync);
        matrixClient.on(RoomEvent.MyMembership, onRoomMyMembership);

        return () => {
          matrixClient.removeListener(ClientEvent.Sync, onSync);
          matrixClient.removeListener(RoomEvent.MyMembership, onRoomMyMembership);
        };
      } catch (error) {
        console.error('Matrix client initialization error:', error);
      }
    };

    initClient();

    return () => {
      matrixClient.stopClient();
    };
  }, [roomId]);

  const fetchJoinedRooms = () => {
    setRooms(matrixClient.getRooms());
  };

  useEffect(() => {
    const fetchRoomMembers = async () => {
      if (!roomId) return;

      setIsLoadingMembers(true);
      try {
        const room = matrixClient.getRoom(roomId);
        if (room) {
          const members = await room.getJoinedMembers();
          setMembers(members);
        }
      } catch (error) {
        console.error('Error fetching room members:', error);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchRoomMembers();
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;

    const room = matrixClient.getRoom(roomId);
    if (!room) return;

    const onRoomTimeline = (event: MatrixEvent) => {
      if (event.getType() === EventType.RoomMessage) {
        setMessages((prev) => [...prev, event.event as IEvent]);
      }
    };

    room.on(RoomEvent.Timeline, onRoomTimeline);

    return () => {
      room.off(RoomEvent.Timeline, onRoomTimeline);
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      await matrixClient.sendTextMessage(roomId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Message sending error:', error);
    }
  };

  const handleRoomChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setRoomId(event.target.value);
    setMessages([]);
  };

  return (
    <div className={styles.chatContainer}>
      <h2 className={styles.title}>Matrix Chat</h2>

      {/* Room selection */}
      <select value={roomId || ''} onChange={handleRoomChange} className={styles.roomSelect}>
        <option value="">Select Room</option>
        {rooms.map((room) => (
          <option key={room.roomId} value={room.roomId}>
            {room.name || room.roomId}
          </option>
        ))}
      </select>

      {/* Display room members */}
      {roomId && (
        <div className={styles.membersList}>
          <h3>Members: {isLoadingMembers && <span>(Loading...)</span>}</h3>
          <ul>
            {members.map((member) => (
              <li key={member.userId}>{member.name || member.userId}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Display messages */}
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div>No messages</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.event_id} className={styles.message}>
              <span className={styles.sender}>{msg.sender}</span>: {msg.content.body}
              <span className={styles.timestamp}>{new Date(msg.origin_server_ts).toLocaleTimeString()}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area and send message */}
      {roomId && (
        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder="Enter message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            className={styles.messageInput}
          />
          <button onClick={sendMessage} className={styles.sendButton}>
            Send
          </button>
        </div>
      )}
    </div>
  );
};
