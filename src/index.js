import * as dotenv from 'dotenv';
dotenv.config();
import express, { json } from 'express';
import { Sequelize, DataTypes } from 'sequelize';
import { hash, verify } from 'argon2';
import Jwt from 'jsonwebtoken';

// Connect to database
const sequelize = new Sequelize('KION_Server', 'postgres', '1234', {
	host: 'localhost',
	dialect: 'postgres' /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */,
});

try {
	await sequelize.authenticate();
	console.log('Connection has been established successfully.');
	createTables();
} catch (error) {
	console.error('Unable to connect to the database:', error);
}

function createTableUsers() {
	const Users = sequelize.define(
		'Users',
		{
			// Model attributes are defined here
			login: {
				type: DataTypes.STRING,
				allowNull: false,
				// unique: { name: 'uniqueLogin', msg: 'Login must be unique' },
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			// Other model options go here
			timestamps: false,
		}
	);
}
function createTableFilms() {
	const Films = sequelize.define(
		'Films',
		{
			// Model attributes are defined here
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			dateReleaseVideo: {
				type: DataTypes.DATEONLY,
				allowNull: false,
			},
			urlPreview: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			urlVideo: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			urlPreprocessedVideo: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			// Other model options go here
			timestamps: false,
		}
	);
}
function createTablePresets() {
	const Presets = sequelize.define(
		'Presets',
		{
			// Model attributes are defined here
			idPreset: {
				type: DataTypes.INTEGER,
				allowNull: false,
				primaryKey: true,
				autoIncrement: true,
			},
			idUser: {
				type: DataTypes.INTEGER,
				allowNull: true,
				references: {
					model: sequelize.models.Users,
					key: 'id',
				},
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			brightness: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			contrast: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			saturation: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			sharpness: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			epilepticSafe: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
		},
		{
			// Other model options go here
			timestamps: false,
		}
	);
}

async function createTables() {
	createTableUsers();
	createTableFilms();
	createTablePresets();
	await sequelize.sync();
}

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

const app = express();
app.use(json());
app.get('/api/ping', function (req, res) {
	res.json('pong');
});
app.post('/api/testPost', async (req, res) => {
	console.log(req.body);
	const returnedValue = await createTestWrite(req.body);
	console.log({ returned: returnedValue.replaceAll('"', "'") });
	// res.send({ returned: returnedValue.replaceAll('"', 	"'") });
	res.json(returnedValue.replaceAll('"', "'"));
});
app.post('/api/Users/authorization', async (req, res) => {
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
		});

		res.json({
			accessToken: accessToken,
			id: responseFromDB.dataValues.login,
			login: responseFromDB.dataValues.login,
		});
	} else {
		res.json('Неверный пароль');
	}
});
app.get('/api/Presets/getPresets', async (req, res) => {
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
app.post('/api/Presets/savePreset', async (req, res) => {
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
app.put('/api/Presets/changePreset', async (req, res) => {
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
app.delete('/api/Presets/deletePreset', async (req, res) => {
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
app.listen(5000);
