import React, { useState } from "react";
import { useRouter } from "next/router";
import useRoom from "../hooks/useRoom";
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { Avatar, CircularProgress, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MediaPreview from "./MediaPeview";
import ChatFooter from "./ChatFooter";
import { nanoid } from "nanoid";
import Compressor from "compressorjs";
import useChatMessages from "../hooks/useChatMessages";
import { addDoc, collection, deleteDoc, doc, getDoc, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import ChatMessages from "./ChatMessages";
import { db, storage } from "src/utils/firebase";

function Chats({ user }) {
	// Initializing state variables
	const router = useRouter();
	const [image, setImage] = useState(null);
	const [input, setInput] = useState('');
	const [src, setSrc] = useState('');
	const [audioId, setAudioId] = useState('');
	const [openMenu, setOpenMenu] = useState(null);
	const [isDeleting, setDeleting] = useState(false);

	// Extracting roomId and userId from router and user
	const roomId = router.query.roomId ?? "";
	const userId = user.uid;

	// Fetching room and messages data using custom hooks
	const room = useRoom(roomId, userId);
	const messages = useChatMessages(roomId);

	// Function to show image preview
	function showPreview(event) {
		const file = event.target.files[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				setSrc(reader.result);
			};
		}
	}

	// Function to close image preview
	function closePreview() {
		setSrc("");
		setImage(null);
	}

	// Function to send a new message
	async function sendMessage(event) {
		event.preventDefault();

		setInput('');
		if (image) closePreview();

		const imageName = nanoid();

		// Updating user chat information in Firestore
		await setDoc(doc(db, `users/${userId}/chats/${roomId}`), {
			name: room.name,
			photoURL: room.photoURL || null,
			timestamp: serverTimestamp(),
		});

		// Adding a new message to the Firestore collection
		const newDoc = await addDoc(collection(db, `rooms/${roomId}/messages`), {
			name: user.displayName,
			message: input,
			uid: user.uid,
			timestamp: serverTimestamp(),
			time: new Date().toLocaleString(),
			...(image ? { imageUrl: "uploading", imageName } : {}),
		});

		// If an image is attached, compress and upload it to Storage
		if (image) {
			new Compressor(image, {
				quality: 0.8,
				maxWidth: 1920,
				async success(result) {
					setSrc('')
					setImage(null);

					// Uploading compressed image to Storage
					await uploadBytes(ref(storage, `images/${imageName}`), result);

					// Getting download URL for the uploaded image
					const url = await getDownloadURL(ref(storage, `images/${imageName}`))

					// Updating Firestore document with the image URL
					await updateDoc(doc(db, `rooms/${roomId}/messages/${newDoc.id}`), {
						imageUrl: url,
					});
				},
			});
		}
	}

	// Function to delete the current room
	async function deleteRoom() {
		setOpenMenu(null);
		setDeleting(true);

		try {
			// Firestore document references for user chat, room, and room messages
			const userChatsRef = doc(db, `users/${userId}/chats/${roomId}`);
			const roomRef = doc(db, `rooms/${roomId}`);
			const roomMessagesRef = collection(db, `rooms/${roomId}/messages`);
			const roomMessages = await getDoc(query(roomMessagesRef));
			const audioFiles = [];
			const imageFiles = [];

			// Iterating through messages to find attached audio and image files
			roomMessages?.docs.forEach(doc => {
				if (doc.data().audioName) {
					audioFiles.push(doc.data().audioName);
				} else if (doc.data().imageName) {
					imageFiles.push(doc.data().imageName);
				}
			});

			// Deleting Firestore documents and Storage files
			await Promise.all([
				deleteDoc(userChatsRef),
				deleteDoc(roomRef),
				...roomMessages.docs.map(doc => deleteDoc(doc.ref)),
				...imageFiles.map(imageName => deleteObject(ref(storage, `images/${imageName}`))),
				...audioFiles.map(audioName => deleteObject(ref(storage, `audio/${audioName}`))),
			]);
		} catch (error) {
			console.error("Error deleting room: ", error.message);
		} finally {
			setDeleting(false);
		}
	}

	// If room data is not available, return null
	if (!room) return null;

	return (
		<div className="chat">
			<div className="chat__background" />

			{/* Chat Header */}
			<div className="chat__header">
				<div className="avatar__container">
					<Avatar src={room.photoURL} alt={room.name} />
				</div>
				<div className="chat__header--info">
					<h3>{room.name}</h3>
				</div>
				<div className="chat__header--right">
					{/* Input element for selecting image */}
					<input
						id="image"
						style={{ display: 'none' }}
						accept="image/*"
						type="file"
						onChange={showPreview}
					/>
					{/* IconButton to trigger image selection */}
					<IconButton>
						<label style={{ cursor: "pointer", height: 24 }} htmlFor="image">
							<AddPhotoAlternateIcon />
						</label>
					</IconButton>
					{/* IconButton for opening menu */}
					<IconButton onClick={event => setOpenMenu(event.currentTarget)}>
						<MoreVertIcon />
					</IconButton>
					{/* Menu with delete room option */}
					<Menu id="menu" anchorEl={openMenu} open={!!openMenu} onClose={() => setOpenMenu(null)} keepMounted>
						<MenuItem onClick={deleteRoom}>
							Delete Room
						</MenuItem>
					</Menu>
				</div>
			</div>

			<div className="chat__body--container">
				<div className="chat__body">
					{/* Render chat messages */}
					<ChatMessages messages={messages} user={user} roomId={roomId} audioId={audioId} setAudioId={setAudioId} />
				</div>
			</div>

			{/* Media preview for images */}
			<MediaPreview src={src} closePreview={closePreview} />
			{/* ChatFooter component for input and sending messages */}
			<ChatFooter
				input={input}
				onChange={event => setInput(event.target.value)}
				image={image}
				user={user}
				room={room}
				roomId={roomId}
				sendMessage={sendMessage}
				setAudioId={setAudioId}
			/>

			{/* Display loading spinner during room deletion */}
			{isDeleting && (
				<div className="chat__deleting">
					<CircularProgress />
				</div>
			)}
		</div>
	);
}

export default Chats;
