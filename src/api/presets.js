import express from 'express';
import { sequelize } from '..';

const router = express.Router();

router.get('/getPresets', async (req, res) => {
	try {
		Jwt.verify(
			req.headers.authorization,
			process.env.SECRET,
			async (error, decoded) => {
				if (error) {
					throw 'Bad access token';
				} else {
					const responseFromDB = await sequelize.models.Presets.findAll({
						where: { idUser: decoded.userID },
					});

					res.json({ profiles: responseFromDB });
				}
			}
		);
	} catch (error) {
		res.json(error);
	}
});

router.post('/savePreset', async (req, res) => {
	Jwt.verify(
		req.headers.authorization,
		process.env.SECRET,
		async (error, decoded) => {
			if (error) {
				res.json(error);
			} else {
				try {
					await sequelize.models.Presets.create({
						idUser: decoded.userID,
						name: req.body.name,
						brightness: req.body.brightness,
						contrast: req.body.contrast,
						saturation: req.body.saturation,
						sharpness: req.body.sharpness,
						epilepticSafe: req.body.epilepticSafe,
					});
					res.json('ok');
				} catch (error) {
					console.log(error);
					console.log(error.parent.detail);
					res.json(error.parent.detail);
				}
			}
		}
	);
});

router.put('/changePreset', async (req, res) => {
	Jwt.verify(
		req.headers.authorization,
		process.env.SECRET,
		async (error, decoded) => {
			if (error) {
				res.json(error);
			} else {
				const responseFromDB = await sequelize.models.Presets.findAll({
					where: { idUser: decoded.userID },
				});
				await sequelize.models.Presets.update(
					{
						name: req.body.name || responseFromDB.name,
						brightness: req.body.brightness || responseFromDB.brightness,
						contrast: req.body.contrast || responseFromDB.contrast,
						saturation: req.body.saturation || responseFromDB.saturation,
						epilepticSafe:
							req.body.epilepticSafe || responseFromDB.epilepticSafe,
					},
					{ where: { idPreset: req.body.idPreset } }
				);
				res.json('ok');
			}
		}
	);
});

router.delete('/deletePreset', async (req, res) => {
	Jwt.verify(
		req.headers.authorization,
		process.env.SECRET,
		async (error, decoded) => {
			if (error) {
				res.json(error);
			} else {
				await sequelize.models.Presets.destroy({
					where: { idPreset: req.body.idPreset, idUser: decoded.userID },
				});
				res.json('ok');
			}
		}
	);
});

export default router;