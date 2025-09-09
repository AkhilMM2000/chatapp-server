export const MESSAGES = {
  USER_NOT_FOUND: "User not found",
  USER_LOGOUT:'user logout successfully',
  USER_EXIST_ALREADY:"user already exist",
  MESSAGE_SENT: "Message sent successfully",
  MESSAGE_FETCHED: "Messages fetched successfully",
  INVALID_CREDENTIALS: "Invalid credentials",
  SERVER_ERROR: "Internal server error",
  BAD_REQUEST: "Bad request",
  INVALID_TOKEN:"Invalid or expired access token",
  NO_TOKEN:"no token provided in the request",
  MAP_ERROR:"Failed to map created user",
  INVALID_REFRESHTOKEN:"invalid refresh token",
  ROOM_ID_CONFLICT:"Room ID already exists, please try again",
  ROOM_NOT_FOUND:"room not found",
  FAILED_TOSAVE_MESSAGES:"failed to save messages",
  GOOGLE_ERROR :"Google account missing email/name"
} as const;
