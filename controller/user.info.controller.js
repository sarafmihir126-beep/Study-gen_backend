import User from "../model/user.model.js";

/**
 * @desc Get user information
 * @route GET /api/users/me
 * @access Private (Student/Teacher)
 */
export const getUserInfo = async (req, res) => {
  try {
    const loggedInUser = req.user; // set by protectRoute middleware

    if (!loggedInUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in again.",
      });
    }

    // 🧩 If teacher → return all users
    if (loggedInUser.role === "teacher") {
      const users = await User.find().select("-password"); // exclude passwords
      return res.status(200).json({
        success: true,
        role: "teacher",
        count: users.length,
        users,
      });
    }

    // 🧩 Otherwise (student/user) → return only their own info
    if (loggedInUser.role === "student" || loggedInUser.role === "user") {
      const currentUser = await User.findById(loggedInUser._id).select("-password");

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: true,
        role: loggedInUser.role,
        user: currentUser,
      });
    }

    // 🧩 If role is invalid or undefined
    return res.status(403).json({
      success: false,
      message: "Access denied. Invalid role.",
    });
  } catch (error) {
    console.error("Error fetching user info:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
