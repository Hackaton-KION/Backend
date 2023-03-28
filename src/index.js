import * as dotenv from 'dotenv'; // хранение секретной фразы и конфиг
import express, { json } from 'express';
import { Sequelize, DataTypes} from 'sequelize'; //обеспечение работы с БД (подкл., запросы и т.д.)

import cors from 'cors'; // политика безопасности накидывает хедеры для обеспечения нормальной работы сервера
import fileUpload from 'express-fileupload'; // загрузка файлов на сервер

import films from './api/films';
import presets from './api/presets';
import users from './api/users';

dotenv.config();
// Connect to database
export const sequelize = new Sequelize('KION_Server', 'postgres', '1234', {
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

// async function createTestWrite(data) {
// 	try {
// 		await sequelize.models.Users.create({
// 			login: data.login,
// 			password: await hash(data.password),
// 		});

// 		return 'ok';
// 	} catch (error) {
// 		console.log(error.parent.detail);
// 		return error.parent.detail;
// 	}
// }



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
app.use('/api/films', films);
app.use('/api/presets', presets);
app.use('/api/users', users);


//api

//get
app.get('/', (req, res) => {
	res.sendFile('C:/Users/egorp/OneDrive/Документы/Backend/src/index.html');
});
app.get('/api/ping', (req, res) => {
	res.json('pong');
});


app.listen(5000);
