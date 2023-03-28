import express from 'express';
import { sequelize } from '..';
import { exec } from 'child_process';
import fsAsync from 'node:fs/promises';
import { extname } from 'node:path';

const router = express.Router();

function generateRandomNumber(countRandomFilms) {
	return Math.floor(Math.random() * countRandomFilms);
}

router.get('/', async (req, res) => {
	const responseFromDB = await sequelize.models.Films.findAll({
		where: {
			title: {
				[Op.iLike]: `%${req.query.title || ''}%`,
			},
		},
	});
	res.json(responseFromDB);
});
router.get('/random', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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

router.post('/add', async (req, res) => {
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

export default router;
