import React, { useState, useCallback, useEffect, useRef } from "react";
import styles from "./CollaborationRoomPage.module.css";
import CodeEditor from "../../presentation/components/CodeEditor/CodeEditor";
import { QuestionDetail } from "../../presentation/components/QuestionDetail";
import { useLocation, useParams } from "react-router-dom";
import { useResizable } from "react-resizable-layout";
import NotFound from "./NotFound";
import { OutputBox } from "../../presentation/components/CodeEditor/OutputBox";
import ToggleButton from "../../presentation/components/buttons/ToggleButton";
import ChatFrame from "../../presentation/components/iframe/ChatFrame";
import { Question } from "../../domain/entities/Question";
import { questionUseCases } from "../../domain/usecases/QuestionUseCases";
import { roomUseCases } from "../../domain/usecases/RoomUseCases";
import { Room } from "../../domain/entities/Room";
import { useAuth } from "../../domain/context/AuthContext";
import { Spin } from "antd";
import { toast } from "react-toastify";

const CollaborationRoomPage: React.FC = () => {
    const location = useLocation();
    const { user } = useAuth();
    const locationState = location.state;

    // State Definitions
    const { urlRoomId } = useParams<{ urlRoomId: string }>();
    const [room, setRoom] = useState<Room | null>(null);
    const [question, setQuestion] = useState<Question | undefined>(undefined);
    const [showChat, setShowChat] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Extract details from location.state if available
    const { roomId, attemptStartedAt, matchUserId, questionId } = locationState || {};

    useEffect(() => {
        const populateRoom = async () => {
            setLoading(true);
            setError(null);
            try {
                // Check if location.state has all required details
                const hasAllDetails = roomId && attemptStartedAt && matchUserId && questionId;
                if (hasAllDetails) {
                    // Populate room with details from location.state
                    setRoom({
                        roomId: roomId,
                        attemptStartedAt: attemptStartedAt,
                        userIdOne: { _id: user!._id },
                        userIdTwo: { _id: matchUserId },
                        questionId: questionId
                    });
                } else {
                    if (!urlRoomId) return;
                    // Fetch room details from API
                    const fetchedRoom = await roomUseCases.getRoomDetails(urlRoomId);
                    // Ensure the current user is userIdOne
                    if (fetchedRoom.userIdOne._id !== user?._id) {
                        const temp = fetchedRoom.userIdOne;
                        fetchedRoom.userIdOne = fetchedRoom.userIdTwo;
                        fetchedRoom.userIdTwo = temp;
                    }
                    setRoom(fetchedRoom);
                }
            } catch (err) {
                console.error("Failed to populate room:", err);
                setError("Failed to load room details.");
                toast.error("Failed to load room details.", { toastId: "roomError" });
            } finally {
                setLoading(false);
            }
        };
        if (user) {
            populateRoom();
        }
    }, [roomId, attemptStartedAt, matchUserId, questionId, user, urlRoomId]);

    useEffect(() => {
        const fetchQuestion = async () => {
            if (room && room.questionId) {
                try {
                    const fetchedQuestion = await questionUseCases.getQuestion(room.questionId);
                    setQuestion(fetchedQuestion);
                } catch (err) {
                    console.warn("Failed to fetch question:", err);
                    setError("Failed to load question details.");
                    toast.error("Failed to load question details.", { toastId: "questionError" });
                }
            }
        };
        fetchQuestion();
    }, [room]);

    // Resizable Layout Configurations
    const { position: questionPosition, separatorProps: verticalSeparatorProps } = useResizable({
        axis: "x",
        min: 300,
        initial: window.innerWidth * 0.4,
        max: 800
    });

    const { position: outputPosition, separatorProps: horizontalSeparatorProps } = useResizable({
        axis: "y",
        min: 60,
        initial: 60,
        max: 500,
        reverse: true
    });

    // Conditional Rendering based on states
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spin size="large" tip="Loading room details..." />
            </div>
        );
    }

    if (error) {
        return <NotFound />;
    }

    return (
        <>
            {room && question ? (
                <div className={styles.container}>
                    <div className={styles.leftContainer} style={{ width: questionPosition }}>
                        <ToggleButton showChat={showChat} onClick={() => setShowChat((showChat) => !showChat)} />
                        <div className={styles.questionAndChatContainer}>
                            {showChat ? <ChatFrame roomId={roomId} /> : <QuestionDetail question={question} />}
                        </div>
                    </div>

                    <div className={styles.verticalSeparator} {...verticalSeparatorProps} />

                    <div className={styles.editorAndOutputContainer}>
                        <div className={styles.editorContainer}>
                            <CodeEditor
                                questionId={room.questionId}
                                roomId={room.roomId}
                                attemptStartedAt={new Date(room.attemptStartedAt)}
                                collaboratorId={room.userIdTwo?._id}
                            />
                        </div>

                        <div className={styles.horizontalSeparator} {...horizontalSeparatorProps} />

                        <div className={styles.outputContainer} style={{ height: outputPosition }}>
                            <OutputBox />
                        </div>
                    </div>
                </div>
            ) : (
                <div className={styles.loadingContainer}>
                    <Spin size="large" tip="Loading question details..." />
                </div>
            )}
        </>
    );
};

export default CollaborationRoomPage;
