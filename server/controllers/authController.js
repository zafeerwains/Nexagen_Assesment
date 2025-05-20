class AuthController {
    constructor(User) {
        this.User = User;
    }

    async register(req, res) {
        const { username, password } = req.body;

        try {
            const existingUser = await this.User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const newUser = new this.User({ username, password });
            await newUser.save();

            const token = this.generateToken(newUser._id);
            res.status(201).json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;

        try {
            const user = await this.User.findOne({ username });
            if (!user || !(await user.comparePassword(password))) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = this.generateToken(user._id);
            res.status(200).json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    generateToken(userId) {
        const jwt = require('jsonwebtoken');
        const secret = process.env.JWT_SECRET || 'your_jwt_secret';
        return jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
    }
}

module.exports = AuthController;