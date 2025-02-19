import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { LoggerService } from '../logger/logger.service';

@Module({
  controllers: [MenuController],
  providers: [MenuService,LoggerService],
})
export class MenuModule {}
