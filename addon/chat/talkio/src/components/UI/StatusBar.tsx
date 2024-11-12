import React, {useState, useCallback} from "react";
import {useRive} from "@rive-app/react-canvas";
import {FaMicrophone, FaMicrophoneSlash} from "react-icons/fa";
import styles from "@/components/UI/StatusBar.module.css";
import {
	ReceiverInfo,
	GroupReceiver,
	AssistantDto,
	UserInfo,
} from "@/types/message";

interface StatusBarProps {
	receiverInfo: ReceiverInfo | null;
	onToggleVoice?: () => void;
	isVoiceEnabled: boolean | null;
}

const isAssistant = (
	receiver: NonNullable<ReceiverInfo>
): receiver is AssistantDto => {
	return "model" in receiver;
};

const isParticipant = (
	receiver: NonNullable<ReceiverInfo>
): receiver is UserInfo => {
	return "displayName" in receiver && !("type" in receiver);
};

const isGroup = (
	receiver: NonNullable<ReceiverInfo>
): receiver is GroupReceiver => {
	return "type" in receiver && receiver.type === "group";
};

export default function StatusBar({
	receiverInfo,
	onToggleVoice,
	isVoiceEnabled,
}: StatusBarProps) {
	const {RiveComponent: Avatar} = useRive({
		src: "/rive/cat_not_track_mouse.riv",
		stateMachines: "State Machine 1",
		autoplay: true,
	});

	const [isModalOpen, setIsModalOpen] = useState(false);

	const openModal = useCallback(() => {
		setIsModalOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setIsModalOpen(false);
	}, []);

	const getDisplayName = useCallback((receiver: NonNullable<ReceiverInfo>) => {
		if ((receiver as UserInfo).username) return (receiver as UserInfo).username;
		return (receiver as GroupReceiver | AssistantDto).name;
	}, []);

	const renderReceiverInfo = useCallback(() => {
		if (!receiverInfo) return null;

		if (isAssistant(receiverInfo)) {
			return (
				<>
					<p>
						<strong>Model:</strong> {receiverInfo.model}
					</p>
					{receiverInfo.description && (
						<p>
							<strong>Description:</strong> {receiverInfo.description}
						</p>
					)}
					{receiverInfo.createdAt && (
						<p>
							<strong>Created At:</strong>{" "}
							{new Date(receiverInfo.createdAt).toLocaleString()}
						</p>
					)}
					{receiverInfo.metadata && (
						<p>
							<strong>Metadata:</strong>{" "}
							{typeof receiverInfo.metadata === "object"
								? JSON.stringify(receiverInfo.metadata)
								: String(receiverInfo.metadata)}
						</p>
					)}
				</>
			);
		}

		if (isGroup(receiverInfo)) {
			return (
				<>
					<p>
						<strong>Type:</strong> Group
					</p>
					<p>
						<strong>Members:</strong>{" "}
						{receiverInfo.members.map((m) => m.username).join(", ")}
					</p>
				</>
			);
		}

		if (isParticipant(receiverInfo)) {
			return (
				<p>
					<strong>Type:</strong> Participant
				</p>
			);
		}

		return null;
	}, [receiverInfo]);

	const handleModalContentClick = useCallback((e: React.MouseEvent) => {
		e.stopPropagation();
	}, []);

	if (!receiverInfo) return null;

	const displayName = getDisplayName(receiverInfo);

	return (
		<div className={styles.statusBar}>
			<div className={styles.appTitle}>Chat with {displayName}</div>
			<div className={styles.avatarContainer}>
				<div className={styles.avatar} onClick={openModal}>
					<Avatar />
				</div>
				<div className={styles.voiceToggleIcon} onClick={onToggleVoice}>
					{isVoiceEnabled ? (
						<FaMicrophone className={styles.iconEnabled} />
					) : (
						<FaMicrophoneSlash className={styles.iconDisabled} />
					)}
				</div>
				<div className={styles.receiverCard}>
					<h3>{displayName}</h3>
					{renderReceiverInfo()}
				</div>
			</div>

			{isModalOpen && (
				<div className={styles.modal} onClick={closeModal}>
					<div
						className={styles.modalContent}
						onClick={handleModalContentClick}
					>
						<div className={styles.largeAvatar}>
							<Avatar />
						</div>
						<div className={styles.detailedInfo}>
							<h3>{displayName}</h3>
							{renderReceiverInfo()}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
