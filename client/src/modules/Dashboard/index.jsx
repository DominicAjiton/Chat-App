


import { useEffect, useRef, useState } from "react";
import Img1 from "../../assets/img1.jpg";
import Input from "../../components/Input";
import { io } from "socket.io-client";
import { motion } from "framer-motion";

const Dashboard = () => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user:detail"))
  );
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  // const [payments, setPayments] = useState([]);
  console.log("🚀 ~ Dashboard ~ messages:", messages)
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const messageRef = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSocket(io("http://localhost:8080"));
     
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket?.emit("addUser", user?.id);
    socket?.on("getUsers", (users) => {
      console.log("activeUsers :>> ", users);
    });
    socket?.on("getMessage", (data) => {
      setMessages((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          { user: data.user, message: data.message },
        ],
      }));
    });
    return () => {
      socket.off("getUsers");
      socket.off("getMessage");
    };
  }, [socket]);

  useEffect(() => {
    messageRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.messages]);

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user:detail"));
    const fetchConversations = async () => {
      const res = await fetch(
        `http://localhost:8000/api/conversations/${loggedInUser?.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const resData = await res.json();
      setConversations(resData);
    };
    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`http://localhost:8000/api/users/${user?.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const resData = await res.json();
      setUsers(resData);
    };
    fetchUsers();
  }, []);

  const fetchMessages = async (conversationId, receiver) => {
    const res = await fetch(
      `http://localhost:8000/api/message/${conversationId}?senderId=${user?.id}&&receiverId=${receiver?.receiverId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const resData = await res.json();
    setMessages({ messages: resData, receiver, conversationId });
  };

//   const sendMessage = async () => {
//   if (!message.trim()) return;

//   setMessage('');
//   const newMsg = {
//     senderId: user?.id,
//     receiverId: messages?.receiver?.receiverId,
//     message,
//     conversationId: messages?.conversationId
//   };
//   socket?.emit('sendMessage', newMsg);

//   // Show immediately
//   setMessages(prev => ({
//     ...prev,
//     messages: [...(prev.messages || []), { user: { id: user?.id }, message }]
//   }));


//   // Send via socket

//   // Save to DB
//   await fetch(`http://localhost:8000/api/message`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(newMsg)
//   });
// };


 const sendMessage = async () => {
  if (!message.trim()) return; // prevent empty messages

  const newMsg = {
    conversationId: messages?.conversationId,
    senderId: user?.id,
    receiverId: messages?.receiver?.receiverId,
    message,
  };

  // Reset input field
  setMessage("");

  try {
    // Emit to socket for real-time delivery
    socket?.emit("sendMessage", newMsg);

    // Save message to DB
    const res = await fetch("http://localhost:8000/api/message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newMsg),
    });

    if (!res.ok) {
      console.error("Failed to send message:", await res.text());
    }
  } catch (err) {
    console.error("Error sending message:", err);
  }
};





  return (
  <div className="w-screen flex font-sans">
      {/* Left Sidebar - Conversations */}
      <motion.div
        className="w-[25%] h-screen bg-secondary overflow-y-auto shadow-lg"
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center my-8 mx-14">
          <motion.img
            src={`https://images.pexels.com/photos/866052/pexels-photo-866052.jpeg`}
            alt="user"
            width={75}
            height={75}
            className="border border-primary p-[2px] rounded-full shadow-md"
            whileHover={{ scale: 1.1 }}
          />
          <div className="ml-8">
            <h3 className="text-2xl font-bold text-primary">
              {user?.fullName}
            </h3>
            <p className="text-lg font-light text-gray-600">My Account</p>
          </div>
        </div>
        <hr className="border-gray-300" />
        <div className="mx-14 mt-10">
          <div className="text-primary text-lg font-semibold mb-6">Messages</div>
          <div>
            {conversations.length > 0 ? (
              conversations.map(({ conversationId, user }, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center py-6 border-b border-b-gray-300 hover:bg-light rounded-lg transition-all cursor-pointer px-4"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => fetchMessages(conversationId, user)}
                >
                  <img
                    src={Img1}
                    className="w-[55px] h-[55px] rounded-full p-[2px] border border-primary shadow-sm"
                  />
                  <div className="ml-6">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {user?.fullName}
                    </h3>
                    <p className="text-sm font-light text-gray-600">
                      {user?.email}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center text-lg font-semibold mt-24">
                No Conversations
              </div>
            )}
          </div>
        </div>
      </motion.div>



      {/* Chat Section */}
      <div className="w-[50%] h-screen bg-white flex flex-col items-center shadow-inner">
        {/* Chat Header */}
        {messages?.receiver?.fullName && (
          <motion.div
            className="w-[75%] bg-secondary h-[80px] my-10 rounded-full flex items-center px-10 py-2 shadow-md"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <motion.img
              src={Img1}
              width={60}
              height={60}
              className="rounded-full cursor-pointer"
              whileHover={{ scale: 1.1 }}
            />
            <div className="ml-6 mr-auto">
              <h3 className="text-lg font-bold">{messages?.receiver?.fullName}</h3>
              <p className="text-sm font-light text-gray-600">
                {messages?.receiver?.email}
              </p>
            </div>
            <motion.div whileHover={{ rotate: 20 }} className="cursor-pointer">
              📞
            </motion.div>
          </motion.div>
        )}

        {/* Messages */}
        <div className="h-[75%] w-full overflow-y-auto">
          <div className="px-14 py-6">
            {messages?.messages?.length > 0 ? (
              messages.messages.map(({ message, user: { id } = {} }, idx) => (
                <motion.div
                  key={idx}
                  ref={messageRef}
                  className={`max-w-[45%] rounded-b-xl p-4 mb-6 shadow-md ${
                    id === user?.id
                      ? "bg-primary text-white rounded-tl-xl ml-auto"
                      : "bg-secondary text-gray-800 rounded-tr-xl"
                  }`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  {message}
                </motion.div>
              ))
            ) : (
              <div className="text-center text-lg font-semibold mt-24 text-gray-500">
                No Messages or No Conversation Selected
              </div>
            )}
          </div>
        </div>

        {/* Input Section */}
        {messages?.receiver?.fullName && (
          <motion.div
            className="p-8 w-full flex items-center bg-white shadow-md"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-[75%]"
              inputClassName="p-4 border-0 shadow-md rounded-full bg-light focus:ring-0 focus:border-0 outline-none"
            />
            <motion.div
              className={`ml-4 p-3 cursor-pointer bg-light rounded-full shadow-md ${
                !message && "pointer-events-none opacity-50"
              }`}
              whileHover={{ scale: 1.1 }}
              onClick={() => sendMessage()}
            >
              🚀
            </motion.div>
            <motion.div
              className="ml-4 p-3 cursor-pointer bg-light rounded-full shadow-md"
              whileHover={{ scale: 1.1, rotate: 90 }}
            >
              ➕
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Right Sidebar - People */}
      <motion.div
        className="w-[25%] h-screen bg-light px-8 py-16 overflow-y-auto shadow-lg"
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-primary text-lg font-semibold mb-6">People</div>
        <div>
          {users.length > 0 ? (
            users.map(({ userId, user }, idx) => (
              <motion.div
                key={idx}
                className="flex items-center py-6 border-b border-b-gray-300 hover:bg-white rounded-lg transition-all cursor-pointer px-4"
                whileHover={{ scale: 1.02 }}
                onClick={() => fetchMessages("new", user)}
              >
                <img
                  src={Img1}
                  className="w-[55px] h-[55px] rounded-full p-[2px] border border-primary shadow-sm"
                />
                <div className="ml-6">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user?.fullName}
                  </h3>
                  <p className="text-sm font-light text-gray-600">
                    {user?.email}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center text-lg font-semibold mt-24 text-gray-500">
              No Users Found
            </div>
          )}
        </div>
              {/* Payments Section */}
{/* <div className="mt-12">
  <div className="text-primary text-lg font-semibold mb-6">Payments</div>
  {payments.length > 0 ? (
    payments.map((p, idx) => (
      <motion.div
        key={idx}
        className="p-4 mb-4 bg-white rounded-xl shadow-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-md font-bold text-gray-800">{p.user.fullName}</h3>
            <p className="text-sm text-gray-600">{p.user.email}</p>
          </div>
          <div className="text-primary font-bold text-lg">
            ₹{p.amount}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          {p.paymentMethod.toUpperCase()} • TXN: {p.transactionId}
        </div>
        <div className="text-xs text-gray-400">
          {new Date(p.createdAt).toLocaleString()}
        </div>
      </motion.div>
    ))
  ) : (
    <div className="text-center text-gray-500">No Payments Found</div>
  )}
</div> */}
      </motion.div>
    </div>
  );
};

export default Dashboard;
