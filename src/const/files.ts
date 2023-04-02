import * as path from 'node:path';
import * as multer from 'multer';

export const STATIC_DIR = 'static';
export const STATIC_DIR_PATH = path.resolve(process.cwd(), STATIC_DIR);

export const prepareName = (name: string) =>
	name.split('.')[0].split(' ').join('_');

export const storage = multer.diskStorage({
	destination(_, file, callback) {
		const [group] = file.mimetype.split('/');

		switch (group) {
			case 'video':
				callback(null, path.join(STATIC_DIR, 'videos'));
				break;
			case 'image':
				callback(null, path.join(STATIC_DIR, 'images'));
				break;
			default:
				callback(null, path.join(STATIC_DIR, 'others'));
		}
	},

	filename(_, file, callback) {
		callback(
			null,
			prepareName(file.originalname) + path.extname(file.originalname)
		);
	},
});

export const isMimeType = (
	file: globalThis.Express.Multer.File,
	type: string
) => {
	return file.mimetype.startsWith(type);
};
