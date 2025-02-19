import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { GetMenuHierarchyDto } from './dto/get-menu.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class MenuService {
  constructor(private readonly prismaService: PrismaService,private readonly logger: LoggerService) {} 
  
  async create(createMenuDto: CreateMenuDto) {
    const { name, parentId, depth,order } = createMenuDto;
  
    let expectedOrder = 1; // Default jika tidak ada child sebelumnya
  
    // Jika ada parentId, pastikan parent ada di database
    if (parentId) {
      const parentMenu = await this.prismaService.menu.findUnique({
        where: { id: parentId },
      });
  
      if (!parentMenu) {
        throw new HttpException('Parent menu not found', HttpStatus.NOT_FOUND);
      }
  
      // Pastikan depth parent valid (harus depth - 1)
      if (parentMenu.depth !== depth - 1) {
        throw new HttpException(
          `Invalid depth: Parent menu must have depth ${depth - 1}, but found ${parentMenu.depth}`,
          HttpStatus.BAD_REQUEST,
        );
      }
  
      // Hitung jumlah child dari parent untuk menentukan expectedOrder
      const childCount = await this.prismaService.menu.count({
        where: { parentId },
      });
  
      expectedOrder = childCount + 1;
    } else {
      // Jika tidak ada parent, hitung jumlah root menu
      const rootMenuCount = await this.prismaService.menu.count({
        where: { parentId: null },
      });
  
      expectedOrder = rootMenuCount + 1;
    }
  
    // Validasi order
    if (order !== undefined && order != expectedOrder) {
      throw new HttpException(
        `Invalid order: Expected order ${expectedOrder}, but received ${order}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    
  
    // Tambah menu baru ke database
    const newMenu = await this.prismaService.menu.create({
      data: {
        name,
        parentId: parentId || null,
        depth,
        order:order||expectedOrder,
      },
    });
  
    return {
      message: 'Menu successfully created',
      data: newMenu,
    };
  }
  
  

  async getAllMenus(): Promise<any> {
    try {
      const menus = await this.prismaService.menu.findMany({
        orderBy: {
          id: 'asc',
        },
      });

      if (!menus || menus.length === 0) {
        throw new HttpException('No menus found', HttpStatus.NOT_FOUND);
      }

      return  menus ;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(id: string) {
    // Ambil menu berdasarkan ID
    const menu = await this.prismaService.menu.findUnique({
      where: { id },
    });
  
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
  
    // Cari root menu (menu paling atas dalam hierarki)
    let root = menu;
    while (root.parentId) {
      const parent = await this.prismaService.menu.findUnique({
        where: { id: root.parentId },
      });
  
      if (!parent) break; // Jika parent tidak ditemukan, hentikan loop
  
      root = parent;
    }
  
    return {
      id: menu.id,
      name: menu.name,
      parentId: menu.parentId,
      depth: menu.depth,
      order: menu.order,
      rootMenu: {
        id: root.id,
        name: root.name,
      },
    };
  }
  async getMenuHierarchy(): Promise<GetMenuHierarchyDto[]> {
    // Ambil semua menu dari database, urutkan dari depth 0 ke terbesar
    const menus = await this.prismaService.menu.findMany({
        orderBy: { depth: 'asc' }, // ✅ Urutkan dari kecil ke besar
    });

    if (menus.length === 0) return []; // Jika tidak ada data, kembalikan array kosong

    // Cari depth tertinggi
    const maxDepth = Math.max(...menus.map(menu => menu.depth));

    const menuMap = new Map<string, GetMenuHierarchyDto>();

    // 1️⃣ **Buat semua menu dalam bentuk map tanpa children dulu**
    menus.forEach(menu => {
        menuMap.set(menu.id, {
            ...menu,
            parentId: menu.parentId ?? null,
            children: []
        });
    });

    // 2️⃣ **Proses setiap depth dari 0 sampai maxDepth**
    for (let depth = 0; depth <= maxDepth; depth++) {
        menus.filter(menu => menu.depth === depth).forEach(menu => {
            if (menu.parentId) {
                const parent = menuMap.get(menu.parentId);
                if (parent) {
                    parent.children.push(menuMap.get(menu.id) as GetMenuHierarchyDto);
                }
            }
        });

        console.log(`Step ${depth + 2} - Hierarki setelah depth ${depth}:`, menuMap);
    }

    // 3️⃣ **Ambil hanya elemen depth 0 sebagai root**
    const rootMenus = menus.filter(menu => menu.depth === 0).map(menu => menuMap.get(menu.id) as GetMenuHierarchyDto);

    return rootMenus;
}

async update(id: string, updateMenuDto: UpdateMenuDto) {

  // Update menu di database
  const updatedMenu = await this.prismaService.menu.update({
    where: { id },
    data: updateMenuDto,
  });

  return {
    message: `Menu with ID ${id} successfully updated`,
    data: updatedMenu,
  };
}



async remove(id: string) {
  // Cek apakah menu ada
  const existingMenu = await this.prismaService.menu.findUnique({
    where: { id },
  });

  if (!existingMenu) {
    throw new NotFoundException(`Menu with ID ${id} not found`);
  }

  // Cek apakah menu memiliki children
  const children = await this.prismaService.menu.findMany({
    where: { parentId: id },
  });

  if (children.length > 0) {
    throw new HttpException(
      `Cannot delete menu ID ${id} because it has children. Delete the children first.`,
      HttpStatus.BAD_REQUEST,
    );
  }

  // Hapus menu jika tidak memiliki children
  await this.prismaService.menu.delete({
    where: { id },
  });

  return {
    message: `Menu with ID ${id} successfully deleted`,
  };
}
async removeWithChildren(id: string) {
  // Cek apakah menu ada
  const existingMenu = await this.prismaService.menu.findUnique({
    where: { id },
  });

  if (!existingMenu) {
    throw new NotFoundException(`Menu with ID ${id} not found`);
  }

  // Ambil semua children secara rekursif
  const getAllChildren = async (parentId: string): Promise<string[]> => {
    const children = await this.prismaService.menu.findMany({
      where: { parentId },
    });

    let allChildrenIds: string[] = children.map(child => child.id);

    for (const child of children) {
      const subChildren = await getAllChildren(child.id);
      allChildrenIds = [...allChildrenIds, ...subChildren];
    }

    return allChildrenIds;
  };

  // Dapatkan semua children dalam bentuk array ID
  const childrenIds = await getAllChildren(id);

  // Hapus semua children terlebih dahulu
  if (childrenIds.length > 0) {
    await this.prismaService.menu.deleteMany({
      where: { id: { in: childrenIds } },
    });
  }

  // Hapus parent setelah semua children dihapus
  await this.prismaService.menu.delete({
    where: { id },
  });

  return {
    message: `Menu with ID ${id} and its children successfully deleted`,
    deletedIds: [id, ...childrenIds], // Menampilkan daftar ID yang dihapus
  };
}

}
