import { Router } from "express";
import authService from "../services/authService.js";
import { AUTH_COOKIE_NAME } from "../constants.js";
import getError from "../utils/errorUtil.js";
import { isAuth, isGuest } from "../middlewares/authMiddleware.js";
const authController = Router();

authController.get('/register', isGuest, (req, res) => {
    res.render('auth/register', { title: 'Register Page' })
});

authController.post('/register', isGuest, async (req, res) => {
    const { username, email, password, rePassword } = req.body;

    if (password !== rePassword) {
        // to do errors
    }

    try {
        const token = await authService.register(username, email, password, rePassword);
        console.log(token)
        res.cookie(AUTH_COOKIE_NAME, token, { httpOnly: true });
        res.redirect('/')
    } catch (err) {
        const error = getError(err);
        res.render('auth/register', { title: 'Register Page', username, email, error })
    }
})

authController.get('/login', isGuest, (req, res) => {
    res.render('auth/login', { title: 'Login Page' })
})

authController.post('/login', isGuest, async (req, res) => {

    const { email, password } = req.body;
    try {
        const token = await authService.login(email, password);
        // add token to cookie
        res.cookie(AUTH_COOKIE_NAME, token, { httpOnly: true });
        // redirect to home
        res.redirect('/');

    } catch (err) {
        const error = getError(err);
        res.render('auth/login', { title: 'Login Page', email, error })
    }
})

authController.get('/logout', isAuth, (req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME);

    res.redirect('/')
})


export default authController;
