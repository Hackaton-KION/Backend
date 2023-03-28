import express from 'express';
import { sequelize } from '..';
import { hash, verify } from 'argon2'; // для того, чтобы сверять пароли по хешу
import Jwt from 'jsonwebtoken';// для авторизации пользователя (хранит логин и время жизни)


const router = express.Router();

async function createTestWrite(data) {
	try {
		await sequelize.models.Users.create({
			login: data.login,
			password: await hash(data.password),
		});

		return 'ok';
	} catch (error) {
		console.log(error.parent.detail);
		return error.parent.detail;
	}
}

router.post('/registration', async (req, res) => {
	console.log(req.body);
	const returnedValue = await createTestWrite(req.body);
	console.log({ returned: returnedValue.replaceAll('"', "'") });
	// res.send({ returned: returnedValue.replaceAll('"', 	"'") });
	res.json(returnedValue.replaceAll('"', "'"));
});

router.post('/authorization/login', async (req, res) => {
	const responseFromDB = await sequelize.models.Users.findOne({
		where: { login: req.body.login },
	});
	console.log(typeof responseFromDB.dataValues.password);
	console.log(await hash(req.body.password));

	// console.log(req.headers.cookie.split(';'));

	if (await verify(responseFromDB.dataValues.password, req.body.password)) {
		// Ваши данные для создания токена (payload)
		const payload = {
			userID: responseFromDB.dataValues.id,
		};

		// Ваш секретный ключ (необходим для верификации токена)
		const secret = process.env.SECRET;

		// Создание токена с использованием алгоритма HS256 и сроком действия 1 час
		const accessToken = Jwt.sign(payload, secret, {
			algorithm: 'HS256',
			expiresIn: '1h',
		});
		const refreshToken = Jwt.sign(payload, secret, {
			algorithm: 'HS256',
			expiresIn: '30d',
		});

		res.cookie('refreshToken', refreshToken, {
			expires: new Date(Date.now() + 30 * 24 * 3600000),
			httpOnly: true,
			secure: true,
			sameSite: 'none',
		});

		res.json({
			accessToken: accessToken,
			id: responseFromDB.dataValues.id,
			login: responseFromDB.dataValues.login,
		});
	} else {
		res.json('Неверный пароль');
	}
});

export default router;