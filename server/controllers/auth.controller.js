const authService = require("../services/auth/auth.service");

class AuthController {

    async register(req, res) {

        try {

            const user = await authService.register(req.body);

            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: user
            });

        } catch (error) {

            return res.status(400).json({
                success: false,
                message: error.message
            });

        }

    }

    async login(req, res) {

    try {

        const result = await authService.login(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: error.message
        });

    }

}

    async profile(req, res) {

    return res.status(200).json({
        success: true,
        data: req.user
    });

}

    async logout(req, res) {

    try {

        const result = await authService.logout();

        return res.status(200).json({
            success: true,
            message: "Logout successful",
            data: result
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

}

}

module.exports = new AuthController();