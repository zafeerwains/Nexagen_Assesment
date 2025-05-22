const bcrypt = require('bcrypt');

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

            // Hash the password before saving
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const newUser = new this.User({
                username,
                password: hashedPassword
            });
            await newUser.save();

            const token = this.generateToken(newUser._id);
            res.cookie('token', token).status(201).json({ token });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    async login(req, res) {
        const { username, password } = req.body;

        try {
            const user = await this.User.findOne({ username });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Compare the provided password with stored hash
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = this.generateToken(user._id);
            // Replace both occurrences (in register and login methods)
            res.cookie('token', token).status(201).json({ token });

        } catch (error) {
            console.error(error);
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