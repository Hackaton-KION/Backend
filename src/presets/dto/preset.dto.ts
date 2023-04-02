import { Preset as PresetModel } from '@prisma/client';

export class Preset implements PresetModel {
	declare id: number;

	declare userId: number;

	declare name: string;

	declare brightness: number;

	declare contrast: number;

	declare saturation: number;

	declare sharpness: number;

	declare offEpilepticScene: boolean;

	declare enableCustomGamma: boolean;

	declare red: number;

	declare green: number;

	declare blue: number;

	declare isStandard: boolean;
}
