import { User } from "domain/entities/User";
import { userUseCases } from "domain/usecases/UserUseCases";
import { useEffect, useMemo, useState } from "react";
import { EditOutlined, DeleteOutlined, CrownFilled, CrownOutlined } from "@ant-design/icons";
import styles from "./UserManagement..module.css";
import { Modal } from "antd";
import { UpdateProfileForm } from "presentation/components/UpdateProfileForm/UpdateProfileForm";
import { DeleteUserForm } from "presentation/components/DeleteUserForm/DeleteUserForm";
import { UpdateUserPrivilegeForm } from "presentation/components/UpdateUserPrivilegeForm/UpdateUserPrivilegeForm";
import { useAuth } from "domain/context/AuthContext";
import { SearchBar } from "presentation/components/SearchBar";

export const UserManagement: React.FC<{}> = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deletingUser, setDeletingUser] = useState<User | null>(null);
    const [promotingUser, setPromotingUser] = useState<User | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");

    const { user: currUser } = useAuth();

    useEffect(() => {
        const getAllUsers = async () => {
            const users = await userUseCases.getAllUsers();
            setUsers(users);
        };
        getAllUsers();
    }, []);

    const sortedUsers = useMemo(
        () =>
            users.sort((u1, u2) => {
                if (u1._id === currUser?._id) {
                    return -1;
                }

                if (u2._id === currUser?._id) {
                    return 1;
                }
                if (u1.isAdmin && !u2.isAdmin) {
                    return -1;
                }

                if (!u1.isAdmin && u2.isAdmin) {
                    return 1;
                }
                return u1.username.localeCompare(u2.username);
            }),
        [users]
    );

    const filteredUsers = useMemo(
        () => sortedUsers.filter((user) => user.username.toLowerCase().includes(searchTerm.toLowerCase())),
        [sortedUsers, searchTerm]
    );

    const numFilteredUsers = filteredUsers.length;
    const userCountText = `Found: ${numFilteredUsers} ${numFilteredUsers == 1 ? "user" : "users"}`;

    const renderUser = (user: User) => {
        return (
            <div className={styles.userRow} key={user._id}>
                <div className={styles.username}>
                    <p>
                        {user.username} {currUser?._id === user._id && <span style={{ color: "gray" }}>(you)</span>}
                    </p>
                    {user.isAdmin && <CrownFilled />}
                </div>

                {!user.isAdmin && (
                    <div className={styles.userControls}>
                        <DeleteOutlined onClick={() => setDeletingUser(user)} />
                        <CrownOutlined
                            onClick={() => {
                                setPromotingUser(user);
                            }}
                        />
                        <EditOutlined onClick={() => setEditingUser(user)} />
                    </div>
                )}
            </div>
        );
    };

    const onEditUser = (updatedUser: User) => {
        refreshUsersList(updatedUser);
        setEditingUser(null);
    };

    const onDeleteUser = (userId: string) => {
        setUsers((users) => users.filter((user) => user._id !== userId));
        setDeletingUser(null);
    };

    const onPromoteUser = (updatedUser: User) => {
        refreshUsersList(updatedUser);
        setPromotingUser(null);
    };

    const refreshUsersList = (updatedUser: User) => {
        const updatedUsers = users.map((user) => {
            if (user._id === updatedUser._id) {
                return updatedUser;
            }
            return user;
        });
        setUsers(updatedUsers);
    };

    return (
        <div className={styles.container}>
            <SearchBar searchTerm={searchTerm} onSearch={(s) => setSearchTerm(s)} placeholder="Search users..." />
            <h3>{userCountText}</h3>
            {filteredUsers.map((user) => renderUser(user))}
            {editingUser && (
                <Modal
                    open={editingUser !== null}
                    closable={false}
                    title="Edit user"
                    footer={null}
                    maskClosable={false}
                >
                    <UpdateProfileForm user={editingUser} onSubmit={onEditUser} onCancel={() => setEditingUser(null)} />
                </Modal>
            )}
            {deletingUser && (
                <Modal
                    open={deletingUser !== null}
                    closable={false}
                    title="Delete user"
                    footer={null}
                    maskClosable={false}
                >
                    <DeleteUserForm
                        user={deletingUser}
                        onCancel={() => setDeletingUser(null)}
                        onSubmit={() => onDeleteUser(deletingUser?._id)}
                    />
                </Modal>
            )}
            {promotingUser && (
                <Modal
                    open={promotingUser !== null}
                    closable={false}
                    title="Promote user"
                    footer={null}
                    maskClosable={false}
                >
                    <UpdateUserPrivilegeForm
                        user={promotingUser}
                        onSubmit={onPromoteUser}
                        onCancel={() => setPromotingUser(null)}
                    />
                </Modal>
            )}
        </div>
    );
};
