import jwt from "jsonwebtoken";

/**
 * Generate a json web token for a user
 * @param id The id of the user
 */
export const accessToken = (id: string) => {
  if (process.env.JWT_SECRET !== undefined) {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });
  }
};

export const refreshToken = (id: string) => {
  if (process.env.JWT_REFRESH_SECRET !== undefined) {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "6d",
    });
    }
    return null;
}

