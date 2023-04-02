import {
	Controller,
	Get,
	Post,
	Body,
	Param,
	Delete,
	Put,
	ParseIntPipe
} from '@nestjs/common';
import { CurrentUser } from '@/auth';
import { SecurityUserDto } from '@/users';
import { PresetsService } from '../services/presets.service';
import { CreatePresetDto, UpdatePresetDto } from '../dto';

@Controller('presets')
export class PresetsController {
	constructor(private readonly presetsService: PresetsService) {}

	@Get()
	getAllByUser(@CurrentUser() user: SecurityUserDto) {
		return this.presetsService.getAllByUser({ userId: user.id, });
	}

	@Get(':id')
	getOne(@Param('id', ParseIntPipe) id: number) {
		return this.presetsService.getOne({ id, });
	}

	@Post('/create')
	create(@Body() dto: CreatePresetDto, @CurrentUser() user: SecurityUserDto) {
		return this.presetsService.create({ ...dto, userId: user.id, });
	}

	@Put(':id/update')
	update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePresetDto) {
		return this.presetsService.update({ ...dto, id, });
	}

	@Delete(':id/remove')
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.presetsService.remove({ id, });
	}
}
