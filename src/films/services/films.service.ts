import * as fsAsync from 'node:fs/promises';
import { exec } from 'node:child_process';
import * as path from 'node:path';
import { Injectable } from '@nestjs/common';
import { prepareName, STATIC_DIR } from '@/const';
import { FilmRepository } from '../repositories';
import { CreateParams, GetOneParams } from './types';

@Injectable()
export class FilmsService {
	constructor(private readonly filmRepository: FilmRepository) {}

	getAll() {
		return this.filmRepository.getAll();
	}

	getRandom() {
		return this.filmRepository.getAll();
	}

	getOne(params: GetOneParams) {
		return this.filmRepository.getOne(params);
	}

	async create(dto: CreateParams) {
		const { video, preview, ...rest } = dto;

		const videoName = prepareName(video.filename);
		const manifestDirectoryPath = path.join(STATIC_DIR, 'manifests', videoName);
		await fsAsync.mkdir(manifestDirectoryPath, {
			recursive: true,
		});
		const manifestPath = path.join(manifestDirectoryPath, 'manifest.mpd');

		try {
			await fsAsync.access(manifestPath);
		} catch (error) {
			await new Promise((resolve, reject) => {
				exec(
					`${process.env.FFMPEG} -i ${path.join(
						process.cwd(),
						video.path
					)} -y -level 3.0 -start_number 0 -hls_base_url segments -hls_segment_filename ${videoName}%03d.ts -hls_time 2 -hls_list_size 0 -fpsmax 60 -f dash ${manifestPath}`,
					(err) => {
						if (err) {
							return reject(err);
						}

						resolve(undefined);
					}
				);
			});
		}

		return this.filmRepository.create({
			...rest,
			releaseDate: new Date(),
			video: path.join('/', video.path),
			preview: path.join('/', preview.path),
			manifest: path.join('/', manifestPath),
		});
	}
}
