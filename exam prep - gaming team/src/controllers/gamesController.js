import { Router } from "express";
import gameService from "../services/gameService.js";
import { isAuth, isOwner } from "../middlewares/authMiddleware.js";
import getError from '../utils/errorUtil.js'

const gamesController = Router();


function getPlatformType({ platform }) {
    const platformTypes = [
        "PC",
        "Nintendo",
        "PS4",
        "PS5",
        "XBOX",
    ]

    const viewData = platformTypes.map(type => ({
        value: type,
        label: type,
        selected: platform === type ? 'selected' : ''
    }));
    return viewData
}


gamesController.get('/search', isAuth, async (req, res) => {

    const query = req.query;
    const games = await gameService.getAll(query).lean();
    const platformTypes = getPlatformType(query)
    res.render('games/search', { games, query, title: 'Search Page', platform: platformTypes })
})

gamesController.get('/create', isAuth, (req, res) => {
    const platformData = getPlatformType({});
    res.render('games/create', { title: 'Create Page', platform: platformData })
})

gamesController.post('/create', isAuth, async (req, res) => {
    const gameData = req.body;
    const userId = req.user._id
    try {
        await gameService.create(gameData, userId);
        res.redirect('/games')
    } catch (err) {
        const error = getError(err);
        const platformData = getPlatformType(gameData)
        res.render('games/create', { title: 'Create Page', platform: platformData, game: gameData, error, })
    }
})

gamesController.get('/:gameId/details', isAuth, async (req, res) => {
    const gameId = req.params.gameId;

    const game = await gameService.getOne(gameId).lean();
    const isOwner = game.owner == req.user?._id;
    const isVoted = game.boughtBy?.some(gameId => gameId == req.user?._id);

    const searchedGame = await gameService.getOne(gameId).lean();

    res.render('games/details', { searchedGame, title: 'Details Page', isOwner, isVoted })
})

gamesController.get('/:gameId/edit', async (req, res) => {
    const gameId = req.params.gameId;

    const searchedGame = await gameService.getOne(gameId).lean();

    res.render('games/edit', { searchedGame, title: 'Details Page' })
})

gamesController.post('/:gameId/edit', isAuth, async (req, res) => {
    const gameId = req.params.gameId;
    const gameData = req.body;

    if (!isOwner(req.user._id, req.params.gameId)) {
        return res.redirect('/404')
    }
    try {
        await gameService.update(gameId, gameData)
        res.redirect(`/games/${gameId}/details`)
    } catch (err) {
        // todo err
    }
})

gamesController.get('/', async (req, res) => {
    const games = await gameService.getAll().lean();
    res.render('games', { games, title: 'Catalog Page' })

})

gamesController.get('/:gameId/delete', isAuth, async (req, res) => {

    if (!isOwner(req.user._id, req.params.gameId)) {
        return res.redirect('/404')
    }
    await gameService.remove(req.params.gameId)
    res.redirect('/games')
})

gamesController.get('/:gameId/vote', isAuth, async (req, res) => {

    const gameId = req.params.gameId
    const userId = req.user._id

    await gameService.vote(gameId, userId)

    res.redirect(`/games/${gameId}/details`)
})

export default gamesController;