import { Controller, Get, Post, Body, Patch, Param, Delete, Query,HttpStatus, NotFoundException, InternalServerErrorException  } from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { LoggerService } from '../logger/logger.service';

@Controller('menus')
export class MenuController {
  constructor(
    private readonly menuService: MenuService,
    private readonly logger: LoggerService
  ) {}

  @Post()
  create(@Body() createMenuDto: CreateMenuDto) {
    this.logger.log(`Creating menu: ${JSON.stringify(createMenuDto)}`, 'MenuController');
    return this.menuService.create(createMenuDto);
  }

  @Get()
  async findAll() {
    this.logger.log('Fetching all menus', 'MenuController');
    try {
      const menus = await this.menuService.getAllMenus();
      return {
        statusCode: HttpStatus.OK,
        message: 'Menus retrieved successfully',
        data: menus,
      };
    } catch (error) {
      this.logger.error('Error fetching all menus', error);
      throw new InternalServerErrorException('Failed to fetch menus');
    }
  }

  @Get('hierarchy')
  async getHierarchy() {
    this.logger.log('Fetching menu hierarchy', 'MenuController');
    try {
      const hierarchy = await this.menuService.getMenuHierarchy();
      return {
        statusCode: HttpStatus.OK,
        message: 'Menu hierarchy retrieved successfully',
        data: hierarchy,
      };
    } catch (error) {
      this.logger.error('Error fetching menu hierarchy', error);
      throw new InternalServerErrorException('Failed to fetch menu hierarchy');
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    this.logger.log(`Fetching menu with ID: ${id}`, 'MenuController');
    try {
      const menu = await this.menuService.findOne(id);
      if (!menu) {
        throw new NotFoundException(`Menu with ID ${id} not found`);
      }
      return {
        statusCode: HttpStatus.OK,
        message: `Menu with ID ${id} retrieved successfully`,
        data: menu,
      };
    } catch (error) {
      this.logger.error(`Error fetching menu with ID: ${id}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch menu');
    }
  }
  
 
 @Patch(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
    this.logger.log(`Updating menu ID: ${id} with data: ${JSON.stringify(updateMenuDto)}`, 'MenuController');
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('cascade') cascade: string) {
    this.logger.log(`Deleting menu with ID: ${id}, cascade: ${cascade}`, 'MenuController');
    
    if (cascade === 'true') {
      return this.menuService.removeWithChildren(id);
    } else {
      return this.menuService.remove(id);
    }
  }
}
