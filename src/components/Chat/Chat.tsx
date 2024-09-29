import { ChangeEvent, useEffect, useRef, useState, useCallback } from 'react';
import {
  Room,
  RoomMember,
  MatrixClient,
  MatrixEvent,
  EventType,
  RoomEvent,
  ClientEvent,
  SyncState,
} from 'matrix-js-sdk';
import styles from './Chat.module.scss';
import { ISyncStateData } from 'matrix-js-sdk/lib/sync';

interface IMessage {
  eventId: string;
  sender: string;
  content: { body: string };
  timestamp: number;
}

interface IProps {
  matrixClient: MatrixClient;
  initialRoomId?: string | null;
}

export const Chat = ({ matrixClient, initialRoomId = null }: IProps) => {
  const [roomId, setRoomId] = useState<string | null>(initialRoomId);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = matrixClient.getUserId(); // Get the current user's ID

  // Matrix sync handler
  const handleSync = useCallback(
    (state: SyncState, _prevState: SyncState | null, res?: ISyncStateData) => {
      console.log('Matrix sync state:', state);
      if (state === 'ERROR') {
        console.error('Sync error:', res);
      } else if (state === 'PREPARED') {
        fetchJoinedRooms();
      }
    },
    [matrixClient],
  );

  // Initialize Matrix client and start synchronization
  useEffect(() => {
    matrixClient.on(ClientEvent.Sync, handleSync);
    matrixClient.startClient({ initialSyncLimit: 100 });

    return () => {
      matrixClient.removeListener(ClientEvent.Sync, handleSync);
      matrixClient.stopClient();
    };
  }, [matrixClient, handleSync]);

  // Fetch joined rooms
  const fetchJoinedRooms = useCallback(() => {
    setIsLoadingRooms(true);
    const currentRooms = matrixClient.getRooms();
    setRooms(currentRooms);
    setIsLoadingRooms(false);
  }, [matrixClient]);

  // Update room list when membership changes
  useEffect(() => {
    const handleRoomMembership = fetchJoinedRooms;
    matrixClient.on(RoomEvent.MyMembership, handleRoomMembership);

    return () => {
      matrixClient.off(RoomEvent.MyMembership, handleRoomMembership);
    };
  }, [matrixClient, fetchJoinedRooms]);

  // Fetch room members
  useEffect(() => {
    if (!roomId) return;

    const fetchMembers = async () => {
      setIsLoadingMembers(true);
      const room = matrixClient.getRoom(roomId);
      if (room) setMembers(room.getJoinedMembers());
      setIsLoadingMembers(false);
    };

    fetchMembers();
  }, [matrixClient, roomId]);

  // Fetch and display messages
  useEffect(() => {
    if (!roomId) return;

    const room = matrixClient.getRoom(roomId);
    if (!room) return;

    setIsLoadingMessages(true);
    const timelineSet = room.getUnfilteredTimelineSet();

    const mapEventsToMessages = (events: MatrixEvent[]): IMessage[] =>
      events
        .filter((event) => event.getType() === EventType.RoomMessage)
        .map((event) => ({
          eventId: event.getId() || '',
          sender: event.getSender() || '',
          content: { body: event.getContent().body || '' },
          timestamp: event.getTs(),
        }));

    // Load initial messages
    const loadMessages = () => {
      const initialMessages = mapEventsToMessages(timelineSet.getLiveTimeline().getEvents());
      setMessages(initialMessages);
      setIsLoadingMessages(false);
    };

    // Handler for new messages
    const onRoomTimeline = (event: MatrixEvent) => {
      if (event.getType() === EventType.RoomMessage) {
        setMessages((prev) => [
          ...prev,
          {
            eventId: event.getId() || '',
            sender: event.getSender() || '',
            content: event.getContent(),
            timestamp: event.getTs(),
          },
        ]);
        setIsLoadingMessages(false);
      }
    };

    room.on(RoomEvent.Timeline, onRoomTimeline);
    loadMessages();

    return () => {
      room.off(RoomEvent.Timeline, onRoomTimeline);
    };
  }, [matrixClient, roomId]);

  // Auto-scroll to the last message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !roomId) return;

    try {
      await matrixClient.sendTextMessage(roomId, newMessage);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      // Here you can add a notification for the user
    }
  }, [matrixClient, newMessage, roomId]);

  // Handle room selection change
  const handleRoomChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const selectedRoomId = event.target.value;
    setRoomId(selectedRoomId);
    setMessages([]);
    // No need to leave or join rooms when switching
  }, []);

  // Limit the number of displayed members
  const displayedMembers = members.slice(0, 3); // Limit to 3 members
  const totalMembers = members.length;

  return (
    <div className={styles.chatContainer}>
      <h2 className={styles.title}>Matrix Chat</h2>

      {/* Room Selector */}
      <div className={styles.roomSelect}>
        {isLoadingRooms ? (
          <div>Loading rooms...</div>
        ) : (
          <select value={roomId || ''} onChange={handleRoomChange} className={styles.roomSelect}>
            <option value="">Select a room</option>
            {rooms.map((room) => (
              <option key={room.roomId} value={room.roomId}>
                {room.name || room.roomId}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Members List */}
      {roomId && (
        <div className={styles.membersList}>
          <h3>Members {isLoadingMembers && <span>(Loading...)</span>}</h3>
          <ul>
            {/* Display current user */}
            <li key={currentUserId} className={styles.currentUser}>
              You: {currentUserId}
            </li>
            {/* Display up to 3 other members */}
            {displayedMembers.map((member) =>
              member.userId !== currentUserId ? (
                <li key={member.userId} className={styles.member}>
                  {member.name || member.userId}
                </li>
              ) : null,
            )}
          </ul>
          {/* Show total number of members */}
          {totalMembers > 3 && <p>And {totalMembers - 3} more members...</p>}
          <p>Total members: {totalMembers}</p>
        </div>
      )}

      {/* Messages */}
      <div className={styles.messages}>
        {isLoadingMessages && roomId ? (
          <div>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div>No messages</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.eventId} className={styles.message}>
              <span className={styles.sender}>{msg.sender}</span>: {msg.content.body}
              <span className={styles.timestamp}>{new Date(msg.timestamp).toLocaleTimeString()}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {roomId && (
        <div className={styles.inputArea}>
          <input
            type="text"
            placeholder="Enter message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
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
