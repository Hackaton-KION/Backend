import * as dotenv from 'dotenv';
import express, { json } from 'express';
import { Sequelize, DataTypes, Op } from 'sequelize';
import { hash, verify } from 'argon2';
import Jwt from 'jsonwebtoken';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { exec } from 'child_process';
import fs from 'fs';
import fsAsync from 'node:fs/promises';
import utils from 'node:util';
import { extname } from 'node:path';

dotenv.config();
// Connect to database
const sequelize = new Sequelize('KION_Server', 'postgres', '1234', {
	host: 'localhost',
	dialect: 'postgres',
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
			manifestURL: {
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

function generateRandomNumber(countRandomFilms) {
	return Math.floor(Math.random() * countRandomFilms);
}

const app = express();

app.use(fileUpload());
app.use(json());
app.use(
	cors({
		origin: /localhost/,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: true,
		optionsSuccessStatus: 204,
		credentials: true,
	})
);
app.use('/static', express.static('assets'));

//api

//get
app.get('/', (req, res) => {
	res.sendFile('C:/Users/egorp/OneDrive/Документы/Backend/src/index.html');
});
app.get('/api/ping', (req, res) => {
	res.json('pong');
});
app.get('/api/presets/getPresets', async (req, res) => {
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
app.get('/api/films', async (req, res) => {
	const responseFromDB = await sequelize.models.Films.findAll({
		where: {
			title: {
				[Op.iLike]: `%${req.query.title || ''}%`,
			},
		},
	});
	res.json(responseFromDB);
});

app.get('/api/films/random', async (req, res) => {
	const films = await sequelize.models.Films.findAll({
		limit: 100,
	});

	const countRandomFilms = 5;

	if (countRandomFilms >= films.length) {
		res.json(films);
		return;
	}

	const randomFilms = [];

	for (let i = 0; i < countRandomFilms; ) {
		const index = generateRandomNumber(films.length);
		const film = films[index];

		if (randomFilms.includes(film)) {
			continue;
		}

		randomFilms.push(film);
		i++;
	}

	res.json(randomFilms);
});

app.get('/api/films/:id', async (req, res) => {
	const { id } = req.params;
	const film = await sequelize.models.Films.findOne({
		where: {
			id,
		},
	});

	if (!film) {
		res.status(404).json('Not found');
		return;
	}

	res.json(film);
});

//post

app.post('/api/films/add', async (req, res) => {
	const { preview, film } = req.files;

	const fileName = film.name.split('.')[0].split(' ').join('_');

	const extension = extname(film.name);

	const basePath = `segments/${fileName}/`;
	const url = `/static/${basePath}`;
	const path = `./assets/${basePath}`;

	await fsAsync.mkdir(path, {
		recursive: true,
	});

	const filmPath = path + fileName + extension;

	film.mv(filmPath);
	preview.mv(path + preview.name);

	exec(
		`start /b ./ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe -i ${filmPath} -y -level 3.0 -start_number 0 -hls_base_url segments -hls_segment_filename ${path}${fileName}%03d.ts -hls_time 5 -hls_list_size 0 -f dash ${path}${fileName}.mpd`,
		async (error) => {
			if (error) {
				return error;
			}
			await sequelize.models.Films.create({
				title: req.body.title || film.name,
				description: req.body.description,
				dateReleaseVideo: req.body.dateRelease || new Date(),
				urlPreview: url + preview.name,
				urlVideo: url + film.name,
				urlPreprocessedVideo: url + film.name,
				manifestURL: url + `${fileName}.mpd`,
			});

			res.json('200');
		}
	);
});
app.post('/api/users/registration', async (req, res) => {
	console.log(req.body);
	const returnedValue = await createTestWrite(req.body);
	console.log({ returned: returnedValue.replaceAll('"', "'") });
	// res.send({ returned: returnedValue.replaceAll('"', 	"'") });
	res.json(returnedValue.replaceAll('"', "'"));
});
app.post('/api/users/authorization/login', async (req, res) => {
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
			id: responseFromDB.dataValues.login,
			login: responseFromDB.dataValues.login,
		});
	} else {
		res.json('Неверный пароль');
	}
});
app.post('/api/presets/savePreset', async (req, res) => {
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

//put

app.put('/api/presets/changePreset', async (req, res) => {
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

//delete

app.delete('/api/presets/deletePreset', async (req, res) => {
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
