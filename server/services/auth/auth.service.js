const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../../models/User.model");

class AuthService {
    async register(userData) {
        const { name, email, password } = userData;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            throw new Error("User already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        return {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }

    async login(loginData) {
        const { email, password } = loginData;

        const user = await User.findOne({ email });

        if (!user) {
            throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            throw new Error("Invalid email or password");
        }

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }

    async profile() {}

    async logout() {

    return {
        loggedOut: true
    };

}
}

module.exports = new AuthService();