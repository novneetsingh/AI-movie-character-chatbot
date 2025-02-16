import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const EventModal = ({ isOpen, onClose, event }) => {
  const [attendees, setAttendees] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (isOpen) {
      const newSocket = io(import.meta.env.VITE_BACKEND_URL);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        // console.log("Connected to server");

        newSocket.emit("joinEvent", {
          eventId: event._id,
          userName: localStorage.getItem("currUserName"),
        });
      });

      newSocket.on("updateAttendees", (updatedAttendees) => {
        setAttendees(updatedAttendees);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [isOpen, event]);

  const handleLeave = () => {
    if (socket) {
      socket.emit("leaveEvent", {
        eventId: event._id,
        userName: localStorage.getItem("currUserName"),
      });

      // console.log(`${localStorage.getItem("currUserName")} has left the event`);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{event.title}</h2>
        </div>
        <h3 className="text-lg font-semibold mb-2">Active Attendees:</h3>
        <ul className="mb-4">
          {attendees.map((attendee, index) => (
            <li key={index} className="py-1">
              {attendee}
            </li>
          ))}
        </ul>
        <button
          onClick={handleLeave}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition duration-200"
        >
          Leave Event
        </button>
      </div>
    </div>
  );
};

export default EventModal;
