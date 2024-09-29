import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Room, RoomMember, MatrixClient, MatrixEvent, EventType, RoomEvent, ClientEvent } from 'matrix-js-sdk';
import styles from './Chat.module.scss';

interface IMessage {
  eventId: string;
  sender: string;
  content: { body: string };
  timestamp: number;
}

interface IProps {
  matrixClient: MatrixClient;
  initialRoomId?: string;
}

export const Chat = ({ matrixClient, initialRoomId }: IProps) => {
  const [roomId, setRoomId] = useState<string | null>(initialRoomId || null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onSync = (state: string) => {
      console.log('Matrix client sync state:', state);
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

    const fetchJoinedRooms = () => {
      console.log('Fetching joined rooms', matrixClient.getRooms());
      setRooms(matrixClient.getRooms());
    };

    matrixClient.on(ClientEvent.Sync, onSync);
    matrixClient.on(RoomEvent.MyMembership, onRoomMyMembership);

    matrixClient.startClient({ initialSyncLimit: 20 });

    return () => {
      matrixClient.removeListener(ClientEvent.Sync, onSync);
      matrixClient.removeListener(RoomEvent.MyMembership, onRoomMyMembership);
      matrixClient.stopClient();
    };
  }, [matrixClient]);

  useEffect(() => {
    if (!roomId) return;

    setIsLoadingMembers(true);
    const room = matrixClient.getRoom(roomId);

    if (room) {
      const members = room.getJoinedMembers();
      setMembers(members);
      setIsLoadingMembers(false);
    } else {
      const onRoom = (newRoom: Room) => {
        if (newRoom.roomId === roomId) {
          const members = newRoom.getJoinedMembers();
          setMembers(members);
          setIsLoadingMembers(false);
          matrixClient.removeListener(ClientEvent.Room, onRoom);
        }
      };
      matrixClient.on(ClientEvent.Room, onRoom);
    }
  }, [matrixClient, roomId]);

  useEffect(() => {
    if (!roomId) return;

    const room = matrixClient.getRoom(roomId);
    if (!room) return;

    const initialMessages = room.timeline
      .filter((event) => event.getType() === EventType.RoomMessage)
      .map((event) => ({
        eventId: event.getId() || '',
        sender: event.getSender() || '',
        content: { body: event.getContent().body || '' },
        timestamp: event.getTs(),
      }));

    setMessages(initialMessages);

    const onRoomTimeline = (event: MatrixEvent) => {
      if (event.getType() === EventType.RoomMessage) {
        const message: IMessage = {
          eventId: event.getId() || '',
          sender: event.getSender() || '',
          content: event.getContent(),
          timestamp: event.getTs(),
        };
        setMessages((prev) => [...prev, message]);
      }
    };

    room.on(RoomEvent.Timeline, onRoomTimeline);

    return () => {
      room.off(RoomEvent.Timeline, onRoomTimeline);
    };
  }, [matrixClient, roomId]);

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
            {members.slice(0, 10).map((member) => (
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
          messages.slice(0, 10).map((msg) => (
            <div key={msg.eventId} className={styles.message}>
              <span className={styles.sender}>{msg.sender}</span>: {msg.content.body}
              <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
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
