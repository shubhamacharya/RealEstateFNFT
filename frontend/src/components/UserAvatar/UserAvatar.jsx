/* eslint-disable react/prop-types */
import "./UserAvatar.css";

function UserAvatar({ username, size }) {
  const getInitials = (username) => {
    console.log(username);
    const initials = String(username)
      .split(" ")
      .map((word) => word[0]);
    return initials.join("").toUpperCase();
  };

  const getRandomColor = () => {
    const colors = ["#2196F3", "#4CAF50", "#FFC107", "#E91E63", "#795548"];
    const randomIndex = Math.floor(Math.random() * colors.length);
    return colors[randomIndex];
  };

  const avatar = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: size,
    height: size,
    borderRadius: "50%",
    backgroundColor: getRandomColor(),
    color: "#fff",
    fontSize: size * 0.4,
  };

  return <div style={avatar}>{getInitials(username)}</div>;
}

export default UserAvatar;
