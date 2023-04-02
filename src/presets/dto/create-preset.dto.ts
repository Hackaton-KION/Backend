import { OmitType } from '@nestjs/swagger';
import { Preset } from './preset.dto';

export class CreatePresetDto extends OmitType(Preset, [
	'id',
	'isStandard',
	'userId'
]) {}
