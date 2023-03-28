import express from 'express';
import { sequelize } from '..';

const router = express.Router();

router.get('/', async (req, res) => {
	try {
		Jwt.verify(
			req.headers.authorization,
			process.env.SECRET,
			async (error, decoded) => {
				if (error) {
					throw 'Bad access token';
				} else {
					const responseFromDB = await sequelize.models.Presets.findAll({
						where: { userId: decoded.userID },
					});

					res.json({ profiles: responseFromDB });
				}
			}
		);
	} catch (error) {
		res.json(error);
	}
});

router.post('/create', async (req, res) => {
	Jwt.verify(
		req.headers.authorization,
		process.env.SECRET,
		async (error, decoded) => {
			if (error) {
				res.json(error);
			} else {
				try {
					const preset = await sequelize.models.Presets.create({
						userId: decoded.userID,
						name: req.body.name,
						brightness: req.body.brightness,
						contrast: req.body.contrast,
						saturation: req.body.saturation,
						sharpness: req.body.sharpness,
						offEpilepticScene: req.body.offEpilepticScene,
						enableCustomGamma: req.body.enableCustomGamma,
						redChanel: req.body.redChanel,
						greenChanel: req.body.greenChanel,
						blueChanel: req.body.blueChanel,
					});
					res.json(preset);
				} catch (error) {
					console.log(error);
					console.log(error.parent.detail);
					res.json(error.parent.detail);
				}
			}
		}
	);
});

router.put('/:id/update', async (req, res) => {
	Jwt.verify(
		req.headers.authorization,
		process.env.SECRET,
		async (error, decoded) => {
			if (error) {
				res.json(error);
			} else {
				await sequelize.models.Presets.update(
					{
						userId: decoded.userID,
						name: req.body.name,
						brightness: req.body.brightness,
						contrast: req.body.contrast,
						saturation: req.body.saturation,
						sharpness: req.body.sharpness,
						offEpilepticScene: req.body.offEpilepticScene,
						enableCustomGamma: req.body.enableCustomGamma,
						redChanel: req.body.redChanel,
						greenChanel: req.body.greenChanel,
						blueChanel: req.body.blueChanel,
					},
					{ where: { id: Number(req.params.id), userId: decoded.userID } }
				);
				res.json('ok');
			}
		}
	);
});

router.delete('/:id/remove', async (req, res) => {
	Jwt.verify(
		req.headers.authorization,
		process.env.SECRET,
		async (error, decoded) => {
			if (error) {
				res.json(error);
			} else {
				await sequelize.models.Presets.destroy({
					where: { id: Number(req.params.id), idUser: decoded.userID },
				});
				res.json('ok');
			}
		}
	);
});

export default router;
